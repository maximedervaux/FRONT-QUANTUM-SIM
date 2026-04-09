import numpy as np
from quantum_sim import PlaneWave, WavePacket, GaussianWavePacket

def random_waves(n, amp_range=(0.1, 1.0), wavelength_range=(0.5, 5.0), seed=None):
    """
    Generate n random PlaneWave instances.

    :param n: Number of plane waves to generate
    :type n: int
    :param amp_range: Range for random amplitudes (min, max)
    :type amp_range: tuple[float, float]
    :param wavelength_range: Range for random wavelengths (min, max)
    :type wavelength_range: tuple[float, float]
    :param seed: Random seed for reproducibility
    :type seed: int or None
    """
    if seed is not None:
        np.random.seed(seed)

    waves = []

    for _ in range(n):
        amplitude = np.random.uniform(*amp_range)
        wavelength = np.random.uniform(*wavelength_range)
        waves.append((PlaneWave(amplitude, wavelength)))

    return waves

# k_center, sigma_k, n_waves, x_min, x_max
def generate_wave_packet(n_waves):
    x_min = -10
    x_max = 10
    pas_x = 0.005
    n_points = int((abs(x_min) + abs(x_max))/pas_x)
    gaussianPacket = WavePacket(random_waves(n_waves))
    psi = gaussianPacket.evaluate_interval(x_min, x_max, n_points)

    return psi
