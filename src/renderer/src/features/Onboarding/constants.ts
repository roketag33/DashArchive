import { FileText, Code, Image as ImageIcon, Book, Palette, Film } from 'lucide-react'

export type LifeBlockId = 'admin' | 'dev' | 'photos' | 'school' | 'creative' | 'media'

export interface LifeBlock {
  id: LifeBlockId
  label: string
  description: string
  icon: React.ElementType
  color: string
  extensions: string[]
}

export interface GameCard {
  id: string
  filename: string
  blockId: LifeBlockId
  suggestedPath: string
  alternatives: string[] // Options if user says 'No'
  isTrap?: boolean
}

export const LIFE_BLOCKS: LifeBlock[] = [
  {
    id: 'admin',
    label: 'Administratif',
    description: 'Factures, Impôts, Banques, Contrats...',
    icon: FileText,
    color: 'bg-blue-500',
    extensions: ['.pdf', '.doc', '.docx', '.csv', '.xls', '.xlsx']
  },
  {
    id: 'dev',
    label: 'Développeur',
    description: 'Scripts, Repos, JSON, Configs...',
    icon: Code,
    color: 'bg-green-500',
    extensions: ['.ts', '.js', '.json', '.html', '.css', '.py', '.go', '.java', '.c']
  },
  {
    id: 'creative',
    label: 'Créatif',
    description: 'PSD, Assets, Fonts, Maquettes...',
    icon: Palette,
    color: 'bg-purple-500',
    extensions: ['.psd', '.ai', '.fig', '.sketch', '.svg', '.tiff', '.otf', '.ttf']
  },
  {
    id: 'photos',
    label: 'Souvenirs',
    description: 'Photos perso, Vidéos de vacances...',
    icon: ImageIcon,
    color: 'bg-pink-500',
    extensions: ['.jpg', '.jpeg', '.png', '.heic', '.raw', '.mov', '.mp4']
  },
  {
    id: 'school',
    label: 'Étudiant',
    description: 'Cours, Thèse, PDF académiques...',
    icon: Book,
    color: 'bg-yellow-500',
    extensions: ['.pdf', '.pptx', '.doc', '.docx', '.tex', '.epub']
  },
  {
    id: 'media',
    label: 'Média',
    description: 'Films, Séries, Musique...',
    icon: Film,
    color: 'bg-red-500',
    extensions: ['.mp4', '.mkv', '.avi', '.mp3', '.flac', '.wav']
  }
]

export const GAME_CARDS: GameCard[] = [
  // Admin
  {
    id: 'c1',
    filename: 'Facture_EDF_Janvier.pdf',
    blockId: 'admin',
    suggestedPath: 'Documents/Administratif/Factures',
    alternatives: ['Documents/A_Trier', 'Desktop', 'Documents/Maison']
  },
  {
    id: 'c2',
    filename: 'Impots_2025.pdf',
    blockId: 'admin',
    suggestedPath: 'Documents/Administratif/Impôts',
    alternatives: ['Documents/Finance', 'Documents/A_Payer', 'Documents/Divers']
  },

  // Dev
  {
    id: 'c3',
    filename: 'script_backup.ts',
    blockId: 'dev',
    suggestedPath: 'Developer/Snippets',
    alternatives: ['Developer/Projets', 'Downloads', 'Code/Vrac']
  },
  {
    id: 'c4',
    filename: 'config.json',
    blockId: 'dev',
    suggestedPath: 'Developer/Configs',
    alternatives: ['Desktop', 'Developer/Dotfiles', 'Documents']
  },

  // Creative
  {
    id: 'c5',
    filename: 'Logo_Final_v3.psd',
    blockId: 'creative',
    suggestedPath: 'Design/Projets',
    alternatives: ['Design/Archives', 'Design/Clients', 'Desktop']
  },
  {
    id: 'c6',
    filename: 'Mockup_iPhone.fig',
    blockId: 'creative',
    suggestedPath: 'Design/Assets',
    alternatives: ['Design/UI', 'Downloads', 'Design/Resources']
  },

  // Photos
  {
    id: 'c7',
    filename: 'IMG_20241225.jpg',
    blockId: 'photos',
    suggestedPath: 'Pictures/2024/12',
    alternatives: ['Pictures/A_Trier', 'Desktop', 'Pictures/Famille']
  },
  {
    id: 'c8',
    filename: 'Vacances_Plage.mov',
    blockId: 'photos',
    suggestedPath: 'Movies/Vacances',
    alternatives: ['Movies/Phone_Backup', 'Documents/Video', 'Desktop']
  },

  // School
  {
    id: 'c9',
    filename: 'Memoire_Fin_Etudes.docx',
    blockId: 'school',
    suggestedPath: 'Documents/Etudes/Memoire',
    alternatives: ['Documents/Ecole', 'Desktop', 'Documents/A_Imprimer']
  },
  {
    id: 'c10',
    filename: 'Cours_Biologie_Chap1.pdf',
    blockId: 'school',
    suggestedPath: 'Documents/Etudes/Cours',
    alternatives: ['Documents/Revision', 'Downloads', 'Documents/Science']
  },

  // Media
  {
    id: 'c11',
    filename: 'Inception.mkv',
    blockId: 'media',
    suggestedPath: 'Movies/Sci-Fi',
    alternatives: ['Movies/Films', 'Downloads', 'Desktop']
  },
  {
    id: 'c12',
    filename: 'Awesome_Mix_Vol1.mp3',
    blockId: 'media',
    suggestedPath: 'Music/Playlists',
    alternatives: ['Music/Library', 'Downloads', 'Music/Favoris']
  }
]
