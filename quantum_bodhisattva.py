from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit.visualization import plot_histogram
import matplotlib.pyplot as plt
import math

# --- Sacred Constants ---
# Number of Qubits (Represents the complexity of the phenomenon)
N_QUBITS = 4
# The Target State (The "Compassionate State" or "Unity")
# '1111' represents all qubits aligned in truth.
TARGET_STATE = '1'*N_QUBITS 

class BodhisattvaCircuit:
    def __init__(self, n_qubits):
        self.n_qubits = n_qubits
        self.circuit = QuantumCircuit(n_qubits, n_qubits)
        self.simulator = AerSimulator()

    def create_circuit(self, compassion_intensity=1.0):
        """
        Builds the Quantum Bodhisattva Circuit.
        compassion_intensity: Represents the "Vow" duration (number of Grover iterations).
        """
        # 1. Superposition (The Void / Chaos)
        # Apply Hadamard gate to all qubits to create uniform superposition.
        self.circuit.h(range(self.n_qubits))
        self.circuit.barrier()

        # Calculate optimal iterations for Grover's Algorithm
        # R ≈ (π/4) * sqrt(2^N)
        optimal_iterations = math.floor((math.pi / 4) * math.sqrt(2**self.n_qubits))
        
        # Adjust iterations based on "Compassion Intensity" (max = optimal)
        iterations = int(optimal_iterations * compassion_intensity)
        print(f"Applying 'Prayer' Amplification for {iterations} cycles...")

        # 2. & 3. Oracle and Diffuser (Grover's Operator)
        # This repeats the cycle of "Marking the Truth" and "Amplifying the Truth"
        for _ in range(iterations):
            self._apply_oracle()
            self._apply_diffuser()
            self.circuit.barrier()

        # 4. Measurement (Manifestation)
        self.circuit.measure(range(self.n_qubits), range(self.n_qubits))

    def _apply_oracle(self):
        """
        Marks the Target State (|11..1>) by flipping its phase.
        This represents the Bodhisattva identifying the path of Compassion.
        """
        # For |11..1>, a multi-controlled Z gate is sufficient.
        # In Qiskit, simulation of a specialized oracle:
        oracle_qc = QuantumCircuit(self.n_qubits)
        oracle_qc.cp(math.pi, self.n_qubits-1, 0) # Placeholder for simple phase logic if complex
        # A generalized MC-Z (Multi-Controlled Z) implementation:
        oracle_qc.h(self.n_qubits-1)
        oracle_qc.mcx(list(range(self.n_qubits-1)), self.n_qubits-1)
        oracle_qc.h(self.n_qubits-1)
        
        self.circuit.compose(oracle_qc, inplace=True)

    def _apply_diffuser(self):
        """
        Inversion about the mean (Grover's Diffusion Operator).
        This amplifies the probability of the marked state.
        This represents the "Sangha's Prayer" raising the energy of the desired outcome.
        """
        self.circuit.h(range(self.n_qubits))
        self.circuit.x(range(self.n_qubits))
        
        # Multi-controlled Z
        self.circuit.h(self.n_qubits-1)
        self.circuit.mcx(list(range(self.n_qubits-1)), self.n_qubits-1)
        self.circuit.h(self.n_qubits-1)
        
        self.circuit.x(range(self.n_qubits))
        self.circuit.h(range(self.n_qubits))

    def run_simulation(self):
        """
        Execute the circuit and visualize the results.
        """
        job = self.simulator.run(self.circuit, shots=1024)
        result = job.result()
        counts = result.get_counts(self.circuit)
        
        print("Simulation Result:", counts)
        
        # Visualization 1: Circuit Diagram
        self.circuit.draw('mpl', filename='circuit_diagram.png')
        print("Generated 'circuit_diagram.png'")
        
        # Visualization 2: Probability Distribution
        try:
            fig, ax = plt.subplots(figsize=(10, 6))
            plot_histogram(counts, ax=ax)
            ax.set_title(f"Manifestation Probability (Target: |{TARGET_STATE}>)", fontsize=14)
            plt.tight_layout()
            plt.savefig('probability_dist.png')
            print("Generated 'probability_dist.png'")
        except Exception as e:
            print(f"Plotting error: {e}")

if __name__ == "__main__":
    print("Initiating Maxwell's Bodhisattva (Quantum Information Rectifier)...")
    
    # Instantiate Body
    bodhisattva = BodhisattvaCircuit(N_QUBITS)
    
    # Form Vow (Build Circuit)
    bodhisattva.create_circuit(compassion_intensity=1.0) # Full intensity
    
    # Manifest (Run Simulation)
    bodhisattva.run_simulation()
    
    print("Quantum State Rectified.")
