import { create } from "zustand";

export interface PacketWave {
  id: string;
  amplitude: number;
  phase: number;
  harmonics: number;
  wavelength: number;
  period: number;
  time: number;
  createdAt: number;
}

interface PacketWavesState {
  waves: PacketWave[];
  isDrawerOpen: boolean;
  addWave: (wave: Omit<PacketWave, "id" | "createdAt">) => void;
  removeWave: (id: string) => void;
  clearWaves: () => void;
  setDrawerOpen: (open: boolean) => void;
}

export const usePacketWavesStore = create<PacketWavesState>((set) => ({
  waves: [],
  isDrawerOpen: false,
  addWave: (wave) =>
    set((state) => ({
      waves: [
        ...state.waves,
        {
          ...wave,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: Date.now(),
        },
      ],
    })),
  removeWave: (id) =>
    set((state) => ({
      waves: state.waves.filter((wave) => wave.id !== id),
    })),
  clearWaves: () => set({ waves: [] }),
  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
}));
