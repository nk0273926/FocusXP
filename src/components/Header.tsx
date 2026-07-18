import { useEffect, useState } from 'react';
import { Zap, Bell, Search, Sun, Moon, Activity } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getLevelInfo, getRankColor } from '../utils/levels';
import { useAnimatedNumber } from '../utils/hooks';
import { formatDate } from '../utils/dates';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenCommand: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function Header({ onOpenNotifications, onOpenSettings, onOpenCommand, searchQuery }: HeaderProps) {
  const totalXP = useGameStore((s) => s.totalXP);
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const notifications = useGameStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const levelInfo = getLevelInfo(totalXP);
  const animatedXP = useAnimatedNumber(totalXP, 600);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const rankColor = getRankColor(levelInfo.level);

  return (
    <header className="glass sticky top-0 z-40 px-4 py-3 md:px-6">
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-9 h-9 rounded-lg flex items-center justify-center gradient-cyber animate-pulse-glow">
            <Zap className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display text-lg font-bold gradient-text leading-none">FocusXP</h1>
            <p className="text-[0.6rem] text-muted uppercase tracking-widest">Gamified Focus</p>
          </div>
        </div>

        {/* Level badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="relative w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm border-2"
            style={{ borderColor: rankColor, color: rankColor, boxShadow: `0 0 15px ${rankColor}40` }}
          >
            {levelInfo.level}
          </div>
          <div className="hidden md:block">
            <div className="font-display text-xs font-bold" style={{ color: rankColor }}>
              {levelInfo.rank}
            </div>
            <div className="text-[0.65rem] text-muted">Level {levelInfo.level}</div>
          </div>
        </div>

        {/* XP display */}
        <div className="hidden lg:flex flex-col gap-0.5 shrink-0 min-w-[140px]">
          <div className="flex items-center justify-between text-[0.65rem]">
            <span className="text-muted uppercase tracking-wider">Total XP</span>
            <span className="text-muted">{Math.round(animatedXP)}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(26,35,64,0.8)' }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${levelInfo.progress}%`,
                background: `linear-gradient(90deg, ${rankColor}, hsl(${levelInfo.level < 5 ? 180 : 150}, 100%, 60%))`,
                boxShadow: `0 0 10px ${rankColor}80`,
              }}
            />
          </div>
          <div className="text-[0.6rem] text-muted">
            {levelInfo.xpIntoLevel} / {levelInfo.xpForNext || 'MAX'} XP
          </div>
        </div>

        {/* Date & live status */}
        <div className="hidden xl:flex flex-col shrink-0">
          <div className="text-xs text-muted">{formatDate(time)}</div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green" />
            </span>
            <span className="text-[0.65rem] text-cyber-green font-display uppercase tracking-wider">
              Live
            </span>
            <span className="text-[0.65rem] text-muted ml-1">
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[150px] max-w-xs ml-auto">
          <button
            onClick={onOpenCommand}
            className="input flex items-center gap-2 text-left text-muted hover:border-cyber-cyan/40 transition-colors group"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span className="text-xs flex-1 truncate">
              {searchQuery || 'Search or run command...'}
            </span>
            <kbd className="hidden sm:inline text-[0.6rem] px-1.5 py-0.5 rounded border border-cyber-border text-muted">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            className="w-9 h-9 rounded-lg glass glass-hover flex items-center justify-center text-muted hover:text-cyber-cyan transition-colors"
            title="Toggle theme"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-lg glass glass-hover flex items-center justify-center text-muted hover:text-cyber-cyan transition-colors"
            title="Settings"
          >
            <Activity className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 rounded-lg glass glass-hover flex items-center justify-center text-muted hover:text-cyber-cyan transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-cyber-pink text-white text-[0.6rem] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
