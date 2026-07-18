import { useEffect, useRef } from 'react';
import {
  Chart,
  BarController,
  CategoryScale,
  LinearScale,
  Tooltip,
  BarElement,
  type ChartConfiguration,
} from 'chart.js';
import { useGameStore } from '../store/gameStore';
function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

Chart.register(BarController, CategoryScale, LinearScale, Tooltip, BarElement);

export function WeeklyChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const activity = useGameStore((s) => s.activity);

  useEffect(() => {
    if (!canvasRef.current) return;

    const weekStart = startOfWeek(new Date());
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const labels = days.map((d) => d.toLocaleDateString('en-US', { weekday: 'short' }));
    const xpData = days.map((d) => activity[dateKey(d)]?.xp || 0);
    const taskData = days.map((d) => activity[dateKey(d)]?.tasks || 0);
    const focusData = days.map((d) => activity[dateKey(d)]?.focusTime || 0);

    const data = {
      labels,
      datasets: [
        {
          label: 'XP',
          data: xpData,
          backgroundColor: (ctx: any) => {
            const chart = ctx.chart;
            const { ctx: canvasCtx, chartArea } = chart;
            if (!chartArea) return 'rgba(0,240,255,0.5)';
            const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'rgba(0,240,255,0.1)');
            gradient.addColorStop(1, 'rgba(0,240,255,0.6)');
            return gradient;
          },
          borderColor: '#00f0ff',
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };

    const config: ChartConfiguration = {
      type: 'bar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeOutCubic' },
        plugins: {
          tooltip: {
            backgroundColor: 'rgba(10,14,26,0.95)',
            borderColor: 'rgba(0,240,255,0.3)',
            borderWidth: 1,
            titleFont: { family: 'Orbitron', size: 11 },
            bodyFont: { family: 'Exo 2', size: 12 },
            padding: 12,
            callbacks: {
              title: (items: any) => {
                const idx = items[0].dataIndex;
                return formatShortDate(days[idx]);
              },
              label: (item: any) => `XP: ${item.parsed.y}`,
              afterBody: (items: any) => {
                const idx = items[0].dataIndex;
                return [
                  `Tasks: ${taskData[idx]}`,
                  `Focus: ${focusData[idx]}m`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#7a8aab', font: { family: 'Orbitron', size: 10 } },
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
        Weekly Activity
      </h2>
      <div className="h-[200px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
