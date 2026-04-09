'use client';
import dynamic from 'next/dynamic';
import type { Layout } from 'plotly.js';
import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { usePythonFunction } from '../../../hooks/usePythonFunction';
import styles from './Chart.module.css';
import { useWaveStore } from '../../../store/onde.store';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

function ChartWavePacket() {
	const { harmonics } = useWaveStore();

	const [xAxis, setXAxis] = useState<number[]>([]);
	const [yAxis, setYAxis] = useState<number[]>([]);
	const isExecutingRef = useRef(false);
	const pendingParamsRef = useRef<any>(null);

	const { execute, isReady } = usePythonFunction('wave_packet', 'generate_wave_packet');

	const executeRef = useRef(execute);
	const isReadyRef = useRef(isReady);

	useEffect(() => {
		executeRef.current = execute;
		isReadyRef.current = isReady;
	}, [execute, isReady]);

	const runExecution = useCallback(async (params: any) => {
		if (!isReadyRef.current) return;

		if (isExecutingRef.current) {
			pendingParamsRef.current = params;
			return;
		}

		isExecutingRef.current = true;
		try {
			const wavePacket = await executeRef.current(params);
			// wavePacket est un tableau de 2 Maps : [xMap, yMap]
			// On convertit chaque Map en tableau trié par clé
			const toSortedArray = (map: Map<number, number>) =>
				Array.from(map.entries())
					.sort(([a], [b]) => a - b)
					.map(([, v]) => v);

			setXAxis(wavePacket[0]);
			setYAxis(wavePacket[1]);
		} catch (err) {
			console.error('[Chart] Erreur:', err);
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
		runExecution({ harmonics });
	}, [harmonics, runExecution]);

	const plotLayout: Partial<Layout> = {
		xaxis: {
			title: { text: 'Position x (m)' },
			showgrid: true,
		},
		yaxis: {
			title: { text: 'Amplitude |ψ(x,t)|' },
			showgrid: true,
		},
		margin: { t: 10, l: 50, r: 10, b: 50 },
		showlegend: false,
		hovermode: 'closest' as any,
	};

	return (
		<div className={styles.chart}>
			<Plot
				data={[
					{
						x: xAxis,
						y: yAxis,
						type: 'scatter',
						mode: 'lines',
						line: { color: '#6366f1', width: 2 },
					},
				]}
				layout={plotLayout}
				style={{ width: '100%', height: '100%', overflow: 'hidden' }}
				config={{ responsive: true, displayModeBar: true }}
			/>
		</div>
	);
}

export default memo(ChartWavePacket);
