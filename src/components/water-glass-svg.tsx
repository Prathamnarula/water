'use client';

import { motion } from 'framer-motion';

interface WaterGlassProps {
  progress: number; // 0-100
  glassCount: number;
  goalGlasses: number;
}

export function WaterGlassSVG({ progress, glassCount, goalGlasses }: WaterGlassProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const waterHeight = (clampedProgress / 100) * 120;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width="200"
        height="220"
        viewBox="0 0 200 220"
        className="drop-shadow-lg"
      >
        {/* Glass body */}
        <defs>
          <clipPath id="glassClip">
            <path d="M40,30 L45,190 C45,200 50,205 60,205 L140,205 C150,205 155,200 155,190 L160,30 Z" />
          </clipPath>
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#f8fafc" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.3" />
          </linearGradient>
          <filter id="waterShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0284c7" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Glass outline */}
        <path
          d="M40,30 L45,190 C45,200 50,205 60,205 L140,205 C150,205 155,200 155,190 L160,30 Z"
          fill="url(#glassGradient)"
          stroke="#94a3b8"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Water fill */}
        <g clipPath="url(#glassClip)">
          <motion.rect
            x="38"
            y={205 - waterHeight}
            width="124"
            height={waterHeight + 10}
            fill="url(#waterGradient)"
            filter="url(#waterShadow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          {/* Wave effect on top */}
          <motion.path
            d={`M38,${205 - waterHeight} Q60,${205 - waterHeight - 8} 100,${205 - waterHeight} Q140,${205 - waterHeight + 8} 162,${205 - waterHeight} L162,${205 - waterHeight + 5} L38,${205 - waterHeight + 5} Z`}
            fill="#7dd3fc"
            opacity="0.6"
            animate={{
              d: [
                `M38,${205 - waterHeight} Q60,${205 - waterHeight - 8} 100,${205 - waterHeight} Q140,${205 - waterHeight + 8} 162,${205 - waterHeight} L162,${205 - waterHeight + 5} L38,${205 - waterHeight + 5} Z`,
                `M38,${205 - waterHeight} Q60,${205 - waterHeight + 8} 100,${205 - waterHeight} Q140,${205 - waterHeight - 8} 162,${205 - waterHeight} L162,${205 - waterHeight + 5} L38,${205 - waterHeight + 5} Z`,
                `M38,${205 - waterHeight} Q60,${205 - waterHeight - 8} 100,${205 - waterHeight} Q140,${205 - waterHeight + 8} 162,${205 - waterHeight} L162,${205 - waterHeight + 5} L38,${205 - waterHeight + 5} Z`,
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Bubbles */}
          {[...Array(3)].map((_, i) => (
            <motion.circle
              key={i}
              cx={65 + i * 35}
              cy={190 - i * 15}
              r={2 + i}
              fill="white"
              opacity="0.4"
              animate={{
                y: [-10, -40 - i * 10],
                opacity: [0.4, 0],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.7,
                ease: 'easeOut',
              }}
            />
          ))}
        </g>

        {/* Glass highlight / shine */}
        <path
          d="M50,40 L52,180"
          stroke="white"
          strokeWidth="2"
          opacity="0.4"
          strokeLinecap="round"
        />
        <path
          d="M56,40 L57,120"
          stroke="white"
          strokeWidth="1"
          opacity="0.25"
          strokeLinecap="round"
        />

        {/* Glass rim */}
        <ellipse
          cx="100"
          cy="30"
          rx="62"
          ry="8"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2.5"
        />
        <ellipse
          cx="100"
          cy="30"
          rx="58"
          ry="6"
          fill="#f1f5f9"
          opacity="0.4"
        />
      </svg>

      {/* Progress text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <motion.span
          key={glassCount}
          className="text-4xl font-bold text-sky-700 dark:text-sky-300"
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {glassCount}
        </motion.span>
        <span className="text-sm text-sky-500 dark:text-sky-400 font-medium">
          / {goalGlasses} glasses
        </span>
        <span className="text-xs text-muted-foreground mt-0.5">
          {Math.round((glassCount / goalGlasses) * 100)}%
        </span>
      </div>
    </div>
  );
}
