import { Bell, Check, Trash2, X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { relativeTime } from '../utils/dates';

const TYPE_COLORS: Record<string, string> = {
  'level-up': '#ff2d95',
  'task-completed': '#00ff9d',
  'goal-completed': '#00f0ff',
  'achievement': '#ffb800',
  'reminder': '#7c5cff',
};

const TYPE_ICONS: Record<string, string> = {
  'level-up': '⬆',
  'task-completed': '✓',
  'goal-completed': '🎯',
  'achievement': '🏆',
  'reminder': '🔔',
};

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const notifications = useGameStore((s) => s.notifications);
  const markRead = useGameStore((s) => s.markNotificationsRead);
  const clearAll = useGameStore((s) => s.clearNotifications);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="glass relative w-full max-w-sm h-full overflow-y-auto scrollbar-thin p-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ borderRadius: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyber-cyan" />
            <h2 className="font-display text-sm font-bold uppercase tracking-widest gradient-text">
              Notifications
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <>
                <button onClick={markRead} className="btn btn-ghost !px-2 !py-1 text-[0.65rem]" title="Mark all read">
                  <Check className="w-3 h-3" />
                </button>
                <button onClick={clearAll} className="btn btn-ghost !px-2 !py-1 text-[0.65rem]" title="Clear all">
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
            <button onClick={onClose} className="btn btn-ghost !px-2 !py-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12 text-muted text-sm">
            <Bell className="w-8 h-8 mx-auto mb-3 opacity-30" />
            No notifications yet
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const color = TYPE_COLORS[n.type] || '#7a8aab';
              const icon = TYPE_ICONS[n.type] || '🔔';
              return (
                <div
                  key={n.id}
                  className={`glass p-3 flex items-start gap-3 transition-all hover:border-cyber-cyan/30 ${
                    n.read ? 'opacity-60' : ''
                  }`}
                  style={{ borderLeft: `3px solid ${color}` }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm"
                    style={{ background: `${color}15`, border: `1px solid ${color}40` }}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-xs font-bold" style={{ color }}>
                      {n.title}
                    </div>
                    <div className="text-xs text-muted mt-0.5">{n.message}</div>
                    <div className="text-[0.6rem] text-muted mt-1">{relativeTime(n.timestamp)}</div>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-cyber-cyan shrink-0 mt-2" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
