import { useState } from 'react';
import { Settings as SettingsIcon, X, Download, Upload, RotateCcw, Palette, Volume2, Bell, Target, Zap } from 'lucide-react';

import { useGameStore } from '../store/gameStore';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const exportData = useGameStore((s) => s.exportData);
  const importData = useGameStore((s) => s.importData);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMsg, setImportMsg] = useState('');

  if (!open) return null;

  function handleExport() {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusxp-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    if (!importText.trim()) return;
    const success = importData(importText);
    setImportMsg(success ? 'Import successful!' : 'Import failed — invalid data');
    if (success) setImportText('');
    setTimeout(() => setImportMsg(''), 3000);
  }

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setImportText(text);
    };
    reader.readAsText(file);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="glass relative max-w-lg w-full max-h-[85vh] overflow-y-auto scrollbar-thin p-6 level-up-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-cyber-cyan" />
            <h2 className="font-display text-lg font-bold gradient-text">Settings</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost !px-2 !py-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Daily XP Goal */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-cyber-cyan" />
              <label className="label !mb-0">Daily XP Goal</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={20}
                max={500}
                step={10}
                value={settings.dailyXPGoal}
                onChange={(e) => updateSettings({ dailyXPGoal: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="font-display text-sm text-cyber-cyan w-16 text-right">{settings.dailyXPGoal} XP</span>
            </div>
          </section>

          {/* Theme */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4 text-cyber-violet" />
              <label className="label !mb-0">Theme</label>
            </div>
            <div className="flex gap-2">
              {(['dark', 'light'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => updateSettings({ theme: t })}
                  className={`flex-1 py-2 rounded-lg text-xs font-display uppercase tracking-wider transition-all ${
                    settings.theme === t
                      ? 'bg-cyber-cyan/15 border border-cyber-cyan/40 text-cyber-cyan'
                      : 'border border-cyber-border text-muted hover:text-cyber-cyan'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          {/* Animation Speed */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-cyber-amber" />
              <label className="label !mb-0">Animation Speed</label>
            </div>
            <div className="flex gap-2">
              {(['slow', 'normal', 'fast'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateSettings({ animationSpeed: s })}
                  className={`flex-1 py-2 rounded-lg text-xs font-display uppercase tracking-wider transition-all ${
                    settings.animationSpeed === s
                      ? 'bg-cyber-amber/15 border border-cyber-amber/40 text-cyber-amber'
                      : 'border border-cyber-border text-muted hover:text-cyber-amber'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Sound */}
          <section>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyber-green" />
                <label className="label !mb-0">Sound Effects</label>
              </div>
              <Toggle
                checked={settings.soundEnabled}
                onChange={(v) => updateSettings({ soundEnabled: v })}
              />
            </div>
          </section>

          {/* Notifications */}
          <section>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyber-pink" />
                <label className="label !mb-0">Notifications</label>
              </div>
              <Toggle
                checked={settings.notificationsEnabled}
                onChange={(v) => updateSettings({ notificationsEnabled: v })}
              />
            </div>
          </section>

          <div className="border-t border-cyber-border pt-4 space-y-3">
            {/* Export / Import */}
            <div className="flex gap-2">
              <button onClick={handleExport} className="btn btn-primary flex-1">
                <Download className="w-4 h-4" /> Export
              </button>
              <label className="btn btn-ghost flex-1 cursor-pointer">
                <Upload className="w-4 h-4" /> Import File
                <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
              </label>
            </div>
            {importText && (
              <div>
                <textarea
                  className="input text-xs"
                  rows={3}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste exported JSON here..."
                />
                <button onClick={handleImport} className="btn btn-primary mt-2 w-full">
                  Import Data
                </button>
              </div>
            )}
            {importMsg && <div className="text-xs text-cyber-green text-center">{importMsg}</div>}

            {/* Reset */}
            <div className="pt-2 border-t border-cyber-border">
              {!confirmReset ? (
                <button onClick={() => setConfirmReset(true)} className="btn btn-danger w-full">
                  <RotateCcw className="w-4 h-4" /> Reset Progress
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      resetProgress();
                      setConfirmReset(false);
                    }}
                    className="btn btn-danger flex-1"
                  >
                    Confirm Reset
                  </button>
                  <button onClick={() => setConfirmReset(false)} className="btn btn-ghost flex-1">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-cyber-cyan/40' : 'bg-cyber-border'
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
          checked ? 'left-[22px] bg-cyber-cyan' : 'left-0.5 bg-muted'
        }`}
        style={checked ? { boxShadow: '0 0 8px rgba(0,240,255,0.5)' } : {}}
      />
    </button>
  );
}
