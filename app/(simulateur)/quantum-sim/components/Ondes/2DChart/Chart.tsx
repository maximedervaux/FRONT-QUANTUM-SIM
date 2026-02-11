'use client';
import dynamic from "next/dynamic";
import type { Layout, ScatterData } from 'plotly.js';
import { useEffect, useMemo, useState } from "react";
import { usePythonFunction } from '../../../hooks/usePythonFunction';
import styles from "./Chart.module.css";
import { useWaveStore } from "../../../store/onde.store";


const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function Chart() {
  const {
    phase,
    harmonics,
    wavelength,
    period,
    time
  } = useWaveStore();
  const [result, setResult] = useState<number[][]>([]);
  const [xAxis, setXAxis] = useState<number[]>([]);

  const { execute, isLoading, error, data, isReady } = usePythonFunction(
    'plane_wave',
    'generate_plane_waves'
  );

   useEffect(() => {
    if (!isReady) {
      console.log('[Chart] En attente du worker...');
      return;
    }
    execute({ harmonics, wavelength, period, phase, time })
      .then((waves: [number[], number[]][]) => {
        setResult(waves.map(([x, y]) => y));
        setXAxis(waves[0][0]);
        console.log("Xaxis: ", xAxis);
      })
      .catch((err) => {
        console.error('[Chart] Erreur:', err);
      });
    
  }, [harmonics, wavelength, period, phase, time, isReady]); 

  const plotData: ScatterData[] = useMemo(() => {
    return result.map((wave, idx) => ({
      x: xAxis,
      y: wave,
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: `Onde ${idx + 1}`,
    }));
  }, [result, xAxis]);

  const plotLayout = useMemo<Partial<Layout>>(() => ({
    title: "Amplitude de l'onde |ψ(x)|" as any,
    xaxis: { title: 'x (échantillons)' as any },
    yaxis: { title: '|ψ|' as any },
    margin: { t: 40, l: 50, r: 20, b: 40 },
  }), []);

  return (
    <div className={styles.chart}>
      <Plot
        data={plotData}
        layout={plotLayout}
        style={{ width: '100%', height: '400px' , overflow: 'hidden'}}
        config={{ responsive: true }}
      />
    </div>
  );
}