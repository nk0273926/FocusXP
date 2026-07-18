import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, Undo2, X, Calendar, Clock, Filter } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import type { Task, Priority, TaskCategory, TaskStatus } from '../types';
import { playCompleteSound } from '../utils/helpers';

const CATEGORIES: { value: TaskCategory; label: string; color: string }[] = [
  { value: 'work', label: 'Work', color: '#00f0ff' },
  { value: 'study', label: 'Study', color: '#7c5cff' },
  { value: 'health', label: 'Health', color: '#00ff9d' },
  { value: 'personal', label: 'Personal', color: '#ffb800' },
  { value: 'creative', label: 'Creative', color: '#ff2d95' },
  { value: 'eco', label: 'Eco', color: '#00ff9d' },
];

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#00ff9d' },
  { value: 'medium', label: 'Medium', color: '#ffb800' },
  { value: 'high', label: 'High', color: '#ff4d6d' },
];

const XP_REWARDS: Record<Priority, number> = { low: 10, medium: 25, high: 50 };

export function TaskManager() {
  const tasks = useGameStore((s) => s.tasks);
  const addTask = useGameStore((s) => s.addTask);
  const updateTask = useGameStore((s) => s.updateTask);
  const deleteTask = useGameStore((s) => s.deleteTask);
  const completeTask = useGameStore((s) => s.completeTask);
  const undoCompleteTask = useGameStore((s) => s.undoCompleteTask);
  const soundEnabled = useGameStore((s) => s.settings.soundEnabled);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    xpReward: 25,
    dueDate: '',
    estimatedTime: 30,
    category: 'work' as TaskCategory,
  });

  const filtered = tasks.filter((t) => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    return true;
  });

  function resetForm() {
    setForm({
      title: '',
      description: '',
      priority: 'medium',
      xpReward: 25,
      dueDate: '',
      estimatedTime: 30,
      category: 'work',
    });
    setEditingId(null);
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const data = {
      ...form,
      dueDate: form.dueDate || null,
    };
    if (editingId) {
      updateTask(editingId, data);
    } else {
      addTask(data);
    }
    resetForm();
  }

  function handleEdit(task: Task) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      xpReward: task.xpReward,
      dueDate: task.dueDate || '',
      estimatedTime: task.estimatedTime,
      category: task.category,
    });
    setShowForm(true);
  }

  function handleComplete(task: Task) {
    if (soundEnabled) playCompleteSound();
    completeTask(task.id);
  }

  const priorityColor = (p: Priority) => PRIORITIES.find((pr) => pr.value === p)!.color;
  const categoryColor = (c: TaskCategory) => CATEGORIES.find((cat) => cat.value === c)!.color;

  return (
    <div className="glass p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest gradient-text">
          Task Manager
        </h2>
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Filter className="w-3.5 h-3.5 text-muted" />
        {(['all', 'todo', 'in-progress', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-md text-[0.65rem] font-display uppercase tracking-wider transition-all ${
              filter === f
                ? 'bg-cyber-cyan/15 border border-cyber-cyan/40 text-cyber-cyan'
                : 'text-muted hover:text-cyber-cyan border border-transparent'
            }`}
          >
            {f === 'todo' ? 'To Do' : f === 'in-progress' ? 'In Progress' : f === 'all' ? 'All' : 'Done'}
          </button>
        ))}
        <div className="w-px h-4 bg-cyber-border mx-1" />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as TaskCategory | 'all')}
          className="bg-transparent text-[0.65rem] font-display uppercase tracking-wider text-muted border border-cyber-border rounded-md px-2 py-1 cursor-pointer hover:text-cyber-cyan focus:outline-none focus:border-cyber-cyan/40"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass p-4 mb-4 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="label">Title</label>
              <input
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="What needs to be done?"
                autoFocus
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea
                className="input resize-none"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional details..."
              />
            </div>
            <div>
              <label className="label">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => {
                  const p = e.target.value as Priority;
                  setForm({ ...form, priority: p, xpReward: XP_REWARDS[p] });
                }}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as TaskCategory })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">XP Reward</label>
              <input
                type="number"
                className="input"
                value={form.xpReward}
                min={1}
                max={500}
                onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Estimated Time (min)</label>
              <input
                type="number"
                className="input"
                value={form.estimatedTime}
                min={1}
                onChange={(e) => setForm({ ...form, estimatedTime: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Due Date</label>
              <input
                type="date"
                className="input"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update' : 'Create'} Task
            </button>
            <button type="button" onClick={resetForm} className="btn btn-ghost">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </form>
      )}

      {/* Task list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted text-sm">
            No tasks yet. Add one to start earning XP!
          </div>
        )}
        {filtered.map((task) => (
          <div
            key={task.id}
            className={`glass p-3 flex items-start gap-3 group transition-all hover:border-cyber-cyan/30 ${
              task.status === 'completed' ? 'opacity-60' : ''
            }`}
            style={{ borderLeft: `3px solid ${priorityColor(task.priority)}` }}
          >
            <button
              onClick={() => task.status === 'completed' ? undoCompleteTask(task.id) : handleComplete(task)}
              className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                task.status === 'completed'
                  ? 'bg-cyber-green/20 border-cyber-green text-cyber-green'
                  : 'border-cyber-border hover:border-cyber-cyan'
              }`}
            >
              {task.status === 'completed' && <Check className="w-3 h-3" strokeWidth={3} />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-muted' : ''}`}>
                  {task.title}
                </span>
                <span
                  className="chip"
                  style={{
                    borderColor: `${categoryColor(task.category)}40`,
                    background: `${categoryColor(task.category)}10`,
                    color: categoryColor(task.category),
                  }}
                >
                  {CATEGORIES.find((c) => c.value === task.category)?.label}
                </span>
                <span className="chip chip-cyan">+{task.xpReward} XP</span>
              </div>
              {task.description && (
                <p className="text-xs text-muted mt-1 line-clamp-2">{task.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1.5 text-[0.65rem] text-muted">
                {task.dueDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {task.estimatedTime}m
                </span>
                <span
                  className="font-display uppercase tracking-wider"
                  style={{ color: priorityColor(task.priority) }}
                >
                  {task.priority}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {task.status === 'completed' && (
                <button
                  onClick={() => undoCompleteTask(task.id)}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:text-cyber-amber hover:bg-cyber-amber/10 transition-colors"
                  title="Undo"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => handleEdit(task)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:text-cyber-red hover:bg-cyber-red/10 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
