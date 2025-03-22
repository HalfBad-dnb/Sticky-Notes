import { useContext } from 'react';
import { ZoomContext } from './ZoomContext';

// Custom hook to use the zoom context
export function useZoom() {
  const context = useContext(ZoomContext);
  if (!context) {
    throw new Error('useZoom must be used within a ZoomProvider');
  }
  return context;
}
