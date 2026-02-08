import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface UpgradeWheelProps {
  chance: number;
  isSpinning: boolean;
  result?: 'win' | 'lose' | null;
}

export default function UpgradeWheel({ chance, isSpinning, result }: UpgradeWheelProps) {
  const [finalRotation, setFinalRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (result !== null && !isSpinning) {
      // Вычисляем где находится фиолетовая полоска (начинается сверху)
      const strokeAngle = (chance / 100) * 360;
      
      // Минимум 5 полных оборотов
      const fullRotations = 360 * 5;
      
      let targetAngle;
      if (result === 'win') {
        // Выигрыш - стрелка попадает в середину фиолетовой зоны
        // Фиолетовая зона начинается с 0° (сверху), стрелка должна попасть в середину
        targetAngle = strokeAngle / 2;
      } else {
        // Проигрыш - стрелка останавливается за пределами фиолетовой зоны
        targetAngle = strokeAngle + 30;
      }
      
      setFinalRotation(fullRotations + targetAngle);
      setIsAnimating(true);
    } else if (!isSpinning && result === null) {
      setFinalRotation(0);
      setIsAnimating(false);
    }
  }, [result, isSpinning, chance]);

  // Параметры круга
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeAngle = (chance / 100) * 360;
  const strokeDashoffset = circumference - (strokeAngle / 360) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      {/* Статичный круг с фиолетовой полоской */}
      <div className="relative">
        <svg width="320" height="320" className="transform -rotate-90">
          {/* Фоновый круг */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="rgba(139, 92, 246, 0.2)"
            strokeWidth="8"
          />
          
          {/* Фиолетовая полоса - ЗАФИКСИРОВАНА, начинается сверху */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="#a855f7"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        {/* Центральный контент - НЕ крутится */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-7xl font-bold text-white">
            {chance}%
          </div>
          <div className="text-sm text-white/60 mt-2">шанс успеха</div>
        </div>
      </div>

      {/* Стрелочка сверху - КРУТИТСЯ и пытается попасть в фиолетовую зону */}
      <motion.div
        className="absolute"
        style={{ 
          top: '-20px',
          left: '50%',
          marginLeft: '-12px',
          transformOrigin: '12px 180px'
        }}
        animate={
          isSpinning
            ? { rotate: [0, 360] }
            : isAnimating
            ? { rotate: finalRotation }
            : { rotate: 0 }
        }
        transition={
          isSpinning
            ? {
                duration: 0.8,
                ease: "linear",
                repeat: Infinity
              }
            : isAnimating
            ? {
                duration: 7,
                ease: [0.11, 0, 0.5, 0]
              }
            : { duration: 0 }
        }
      >
        <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-white"></div>
      </motion.div>

      {/* Свечение */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 rounded-full blur-3xl opacity-30 bg-purple-500"></div>
      </div>
    </div>
  );
}
