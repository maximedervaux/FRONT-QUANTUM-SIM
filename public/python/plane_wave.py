import numpy as np
from quantum_sim import PlaneWave

def generate_plane_waves(n, wavelength, periods=3, phase=0, time=0):
    n = int(n)
    all_waves = []

    for i in range(1, n+1):
        λ_n = wavelength / i  # longueur d'onde de l'harmonique
        x = np.linspace(0, λ_n, 100)  # 1 période
        wave = PlaneWave(i/10, λ_n, 0, phase, time)
        y = wave.evaluate(x)
        y_repeated = np.tile(y, periods)
        x_repeated = np.linspace(0, λ_n*periods, 100*periods)
        all_waves.append((x_repeated, y_repeated))  # tuple par harmonique

    return all_waves
