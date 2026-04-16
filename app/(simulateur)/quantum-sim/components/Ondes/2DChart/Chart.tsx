'use client';
import dynamic from 'next/dynamic';
import type { Layout } from 'plotly.js';
import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { usePythonFunction } from '../../../hooks/usePythonFunction';
import styles from './Chart.module.css';
import { useWaveStore } from '../../../store/onde.store';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface WaveData {
  x: number[];
  yReal: number[];
  yImag?: number[];
}

function Chart() {
  const { harmonicAmplitudes, phase, harmonics, wavelength, period, time, showImaginary } = useWaveStore();

  const [waves, setWaves] = useState<WaveData[]>([]);

  const isExecutingRef = useRef(false);
  const pendingParamsRef = useRef<any>(null);

  const { execute: executeReal, isReady } = usePythonFunction('plane_wave', 'generate_plane_waves', 'real');
  const { execute: executeImag } = usePythonFunction('plane_wave', 'generate_plane_waves', 'imag');
  const executeRealRef = useRef(executeReal);
  const executeImagRef = useRef(executeImag);
  const isReadyRef = useRef(isReady);

  useEffect(() => {
    executeRealRef.current = executeReal;
    executeImagRef.current = executeImag;
    isReadyRef.current = isReady;
  }, [executeReal, executeImag, isReady]);

  const runExecution = useCallback(async (params: any) => {
    if (!isReadyRef.current) return;
    if (isExecutingRef.current) {
      pendingParamsRef.current = params;
      return;
    }

    isExecutingRef.current = true;
    try {
      const realResult = (await executeRealRef.current(params)) as [number[], number[]][];
      const imagResult = showImaginary
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
      console.error('[Chart] Erreur:', err);
    } finally {
      isExecutingRef.current = false;
      if (pendingParamsRef.current) {
        const pending = pendingParamsRef.current;
        pendingParamsRef.current = null;
        runExecution(pending);
      }
    }
  }, [showImaginary]);

  useEffect(() => {
    const harmonic_amplitudes = Array.from(
      { length: harmonics },
      (_, i) => harmonicAmplitudes[i + 1] ?? 1.0
    );

    const params = { harmonics, wavelength, period, phase, time, harmonic_amplitudes };
    runExecution(params);
  }, [harmonicAmplitudes, phase, time, harmonics, wavelength, period, showImaginary, runExecution]);

  const plotData = waves.flatMap((wave, idx) => {
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
  });

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
        data={plotData}
        layout={plotLayout}
        style={{ width: '100%', height: '100%', overflow: 'hidden' }}
        config={{ responsive: true, displayModeBar: true }}
      />
    </div>
  );
}

export default memo(Chart);