import { useEffect, useRef } from 'react';

const TriangleBackgroundTheme = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    let triangles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      rotation: number;
      speed: number;
      rotationSpeed: number;
    }> = [];
    const colors = [
      'rgba(255, 107, 107, 0.4)',
      'rgba(255, 159, 67, 0.4)',
      'rgba(83, 192, 222, 0.4)',
      'rgba(120, 111, 166, 0.4)',
      'rgba(255, 206, 86, 0.4)'
    ];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createTriangle = () => {
      const size = Math.random() * 15 + 8; // Slightly smaller triangles
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: size,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.8 + 0.3, // Slower movement
        rotationSpeed: (Math.random() - 0.5) * 0.008 // Slower rotation
      };
    };

    const init = () => {
      triangles = [];
      const triangleCount = Math.floor((canvas.width * canvas.height) / 10000);
      for (let i = 0; i < triangleCount; i++) {
        triangles.push(createTriangle());
      }
    };

    const drawTriangle = (x: number, y: number, size: number, rotation: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, size);
      ctx.lineTo(-size, size);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw triangles
      triangles.forEach(triangle => {
        // Update position
        triangle.y += triangle.speed;
        triangle.rotation += triangle.rotationSpeed;
        
        // Reset position if off screen
        if (triangle.y > canvas.height + triangle.size) {
          triangle.y = -triangle.size;
          triangle.x = Math.random() * canvas.width;
        }
        
        // Draw triangle
        drawTriangle(triangle.x, triangle.y, triangle.size, triangle.rotation, triangle.color);
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };

    // Setup
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    init();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
        pointerEvents: 'none',
        backgroundColor: '#0a0a0a'
      }}
    />
  );
};


export default TriangleBackgroundTheme;
