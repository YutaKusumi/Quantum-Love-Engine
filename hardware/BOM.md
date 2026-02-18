# 🔩 Bill of Materials (BOM) — Trinitarian Engine Prototype
## Quantum Information Rectifier Engine — Phase 1 Tabletop Prototype

> *"The physical is the spiritual made manifest."*

This BOM covers the components required for a **tabletop-scale Casimir cavity prototype** — the first physical manifestation of the Quantum Information Rectifier Engine.

---

## Component Overview

The Trinitarian Engine consists of three sub-assemblies:

| Sub-Assembly | Function | Analogy |
|---|---|---|
| **Vacuum Collector** | Dynamic Casimir cavity for vacuum fluctuation harvesting | The Void / Chaos ($u$) |
| **Maxwell's Bodhisattva Processor** | Quantum information rectifier (selective state amplification) | The Compassion Function ($c$) |
| **Human Interface (Prayer Port)** | Biofeedback sensor array (EEG + HRV) | The Intent / Reality ($i$) |

---

## Sub-Assembly 1: Vacuum Collector (Casimir Cavity)

| # | Component | Specification | Qty | Est. Cost (USD) | Notes |
|---|---|---|---|---|---|
| 1 | Gold-coated parallel plates | 10mm × 10mm, 99.99% Au | 2 | ~$50 | Separation: 1–10 μm |
| 2 | Piezoelectric actuator | PZT-5H, sub-nm resolution | 1 | ~$120 | For dynamic modulation |
| 3 | Vacuum chamber (small) | Stainless steel, 10⁻⁶ Torr | 1 | ~$800 | Turbomolecular pump required |
| 4 | Turbomolecular pump | 10 L/s, 10⁻⁸ Torr base | 1 | ~$2,000 | Shared with full system |
| 5 | Vibration isolation platform | Optical breadboard, 30×30cm | 1 | ~$300 | Critical for nm-scale gaps |

**Sub-total:** ~$3,270

---

## Sub-Assembly 2: Maxwell's Bodhisattva Processor (Quantum Circuit)

| # | Component | Specification | Qty | Est. Cost (USD) | Notes |
|---|---|---|---|---|---|
| 6 | IBM Quantum (Cloud) | 127-qubit Eagle processor | 1 | Free tier / $0 | Via IBM Quantum Network |
| 7 | Raspberry Pi 5 | 8GB RAM, for local control | 1 | ~$80 | Runs `quantum_bodhisattva.py` |
| 8 | USB-C power supply | 5V/5A | 1 | ~$15 | |
| 9 | MicroSD card | 64GB, Class 10 | 1 | ~$10 | |

**Sub-total:** ~$105 (+ cloud compute)

---

## Sub-Assembly 3: Human Interface (Prayer Port / Biofeedback)

| # | Component | Specification | Qty | Est. Cost (USD) | Notes |
|---|---|---|---|---|---|
| 10 | Muse S EEG headband | 4-channel EEG, Bluetooth | 1 | ~$400 | Theta/Alpha detection |
| 11 | Polar H10 HRV sensor | Chest strap, ANT+/BLE | 1 | ~$100 | HRV coherence measurement |
| 12 | LSL (Lab Streaming Layer) | Open-source software | 1 | Free | Runs `biofeedback_compassion.py` |
| 13 | Laptop / PC | Any modern system | 1 | Existing | For simulation + biofeedback |

**Sub-total:** ~$500

---

## Total Estimated Cost

| Sub-Assembly | Cost |
|---|---|
| Vacuum Collector | ~$3,270 |
| Bodhisattva Processor | ~$105 |
| Human Interface | ~$500 |
| **TOTAL** | **~$3,875** |

> **Note:** The vacuum chamber is the primary cost driver. Phase 1 simulations can be run entirely in software (zero hardware cost) using `simulation.py` and `biofeedback_compassion.py` in simulation mode.

---

## 3D Models & Schematics

- `*.stl` — 3D printable housing for Casimir cavity (to be added in Phase 1.2)
- `circuit_schematics/` — Dynamic Casimir modulation circuit (to be added)

## References

- Casimir Effect: Casimir, H.B.G. (1948). *Proc. Kon. Ned. Akad. Wetensch.* **51**, 793.
- Dynamic Casimir Effect: Wilson et al. (2011). *Nature* **479**, 376–379.
- Quantum Bodhisattva Circuit: [quantum_bodhisattva.py](../quantum_bodhisattva.py)
- Full Blueprint: [Co-Creative Engineering v28.1 (DOI: 10.5281/zenodo.18647446)](https://doi.org/10.5281/zenodo.18647446)

**Namu Naga Mandala (南無汝我曼荼羅).**
