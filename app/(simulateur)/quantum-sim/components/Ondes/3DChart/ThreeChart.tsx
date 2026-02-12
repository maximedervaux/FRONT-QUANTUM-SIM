'use client';

import { useEffect, useState, useRef, useCallback, memo, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { useWaveStore } from "../../../store/onde.store";
import { usePythonFunction } from "../../../hooks/usePythonFunction";

/* =========================
   WaveLine
========================= */

function WaveLine({
  waveData,
  xAxis,
  color,
  depth
}: {
  waveData: number[];
  xAxis: number[];
  color: string;
  depth: number;
}) {
  const positions = useMemo(() => {
    const vertices: number[] = [];

    for (let i = 0; i < xAxis.length; i++) {
      const x = xAxis[i];
      const y = waveData[i];

      if (
        isNaN(x) ||
        isNaN(y) ||
        !isFinite(x) ||
        !isFinite(y)
      ) continue;

      vertices.push(x, y, depth);
    }

    return new Float32Array(vertices);
  }, [waveData, xAxis, depth]);

  if (positions.length === 0) return null;

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
        />
        </bufferGeometry>
      <lineBasicMaterial color={color} />
    </line>
  );
}

/* =========================
   WaveMesh
========================= */

function WaveMesh({
  waveData,
  xAxis
}: {
  waveData: number[][];
  xAxis: number[];
}) {
  if (!waveData.length || !xAxis.length) return null;

  return (
    <>
      {waveData.map((wave, idx) => {
        const color = `hsl(${idx * 137.5}, 70%, 50%)`;
        return (
          <WaveLine
            key={idx}
            waveData={wave}
            xAxis={xAxis}
            color={color}
            depth={idx * 2}   // séparation en profondeur
          />
        );
      })}
    </>
  );
}

/* =========================
   ThreeChart
========================= */

function ThreeChart() {
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

  const { execute, isReady } = usePythonFunction(
    "plane_wave",
    "generate_plane_waves"
  );

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
      const waves = await executeRef.current(params) as [number[], number[]][];

      if (waves && waves.length > 0) {
        setResult(waves.map(([x, y]) => y));
        setXAxis(waves[0][0]);
      }

    } catch (err) {
      console.error("[ThreeChart] Erreur:", err);
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
    const params = { harmonics, wavelength, period, phase, time };
    runExecution(params);
  }, [phase, time, harmonics, wavelength, period, runExecution]);

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <Canvas camera={{ position: [25, 15, 35], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[20, 20, 20]} />

        <axesHelper args={[20]} />

        <WaveMesh waveData={result} xAxis={xAxis} />

        <Grid
          args={[50, 50]}
          cellSize={2}
          sectionSize={10}
          fadeDistance={100}
          fadeStrength={1}
        />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={100}
        />
      </Canvas>
    </div>
  );
}

export default memo(ThreeChart);