import { createContext } from 'react';

export interface ZoomContextType {
  getBoardStyle: () => React.CSSProperties;
  zoomLevel: number;
  isPanning: boolean;
}

// Create a context for zoom functionality
export const ZoomContext = createContext<ZoomContextType | undefined>(undefined);
