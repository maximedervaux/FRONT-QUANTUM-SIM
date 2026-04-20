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
    x_min: float = -5.0,
    x_max: float = 5.0,
    visualization_mode: str = "wavefunction",
    custom_waves: list[dict] | None = None,
) -> dict:

    n_points = 2000

    n_waves = max(1, int(n_waves))

    k_c = k_center * cst.PI
    sigma = sigma_k * cst.PI

    if packet_type == "gaussian":
        packet = GaussianWavePacket(
            k_center=k_c,
            sigma_k=sigma,
            position_center=x_center,
            n_waves=n_waves,
            time=time,
        )

    elif packet_type == "custom" and custom_waves:
        waves = []
        for w in custom_waves:
            if not w.get("enabled", True):
                continue
            try:
                wave = PlaneWave(
                    amplitude=w["amplitude"],
                    wave_number=w["waveNumber"] * cst.PI,
                    omega=0,
                    phase=w.get("phase", 0.0),
                    time=time,
                )
                waves.append(wave)
            except KeyError:
                continue

        packet = WavePacket(waves) if waves else GaussianWavePacket(
            k_center=k_c,
            sigma_k=sigma,
            position_center=x_center,
            n_waves=n_waves,
            time=time,
        )

    elif packet_type == "random":
        waves = random_waves(n_waves)
        packet = WavePacket(waves)

    else:
        packet = GaussianWavePacket(
            k_center=k_c,
            sigma_k=sigma,
            position_center=x_center,
            n_waves=n_waves,
            time=time,
        )

    packet.normalize(x_min, x_max, n_points)
    x, psi_complex = packet.evaluate_interval(x_min, x_max, n_points)

    result = {"x": x.tolist()}

    if visualization_mode == "wavefunction":
        result["y"] = np.real(psi_complex).tolist()
        result["y_imag"] = np.imag(psi_complex).tolist()

    elif visualization_mode == "probability":
        result["y"] = (np.abs(psi_complex) ** 2).tolist()

    elif visualization_mode == "phase":
        result["y"] = np.angle(psi_complex).tolist()

    elif visualization_mode == "fourier":
        psi_k = np.fft.fftshift(np.fft.fft(psi_complex))
        k_vals = np.fft.fftshift(np.fft.fftfreq(len(x), d=(x[1] - x[0])))

        result["k"] = k_vals.tolist()
        result["y"] = (np.abs(psi_k) ** 2).tolist()

    # -------------------------
    # Enveloppe gaussienne
    # -------------------------
    if packet_type == "gaussian" and visualization_mode in ["wavefunction", "probability"]:
        try:
            envelope = packet._gaussian_envelope(x)
            result["envelope"] = (
                (envelope ** 2).tolist()
                if visualization_mode == "probability"
                else envelope.tolist()
            )
        except Exception:
            pass 

    return result


def get_packet_info(
    k_center: float = 5.0,
    sigma_k: float = 1.0,
) -> dict:

    k_c = k_center * cst.PI
    sk = sigma_k * cst.PI

    if sk == 0:
        return {
            "width_x": None,
            "width_k": 0,
            "uncertainty_product": None,
            "group_velocity": k_c,
            "wavelength": None,
        }

    delta_x = 1.0 / (2 * sk)
    delta_k = sk
    uncertainty = delta_x * delta_k

    v_group = k_c

    return {
        "width_x": delta_x,
        "width_k": delta_k,
        "uncertainty_product": uncertainty,
        "group_velocity": v_group,
        "wavelength": (2 * cst.PI / k_c) if k_c != 0 else None,
    }