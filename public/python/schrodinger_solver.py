import numpy as np
from quantum_sim import SchrodingerSolver, GaussianWavePacket


def schrodinger_solving_function(
    k_center: float = 5.0,
    sigma_k: float = 1.0,
    x_center: float = 0.0,
    n_waves: int = 50,
    x_min: float = -10.0,
    x_max: float = 10.0,
    potential_type: str = "free",
    well_width: float = 7.2,
    step_height: float = 50,
    barrier_width: float = 2.0,
    barrier_height: float = 50,
    time_steps: int = 200,
    spatial_points: int = 300,
    absorbing_boundaries: bool = False,
):
    """
    Résout l'équation de Schrödinger avec différents potentiels.
    
    Args:
        k_center: Centre du vecteur d'onde
        sigma_k: Écart-type en espace des moments
        x_center: Centre spatial du paquet
        n_waves: Nombre d'ondes dans la décomposition
        x_min, x_max: Limites du domaine spatial
        potential_type: Type de potentiel ("free", "infiniteWell", "step", "barrier")
        
        # Paramètres spécifiques
        well_width: Largeur du puits infini
        step_height: Hauteur de la marche (eV)
        barrier_width: Largeur de la barrière
        barrier_height: Hauteur de la barrière (eV)
        
        # Simulation
        time_steps: Nombre d'images d'animation
        spatial_points: Nombre de points spatiaux
        absorbing_boundaries: Conditions aux limites absorbantes
    
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
        n_points=spatial_points,
        absorbing_boundaries=absorbing_boundaries,
    )
    
    x_grid = solver.x_grid
    V = np.zeros_like(x_grid)
    
    if potential_type == "infiniteWell":
        well_left = -well_width / 2
        well_right = well_width / 2
        
        V_wall = 1e-36
        
        V[x_grid < well_left] = V_wall
        V[x_grid > well_right] = V_wall
        
    elif potential_type == "step":
        step_position = 0.0
        V_step = step_height / 10000.0
        V[x_grid > step_position] = V_step
        print("set step")

    elif potential_type == "barrier":
        barrier_left = -barrier_width / 2
        barrier_right = barrier_width / 2

        V_barrier = barrier_height / 10000.0
        
        barrier_mask = (x_grid >= barrier_left) & (x_grid <= barrier_right)
        V[barrier_mask] = V_barrier
    
    solver.set_potential(V)
    print("set potential")
    
    packet = GaussianWavePacket(
        k_center=k_center,
        sigma_k=sigma_k,
        position_center=x_center,
        n_waves=n_waves,
    )
    
    solver.init_from_packet(packet)
    
    if potential_type == "infiniteWell":
        psi0 = solver._psi_0.copy()
        
        well_left = -well_width / 2
        well_right = well_width / 2
        psi0[x_grid < well_left] = 0
        psi0[x_grid > well_right] = 0
        
        solver.init_from_array(psi0, normalize=True)
    
    print("start solving")
    dt = 100000 / time_steps
    solved = solver.solve(t_final=100000, dt=dt)
    
    x = solved["x"]
    print("solving finish")
    

    psi = solved["psi"]

    psi_real = np.real(psi).T
    psi_imag = np.imag(psi).T
    prob = np.abs(psi)**2
    prob = prob.T


    return (
    x.tolist(),
    prob.tolist(),
    psi_real.tolist(),
    psi_imag.tolist()
)