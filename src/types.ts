export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type TaskCategory =
  | 'work'
  | 'study'
  | 'health'
  | 'personal'
  | 'creative'
  | 'eco';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  xpReward: number;
  dueDate: string | null;
  estimatedTime: number;
  category: TaskCategory;
  status: TaskStatus;
  createdAt: string;
  completedAt: string | null;
}

export interface DayActivity {
  date: string;
  xp: number;
  tasks: number;
  focusTime: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'productivity' | 'streak' | 'eco' | 'special';
  icon: string;
  threshold: number;
  metric:
    | 'totalTasks'
    | 'totalXP'
    | 'currentStreak'
    | 'longestStreak'
    | 'treesSaved'
    | 'level';
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number;
}

export interface Notification {
  id: string;
  type: 'level-up' | 'task-completed' | 'goal-completed' | 'achievement' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Settings {
  dailyXPGoal: number;
  theme: 'dark' | 'light';
  animationSpeed: 'slow' | 'normal' | 'fast';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface Profile {
  username: string;
  avatar: string;
}

export interface GameState {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  tasks: Task[];
  activity: Record<string, DayActivity>;
  achievements: Achievement[];
  notifications: Notification[];
  settings: Settings;
  profile: Profile;
  focusSessions: number;
  totalFocusTime: number;
  createdAt: string;
}

export interface LevelInfo {
  level: number;
  rank: string;
  currentLevelXP: number;
  nextLevelXP: number;
  xpIntoLevel: number;
  xpForNext: number;
  progress: number;
  rankColor: string;
}
