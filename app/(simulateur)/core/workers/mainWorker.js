// app/workers/python.worker.js
let pyodide = null;

// Charger Pyodide
async function loadPyodideAndPackages() {
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js');
  pyodide = await loadPyodide();
  
  // Charger les packages Python (numpy est déjà inclus dans Pyodide)
  await pyodide.loadPackage(['micropip','numpy']);
  
  // Utiliser micropip pour installer ta lib depuis PyPI
  await pyodide.runPythonAsync(`
    import micropip
    await micropip.install('quantum-sim-library', deps=False)
  `);
  await pyodide.runPythonAsync(`
    import quantum_sim.waves as waves
    from quantum_sim import PI
    import numpy as np

    def run_simulation(param1, param2):
        x = np.linspace(-0.5, 0.5, 100000)
        return waves.PlaneWave(param1, param2*PI).evaluate(x)`);
  self.postMessage({ type: 'ready' });
}

// Écouter les messages du thread principal
self.onmessage = async (event) => {
  if (!pyodide) {
    await loadPyodideAndPackages();
  }
  
  if (event.data.type === 'run') {
  try {
    const { param1, param2 } = event.data.params;

    pyodide.globals.set("param1", param1);
    pyodide.globals.set("param2", param2);

   const resultProxy = await pyodide.runPythonAsync(`
       import numpy as np
       np.real(run_simulation(param1, param2))
    `);

    const result = resultProxy.toJs({ copy: true });
    resultProxy.destroy();

    self.postMessage({
      type: 'result',
      data: result
    });

  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message
    });
  }
}
};

// Lancer le chargement
loadPyodideAndPackages();