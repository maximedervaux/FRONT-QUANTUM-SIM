// core/contexts/PythonWorkerContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
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
  const pendingCallbacks = useRef<Map<string, { resolve: Function, reject: Function }>>(new Map()).current;
  const pendingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map()).current;

  // Fonction helper pour nettoyer callback et timeout
  const cleanupCallback = useCallback((key: string) => {
    const timeoutId = pendingTimeouts.get(key);
    if (timeoutId) {
      clearTimeout(timeoutId);
      pendingTimeouts.delete(key);
    }
    pendingCallbacks.delete(key);
  }, [pendingCallbacks, pendingTimeouts]);

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
            cleanupCallback(`load_${scriptName}`);
          }
          break;

        case 'result':
          console.log(`[PyWorker] Résultat reçu de ${scriptName}`, data);
          const runCallback = pendingCallbacks.get(`run_${scriptName}`);
          if (runCallback) {
            runCallback.resolve(data);
            cleanupCallback(`run_${scriptName}`);
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
            cleanupCallback(`run_${scriptName}`);
            cleanupCallback(`load_${scriptName}`);
          } else {
            // Rejeter tous les callbacks en dernier recours
            pendingCallbacks.forEach(cb => cb.reject(new Error(error)));
            pendingCallbacks.clear();
            // Nettoyer tous les timeouts
            pendingTimeouts.forEach(timeout => clearTimeout(timeout));
            pendingTimeouts.clear();
          }
          break;
      }
    };

    worker.addEventListener('message', handleMessage);
    return () => worker.removeEventListener('message', handleMessage);
  }, [worker, pendingCallbacks, pendingTimeouts, cleanupCallback]);

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
      const key = `load_${scriptName}`;
      pendingCallbacks.set(key, { resolve, reject });
      worker.postMessage({ type: 'load_script', scriptName });

      const timeoutId = setTimeout(() => {
        if (pendingCallbacks.has(key)) {
          cleanupCallback(key);
          reject(new Error(`Timeout lors du chargement de ${scriptName}`));
        }
      }, 30000);

      pendingTimeouts.set(key, timeoutId);
    });
  }, [isReady, loadedScripts, worker, pendingCallbacks, pendingTimeouts, cleanupCallback]);

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
      const callbackKey = `run_${scriptName}`;
      pendingCallbacks.set(callbackKey, { resolve, reject });

      console.log(`[Context] Callback enregistré: ${callbackKey}`);

      worker.postMessage({
        type: 'run',
        scriptName,
        functionName,
        params
      });

      const timeoutId = setTimeout(() => {
        if (pendingCallbacks.has(callbackKey)) {
          cleanupCallback(callbackKey);
          reject(new Error(`Timeout lors de l'exécution de ${functionName} dans ${scriptName}`));
        }
      }, 60000);

      pendingTimeouts.set(callbackKey, timeoutId);
    });
  }, [isReady, worker, pendingCallbacks, pendingTimeouts, cleanupCallback]);

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