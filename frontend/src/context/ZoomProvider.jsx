import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ZoomContext } from './ZoomContext';

// Provider component that wraps the app
export function ZoomProvider({ children }) {
  const [zoomLevel, setZoomLevel] = useState(1); // Default zoom level
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

  // Handle zoom functionality with Command/Ctrl + mouse wheel
  useEffect(() => {
    // Function to handle zooming - only for notes containers
    const handleWheel = (e) => {
      // Find if the event target is inside a notes container
      const notesContainer = e.target.closest('.notes-container');
      
      // Only apply zoom if we're inside a notes container and Command/Ctrl is pressed
      if (notesContainer && (e.metaKey || e.ctrlKey)) {
        e.preventDefault(); // Prevent default scrolling
        
        // Get mouse position relative to the notes container
        const rect = notesContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Store current scroll position
        const scrollLeft = notesContainer.scrollLeft;
        const scrollTop = notesContainer.scrollTop;
        
        // Calculate mouse position relative to the content (including scroll)
        const mouseXContent = mouseX + scrollLeft;
        const mouseYContent = mouseY + scrollTop;
        
        // Determine zoom direction
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        
        // Update zoom level with limits
        setZoomLevel(prevZoom => {
          const newZoom = Math.max(0.5, Math.min(5, prevZoom + delta));
          
          // Calculate new scroll position to maintain focus on the mouse pointer
          setTimeout(() => {
            // No need to get container dimensions for this calculation
            
            // Calculate the new scroll position to keep mouse point fixed
            // This formula ensures the point under the mouse stays fixed during zoom
            const scaleFactor = newZoom / prevZoom;
            const newScrollX = (mouseXContent * scaleFactor) - mouseX;
            const newScrollY = (mouseYContent * scaleFactor) - mouseY;
            
            // Apply the new scroll position
            notesContainer.scrollLeft = newScrollX;
            notesContainer.scrollTop = newScrollY;
          }, 0);
          
          return newZoom;
        });
      }
    };
    
    // Function to handle panning with middle mouse button - works anywhere on the page
    const handleMouseDown = (e) => {
      // Middle mouse button (button 1) - button code 1 is middle mouse
      if (e.button === 1 || e.buttons === 4) {
        e.preventDefault();
        setIsPanning(true);
        setLastMousePosition({ x: e.clientX, y: e.clientY });
        
        // Change cursor to indicate panning mode
        document.body.style.cursor = 'grabbing';
        
        // Disable text selection during panning
        document.body.style.userSelect = 'none';
      }
    };
    
    const handleMouseMove = (e) => {
      if (isPanning) {
        // Apply panning to all notes containers
        const notesContainers = document.querySelectorAll('.notes-container');
        
        if (notesContainers.length > 0) {
          const dx = e.clientX - lastMousePosition.x;
          const dy = e.clientY - lastMousePosition.y;
          
          // Apply panning to all notes containers
          notesContainers.forEach(container => {
            container.scrollLeft -= dx;
            container.scrollTop -= dy;
          });
          
          setLastMousePosition({ x: e.clientX, y: e.clientY });
          
          // Prevent default browser behavior
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };
    
    const handleMouseUp = () => {
      if (isPanning) {
        setIsPanning(false);
        // Reset cursor and text selection
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    
    // Add event listeners with passive: false to allow preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousedown', handleMouseDown, { passive: false });
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    
    // Prevent default middle mouse behavior (autoscroll in some browsers)
    const preventMiddleMouseScroll = (e) => {
      if (e.button === 1) {
        e.preventDefault();
        return false;
      }
    };
    
    // Handle context menu during panning
    const handleContextMenu = (e) => {
      if (isPanning) {
        e.preventDefault();
        return false;
      }
    };
    
    document.addEventListener('auxclick', preventMiddleMouseScroll, { passive: false });
    document.addEventListener('contextmenu', handleContextMenu, { passive: false });
    
    // Clean up
    return () => {
      window.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('auxclick', preventMiddleMouseScroll);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isPanning, lastMousePosition]);

  // Provide the zoom context to children with additional helper functions
  return (
    <ZoomContext.Provider value={{ 
      zoomLevel, 
      isPanning,
      // Helper function to get board style without affecting input area
      getBoardStyle: () => ({
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'center',
        transition: 'transform 0.05s ease',
        cursor: isPanning ? 'grabbing' : 'default',
        overflow: 'auto',
        height: '100%',
        width: '100%'
      })
    }}>
      {children}
    </ZoomContext.Provider>
  );
}

// PropTypes validation
ZoomProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
