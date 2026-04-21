import numpy as np
from quantum_sim import SchrodingerSolver, GaussianWavePacket


def schrodinger_solving_function(
    k_center: float = 5.0,
    sigma_k: float = 1.0,
    x_center: float = 0.0,
    n_waves: int = 50,
    time: float = 0.0,
    x_min: float = -10.0,
    x_max: float = 10.0,
    potential_type: str = "free",
):
    """
    Résout l'équation de Schrödinger avec paquet d'ondes gaussien.
    
    Args:
        k_center: Centre du vecteur d'onde (k)
        sigma_k: Écart-type en espace des moments
        x_center: Centre spatial du paquet
        n_waves: Nombre d'ondes dans la décomposition
        time: Temps initial
        x_min, x_max: Limites du domaine spatial
        potential_type: Type de potentiel ("infiniteWell")
    
    Returns:
        tuple: (x_grid, probability_grid) pour animation
    """
    
    # Extension du domaine pour les conditions aux limites
    padding = 10
    x_min_extended = x_min - padding
    x_max_extended = x_max + padding
    
    solver = SchrodingerSolver(
        x_min=x_min_extended,
        x_max=x_max_extended,
        n_points=300,
        absorbing_boundaries=False,
    )
    
    x_grid = solver.x_grid
    
    if potential_type == "infiniteWell":
        well_left = x_min_extended * 0.3
        well_right = x_max_extended * 0.3
        
        V = np.zeros_like(x_grid)
        V_wall = 1e-36
        
        V[x_grid < well_left] = V_wall
        V[x_grid > well_right] = V_wall
        
        solver.set_potential(V)
    
    packet = GaussianWavePacket(
        k_center=k_center,
        sigma_k=sigma_k,
        position_center=x_center,
        n_waves=n_waves,
        time=time,
    )
    
    solver.init_from_packet(packet)
    
    if potential_type == "infiniteWell":
        psi0 = solver._psi_0.copy()
        
        well_left = x_min_extended * 0.3
        well_right = x_max_extended * 0.3
        psi0[x_grid < well_left] = 0
        psi0[x_grid > well_right] = 0
        
        solver.init_from_array(psi0, normalize=True)
    
    solved = solver.solve(100000, 200)
    
    x = solved["x"]
    prob = np.real(solved["prob"]).T
    
    return (x.tolist(), prob.tolist())