// app/workers/python.worker.js
let pyodide = null;
let loadedScripts = new Set(); 
let isInitialized = false;

// Initialisation de Pyodide (une seule fois)
async function initPyodide() {
  if (isInitialized) return;
  
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js');
  pyodide = await loadPyodide();
  
  // Charger les packages communs une seule fois
  await pyodide.loadPackage(['micropip', 'numpy']);
  await pyodide.runPythonAsync(`
    import micropip
    await micropip.install('quantum-sim-library', deps=False)
  `);
  
  isInitialized = true;
  self.postMessage({ type: 'ready' });
}

// Charger un script Python spécifique
async function loadPythonScript(scriptName) {
  if (loadedScripts.has(scriptName)) {
    return; 
  }
  
  const baseUrl = self.location.origin; 
  const scriptUrl = `${baseUrl}/python/${scriptName}.py`
  const response = await fetch(scriptUrl);
  const pythonCode = await response.text();
  
  // Exécuter le script dans Pyodide
  await pyodide.runPythonAsync(pythonCode);
  
  loadedScripts.add(scriptName);
  self.postMessage({ type: 'script_loaded', scriptName: scriptName });
}

self.onmessage = async (event) => {
  // Initialiser Pyodide si pas encore fait
  if (!pyodide) {
    await initPyodide();
  }

  if (event.data.type === 'load_script') {
    // Charger un script spécifique à la demande
    try {
      console.log(`ICI Loading script ${event.data.scriptName}...`);
      await loadPythonScript(event.data.scriptName);
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: `Failed to load script ${event.data.scriptName}: ${error.message}`
      });
    }
  }

  if (event.data.type === 'run') {
    try {
      const { scriptName, functionName, params } = event.data;

      // Charger le script si pas encore fait
      if (!loadedScripts.has(scriptName)) {
        await loadPythonScript(scriptName);
      }

      // Passer les paramètres
      const paramKeys = Object.keys(params);
      Object.entries(params).forEach(([key, value]) => {
        pyodide.globals.set(key, value);
      });

      // Exécuter la fonction
      const resultProxy = await pyodide.runPythonAsync(`
        import numpy as np
        np.real(${functionName}(${paramKeys.join(', ')}))
      `);

      const result = resultProxy.toJs({ copy: true });
      resultProxy.destroy();

      // Nettoyer les globals pour éviter les fuites mémoire
      paramKeys.forEach(key => {
        pyodide.globals.delete(key);
      });

      self.postMessage({
        type: 'result',
        data: result,
        scriptName: scriptName,
      });
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error.message
      });
    }
  }
};

// Lancer l'initialisation
initPyodide();