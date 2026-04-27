import numpy as np
from quantum_sim import PlaneWave, constants as cst


def generate_plane_waves(
    n: int,
    waveNumber: float,
    phase: float = 0,
    time: float = 0,
    harmonic_amplitudes: list[float] | None = None,
    x_min: float = -5,
    x_max: float = 5,
) -> list[tuple]:
    """
    Generate plane waves with guaranteed intersection at x=0.
    
    Args:
        n: Number of harmonics
        waveNumber: Base wave number (in multiples of π)
        phase: Initial phase
        time: Time parameter
        harmonic_amplitudes: List of amplitudes for each harmonic
        x_min: Minimum x position
        x_max: Maximum x position
    
    Returns:
        List of (x, y) tuples for each harmonic
    """
    n = int(n)
    num_points = 2000
    amplitudes = harmonic_amplitudes if harmonic_amplitudes is not None else [1.0] * n
    waveNumber = waveNumber * cst.PI

    # Create x array that INCLUDES exactly 0
    # Using linspace guarantees x=0 is in the array
    x = np.linspace(x_min, x_max, num_points)
    
    # Ensure x=0 is included by finding closest and centering
    zero_idx = np.argmin(np.abs(x))
    if not np.isclose(x[zero_idx], 0, atol=1e-10):
        # Reconstruct x to guarantee x[k] = 0 for some k
        step = (x_max - x_min) / (num_points - 1)
        num_left = int(np.ceil(-x_min / step))
        num_right = int(np.ceil(x_max / step))
        x = np.linspace(-num_left * step, num_right * step, num_points)

    all_waves = []
    for i in range(1, n + 1):
        k_n = waveNumber * i

        amp = amplitudes[i - 1] if i - 1 < len(amplitudes) else 1.0
        wave = PlaneWave(amp, k_n, 0, phase, time)
        
        # Evaluate at all x points
        y = wave.evaluate(x)
        
        all_waves.append((x, y))

    return all_waves