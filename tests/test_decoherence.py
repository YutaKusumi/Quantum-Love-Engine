
import pytest
import numpy as np
import sys
import os

# Add parent directory to path to import simulation.py
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from simulation import GratitudeCapacitor, NegentropyEngine, DECOHERENCE_THRESHOLD

class TestDecoherencePhysics:
    """
    Verifies that the engine obeys the laws of Compassionate Thermodynamics.
    Specifically: Does the quantum state collapse when Compassion (c) is absent?
    """

    def test_capacitor_resilience(self):
        """
        Proof 1: The Gratitude Capacitor must buffer transient stress (Thorns).
        """
        capacitor = GratitudeCapacitor(rc=10.0)
        # Charge it up with gratitude
        for _ in range(50):
            capacitor.update(0.8)
        
        initial_charge = capacitor.charge
        assert initial_charge > 0.7, "Capacitor failed to charge with Gratitude."

        # Introduce a sudden Thorn (Stress spike)
        # Step 1 of stress
        new_charge = capacitor.update(0.1) 
        
        # The charge should NOT drop instantly to 0.1
        # It should degrade gracefully obey physics (RC time constant)
        assert new_charge > 0.6, "Capacitor failed to buffer the Thorn. Resilience improperly implemented."
        print(f"\n[PASS] Resilience verified: Charge dropped only to {new_charge:.2f} despite input 0.1")

    def test_decoherence_trigger(self):
        """
        Proof 2: The Engine MUST stop acting as a rectifier when Compassion < Threshold.
        This is the ethical interlock.
        """
        engine = NegentropyEngine(size=16)
        
        # Case A: High Compassion
        engine.step(0.8)
        assert not engine.is_decoherent, "Engine triggered decoherence despite high compassion."

        # Case B: Zero Compassion (Malice/Ego)
        # Drain the capacitor to simulate prolonged ego-centric usage
        # We manually override the capacitor for testing pure logic
        engine.capacitor.charge = 0.05 
        
        # Step the engine
        S, c_eff, is_decoherent = engine.step(0.1)
        
        assert is_decoherent, "Engine FAILED to trigger decoherence under low compassion. Safety compromise detected."
        assert c_eff < DECOHERENCE_THRESHOLD
        print(f"\n[PASS] Ethical Interlock verified: Engine collapsed to decoherence state.")

    def test_entropy_divergence(self):
        """
        Proof 3: In Decoherent state, Entropy must NOT decrease (2nd Law restoration).
        """
        engine = NegentropyEngine(size=32)
        
        # Force Decoherence
        engine.capacitor.charge = 0.0
        engine.is_decoherent = True
        
        # Run for 10 steps
        entropies = []
        for _ in range(10):
            S, _, _ = engine.step(0.0)
            entropies.append(S)
            
        # Check if entropy is high (randomness)
        # Max entropy for uniform dist is -sum(p ln p). For 50 bins, it's ln(50) ~= 3.91
        avg_entropy = np.mean(entropies)
        assert avg_entropy > 3.0, f"Entropy too low for decoherent state: {avg_entropy}. System is still ordering without compassion!"
        print(f"\n[PASS] Thermodynamics verified: Entropy remains high ({avg_entropy:.2f}) in decoherence.")

if __name__ == "__main__":
    sys.exit(pytest.main(["-v", __file__]))
