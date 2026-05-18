// User related types
export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

// Board related types
export interface Board {
  id: string
  title: string
  description?: string
  ownerId: string
  isPublic: boolean
  collaborators: string[]
  createdAt: string
  updatedAt: string
}

// Note related types — matches backend Note entity
export interface Note {
  id: string | number;
  text: string;
  x: number;
  y: number;
  color?: string;
  done?: boolean;
  username?: string;
  boardType?: string;
  zIndex?: number;
  isPrivate?: boolean;
  likes?: number;
  dislikes?: number;
  boardId?: string | number;
  rotation?: number;
  createdAt?: string | Date;
  width?: string;
  height?: string;
}

// Drag and Drop types
export interface DragItem {
  id: string
  type: string
  x: number
  y: number
}

export interface DropResult {
  draggedId: string
  droppedId?: string
  x: number
  y: number
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// WebSocket message types
export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: string
  userId?: string
  boardId?: string
}

// Theme types
export interface Theme {
  mode: 'light' | 'dark'
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
}

// Component Props types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
}

// Form types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
}

export interface FormState {
  [key: string]: string | number | boolean
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
}

// Navigation types
export interface NavigationItem {
  id: string
  label: string
  path: string
  icon?: string
  children?: NavigationItem[]
}

// Context types
export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: Partial<User>) => Promise<void>
}

export interface BoardContextType {
  boards: Board[]
  currentBoard: Board | null
  isLoading: boolean
  createBoard: (boardData: Partial<Board>) => Promise<void>
  updateBoard: (id: string, boardData: Partial<Board>) => Promise<void>
  deleteBoard: (id: string) => Promise<void>
  setCurrentBoard: (board: Board | null) => void
}

// Embedded App types
export interface EmbeddedApp {
  id: string | number
  type: 'youtube' | 'spotify' | 'soundcloud'
  url?: string
  x?: number
  y?: number
  width?: number
  height?: number
  zIndex?: number
  isMinimized?: boolean
}
