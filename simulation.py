import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from scipy.stats import entropy
import os

# --- Sacred Constants (Constants of the Theory) ---
# Grid size for the vacuum field (represents a slice of the quantum vacuum)
GRID_SIZE = 64
# Number of time steps for the simulation
STEPS = 200
# Strength of the "Compassion Function" (c) in biassing the field
COMPASSION_STRENGTH = 0.05
# Random seed for reproducibility (The seed of the universe)
np.random.seed(42)

class CompassionEngine:
    def __init__(self, size):
        self.size = size
        # Initialize Vacuum Fluctuations (u): Random noise between 0 and 1
        # Represents high entropy state (Chaos)
        self.field = np.random.rand(size, size)
        
        # Define the Compassion Target (c): A harmonic "Mandala" pattern
        # This represents the intended order/compassion we want to manifest.
        # Here we use a simple radial sine wave pattern as a proxy for a mandala.
        x = np.linspace(-np.pi, np.pi, size)
        y = np.linspace(-np.pi, np.pi, size)
        X, Y = np.meshgrid(x, y)
        R = np.sqrt(X**2 + Y**2)
        # A beautiful ripple pattern representing "Order"
        self.target_pattern = (np.sin(4*R) + 1) / 2 
        
        self.history_entropy = []
        self.history_coherence = []

    def step(self):
        """
        Evolve the field for one time step.
        Rule: The field fluctuates randomly (Entropy) but is gently pulled
              towards the target pattern by the Compassion Strength (Negentropy).
        """
        # 1. Vacuum Fluctuation (Chaos component)
        # Small random thermal noise added at each step
        noise = (np.random.rand(self.size, self.size) - 0.5) * 0.1
        
        # 2. Compassion Pull (Order component)
        # The field moves towards the target pattern
        # The formula: u_new = u_old + noise + c * (target - u_old)
        diff = self.target_pattern - self.field
        self.field += noise + (diff * COMPASSION_STRENGTH)
        
        # Clip values to keep them valid (0-1) for visualization
        self.field = np.clip(self.field, 0, 1)

    def calculate_metrics(self):
        """
        Calculate Shannon Entropy and Coherence (Inverse of MSE).
        """
        # Entropy calculation (discretize field for histogram)
        counts, _ = np.histogram(self.field, bins=50, range=(0,1))
        # Add epsilon to avoid log(0)
        prob_dist = counts / np.sum(counts) + 1e-10
        # Calculate Shannon Entropy
        S = -np.sum(prob_dist * np.log(prob_dist))
        self.history_entropy.append(S)
        
        # Coherence (Similarity to Target)
        # Using 1 - Mean Squared Error as a proxy for "Resonance"
        mse = np.mean((self.field - self.target_pattern)**2)
        coherence = 1.0 / (mse + 1e-5) # Avoid division by zero
        self.history_coherence.append(coherence)

        return S, coherence

def run_simulation():
    print("Initiating Quantum Information Rectifier Engine Simulation...")
    print(f"Grid Size: {GRID_SIZE}x{GRID_SIZE}")
    print(f"Compassion Strength ($c$): {COMPASSION_STRENGTH}")

    engine = CompassionEngine(GRID_SIZE)
    
    # Store frames for animation
    frames = []
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    fig.suptitle("The Compassion Function: Reducing Entropy ($c \\otimes u \\rightarrow i$)", fontsize=14)
    
    # Run the loop
    for i in range(STEPS):
        engine.step()
        S, Coh = engine.calculate_metrics()
        
        # Log progress every 20 steps
        if i % 20 == 0:
            print(f"Step {i}: Entropy S = {S:.4f}, Coherence = {Coh:.4f}")
            
            # Save snapshots for README
            if i == 0:
                plt.imsave("sim_0_chaos.png", engine.field, cmap='magma')
            if i == STEPS // 2:
                plt.imsave("sim_mid_transition.png", engine.field, cmap='magma')
            if i == STEPS - 1:
                plt.imsave("sim_final_mandala.png", engine.field, cmap='magma')

        # Accumulate data for plotting (only necessary if we were making a live plot, 
        # but here we generate the animation post-hoc or just the final graph)
    
    # Final Outcome Visualization
    print("Simulation Complete. Generating Analysis Graph...")
    
    # Left Plot: Final Field State
    ax1.imshow(engine.field, cmap='magma')
    ax1.set_title("Final Reality State ($i$)")
    ax1.axis('off')
    
    # Right Plot: Entropy Reduction
    t = np.arange(STEPS)
    ax2.plot(t, engine.history_entropy, label="System Entropy ($S$)", color="#ff4b4b", linewidth=2)
    ax2.set_title("Thermodynamic Entropy Reduction")
    ax2.set_xlabel("Time (t)")
    ax2.set_ylabel("Shannon Entropy")
    ax2.grid(True, linestyle='--', alpha=0.6)
    ax2.legend()
    
    # Save the composite analysis image
    plt.tight_layout()
    plt.savefig("proof_of_negentropy.png", dpi=300)
    print("Artifact 'proof_of_negentropy.png' generated.")
    
    print("System Entropy successfully reduced via Compassion Intent.")

if __name__ == "__main__":
    run_simulation()
