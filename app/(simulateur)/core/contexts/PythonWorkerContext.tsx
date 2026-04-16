// core/contexts/PythonWorkerContext.tsx
'use client';

import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
	useCallback,
	useRef,
} from 'react';
import { getPythonWorker } from '../workers/pythonWorkerInstance';

type PythonResultPart = 'real' | 'imag' | 'complex';

interface PythonWorkerContextType {
	isReady: boolean;
	loadScript: (scriptName: string) => Promise<void>;
	runPython: (
		scriptName: string,
		functionName: string,
		params: Record<string, any>,
		part?: PythonResultPart
	) => Promise<any>;
	loadedScripts: Set<string>;
}

const PythonWorkerContext = createContext<PythonWorkerContextType | null>(null);

export function PythonWorkerProvider({ children }: { children: ReactNode }) {
	const [isReady, setIsReady] = useState(false);
	const [loadedScripts, setLoadedScripts] = useState<Set<string>>(new Set());
	const [worker, setWorker] = useState<Worker | null>(null);
	// Track pending operations to avoid race conditions (e.g., two simultaneous loads of same script)
	const pendingCallbacks = useRef<Map<string, { resolve: Function; reject: Function }>>(new Map());
	const pendingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
	// Track scripts currently being loaded to prevent duplicate requests
	const loadingScripts = useRef<Set<string>>(new Set());

	const cleanupCallback = useCallback((key: string) => {
		const timeoutId = pendingTimeouts.current.get(key);
		if (timeoutId) {
			clearTimeout(timeoutId);
			pendingTimeouts.current.delete(key);
		}
		pendingCallbacks.current.delete(key);
	}, []);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const w = getPythonWorker();
			console.log('[PythonWorkerProvider] Worker créé');
			setWorker(w);
		}
	}, []);

	useEffect(() => {
		if (!worker) return;

		// Check if worker is already ready on mount
		console.log('[PythonWorkerProvider] Envoi check_ready au worker');
		worker.postMessage({ type: 'check_ready' });

		const handleMessage = (e: MessageEvent) => {
			const { type, scriptName, data, error, callbackKey } = e.data;
			console.log('[PythonWorkerProvider] Message reçu du worker:', type, {
				scriptName,
				callbackKey,
			});

			switch (type) {
				case 'ready':
					console.log('[PythonWorkerProvider] Pyodide est prêt!');
					setIsReady(true);
					break;

				case 'script_loaded':
					console.log('[PythonWorkerProvider] Script chargé:', scriptName);
					setLoadedScripts(prev => new Set(prev).add(scriptName));
					loadingScripts.current.delete(scriptName);

					// Use explicit callback key from message for better tracking
					if (callbackKey) {
						const loadCallback = pendingCallbacks.current.get(callbackKey);
						if (loadCallback) {
							loadCallback.resolve();
							cleanupCallback(callbackKey);
						}
					}
					break;

				case 'result':
					console.log('[PythonWorkerProvider] Résultat reçu pour:', scriptName);
					// Use explicit callback key from worker response
					if (callbackKey) {
						const runCallback = pendingCallbacks.current.get(callbackKey);
						if (runCallback) {
							runCallback.resolve(data);
							cleanupCallback(callbackKey);
						}
					}
					break;

				case 'error':
					console.error('[PythonWorkerProvider] Erreur du worker:', error, {
						scriptName,
						callbackKey,
					});
					if (callbackKey) {
						const errorCallback = pendingCallbacks.current.get(callbackKey);
						if (errorCallback) {
							errorCallback.reject(new Error(error));
							cleanupCallback(callbackKey);
						}
					}
					// Clean up loading state on error
					if (scriptName) {
						loadingScripts.current.delete(scriptName);
					}
					break;
			}
		};
		worker.addEventListener('message', handleMessage);
		return () => worker.removeEventListener('message', handleMessage);
	}, [worker, cleanupCallback]);

	const loadScript = useCallback(
		(scriptName: string): Promise<void> => {
			if (!worker) {
				console.error('[PythonWorkerProvider] loadScript: Worker non initialisé');
				return Promise.reject(new Error('Worker non initialisé'));
			}

			if (!isReady) {
				console.warn('[PythonWorkerProvider] loadScript: Worker pas encore prêt');
				return Promise.reject(new Error('Worker pas encore prêt'));
			}

			if (loadedScripts.has(scriptName)) {
				console.log('[PythonWorkerProvider] loadScript: Script déjà chargé:', scriptName);
				return Promise.resolve();
			}

			// If script is already being loaded, wait for it instead of duplicate request
			if (loadingScripts.current.has(scriptName)) {
				console.log(
					'[PythonWorkerProvider] loadScript: Script en cours de chargement, attente de:',
					scriptName
				);
				return new Promise((resolve, reject) => {
					let attempts = 0;
					const maxAttempts = 300; // 30 secondes (100ms * 300)

					const checkInterval = setInterval(() => {
						attempts++;
						if (loadedScripts.has(scriptName)) {
							clearInterval(checkInterval);
							console.log(
								'[PythonWorkerProvider] loadScript: Script maintenant disponible:',
								scriptName
							);
							resolve();
						} else if (attempts > maxAttempts) {
							clearInterval(checkInterval);
							reject(new Error(`Timeout en attente du chargement de ${scriptName}`));
						}
					}, 100);
				});
			}

			console.log(
				'[PythonWorkerProvider] loadScript: Envoi demande de chargement pour:',
				scriptName
			);
			return new Promise((resolve, reject) => {
				const callbackKey = `load_${scriptName}_${Date.now()}_${Math.random()}`;
				loadingScripts.current.add(scriptName);
				pendingCallbacks.current.set(callbackKey, { resolve, reject });
				worker.postMessage({ type: 'load_script', scriptName, callbackKey });

				const timeoutId = setTimeout(() => {
					if (pendingCallbacks.current.has(callbackKey)) {
						console.error('[PythonWorkerProvider] loadScript: Timeout pour', scriptName);
						loadingScripts.current.delete(scriptName);
						cleanupCallback(callbackKey);
						reject(new Error(`Timeout lors du chargement de ${scriptName}`));
					}
				}, 30000);

				pendingTimeouts.current.set(callbackKey, timeoutId);
			});
		},
		[isReady, loadedScripts, worker, cleanupCallback]
	);

	const runPython = useCallback(
		(
			scriptName: string,
			functionName: string,
			params: Record<string, any>,
			part: PythonResultPart = 'real'
		): Promise<any> => {
			if (!worker) {
				console.error('[PythonWorkerProvider] runPython: Worker non initialisé');
				return Promise.reject(new Error('Worker non initialisé'));
			}

			if (!isReady) {
				console.warn('[PythonWorkerProvider] runPython: Worker pas encore prêt');
				return Promise.reject(new Error('Worker pas encore prêt'));
			}

			console.log(
				'[PythonWorkerProvider] runPython: Exécution de',
				functionName,
				'depuis',
				scriptName,
				'avec params:',
				params,
				'part:',
				part
			);

			return new Promise((resolve, reject) => {
				// Generate unique callback key to handle multiple simultaneous calls
				const callbackKey = `run_${scriptName}_${Date.now()}_${Math.random()}`;
				pendingCallbacks.current.set(callbackKey, { resolve, reject });

				worker.postMessage({
					type: 'run',
					scriptName,
					functionName,
					params,
					part,
					callbackKey,
				});

				const timeoutId = setTimeout(() => {
					if (pendingCallbacks.current.has(callbackKey)) {
						console.error('[PythonWorkerProvider] runPython: Timeout pour', functionName);
						cleanupCallback(callbackKey);
						reject(new Error(`Timeout lors de l'exécution de ${functionName} dans ${scriptName}`));
					}
				}, 60000);

				pendingTimeouts.current.set(callbackKey, timeoutId);
			});
		},
		[isReady, worker, cleanupCallback]
	);

	return (
		<PythonWorkerContext.Provider value={{ isReady, loadScript, runPython, loadedScripts }}>
			{children}
		</PythonWorkerContext.Provider>
	);
}

/**
 * Hook for accessing the Python Worker context.
 *
 * Provides access to Pyodide worker utilities for executing Python code in web workers
 * without blocking the main thread.
 *
 * @returns {PythonWorkerContextType} Object containing:
 *   - isReady: Boolean indicating if Pyodide is fully initialized
 *   - loadScript: Function to preload a Python script file
 *   - runPython: Function to execute a Python function with parameters
 *   - loadedScripts: Set of already loaded script names
 *
 * @throws {Error} If used outside of PythonWorkerProvider component tree
 *
 * @example
 * function MyComponent() {
 *   const { isReady, runPython } = usePythonWorker();
 *
 *   if (!isReady) return <div>Loading Pyodide...</div>;
 *
 *   const handleClick = async () => {
 *     const result = await runPython('main', 'compute_wave', { amplitude: 1.0 });
 *     console.log(result);
 *   };
 *
 *   return <button onClick={handleClick}>Run Calculation</button>;
 * }
 */
export function usePythonWorker(): PythonWorkerContextType {
	const context = useContext(PythonWorkerContext);
	if (!context) {
		throw new Error('usePythonWorker doit être utilisé dans PythonWorkerProvider');
	}
	return context;
}
