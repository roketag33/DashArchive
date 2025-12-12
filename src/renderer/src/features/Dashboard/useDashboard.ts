import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FileEntry, Plan, ExecutionResult, Folder } from '../../../../shared/types'
import { toast } from 'sonner'

interface UseDashboardReturn {
  // Folder Management
  folders: Folder[]
  isLoadingFolders: boolean
  handleAddFolder: (folder: { name: string; path: string; autoWatch: boolean }) => Promise<void>
  handleUpdateFolder: (id: string, updates: Partial<Folder>) => Promise<void>
  handleDeleteFolder: (id: string) => Promise<void>
  handleToggleWatch: (folder: Folder) => Promise<void>
  handleSaveFolderRules: (folderId: string, ruleIds: string[]) => Promise<void>

  // Organization Flow
  selectedFolder: Folder | null
  files: FileEntry[]
  scanning: boolean
  plan: Plan | null
  executionResult: ExecutionResult | null
  isExecuting: boolean
  showDuplicates: boolean
  setShowDuplicates: (show: boolean) => void
  setPlan: (plan: Plan | null) => void
  setExecutionResult: (res: ExecutionResult | null) => void
  
  // Actions
  handleSortFolder: (folder: Folder) => Promise<void>
  handleGeneratePlan: () => Promise<void>
  handleExecutePlan: () => Promise<void>
  handleDeleteDuplicates: (toDelete: FileEntry[]) => Promise<void>
  handleBackToDashboard: () => void
}

export function useDashboard(): UseDashboardReturn {
  const { t } = useTranslation()
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoadingFolders, setIsLoadingFolders] = useState(true)

  // Organization State
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null)
  const [files, setFiles] = useState<FileEntry[]>([])
  const [scanning, setScanning] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [showDuplicates, setShowDuplicates] = useState(false)

  // Organization Logic
  const handleSortFolder = useCallback(async (folder: Folder): Promise<void> => {
    setSelectedFolder(folder)
    setScanning(true)
    setFiles([])
    setPlan(null)
    setExecutionResult(null)
    try {
      // Use ID for precise lookup and rule application context (future proofing)
      const result = await window.api.scanFolder({ id: folder.id, path: folder.path })
      setFiles(result)
    } catch (e) {
      console.error(e)
      toast.error(t('app.scanError'))
    } finally {
      setScanning(false)
    }
  }, [t]) // useCallback for handleSortFolder to prevent infinite loop

  // Load Folders
  const loadFolders = useCallback(async () => {
      try {
          const loaded = await window.api.getFolders();
          setFolders(loaded);
      } catch (e) {
          console.error("Failed to load folders", e);
          toast.error("Failed to load folders");
      } finally {
          setIsLoadingFolders(false);
      }
  }, []);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  // Watcher Effect (Global update or specific?)
  // The watcher sends events with folderId. 
  // If we are VIEWING that folder, we should maybe refresh?
  useEffect(() => {
    const handleFileAdded = (payload: string | { filePath: string, folderId: string }): void => {
      // payload might be string (legacy) or object
      const path = typeof payload === 'string' ? payload : payload.filePath;
      const folderId = typeof payload === 'string' ? undefined : payload.folderId;
      
      toast.info(t('app.fileDetected'), { description: path })

      // If we are currently sorting this folder, refresh
      if (selectedFolder && (folderId === selectedFolder.id || (!folderId && path.startsWith(selectedFolder.path)))) {
          handleSortFolder(selectedFolder);
      }
    }

    window.api.onFileAdded(handleFileAdded)
    return () => {
      window.api.removeFileAddedListener()
    }
  }, [selectedFolder, t, handleSortFolder]) // Added handleSortFolder dep

  // Folder Actions
  const handleAddFolder = async (folder: { name: string; path: string; autoWatch: boolean }): Promise<void> => {
      try {
          await window.api.addFolder(folder);
          await loadFolders();
          toast.success(t('app.folderAdded'));
      } catch (e) {
          console.error(e);
          toast.error("Failed to add folder");
      }
  }

  const handleUpdateFolder = async (id: string, updates: Partial<Folder>): Promise<void> => {
      try {
          await window.api.updateFolder(id, updates);
          await loadFolders();
      } catch (e) {
          console.error(e);
          toast.error("Failed to update folder");
      }
  }

  const handleDeleteFolder = async (id: string): Promise<void> => {
      try {
          await window.api.deleteFolder(id);
          await loadFolders();
          toast.success("Folder removed");
      } catch (e) {
          console.error(e);
          toast.error("Failed to remove folder");
      }
  }

  const handleToggleWatch = async (folder: Folder): Promise<void> => {
      await handleUpdateFolder(folder.id, { autoWatch: !folder.autoWatch });
      toast.success(folder.autoWatch ? t('app.watchDisabled') : t('app.watchEnabled'));
  }

  const handleSaveFolderRules = async (folderId: string, ruleIds: string[]): Promise<void> => {
      try {
          await window.api.setFolderRules(folderId, ruleIds);
          toast.success("Rules updated");
      } catch (e) {
          console.error(e);
          toast.error("Failed to save rules");
      }
  }

  // Organization Logic


  const handleBackToDashboard = (): void => {
      setSelectedFolder(null);
      setFiles([]);
      setPlan(null);
      setExecutionResult(null);
  }

  const handleGeneratePlan = async (): Promise<void> => {
    try {
      const generatedPlan = await window.api.generatePlan(files)
      setPlan(generatedPlan)
    } catch (e) {
      console.error(e)
      toast.error(t('app.planError'))
    }
  }

  const handleExecutePlan = async (): Promise<void> => {
    if (!plan) return
    setIsExecuting(true)
    try {
      const result = await window.api.executePlan(plan)
      setExecutionResult(result)
      setPlan(null)
      toast.success(t('app.executionSuccess'))
      // Refresh files after execution
      if (selectedFolder) {
        handleSortFolder(selectedFolder);
      }
    } catch (e) {
      console.error(e)
      toast.error(t('app.executionError'))
    } finally {
      setIsExecuting(false)
    }
  }

  const handleDeleteDuplicates = async (toDelete: FileEntry[]): Promise<void> => {
    try {
      await window.api.deleteFiles(toDelete.map((f) => f.path))
      toast.success(t('app.duplicatesDeleted'))
      if (selectedFolder) {
        handleSortFolder(selectedFolder);
      }
    } catch (e) {
      console.error(e)
      toast.error(t('app.deleteError'))
    }
  }

  return {
    folders,
    isLoadingFolders,
    handleAddFolder,
    handleUpdateFolder,
    handleDeleteFolder,
    handleToggleWatch,
    handleSaveFolderRules,
    
    selectedFolder,
    files,
    scanning,
    plan,
    executionResult,
    isExecuting,
    showDuplicates,
    setShowDuplicates,
    setPlan,
    setExecutionResult,
    
    handleSortFolder,
    handleGeneratePlan,
    handleExecutePlan,
    handleDeleteDuplicates,
    handleBackToDashboard
  }
}

