'use client';

import type { Layout } from 'plotly.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWaveStore } from '../store/onde.store';
import { usePythonFunction } from './usePythonFunction';

export interface WaveData {
	x: number[];
	yReal: number[];
	yImag?: number[];
}

interface PlaneWaveParams {
	harmonics: number;
	waveNumber: number;
	phase: number;
	time: number;
	harmonic_amplitudes: number[];
	x_min: number;
	x_max: number;
}

export function usePlaneWavesData() {
	const { harmonicAmplitudes, phase, harmonics, waveNumber, time, showImaginary, xMin, xMax } =
		useWaveStore();

	const [waves, setWaves] = useState<WaveData[]>([]);

	const isExecutingRef = useRef(false);
	const pendingParamsRef = useRef<PlaneWaveParams | null>(null);
	const showImaginaryRef = useRef(showImaginary);

	const { execute: executeReal, isReady } = usePythonFunction(
		'plane_wave',
		'generate_plane_waves',
		'real'
	);
	const { execute: executeImag } = usePythonFunction('plane_wave', 'generate_plane_waves', 'imag');

	const executeRealRef = useRef(executeReal);
	const executeImagRef = useRef(executeImag);
	const isReadyRef = useRef(isReady);

	useEffect(() => {
		executeRealRef.current = executeReal;
		executeImagRef.current = executeImag;
		isReadyRef.current = isReady;
		showImaginaryRef.current = showImaginary;
	}, [executeReal, executeImag, isReady, showImaginary]);

	const runExecution = useCallback(async (params: PlaneWaveParams) => {
		if (!isReadyRef.current) return;
		if (isExecutingRef.current) {
			pendingParamsRef.current = params;
			return;
		}

		isExecutingRef.current = true;
		try {
			const realResult = (await executeRealRef.current(params)) as [number[], number[]][];
			const imagResult = showImaginaryRef.current
				? ((await executeImagRef.current(params)) as [number[], number[]][])
				: null;

			setWaves(
				realResult.map(([x, y], idx) => ({
					x,
					yReal: y,
					yImag: imagResult?.[idx]?.[1],
				}))
			);
		} catch (err) {
			console.error('[usePlaneWavesData] Erreur:', err);
		} finally {
			isExecutingRef.current = false;
			if (pendingParamsRef.current) {
				const pending = pendingParamsRef.current;
				pendingParamsRef.current = null;
				void runExecution(pending);
			}
		}
	}, []);

	useEffect(() => {
		const harmonic_amplitudes = Array.from(
			{ length: harmonics },
			(_, i) => harmonicAmplitudes[i + 1] ?? 1.0
		);

		const params: PlaneWaveParams = {
			harmonics,
			waveNumber,
			phase,
			time,
			harmonic_amplitudes,
			x_min: xMin,
			x_max: xMax,
		};
		void runExecution(params);
	}, [
		harmonicAmplitudes,
		phase,
		time,
		harmonics,
		waveNumber,
		showImaginary,
		xMin,
		xMax,
		runExecution,
	]);

	const plotData = useMemo(
		() =>
			waves.flatMap(wave => {
				const realTrace = {
					x: wave.x,
					y: wave.yReal,
					type: 'scatter' as const,
					mode: 'lines' as const,
					name: '',
					line: { width: 2 },
					showlegend: false,
				};

				if (!showImaginary || !wave.yImag) {
					return [realTrace];
				}

				const imagTrace = {
					x: wave.x,
					y: wave.yImag,
					type: 'scatter' as const,
					mode: 'lines' as const,
					name: '',
					line: { width: 2, dash: 'dash' as const },
					showlegend: false,
				};

				return [realTrace, imagTrace];
			}),
		[waves, showImaginary]
	);

	const plotLayout: Partial<Layout> = useMemo(
		() => ({
			xaxis: {
				title: { text: 'Position x (m)' },
				showgrid: true,
			},
			yaxis: {
				title: { text: 'Amplitude |psi(x,t)|' },
				showgrid: true,
			},
			margin: { t: 10, l: 50, r: 10, b: 50 },
			showlegend: false,
			hovermode: 'closest' as const,
		}),
		[]
	);

	return { waves, plotData, plotLayout, showImaginary, isReady };
}
