import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface NeuralBackgroundProps {
  intensity?: "subtle" | "medium" | "strong";
  parallax?: boolean;
}

export function NeuralBackground({ intensity = "subtle", parallax = true }: NeuralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    
    // Neural network configuration
    const nodeCount = intensity === "subtle" ? 30 : intensity === "medium" ? 50 : 80;
    const nodes: { x: number; y: number; vx: number; vy: number; connections: number }[] = [];
    
    // Create nodes with market-structure inspired positioning
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        connections: 0
      });
    }
    
    let animationFrame: number;
    let scrollY = 0;
    
    const handleScroll = () => {
      if (parallax) {
        scrollY = window.scrollY * 0.2;
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    
    const animate = () => {
      ctx.fillStyle = "rgba(10, 14, 26, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Move nodes
        node.x += node.vx;
        node.y += node.vy - scrollY * 0.01;
        
        // Boundary collision
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        
        // Keep in bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));
        
        // Draw connections
        node.connections = 0;
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - node.x;
          const dy = nodes[j].y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const maxDistance = 150;
          if (distance < maxDistance) {
            node.connections++;
            const opacity = (1 - distance / maxDistance) * 0.3;
            
            ctx.beginPath();
            ctx.strokeStyle = `rgba(31, 240, 218, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
        
        // Draw node
        const nodeSize = Math.min(3, 1 + node.connections * 0.3);
        const nodeOpacity = Math.min(0.8, 0.4 + node.connections * 0.1);
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(31, 240, 218, ${nodeOpacity})`;
        ctx.fill();
        
        // Draw glow for highly connected nodes
        if (node.connections > 3) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize + 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(31, 240, 218, ${nodeOpacity * 0.2})`;
          ctx.fill();
        }
      });
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [intensity, parallax]);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: intensity === "subtle" ? 0.4 : intensity === "medium" ? 0.6 : 0.8 }}
    />
  );
}

// Scanline effect component
export function ScanlineEffect() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 10 }}
    >
      <motion.div
        className="absolute w-full h-1 bg-gradient-to-r from-transparent via-[#1FF0DA]/30 to-transparent"
        initial={{ top: "0%" }}
        animate={{ top: "100%" }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 2
        }}
        style={{
          boxShadow: "0 0 20px rgba(31, 240, 218, 0.6)",
          filter: "blur(2px)"
        }}
      />
    </motion.div>
  );
}
