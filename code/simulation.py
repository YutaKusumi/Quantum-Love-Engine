import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from scipy.stats import entropy
import os
import time

# --- Sacred Constants (Constants of the Theory) ---
GRID_SIZE = 64
STEPS = 300
INITIAL_COMPASSION = 0.5
DECOHERENCE_THRESHOLD = 0.2
CAPACITOR_RC = 20.0  # Time constant for gratitude resilience
NOISE_LEVEL_NORMAL = 0.05
NOISE_LEVEL_DECOHERENT = 0.5  # Shattered state noise

np.random.seed(42)

class GratitudeCapacitor:
    def __init__(self, rc=20.0, dt=1.0):
        self.rc = rc
        self.dt = dt
        self.charge = 0.5
        self.history = []

    def update(self, v_in):
        # Forgiveness filtering: dampen sudden drops
        if v_in < self.charge - 0.2:
            v_in = self.charge - 0.05
        
        delta = (self.dt / self.rc) * (v_in - self.charge)
        self.charge += delta
        self.charge = np.clip(self.charge, 0, 1)
        self.history.append(self.charge)
        return self.charge

class NegentropyEngine:
    def __init__(self, size):
        self.size = size
        self.field = np.random.rand(size, size)
        
        # Mandala Target Pattern
        x = np.linspace(-np.pi, np.pi, size)
        y = np.linspace(-np.pi, np.pi, size)
        X, Y = np.meshgrid(x, y)
        R = np.sqrt(X**2 + Y**2)
        self.target = (np.sin(4*R) + 1) / 2
        
        self.capacitor = GratitudeCapacitor(rc=CAPACITOR_RC)
        self.is_decoherent = False
        self.history_entropy = []
        self.history_c = []
        self.history_charge = []

    def step(self, raw_c):
        """
        One step of the engine.
        raw_c: Raw compassion input (e.g., from biofeedback)
        """
        # 1. Update Capacitor (Gratitude Buffer)
        buffered_c = self.capacitor.update(raw_c)
        self.history_c.append(raw_c)
        self.history_charge.append(buffered_c)
        
        # 2. Decoherence Trigger Logic
        # If buffered compassion falls below threshold, the quantum state collapses.
        if buffered_c < DECOHERENCE_THRESHOLD:
            self.is_decoherent = True
        else:
            self.is_decoherent = False

        # 3. Field Evolution
        if self.is_decoherent:
            # Shattered state: High noise, no pull toward order
            noise = (np.random.rand(self.size, self.size) - 0.5) * NOISE_LEVEL_DECOHERENT
            self.field += noise
        else:
            # Coherent state: Normal noise, pulled by Buffered Compassion
            noise = (np.random.rand(self.size, self.size) - 0.5) * NOISE_LEVEL_NORMAL
            diff = self.target - self.field
            # The core axiom: c * (u -> i)
            self.field += noise + (diff * buffered_c * 0.1) # Scaling factor for stability
            
        self.field = np.clip(self.field, 0, 1)
        
        # 4. Metrics
        counts, _ = np.histogram(self.field, bins=50, range=(0,1))
        prob = counts / (np.sum(counts) + 1e-10) + 1e-10
        S = -np.sum(prob * np.log(prob))
        self.history_entropy.append(S)
        
        return S, buffered_c, self.is_decoherent

def run_synthesis_simulation():
    print("Initiating Great Synthesis Simulation (v28.1 Ω)...")
    engine = NegentropyEngine(GRID_SIZE)
    
    # Define a scenario: Meditation -> Sudden Stress -> Graceful Recovery
    t = np.arange(STEPS)
    raw_inputs = np.zeros(STEPS)
    
    # Meditation Phase (0-100)
    raw_inputs[0:100] = 0.8 
    # Sudden "Thorn" (100-150): Stress/Ego spike
    raw_inputs[100:150] = 0.05
    # Recovery Phase (150-300)
    raw_inputs[150:300] = 0.7
    
    # Add minor noise to inputs
    raw_inputs += np.random.normal(0, 0.05, STEPS)
    raw_inputs = np.clip(raw_inputs, 0, 1)

    for i in range(STEPS):
        S, c_eff, decoherent = engine.step(raw_inputs[i])
        if i % 50 == 0:
            status = "!!! DECOHERENT !!!" if decoherent else "COHERENT"
            print(f"Step {i:3d} | Input c: {raw_inputs[i]:.2f} | Buffer: {c_eff:.2f} | Entropy: {S:.3f} | {status}")

    # Visualization
    print("\nGenerating Unified Proof Visualization...")
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle("Quantum Love Engine: Unified Negentropy & Decoherence Proof", fontsize=16)

    # 1. Final Field (Mandala)
    img = ax1.imshow(engine.field, cmap='magma')
    ax1.set_title("Final Reality State ($i$)")
    fig.colorbar(img, ax=ax1)

    # 2. Entropy Trend
    ax2.plot(t, engine.history_entropy, color='#ff4b4b', lw=2)
    ax2.set_title("System Entropy ($S$) Over Time")
    ax2.set_ylabel("Shannon Entropy")
    ax2.grid(True, alpha=0.3)
    ax2.axvspan(100, 150, color='red', alpha=0.1, label='Chaos Phase')

    # 3. Compassion & Capacitor
    ax3.plot(t, raw_inputs, color='#aaaaaa', ls='--', alpha=0.6, label='Raw Intent ($c_{raw}$)')
    ax3.plot(t, engine.history_charge, color='#4b79ff', lw=3, label='Capacitor Buffer ($c_{eff}$)')
    ax3.axhline(y=DECOHERENCE_THRESHOLD, color='red', ls=':', label='Decoherence Limit')
    ax3.set_title("Compassion Dynamics & Resilience")
    ax3.set_ylabel("Intensity")
    ax3.legend()
    ax3.grid(True, alpha=0.3)

    # 4. Target Pattern (The Ideal Mandala)
    ax4.imshow(engine.target, cmap='magma')
    ax4.set_title("Target Mandala Pattern (Ideal $i$)")
    
    plt.tight_layout(rect=[0, 0.03, 1, 0.95])
    plt.savefig("proof_of_negentropy.png", dpi=300)
    print("Proof manifest: 'proof_of_negentropy.png'")
    
    # Save a CSV for verification tests
    with open("simulation_data.csv", "w") as f:
        f.write("step,input_c,buffer_c,entropy,is_decoherent\n")
        for i in range(STEPS):
            f.write(f"{i},{raw_inputs[i]:.4f},{engine.history_charge[i]:.4f},{engine.history_entropy[i]:.4f},{1 if engine.history_charge[i] < DECOHERENCE_THRESHOLD else 0}\n")

if __name__ == "__main__":
    run_synthesis_simulation()
