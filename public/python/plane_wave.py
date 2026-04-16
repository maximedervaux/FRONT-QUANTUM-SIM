import numpy as np
from quantum_sim import PlaneWave

def generate_plane_waves(
    n: int,
    wavelength: float,
    periods: int = 3,
    phase: float = 0,
    time: float = 0,
    harmonic_amplitudes: list[float] | None = None,   
) -> list[tuple]:
    n = int(n)
    num_points = 1000
    x_display = np.linspace(0, 1, num_points) * periods

    # Si aucune amplitude fournie, on met tout à 1.0
    amplitudes = harmonic_amplitudes if harmonic_amplitudes is not None else [1.0] * n

    all_waves = []
    for i in range(1, n + 1):
        λ_n = wavelength / i
        amp = amplitudes[i - 1] if i - 1 < len(amplitudes) else 1.0

        wave = PlaneWave(amp, λ_n, 0, phase, time)  
        y = wave.evaluate(x_display)
        all_waves.append((x_display, y))

    return all_waves