import { useState } from 'react';
import { Quote, RefreshCw } from 'lucide-react';
import { getDailyQuote } from '../utils/content';

export function DailyQuote() {
  const [quote, setQuote] = useState(getDailyQuote());
  const [refreshing, setRefreshing] = useState(false);

  function refresh() {
    setRefreshing(true);
    setQuote(getDailyQuote());
    setTimeout(() => setRefreshing(false), 500);
  }

  return (
    <div className="glass p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Quote className="w-4 h-4 text-cyber-violet" />
          <h2 className="font-display text-sm font-bold uppercase tracking-widest gradient-text">
            Daily Quote
          </h2>
        </div>
        <button
          onClick={refresh}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <p className="text-sm text-muted italic leading-relaxed">"{quote}"</p>
    </div>
  );
}
