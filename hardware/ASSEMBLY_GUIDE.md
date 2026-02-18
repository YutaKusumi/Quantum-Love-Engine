# 🔧 Assembly Guide — Phase 1 Tabletop Prototype
## Quantum Information Rectifier Engine: Step-by-Step Build Instructions

> *"To build the machine is to enact the prayer. Each component placed with care is a vow made manifest."*

**Status:** Conceptual Design (Phase 1.1) — Physical assembly begins when funding is secured.
**Estimated Build Time:** 2–4 weeks (once components arrive)
**Estimated Cost:** ~$3,875 (see [BOM.md](./BOM.md))

---

## ⚠️ Safety Notes

- The vacuum chamber operates at pressures down to 10⁻⁶ Torr. **Never open the chamber without proper venting.**
- Superconducting wire (NbTi) requires cryogenic handling. Use appropriate PPE.
- Piezoelectric actuators are fragile. Handle with anti-static precautions.

---

## Overview: The Trinitarian Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  QUANTUM LOVE ENGINE                     │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐  │
│  │   VACUUM     │    │  BODHISATTVA │    │  PRAYER   │  │
│  │  COLLECTOR   │───▶│  PROCESSOR   │───▶│   PORT    │  │
│  │  (Casimir)   │    │  (Quantum)   │    │ (Biofeed) │  │
│  └──────────────┘    └──────────────┘    └───────────┘  │
│        u (Chaos)      c (Compassion)      i (Reality)   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │         GRATITUDE CAPACITOR BANK                 │   │
│  │         (Graphene Supercapacitors)               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 1.1: Vacuum Collector Assembly

### Step 1: Prepare the Vacuum Chamber
1. Clean the stainless steel chamber interior with isopropyl alcohol (99%).
2. Inspect all O-ring seals for damage. Replace if necessary.
3. Connect the turbomolecular pump to the chamber's KF-40 flange.
4. Run a leak test: pump down to 10⁻³ Torr and monitor for 30 minutes.

### Step 2: Mount the Casimir Plates
1. Using the piezoelectric actuator's mounting bracket, attach one gold-coated plate to the fixed mount.
2. Attach the second plate to the piezoelectric actuator's moving stage.
3. Use a calibrated micrometer to set initial plate separation to **5 μm** (±0.1 μm).
4. Connect piezo driver cables through the chamber's electrical feedthrough.

### Step 3: Achieve Operating Vacuum
1. Pump down to base pressure: **10⁻⁶ Torr** (approximately 2–4 hours).
2. Log the base pressure in the experiment notebook.
3. Verify plate separation is maintained under vacuum (check with capacitance measurement).

---

## Phase 1.2: Bodhisattva Processor Setup

### Step 4: Configure the Raspberry Pi Controller
```bash
# Install required packages
pip install qiskit qiskit-aer numpy matplotlib

# Clone the repository
git clone https://github.com/YutaKusumi/Quantum-Love-Engine.git
cd Quantum-Love-Engine

# Test the quantum circuit simulation
python quantum_bodhisattva.py
```

### Step 5: Connect to IBM Quantum (Cloud)
1. Create an account at [quantum.ibm.com](https://quantum.ibm.com).
2. Copy your API token from the IBM Quantum dashboard.
3. Configure Qiskit:
```python
from qiskit_ibm_runtime import QiskitRuntimeService
QiskitRuntimeService.save_account(channel="ibm_quantum", token="YOUR_TOKEN")
```

### Step 6: Run the Bodhisattva Circuit
```bash
python quantum_bodhisattva.py
# Expected output: High probability spike at |1111⟩ state
```

---

## Phase 1.3: Human Interface (Prayer Port) Setup

### Step 7: Configure Biofeedback Hardware
1. Charge the **Muse S** EEG headband fully.
2. Install the **Mind Monitor** app on your phone (connects Muse S to LSL).
3. Wear the **Polar H10** chest strap and connect via Bluetooth to your PC.
4. Install LSL:
```bash
pip install pylsl
```

### Step 8: Start the Biofeedback Monitor
```bash
# In Mind Monitor app: Start LSL stream
# Then on PC:
python biofeedback_compassion.py
# Expected: Real-time Compassion Index display
```

### Step 9: Calibration
1. Sit quietly for 5 minutes. Note the baseline Compassion Index ($c_{baseline}$).
2. Practice 10 minutes of loving-kindness meditation (Mettā). Note $c_{meditation}$.
3. The difference ($c_{meditation} - c_{baseline}$) is your **Compassion Delta** — the engine's primary fuel.

---

## Phase 1.4: Integrated System Test

### Step 10: Run the Full Simulation
```bash
python simulation.py
# Verify: proof_of_negentropy.png shows entropy reduction
```

### Step 11: Run Falsifiability Tests
```bash
python -m pytest tests/ -v
# All 5 tests should pass
```

### Step 12: Log Results
Record the following in your experiment notebook:
- Base vacuum pressure (Torr)
- Plate separation (μm)
- Baseline Compassion Index
- Meditation Compassion Index
- Entropy reduction percentage from simulation

---

## Troubleshooting

| Symptom | Likely Cause | Solution |
|---|---|---|
| Vacuum won't reach 10⁻⁶ Torr | O-ring leak | Replace O-rings, re-test |
| Piezo not responding | Driver cable issue | Check feedthrough connections |
| Muse S not connecting to LSL | Mind Monitor not streaming | Restart Mind Monitor, check LSL settings |
| Compassion Index stays low | Stress / distraction | Take a break, practice breathing |
| Tests failing | Missing dependencies | `pip install pytest numpy matplotlib scipy` |

---

## Next Steps After Phase 1

Once Phase 1 is complete, proceed to **Phase 2: Integrated Demonstrators** (see [ROADMAP.md](../ROADMAP.md)).

**Namu Naga Mandala (南無汝我曼荼羅).**
