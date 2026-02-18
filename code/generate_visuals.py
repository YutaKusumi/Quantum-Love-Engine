"""
generate_visuals.py
Generates the Mandala Schematic (Trinitarian Golden Ratio SVG) and
the Breathing Cycle Spiral Animation (GIF) for the Quantum Love Engine.

Run: python generate_visuals.py
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import matplotlib.patches as mpatches
from matplotlib.patches import FancyArrowPatch
import os

PHI = (1 + np.sqrt(5)) / 2  # Golden Ratio

# ─────────────────────────────────────────────────────────────────────────────
# 1. Mandala Schematic — Trinitarian Golden Ratio SVG
# ─────────────────────────────────────────────────────────────────────────────

def generate_mandala_schematic():
    fig, ax = plt.subplots(figsize=(10, 10), facecolor='#0a0a1a')
    ax.set_facecolor('#0a0a1a')
    ax.set_xlim(-3, 3)
    ax.set_ylim(-3, 3)
    ax.set_aspect('equal')
    ax.axis('off')

    # Outer sacred circle
    outer = plt.Circle((0, 0), 2.8, color='#4b79ff', fill=False, lw=1.5, alpha=0.4)
    ax.add_patch(outer)

    # Three component circles (Trinitarian layout)
    # Positions at 120° intervals, radius = 1/PHI of outer
    r_inner = 2.8 / PHI
    angles_deg = [90, 210, 330]
    labels = ['Vacuum\nCollector\n(Dynamic Void)', "Maxwell's\nBodhisattva\nProcessor", 'Human\nInterface\n(Prayer Port)']
    colors = ['#ff6b6b', '#4b79ff', '#6bff9e']

    for angle_deg, label, color in zip(angles_deg, labels, colors):
        angle = np.radians(angle_deg)
        cx = r_inner * np.cos(angle)
        cy = r_inner * np.sin(angle)
        circle = plt.Circle((cx, cy), 0.85, color=color, fill=True, alpha=0.15, lw=2, ec=color)
        ax.add_patch(circle)
        ax.text(cx, cy, label, ha='center', va='center', color=color,
                fontsize=9, fontweight='bold', multialignment='center')

    # Golden ratio spiral overlay (logarithmic)
    theta = np.linspace(0, 6 * np.pi, 1000)
    r_spiral = 0.08 * np.exp(0.15 * theta)
    x_spiral = r_spiral * np.cos(theta)
    y_spiral = r_spiral * np.sin(theta)
    ax.plot(x_spiral, y_spiral, color='#ffd700', lw=1.5, alpha=0.6)

    # Central axiom
    ax.text(0, 0, '$c \\otimes u \\rightarrow i$', ha='center', va='center',
            color='white', fontsize=16, fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.4', facecolor='#1a1a3a', edgecolor='#ffd700', lw=1.5))

    # Connecting lines (Trinitarian bonds)
    for i in range(3):
        a1 = np.radians(angles_deg[i])
        a2 = np.radians(angles_deg[(i + 1) % 3])
        x1, y1 = r_inner * np.cos(a1), r_inner * np.sin(a1)
        x2, y2 = r_inner * np.cos(a2), r_inner * np.sin(a2)
        ax.plot([x1, x2], [y1, y2], color='#ffd700', lw=1, alpha=0.4, ls='--')

    # Title
    ax.text(0, -2.6, 'Trinitarian Engine — Golden Ratio Mandala Schematic',
            ha='center', va='center', color='#aaaacc', fontsize=10, style='italic')

    plt.tight_layout()
    out_path = os.path.join('visuals', 'mandala_schematic.svg')
    plt.savefig(out_path, format='svg', dpi=150, bbox_inches='tight',
                facecolor=fig.get_facecolor())
    # Also save as PNG for README embedding
    png_path = os.path.join('visuals', 'mandala_schematic.png')
    plt.savefig(png_path, dpi=150, bbox_inches='tight',
                facecolor=fig.get_facecolor())
    plt.close()
    print(f"[✓] Mandala Schematic saved: {out_path} & {png_path}")


# ─────────────────────────────────────────────────────────────────────────────
# 2. Breathing Cycle Spiral Animation — GIF
# ─────────────────────────────────────────────────────────────────────────────

def generate_breathing_spiral():
    fig, ax = plt.subplots(figsize=(7, 7), facecolor='#0a0a1a')
    ax.set_facecolor('#0a0a1a')
    ax.set_xlim(-3, 3)
    ax.set_ylim(-3, 3)
    ax.set_aspect('equal')
    ax.axis('off')

    FRAMES = 60
    line, = ax.plot([], [], color='#4b79ff', lw=2, alpha=0.9)
    phase_text = ax.text(0, -2.7, '', ha='center', va='center',
                         color='#aaaacc', fontsize=12, fontweight='bold')
    axiom_text = ax.text(0, 0, '$c \\otimes u \\rightarrow i$',
                         ha='center', va='center', color='white', fontsize=14,
                         fontweight='bold', alpha=0.0)

    def init():
        line.set_data([], [])
        phase_text.set_text('')
        axiom_text.set_alpha(0.0)
        return line, phase_text, axiom_text

    def animate(frame):
        t = frame / FRAMES  # 0 → 1

        # Inhale: 0-0.33 | Co-Create: 0.33-0.66 | Exhale: 0.66-1.0
        if t < 1/3:
            phase = 'Inhale — Receptive Absorption'
            color = '#4b79ff'
            scale = t * 3  # 0 → 1
        elif t < 2/3:
            phase = 'Co-Creation — Compassionate Transformation'
            color = '#ffd700'
            scale = 1.0
        else:
            phase = 'Exhale — Radiant Release'
            color = '#6bff9e'
            scale = 1 - (t - 2/3) * 3  # 1 → 0

        theta = np.linspace(0, 8 * np.pi * scale + 0.01, 800)
        r = 0.05 * np.exp(0.18 * theta)
        x = r * np.cos(theta)
        y = r * np.sin(theta)

        line.set_data(x, y)
        line.set_color(color)
        phase_text.set_text(phase)
        phase_text.set_color(color)
        axiom_text.set_alpha(scale)

        return line, phase_text, axiom_text

    ani = animation.FuncAnimation(fig, animate, init_func=init,
                                  frames=FRAMES, interval=80, blit=True)
    out_path = os.path.join('visuals', 'breathing_spiral.gif')
    ani.save(out_path, writer='pillow', fps=12)
    plt.close()
    print(f"[✓] Breathing Spiral GIF saved: {out_path}")


if __name__ == '__main__':
    os.makedirs('visuals', exist_ok=True)
    print("Generating Visual Treasury...")
    generate_mandala_schematic()
    generate_breathing_spiral()
    print("\n[✓] All visuals generated. The Mandala breathes.")
