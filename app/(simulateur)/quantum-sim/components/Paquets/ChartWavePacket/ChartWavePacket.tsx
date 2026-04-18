'use client';
import dynamic from 'next/dynamic';
import type { Layout, Data } from 'plotly.js';
import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { usePythonFunction } from '../../../hooks/usePythonFunction';
import styles from './Chart.module.css';
import { useWavePacketStore } from '../../../store/wave-packet.store';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface WavePacketData {
	x: number[];
	y: number[];
	y_imag?: number[];
	envelope?: number[];
	amplitude?: number[];
}

interface IndividualWaveData {
	x: number[];
	y: number[];
}

function ChartWavePacket() {
	const {
		packetType,
		k_center,
		sigma_k,
		x_center,
		nWaves,
		time,
		xMin,
		xMax,
		visualizationMode,
		showEnvelope,
		showIndividualWaves,
		customWaves,
	} = useWavePacketStore();

	const [packetData, setPacketData] = useState<WavePacketData | null>(null);
	const [individualWaves, setIndividualWaves] = useState<IndividualWaveData[]>([]);

	const isExecutingRef = useRef(false);
	const pendingParamsRef = useRef<any>(null);

	const { execute: executePacket, isReady: isPacketReady } = usePythonFunction(
		'wave_packet',
		'generate_wave_packet'
	);
	const { execute: executeIndividual, isReady: isIndividualReady } = usePythonFunction(
		'wave_packet',
		'generate_individual_waves'
	);

	const executePacketRef = useRef(executePacket);
	const executeIndividualRef = useRef(executeIndividual);
	const isReadyRef = useRef(isPacketReady && isIndividualReady);

	useEffect(() => {
		executePacketRef.current = executePacket;
		executeIndividualRef.current = executeIndividual;
		isReadyRef.current = isPacketReady && isIndividualReady;
	}, [executePacket, executeIndividual, isPacketReady, isIndividualReady]);

	const runExecution = useCallback(async (params: any) => {
		if (!isReadyRef.current) return;

		if (isExecutingRef.current) {
			pendingParamsRef.current = params;
			return;
		}

		isExecutingRef.current = true;
		try {
			// Generate main wave packet
			const result = await executePacketRef.current(params);
			setPacketData(result as WavePacketData);

			// Generate individual waves if requested
			if (params.show_individual_waves) {
				const individualParams = { ...params };
				delete individualParams.visualization_mode;
				const waves = await executeIndividualRef.current(individualParams);
				setIndividualWaves((waves as [number[], number[]][]).map(([x, y]) => ({ x, y })));
			} else {
				setIndividualWaves([]);
			}
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
			time,
			x_min: xMin,
			x_max: xMax,
			visualization_mode: visualizationMode,
			custom_waves,
			show_individual_waves: showIndividualWaves,
		};

		runExecution(params);
	}, [
		packetType,
		k_center,
		sigma_k,
		x_center,
		nWaves,
		time,
		xMin,
		xMax,
		visualizationMode,
		customWaves,
		showIndividualWaves,
		runExecution,
	]);

	if (!packetData) {
		return (
			<div className={styles.chart}>
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

	// Build plot data based on visualization mode
	const plotData: Data[] = [];

	// Individual waves (if enabled)
	if (showIndividualWaves && individualWaves.length > 0) {
		individualWaves.forEach((wave, idx) => {
			plotData.push({
				x: wave.x,
				y: wave.y,
				type: 'scatter',
				mode: 'lines',
				name: `Onde ${idx + 1}`,
				line: { width: 0.5, color: 'rgba(150, 150, 150, 0.3)' },
				showlegend: false,
			} as Data);
		});
	}

	// Main wave packet
	if (visualizationMode === 'wavefunction') {
		// Real part
		plotData.push({
			x: packetData.x,
			y: packetData.y,
			type: 'scatter',
			mode: 'lines',
			name: 'Re(ψ)',
			line: { width: 2, color: '#6366f1' },
		} as Data);

		// Imaginary part (optional)
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

		// Envelope
		if (showEnvelope && packetData.envelope) {
			plotData.push({
				x: packetData.x,
				y: packetData.envelope,
				type: 'scatter',
				mode: 'lines',
				name: 'Enveloppe',
				line: { width: 1.5, color: '#22c55e', dash: 'dot' },
			} as Data);
			plotData.push({
				x: packetData.x,
				y: packetData.envelope.map(v => -v),
				type: 'scatter',
				mode: 'lines',
				name: 'Enveloppe -',
				line: { width: 1.5, color: '#22c55e', dash: 'dot' },
				showlegend: false,
			} as Data);
		}
	} else if (visualizationMode === 'probability') {
		// Probability density
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

		// Envelope for probability
		if (showEnvelope && packetData.envelope) {
			plotData.push({
				x: packetData.x,
				y: packetData.envelope,
				type: 'scatter',
				mode: 'lines',
				name: 'Enveloppe',
				line: { width: 1.5, color: '#22c55e', dash: 'dot' },
			} as Data);
		}
	} else if (visualizationMode === 'fourier') {
		// Fourier transform
		plotData.push({
			x: packetData.x,
			y: packetData.y,
			type: 'scatter',
			mode: 'lines',
			name: '|ψ(k)|',
			line: { width: 2, color: '#8b5cf6' },
			fill: 'tozeroy',
			fillcolor: 'rgba(139, 92, 246, 0.2)',
		} as Data);
	} else if (visualizationMode === 'phase') {
		// Phase visualization with amplitude
		if (packetData.amplitude) {
			plotData.push({
				x: packetData.x,
				y: packetData.amplitude,
				type: 'scatter',
				mode: 'lines',
				name: '|ψ|',
				line: { width: 1, color: 'rgba(100, 100, 100, 0.5)' },
				yaxis: 'y2',
			} as Data);
		}
		plotData.push({
			x: packetData.x,
			y: packetData.y,
			type: 'scatter',
			mode: 'lines',
			name: 'Phase',
			line: { width: 2, color: '#06b6d4' },
		} as Data);
	}

	// Axis labels
	const getAxisLabels = () => {
		switch (visualizationMode) {
			case 'wavefunction':
				return { x: 'Position x (m)', y: 'ψ(x,t)' };
			case 'probability':
				return { x: 'Position x (m)', y: '|ψ(x,t)|²' };
			case 'fourier':
				return { x: "Vecteur d'onde k (rad/m)", y: '|ψ(k)|' };
			case 'phase':
				return { x: 'Position x (m)', y: 'Phase (rad)' };
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
		...(visualizationMode === 'phase' && {
			yaxis2: {
				title: { text: '|ψ|' },
				overlaying: 'y',
				side: 'right',
				showgrid: false,
			},
		}),
		margin: { t: 10, l: 60, r: 60, b: 50 },
		showlegend: visualizationMode === 'wavefunction' || visualizationMode === 'phase',
		legend: { x: 1.02, y: 1, xanchor: 'left' },
		hovermode: 'closest',
	};

	return (
		<div className={styles.chart}>
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
