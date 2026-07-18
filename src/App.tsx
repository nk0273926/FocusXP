import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from './store/gameStore';
import { Background } from './components/Background';
import { Header } from './components/Header';
import { DailyGoalProgress } from './components/DailyGoalProgress';
import { DashboardCards, EcoModal } from './components/DashboardCards';
import { TaskManager } from './components/TaskManager';

type Theme = 'light' | 'dark';
type AnimationSpeed = 'slow' | 'normal' | 'fast';
interface Command {
  id: string;
  label: string;
  action: () => void;
}

import { WeeklyChart } from './components/WeeklyChart';
import { MonthlyChart } from './components/MonthlyChart';
import { Heatmap } from './components/Heatmap';
import { Statistics } from './components/statistics';
import { SettingsModal } from './components/SettingsModal';
import { Leaderboard } from './components/Leaderboard';
import { LevelUpPopup } from './components/LevelUpPopup';
import { CommandPalette } from './components/commandPalette';
import { DailyQuote } from './components/DailyQuote';
import { WeatherWidget } from './components/WeatherWidget';
import { Achievements } from "./components/Achivements";
import { MiniCalendar } from "./components/MiniCalender";
import { NotificationsPanel } from "./components/NotificationPanel";
import { ProfileCard } from "./components/Profile";
import { FocusTimer } from "./components/FocusTimer";


function App(): JSX.Element {
  const theme: Theme = useGameStore((s) => s.settings.theme);
  const animationSpeed: AnimationSpeed = useGameStore((s) => s.settings.animationSpeed);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showEco, setShowEco] = useState<boolean>(false);
  const [showCommand, setShowCommand] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const syncWithSupabase = useGameStore((s) => s.syncWithSupabase);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Sync with Supabase on mount (pull remote state, merge with local)
  useEffect(() => {
    syncWithSupabase();
  }, [syncWithSupabase]);

  // Animation speed multiplier
  useEffect(() => {
    const speed = animationSpeed === 'fast' ? '0.5' : animationSpeed === 'slow' ? '1.5' : '1';
    document.documentElement.style.setProperty('--anim-speed', speed);
  }, [animationSpeed]);

  // Keyboard shortcuts
  const handleKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setShowCommand((s) => !s);
    } else if (e.key === 'Escape') {
      setShowCommand(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const commands: Command[] = [
    { id: 'settings', label: 'Open Settings', action: () => setShowSettings(true) },
    { id: 'notifications', label: 'View Notifications', action: () => setShowNotifications(true) },
    { id: 'eco', label: 'View Eco Impact', action: () => setShowEco(true) },
    { id: 'add-task', label: 'Add New Task', action: () => document.getElementById('task-manager')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'timer', label: 'Jump to Focus Timer', action: () => document.getElementById('focus-timer')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'achievements', label: 'View Achievements', action: () => document.getElementById('achievements')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'leaderboard', label: 'View Leaderboard', action: () => document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'stats', label: 'View Statistics', action: () => document.getElementById('statistics')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'heatmap', label: 'View Heatmap', action: () => document.getElementById('heatmap')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'toggle-theme', label: 'Toggle Theme', action: () => useGameStore.getState().updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' }) },
  ];

  return (
    <div className="min-h-screen relative">
      <Background />

      <div className="relative z-10 max-w-[1600px] mx-auto px-3 md:px-6 py-4 space-y-4">
        <Header
          onOpenNotifications={() => setShowNotifications(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenCommand={() => setShowCommand(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <DailyGoalProgress />

        <DashboardCards onOpenEco={() => setShowEco(true)} />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column: Tasks + Timer */}
          <div className="lg:col-span-2 space-y-4">
            <div id="task-manager">
              <TaskManager />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WeeklyChart />
              <MonthlyChart />
            </div>
            <Statistics />
          </div>

          {/* Right column: Timer + Profile + extras */}
          <div className="space-y-4">
            <div id="focus-timer">
              <FocusTimer />
            </div>
            <ProfileCard />
            <MiniCalendar />
            <div className="grid grid-cols-1 gap-4">
              <DailyQuote />
              <WeatherWidget />
            </div>
          </div>
        </div>

        {/* Full-width sections */}
        <div className="space-y-4">
          <div id="heatmap">
            <Heatmap />
          </div>
          <div id="achievements">
            <Achievements />
          </div>
          <div id="leaderboard">
            <Leaderboard />
          </div>
        </div>

        <footer className="text-center py-6 text-xs text-muted">
          <p className="font-display tracking-widest">FOCUSXP • GAMIFIED PRODUCTIVITY</p>
          <p className="mt-1">Your progress saves automatically to this device</p>
        </footer>
      </div>

      {/* Modals & overlays */}
      <NotificationsPanel open={showNotifications} onClose={() => setShowNotifications(false)} />
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
      <EcoModal open={showEco} onClose={() => setShowEco(false)} />
      <LevelUpPopup />
      <CommandPalette open={showCommand} onClose={() => setShowCommand(false)} commands={commands} />
   
    </div>
  );
}

export default App;
