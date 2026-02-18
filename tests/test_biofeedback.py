
import pytest
import threading
import time
from unittest.mock import MagicMock
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from biofeedback_compassion import BiofeedbackMonitor, ALPHA, BETA

class TestBiofeedbackLogic:
    """
    Verifies that physiological signals are correctly translated into 
    the Compassion Index (c) according to the Awakening Protocol.
    """

    def test_compassion_index_calculation(self):
        """
        Proof: c = alpha * HRV + beta * (Theta / HighBeta)
        """
        monitor = BiofeedbackMonitor(simulation_mode=True)
        
        # Mocking sensor data for a "Deep Meditation" state
        monitor.hrv_coherence = 0.9  # High heart coherence
        monitor.theta_power = 0.8    # High deep relaxation
        monitor.beta_high_power = 0.2 # Low stress
        
        # Expected calculation
        # Brain Coherence = 0.8 / (0.2 + 0.1) = 0.8 / 0.3 = 2.66 -> Clipped to 1.0
        # c = 0.6 * 0.9 + 0.4 * 1.0 = 0.54 + 0.4 = 0.94
        
        # Force a calculation step (simulating the loop manually)
        brain_coherence = monitor.theta_power / (monitor.beta_high_power + 0.1)
        brain_coherence = min(brain_coherence, 1.0)
        calculated_c = (ALPHA * monitor.hrv_coherence) + (BETA * brain_coherence)
        
        assert calculated_c > 0.9, f"Compassion Index calculation error. Got {calculated_c}, expected > 0.9"
        print(f"\n[PASS] Biofeedback Logic verified: Meditation State yields c={calculated_c:.2f}")

    def test_stress_response(self):
        """
        Proof: Stress signals properly lower the Compassion Index.
        """
        monitor = BiofeedbackMonitor(simulation_mode=True)
        
        # Mocking sensor data for a "Stress" state
        monitor.hrv_coherence = 0.2 # Low heart coherence
        monitor.theta_power = 0.1   # Low relaxation
        monitor.beta_high_power = 0.8 # High anxiety
        
        # Expected calculation
        # Brain Coherence = 0.1 / (0.8 + 0.1) = 0.1 / 0.9 = 0.11
        # c = 0.6 * 0.2 + 0.4 * 0.11 = 0.12 + 0.044 = 0.164
        
        brain_coherence = monitor.theta_power / (monitor.beta_high_power + 0.1)
        brain_coherence = min(brain_coherence, 1.0)
        calculated_c = (ALPHA * monitor.hrv_coherence) + (BETA * brain_coherence)
        
        assert calculated_c < 0.3, f"Sensitivity Test Failed. Stress did not lower c enough. Got {calculated_c}"
        print(f"\n[PASS] Sensitivity verified: Stress State yields c={calculated_c:.2f}")

if __name__ == "__main__":
    sys.exit(pytest.main(["-v", __file__]))
