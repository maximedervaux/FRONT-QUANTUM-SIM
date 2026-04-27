import { create } from 'zustand';

export type PotentialType = 'free' | 'infiniteWell' | 'step' | 'barrier';

interface SchrodingerStore {
	// Type de potentiel
	potentialType: PotentialType;
	setPotentialType: (type: PotentialType) => void;

	// Paramètres du puits infini
	wellWidth: number;
	setWellWidth: (width: number) => void;

	// Paramètres de la marche
	stepHeight: number;
	setStepHeight: (height: number) => void;

	// Paramètres de la barrière
	barrierWidth: number;
	setBarrierWidth: (width: number) => void;
	barrierHeight: number;
	setBarrierHeight: (height: number) => void;

	// Paramètres de simulation
	timeSteps: number;
	setTimeSteps: (steps: number) => void;
	spatialPoints: number;
	setSpatialPoints: (points: number) => void;
	absorbingBoundaries: boolean;
	setAbsorbingBoundaries: (enabled: boolean) => void;

	viewMode: '2d' | '3d';
	setViewMode: (viewMode: '2d' | '3d') => void;
}

export const useSchrodingerStore = create<SchrodingerStore>(set => ({
	// Valeurs par défaut
	potentialType: 'free',
	setPotentialType: type => set({ potentialType: type }),

	wellWidth: 7.2,
	setWellWidth: width => set({ wellWidth: width }),

	stepHeight: 50,
	setStepHeight: height => set({ stepHeight: height }),

	barrierWidth: 2,
	setBarrierWidth: width => set({ barrierWidth: width }),
	barrierHeight: 50,
	setBarrierHeight: height => set({ barrierHeight: height }),

	timeSteps: 200,
	setTimeSteps: steps => set({ timeSteps: steps }),
	spatialPoints: 300,
	setSpatialPoints: points => set({ spatialPoints: points }),
	absorbingBoundaries: false,
	setAbsorbingBoundaries: enabled => set({ absorbingBoundaries: enabled }),
	viewMode: '2d',
	setViewMode: viewMode => set({ viewMode: viewMode }),
}));
