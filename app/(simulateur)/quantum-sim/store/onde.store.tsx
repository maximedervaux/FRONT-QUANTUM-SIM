import { create } from "zustand";

interface WaveState {
  amplitude: number;
  phase: number;
  harmonics: number;
  wavelength: number;
  period: number;
  time: number;
  isAnimatingPhase: boolean;
  isAnimatingTime: boolean;

  setAmplitude: (value: number) => void;
  setPhase: (value: number) => void;
  setFunction: (value: string) => void;
  setHarmonics: (value: number) => void;
  setWavelength: (value: number) => void;
  setPeriod: (value: number) => void;
  setTime: (value: number) => void;
  toggleAnimationPhase: () => void;
  toggleAnimationTime: () => void;
  resetPhase: () => void;
  resetTime: () => void;
}

export const useWaveStore = create<WaveState>((set) => ({
  amplitude: 0,
  phase: 0,
  harmonics: 1,
  wavelength: 1,
  period: 3,
  time: 0,
  isAnimatingPhase: false,
  isAnimatingTime: false,

  setAmplitude: (value) => set({ amplitude: value }),
  setPhase: (value) => set((state) => ({
    phase: (state.phase + value) % (2 * Math.PI) // Modulo 2π pour boucler
  })),
  setFunction: (value) => {
    switch (value) {
      case "gaussienne":
        set({ phase: 0.1 , amplitude: 1 });
        break;
      case "sinusoidale":
        set({ phase: 0.005 , amplitude: 1 });
        break;
      default:
        set({ phase: 0 , amplitude: 0 });
    }
  },
  setHarmonics: (value) => set({harmonics: value}),
  setWavelength: (value) => set({wavelength: value}),
  setPeriod: (value) => set({period: value}),
  setTime: (value) => set((state) => ({ time: state.time + value })),
  toggleAnimationPhase: () => set((state) => ({ isAnimatingPhase: !state.isAnimatingPhase })),
  toggleAnimationTime: () => set((state) => ({ isAnimatingTime: !state.isAnimatingTime })),
  resetPhase: () => set({ phase: 0 }),
  resetTime: () => set({ time: 0 }),
}));