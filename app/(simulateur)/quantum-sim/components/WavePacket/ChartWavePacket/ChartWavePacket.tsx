'use client';
import dynamic from 'next/dynamic';
import type { Layout, Data } from 'plotly.js';
import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { usePythonFunction } from '../../../hooks/usePythonFunction';
import styles from './ChartWavePacket.module.css';
import { useWavePacketStore } from '../../../store/wave-packet.store';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface WavePacketData {
	x: number[];
	y: number[];
	y_imag?: number[];
	amplitude?: number[];
}

function ChartWavePacket() {
	const {
		packetType,
		k_center,
		sigma_k,
		x_center,
		nWaves,
		xMin,
		xMax,
		visualizationMode,
		customWaves,
	} = useWavePacketStore();

	const [packetData, setPacketData] = useState<WavePacketData | null>(null);

	const isExecutingRef = useRef(false);
	const pendingParamsRef = useRef<any>(null);

	const { execute: executePacket, isReady: isPacketReady } = usePythonFunction(
		'wave_packet',
		'generate_wave_packet'
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
			setPacketData(result as WavePacketData);
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
		const custom_waves = customWaves.map((w: any) => ({
			amplitude: w.amplitude,
			waveNumber: w.waveNumber,
			phase: w.phase,
			enabled: w.enabled,
		}));

		const params = {
			packet_type: packetType,
			k_center,
			sigma_k,
			x_center,
			n_waves: nWaves,
			x_min: xMin,
			x_max: xMax,
			visualization_mode: visualizationMode,
			custom_waves,
		};

		runExecution(params);
	}, [
		packetType,
		k_center,
		sigma_k,
		x_center,
		nWaves,
		xMin,
		xMax,
		visualizationMode,
		customWaves,
		runExecution,
	]);

	if (!packetData) {
		return (
			<div className={styles.chart} data-tour="packet-chart">
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						height: '100%',
					}}
				>
					Chargement...
				</div>
			</div>
		);
	}

	const plotData: Data[] = [];

	if (visualizationMode === 'wavefunction') {
		plotData.push({
			x: packetData.x,
			y: packetData.y,
			type: 'scatter',
			mode: 'lines',
			name: 'Re(ψ)',
			line: { width: 2, color: '#6366f1' },
		} as Data);

		if (packetData.y_imag) {
			plotData.push({
				x: packetData.x,
				y: packetData.y_imag,
				type: 'scatter',
				mode: 'lines',
				name: 'Im(ψ)',
				line: { width: 2, color: '#ec4899', dash: 'dash' },
			} as Data);
		}
	} else if (visualizationMode === 'probability') {
		plotData.push({
			x: packetData.x,
			y: packetData.y,
			type: 'scatter',
			mode: 'lines',
			name: '|ψ|²',
			line: { width: 2, color: '#f59e0b' },
			fill: 'tozeroy',
			fillcolor: 'rgba(245, 158, 11, 0.2)',
		} as Data);
	}

	const getAxisLabels = () => {
		switch (visualizationMode) {
			case 'wavefunction':
				return { x: 'Position x (m)', y: 'ψ(x,t)' };
			case 'probability':
				return { x: 'Position x (m)', y: '|ψ(x,t)|²' };
			default:
				return { x: 'x', y: 'y' };
		}
	};

	const axisLabels = getAxisLabels();

	const plotLayout: Partial<Layout> = {
		xaxis: {
			title: { text: axisLabels.x },
			showgrid: true,
		},
		yaxis: {
			title: { text: axisLabels.y },
			showgrid: true,
		},
		margin: { t: 10, l: 60, r: 60, b: 50 },
		showlegend: visualizationMode === 'wavefunction',
		legend: { x: 1.02, y: 1, xanchor: 'left' },
		hovermode: 'closest',
	};

	return (
		<div className={styles.chart} data-tour="packet-chart">
			<Plot
				data={plotData}
				layout={plotLayout}
				style={{ width: '100%', height: '100%', overflow: 'hidden' }}
				config={{ responsive: true, displayModeBar: true }}
			/>
		</div>
	);
}

export default memo(ChartWavePacket);
