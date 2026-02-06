// core/workers/pythonWorkerInstance.ts
let worker: Worker | null = null;

export function getPythonWorker(): Worker {
  // Vérifier qu'on est bien côté client
  if (typeof window === 'undefined') {
    throw new Error('getPythonWorker ne peut être appelé que côté client');
  }

  if (!worker) {
    worker = new Worker(
      new URL('./python.worker.js', import.meta.url),
      { type: 'module' }
    );
  }
  
  return worker;
}