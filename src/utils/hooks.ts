import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getLevelInfo } from '../utils/levels';
import { calculateEcoImpact } from '../utils/content';

export function useAnimatedNumber(target: number, duration = 800): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    const start = performance.now();
    let cancelled = false;

    function frame(now: number) {
      if (cancelled) return;
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (target - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(frame);
      else fromRef.current = target;
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return Math.round(display * 10) / 10;
}

export function useGameStats() {
  const totalXP = useGameStore((s) => s.totalXP);
  const tasks = useGameStore((s) => s.tasks);
  const activity = useGameStore((s) => s.activity);
  const currentStreak = useGameStore((s) => s.currentStreak);
  const longestStreak = useGameStore((s) => s.longestStreak);
  const totalFocusTime = useGameStore((s) => s.totalFocusTime);
  const focusSessions = useGameStore((s) => s.focusSessions);

  const levelInfo = getLevelInfo(totalXP);
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const today = new Date().toISOString().slice(0, 10);
  const todayActivity = activity[today] || { xp: 0, tasks: 0, focusTime: 0 };
  const eco = calculateEcoImpact(completedTasks.length, totalFocusTime);

  return {
    levelInfo,
    completedTasks,
    todayActivity,
    eco,
    currentStreak,
    longestStreak,
    totalFocusTime,
    focusSessions,
    totalTasks: tasks.length,
    completedCount: completedTasks.length,
  };
}
