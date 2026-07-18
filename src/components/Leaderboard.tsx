import { Trophy, Flame, TreePine } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { calculateEcoImpact } from '../utils/content';

const PLACEHOLDERS = [
  { name: 'NeonNinja', xp: 4200, streak: 42, trees: 180, avatar: '🥷' },
  { name: 'CyberFox', xp: 3800, streak: 35, trees: 150, avatar: '🦊' },
  { name: 'QuantumQuokka', xp: 3100, streak: 28, trees: 120, avatar: '🦿' },
  { name: 'VoidWalker', xp: 2700, streak: 21, trees: 95, avatar: '👁️' },
  { name: 'PixelPirate', xp: 2200, streak: 18, trees: 78, avatar: '🏴‍☠️' },
  { name: 'DataDragon', xp: 1800, streak: 14, trees: 60, avatar: '🐉' },
  { name: 'GlitchGoblin', xp: 1500, streak: 11, trees: 45, avatar: '👾' },
  { name: 'BinaryBard', xp: 1200, streak: 8, trees: 32, avatar: '🎵' },
];

export function Leaderboard() {
  const totalXP = useGameStore((s) => s.totalXP);
  const longestStreak = useGameStore((s) => s.longestStreak);
  const tasks = useGameStore((s) => s.tasks);
  const totalFocusTime = useGameStore((s) => s.totalFocusTime);
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const eco = calculateEcoImpact(completedCount, totalFocusTime);

  const you = {
    name: 'You',
    xp: totalXP,
    streak: longestStreak,
    trees: Math.round(eco.trees),
    avatar: '🦾',
  };

  const byXP = [...PLACEHOLDERS, you].sort((a, b) => b.xp - a.xp);
  const byStreak = [...PLACEHOLDERS, you].sort((a, b) => b.streak - a.streak);
  const byTrees = [...PLACEHOLDERS, you].sort((a, b) => b.trees - a.trees);

  return (
    <div className="glass p-4 md:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4 text-cyber-amber" />
        <h2 className="font-display text-sm font-bold uppercase tracking-widest gradient-text">
          Leaderboard
        </h2>
        <span className="text-[0.6rem] text-muted ml-auto">Placeholder • Future Firebase</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LeaderboardColumn
          title="Top XP"
          icon={Trophy}
          color="#ffb800"
          data={byXP}
          getValue={(e) => `${e.xp} XP`}
        />
        <LeaderboardColumn
          title="Longest Streak"
          icon={Flame}
          color="#ff2d95"
          data={byStreak}
          getValue={(e) => `${e.streak} days`}
        />
        <LeaderboardColumn
          title="Most Trees"
          icon={TreePine}
          color="#00ff9d"
          data={byTrees}
          getValue={(e) => `${e.trees} trees`}
        />
      </div>
    </div>
  );
}

function LeaderboardColumn({
  title,
  icon: Icon,
  color,
  data,
  getValue,
}: {
  title: string;
  icon: any;
  color: string;
  data: { name: string; xp: number; streak: number; trees: number; avatar: string }[];
  getValue: (e: any) => string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-[0.65rem] font-display uppercase tracking-wider" style={{ color }}>
          {title}
        </span>
      </div>
      <div className="space-y-1">
        {data.slice(0, 5).map((entry, i) => {
          const isYou = entry.name === 'You';
          return (
            <div
              key={`${entry.name}-${i}`}
              className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                isYou ? 'neon-border' : 'glass'
              }`}
              style={isYou ? {} : { background: 'rgba(26,35,64,0.3)' }}
            >
              <span
                className={`font-display text-xs w-5 text-center ${
                  i === 0 ? 'text-cyber-amber' : i === 1 ? 'text-muted' : i === 2 ? 'text-cyber-amber/60' : 'text-muted'
                }`}
              >
                {i + 1}
              </span>
              <span className="text-lg">{entry.avatar}</span>
              <span className={`text-xs flex-1 truncate ${isYou ? 'text-cyber-cyan font-bold' : 'text-muted'}`}>
                {entry.name}
              </span>
              <span className="text-xs font-display" style={{ color }}>
                {getValue(entry)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
