'use client';

import dynamic from 'next/dynamic';
import type { Layout, Data } from 'plotly.js';
import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { usePythonFunction } from '../../../hooks/usePythonFunction';
import styles from './ChartSchrodinger.module.css';
import { useWavePacketStore } from '../../../store/wave-packet.store';
import { useSchrodingerStore } from '../../../store/schrodinger.store';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface SchrodingerData {
	x: number[];
	prob: number[][];
}

function ChartSchrodinger() {
	const isExecutingRef = useRef(false);
	const pendingParamsRef = useRef<Record<string, unknown> | null>(null);
	const [schrodingerData, setSchrodingerData] = useState<SchrodingerData | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const { potentialType } = useSchrodingerStore();
	const { k_center, sigma_k, x_center, nWaves, time, xMin, xMax } = useWavePacketStore();

	const { execute: executePacket, isReady: isPacketReady } = usePythonFunction(
		'schrodinger_solver',
		'schrodinger_solving_function'
	);

	const executePacketRef = useRef(executePacket);
	const isReadyRef = useRef(isPacketReady);

	useEffect(() => {
		executePacketRef.current = executePacket;
		isReadyRef.current = isPacketReady;
	}, [executePacket, isPacketReady]);

	const runExecution = useCallback(async (params: Record<string, unknown>) => {
		if (!isReadyRef.current) return;

		if (isExecutingRef.current) {
			pendingParamsRef.current = params;
			return;
		}

		isExecutingRef.current = true;
		setIsLoading(true);

		try {
			const [x, prob] = await executePacketRef.current(params);
			setSchrodingerData({ x, prob });
		} catch (err) {
			console.error("[ChartSchrodinger] Erreur lors de l'exécution:", err);
		} finally {
			isExecutingRef.current = false;
			setIsLoading(false);

			if (pendingParamsRef.current) {
				const pending = pendingParamsRef.current;
				pendingParamsRef.current = null;
				runExecution(pending);
			}
		}
	}, []);

	useEffect(() => {
		const params = {
			k_center,
			sigma_k,
			x_center,
			n_waves: nWaves,
			time,
			x_min: xMin,
			x_max: xMax,
			potential_type: potentialType,
		};

		runExecution(params);
	}, [k_center, sigma_k, x_center, nWaves, time, xMin, xMax, potentialType, runExecution]);

	const plotData: Data[] = schrodingerData
		? [
				{
					x: schrodingerData.x,
					y: schrodingerData.prob[0],
					type: 'scatter',
					mode: 'lines',
					name: 'ψ²(x)',
					line: {
						width: 2,
						shape: 'spline',
						color: '#3b82f6',
					},
					hovertemplate: '<b>Position</b>: %{x:.2f}<br><b>Prob.</b>: %{y:.4f}<extra></extra>',
				},
			]
		: [];

	const frames = schrodingerData
		? schrodingerData.prob.map((frame, i) => ({
				name: i.toString(),
				data: [{ x: schrodingerData.x, y: frame }],
				traces: [0],
				group: 'animation',
				baseframe: '',
				layout: {},
			}))
		: [];

	const yMax = schrodingerData
		? schrodingerData.prob.reduce((max, frame) => {
				const frameMax = Math.max(...frame);
				return Math.max(max, frameMax);
			}, 0) * 1.1
		: undefined;

	const shapes =
		potentialType === 'infiniteWell'
			? [
					// Mur gauche
					{
						type: 'rect',
						x0: -3.6 * 2 + xMin,
						x1: -3.6,
						y0: 0,
						y1: yMax,
						fillcolor: 'rgba(0,0,0,0.1)',
						line: { width: 0 },
						layer: 'below',
					},
					// Mur droit
					{
						type: 'rect',
						x0: 3.6,
						x1: 3.6 * 2 + xMax,
						y0: 0,
						y1: yMax,
						fillcolor: 'rgba(0,0,0,0.1)',
						line: { width: 0 },
						layer: 'below',
					},
				]
			: [];

	const plotLayout: Partial<Layout> = {
		title: {
			text: `Puits Infini - Évolution Temporelle (k₀=${k_center}, σₖ=${sigma_k})`,
			font: { size: 14 },
		},
		xaxis: {
			title: { text: 'Position x' },
			showgrid: true,
			gridwidth: 1,
			gridcolor: '#e5e7eb',
		},
		yaxis: {
			title: { text: 'Densité de probabilité |ψ|²' },
			showgrid: true,
			gridwidth: 1,
			gridcolor: '#e5e7eb',
			range: [0, yMax],
		},
		margin: { t: 60, l: 70, r: 60, b: 60 },
		legend: { x: 1.02, y: 1, xanchor: 'left', yanchor: 'top' },
		hovermode: 'closest',
		plot_bgcolor: '#f9fafb',
		paper_bgcolor: '#ffffff',
		shapes,
	};

	const plotConfig = {
		responsive: true,
		displayModeBar: true,
		displaylogo: false,
		modeBarButtonsToRemove: ['lasso2d', 'select2d'] as any,
	};

	return (
		<div className={styles.chart}>
			{isLoading && (
				<div className={styles.loadingOverlay}>
					<span className={styles.spinner} />
					Calcul en cours...
				</div>
			)}

			<Plot
				data={plotData}
				layout={{
					...plotLayout,
					updatemenus: [
						{
							type: 'buttons',
							showactive: false,
							buttons: [
								{
									label: '▶ Lecture',
									method: 'animate',
									args: [null, { frame: { duration: 50, redraw: true } }],
								},
								{
									label: '⏸ Pause',
									method: 'animate',
									args: [
										null,
										{
											mode: 'immediate',
											frame: { duration: 0, redraw: false },
											transition: { duration: 0 },
										},
									],
								},
							],
						},
					],
				}}
				frames={frames}
				config={plotConfig}
			/>
		</div>
	);
}

export default memo(ChartSchrodinger);
