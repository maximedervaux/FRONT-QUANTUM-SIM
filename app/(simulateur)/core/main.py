import quantum_sim as qsl 

def run_simulation(params):
    simulator = qsl.Simulator(params)
    results = simulator.execute()
    return results
