// core/workers/pythonWorkerInstance.ts

/**
 * Holds the singleton Worker instance.
 */
let worker: Worker | null = null;

/**
 * Returns a singleton instance of the Python Web Worker.
 *
 * The worker is lazily created on first invocation and reused afterwards.
 * Must only be called in a browser environment.
 *
 * @throws {Error} If executed during server-side rendering.
 * @returns {Worker} The initialized Python Web Worker instance.
 */
export function getPythonWorker(): Worker {
  if (typeof window === 'undefined') {
    throw new TypeError('getPythonWorker can be called only on client-side');
  }

  if (!worker) {
    console.log('[getPythonWorker] Création du worker');
    worker = new Worker(
      new URL('./python.worker.js', import.meta.url),
      { type: 'classic' }  // Utilise 'classic' pour compatibilité avec importScripts()
    );
    console.log('[getPythonWorker] Worker créé et assigné');
  }

  return worker;
}