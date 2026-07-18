import { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, Volume2, VolumeX } from 'lucide-react';

const PRESETS = [
  { id: 'lofi', label: 'Lo-Fi', url: 'https://stream.zeno.fm/lofihiphop' },
  { id: 'ambient', label: 'Ambient', url: 'https://stream.zeno.fm/ambient' },
  { id: 'focus', label: 'Deep Focus', url: 'https://stream.zeno.fm/deepfocus' },
];

export function FocusMusic() {
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  }

  function selectPreset(i: number) {
    setSelected(i);
    if (audioRef.current) {
      audioRef.current.src = PRESETS[i].url;
      if (playing) {
        audioRef.current.play().catch(() => {});
      }
    }
  }

  return (
    <div className="glass p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Music className="w-4 h-4 text-cyber-green" />
        <h2 className="font-display text-sm font-bold uppercase tracking-widest gradient-text">
          Focus Music
        </h2>
      </div>

      <audio ref={audioRef} src={PRESETS[selected].url} loop />

      <div className="flex items-center gap-2 mb-3">
        {PRESETS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => selectPreset(i)}
            className={`flex-1 py-1.5 rounded-md text-[0.65rem] font-display uppercase tracking-wider transition-all ${
              selected === i
                ? 'bg-cyber-green/15 border border-cyber-green/40 text-cyber-green'
                : 'text-muted hover:text-cyber-green border border-transparent'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full flex items-center justify-center gradient-cyber text-black transition-transform hover:scale-110"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <button
          onClick={() => setMuted(!muted)}
          className="text-muted hover:text-cyber-cyan transition-colors"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => {
            setVolume(Number(e.target.value));
            setMuted(false);
          }}
          className="flex-1"
        />
      </div>
      <p className="text-[0.6rem] text-muted mt-2">Streams may not load in all environments</p>
    </div>
  );
}
