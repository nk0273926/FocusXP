export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function animateNumber(
  from: number,
  to: number,
  duration: number,
  onUpdate: (v: number) => void,
  onComplete?: () => void
): () => void {
  const start = performance.now();
  let cancelled = false;

  function frame(now: number) {
    if (cancelled) return;
    const elapsed = now - start;
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = from + (to - from) * eased;
    onUpdate(value);
    if (t < 1) requestAnimationFrame(frame);
    else onComplete?.();
  }

  requestAnimationFrame(frame);
  return () => {
    cancelled = true;
  };
}

export function playSound(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch {
    // Sound not supported
  }
}

export function playLevelUpSound(): void {
  playSound(523, 0.15, 'sine');
  setTimeout(() => playSound(659, 0.15, 'sine'), 100);
  setTimeout(() => playSound(784, 0.3, 'sine'), 200);
}

export function playCompleteSound(): void {
  playSound(800, 0.1, 'triangle');
  setTimeout(() => playSound(1200, 0.15, 'triangle'), 80);
}

export function playAchievementSound(): void {
  playSound(587, 0.12, 'sine');
  setTimeout(() => playSound(880, 0.2, 'sine'), 120);
}
