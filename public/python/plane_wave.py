import numpy as np
from quantum_sim import PlaneWave

def generate_plane_waves(n, wavelength, periods=3, phase=0, time=0):
    n = int(n)
    all_waves = []
    nb_points = 1000

    for i in range(1, n+1):
        λ_n = wavelength / i
        x = np.linspace(0, 1, nb_points)
        wave = PlaneWave(i/10, λ_n, 0, phase, time)
        y = wave.evaluate(x)
        y_repeated = np.tile(y, periods)
        x_repeated = np.linspace(0, 10*periods, nb_points*periods)
        all_waves.append((x_repeated, y_repeated))

    return all_waves
