import { motion } from "framer-motion";

interface RAimondGlyphProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export function RAimondGlyph({ size = 48, className = "", animated = true }: RAimondGlyphProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={animated ? { rotate: 0, opacity: 0 } : {}}
      animate={animated ? { rotate: 1, opacity: 1 } : {}}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      {/* Outer Neural Ring */}
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        stroke="url(#glyphGradient)"
        strokeWidth="1"
        fill="none"
        strokeDasharray="4 4"
        initial={animated ? { rotate: 0 } : {}}
        animate={animated ? { rotate: 360 } : {}}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      />
      
      {/* Core Neural Pathways forming "R" */}
      <g>
        {/* Vertical stem of R */}
        <motion.path
          d="M 30 25 L 30 75"
          stroke="url(#glyphGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={animated ? { pathLength: 0, opacity: 0 } : {}}
          animate={animated ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
        />
        
        {/* Top curve of R */}
        <motion.path
          d="M 30 25 Q 55 25 55 40 Q 55 50 45 52"
          stroke="url(#glyphGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          initial={animated ? { pathLength: 0, opacity: 0 } : {}}
          animate={animated ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.4 }}
        />
        
        {/* Diagonal leg of R */}
        <motion.path
          d="M 42 52 L 58 75"
          stroke="url(#glyphGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={animated ? { pathLength: 0, opacity: 0 } : {}}
          animate={animated ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.6 }}
        />
      </g>
      
      {/* Neural Nodes */}
      <motion.circle
        cx="30"
        cy="25"
        r="3"
        fill="#1FF0DA"
        initial={animated ? { scale: 0, opacity: 0 } : {}}
        animate={animated ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
      </motion.circle>
      
      <motion.circle
        cx="30"
        cy="75"
        r="3"
        fill="#1FF0DA"
        initial={animated ? { scale: 0, opacity: 0 } : {}}
        animate={animated ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.3, delay: 0.9 }}
      >
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" begin="0.5s" />
      </motion.circle>
      
      <motion.circle
        cx="55"
        cy="40"
        r="3"
        fill="#1FF0DA"
        initial={animated ? { scale: 0, opacity: 0 } : {}}
        animate={animated ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.3, delay: 1.0 }}
      >
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" begin="1s" />
      </motion.circle>
      
      <motion.circle
        cx="58"
        cy="75"
        r="3"
        fill="#1FF0DA"
        initial={animated ? { scale: 0, opacity: 0 } : {}}
        animate={animated ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.3, delay: 1.1 }}
      >
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" begin="1.5s" />
      </motion.circle>
      
      {/* Center Core Compass/Brain Node */}
      <motion.circle
        cx="70"
        cy="30"
        r="8"
        stroke="url(#glyphGradient)"
        strokeWidth="1.5"
        fill="rgba(31, 240, 218, 0.1)"
        initial={animated ? { scale: 0, opacity: 0 } : {}}
        animate={animated ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 1.2 }}
      />
      
      {/* Microstructure Circuit Lines */}
      <g opacity="0.6">
        <motion.line
          x1="70"
          y1="22"
          x2="70"
          y2="15"
          stroke="#1FF0DA"
          strokeWidth="1"
          initial={animated ? { pathLength: 0 } : {}}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ duration: 0.3, delay: 1.3 }}
        />
        <motion.line
          x1="78"
          y1="30"
          x2="85"
          y2="30"
          stroke="#1FF0DA"
          strokeWidth="1"
          initial={animated ? { pathLength: 0 } : {}}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ duration: 0.3, delay: 1.4 }}
        />
        <motion.line
          x1="75"
          y1="35"
          x2="80"
          y2="40"
          stroke="#1FF0DA"
          strokeWidth="1"
          initial={animated ? { pathLength: 0 } : {}}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ duration: 0.3, delay: 1.5 }}
        />
      </g>
      
      {/* Gradient Definition */}
      <defs>
        <linearGradient id="glyphGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1FF0DA" />
          <stop offset="100%" stopColor="#4a90e2" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}
