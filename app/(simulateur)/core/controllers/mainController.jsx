// app/components/PythonController.jsx
'use client';

import { useEffect, useState, useCallback } from 'react';

import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
})


export default function PythonController() {
  const [worker, setWorker] = useState(null);
  const [params, setParams] = useState({
    param1: 1.0,
    param2: 0.5
  });
  const [result, setResult] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Initialiser le worker
  useEffect(() => {
    const pyWorker = new Worker(new URL('../workers/mainWorker.js', import.meta.url));
    
    pyWorker.onmessage = (e) => {
      if (e.data.type === 'ready') {
        setIsReady(true);
      } else if (e.data.type === 'result') {
        console.log('Résultat reçu du worker Python:', e.data.data);
        setResult(e.data.data);
     } else if (e.data.type === 'error') {
        setResult({ error: e.data.error });
      }
    };

    setWorker(pyWorker);

    return () => pyWorker.terminate();
  }, []);

  // Exécuter la fonction Python quand les params changent
  useEffect(() => {
    if (worker && isReady) {
      worker.postMessage({
        type: 'run',
        params: params
      });
    }
  }, [params, worker, isReady]);

  const handleParamChange = useCallback((key, value) => {
    setParams(prev => ({
      ...prev,
      [key]: parseFloat(value)
    }));
  }, []);

  return (
    <div className="p-8 " style={{width: "1300px"}}>
      <h1 className="text-2xl font-bold mb-6">Contrôleur Python Temps Réel</h1>
      
      {!isReady && (
        <div className="mb-4 p-4 bg-yellow-100 rounded">
          Chargement de Python...
        </div>
      )}

      <div className="space-y-6">
        {/* Curseur Param1 */}
        <div>
          <label className="block mb-2">
            Param1: <strong>{params.param1}</strong>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={params.param1}
            onChange={(e) => handleParamChange('param1', e.target.value)}
            className="w-full"
            disabled={!isReady}
          />
        </div>

        {/* Curseur Param2 */}
        <div>
          <label className="block mb-2">
            Param2: <strong>{params.param2}</strong>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={params.param2}
            onChange={(e) => handleParamChange('param2', e.target.value)}
            className="w-full"
            disabled={!isReady}
          />
        </div>
      </div>

      {/* Affichage des résultats */}
      {result && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Résultats Python :</h2>
          {result && result.length && (
            <Plot
              data={[
                {
                  y: result,
                  type: 'scatter',
                  mode: 'lines',
                  line: { width: 2 }
                }
              ]}
              layout={{
                title: 'Amplitude de l’onde |ψ(x)|',
                xaxis: { title: 'x (échantillons)' },
                yaxis: { title: '|ψ|' },
                margin: { t: 40, l: 50, r: 20, b: 40 }
              }}
              style={{ width: '100%', height: '400px' }}
              config={{ responsive: true }}
            />
          )}
        </div>
      )}
    </div>
  );
}