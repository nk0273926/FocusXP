import { useMemo } from 'react';
import { Flame, Target } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useAnimatedNumber } from '../utils/hooks';
import { getMotivation } from '../utils/content';
import { todayKey } from '../utils/dates';

export function DailyGoalProgress() {
  const activity = useGameStore((s) => s.activity);
  const goal = useGameStore((s) => s.settings.dailyXPGoal);

  const todayXP = activity[todayKey()]?.xp || 0;
  const animatedXP = useAnimatedNumber(todayXP, 800);
  const progress = Math.min((todayXP / goal) * 100, 100);
  const remaining = Math.max(0, goal - todayXP);
  const motivation = useMemo(() => getMotivation(progress), [progress]);

  return (
    <div className="glass px-4 py-3 md:px-6 md:py-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
        <div className="flex items-center gap-2 shrink-0">
          <Target className="w-4 h-4 text-cyber-cyan" />
          <span className="font-display text-xs uppercase tracking-widest text-muted">Today's Goal</span>
        </div>

        {/* Progress bar */}
        <div className="flex-1 min-w-0">
          <div className="h-3 rounded-full overflow-hidden relative" style={{ background: 'rgba(26,35,64,0.8)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #00f0ff, #00ff9d)',
                boxShadow: '0 0 15px rgba(0,255,157,0.5)',
              }}
            >
              <div className="absolute inset-0 shimmer-bg animate-shimmer" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-1.5 text-xs">
            <span className="text-muted">
              <span className="text-cyber-cyan font-display font-bold">{Math.round(animatedXP)}</span>
              {' / '}
              <span className="font-display">{goal}</span>
              {' XP'}
            </span>
            <span className="text-muted">
              {remaining > 0 ? (
                <>Remaining: <span className="text-cyber-amber font-display">{remaining} XP</span></>
              ) : (
                <span className="text-cyber-green font-display">Goal Complete!</span>
              )}
            </span>
          </div>
        </div>

        {/* Motivation */}
        <div className="flex items-center gap-2 shrink-0 md:border-l md:border-cyber-border md:pl-6">
          <Flame className="w-4 h-4 text-cyber-amber animate-pulse" />
          <span className="font-display text-sm font-bold gradient-text">{motivation}</span>
        </div>
      </div>
    </div>
  );
}
