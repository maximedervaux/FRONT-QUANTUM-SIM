'use client';
import dynamic from 'next/dynamic';
import type { Layout, Data } from 'plotly.js';
import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { usePythonFunction } from '../../../hooks/usePythonFunction';
import styles from './ChartSchrodinger.module.css';
import { useWavePacketStore } from '../../../store/wave-packet.store';
import { useSchrodingerStore } from '../../../store/schrodinger.store';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

function ChartSchrodinger() {
	const isExecutingRef = useRef(false);
	const pendingParamsRef = useRef<any>(null);
	const [schrodingerData, setSchrodingerData] = useState<{ x: number[]; prob: number[][] } | null>(
		null
	);

	const { potentialType } = useSchrodingerStore();

	// Récupération du paquet d'ondes précédemment construit
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

	const runExecution = useCallback(async (params: any) => {
		if (!isReadyRef.current) return;

		if (isExecutingRef.current) {
			pendingParamsRef.current = params;
			return;
		}

		isExecutingRef.current = true;
		try {
			const result = await executePacketRef.current(params);
			const [x, prob] = result;

			setSchrodingerData({ x, prob });
		} catch (err) {
			console.error('[ChartWavePacket] Erreur:', err);
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
			nWaves,
			time,
			xMin,
			xMax,
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
					name: 'ψ²',
					line: { width: 2, shape: 'spline' },
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

	const plotLayout: Partial<Layout> = {
		xaxis: {
			showgrid: true,
		},
		yaxis: {
			showgrid: true,
			range: schrodingerData
				? [
						0,
						schrodingerData.prob.reduce((max, frame) => {
							const frameMax = Math.max(...frame);
							return Math.max(max, frameMax);
						}, 0) * 1.1,
					]
				: undefined,
		},
		margin: { t: 10, l: 60, r: 60, b: 50 },
		legend: { x: 1.02, y: 1, xanchor: 'left' },
		hovermode: 'closest',
	};

	return (
		<div className={styles.chart}>
			<Plot
				data={plotData}
				layout={{
					...plotLayout,
					updatemenus: [
						{
							type: 'buttons',
							buttons: [
								{
									label: 'Play',
									method: 'animate',
									args: [null, { frame: { duration: 50, redraw: true } }],
								},
								{
									label: 'Stop',
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
			/>
		</div>
	);
}

export default memo(ChartSchrodinger);
