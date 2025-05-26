import { useEffect, useRef, useCallback } from 'react';

const HeartBackground = () => {
  const containerRef = useRef(null);
  const colors = useRef([
    '#FF1744', // vibrant red
    '#FF4081', // bright pink
    '#FF5252', // coral red
    '#FF6D00', // orange-red
    '#FF3D00'  // deep orange
  ]);
  
  const heartStyles = useRef([
    { size: '28px', duration: 18 },
    { size: '36px', duration: 22 },
    { size: '24px', duration: 20 },
    { size: '32px', duration: 25 },
    { size: '20px', duration: 15 },
  ]);

  const createHeart = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const style = heartStyles.current[Math.floor(Math.random() * heartStyles.current.length)];
    const color = colors.current[Math.floor(Math.random() * colors.current.length)];
    const left = Math.random() * 100; // Random horizontal position
    const delay = Math.random() * 5;   // Random start delay
    const duration = style.duration * (0.5 + Math.random() * 0.5); // Random duration
    
    // Create heart element
    const heart = document.createElement('div');
    heart.innerHTML = '❤';
    heart.style.position = 'absolute';
    heart.style.left = `${left}%`;
    heart.style.bottom = '0';
    heart.style.transform = 'translateY(0)';
    heart.style.color = color;
    heart.style.fontSize = style.size;
    heart.style.opacity = '0';
    heart.style.zIndex = '0';
    heart.style.pointerEvents = 'none';
    heart.style.willChange = 'transform, opacity';
    heart.style.userSelect = 'none';
    heart.style.filter = 'drop-shadow(0 0 2px rgba(255, 0, 0, 0.3))';
    
    // Add to container
    container.appendChild(heart);
    
    // Animate the heart
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000; // Convert to seconds
      const progress = Math.min(elapsed / duration, 1);
      
      // Calculate current position and opacity
      const yPos = -100 * progress; // Move up from 0 to -100vh
      const rotation = 360 * progress; // Rotate from 0 to 360 degrees
      const opacity = Math.min(Math.sin(progress * Math.PI) * 1.5, 1); // Fade in and out
      
      // Apply transformations
      heart.style.transform = `translateY(${yPos}vh) rotate(${rotation}deg)`;
      heart.style.opacity = Math.min(opacity * 1.2, 1); // Slightly increase opacity
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Remove heart when animation is complete
        if (container && container.contains(heart)) {
          container.removeChild(heart);
        }
      }
    };
    
    // Start animation after delay
    setTimeout(() => {
      requestAnimationFrame(animate);
    }, delay * 1000);
    
    // Cleanup function to remove heart if component unmounts
    return () => {
      if (container && container.contains(heart)) {
        container.removeChild(heart);
      }
    };
  }, []);

  // Create hearts at regular intervals
  useEffect(() => {
    const interval = setInterval(createHeart, 300); // More frequent hearts
    return () => clearInterval(interval);
  }, [createHeart]);

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
};

export default HeartBackground;