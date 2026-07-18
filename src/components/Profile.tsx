import { useState } from 'react';
import { Pencil, Award, Zap, Flame, Target } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getLevelInfo, getRankColor } from '../utils/levels';
import { useGameStats } from '../utils/hooks';

const AVATARS = ['🦾', '🚀', '⚡', '🌟', '🔥', '🧠', '🦿', '👁️', '🎮', '💎'];

export function ProfileCard() {
  const profile = useGameStore((s) => s.profile);
  const updateProfile = useGameStore((s) => s.updateProfile);
  const totalXP = useGameStore((s) => s.totalXP);
  const tasks = useGameStore((s) => s.tasks);
  const levelInfo = getLevelInfo(totalXP);
  const rankColor = getRankColor(levelInfo.level);
  const { completedCount, currentStreak } = useGameStats();

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile.username);
  const [avatar, setAvatar] = useState(profile.avatar);

  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  function save() {
    updateProfile({ username: username.trim() || 'Operator', avatar });
    setEditing(false);
  }

  return (
    <div className="glass p-4 md:p-5 relative overflow-hidden">
      <div
        className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-10 blur-3xl"
        style={{ background: rankColor }}
      />
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest gradient-text">
          Profile
        </h2>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button onClick={save} className="btn btn-primary !px-2 !py-1 text-[0.65rem]">
            Save
          </button>
        )}
      </div>

      <div className="flex flex-col items-center text-center">
        {editing ? (
          <div className="grid grid-cols-5 gap-2 mb-3">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                  avatar === a ? 'ring-2 ring-cyber-cyan scale-110' : 'hover:scale-105'
                }`}
                style={{ background: 'rgba(26,35,64,0.6)' }}
              >
                {a}
              </button>
            ))}
          </div>
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 border-2 animate-pulse-glow"
            style={{ borderColor: rankColor, background: `${rankColor}10` }}
          >
            {profile.avatar}
          </div>
        )}

        {editing ? (
          <input
            className="input text-center max-w-[180px] mb-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
          />
        ) : (
          <h3 className="font-display text-lg font-bold" style={{ color: rankColor }}>
            {profile.username}
          </h3>
        )}

        <div className="flex items-center gap-2 mt-1">
          <span className="chip" style={{ borderColor: `${rankColor}40`, background: `${rankColor}10`, color: rankColor }}>
            <Award className="w-3 h-3" />
            {levelInfo.rank}
          </span>
          <span className="chip chip-cyan">Lvl {levelInfo.level}</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="glass p-2 text-center">
          <Zap className="w-3.5 h-3.5 mx-auto text-cyber-cyan mb-1" />
          <div className="font-display text-sm font-bold text-cyber-cyan">{totalXP}</div>
          <div className="text-[0.55rem] text-muted uppercase">Total XP</div>
        </div>
        <div className="glass p-2 text-center">
          <Flame className="w-3.5 h-3.5 mx-auto text-cyber-amber mb-1" />
          <div className="font-display text-sm font-bold text-cyber-amber">{currentStreak}</div>
          <div className="text-[0.55rem] text-muted uppercase">Streak</div>
        </div>
        <div className="glass p-2 text-center">
          <Target className="w-3.5 h-3.5 mx-auto text-cyber-green mb-1" />
          <div className="font-display text-sm font-bold text-cyber-green">{completionRate}%</div>
          <div className="text-[0.55rem] text-muted uppercase">Done</div>
        </div>
      </div>
    </div>
  );
}
