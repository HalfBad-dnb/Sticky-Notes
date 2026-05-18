import { AxiosInstance } from 'axios';
import { Note } from '../types/index';

export declare const useFilteredNotes: (notes: Note[], isPrivate: boolean) => Note[];
export declare const createDebouncedPositionUpdate: () => (id: string, x: number, y: number, callback: (id: string, x: number, y: number) => void) => void;
export declare const createOptimizedDragHandler: (setNotes: React.Dispatch<React.SetStateAction<Note[]>>, axios: AxiosInstance, getApiUrl: (endpoint: string) => string, notes: Note[]) => (id: string, x: number, y: number) => void;
export declare const useBatchOperations: (axios: AxiosInstance, getApiUrl: (endpoint: string) => string) => {
  batchDelete: (noteIds: string[]) => Promise<PromiseSettledResult<void>[]>;
  batchUpdate: (updates: { id: string; data: any }[]) => Promise<PromiseSettledResult<any>[]>;
};
export declare const useMemoizedStyles: (theme: string, isMobile: boolean) => {
  containerStyle: React.CSSProperties;
  cardStyle: React.CSSProperties;
  buttonStyle: React.CSSProperties;
};
export declare const useVirtualizedNotes: (notes: Note[], containerHeight?: number, itemHeight?: number) => {
  visibleNotes: Note[];
  totalHeight: number;
  offsetY: number;
  setScrollTop: React.Dispatch<React.SetStateAction<number>>;
};
export declare const createCancellableRequest: () => {
  makeRequest: <T>(key: string, requestFn: (signal: AbortSignal) => Promise<T>) => Promise<T>;
  cancelAll: () => void;
};
export declare const shouldUpdateNote: (prevNote: Note, nextNote: Note) => boolean;
export declare const createErrorHandler: (setError: React.Dispatch<React.SetStateAction<string>>) => (error: any, context?: string) => void;
export declare const useNotesCache: () => {
  getCachedNotes: () => Note[] | null;
  setCachedNotes: (notes: Note[]) => void;
  clearCache: () => void;
};

declare const _default: {
  useFilteredNotes: typeof useFilteredNotes;
  createOptimizedDragHandler: typeof createOptimizedDragHandler;
  useBatchOperations: typeof useBatchOperations;
  useMemoizedStyles: typeof useMemoizedStyles;
  useVirtualizedNotes: typeof useVirtualizedNotes;
  createCancellableRequest: typeof createCancellableRequest;
  shouldUpdateNote: typeof shouldUpdateNote;
  createErrorHandler: typeof createErrorHandler;
  useNotesCache: typeof useNotesCache;
};

export default _default;
