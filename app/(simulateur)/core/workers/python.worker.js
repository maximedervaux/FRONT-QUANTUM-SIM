// app/workers/python.worker.js

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
async function initPyodide() {
  try {
    // Load Pyodide script
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js');

    pyodide = await loadPyodide();

    // Load core packages
    await pyodide.loadPackage(['micropip', 'numpy']);

    // Install custom package safely
    await pyodide.runPythonAsync(`
      import micropip
      await micropip.install("quantum-sim-library", deps=False)
    `);

    self.postMessage({ type: 'ready' });
  } catch (error) {
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
 * @returns {Promise<void>} Resolves when the script is loaded and executed.
 */
async function loadPythonScript(scriptName) {
  if (loadedScripts.has(scriptName)) {
    return; 
  }
  
  const baseUrl = self.location.origin; 
  const scriptUrl = `${baseUrl}/python/${scriptName}.py`
  const response = await fetch(scriptUrl);
  const pythonCode = await response.text();
  
  await pyodide.runPythonAsync(pythonCode);
  
  loadedScripts.add(scriptName);
  self.postMessage({ type: 'script_loaded', scriptName: scriptName });
}

self.onmessage = async (event) => {
  try {
    // Guarantee Pyodide is ready before executing any message
    // Using ensureInitialized() prevents race conditions when messages arrive during init
    await ensureInitialized();

    if (event.data.type === 'load_script') {
      try {
        await loadPythonScript(event.data.scriptName);
      } catch (error) {
        self.postMessage({
          type: 'error',
          error: `Failed to load script ${event.data.scriptName}: ${error.message}`
        });
      }
    }

    if (event.data.type === 'run') {
      const { scriptName, functionName, params } = event.data;

      // Load script on first use to optimize startup
      if (!loadedScripts.has(scriptName)) {
        await loadPythonScript(scriptName);
      }

      // Set parameters in Pyodide's global scope for function access
      const paramKeys = Object.keys(params);
      Object.entries(params).forEach(([key, value]) => {
        pyodide.globals.set(key, value);
      });

      // Execute and extract real part (quantum computations often return complex numbers)
      // toJs() copies data from WASM memory to JavaScript, destroy() frees WASM resources
      const resultProxy = await pyodide.runPythonAsync(`
        import numpy as np
        np.real(${functionName}(${paramKeys.join(', ')}))
      `);

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
      });
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message
    });
  }
};