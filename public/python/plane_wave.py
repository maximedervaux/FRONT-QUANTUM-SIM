import numpy as np
from quantum_sim import PlaneWave

def generate_plane_waves(n, wavelength, periods=3, phase=0, time=0):
    n = int(n)
    all_waves = []
    
    # Generate x-axis normalized to [0, 1] for display
    num_points = 1000
    x_display = np.linspace(0, 1, num_points) * periods

    for i in range(1, n+1):
        # For harmonic i: wavelength decreases, so frequency increases
        λ_n = wavelength / i  # longueur d'onde de l'harmonique
        # Create PlaneWave with correct wavelength
        wave = PlaneWave(i/10, λ_n, 0, phase, time)
        # Evaluate across scaled range to show multiple periods
        y = wave.evaluate(x_display)
        # Return with original x_display axis for plotting
        all_waves.append((x_display, y))  # tuple par harmonique

    return all_waves
