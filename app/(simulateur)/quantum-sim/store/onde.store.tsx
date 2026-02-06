import { create } from "zustand";

interface WaveState {
  amplitude: number;
  phase: number;

  setAmplitude: (value: number) => void;
  setPhase: (value: number) => void;
}

export const useWaveStore = create<WaveState>((set) => ({
  amplitude: 0,
  phase: 0,

  setAmplitude: (value) => set({ amplitude: value }),
  setPhase: (value) => set({ phase: value }),
}));