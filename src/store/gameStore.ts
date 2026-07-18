import { create } from 'zustand';
import type {
  Task,
  Notification,
  Achievement,
  GameState,
  Settings,
  Profile,
} from '../types';
import { todayKey, dateKey, addDays } from '../utils/dates';

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-task',
    name: 'First Task',
    description: 'Complete your first task.',
    category: 'productivity',
    icon: '✅',
    threshold: 1,
    metric: 'totalTasks',
    unlocked: false,
    unlockedAt: null,
    progress: 0,
  },
  {
    id: 'novice-learner',
    name: 'Novice Learner',
    description: 'Earn 100 XP.',
    category: 'productivity',
    icon: '🎓',
    threshold: 100,
    metric: 'totalXP',
    unlocked: false,
    unlockedAt: null,
    progress: 0,
  },
  {
    id: 'streak-starter',
    name: 'Streak Starter',
    description: 'Reach a 3 day streak.',
    category: 'streak',
    icon: '🔥',
    threshold: 3,
    metric: 'currentStreak',
    unlocked: false,
    unlockedAt: null,
    progress: 0,
  },
  {
    id: 'eco-warrior',
    name: 'Eco Warrior',
    description: 'Save 5 trees worth of eco impact.',
    category: 'eco',
    icon: '🌳',
    threshold: 5,
    metric: 'treesSaved',
    unlocked: false,
    unlockedAt: null,
    progress: 0,
  },
  {
    id: 'level-up',
    name: 'Level Up',
    description: 'Reach level 5.',
    category: 'special',
    icon: '🏆',
    threshold: 5,
    metric: 'level',
    unlocked: false,
    unlockedAt: null,
    progress: 0,
  },
];
import { uid } from '../utils/helpers';
import { getLevelInfo } from '../utils/levels';
import { calculateEcoImpact } from '../utils/content';
import { loadFromSupabase, saveToSupabase } from '../lib/db';

const STORAGE_KEY = 'focusxp_state_v1';

function defaultState(): GameState {
  return {
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    tasks: [],
    activity: {},
    achievements: ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: false,
      unlockedAt: null,
      progress: 0,
    })),
    notifications: [],
    settings: {
      dailyXPGoal: 100,
      theme: 'dark',
      animationSpeed: 'normal',
      soundEnabled: true,
      notificationsEnabled: true,
    },
    profile: {
      username: 'Operator',
      avatar: '🦾',
    },
    focusSessions: 0,
    totalFocusTime: 0,
    createdAt: new Date().toISOString(),
  };
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<GameState>;
    const base = defaultState();
    const merged: GameState = {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...parsed.settings },
      profile: { ...base.profile, ...parsed.profile },
      activity: parsed.activity || {},
      tasks: parsed.tasks || [],
      achievements: base.achievements.map((a) => {
        const saved = parsed.achievements?.find((s) => s.id === a.id);
        return saved ? { ...a, ...saved } : a;
      }),
      notifications: parsed.notifications || [],
    };
    return merged;
  } catch {
    return defaultState();
  }
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable
  }
}

// Debounced Supabase sync — coalesces rapid updates into one network call
let syncTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSync(state: GameState) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    saveToSupabase(state).catch(() => {});
  }, 2000);
}

interface GameStore extends GameState {
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'status'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  undoCompleteTask: (id: string) => void;
  addFocusSession: (minutes: number, xp: number) => void;
  markNotificationsRead: () => void;
  clearNotifications: () => void;
  updateSettings: (updates: Partial<Settings>) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  resetProgress: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  checkAchievements: () => Achievement[];
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  syncWithSupabase: () => Promise<void>;
  _updateStreak: () => void;
  _addXP: (amount: number) => { leveledUp: boolean; newLevel: number };
  _recordActivity: (xp: number, tasks: number, focusTime: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => {
  function applyState(state: GameState) {
    saveState(state);
    scheduleSync(state);
    return state;
  }

  function addXPInternal(state: GameState, amount: number): GameState & { _leveledUp: boolean; _newLevel: number } {
    const newTotal = state.totalXP + amount;
    const oldLevel = getLevelInfo(state.totalXP).level;
    const newLevel = getLevelInfo(newTotal).level;
    return {
      ...state,
      totalXP: newTotal,
      level: newLevel,
      _leveledUp: newLevel > oldLevel,
      _newLevel: newLevel,
    };
  }

  return {
    ...loadState(),

    syncWithSupabase: async () => {
      const remote = await loadFromSupabase();
      if (!remote) return;
      const base = get();
      const merged: GameState = {
        ...base,
        ...remote,
        settings: { ...base.settings, ...remote.settings },
        profile: { ...base.profile, ...remote.profile },
        activity: { ...base.activity, ...remote.activity },
        tasks: remote.tasks && remote.tasks.length > 0 ? remote.tasks : base.tasks,
        achievements:
          remote.achievements && remote.achievements.length > 0
            ? base.achievements.map((a) => {
                const r = remote.achievements!.find((s) => s.id === a.id);
                return r ? { ...a, ...r } : a;
              })
            : base.achievements,
        notifications:
          remote.notifications && remote.notifications.length > 0
            ? remote.notifications
            : base.notifications,
      };
      saveState(merged);
      set(merged);
    },

    addTask: (task) => {
      const newTask: Task = {
        ...task,
        id: uid(),
        status: 'todo',
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      set((s) => applyState({ ...s, tasks: [newTask, ...s.tasks] }));
    },

    updateTask: (id, updates) => {
      set((s) => applyState({
        ...s,
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }));
    },

    deleteTask: (id) => {
      set((s) => applyState({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
    },

    completeTask: (id) => {
      const state = get();
      const task = state.tasks.find((t) => t.id === id);
      if (!task || task.status === 'completed') return;

      get()._updateStreak();
      const today = todayKey();
      const todayActivity = state.activity[today] || { date: today, xp: 0, tasks: 0, focusTime: 0 };

      const updated = addXPInternal(
        {
          ...state,
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, status: 'completed', completedAt: new Date().toISOString() }
              : t
          ),
          activity: {
            ...state.activity,
            [today]: {
              ...todayActivity,
              xp: todayActivity.xp + task.xpReward,
              tasks: todayActivity.tasks + 1,
            },
          },
        },
        task.xpReward
      );

      const { _leveledUp, _newLevel, ...rest } = updated;
      const finalState = { ...rest, _leveledUp: undefined, _newLevel: undefined } as GameState;
      set(applyState(finalState));

      get().addNotification({
        type: 'task-completed',
        title: 'Task Completed',
        message: `"${task.title}" earned ${task.xpReward} XP`,
      });

      if (_leveledUp) {
        get().addNotification({
          type: 'level-up',
          title: 'Level Up!',
          message: `You reached level ${_newLevel}!`,
        });
      }

      get().checkAchievements();
    },

    undoCompleteTask: (id) => {
      const state = get();
      const task = state.tasks.find((t) => t.id === id);
      if (!task || task.status !== 'completed') return;

      const completedDate = task.completedAt
        ? task.completedAt.slice(0, 10)
        : todayKey();
      const dayActivity = state.activity[completedDate];
      const newXP = Math.max(0, (dayActivity?.xp || 0) - task.xpReward);
      const newTasks = Math.max(0, (dayActivity?.tasks || 0) - 1);

      set((s) =>
        applyState({
          ...s,
          totalXP: Math.max(0, s.totalXP - task.xpReward),
          level: getLevelInfo(Math.max(0, s.totalXP - task.xpReward)).level,
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, status: 'todo', completedAt: null }
              : t
          ),
          activity: {
            ...s.activity,
            [completedDate]: {
              ...dayActivity,
              xp: newXP,
              tasks: newTasks,
            },
          },
        })
      );
    },

    addFocusSession: (minutes, xp) => {
      const state = get();
      get()._updateStreak();
      const today = todayKey();
      const todayActivity = state.activity[today] || { date: today, xp: 0, tasks: 0, focusTime: 0 };

      const updated = addXPInternal(
        {
          ...state,
          focusSessions: state.focusSessions + 1,
          totalFocusTime: state.totalFocusTime + minutes,
          activity: {
            ...state.activity,
            [today]: {
              ...todayActivity,
              xp: todayActivity.xp + xp,
              focusTime: todayActivity.focusTime + minutes,
            },
          },
        },
        xp
      );

      const { _leveledUp, _newLevel, ...rest } = updated;
      set(applyState({ ...rest, _leveledUp: undefined, _newLevel: undefined } as GameState));

      get().addNotification({
        type: 'task-completed',
        title: 'Focus Session Complete',
        message: `${minutes} minutes of focus earned ${xp} XP`,
      });

      if (_leveledUp) {
        get().addNotification({
          type: 'level-up',
          title: 'Level Up!',
          message: `You reached level ${_newLevel}!`,
        });
      }

      get().checkAchievements();
    },

    markNotificationsRead: () => {
      set((s) => applyState({
        ...s,
        notifications: s.notifications.map((n) => ({ ...n, read: true })),
      }));
    },

    clearNotifications: () => {
      set((s) => applyState({ ...s, notifications: [] }));
    },

    updateSettings: (updates) => {
      set((s) => applyState({ ...s, settings: { ...s.settings, ...updates } }));
    },

    updateProfile: (updates) => {
      set((s) => applyState({ ...s, profile: { ...s.profile, ...updates } }));
    },

    resetProgress: () => {
      const fresh = defaultState();
      set(applyState(fresh));
    },

    exportData: () => {
      const state = get();
      const exportObj = {
        ...state,
        exportedAt: new Date().toISOString(),
        version: 1,
      };
      return JSON.stringify(exportObj, null, 2);
    },

    importData: (json) => {
      try {
        const parsed = JSON.parse(json) as Partial<GameState>;
        const base = defaultState();
        const merged: GameState = {
          ...base,
          ...parsed,
          settings: { ...base.settings, ...parsed.settings },
          profile: { ...base.profile, ...parsed.profile },
          activity: parsed.activity || {},
          tasks: parsed.tasks || [],
          achievements: base.achievements.map((a) => {
            const saved = parsed.achievements?.find((s) => s.id === a.id);
            return saved ? { ...a, ...saved } : a;
          }),
          notifications: parsed.notifications || [],
        };
        set(applyState(merged));
        return true;
      } catch {
        return false;
      }
    },

    checkAchievements: () => {
      const state = get();
      const completedTasks = state.tasks.filter((t) => t.status === 'completed');
      const eco = calculateEcoImpact(completedTasks.length, state.totalFocusTime);
      const levelInfo = getLevelInfo(state.totalXP);

      const metrics: Record<string, number> = {
        totalTasks: completedTasks.length,
        totalXP: state.totalXP,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        treesSaved: eco.trees,
        level: levelInfo.level,
      };

      const newlyUnlocked: Achievement[] = [];
      const updatedAchievements = state.achievements.map((a) => {
        const value = metrics[a.metric] || 0;
        const progress = Math.min((value / a.threshold) * 100, 100);
        const shouldUnlock = value >= a.threshold && !a.unlocked;
        if (shouldUnlock) {
          const unlocked = { ...a, unlocked: true, unlockedAt: new Date().toISOString(), progress: 100 };
          newlyUnlocked.push(unlocked);
          return unlocked;
        }
        return { ...a, progress };
      });

      if (newlyUnlocked.length > 0) {
        set((s) => applyState({ ...s, achievements: updatedAchievements }));
        newlyUnlocked.forEach((a) => {
          get().addNotification({
            type: 'achievement',
            title: 'Achievement Unlocked',
            message: `${a.icon} ${a.name} — ${a.description}`,
          });
        });
      } else {
        set((s) => applyState({ ...s, achievements: updatedAchievements }));
      }

      return newlyUnlocked;
    },

    addNotification: (n) => {
      const state = get();
      if (!state.settings.notificationsEnabled) return;
      const notification: Notification = {
        ...n,
        id: uid(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      set((s) =>
        applyState({
          ...s,
          notifications: [notification, ...s.notifications].slice(0, 50),
        })
      );
    },

    _updateStreak: () => {
      const state = get();
      const today = todayKey();
      if (state.lastActiveDate === today) return;

      const yesterday = dateKey(addDays(new Date(), -1));
      let newStreak = 1;
      if (state.lastActiveDate === yesterday) {
        newStreak = state.currentStreak + 1;
      }

      set((s) =>
        applyState({
          ...s,
          currentStreak: newStreak,
          longestStreak: Math.max(s.longestStreak, newStreak),
          lastActiveDate: today,
        })
      );
    },

    _addXP: (amount) => {
      const state = get();
      const updated = addXPInternal(state, amount);
      const { _leveledUp, _newLevel, ...rest } = updated;
      set(applyState({ ...rest, _leveledUp: undefined, _newLevel: undefined } as GameState));
      return { leveledUp: _leveledUp, newLevel: _newLevel };
    },

    _recordActivity: (xp, tasks, focusTime) => {
      const today = todayKey();
      set((s) => {
        const existing = s.activity[today] || { date: today, xp: 0, tasks: 0, focusTime: 0 };
        return applyState({
          ...s,
          activity: {
            ...s.activity,
            [today]: {
              ...existing,
              xp: existing.xp + xp,
              tasks: existing.tasks + tasks,
              focusTime: existing.focusTime + focusTime,
            },
          },
        });
      });
    },
  };
});
