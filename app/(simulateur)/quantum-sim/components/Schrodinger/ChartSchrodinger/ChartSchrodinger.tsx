'use client';

import dynamic from 'next/dynamic';
import type { Data, Shape, Frame } from 'plotly.js';
import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { usePythonFunction } from '../../../hooks/usePythonFunction';
import styles from './ChartSchrodinger.module.css';
import { useWavePacketStore } from '../../../store/wave-packet.store';
import { useSchrodingerStore } from '../../../store/schrodinger.store';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });
const ThreeChartSchrodinger = dynamic(
	() => import('../ThreeChartSchrodinger/ThreeChartSchrodinger'),
	{
		ssr: false,
	}
);

interface SchrodingerData {
	x: number[];
	prob: number[][];
}

function ChartSchrodinger() {
	const isExecutingRef = useRef(false);
	const pendingParamsRef = useRef<Record<string, unknown> | null>(null);
	const [schrodingerData, setSchrodingerData] = useState<SchrodingerData | null>(null);

	const {
		potentialType,
		wellWidth,
		stepHeight,
		barrierWidth,
		barrierHeight,
		timeSteps,
		spatialPoints,
		absorbingBoundaries,
		viewMode,
	} = useSchrodingerStore();
	const { k_center, sigma_k, x_center, nWaves, xMin, xMax } = useWavePacketStore();

	const { execute: executePotential, isReady: isPacketReady } = usePythonFunction(
		'schrodinger_solver',
		'schrodinger_solving_function'
	);

	const executePotentialRef = useRef(executePotential);
	const isReadyRef = useRef(isPacketReady);

	useEffect(() => {
		executePotentialRef.current = executePotential;
		isReadyRef.current = isPacketReady;
	}, [executePotential, isPacketReady]);

	const runExecution = useCallback(async (params: Record<string, unknown>) => {
		if (!isReadyRef.current) return;

		if (isExecutingRef.current) {
			pendingParamsRef.current = params;
			return;
		}

		isExecutingRef.current = true;

		try {
			const [x, prob] = await executePotentialRef.current(params);
			setSchrodingerData({ x, prob });
		} catch (err) {
			console.error("[ChartSchrodinger] Erreur lors de l'exécution:", err);
		} finally {
			isExecutingRef.current = false;

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
			x_min: Number(xMin),
			x_max: Number(xMax),
			potential_type: potentialType,
			well_width: wellWidth,
			step_height: stepHeight,
			barrier_width: barrierWidth,
			barrier_height: barrierHeight,
			time_steps: timeSteps,
			spatial_points: spatialPoints,
			absorbing_boundaries: absorbingBoundaries,
		};

		runExecution(params);
	}, [
		k_center,
		sigma_k,
		x_center,
		nWaves,
		xMin,
		xMax,
		potentialType,
		wellWidth,
		stepHeight,
		barrierWidth,
		barrierHeight,
		timeSteps,
		spatialPoints,
		absorbingBoundaries,
		runExecution,
	]);

	const plotData: Data[] = schrodingerData
		? [
				{
					x: schrodingerData.x,
					y: schrodingerData.prob[0],
					type: 'scatter',
					mode: 'lines',
					name: '|ψ|²(x,t)',
					line: {
						width: 2,
						shape: 'spline',
						color: '#3b82f6',
					},
					hovertemplate: '<b>Position</b>: %{x:.2f}<br><b>Prob.</b>: %{y:.4f}<extra></extra>',
				},
			]
		: [];

	const frames: Frame[] = schrodingerData
		? schrodingerData.prob.map((frame, i) => ({
				name: i.toString(),
				data: [{ x: schrodingerData.x, y: frame, type: 'scatter', mode: 'lines' }],
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

	const shapes: Partial<Shape>[] = [];

	// Ajouter les formes de potentiel selon le type
	if (potentialType === 'infiniteWell' && yMax) {
		const wellLeft = -wellWidth / 2;
		const wellRight = wellWidth / 2;

		shapes.push(
			// Mur gauche
			{
				type: 'rect',
				x0: Number(xMin) - 20,
				x1: wellLeft,
				y0: 0,
				y1: yMax,
				fillcolor: 'rgba(100, 100, 100, 0.2)',
				line: { width: 2, color: 'rgba(100, 100, 100, 0.5)' },
				layer: 'below',
			},
			// Mur droit
			{
				type: 'rect',
				x0: wellRight,
				x1: Number(xMax) + 20,
				y0: 0,
				y1: yMax,
				fillcolor: 'rgba(100, 100, 100, 0.2)',
				line: { width: 2, color: 'rgba(100, 100, 100, 0.5)' },
				layer: 'below',
			}
		);
	} else if (potentialType === 'step' && yMax) {
		shapes.push({
			type: 'rect',
			x0: 0,
			x1: Number(xMax) + 20,
			y0: 0,
			y1: yMax,
			fillcolor: 'rgba(220, 100, 100, 0.15)',
			line: { width: 2, color: 'rgba(220, 100, 100, 0.5)' },
			layer: 'below',
		});
	} else if (potentialType === 'barrier' && yMax) {
		const barrierLeft = -barrierWidth / 2;
		const barrierRight = barrierWidth / 2;

		shapes.push({
			type: 'rect',
			x0: barrierLeft,
			x1: barrierRight,
			y0: 0,
			y1: yMax,
			fillcolor: 'rgba(100, 150, 220, 0.15)',
			line: { width: 2, color: 'rgba(100, 150, 220, 0.5)' },
			layer: 'below',
		});
	}

	const potentialLabel = {
		free: 'Particule libre',
		infiniteWell: `Puits infini (L=${wellWidth.toFixed(1)})`,
		step: `Marche V=${stepHeight.toFixed(0)} eV`,
		barrier: `Barrière tunnel (h=${barrierHeight.toFixed(0)}, w=${barrierWidth.toFixed(1)})`,
	};

	const plotLayout: any = {
		title: {
			text: `${potentialLabel[potentialType as keyof typeof potentialLabel]} - Évolution Temporelle (k₀=${k_center}, σₖ=${sigma_k})`,
			font: { size: 14 },
		},
		xaxis: {
			title: { text: 'Position x (m)' },
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
		margin: { t: 80, l: 70, r: 60, b: 60 },
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
		<div className={styles.chartWrapper}>
			{/* Vue 2D */}
			{viewMode === '2d' && (
				<>
					<div className={styles.chart}>
						<Plot
							data={plotData}
							style={{ width: '100%', height: '100%', overflow: 'hidden' }}
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
													[],
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
				</>
			)}

			{viewMode === '3d' && potentialType === 'infiniteWell' && (
				<ThreeChartSchrodinger
					data={schrodingerData}
					potentialType={potentialType}
					wellWidth={wellWidth}
					barrierWidth={barrierWidth}
					showWireframe={true}
				/>
			)}
		</div>
	);
}

export default memo(ChartSchrodinger);
