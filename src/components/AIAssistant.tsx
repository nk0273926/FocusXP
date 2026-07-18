import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getLevelInfo } from '../utils/levels';
import { useGameStats } from '../utils/hooks';
import { getDailyQuote } from '../utils/content';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: "Hey! I'm your AI productivity assistant. Ask me for tips, stats, or motivation!",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  const totalXP = useGameStore((s) => s.totalXP);
  const currentStreak = useGameStore((s) => s.currentStreak);
  const tasks = useGameStore((s) => s.tasks);
  const goal = useGameStore((s) => s.settings.dailyXPGoal);
  const { todayActivity, completedCount, eco } = useGameStats();
  const levelInfo = getLevelInfo(totalXP);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function generateResponse(question: string): string {
    const q = question.toLowerCase();
    if (q.includes('level') || q.includes('rank')) {
      return `You're at level ${levelInfo.level} (${levelInfo.rank}). You need ${levelInfo.xpForNext - levelInfo.xpIntoLevel} more XP to level up. Keep going!`;
    }
    if (q.includes('streak')) {
      return currentStreak > 0
        ? `You're on a ${currentStreak}-day streak! Stay consistent to reach ${currentStreak + 1} days.`
        : `No active streak yet. Complete a task today to start one!`;
    }
    if (q.includes('task')) {
      return `You have ${completedCount} completed tasks out of ${tasks.length} total. That's a ${tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}% completion rate.`;
    }
    if (q.includes('eco') || q.includes('tree')) {
      return `Your eco impact: ${eco.trees.toFixed(1)} trees saved, ${eco.water.toFixed(1)}L water saved, ${eco.co2.toFixed(2)}kg CO₂ reduced. Amazing!`;
    }
    if (q.includes('goal') || q.includes('today')) {
      const remaining = Math.max(0, goal - todayActivity.xp);
      return remaining > 0
        ? `Today: ${todayActivity.xp}/${goal} XP. Just ${remaining} XP left to hit your daily goal!`
        : `Daily goal smashed! You earned ${todayActivity.xp} XP today. Legendary!`;
    }
    if (q.includes('tip') || q.includes('advice') || q.includes('help')) {
      const tips = [
        'Break large tasks into smaller ones for steady XP gains.',
        'Use the Pomodoro timer for focused work sessions.',
        'High-priority tasks give 50 XP — tackle them first!',
        'Maintain your daily streak for bonus motivation.',
        'Review your heatmap to find your most productive days.',
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }
    if (q.includes('motivat') || q.includes('quote')) {
      return `"${getDailyQuote()}"`;
    }
    return `I can help with your level, streak, tasks, eco impact, daily goal, tips, or motivation. Try asking about any of those!`;
  }

  function send() {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, text: input };
    setMessages((m) => [...m, userMsg]);
    const response = generateResponse(input);
    setInput('');
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'ai', text: response }]);
    }, 400);
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full gradient-cyber flex items-center justify-center animate-pulse-glow transition-transform hover:scale-110"
          title="AI Assistant"
        >
          <Bot className="w-6 h-6 text-black" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-4 right-4 z-40 w-[320px] max-w-[calc(100vw-2rem)] glass animate-slide-up flex flex-col" style={{ maxHeight: '400px' }}>
          <div className="flex items-center justify-between p-3 border-b border-cyber-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-cyber flex items-center justify-center">
                <Bot className="w-4 h-4 text-black" />
              </div>
              <span className="font-display text-xs font-bold gradient-text">AI Assistant</span>
              <Sparkles className="w-3 h-3 text-cyber-amber" />
            </div>
            <button onClick={() => setOpen(false)} className="text-muted hover:text-cyber-cyan transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-xs ${
                    m.role === 'user'
                      ? 'bg-cyber-cyan/15 border border-cyber-cyan/30 text-cyber-cyan'
                      : 'glass text-muted'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-cyber-border flex gap-2">
            <input
              className="input flex-1 text-xs"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button onClick={send} className="btn btn-primary !px-2.5">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
