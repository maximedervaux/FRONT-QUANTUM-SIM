import quantum_sim.waves as waves
from quantum_sim import PI
import numpy as np

def run_simulation(param1, param2):
    x = np.linspace(-5, 5, 1000)
    wave1 = waves.PlaneWave(param1, param2*PI).evaluate(x)
    wave2 = waves.PlaneWave(param1*0.5, param2*PI).evaluate(x)
    return [wave1.tolist(), wave2.tolist()]
