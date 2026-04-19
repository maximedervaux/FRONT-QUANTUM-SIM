import { create } from 'zustand';

export type WavePacketType = 'gaussian' | 'custom' | 'random';
export type VisualizationMode = 'wavefunction' | 'probability';

interface IndividualWave {
	id: string;
	amplitude: number;
	waveNumber: number; // k
	phase: number;
	enabled: boolean;
}

interface WavePacketState {
	// Type de paquet d'ondes
	packetType: WavePacketType;

	// Paramètres du paquet gaussien
	k_center: number; // vecteur d'onde central
	sigma_k: number; // largeur en k
	x_center: number; // position centrale

	// Paramètres généraux
	nWaves: number; // nombre d'ondes planes dans le paquet
	time: number;
	isAnimatingTime: boolean;

	// Visualisation
	visualizationMode: VisualizationMode;
	showEnvelope: boolean;
	showIndividualWaves: boolean;

	// Ondes personnalisées (mode custom)
	customWaves: IndividualWave[];

	// Limites spatiales
	xMin: number;
	xMax: number;

	// Drawer
	isWavesDrawerOpen: boolean;

	// Actions - Type de paquet
	setPacketType: (type: WavePacketType) => void;

	// Actions - Paramètres gaussiens
	setKCenter: (value: number) => void;
	setSigmaK: (value: number) => void;
	setXCenter: (value: number) => void;

	// Actions - Générales
	setNWaves: (value: number) => void;
	setTime: (value: number) => void;
	toggleAnimationTime: () => void;
	resetTime: () => void;

	// Actions - Visualisation
	setVisualizationMode: (mode: VisualizationMode) => void;
	toggleEnvelope: () => void;
	toggleIndividualWaves: () => void;

	// Actions - Ondes personnalisées
	addCustomWave: (wave: Omit<IndividualWave, 'id'>) => void;
	removeCustomWave: (id: string) => void;
	updateCustomWave: (id: string, updates: Partial<Omit<IndividualWave, 'id'>>) => void;
	clearCustomWaves: () => void;

	// Actions - Limites spatiales
	setXMin: (value: number) => void;
	setXMax: (value: number) => void;

	// Actions - Drawer
	setWavesDrawerOpen: (open: boolean) => void;
	toggleWavesDrawer: () => void;

	// Présets
	loadGaussianPreset: () => void;
	loadNarrowPreset: () => void;
	loadWidePreset: () => void;
}

export const useWavePacketStore = create<WavePacketState>(set => ({
	// Valeurs initiales
	packetType: 'gaussian',
	k_center: 5.0,
	sigma_k: 1.0,
	x_center: 0.0,
	nWaves: 50,
	time: 0,
	isAnimatingTime: false,
	visualizationMode: 'wavefunction',
	showEnvelope: true,
	showIndividualWaves: false,
	customWaves: [],
	xMin: -10,
	xMax: 10,
	isWavesDrawerOpen: false,

	// Type de paquet
	setPacketType: type => set({ packetType: type }),

	// Paramètres gaussiens
	setKCenter: value => set({ k_center: value }),
	setSigmaK: value => set({ sigma_k: Math.max(0.1, value) }),
	setXCenter: value => set({ x_center: value }),

	// Générales
	setNWaves: value => set({ nWaves: Math.max(1, Math.min(200, value)) }),
	setTime: value => set(state => ({ time: state.time + value })),
	toggleAnimationTime: () => set(state => ({ isAnimatingTime: !state.isAnimatingTime })),
	resetTime: () => set({ time: 0 }),

	// Visualisation
	setVisualizationMode: mode => set({ visualizationMode: mode }),
	toggleEnvelope: () => set(state => ({ showEnvelope: !state.showEnvelope })),
	toggleIndividualWaves: () => set(state => ({ showIndividualWaves: !state.showIndividualWaves })),

	// Ondes personnalisées
	addCustomWave: wave =>
		set(state => ({
			customWaves: [
				...state.customWaves,
				{
					...wave,
					id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
				},
			],
		})),
	removeCustomWave: id =>
		set(state => ({
			customWaves: state.customWaves.filter(w => w.id !== id),
		})),
	updateCustomWave: (id, updates) =>
		set(state => ({
			customWaves: state.customWaves.map(w => (w.id === id ? { ...w, ...updates } : w)),
		})),
	clearCustomWaves: () => set({ customWaves: [] }),

	// Limites spatiales
	setXMin: value => set({ xMin: value }),
	setXMax: value => set({ xMax: value }),

	// Drawer
	setWavesDrawerOpen: open => set({ isWavesDrawerOpen: open }),
	toggleWavesDrawer: () => set(state => ({ isWavesDrawerOpen: !state.isWavesDrawerOpen })),

	// Présets
	loadGaussianPreset: () =>
		set({
			packetType: 'gaussian',
			k_center: 5.0,
			sigma_k: 1.0,
			x_center: 0.0,
			nWaves: 50,
			time: 0,
		}),
	loadNarrowPreset: () =>
		set({
			packetType: 'gaussian',
			k_center: 8.0,
			sigma_k: 2.0,
			x_center: 0.0,
			nWaves: 80,
			time: 0,
		}),
	loadWidePreset: () =>
		set({
			packetType: 'gaussian',
			k_center: 3.0,
			sigma_k: 0.5,
			x_center: 0.0,
			nWaves: 30,
			time: 0,
		}),
}));
