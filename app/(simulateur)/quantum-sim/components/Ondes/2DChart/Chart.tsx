'use client';
import dynamic from "next/dynamic";
import type { Layout } from 'plotly.js';
import { useEffect, useState } from "react";
import { usePythonFunction } from '../../../hooks/usePythonFunction';
import styles from "./Chart.module.css";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function Chart() {
  const [params, setParams] = useState({ param1: 1.0, param2: 0.5 });
  const [result, setResult] = useState<number[]>([]);

  const { execute, isLoading, error, data, isReady } = usePythonFunction(
    'main',
    'run_simulation'
  );

   useEffect(() => {
    if (!isReady) {
      console.log('[Chart] En attente du worker...');
      return;
    }

    console.log('[Chart] Lancement simulation avec params:', params);
    
    execute(params)
      .then((res: number[]) => {
        console.log('[Chart] Résultat reçu:', res);
        setResult(res);
      })
      .catch((err) => {
        console.error('[Chart] Erreur:', err);
      });
    
  }, [params, isReady]); 

  const layout: Partial<Layout> = {
    title: "Amplitude de l'onde |ψ(x)|" as any,
    xaxis: { title: 'x (échantillons)' as any },
    yaxis: { title: '|ψ|' as any },
    margin: { t: 40, l: 50, r: 20, b: 40 },
  };

  return (
    <div className={styles.chart}>
      <Plot
        data={[{ y: result, type: 'scatter', mode: 'lines', line: { width: 2 } }]}
        layout={layout}
        style={{ width: '100%', height: '400px' , overflow: 'hidden'}}
        config={{ responsive: true }}
      />
    </div>
  );
}