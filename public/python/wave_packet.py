import numpy as np
from quantum_sim import PlaneWave, WavePacket, GaussianWavePacket, constants as cst
from quantum_sim.utils.wave_generators import random_waves

def generate_wave_packet(
    packet_type: str = "gaussian",
    k_center: float = 5.0,
    sigma_k: float = 1.0,
    x_center: float = 0.0,
    n_waves: int = 50,
    time: float = 0.0,
    x_min: float = -10.0,
    x_max: float = 10.0,
    visualization_mode: str = "wavefunction",
    custom_waves: list[dict] | None = None,
) -> dict:
    """
    Generate wave packet data for visualization.
    
    :param packet_type: Type of wave packet ('gaussian', 'custom', 'random')
    :param k_center: Central wave vector (for gaussian)
    :param sigma_k: Width in k-space (for gaussian)
    :param x_center: Central position (for gaussian)
    :param n_waves: Number of plane waves to superpose
    :param time: Current time
    :param x_min: Minimum x value
    :param x_max: Maximum x value
    :param visualization_mode: 'wavefunction', 'probability', 'fourier', 'phase'
    :param custom_waves: List of custom waves with amplitude, waveNumber, phase
    :return: Dictionary with x, y, and optional additional data
    """
    n_points = 2000
    pas_x = (x_max - x_min) / n_points
    
    # Create wave packet based on type
    if packet_type == "gaussian":
        packet = GaussianWavePacket(
            k_center=k_center * cst.PI,
            sigma_k=sigma_k * cst.PI,
            position_center=x_center,
            n_waves=int(n_waves),
            time=time
        )
    elif packet_type == "custom" and custom_waves:
        waves = []
        for w in custom_waves:
            if w.get('enabled', True):
                wave = PlaneWave(
                    amplitude=w['amplitude'],
                    wave_number=w['waveNumber'] * cst.PI,
                    omega=0,
                    phase=w['phase'],
                    time=time
                )
                waves.append(wave)
        packet = WavePacket(waves)
    elif packet_type == "random":
        waves = random_waves(int(n_waves))
        packet = WavePacket(waves)
    else:
        packet = GaussianWavePacket(
            k_center=k_center * cst.PI,
            sigma_k=sigma_k * cst.PI,
            position_center=x_center,
            n_waves=int(n_waves),
            time=time
        )
    
    # Evaluate wave packet
    packet.normalize(x_min, x_max, n_points)
    x, psi_complex = packet.evaluate_interval(x_min, x_max, n_points)
    
    # Prepare output based on visualization mode
    result = {
        'x': x.tolist(),
    }
    
    if visualization_mode == "wavefunction":
        result['y'] = np.real(psi_complex).tolist()
        result['y_imag'] = np.imag(psi_complex).tolist()
    elif visualization_mode == "probability":
        x_density = np.linspace(x_min, x_max, n_points)
        result['y'] = (packet.probability_density(x_density)).tolist()
    
    # Add envelope for gaussian packets
    if packet_type == "gaussian" and visualization_mode in ["wavefunction", "probability"]:
        envelope = packet._gaussian_envelope(k_center)
        if visualization_mode == "probability":
            result['envelope'] = (envelope ** 2).tolist()
        else:
            result['envelope'] = envelope.tolist()
    print("Return result:",result)
    return result


def get_packet_info(
    packet_type: str = "gaussian",
    k_center: float = 5.0,
    sigma_k: float = 1.0,
) -> dict:
    """
    Calculate theoretical properties of the wave packet.
    
    :return: Dictionary with width_x, width_k, uncertainty_product, group_velocity
    """
    k_c = k_center * cst.PI
    sk = sigma_k * cst.PI
    
    delta_x = 1.0 / (2 * sk)
    delta_k = sk
    uncertainty = delta_x * delta_k
    
    v_group = k_c
    
    return {
        'width_x': delta_x,
        'width_k': delta_k,
        'uncertainty_product': uncertainty,
        'group_velocity': v_group,
        'waveNumber_center': 2 * cst.PI / k_c if k_c > 0 else 0,
    }