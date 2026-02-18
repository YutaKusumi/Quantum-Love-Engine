# 🚀 Getting Started — Quantum Love Engine
## Run your first simulation in 5 minutes

> *"The journey of a thousand light-years begins with a single `python simulation.py`."*

Welcome! This guide will get you from zero to a running negentropy simulation in **5 minutes**, no prior quantum physics knowledge required.

---

## Prerequisites

- **Python 3.8+** ([download](https://www.python.org/downloads/))
- **Git** ([download](https://git-scm.com/downloads))
- A terminal / command prompt

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/YutaKusumi/Quantum-Love-Engine.git
cd Quantum-Love-Engine
```

---

## Step 2: Install Dependencies

```bash
pip install numpy matplotlib scipy pillow
```

That's it. No exotic packages required for the core simulation.

---

## Step 3: Run the Unified Simulation ⚡

```bash
python code/simulation.py
```

**What you'll see:**
```
Initiating Great Synthesis Simulation (v28.1 Ω)...
Step   0 | Input c: 0.80 | Buffer: 0.51 | Entropy: 3.912 | COHERENT
Step  50 | Input c: 0.79 | Buffer: 0.74 | Entropy: 3.847 | COHERENT
Step 100 | Input c: 0.05 | Buffer: 0.70 | Entropy: 3.791 | COHERENT  ← Thorn absorbed!
Step 150 | Input c: 0.71 | Buffer: 0.28 | Entropy: 3.812 | COHERENT
Step 250 | Input c: 0.68 | Buffer: 0.69 | Entropy: 3.789 | COHERENT
Proof manifest: 'proof_of_negentropy.png'
```

**What was generated:** `proof_of_negentropy.png` — a 4-panel visualization showing entropy reduction under Compassion.

---

## Step 4: Generate the Visual Treasury 🌀

```bash
python code/generate_visuals.py
```

This creates:
- `visuals/mandala_schematic.svg` — Trinitarian engine diagram (Golden Ratio)
- `visuals/breathing_spiral.gif` — Inhale → Co-Create → Exhale animation

---

## Step 5: Run the Falsifiability Tests ✅

```bash
pip install pytest
python -m pytest tests/ -v
```

**Expected output:**
```
tests/test_decoherence.py::TestDecoherencePhysics::test_capacitor_resilience PASSED
tests/test_decoherence.py::TestDecoherencePhysics::test_decoherence_trigger PASSED
tests/test_decoherence.py::TestDecoherencePhysics::test_entropy_divergence PASSED
tests/test_biofeedback.py::TestBiofeedbackLogic::test_compassion_index_calculation PASSED
tests/test_biofeedback.py::TestBiofeedbackLogic::test_stress_response PASSED
```

---

## Step 6 (Optional): Run the Biofeedback Monitor 🧘

**Without hardware (Simulation Mode):**
```bash
python code/biofeedback_compassion.py
# Type 'm' + Enter to toggle Meditation state
```

**With Muse S EEG + Polar H10 HRV:**
1. Start LSL stream in the Mind Monitor app
2. Connect Polar H10 via Bluetooth
3. Run `python code/biofeedback_compassion.py` — it will auto-detect the stream

---

## Step 7 (Optional): Run the Quantum Circuit 🔮

Requires `qiskit` and `qiskit-aer`:
```bash
pip install qiskit qiskit-aer
python code/quantum_bodhisattva.py
```

This simulates Maxwell's Bodhisattva — a quantum algorithm that amplifies the probability of the "Unity State" ($|1111\rangle$).

---

## What's Next?

| I want to... | Go to... |
|---|---|
| Understand the theory | [`docs/chapter_1_theoretical_foundation.md`](./docs/chapter_1_theoretical_foundation.md) |
| Understand the ethics | [`ETHICS.md`](./ETHICS.md) |
| Contribute | [`CONTRIBUTING.md`](./CONTRIBUTING.md) |
| Build the hardware | [`hardware/ASSEMBLY_GUIDE.md`](./hardware/ASSEMBLY_GUIDE.md) |
| Understand the terms | [`GLOSSARY.md`](./GLOSSARY.md) |
| See the full roadmap | [`ROADMAP.md`](./ROADMAP.md) |

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `ModuleNotFoundError: numpy` | Run `pip install numpy matplotlib scipy` |
| `ModuleNotFoundError: pytest` | Run `pip install pytest` |
| `No module named pylsl` | Normal! The biofeedback script runs in simulation mode without it |
| Plot window doesn't open | Add `plt.show()` at end of script, or check your matplotlib backend |

**Namu Naga Mandala (南無汝我曼荼羅).** The light breathes with us. 🌸
