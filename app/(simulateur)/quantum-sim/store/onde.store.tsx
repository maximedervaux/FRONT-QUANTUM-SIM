import { create } from 'zustand';

interface WaveState {
  amplitude: number;
  phase: number;
  harmonics: number;
  harmonicAmplitudes: Record<number, number>; 
  wavelength: number;
  period: number;
  time: number;
  isAnimatingTime: boolean;
  isHarmonicsDrawerOpen: boolean;
  viewMode: '2d' | '3d';
  showImaginary: boolean;
  setAmplitude: (value: number) => void;
  setPhase: (value: number) => void;
  setFunction: (value: string) => void;
  setHarmonics: (value: number) => void;
  setHarmonicAmplitude: (index: number, value: number) => void;
  setWavelength: (value: number) => void;
  setPeriod: (value: number) => void;
  setTime: (value: number) => void;
  toggleAnimationTime: () => void;
  setHarmonicsDrawerOpen: (open: boolean) => void;
  toggleHarmonicsDrawer: () => void;
  resetPhase: () => void;
  resetTime: () => void;
  setViewMode: (mode: '2d' | '3d') => void;
  toggleShowImaginary: () => void;
}

export const useWaveStore = create<WaveState>((set) => ({
  amplitude: 0,
  phase: 0,
  harmonics: 1,
  harmonicAmplitudes: { 1: 1.0 },
  wavelength: 1,
  period: 3,
  time: 0,
  isAnimatingTime: false,
  isHarmonicsDrawerOpen: false,
  viewMode: '2d',
  showImaginary: false,

	setAmplitude: (value) => set({ amplitude: value }),
	setPhase: (value) => set((state) => ({ phase: (state.phase + value) % (2 * Math.PI) })),
	setFunction: (value) => {
    switch (value) {
      case 'gaussian':
        set((state) => ({
          phase: 0.1,
          amplitude: 1,
          harmonics: state.harmonics,
          harmonicAmplitudes: gaussianAmplitudes(state.harmonics),
        }));
        break;
      case 'sinus':
      case 'sinusoidale':
        set((state) => ({
          phase: 0.005,
          amplitude: 1,
          harmonicAmplitudes: sinusoidalAmplitudes(state.harmonics),
        }));
        break;
      default:
        set((state) => ({
          phase: 0,
          amplitude: 0,
          harmonicAmplitudes: buildAmplitudes(state.harmonics, {}), // reset à 1/n
        }));
    }
	},
  setHarmonics: (value) =>
    set((state) => ({
      harmonics: value,
      harmonicAmplitudes: buildAmplitudes(value, state.harmonicAmplitudes),
    })),
  setHarmonicAmplitude: (index, value) =>
    set((state) => ({
      harmonicAmplitudes: { ...state.harmonicAmplitudes, [index]: value },
    })),
  setWavelength: (value) => set({ wavelength: value }),
  setPeriod: (value) => set({ period: value }),
  setTime: (value) => set((state) => ({ time: state.time + value })),
  toggleAnimationTime: () =>
    set((state) => ({ isAnimatingTime: !state.isAnimatingTime })),
  setHarmonicsDrawerOpen: (open) => set({ isHarmonicsDrawerOpen: open }),
  toggleHarmonicsDrawer: () =>
    set((state) => ({ isHarmonicsDrawerOpen: !state.isHarmonicsDrawerOpen })),
  resetPhase: () => set({ phase: 0 }),
  resetTime: () => set({ time: 0 }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleShowImaginary: () =>
    set((state) => ({ showImaginary: !state.showImaginary })),
}));




function buildAmplitudes(
  n: number,
  current: Record<number, number>
): Record<number, number> {
  const next: Record<number, number> = {};
  for (let i = 1; i <= n; i++) {
    next[i] = current[i] ?? 1 / i; // ← 1/n au lieu de 1.0
  }
  return next;
}

// Enveloppe gaussienne : e^(-(n-1)² / (2σ²))
function gaussianAmplitudes(n: number, sigma = 1.5): Record<number, number> {
  const result: Record<number, number> = {};
  for (let i = 1; i <= n; i++) {
    result[i] = Math.exp(-((i - 1) ** 2) / (2 * sigma ** 2));
  }
  return result;
}

function sinusoidalAmplitudes(n: number): Record<number, number> {
  const result: Record<number, number> = {};
  for (let i = 1; i <= n; i++) {
    if (n === 1) {
      result[i] = 1;
      continue;
    }

    const progress = (i - 1) / (n - 1);
    result[i] = Math.sin((1 - progress) * (Math.PI / 2));
  }
  return result;
}