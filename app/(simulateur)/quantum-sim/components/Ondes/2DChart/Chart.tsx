'use client';
import dynamic from "next/dynamic";
import type { Layout, ScatterData } from 'plotly.js';
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
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

  const isExecutingRef = useRef(false);
  const pendingParamsRef = useRef<any>(null);

  const { execute, isLoading, error, data, isReady } = usePythonFunction(
    'plane_wave',
    'generate_plane_waves'
  );

    // Fonction pour exécuter Python avec throttling intelligent
  const runExecution = useCallback(async (params: any) => {
    if (!isReady) return;

    // Si une exécution est déjà en cours, stocker les params pour plus tard
    if (isExecutingRef.current) {
      pendingParamsRef.current = params;
      return;
    }

    isExecutingRef.current = true;

    try {
      const waves = await execute(params) as [number[], number[]][];
      setResult(waves.map(([x, y]) => y));
      setXAxis(waves[0][0]);
    } catch (err) {
      console.error('[Chart] Erreur:', err);
    } finally {
      isExecutingRef.current = false;

      // Si des params sont en attente, les exécuter maintenant
      if (pendingParamsRef.current) {
        const pending = pendingParamsRef.current;
        pendingParamsRef.current = null;
        runExecution(pending);
      }
    }
  }, [execute, isReady]);

  // Effect pour l'animation (time, phase) - sans debouncing pour fluidité
  useEffect(() => {
    const params = { harmonics, wavelength, period, phase, time };
    runExecution(params);
  }, [phase, time, harmonics, wavelength, period, runExecution]);


  const plotData = useMemo(() => {
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