// app/workers/python.worker.js

console.log('[python.worker] Worker script chargé');

/**
 * Contains Pyodide instance that will be used
 */

console.log('[python.worker] Worker script chargé');

/**
 * Contains Pyodide instance that will be used
 */
let pyodide = null;

/**
 * Set containing all the scripts already loaded
 */
let loadedScripts = new Set();

/**
 * Promise that resolves when Pyodide is fully initialized.
 * Ensures initialization happens only once even if multiple messages arrive.
 */
let initPromise = null;

/**
 * Initializes the Pyodide runtime inside the worker.
 *
 * Loads Pyodide, installs required Python packages once,
 * and notifies the main thread when ready.
 *
 * @throws {Error} If initialization fails.
 */
/**
 * Initializes the Pyodide runtime inside the worker.
 *
 * Loads Pyodide, installs required Python packages once,
 * and notifies the main thread when ready.
 *
 * @throws {Error} If initialization fails.
 */
async function initPyodide() {
	try {
		console.log('[python.worker] Initialisation de Pyodide en cours...');

		// Load Pyodide script
		importScripts('https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.js');
		console.log('[python.worker] Pyodide chargé du CDN');

		pyodide = await loadPyodide();
		console.log('[python.worker] Pyodide instancié');

		// Load core packages
		await pyodide.loadPackage(['micropip', 'numpy', 'scipy']);
		console.log('[python.worker] Packages chargés (micropip)');

		// Install custom package safely
		await pyodide.runPythonAsync(`
      import micropip
      await micropip.install("quantum-sim-library", deps=False)
    `);
		console.log('[python.worker] quantum-sim-library installé');

		console.log('[python.worker] Envoi du message ready');
		self.postMessage({ type: 'ready' });
	} catch (error) {
		console.error('[python.worker] Erreur initPyodide:', error);
		self.postMessage({ type: 'error', error: String(error) });
		throw error;
	}
}

/**
 * Ensures Pyodide is initialized before proceeding.
 * Uses a promise to prevent duplicate initialization if multiple requests arrive simultaneously.
 *
 * @returns {Promise<void>} Resolves when Pyodide is ready.
 */
async function ensureInitialized() {
	if (!initPromise) {
		initPromise = initPyodide();
	}
	return initPromise;
}

/**
 * Dynamically loads and executes a Python script from `/python`
 * using Pyodide. The script is loaded only once.
 *
 * @async
 * @param {string} scriptName - Script name without the `.py` extension.
 * @param {string} [callbackKey] - Optional key to track this request in the main thread.
 * @returns {Promise<void>} Resolves when the script is loaded and executed.
 */
async function loadPythonScript(scriptName, callbackKey) {
	if (loadedScripts.has(scriptName)) {
		console.log('[python.worker] Script déjà chargé:', scriptName);
		if (callbackKey) {
			self.postMessage({ type: 'script_loaded', scriptName: scriptName, callbackKey });
		}
		return;
	}
	console.log('[python.worker] Chargement du script:', scriptName);
	const baseUrl = self.location.origin;
	const scriptUrl = `${baseUrl}/python/${scriptName}.py`;
	const response = await fetch(scriptUrl);
	const pythonCode = await response.text();

	await pyodide.runPythonAsync(pythonCode);

	loadedScripts.add(scriptName);
	if (callbackKey) {
		self.postMessage({ type: 'script_loaded', scriptName: scriptName, callbackKey });
	}
}

self.onmessage = async event => {
	console.log('[python.worker] Message reçu:', event.data.type);

	try {
		// Handle check_ready request without waiting for full initialization
		if (event.data.type === 'check_ready') {
			console.log('Check ready');
			await ensureInitialized();
			console.log('[python.worker] Réponse à check_ready: ready');
			self.postMessage({ type: 'ready' });
			return;
		}

		// Guarantee Pyodide is ready before executing any message
		// Using ensureInitialized() prevents race conditions when messages arrive during init
		await ensureInitialized();

		console.log('[python.worker] Pyodide est prêt, traitement du message:', event.data.type);

		if (event.data.type === 'load_script') {
			try {
				const { scriptName, callbackKey } = event.data;
				await loadPythonScript(scriptName, callbackKey);
			} catch (error) {
				self.postMessage({
					type: 'error',
					error: `Failed to load script ${event.data.scriptName}: ${error.message}`,
					callbackKey: event.data.callbackKey,
				});
			}
		}

		if (event.data.type === 'run') {
			const { scriptName, functionName, params, callbackKey } = event.data;

			// Load script on first use to optimize startup (don't notify main thread)
			if (!loadedScripts.has(scriptName)) {
				await loadPythonScript(scriptName, null);
			}

			// Set parameters in Pyodide's global scope for function access
			const paramKeys = Object.keys(params);
			Object.entries(params).forEach(([key, value]) => {
				pyodide.globals.set(key, value);
			});

			let resultProxy;
			if (functionName === 'generate_plane_waves') {
				// Execute and extract real part (quantum computations often return complex numbers)
				// toJs() copies data from WASM memory to JavaScript, destroy() frees WASM resources
				resultProxy = await pyodide.runPythonAsync(`
					import numpy as np
					np.real(${functionName}(${paramKeys.join(', ')}))
				`);
			} else if (functionName === 'generate_wave_packet') {
				resultProxy = await pyodide.runPythonAsync(`
					${functionName}(${paramKeys.join(', ')})
				`);
			}

			const result = resultProxy.toJs({ copy: true });
			resultProxy.destroy();

			// Clean up Pyodide globals to prevent memory leaks in long-running worker
			paramKeys.forEach(key => {
				pyodide.globals.delete(key);
			});

			self.postMessage({
				type: 'result',
				data: result,
				scriptName: scriptName,
				callbackKey,
			});
		}
	} catch (error) {
		self.postMessage({
			type: 'error',
			error: error.message,
			callbackKey: event.data?.callbackKey,
		});
	}
};

// Initialize Pyodide on worker startup so it's ready when the first message arrives
console.log("[python.worker] Lancement de l'initialisation de Pyodide au démarrage du worker");
ensureInitialized().catch(err => {
	console.error("[python.worker] Erreur critique lors de l'initialisation:", err);
	self.postMessage({ type: 'error', error: String(err) });
});
