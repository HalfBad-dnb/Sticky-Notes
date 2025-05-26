import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

// Constants
const COLORS = [
  'rgba(255, 59, 48, 0.3)',  // Red
  'rgba(255, 149, 0, 0.3)',  // Orange
  'rgba(255, 204, 0, 0.3)',  // Yellow
  'rgba(52, 199, 89, 0.3)',  // Green
  'rgba(0, 122, 255, 0.3)',  // Blue
  'rgba(88, 86, 214, 0.3)',  // Purple
  'rgba(255, 45, 85, 0.3)'   // Pink
];

// Performance-optimized constants
const TRIANGLE_COUNT = 15; // Reduced from 30 to 15 for better performance
const MIN_SIZE = 8;         // Increased minimum size
const MAX_SIZE = 40;        // Slightly larger max size for better coverage
const MIN_DURATION = 15;    // Slower animations are often smoother
const MAX_DURATION = 25;    // Reduced range for more consistent performance

// Highly optimized Triangle component
const Triangle = React.memo(({ size, x, y, rotation, color, duration, delay }) => {
  // Pre-calculate everything that won't change
  const triangleStyle = React.useMemo(() => ({
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}px`,
    height: `${size}px`,
    transform: `rotate(${rotation}deg)`,
    opacity: 0.7,
    filter: 'drop-shadow(0 0 3px currentColor)', // Reduced shadow for better performance
    animation: `float ${duration}s ease-in-out ${delay}s infinite`,
    pointerEvents: 'none',
    zIndex: -1,
    color: color,
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden', // Improves performance on mobile
    transformStyle: 'preserve-3d', // Enables hardware acceleration
  }), [x, y, size, rotation, color, duration, delay]);
  
  // Pre-calculate points for the triangle
  const points = useMemo(() => {
    const halfSize = size / 2;
    return `0,${size} ${halfSize},0 ${size},${size}`;
  }, [size]);

  return (
    <div 
      style={triangleStyle}
      aria-hidden="true"
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${size} ${size}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon 
          points={points} 
          fill="currentColor"
        />
      </svg>
    </div>
  );
});

// Add PropTypes for the Triangle component
Triangle.propTypes = {
  id: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  rotation: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  delay: PropTypes.number.isRequired
};

// Memoize the component to prevent unnecessary re-renders
const MainBackgroundDefault = React.memo(() => {
  // Generate triangles with optimized distribution
  const triangles = useMemo(() => {
    return Array.from({ length: TRIANGLE_COUNT }, (_, i) => {
      // Distribute triangles more evenly
      const row = Math.floor(i / 5);
      const col = i % 5;
      const xStep = 100 / 6; // 5 columns with some padding
      const yStep = 100 / 4; // 4 rows with some padding
      
      return {
        id: i,
        size: MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE),
        x: 10 + (col * xStep) + (Math.random() * xStep * 0.6) - (xStep * 0.3),
        y: 10 + (row * yStep) + (Math.random() * yStep * 0.6) - (yStep * 0.3),
        rotation: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        duration: MIN_DURATION + (Math.random() * (MAX_DURATION - MIN_DURATION)),
        delay: Math.random() * -30 // More varied delays for better distribution
      };
    });
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: -2,
        pointerEvents: 'none',
        willChange: 'contents'
      }}
      aria-hidden="true"
    >
      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translate(0, 0) rotate(0deg);
              opacity: 0.7;
            }
            50% {
              transform: translate(5px, -5px) rotate(3deg);
              opacity: 0.9;
            }
          }
          
          /* Force hardware acceleration */
          * {
            transform: translate3d(0, 0, 0);
          }
        `}
      </style>
      {triangles.map(triangle => (
        <Triangle key={triangle.id} {...triangle} />
      ))}
    </div>
  );
});

// Set display name for better debugging in React DevTools
MainBackgroundDefault.displayName = 'MainBackgroundDefault';
Triangle.displayName = 'Triangle';

export default MainBackgroundDefault;