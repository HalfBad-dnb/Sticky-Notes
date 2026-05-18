// Type declarations for JavaScript modules
declare module '../components/StickyNote' {
  import { ReactNode } from 'react';
  interface StickyNoteProps {
    children?: ReactNode;
    [key: string]: any;
  }
  const StickyNote: React.FC<StickyNoteProps>;
  export default StickyNote;
}

declare module '../context/useZoom' {
  export const useZoom: () => {
    getBoardStyle: () => React.CSSProperties;
  };
}

declare module './NotesManagementModal' {
  import { ReactNode } from 'react';
  interface NotesManagementModalProps {
    children?: ReactNode;
    [key: string]: any;
  }
  const NotesManagementModal: React.FC<NotesManagementModalProps>;
  export default NotesManagementModal;
}

declare module '../utils/axiosConfig.js' {
  import { AxiosInstance } from 'axios';
  const axios: AxiosInstance;
  export default axios;
}

declare module './ProfileOptimisation' {
  export const useFilteredNotes: (notes: any[], isPrivate: boolean) => any[];
  export const createOptimizedDragHandler: (fn: any) => any;
  export const useMemoizedStyles: (theme: any, isMobile: boolean) => any;
  export const createErrorHandler: (setError: any) => any;
  export const useNotesCache: () => any;
}

declare module '../components/common/Disclaimers' {
  import { ReactNode } from 'react';
  interface DisclaimersProps {
    children?: ReactNode;
    [key: string]: any;
  }
  const Disclaimers: React.FC<DisclaimersProps>;
  export default Disclaimers;
}

declare module '../components/common/BoardNavigation' {
  import { ReactNode } from 'react';
  interface BoardNavigationProps {
    children?: ReactNode;
    [key: string]: any;
  }
  const BoardNavigation: React.FC<BoardNavigationProps>;
  export default BoardNavigation;
}

// Extend CSSProperties type to include string values for flexibility
declare module 'csstype' {
  interface Properties {
    userSelect?: string;
    pointerEvents?: string;
    wordBreak?: string;
    flexDirection?: string;
  }
}
