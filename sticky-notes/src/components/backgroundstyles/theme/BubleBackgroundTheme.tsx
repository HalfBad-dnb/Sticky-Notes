import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const BubleBackgroundTheme = ({ bubbleCount = 16, colors = ['#FF5252', '#4FC3F7', '#4DB6AC', '#FFD740', '#FF8A80', '#80D8FF', '#A7FFEB'] }) => {
  const canvasRef = useRef(null);
  const bubbles = useRef([]);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Set canvas size
    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    // Initialize bubbles
    const initBubbles = () => {
      bubbles.current = [];
      for (let i = 0; i < bubbleCount; i++) {
        createBubble();
      }
    };

    // Create a single bubble
    const createBubble = () => {
      const size = Math.random() * 80 + 40; // Larger bubbles for better visibility
      const x = Math.random() * width;
      const y = height + size;
      const speed = Math.random() * 2 + 1.5; // Slightly faster movement
      const opacity = Math.random() * 0.6 + 0.3; // More opaque bubbles
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      bubbles.current.push({
        x,
        y,
        size,
        speed,
        opacity,
        color,
        swing: Math.random() * 2 * Math.PI, // For horizontal movement
        swingSpeed: Math.random() * 0.03 + 0.02, // More pronounced swinging
        swingDistance: Math.random() * 3 + 2 // Wider swing range
      });
    };

    // Update and draw bubbles
    const updateBubbles = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Remove bubbles that are off screen and create new ones
      bubbles.current = bubbles.current.filter(bubble => bubble.y > -bubble.size);
      while (bubbles.current.length < bubbleCount) {
        createBubble();
      }

      // Update and draw each bubble
      bubbles.current.forEach(bubble => {
        // Update position
        bubble.y -= bubble.speed;
        bubble.swing += bubble.swingSpeed;
        bubble.x += Math.sin(bubble.swing) * bubble.swingDistance;
        
        // Draw bubble
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        
        // Create gradient
        const gradient = ctx.createRadialGradient(
          bubble.x - bubble.size * 0.3,
          bubble.y - bubble.size * 0.3,
          0,
          bubble.x,
          bubble.y,
          bubble.size
        );
        
        // More vibrant gradient with better contrast
        gradient.addColorStop(0, `${bubble.color}${Math.round(bubble.opacity * 100).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(0.7, `${bubble.color}${Math.round(bubble.opacity * 70).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${bubble.color}00`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationFrameId.current = requestAnimationFrame(updateBubbles);
    };

    // Handle window resize
    const handleResize = () => {
      setCanvasSize();
      initBubbles();
    };

    // Initialize
    setCanvasSize();
    initBubbles();
    animationFrameId.current = requestAnimationFrame(updateBubbles);

    // Event listeners
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [bubbleCount, colors]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
};

BubleBackgroundTheme.propTypes = {
  bubbleCount: PropTypes.number,
  colors: PropTypes.arrayOf(PropTypes.string)
};

export default BubleBackgroundTheme;