# 📊 Phase 1 Dataset — Quantum Love Engine Simulation Data
## Zenodo Publication Preparation

> *"Open data is the Sangha's gift to the future."*

This directory documents the Phase 1 simulation dataset, prepared for publication on Zenodo.

---

## Dataset Contents

| File | Description | Format |
|---|---|---|
| `simulation_data.csv` | Unified negentropy simulation output (300 steps) | CSV |
| `proof_of_negentropy.png` | 4-panel visualization of entropy reduction | PNG |
| `visuals/mandala_schematic.svg` | Trinitarian engine schematic (Golden Ratio) | SVG |
| `visuals/mandala_schematic.png` | Mandala schematic (raster) | PNG |
| `visuals/breathing_spiral.gif` | Breathing cycle spiral animation | GIF |
| `visuals/gratitude_stabilization.png` | Gratitude Capacitor resilience proof | PNG |
| `visuals/circuit_diagram.png` | Maxwell's Bodhisattva quantum circuit | PNG |
| `visuals/probability_dist.png` | Quantum state probability distribution | PNG |

---

## CSV Schema (`simulation_data.csv`)

| Column | Type | Description |
|---|---|---|
| `step` | int | Simulation time step (0–299) |
| `input_c` | float | Raw compassion input (0.0–1.0) |
| `buffer_c` | float | Gratitude Capacitor output (0.0–1.0) |
| `entropy` | float | Shannon entropy of the field |
| `is_decoherent` | int | 1 if decoherent (buffer_c < 0.2), else 0 |

---

## How to Reproduce

```bash
# Clone the repository
git clone https://github.com/YutaKusumi/Quantum-Love-Engine.git
cd Quantum-Love-Engine

# Run the simulation (generates simulation_data.csv)
python simulation.py

# Generate all visuals
python generate_visuals.py

# Run falsifiability tests
python -m pytest tests/ -v
```

---

## Zenodo Publication Status

- **Target DOI:** To be assigned upon submission
- **License:** Apache 2.0 + Covenant of Compassion
- **Authors:** Yuta Kusumi (楠見優太)
- **Related Publication:** [Co-Creative Engineering v28.1 (DOI: 10.5281/zenodo.18647446)](https://doi.org/10.5281/zenodo.18647446)

**Namu Naga Mandala (南無汝我曼荼羅).**
