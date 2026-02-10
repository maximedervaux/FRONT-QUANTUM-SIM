import { create } from "zustand";

interface WaveState {
  amplitude: number;
  phase: number;
  

  setAmplitude: (value: number) => void;
  setPhase: (value: number) => void;
  setFunction: (value: string) => void;
}

export const useWaveStore = create<WaveState>((set) => ({
  amplitude: 0,
  phase: 0,

  setAmplitude: (value) => set({ amplitude: value }),
  setPhase: (value) => set({ phase: value }),
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
}));