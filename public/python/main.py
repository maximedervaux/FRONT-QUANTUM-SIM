import quantum_sim.waves as waves
from quantum_sim import PI
import numpy as np

def run_simulation(param1, param2):
    x = np.linspace(-0.5, 0.5, 100000)
    return waves.PlaneWave(param1, param2*PI).evaluate(x)