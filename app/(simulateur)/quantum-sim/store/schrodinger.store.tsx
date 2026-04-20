import { create } from 'zustand';

export type PotentialType = 'free' | 'infiniteWell' | 'step';

interface SchrodingerState {
	potentialType: PotentialType;

	setPotentialType: (type: PotentialType) => void;
}

export const useSchrodingerStore = create<SchrodingerState>(set => ({
	potentialType: 'infiniteWell',
	setPotentialType: type => set({ potentialType: type }),
}));
