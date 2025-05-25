
const MainBackgroundDefault = () => {
  // Generate random triangles with glow effect
  const generateTriangles = () => {
    const triangles = [];
    const colors = [
      'rgba(255, 59, 48, 0.3)',  // Red
      'rgba(255, 149, 0, 0.3)',  // Orange
      'rgba(255, 204, 0, 0.3)',  // Yellow
      'rgba(52, 199, 89, 0.3)',  // Green
      'rgba(0, 122, 255, 0.3)',  // Blue
      'rgba(88, 86, 214, 0.3)',  // Purple
      'rgba(255, 45, 85, 0.3)'   // Pink
    ];

    // Create 20-40 random triangles
    const triangleCount = 20 + Math.floor(Math.random() * 20);
    
    for (let i = 0; i < triangleCount; i++) {
      const size = 5 + Math.random() * 30; // Random size between 5 and 35px
      const x = Math.random() * 100; // Random x position (0-100%)
      const y = Math.random() * 100; // Random y position (0-100%)
      const rotation = Math.random() * 360; // Random rotation
      const color = colors[Math.floor(Math.random() * colors.length)];
      const duration = 10 + Math.random() * 20; // Random animation duration between 10-30s
      const delay = Math.random() * -20; // Random delay to start animation
      
      // Random triangle type (up, down, left, right)
      const type = Math.floor(Math.random() * 4);
      let points = '';
      
      switch(type) {
        case 0: // Up
          points = `0,${size} ${size/2},0 ${size},${size}`;
          break;
        case 1: // Down
          points = `0,0 ${size/2},${size} ${size},0`;
          break;
        case 2: // Left
          points = `${size},0 0,${size/2} ${size},${size}`;
          break;
        case 3: // Right
          points = `0,0 ${size},${size/2} 0,${size}`;
          break;
      }
      
      triangles.push(
        <div 
          key={i}
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            width: `${size}px`,
            height: `${size}px`,
            filter: 'blur(1px)',
            opacity: 0,
            animation: `float ${duration}s ease-in-out ${delay}s infinite`,
            transform: `rotate(${rotation}deg)`
          }}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <polygon 
              points={points}
              fill={color}
              style={{
                filter: `drop-shadow(0 0 2px ${color})`,
                animation: `glow ${duration/2}s ease-in-out ${delay}s infinite alternate`
              }}
            />
          </svg>
        </div>
      );
    }
    
    return triangles;
  };
  
  // Animation keyframes
  const animations = `
    @keyframes float {
      0%, 100% {
        transform: translate(0, 0) rotate(0deg);
        opacity: 0;
      }
      25% {
        opacity: 0.3;
      }
      50% {
        transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px) rotate(${Math.random() * 360}deg);
        opacity: 0.7;
      }
      75% {
        opacity: 0.3;
      }
    }
    
    @keyframes glow {
      from {
        filter: drop-shadow(0 0 2px currentColor);
      }
      to {
        filter: drop-shadow(0 0 8px currentColor);
      }
    }
  `;

  return (
    <>
      <style>{animations}</style>
      <style>{
        `
        html, body, #root, .app-container {
          margin: 0 !important;
          padding: 0 !important;
          min-height: 100vh !important;
          background-color: #0a0a0a !important;
          overflow-x: hidden;
        }
        `
      }</style>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#0a0a0a',
          zIndex: -2,
          margin: 0,
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {generateTriangles()}
      </div>
    </>
  );
};

export default MainBackgroundDefault;