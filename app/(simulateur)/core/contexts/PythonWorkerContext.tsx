// core/contexts/PythonWorkerContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { getPythonWorker } from '../workers/pythonWorkerInstance';

interface PythonWorkerContextType {
  isReady: boolean;
  loadScript: (scriptName: string) => Promise<void>;
  runPython: (scriptName: string, functionName: string, params: Record<string, any>) => Promise<any>;
  loadedScripts: Set<string>;
}

const PythonWorkerContext = createContext<PythonWorkerContextType | null>(null);

export function PythonWorkerProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [loadedScripts, setLoadedScripts] = useState<Set<string>>(new Set());
  const [worker, setWorker] = useState<Worker | null>(null);
  const [pendingCallbacks] = useState<Map<string, { resolve: Function, reject: Function }>>(new Map());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const w = getPythonWorker();
      setWorker(w);
    }
  }, []);

  useEffect(() => {
    if (!worker) return;

    const handleMessage = (e: MessageEvent) => {
      const { type, scriptName, data, error } = e.data;
      
      console.log('[Context] Message reçu:', { type, scriptName }); // Debug

      switch (type) {
        case 'ready':
          console.log('[PyWorker] Pyodide prêt');
          setIsReady(true);
          break;

        case 'script_loaded':
          console.log(`[PyWorker] Script chargé: ${scriptName}`);
          setLoadedScripts(prev => new Set(prev).add(scriptName));
          
          const loadCallback = pendingCallbacks.get(`load_${scriptName}`);
          if (loadCallback) {
            loadCallback.resolve();
            pendingCallbacks.delete(`load_${scriptName}`);
          }
          break;

        case 'result':
          console.log(`[PyWorker] Résultat reçu de ${scriptName}`, data);
          // ⚠️ CORRECTION : Utiliser scriptName du message
          const runCallback = pendingCallbacks.get(`run_${scriptName}`);
          if (runCallback) {
            runCallback.resolve(data);
            pendingCallbacks.delete(`run_${scriptName}`);
          } else {
            console.warn(`[PyWorker] Aucun callback trouvé pour run_${scriptName}`);
            console.log('[PyWorker] Callbacks en attente:', Array.from(pendingCallbacks.keys()));
          }
          break;

        case 'error':
          console.error('[PyWorker] Erreur:', error);
          // Chercher le callback correspondant
          const errorCallback = pendingCallbacks.get(`run_${scriptName}`) || 
                               pendingCallbacks.get(`load_${scriptName}`);
          if (errorCallback) {
            errorCallback.reject(new Error(error));
            pendingCallbacks.delete(`run_${scriptName}`);
            pendingCallbacks.delete(`load_${scriptName}`);
          } else {
            // Rejeter tous les callbacks en dernier recours
            pendingCallbacks.forEach(cb => cb.reject(new Error(error)));
            pendingCallbacks.clear();
          }
          break;
      }
    };

    worker.addEventListener('message', handleMessage);
    return () => worker.removeEventListener('message', handleMessage);
  }, [worker, pendingCallbacks]);

  const loadScript = useCallback((scriptName: string): Promise<void> => {
    if (!worker) {
      return Promise.reject(new Error('Worker non initialisé'));
    }

    if (!isReady) {
      return Promise.reject(new Error('Worker pas encore prêt'));
    }

    if (loadedScripts.has(scriptName)) {
      console.log(`[Context] Script ${scriptName} déjà chargé`);
      return Promise.resolve(); 
    }

    console.log(`[Context] Chargement du script ${scriptName}`);

    return new Promise((resolve, reject) => {
      pendingCallbacks.set(`load_${scriptName}`, { resolve, reject });
      worker.postMessage({ type: 'load_script', scriptName });
      
      setTimeout(() => {
        if (pendingCallbacks.has(`load_${scriptName}`)) {
          pendingCallbacks.delete(`load_${scriptName}`);
          reject(new Error(`Timeout lors du chargement de ${scriptName}`));
        }
      }, 30000);
    });
  }, [isReady, loadedScripts, worker, pendingCallbacks]);

  const runPython = useCallback((
    scriptName: string, 
    functionName: string, 
    params: Record<string, any>
  ): Promise<any> => {
    if (!worker) {
      return Promise.reject(new Error('Worker non initialisé'));
    }

    if (!isReady) {
      return Promise.reject(new Error('Worker pas encore prêt'));
    }

    console.log(`[Context] Exécution ${functionName} dans ${scriptName}`, params);

    return new Promise((resolve, reject) => {
      // ⚠️ Utiliser scriptName comme clé
      const callbackKey = `run_${scriptName}`;
      pendingCallbacks.set(callbackKey, { resolve, reject });
      
      console.log(`[Context] Callback enregistré: ${callbackKey}`);
      
      worker.postMessage({
        type: 'run',
        scriptName,
        functionName,
        params
      });

      setTimeout(() => {
        if (pendingCallbacks.has(callbackKey)) {
          pendingCallbacks.delete(callbackKey);
          reject(new Error(`Timeout lors de l'exécution de ${functionName} dans ${scriptName}`));
        }
      }, 60000);
    });
  }, [isReady, worker, pendingCallbacks]);

  return (
    <PythonWorkerContext.Provider value={{ isReady, loadScript, runPython, loadedScripts }}>
      {children}
    </PythonWorkerContext.Provider>
  );
}

export function usePythonWorker() {
  const context = useContext(PythonWorkerContext);
  if (!context) {
    throw new Error('usePythonWorker doit être utilisé dans PythonWorkerProvider');
  }
  return context;
}