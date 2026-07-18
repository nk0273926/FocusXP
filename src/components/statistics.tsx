import { useMemo } from 'react';
import { Clock, TrendingUp, Award, Calendar, Target, BarChart3 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { dateKey, startOfWeek, parseDate } from '../utils/dates';

export function Statistics() {
  const activity = useGameStore((s) => s.activity);
  const tasks = useGameStore((s) => s.tasks);
  const longestStreak = useGameStore((s) => s.longestStreak);

  const stats = useMemo(() => {
    const today = new Date();
    const todayK = dateKey(today);
    const weekStart = startOfWeek(today);
    const weekStartK = dateKey(weekStart);
    const monthStartK = dateKey(new Date(today.getFullYear(), today.getMonth(), 1));

    let weeklyFocus = 0;
    let monthlyFocus = 0;
    let totalDays = 0;
    let totalActivityXP = 0;
    let bestDayXP = 0;
    let bestDayDate = '';

    for (const [key, act] of Object.entries(activity)) {
      if (key >= weekStartK) weeklyFocus += act.focusTime;
      if (key >= monthStartK) monthlyFocus += act.focusTime;
      if (act.xp > 0) totalDays++;
      totalActivityXP += act.xp;
      if (act.xp > bestDayXP) {
        bestDayXP = act.xp;
        bestDayDate = key;
      }
    }

    const activeDays = totalDays || 1;
    const avgDailyXP = totalActivityXP / activeDays;
    const completedCount = tasks.filter((t) => t.status === 'completed').length;
    const completionRate = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    return {
      todayFocus: activity[todayK]?.focusTime || 0,
      weeklyFocus,
      monthlyFocus,
      avgDailyXP: Math.round(avgDailyXP),
      longestStreak,
      bestDayXP,
      bestDayDate: bestDayDate ? parseDate(bestDayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
      totalTasks: tasks.length,
      completionRate: Math.round(completionRate),
    };
  }, [activity, tasks, longestStreak]);

  const items = [
    { label: "Today's Focus", value: `${stats.todayFocus}m`, icon: Clock, color: '#00f0ff' },
    { label: 'Weekly Focus', value: `${stats.weeklyFocus}m`, icon: TrendingUp, color: '#00ff9d' },
    { label: 'Monthly Focus', value: `${stats.monthlyFocus}m`, icon: BarChart3, color: '#7c5cff' },
    { label: 'Avg Daily XP', value: stats.avgDailyXP, icon: Target, color: '#ffb800' },
    { label: 'Longest Streak', value: `${stats.longestStreak}d`, icon: Award, color: '#ff2d95' },
    { label: 'Best Day', value: `${stats.bestDayXP} XP`, sub: stats.bestDayDate, icon: Calendar, color: '#00ff9d' },
    { label: 'Total Tasks', value: stats.totalTasks, icon: BarChart3, color: '#00f0ff' },
    { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: Target, color: '#00ff9d' },
  ];

  return (
    <div className="glass p-4 md:p-5">
      <h2 className="font-display text-sm font-bold uppercase tracking-widest gradient-text mb-4">
        Statistics
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="glass glass-hover p-3">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                <span className="text-[0.6rem] text-muted uppercase tracking-wider font-display truncate">
                  {item.label}
                </span>
              </div>
              <div className="font-display text-lg font-bold" style={{ color: item.color }}>
                {item.value}
              </div>
              {item.sub && <div className="text-[0.6rem] text-muted mt-0.5">{item.sub}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
