import { createContext, useContext } from 'react';

// Create a context for zoom functionality
export const ZoomContext = createContext({
  zoomLevel: 1,
  isPanning: false,
  getBoardStyle: () => ({})
});

// Custom hook to use the zoom context
export const useZoom = () => {
  const context = useContext(ZoomContext);
  
  if (!context) {
    throw new Error('useZoom must be used within a ZoomProvider');
  }
  
  return context;
};
