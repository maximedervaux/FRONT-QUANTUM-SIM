'use client';
import dynamic from "next/dynamic";
import type { Layout } from 'plotly.js';
import { useEffect, useState } from "react";
import { usePythonFunction } from '../../../hooks/usePythonFunction';
import styles from "./Chart.module.css";
import { useWaveStore } from "../../../store/onde.store";


const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function Chart() {
      const {
    amplitude,
    phase
  } = useWaveStore();
  const [result, setResult] = useState<number[][]>([]);

  const { execute, isLoading, error, data, isReady } = usePythonFunction(
    'main',
    'run_simulation'
  );

   useEffect(() => {
    if (!isReady) {
      console.log('[Chart] En attente du worker...');
      return;
    }

    execute({ amplitude, phase })
      .then((res: number[][]) => {
        console.log('[Chart] Résultat reçu:', res);
        setResult(res);
      })
      .catch((err) => {
        console.error('[Chart] Erreur:', err);
      });
    
  }, [amplitude, phase, isReady]); 

  const layout: Partial<Layout> = {
    title: "Amplitude de l'onde |ψ(x)|" as any,
    xaxis: { title: 'x (échantillons)' as any },
    yaxis: { title: '|ψ|' as any },
    margin: { t: 40, l: 50, r: 20, b: 40 },
  };

  return (
    <div className={styles.chart}>
      <Plot
        data={[
    {
      y: result[0],
      type: 'scatter',
      mode: 'lines',
      name: 'Onde principale',
      line: { width: 2, color: '#1f77b4' },
    },
    {
      y: result[1],
      type: 'scatter',
      mode: 'lines',
      name: 'Seconde onde',
      line: { width: 2, dash: 'dash', color: '#ff7f0e' },
    },
  ]}
        layout={layout}
        style={{ width: '100%', height: '400px' , overflow: 'hidden'}}
        config={{ responsive: true }}
      />
    </div>
  );
}