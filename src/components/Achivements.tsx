import { useState } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { ACHIEVEMENT_CATEGORY_LABELS } from '../utils/achievements';
import type { Achievement } from '../types';
import { playAchievementSound } from '../utils/helpers';

const CATEGORY_COLORS: Record<Achievement['category'], string> = {
  productivity: '#00f0ff',
  streak: '#ffb800',
  eco: '#00ff9d',
  special: '#ff2d95',
};

export function Achievements() {
  const achievements = useGameStore((s) => s.achievements);
  const soundEnabled = useGameStore((s) => s.settings.soundEnabled);
  const [filter, setFilter] = useState<Achievement['category'] | 'all'>('all');

  const filtered = filter === 'all' ? achievements : achievements.filter((a) => a.category === filter);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="glass p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest gradient-text">
          Achievements
        </h2>
        <span className="text-xs text-muted font-display">
          {unlockedCount} / {achievements.length}
        </span>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 rounded-md text-[0.65rem] font-display uppercase tracking-wider transition-all ${
            filter === 'all'
              ? 'bg-cyber-cyan/15 border border-cyber-cyan/40 text-cyber-cyan'
              : 'text-muted hover:text-cyber-cyan border border-transparent'
          }`}
        >
          All
        </button>
        {(Object.keys(ACHIEVEMENT_CATEGORY_LABELS) as Achievement['category'][]).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2.5 py-1 rounded-md text-[0.65rem] font-display uppercase tracking-wider transition-all ${
              filter === cat
                ? 'border'
                : 'text-muted hover:text-cyber-cyan border border-transparent'
            }`}
            style={
              filter === cat
                ? {
                    background: `${CATEGORY_COLORS[cat]}15`,
                    borderColor: `${CATEGORY_COLORS[cat]}40`,
                    color: CATEGORY_COLORS[cat],
                  }
                : {}
            }
          >
            {ACHIEVEMENT_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((a) => {
          const color = CATEGORY_COLORS[a.category];
          return (
            <div
              key={a.id}
              className={`glass p-3 text-center relative overflow-hidden transition-all hover:scale-105 ${
                a.unlocked ? '' : 'opacity-60'
              }`}
              style={a.unlocked ? { borderColor: `${color}40`, boxShadow: `0 0 15px ${color}20` } : {}}
              onMouseEnter={() => a.unlocked && soundEnabled && playAchievementSound()}
            >
              {a.unlocked && (
                <div
                  className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20 blur-xl"
                  style={{ background: color }}
                />
              )}
              <div className="text-3xl mb-2 relative">
                {a.unlocked ? a.icon : <Lock className="w-6 h-6 mx-auto text-muted" />}
              </div>
              <div className="font-display text-xs font-bold mb-1" style={{ color: a.unlocked ? color : '#7a8aab' }}>
                {a.name}
              </div>
              <div className="text-[0.65rem] text-muted leading-tight mb-2">{a.description}</div>

              {a.unlocked ? (
                <div className="flex items-center justify-center gap-1 text-[0.6rem] font-display uppercase tracking-wider" style={{ color }}>
                  <CheckCircle2 className="w-3 h-3" />
                  Unlocked
                </div>
              ) : (
                <div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(26,35,64,0.8)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${a.progress}%`, background: color }}
                    />
                  </div>
                  <div className="text-[0.6rem] text-muted mt-1">{Math.round(a.progress)}%</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
