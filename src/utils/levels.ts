import type { LevelInfo } from '../types';

export const LEVELS = [
  { level: 1, minXp: 0, name: 'Beginner' },
  { level: 2, minXp: 50, name: 'Beginner' },
  { level: 3, minXp: 120, name: 'Explorer' },
  { level: 4, minXp: 250, name: 'Explorer' },
  { level: 5, minXp: 400, name: 'Achiever' },
  { level: 6, minXp: 650, name: 'Achiever' },
  { level: 7, minXp: 1000, name: 'Achiever' },
  { level: 8, minXp: 1500, name: 'Focus Master' },
  { level: 9, minXp: 2200, name: 'Focus Master' },
  { level: 10, minXp: 3100, name: 'Legend' },
  { level: 11, minXp: 4200, name: 'Legend' },
  { level: 12, minXp: 5500, name: 'Legend' },
];

export const RANKS = [
  { name: 'Beginner', minLevel: 1, color: '#7a8aab' },
  { name: 'Explorer', minLevel: 3, color: '#00f0ff' },
  { name: 'Achiever', minLevel: 5, color: '#00ff9d' },
  { name: 'Focus Master', minLevel: 8, color: '#ffb800' },
  { name: 'Legend', minLevel: 10, color: '#ff2d95' },
];

export function getLevelInfo(totalXP: number): LevelInfo {
  let currentLevelIndex = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (totalXP >= LEVELS[i].minXp) currentLevelIndex = i;
    else break;
  }

  const current = LEVELS[currentLevelIndex];
  const next = LEVELS[currentLevelIndex + 1];
  const currentLevelXP = current.minXp;
  const nextLevelXP = next ? next.minXp : current.minXp;
  const xpIntoLevel = totalXP - currentLevelXP;
  const xpForNext = next ? nextLevelXP - currentLevelXP : 0;
  const progress = next ? (xpIntoLevel / xpForNext) * 100 : 100;

  const rank = [...RANKS].reverse().find((r) => current.level >= r.minLevel) || RANKS[0];

  return {
    level: current.level,
    rank: rank.name,
    rankColor: rank.color,
    currentLevelXP,
    nextLevelXP,
    xpIntoLevel,
    xpForNext,
    progress: Math.min(progress, 100),
  };
}

export function getRankColor(level: number): string {
  const rank = [...RANKS].reverse().find((r) => level >= r.minLevel);
  return rank ? rank.color : '#7a8aab';
}
