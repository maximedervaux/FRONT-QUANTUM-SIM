import numpy as np
from quantum_sim import PlaneWave, constants as cst

def generate_plane_waves(
    n: int,
    waveNumber: float,
    periods: int = 3,
    phase: float = 0,
    time: float = 0,
    harmonic_amplitudes: list[float] | None = None,
) -> list[tuple]:
    n = int(n)
    num_points = 1000
    amplitudes = harmonic_amplitudes if harmonic_amplitudes is not None else [1.0] * n
    waveNumber = waveNumber * cst.PI

    all_waves = []
    for i in range(1, n + 1):
        
        k_n = waveNumber * i

        amp = amplitudes[i - 1] if i - 1 < len(amplitudes) else 1.0
        wave = PlaneWave(amp, k_n, 0, phase, time)
        x, y = wave.evaluate_interval(0, periods, num_points)
        all_waves.append((x, y))

    return all_waves