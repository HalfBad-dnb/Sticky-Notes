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
    
    // Function to handle panning with middle mouse button - only for notes containers
    const handleMouseDown = (e) => {
      // Find if the event target is inside a notes container
      const notesContainer = e.target.closest('.notes-container');
      
      // Middle mouse button (button 1) and inside a notes container
      if (e.button === 1 && notesContainer) {
        e.preventDefault();
        setIsPanning(true);
        setLastMousePosition({ x: e.clientX, y: e.clientY });
      }
    };
    
    const handleMouseMove = (e) => {
      if (isPanning) {
        const notesContainer = document.querySelector('.notes-container');
        if (notesContainer) {
          const dx = e.clientX - lastMousePosition.x;
          const dy = e.clientY - lastMousePosition.y;
          
          notesContainer.scrollLeft -= dx;
          notesContainer.scrollTop -= dy;
          
          setLastMousePosition({ x: e.clientX, y: e.clientY });
        }
      }
    };
    
    const handleMouseUp = () => {
      setIsPanning(false);
    };
    
    // Add event listeners
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Clean up
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
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
