import React, { useEffect, useState } from 'react'
import { FileEntry, DuplicateGroup } from '../../../shared/types'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import clsx from 'clsx'

interface DuplicateModalProps {
    files: FileEntry[]
    onClose: () => void
    onDelete: (files: FileEntry[]) => Promise<void>
}

export const DuplicateModal: React.FC<DuplicateModalProps> = ({ files, onClose, onDelete }) => {
    const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set())

    // Load duplicates on mount
    useEffect(() => {
        const load = async () => {
            try {
                const result = await window.api.findDuplicates(files)
                setDuplicates(result)
                // Auto-select duplicates (keep oldest by default)
                const autoSelected = new Set<string>()
                result.forEach(group => {
                    // Sort by createdAt ascending (oldest first)
                    const sorted = [...group.files].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    // Select all except the first (oldest)
                    sorted.slice(1).forEach(f => autoSelected.add(f.path))
                })
                setSelectedPaths(autoSelected)
            } catch (error) {
                console.error("Failed to find duplicates", error)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [files])

    const toggleSelect = (path: string) => {
        const next = new Set(selectedPaths)
        if (next.has(path)) next.delete(path)
        else next.add(path)
        setSelectedPaths(next)
    }

    const handleDelete = async () => {
        const toDelete: FileEntry[] = []
        duplicates.forEach(g => {
            g.files.forEach(f => {
                if (selectedPaths.has(f.path)) toDelete.push(f)
            })
        })

        if (confirm(`Delete ${toDelete.length} duplicate files?`)) {
            await onDelete(toDelete)
            onClose()
        }
    }

    const totalWaste = duplicates.reduce((acc, group) => acc + (group.size * (group.files.length - 1)), 0)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
            <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col bg-background shadow-xl">
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            Duplicate Detector
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Potential space to reclaim: {(totalWaste / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-6">
                    {loading ? (
                        <div className="text-center py-10">Scanning for clones...</div>
                    ) : duplicates.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">No duplicates found! 🎉</div>
                    ) : (
                        duplicates.map((group) => (
                            <div key={group.hash} className="border rounded-lg p-3 bg-card/50">
                                <div className="flex justify-between text-sm mb-2 font-medium">
                                    <span>Hash: {group.hash.substring(0, 8)}...</span>
                                    <span>{(group.size / 1024).toFixed(2)} KB</span>
                                </div>
                                <div className="space-y-1">
                                    {group.files.map(file => (
                                        <div key={file.path}
                                            className={clsx(
                                                "flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-accent/50 transition-colors",
                                                selectedPaths.has(file.path) ? "bg-red-500/10 border border-red-500/20" : ""
                                            )}
                                            onClick={() => toggleSelect(file.path)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedPaths.has(file.path)}
                                                readOnly
                                                className="h-4 w-4"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="truncate text-sm font-medium">{file.name}</div>
                                                <div className="truncate text-xs text-muted-foreground">{file.path}</div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(file.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t bg-muted/20 flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={selectedPaths.size === 0}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Selected ({selectedPaths.size})
                    </Button>
                </div>
            </Card>
        </div>
    )
}
