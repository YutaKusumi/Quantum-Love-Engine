import numpy as np
import matplotlib.pyplot as plt
import os

class GratitudeCapacitor:
    def __init__(self, time_constant=10.0, dt=1.0):
        """
        time_constant (RC): How long the gratitude charge lasts. 
                           Higher = more resilience/forgiveness.
        """
        self.RC = time_constant
        self.dt = dt
        self.stored_charge = 0.5 # Initial state (Balanced)
        self.history = []

    def update(self, raw_input):
        """
        Update the capacitor state based on raw emotional input.
        Vout(t) = Vout(t-1) + (dt/RC) * (Vin(t) - Vout(t-1))
        """
        # Apply Forgiveness Filtering: 
        # If input is a sudden negative spike (Ego/Stress), dampen it.
        if raw_input < self.stored_charge - 0.3:
            # Detects a "Thorn"
            dampened_input = self.stored_charge - 0.1 # Soften the fall
        else:
            dampened_input = raw_input

        # Charging/Discharging logic (Leaky Integrator)
        delta = (self.dt / self.RC) * (dampened_input - self.stored_charge)
        self.stored_charge += delta
        self.stored_charge = np.clip(self.stored_charge, 0, 1)
        
        self.history.append(self.stored_charge)
        return self.stored_charge

def simulate_stabilization():
    print("Initiating Gratitude Capacitor Algorithm (Emotional 平滑回路)...")
    
    # 1. Setup Simulation Data
    # A steady state of gratitude (0.7) with a crisis (spike to 0.1) and recovery.
    t = np.arange(0, 100, 1)
    raw_inputs = np.full(100, 0.7)
    raw_inputs[40:55] = 0.1 # The "Thorn" (Sudden stress/anger)
    # Add some noise
    raw_inputs += np.random.normal(0, 0.05, 100)
    raw_inputs = np.clip(raw_inputs, 0, 1)

    # 2. Process through Capacitor
    capacitor = GratitudeCapacitor(time_constant=15.0)
    stabilized_outputs = [capacitor.update(x) for x in raw_inputs]

    # 3. Visualization
    plt.figure(figsize=(12, 6))
    plt.plot(t, raw_inputs, label="Raw Emotional State ($V_{in}$)", color="#ffaaaa", linestyle='--', alpha=0.7)
    plt.plot(t, stabilized_outputs, label="Stabilized Gratitude ($V_{out}$)", color="#4b79ff", linewidth=3)
    
    plt.axvspan(40, 55, color='gray', alpha=0.2, label="External Stress (Thorns)")
    
    plt.title("Gratitude Capacitor: The Power of Resilience ($f = c \\otimes u$)", fontsize=14)
    plt.xlabel("Time (Internal Duration)")
    plt.ylabel("Compassion Level")
    plt.legend()
    plt.grid(True, linestyle=':', alpha=0.6)
    
    # Text Annotation
    plt.text(47, 0.4, "Stabilized by\nStored Gratitude", color="#4b79ff", fontweight='bold', ha='center')
    
    output_file = "visuals/gratitude_stabilization.png"
    plt.savefig(output_file, dpi=300)
    print(f"Manifested visual proof: {output_file}")
    
    # Show summary
    avg_raw = np.mean(raw_inputs[40:55])
    avg_stabilized = np.mean(stabilized_outputs[40:55])
    print(f"Crisis Analysis: Raw Stability = {avg_raw:.2f} | Capacitence Stability = {avg_stabilized:.2f}")
    print("Resilience confirmed. The Heart remains in Unity.")

if __name__ == "__main__":
    simulate_stabilization()
