import { motion } from "motion/react";

interface AIOrbProps {
  isActive: boolean;
  volume: number;
}

export function AIOrb({ isActive, volume }: AIOrbProps) {
  // Scale based on volume (0 to 1)
  const scale = isActive ? 1 + volume * 1.5 : 1;
  const opacity = isActive ? 0.8 + volume * 0.2 : 0.4;

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Outer Glow */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: isActive ? [0.2, 0.4, 0.2] : 0.1,
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-full h-full rounded-full bg-blue-500/20 blur-3xl"
      />

      {/* Main Orb */}
      <motion.div
        animate={{
          scale: scale,
          opacity: opacity,
          boxShadow: isActive 
            ? `0 0 ${20 + volume * 60}px rgba(59, 130, 246, 0.5)` 
            : "0 0 20px rgba(59, 130, 246, 0.2)",
        }}
        className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center overflow-hidden"
      >
        {/* Inner Swirls */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 opacity-30"
          style={{
            background: "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.4), transparent)",
          }}
        />
        
        {/* Core */}
        <div className="w-12 h-12 rounded-full bg-white/20 blur-sm" />
      </motion.div>

      {/* Ring */}
      <motion.div
        animate={{
          rotate: -360,
          scale: isActive ? 1.2 : 1.1,
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute w-48 h-48 rounded-full border border-blue-500/30 border-dashed"
      />
    </div>
  );
}
