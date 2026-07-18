import { useEffect, useRef } from 'react';
import {
  Chart,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  PointElement,
  LineElement,
  Filler,
  type ChartConfiguration,
} from 'chart.js';
import { useGameStore } from '../store/gameStore';
import { dateKey, addDays, formatShortDate } from '../utils/dates';

Chart.register(
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  PointElement,
  LineElement,
  Filler
);

export function MonthlyChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const activity = useGameStore((s) => s.activity);

  useEffect(() => {
    if (!canvasRef.current) return;

    const today = new Date();
    const days = Array.from({ length: 30 }, (_, i) => addDays(today, -(29 - i)));
    const labels = days.map((d) => formatShortDate(d));
    const xpData = days.map((d) => activity[dateKey(d)]?.xp || 0);

    const data = {
      labels,
      datasets: [
        {
          label: 'XP',
          data: xpData,
          borderColor: '#00ff9d',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          backgroundColor: (ctx: any) => {
            const chart = ctx.chart;
            const { ctx: canvasCtx, chartArea } = chart;
            if (!chartArea) return 'rgba(0,255,157,0.1)';
            const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(0,255,157,0.3)');
            gradient.addColorStop(1, 'rgba(0,255,157,0)');
            return gradient;
          },
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#00ff9d',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        },
      ],
    };

    const config: ChartConfiguration = {
      type: 'line',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1000, easing: 'easeOutCubic' },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          tooltip: {
            backgroundColor: 'rgba(10,14,26,0.95)',
            borderColor: 'rgba(0,255,157,0.3)',
            borderWidth: 1,
            titleFont: { family: 'Orbitron', size: 11 },
            bodyFont: { family: 'Exo 2', size: 12 },
            padding: 12,
            callbacks: {
              label: (item: any) => `XP: ${item.parsed.y}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#7a8aab',
              font: { family: 'Exo 2', size: 9 },
              maxTicksLimit: 8,
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(26,35,64,0.5)' },
            ticks: { color: '#7a8aab', font: { family: 'Exo 2', size: 10 } },
          },
        },
      },
    };

    if (chartRef.current) {
      chartRef.current.data = data;
      chartRef.current.update();
    } else {
      chartRef.current = new Chart(canvasRef.current, config);
    }

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [activity]);

  return (
    <div className="glass p-4 md:p-5">
      <h2 className="font-display text-sm font-bold uppercase tracking-widest gradient-text mb-4">
        Monthly XP Growth
      </h2>
      <div className="h-[200px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
