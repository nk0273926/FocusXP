import { useMemo } from 'react';
import { Zap, Flame, CheckCircle2, Leaf, TrendingUp, TrendingDown } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useAnimatedNumber, useGameStats } from '../utils/hooks';
import { formatEco } from '../utils/content';
import { dateKey, addDays } from '../utils/dates';

interface DashboardCardsProps {
  onOpenEco: () => void;
}

export function DashboardCards({ onOpenEco }: DashboardCardsProps) {
  const { todayActivity, currentStreak, completedCount, eco } = useGameStats();
  const activity = useGameStore((s) => s.activity);

  const animatedXP = useAnimatedNumber(todayActivity.xp, 800);
  const animatedStreak = useAnimatedNumber(currentStreak, 600);
  const animatedTasks = useAnimatedNumber(completedCount, 600);
  const animatedTrees = useAnimatedNumber(eco.trees, 800);

  // Trend: compare today vs yesterday
  const yesterday = dateKey(addDays(new Date(), -1));
  const yesterdayXP = activity[yesterday]?.xp || 0;
  const xpTrend = useMemo(() => {
    if (yesterdayXP === 0) return todayActivity.xp > 0 ? 100 : 0;
    return Math.round(((todayActivity.xp - yesterdayXP) / yesterdayXP) * 100);
  }, [todayActivity.xp, yesterdayXP]);

  const streakTrend = currentStreak > 0 ? 1 : -1;
  const tasksTrend = completedCount > 0 ? 1 : 0;

  const cards = [
    {
      id: 'xp',
      label: 'XP Today',
      value: Math.round(animatedXP),
      suffix: ' XP',
      icon: Zap,
      color: '#00f0ff',
      trend: xpTrend,
      trendLabel: `${xpTrend > 0 ? '+' : ''}${xpTrend}%`,
    },
    {
      id: 'streak',
      label: 'Current Streak',
      value: Math.round(animatedStreak),
      suffix: ' days',
      icon: Flame,
      color: '#ffb800',
      trend: streakTrend,
      trendLabel: streakTrend > 0 ? 'Active' : 'Cold',
    },
    {
      id: 'tasks',
      label: 'Completed Tasks',
      value: Math.round(animatedTasks),
      suffix: '',
      icon: CheckCircle2,
      color: '#00ff9d',
      trend: tasksTrend,
      trendLabel: tasksTrend > 0 ? 'Done' : '—',
    },
    {
      id: 'eco',
      label: 'Eco Impact',
      value: animatedTrees,
      suffix: ' trees',
      icon: Leaf,
      color: '#7c5cff',
      trend: 0,
      trendLabel: 'View',
      onClick: onOpenEco,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trend > 0 ? TrendingUp : card.trend < 0 ? TrendingDown : null;
        return (
          <button
            key={card.id}
            onClick={card.onClick}
            className="glass glass-hover p-4 md:p-5 text-left group relative overflow-hidden"
          >
            {/* Glow accent */}
            <div
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-25"
              style={{ background: card.color }}
            />

            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${card.color}15`, border: `1px solid ${card.color}40` }}
              >
                <Icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              {TrendIcon && (
                <div
                  className="flex items-center gap-1 text-[0.65rem] font-display"
                  style={{ color: card.trend > 0 ? '#00ff9d' : '#ff4d6d' }}
                >
                  <TrendIcon className="w-3 h-3" />
                  {card.trendLabel}
                </div>
              )}
              {!TrendIcon && (
                <div className="text-[0.65rem] font-display text-muted">{card.trendLabel}</div>
              )}
            </div>

            <div className="font-display text-2xl md:text-3xl font-bold" style={{ color: card.color }}>
              {card.value}
              <span className="text-sm font-normal text-muted ml-1">{card.suffix}</span>
            </div>
            <div className="text-[0.7rem] text-muted uppercase tracking-widest mt-1">
              {card.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function EcoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { completedCount, eco, totalFocusTime } = useGameStats();

  if (!open) return null;

  const items = [
    { label: 'Trees Saved', value: eco.trees, unit: '', icon: '🌳', color: '#00ff9d' },
    { label: 'Water Saved', value: eco.water, unit: 'L', icon: '💧', color: '#00f0ff' },
    { label: 'CO₂ Saved', value: eco.co2, unit: 'kg', icon: '🌫️', color: '#7c5cff' },
    { label: 'Energy Saved', value: eco.energy, unit: 'kWh', icon: '⚡', color: '#ffb800' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="glass relative max-w-md w-full p-6 level-up-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-cyber-green" />
            <h2 className="font-display text-lg font-bold gradient-text">Eco Impact</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost !px-2 !py-1 text-xs">Close</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item.label} className="glass p-4 text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-display text-xl font-bold" style={{ color: item.color }}>
                {formatEco(item.value, item.unit)}
              </div>
              <div className="text-[0.65rem] text-muted uppercase tracking-widest mt-1">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center text-xs text-muted">
          From {completedCount} completed tasks and {totalFocusTime} minutes of focus
        </div>
      </div>
    </div>
  );
}
