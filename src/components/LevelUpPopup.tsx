import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { playLevelUpSound } from '../utils/helpers';

interface LevelUpData {
  level: number;
  rank: string;
}

let levelUpCallback: ((data: LevelUpData) => void) | null = null;

export function triggerLevelUp(level: number, rank: string) {
  levelUpCallback?.({ level, rank });
}

export function LevelUpPopup() {
  const [data, setData] = useState<LevelUpData | null>(null);
  const soundEnabled = useGameStore((s) => s.settings.soundEnabled);

  useEffect(() => {
    levelUpCallback = (d) => {
      setData(d);
      if (soundEnabled) playLevelUpSound();
      setTimeout(() => setData(null), 4000);
    };
    return () => {
      levelUpCallback = null;
    };
  }, [soundEnabled]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Confetti */}
      <Confetti />
      <div className="glass level-up-popup p-8 text-center relative" style={{ borderColor: '#ff2d95', boxShadow: '0 0 40px rgba(255,45,149,0.4)' }}>
        <div className="absolute inset-0 rounded-2xl" style={{ background: 'radial-gradient(circle, rgba(255,45,149,0.1), transparent 70%)' }} />
        <div className="text-5xl mb-3">🎉</div>
        <div className="font-display text-3xl font-bold gradient-text mb-2">LEVEL UP!</div>
        <div className="font-display text-xl text-cyber-pink mb-1">Level {data.level}</div>
        <div className="text-sm text-muted">You are now a {data.rank}!</div>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => i);
  const colors = ['#00f0ff', '#00ff9d', '#ff2d95', '#ffb800', '#7c5cff'];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 2 + Math.random() * 2;
        const color = colors[i % colors.length];
        return (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              top: '-20px',
              background: color,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}
