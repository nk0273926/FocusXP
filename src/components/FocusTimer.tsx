import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Coffee, Brain, Settings2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { playCompleteSound, playLevelUpSound } from '../utils/helpers';
import { formatTime } from '../utils/dates';

type Mode = 'focus' | 'short-break' | 'long-break';

const DURATIONS: Record<Mode, number> = {
  'focus': 25 * 60,
  'short-break': 5 * 60,
  'long-break': 15 * 60,
};

const MODE_LABELS: Record<Mode, string> = {
  'focus': 'Focus',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
};

const MODE_COLORS: Record<Mode, string> = {
  'focus': '#00f0ff',
  'short-break': '#00ff9d',
  'long-break': '#7c5cff',
};

const XP_PER_SESSION = 30;

export function FocusTimer() {
  const addFocusSession = useGameStore((s) => s.addFocusSession);
  const soundEnabled = useGameStore((s) => s.settings.soundEnabled);
  const focusSessions = useGameStore((s) => s.focusSessions);

  const [mode, setMode] = useState<Mode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS['focus']);
  const [running, setRunning] = useState(false);
  const [custom, setCustom] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [showComplete, setShowComplete] = useState(false);
  const intervalRef = useRef<number>(0);

  const totalDuration = mode === 'focus' && custom ? customMinutes * 60 : DURATIONS[mode];
  const progress = ((totalDuration - secondsLeft) / totalDuration) * 100;
  const color = MODE_COLORS[mode];

  const handleComplete = useCallback(() => {
    setRunning(false);
    if (mode === 'focus') {
      const minutes = custom ? customMinutes : 25;
      addFocusSession(minutes, XP_PER_SESSION);
      if (soundEnabled) {
        playCompleteSound();
        setTimeout(playLevelUpSound, 300);
      }
      setShowComplete(true);
      setTimeout(() => setShowComplete(false), 3000);
    }
  }, [mode, custom, customMinutes, addFocusSession, soundEnabled]);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            handleComplete();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, handleComplete]);

  function switchMode(m: Mode) {
    setMode(m);
    setRunning(false);
    setSecondsLeft(DURATIONS[m]);
    setCustom(false);
  }

  function toggleCustom() {
    setCustom(!custom);
    setRunning(false);
    if (!custom) {
      setSecondsLeft(customMinutes * 60);
    } else {
      setSecondsLeft(DURATIONS['focus']);
    }
  }

  function reset() {
    setRunning(false);
    setSecondsLeft(custom && mode === 'focus' ? customMinutes * 60 : DURATIONS[mode]);
  }

  function skipBreak() {
    if (mode !== 'focus') {
      switchMode('focus');
    }
  }

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="glass p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest gradient-text">
          Focus Timer
        </h2>
        <span className="text-[0.65rem] text-muted font-display uppercase tracking-wider">
          Sessions: {focusSessions}
        </span>
      </div>

      {/* Mode tabs */}
      <div className="flex items-center gap-1 mb-4 p-1 rounded-lg" style={{ background: 'rgba(5,6,10,0.4)' }}>
        {(['focus', 'short-break', 'long-break'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[0.65rem] font-display uppercase tracking-wider transition-all ${
              mode === m && !custom
                ? 'text-white'
                : 'text-muted hover:text-cyber-cyan'
            }`}
            style={mode === m && !custom ? { background: `${MODE_COLORS[m]}20`, color: MODE_COLORS[m] } : {}}
          >
            {m === 'focus' ? <Brain className="w-3 h-3" /> : <Coffee className="w-3 h-3" />}
            {MODE_LABELS[m]}
          </button>
        ))}
        <button
          onClick={toggleCustom}
          className={`px-2 py-1.5 rounded-md transition-all ${custom ? 'text-cyber-cyan' : 'text-muted hover:text-cyber-cyan'}`}
          title="Custom duration"
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Custom input */}
      {custom && mode === 'focus' && (
        <div className="flex items-center gap-2 mb-4">
          <label className="label !mb-0 whitespace-nowrap">Custom (min):</label>
          <input
            type="range"
            min={5}
            max={90}
            value={customMinutes}
            onChange={(e) => {
              const m = Number(e.target.value);
              setCustomMinutes(m);
              setSecondsLeft(m * 60);
              setRunning(false);
            }}
            className="flex-1"
          />
          <span className="font-display text-sm text-cyber-cyan w-10 text-right">{customMinutes}m</span>
        </div>
      )}

      {/* Timer circle */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-[260px] h-[260px]">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
            <circle
              cx="130"
              cy="130"
              r={radius}
              fill="none"
              stroke="rgba(26,35,64,0.8)"
              strokeWidth="8"
            />
            <circle
              cx="130"
              cy="130"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 1s linear',
                filter: `drop-shadow(0 0 8px ${color}80)`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-display text-4xl md:text-5xl font-bold" style={{ color }}>
              {formatTime(secondsLeft)}
            </div>
            <div className="text-[0.65rem] text-muted uppercase tracking-widest mt-2">
              {MODE_LABELS[mode]}
            </div>
          </div>
          {showComplete && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full animate-fade-in">
              <div className="text-center">
                <div className="text-3xl mb-1">🎉</div>
                <div className="font-display text-sm font-bold text-cyber-green">Session Complete!</div>
                <div className="text-xs text-cyber-cyan mt-1">+{XP_PER_SESSION} XP earned</div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {!running ? (
            <button onClick={() => setRunning(true)} className="btn btn-primary">
              <Play className="w-4 h-4" /> Start
            </button>
          ) : (
            <button onClick={() => setRunning(false)} className="btn btn-primary">
              <Pause className="w-4 h-4" /> Pause
            </button>
          )}
          <button onClick={reset} className="btn btn-ghost">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          {mode !== 'focus' && (
            <button onClick={skipBreak} className="btn btn-ghost">
              <SkipForward className="w-4 h-4" /> Skip Break
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
