import { useState, useEffect, useRef } from 'react';
import { Search, Command, ArrowRight } from 'lucide-react';

interface Command {
  id: string;
  label: string;
  hint?: string;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}

export function CommandPalette({ open, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelected(0);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[selected];
      if (cmd) {
        cmd.action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="glass relative max-w-lg w-full overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-cyber-border">
          <Search className="w-4 h-4 text-cyber-cyan" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className="text-[0.6rem] px-1.5 py-0.5 rounded border border-cyber-border text-muted">ESC</kbd>
        </div>

        <div className="max-h-[300px] overflow-y-auto scrollbar-thin p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-6 text-muted text-sm">No commands found</div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={() => {
                  cmd.action();
                  onClose();
                }}
                onMouseEnter={() => setSelected(i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  i === selected ? 'bg-cyber-cyan/10 border border-cyber-cyan/30' : 'border border-transparent'
                }`}
              >
                <Command className="w-3.5 h-3.5 text-muted shrink-0" />
                <span className="text-sm flex-1">{cmd.label}</span>
                {cmd.hint && <span className="text-[0.6rem] text-muted">{cmd.hint}</span>}
                {i === selected && <ArrowRight className="w-3.5 h-3.5 text-cyber-cyan" />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
