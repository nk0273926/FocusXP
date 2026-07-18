import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Flame, Check, Target } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { dateKey, todayKey } from '../utils/dates';

export function MiniCalendar() {
  const activity = useGameStore((s) => s.activity);
  const goal = useGameStore((s) => s.settings.dailyXPGoal);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const today = todayKey();

  const days = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: { date: Date | null; key: string | null }[] = [];
    for (let i = 0; i < startDay; i++) cells.push({ date: null, key: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      cells.push({ date, key: dateKey(date) });
    }
    return cells;
  }, [viewMonth]);

  function prevMonth() {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  }
  function nextMonth() {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  }

  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="glass p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest gradient-text">
          Calendar
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-display text-xs text-muted min-w-[100px] text-center">{monthLabel}</span>
          <button onClick={nextMonth} className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[0.6rem] text-muted font-display uppercase">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, i) => {
          if (!cell.date || !cell.key) {
            return <div key={i} className="aspect-square" />;
          }
          const act = activity[cell.key];
          const xp = act?.xp || 0;
          const isToday = cell.key === today;
          const completed = (act?.tasks || 0) > 0;
          const goalReached = xp >= goal;
          const isFuture = cell.date > new Date();

          return (
            <div
              key={i}
              className={`aspect-square rounded-md flex flex-col items-center justify-center relative transition-all hover:scale-110 cursor-pointer ${
                isToday ? 'ring-1 ring-cyber-cyan' : ''
              }`}
              style={{
                background: goalReached
                  ? 'rgba(0,255,157,0.15)'
                  : completed
                  ? 'rgba(0,240,255,0.1)'
                  : isFuture
                  ? 'transparent'
                  : 'rgba(26,35,64,0.4)',
                border: goalReached ? '1px solid rgba(0,255,157,0.4)' : '1px solid transparent',
              }}
              title={`${cell.key} — XP: ${xp}, Tasks: ${act?.tasks || 0}`}
            >
              <span className={`text-[0.7rem] font-display ${isToday ? 'text-cyber-cyan font-bold' : 'text-muted'}`}>
                {cell.date.getDate()}
              </span>
              {goalReached && <Check className="w-2.5 h-2.5 text-cyber-green absolute bottom-0.5" />}
              {completed && !goalReached && <Flame className="w-2.5 h-2.5 text-cyber-cyan absolute bottom-0.5" />}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3 text-[0.6rem] text-muted">
        <span className="flex items-center gap-1">
          <Check className="w-2.5 h-2.5 text-cyber-green" /> Goal
        </span>
        <span className="flex items-center gap-1">
          <Flame className="w-2.5 h-2.5 text-cyber-cyan" /> Active
        </span>
        <span className="flex items-center gap-1">
          <Target className="w-2.5 h-2.5 text-muted" /> Today
        </span>
      </div>
    </div>
  );
}
