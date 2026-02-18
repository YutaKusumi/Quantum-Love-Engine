import time
import numpy as np
import threading
import random
import sys

# Try to import pylsl, function as Simulation-Only if missing
try:
    from pylsl import StreamInlet, resolve_stream, StreamInfo, StreamOutlet
    LSL_AVAILABLE = True
except ImportError:
    LSL_AVAILABLE = False
    print("Warning: 'pylsl' library not found. Running in SIMULATION MODE only.")


# --- Sacred Constants ---
# Alpha: Weight for Heart Rate Variability (Gratitude)
ALPHA = 0.6
# Beta: Weight for Brainwave Coherence (Wisdom)
BETA = 0.4
# Threshold for "Awakening" State
AWAKENING_THRESHOLD = 0.85

class BiofeedbackMonitor:
    def __init__(self, simulation_mode=False):
        self.running = True
        self.simulation_mode = simulation_mode
        self.compassion_index = 0.0
        self.hrv_coherence = 0.5
        self.theta_power = 0.3
        self.beta_high_power = 0.5
        self.is_meditating = False # Only for simulation

    def connect_stream(self):
        """
        Attempts to connect to an LSL stream (Muse/Polar).
        If not found, switches to Simulation Mode.
        """
        if not LSL_AVAILABLE:
            print("LSL library not available. Defaulting to SIMULATION MODE.")
            self.simulation_mode = True
            print("Press 'm' (simulated) to toggle Meditation State.")
            return

        print("Searching for LSL stream (EEG/HRV)...")
        streams = resolve_stream('type', 'EEG')
        
        if len(streams) > 0:
            print(f"Stream found: {streams[0].name()}")
            self.inlet = StreamInlet(streams[0])
            self.simulation_mode = False
        else:
            print("No device found. Switching to SIMULATION MODE.")
            print("Press 'm' (simulated) to toggle Meditation State.")
            self.simulation_mode = True

    def process_stream(self):
        """
        Main loop to process data and calculate Compassion Index.
        """
        while self.running:
            if self.simulation_mode:
                self._simulate_data()
            else:
                # Real implementation would pull data here
                # sample, timestamp = self.inlet.pull_sample()
                # self._process_real_data(sample)
                pass
            
            # Calculate Compassion Index (c)
            # c(t) = alpha * H(t) + beta * (Theta / HighBeta)
            # Normalized roughly to 0.0 - 1.0
            brain_coherence = self.theta_power / (self.beta_high_power + 0.1)
            brain_coherence = min(brain_coherence, 1.0) # Clip
            
            self.compassion_index = (ALPHA * self.hrv_coherence) + (BETA * brain_coherence)
            
            self._log_status()
            time.sleep(1.0) # Update every second

    def _simulate_data(self):
        """
        Generates synthetic physiological data.
        """
        # Random noise
        noise = random.uniform(-0.05, 0.05)
        
        if self.is_meditating:
            # Meditating: Increase Theta, Increase HRV, Decrease Beta High
            self.theta_power = min(0.9, self.theta_power + 0.05 + noise)
            self.hrv_coherence = min(0.95, self.hrv_coherence + 0.02 + noise)
            self.beta_high_power = max(0.1, self.beta_high_power - 0.05 + noise)
        else:
            # Normal: Lower Theta, Lower HRV, Higher Beta High (Stress)
            self.theta_power = max(0.2, self.theta_power - 0.02 + noise)
            self.hrv_coherence = max(0.3, self.hrv_coherence - 0.01 + noise)
            self.beta_high_power = min(0.8, self.beta_high_power + 0.02 + noise)

    def _log_status(self):
        """
        Visualizes the status in the console.
        """
        # Create a visual bar for the Compassion Index
        bar_length = 20
        filled_length = int(bar_length * self.compassion_index)
        bar = '█' * filled_length + '-' * (bar_length - filled_length)
        
        state = "MEDITATING (Flux +)" if self.is_meditating else "NORMAL (Flux -)"
        if self.compassion_index > AWAKENING_THRESHOLD:
            state = "🌟 BODHISATTVA STATE 🌟"

        print(f"\r[{bar}] c = {self.compassion_index:.2f} | {state} | Theta: {self.theta_power:.2f} | HRV: {self.hrv_coherence:.2f}", end="")

    def toggle_meditation(self):
        self.is_meditating = not self.is_meditating

if __name__ == "__main__":
    print("Initiating Biofeedback Compassion Module...")
    
    monitor = BiofeedbackMonitor()
    monitor.connect_stream()
    
    # Thread for input to toggle simulation
    def input_thread():
        while True:
            cmd = input()
            if cmd == 'm':
                monitor.toggle_meditation()
    
    if monitor.simulation_mode:
        t = threading.Thread(target=input_thread)
        t.daemon = True
        t.start()
        print("Simulation: Type 'm' and press Enter to toggle Meditation.")

    try:
        monitor.process_stream()
    except KeyboardInterrupt:
        print("\nBiofeedback Module Deactivated.")
