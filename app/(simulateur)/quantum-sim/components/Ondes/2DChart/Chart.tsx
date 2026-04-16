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
  y: number[];
}

function Chart() {
  const { harmonicAmplitudes, phase, harmonics, wavelength, period, time } = useWaveStore();

  const [waves, setWaves] = useState<WaveData[]>([]);

  const isExecutingRef = useRef(false);
  const pendingParamsRef = useRef<any>(null);

  const { execute, isReady } = usePythonFunction('plane_wave', 'generate_plane_waves');
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
      const result = (await executeRef.current(params)) as [number[], number[]][];

      setWaves(result.map(([x, y]) => ({ x, y })));
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
    const harmonic_amplitudes = Array.from(
      { length: harmonics },
      (_, i) => harmonicAmplitudes[i + 1] ?? 1.0
    );
    const params = { harmonics, wavelength, period, phase, time, harmonic_amplitudes };
    runExecution(params);
  }, [harmonicAmplitudes, phase, time, harmonics, wavelength, period, runExecution]);

  const plotData = waves.map((wave, idx) => ({
    x: wave.x,
    y: wave.y,
    type: 'scatter' as const,
    mode: 'lines' as const,
    name: `Harmonique ${idx + 1}`,
    line: { width: 2 },
  }));

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