// app/hooks/usePythonFunction.ts
import { useState, useCallback } from 'react';
import { usePythonWorker } from '../../core/contexts/PythonWorkerContext';

export function usePythonFunction<T = any>(scriptName: string, functionName: string) {
  const { isReady, loadScript, runPython } = usePythonWorker();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (params: Record<string, any>) => {
    if (!isReady) {
      setError(new Error('Worker pas prêt'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await loadScript(scriptName);
      console.log(`[usePythonFunction] Script "${scriptName}" chargé, exécution de "${functionName}" avec params:`, params);
      console.log(`[usePythonFunction] Worker prêt: ${isReady}`); 
      const result = await runPython(scriptName, functionName, params);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isReady, loadScript, runPython, scriptName, functionName]);

  return { execute, isLoading, error, data, isReady };
}