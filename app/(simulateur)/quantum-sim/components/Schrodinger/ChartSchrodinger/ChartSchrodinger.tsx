'use client';

import dynamic from 'next/dynamic';
import type { Data, Shape } from 'plotly.js';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { usePythonFunction } from '../../../hooks/usePythonFunction';
import { useSchrodingerStore } from '../../../store/schrodinger.store';
import { useWavePacketStore } from '../../../store/wave-packet.store';
import styles from './ChartSchrodinger.module.css';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });
const ThreeChartSchrodinger = dynamic(
	() => import('../ThreeChartSchrodinger/ThreeChartSchrodinger'),
	{ ssr: false }
);

// ─── Types ─────────────────────────────────────────────────────────────────

interface SchrodingerData {
	x: number[];
	prob: number[][];
	real?: number[][];   // Re(ψ(x,t))
	imag?: number[][];   // Im(ψ(x,t))
}

// ─── Component ─────────────────────────────────────────────────────────────

function ChartSchrodinger() {
	const isExecutingRef   = useRef(false);
	const pendingParamsRef = useRef<Record<string, unknown> | null>(null);

	const [schrodingerData, setSchrodingerData] = useState<SchrodingerData | null>(null);
	const [currentTimeSlice, setCurrentTimeSlice] = useState(0);

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
		isAnimatingTime,
	} = useSchrodingerStore();

	const { k_center, sigma_k, x_center, nWaves, xMin, xMax } = useWavePacketStore();

	const { execute: executePotential, isReady: isPacketReady } = usePythonFunction(
		'schrodinger_solver',
		'schrodinger_solving_function'
	);

	const executePotentialRef = useRef(executePotential);
	const isReadyRef          = useRef(isPacketReady);

	useEffect(() => {
		executePotentialRef.current = executePotential;
		isReadyRef.current          = isPacketReady;
	}, [executePotential, isPacketReady]);

	// ── Execution queue ────────────────────────────────────────────────────

	const runExecution = useCallback(async (params: Record<string, unknown>) => {
		if (!isReadyRef.current) return;

		if (isExecutingRef.current) {
			pendingParamsRef.current = params;
			return;
		}

		isExecutingRef.current = true;

		try {
			/**
			 * Expected return from Python: [x, prob, real?, imag?]
			 *   x    — float[] of spatial positions
			 *   prob — float[][] of |ψ|² per time step
			 *   real — float[][] of Re(ψ) per time step   (optional, needed for 3D spiral)
			 *   imag — float[][] of Im(ψ) per time step   (optional, needed for 3D spiral)
			 */
			const result = await executePotentialRef.current(params);
			const [x, prob, real, imag] = result as [
				number[],
				number[][],
				number[][] | undefined,
				number[][] | undefined,
			];

			setSchrodingerData({ x, prob, real, imag });
		} catch (err) {
			console.error("[ChartSchrodinger] Erreur lors de l'exécution:", err);
		} finally {
			isExecutingRef.current = false;

			if (pendingParamsRef.current) {
				const pending = pendingParamsRef.current;
				pendingParamsRef.current = null;
				void runExecution(pending);
			}
		}
	}, []);

	// ── Trigger execution on param change ─────────────────────────────────

	useEffect(() => {
		const params = {
			k_center,
			sigma_k,
			x_center,
			n_waves:             nWaves,
			x_min:               Number(xMin),
			x_max:               Number(xMax),
			potential_type:      potentialType,
			well_width:          wellWidth,
			step_height:         stepHeight,
			barrier_width:       barrierWidth,
			barrier_height:      barrierHeight,
			time_steps:          timeSteps,
			spatial_points:      spatialPoints,
			absorbing_boundaries: absorbingBoundaries,
		};

		void runExecution(params);
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

	// ── Reset time on new data ─────────────────────────────────────────────

	useEffect(() => {
		if (!schrodingerData) return;
		setCurrentTimeSlice(0);
	}, [schrodingerData]);

	// ── 2D animation loop ──────────────────────────────────────────────────

	useEffect(() => {
		if (!isAnimatingTime || !schrodingerData || schrodingerData.prob.length <= 1) return;

		const interval = window.setInterval(() => {
			setCurrentTimeSlice(t => (t + 1) % schrodingerData.prob.length);
		}, 50);

		return () => window.clearInterval(interval);
	}, [isAnimatingTime, schrodingerData]);

	// ── 2D Plotly data ─────────────────────────────────────────────────────

	const plotData: Data[] = schrodingerData
		? [
				{
					x:    schrodingerData.x,
					y:    schrodingerData.prob[currentTimeSlice] ?? schrodingerData.prob[0],
					type: 'scatter',
					mode: 'lines',
					name: '|ψ|²(x,t)',
					line: { width: 2, shape: 'spline', color: '#3b82f6' },
					hovertemplate: '<b>Position</b>: %{x:.2f}<br><b>Prob.</b>: %{y:.4f}<extra></extra>',
				},
			]
		: [];

	const yMax = schrodingerData
		? schrodingerData.prob.reduce((max, frame) => {
				const fm = Math.max(...frame);
				return Math.max(max, fm);
			}, 0) * 1.1
		: undefined;

	const shapes: Partial<Shape>[] = [];

	if (potentialType === 'infiniteWell' && yMax) {
		const wellLeft  = -wellWidth / 2;
		const wellRight =  wellWidth / 2;

		shapes.push(
			{
				type: 'rect', x0: Number(xMin) - 20, x1: wellLeft,
				y0: 0, y1: yMax, layer: 'below',
				fillcolor: 'rgba(100,100,100,0.2)',
				line:      { width: 2, color: 'rgba(100,100,100,0.5)' },
			},
			{
				type: 'rect', x0: wellRight, x1: Number(xMax) + 20,
				y0: 0, y1: yMax, layer: 'below',
				fillcolor: 'rgba(100,100,100,0.2)',
				line:      { width: 2, color: 'rgba(100,100,100,0.5)' },
			}
		);
	} else if (potentialType === 'step' && yMax) {
		shapes.push({
			type: 'rect', x0: 0, x1: Number(xMax) + 20,
			y0: 0, y1: yMax, layer: 'below',
			fillcolor: 'rgba(220,100,100,0.15)',
			line:      { width: 2, color: 'rgba(220,100,100,0.5)' },
		});
	} else if (potentialType === 'barrier' && yMax) {
		shapes.push({
			type: 'rect',
			x0: -barrierWidth / 2, x1: barrierWidth / 2,
			y0: 0, y1: yMax, layer: 'below',
			fillcolor: 'rgba(100,150,220,0.15)',
			line:      { width: 2, color: 'rgba(100,150,220,0.5)' },
		});
	}

	const potentialLabel = {
		free:         'Particule libre',
		infiniteWell: `Puits infini (L=${wellWidth.toFixed(1)})`,
		step:         `Marche V=${stepHeight.toFixed(0)} eV`,
		barrier:      `Barrière tunnel (h=${barrierHeight.toFixed(0)}, w=${barrierWidth.toFixed(1)})`,
	};

	const currentTimeLabel = schrodingerData
		? `${currentTimeSlice + 1}/${schrodingerData.prob.length}`
		: '0/0';

	const plotLayout: any = {
		title: {
			text: `${potentialLabel[potentialType as keyof typeof potentialLabel]} — Frame ${currentTimeLabel} (k₀=${k_center}, σₖ=${sigma_k})`,
			font: { size: 13 },
		},
		xaxis: { title: { text: 'Position x (m)' }, showgrid: true, gridwidth: 1, gridcolor: '#e5e7eb' },
		yaxis: { title: { text: 'Densité de probabilité |ψ|²' }, showgrid: true, gridwidth: 1, gridcolor: '#e5e7eb', range: [0, yMax] },
		margin:        { t: 70, l: 70, r: 60, b: 60 },
		legend:        { x: 1.02, y: 1, xanchor: 'left', yanchor: 'top' },
		hovermode:     'closest',
		plot_bgcolor:  '#f9fafb',
		paper_bgcolor: '#ffffff',
		shapes,
	};

	const plotConfig = {
		responsive:               true,
		displayModeBar:           true,
		displaylogo:              false,
		modeBarButtonsToRemove:   ['lasso2d', 'select2d'] as any,
	};

	// ── Render ─────────────────────────────────────────────────────────────

	return (
		<div className={styles.chartWrapper}>
			{viewMode === '2d' && (
				<div className={styles.chart}>
					<Plot
						data={plotData}
						layout={plotLayout}
						style={{ width: '100%', height: '100%', overflow: 'hidden' }}
						config={plotConfig}
					/>
				</div>
			)}

			{viewMode === '3d' && potentialType === 'infiniteWell' && (
				<ThreeChartSchrodinger
					data={schrodingerData}
					potentialType={potentialType}
					wellWidth={wellWidth}
					barrierWidth={barrierWidth}
					showWireframe={false}
				/>
			)}
		</div>
	);
}

export default memo(ChartSchrodinger);