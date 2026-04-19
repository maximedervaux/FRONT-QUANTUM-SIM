from quantum_sim import SchrodingerSolver

def schrodinger_solving_function():
    solver = SchrodingerSolver(
                x_min=X_MIN,
                x_max=X_MAX,
                n_points=N_POINTS,
                absorbing_boundaries=True,
            )