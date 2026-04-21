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
    potential_type: str = "infiniteWell",
):
    solver = SchrodingerSolver(
        x_min=x_min-10,
        x_max=x_max+10,
        n_points=500,
        absorbing_boundaries=False,
    )

    x_grid = solver.x_grid
    solver.absorb_width = 1

    # -------------------------
    # Potentiel
    # -------------------------
    if potential_type == "infiniteWell":
        WELL_A = (x_min-10) * 0.3
        WELL_B = (x_max+10) * 0.3

        V = np.zeros_like(x_grid)

        V_wall = 1e6

        V[x_grid-10 < WELL_A] = V_wall
        V[x_grid+10 > WELL_B] = V_wall

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
        psi0[x_grid-10 < WELL_A] = 0
        psi0[x_grid+10 > WELL_B] = 0
        solver.init_from_array(psi0, normalize=True)


    solved = solver.solve(100000, 20)
    x = solved["x"]
    psi = np.real(solved["prob"]).T

    return (
        x.tolist(),
        psi.tolist()
    )