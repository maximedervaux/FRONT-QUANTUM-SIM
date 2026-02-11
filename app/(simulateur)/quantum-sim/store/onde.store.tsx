import { create } from "zustand";

interface WaveState {
  amplitude: number;
  phase: number;
  harmonics: number;
  wavelength: number;
  period: number;
  

  setAmplitude: (value: number) => void;
  setPhase: (value: number) => void;
  setFunction: (value: string) => void;
  setHarmonics: (value: number) => void;
  setWavelength: (value: number) => void;
  setPeriod: (value: number) => void;
}

export const useWaveStore = create<WaveState>((set) => ({
  amplitude: 0,
  phase: 0,
  harmonics: 1,
  wavelength: 1,
  period: 3,

  setAmplitude: (value) => set({ amplitude: value }),
  setPhase: (value) =>
  set((state) => ({ phase: state.phase + value })),
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
}));