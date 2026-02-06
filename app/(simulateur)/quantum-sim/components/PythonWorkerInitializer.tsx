// app/components/PythonWorkerInitializer.tsx
import { useEffect } from 'react';
import { getPythonWorker } from '../../core/workers/pythonWorkerInstance';

export default function PythonWorkerInitializer() {
  useEffect(() => {
    const worker = getPythonWorker();

    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'ready') {
        console.log('[PyWorker] prêt');
      }
    };

    worker.addEventListener('message', handleMessage);

    return () => {
      worker.removeEventListener('message', handleMessage);
    };
  }, []);

  return null; 
}