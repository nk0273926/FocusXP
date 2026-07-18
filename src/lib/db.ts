import { supabase } from './supabase';
import type { Task, DayActivity, Achievement, Notification, Settings, Profile, GameState } from '../types';
import { rateLimit } from '../utils/rateLimiter';

const LIMITS = {
  save: { max: 1, windowMs: 10_000 }, // 1 write per 10s
  load: { max: 5, windowMs: 60_000 }, // 5 reads per minute
};


// ── DB row types (snake_case from Postgres) ──────────────────
interface GameStateRow {
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  focus_sessions: number;
  total_focus_time: number;
}
interface TaskRow {
  id: string;
  title: string;
  description: string;
  priority: string;
  xp_reward: number;
  due_date: string | null;
  estimated_time: number;
  category: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}
interface ActivityRow {
  date: string;
  xp: number;
  tasks: number;
  focus_time: number;
}
interface AchievementRow {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  threshold: number;
  metric: string;
  unlocked: boolean;
  unlocked_at: string | null;
  progress: number;
}
interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
interface ProfileRow {
  username: string;
  avatar: string;
}
interface SettingsRow {
  daily_xp_goal: number;
  theme: string;
  animation_speed: string;
  sound_enabled: boolean;
  notifications_enabled: boolean;
}

// ── Conversions: DB rows → app types ─────────────────────────
function rowToTask(r: TaskRow): Task {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    priority: r.priority as Task['priority'],
    xpReward: r.xp_reward,
    dueDate: r.due_date,
    estimatedTime: r.estimated_time,
    category: r.category as Task['category'],
    status: r.status as Task['status'],
    createdAt: r.created_at,
    completedAt: r.completed_at,
  };
}

function rowToActivity(r: ActivityRow): DayActivity {
  return { date: r.date, xp: r.xp, tasks: r.tasks, focusTime: r.focus_time };
}

function rowToAchievement(r: AchievementRow): Achievement {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    category: r.category as Achievement['category'],
    icon: r.icon,
    threshold: r.threshold,
    metric: r.metric as Achievement['metric'],
    unlocked: r.unlocked,
    unlockedAt: r.unlocked_at,
    progress: Number(r.progress),
  };
}

function rowToNotification(r: NotificationRow): Notification {
  return {
    id: r.id,
    type: r.type as Notification['type'],
    title: r.title,
    message: r.message,
    timestamp: r.created_at,
    read: r.read,
  };
}

function rowToProfile(r: ProfileRow): Profile {
  return { username: r.username, avatar: r.avatar };
}

function rowToSettings(r: SettingsRow): Settings {
  return {
    dailyXPGoal: r.daily_xp_goal,
    theme: r.theme as Settings['theme'],
    animationSpeed: r.animation_speed as Settings['animationSpeed'],
    soundEnabled: r.sound_enabled,
    notificationsEnabled: r.notifications_enabled,
  };
}

// ── Load: Supabase → GameState ───────────────────────────────
export async function loadFromSupabase(): Promise<Partial<GameState> | null> {
  const allowed = await rateLimit('supabase:load', LIMITS.load);
  if (!allowed) return null;

  try {
    const [gameRes, tasksRes, activityRes, achievementsRes, notificationsRes, profileRes, settingsRes] =
      await Promise.all([
        supabase.from('game_state').select('*').eq('id', true).maybeSingle(),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('activity').select('*'),
        supabase.from('achievements').select('*'),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('profile').select('*').eq('id', true).maybeSingle(),
        supabase.from('settings').select('*').eq('id', true).maybeSingle(),
      ]);


    const result: Partial<GameState> = {};

    if (gameRes.data) {
      const g = gameRes.data as GameStateRow;
      result.totalXP = g.total_xp;
      result.level = g.level;
      result.currentStreak = g.current_streak;
      result.longestStreak = g.longest_streak;
      result.lastActiveDate = g.last_active_date || '';
      result.focusSessions = g.focus_sessions;
      result.totalFocusTime = g.total_focus_time;
    }

    if (tasksRes.data) {
      result.tasks = (tasksRes.data as TaskRow[]).map(rowToTask);
    }

    if (activityRes.data) {
      const map: Record<string, DayActivity> = {};
      for (const row of activityRes.data as ActivityRow[]) {
        map[row.date] = rowToActivity(row);
      }
      result.activity = map;
    }

    if (achievementsRes.data) {
      result.achievements = (achievementsRes.data as AchievementRow[]).map(rowToAchievement);
    }

    if (notificationsRes.data) {
      result.notifications = (notificationsRes.data as NotificationRow[]).map(rowToNotification);
    }

    if (profileRes.data) {
      result.profile = rowToProfile(profileRes.data as ProfileRow);
    }

    if (settingsRes.data) {
      result.settings = rowToSettings(settingsRes.data as SettingsRow);
    }

    return result;
  } catch (err) {
    console.warn('[FocusXP] Failed to load from Supabase:', err);
    return null;
  }
}

// ── Save: GameState → Supabase ────────────────────────────────
export async function saveToSupabase(state: GameState): Promise<void> {
  const allowed = await rateLimit('supabase:save', LIMITS.save);
  if (!allowed) return;

  try {
    // game_state (upsert singleton)
    await supabase.from('game_state').upsert({
      id: true,
      total_xp: state.totalXP,
      level: state.level,
      current_streak: state.currentStreak,
      longest_streak: state.longestStreak,
      last_active_date: state.lastActiveDate || null,
      focus_sessions: state.focusSessions,
      total_focus_time: state.totalFocusTime,
    });


    // profile (upsert singleton)
    await supabase.from('profile').upsert({
      id: true,
      username: state.profile.username,
      avatar: state.profile.avatar,
    });

    // settings (upsert singleton)
    await supabase.from('settings').upsert({
      id: true,
      daily_xp_goal: state.settings.dailyXPGoal,
      theme: state.settings.theme,
      animation_speed: state.settings.animationSpeed,
      sound_enabled: state.settings.soundEnabled,
      notifications_enabled: state.settings.notificationsEnabled,
    });

    // tasks (full replace)
    await supabase.from('tasks').delete().neq('id', '__none__');
    if (state.tasks.length > 0) {
      const rows = state.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        xp_reward: t.xpReward,
        due_date: t.dueDate,
        estimated_time: t.estimatedTime,
        category: t.category,
        status: t.status,
        created_at: t.createdAt,
        completed_at: t.completedAt,
      }));
      await supabase.from('tasks').insert(rows);
    }

    // activity (upsert each)
    const activityRows = Object.values(state.activity).map((a) => ({
      date: a.date,
      xp: a.xp,
      tasks: a.tasks,
      focus_time: a.focusTime,
    }));
    if (activityRows.length > 0) {
      await supabase.from('activity').upsert(activityRows, { onConflict: 'date' });
    }

    // achievements (upsert each)
    const achievementRows = state.achievements.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      category: a.category,
      icon: a.icon,
      threshold: a.threshold,
      metric: a.metric,
      unlocked: a.unlocked,
      unlocked_at: a.unlockedAt,
      progress: a.progress,
    }));
    if (achievementRows.length > 0) {
      await supabase.from('achievements').upsert(achievementRows, { onConflict: 'id' });
    }

    // notifications (upsert each)
    const notifRows = state.notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      created_at: n.timestamp,
    }));
    if (notifRows.length > 0) {
      await supabase.from('notifications').upsert(notifRows, { onConflict: 'id' });
    }
  } catch (err) {
    console.warn('[FocusXP] Failed to save to Supabase:', err);
  }
}
