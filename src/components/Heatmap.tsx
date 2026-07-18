import { useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { dateKey, addDays, formatShortDate } from '../utils/dates';

function getIntensity(xp: number): number {
  if (xp === 0) return 0;
  if (xp < 20) return 1;
  if (xp < 50) return 2;
  if (xp < 100) return 3;
  return 4;
}

const INTENSITY_COLORS = [
  'rgba(26,35,64,0.6)',
  'rgba(0,240,255,0.25)',
  'rgba(0,240,255,0.5)',
  'rgba(0,240,255,0.75)',
  'rgba(0,255,157,0.9)',
];

export function Heatmap() {
  const activity = useGameStore((s) => s.activity);
  const [hovered, setHovered] = useState<string | null>(null);

  // Show last 12 weeks (84 days) ending today
  const weeks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Start from the Sunday of 11 weeks ago
    const start = addDays(today, -83);
    // Adjust to start on Sunday
    const startDay = start.getDay();
    const gridStart = addDays(start, -startDay);

    const result: { date: Date; key: string }[][] = [];
    let current = gridStart;
    for (let w = 0; w < 13; w++) {
      const week: { date: Date; key: string }[] = [];
      for (let d = 0; d < 7; d++) {
        week.push({ date: current, key: dateKey(current) });
        current = addDays(current, 1);
      }
      result.push(week);
    }
    return result;
  }, []);

  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const month = week[0].date.getMonth();
      if (month !== lastMonth) {
        labels.push({ label: week[0].date.toLocaleDateString('en-US', { month: 'short' }), weekIndex: wi });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="glass p-4 md:p-5">
      <h2 className="font-display text-sm font-bold uppercase tracking-widest gradient-text mb-4">
        Productivity Heatmap
      </h2>

      <div className="overflow-x-auto scrollbar-thin">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex gap-[3px] ml-8 mb-1">
            {weeks.map((_, wi) => {
              const label = monthLabels.find((m) => m.weekIndex === wi);
              return (
                <div key={wi} className="w-[14px] text-[0.55rem] text-muted font-display">
                  {label?.label || ''}
                </div>
              );
            })}
          </div>

          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-1">
              {dayLabels.map((d, i) => (
                <div key={d} className="h-[14px] text-[0.55rem] text-muted font-display leading-[14px]">
                  {i % 2 === 1 ? d.slice(0, 3) : ''}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map(({ date, key }) => {
                    const act = activity[key];
                    const xp = act?.xp || 0;
                    const intensity = getIntensity(xp);
                    const isFuture = date > new Date();
                    const isHovered = hovered === key;
                    return (
                      <div
                        key={key}
                        className="w-[14px] h-[14px] rounded-sm transition-all duration-200 cursor-pointer hover:scale-125 hover:ring-1 hover:ring-cyber-cyan"
                        style={{
                          background: isFuture ? 'transparent' : INTENSITY_COLORS[intensity],
                          outline: isHovered ? '1px solid #00f0ff' : 'none',
                        }}
                        onMouseEnter={() => setHovered(key)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        {isHovered && (
                          <div className="absolute z-50 pointer-events-none mt-4 ml-4 glass p-2 text-xs whitespace-nowrap">
                            <div className="font-display text-cyber-cyan">{formatShortDate(date)}</div>
                            <div className="text-muted">XP: {xp}</div>
                            <div className="text-muted">Tasks: {act?.tasks || 0}</div>
                            <div className="text-muted">Focus: {act?.focusTime || 0}m</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1.5 mt-3 text-[0.6rem] text-muted">
            <span>Less</span>
            {INTENSITY_COLORS.map((c, i) => (
              <div key={i} className="w-[12px] h-[12px] rounded-sm" style={{ background: c }} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
