import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Loader2 } from 'lucide-react';

interface WeatherData {
  temp: number;
  condition: string;
  icon: 'sun' | 'cloud' | 'rain' | 'wind';
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      try {
        // Using Open-Meteo (free, no API key needed)
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        }).catch(() => null);

        const lat = pos?.coords.latitude || 40.71;
        const lon = pos?.coords.longitude || -74.01;

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
        );
        const data = await res.json();
        const code = data.current?.weather_code || 0;
        const temp = Math.round(data.current?.temperature_2m || 20);

        let condition = 'Clear';
        let icon: WeatherData['icon'] = 'sun';

        if (code === 0) { condition = 'Clear'; icon = 'sun'; }
        else if (code <= 3) { condition = 'Partly Cloudy'; icon = 'cloud'; }
        else if (code <= 48) { condition = 'Foggy'; icon = 'cloud'; }
        else if (code <= 67) { condition = 'Rainy'; icon = 'rain'; }
        else if (code <= 77) { condition = 'Snowy'; icon = 'cloud'; }
        else if (code <= 82) { condition = 'Showers'; icon = 'rain'; }
        else { condition = 'Windy'; icon = 'wind'; }

        setWeather({ temp, condition, icon });
        setLoading(false);
      } catch {
        setError(true);
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  const Icon = weather?.icon === 'sun' ? Sun : weather?.icon === 'rain' ? CloudRain : weather?.icon === 'wind' ? Wind : Cloud;

  return (
    <div className="glass p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Cloud className="w-4 h-4 text-cyber-cyan" />
        <h2 className="font-display text-sm font-bold uppercase tracking-widest gradient-text">
          Weather
        </h2>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-muted text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : error ? (
        <div className="text-sm text-muted">Weather unavailable</div>
      ) : (
        <div className="flex items-center gap-4">
          <Icon className="w-10 h-10 text-cyber-cyan" />
          <div>
            <div className="font-display text-2xl font-bold text-cyber-cyan">{weather!.temp}°C</div>
            <div className="text-xs text-muted">{weather!.condition}</div>
          </div>
        </div>
      )}
    </div>
  );
}
