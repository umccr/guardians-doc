import os
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

OUT_DIR = "../public/diagrams"

MAX_Y = 2560
Y_TICKS = [0, 500, 1000, 1500, 2000, 2500]
W, H = 3.6, 4.8
COLORS = ["#93c5fd", "#2563eb", "#1d4ed8", "#7c3aed"]
BAR_WIDTH = 0.9

SCENES = [
    {
        "id": "costing-scene1",
        "bars": [
            {"label": "ISP", "values": [100,150,200]},
            {"label": "CSP", "values": [200,300,400]},
        ],
    },
    {
        "id": "costing-scene2",
        "bars": [
            {"label": "ISP", "values": [1130, 570]},
            {"label": "CSP", "values": [1320, 520]},
        ],
    },
    {
        "id": "costing-scene3",
        "bars": [
            {"label": "ISP", "values": [1130, 570, 480]},
            {"label": "CSP", "values": [1320, 520, 450]},
        ],
    },
    {
        "id": "costing-scene4",
        "bars": [
            {"label": "ISP", "values": [1130, 570, 480, 230]},
            {"label": "CSP", "values": [1320, 520, 450, 270]},
        ],
    },
]

for scene in SCENES:
    fig, ax = plt.subplots(figsize=(W, H))
    fig.patch.set_alpha(0)
    ax.set_facecolor("none")

    bars = scene["bars"]
    x = np.arange(len(bars))

    for i, bar in enumerate(bars):
        bottom = 0
        for j, value in enumerate(bar["values"]):
            segment = FancyBboxPatch(
                (x[i] - BAR_WIDTH / 2, bottom),
                BAR_WIDTH,
                value,
                boxstyle="round,pad=0,rounding_size=0.06",
                facecolor=COLORS[j % len(COLORS)],
                edgecolor="#f8fafc",
                linewidth=2,
                mutation_scale=8,
            )
            ax.add_patch(segment)
            bottom += value

    ax.set_ylim(0, MAX_Y)
    ax.set_xlim(-0.5, len(bars) - 0.5)
    ax.set_yticks(Y_TICKS)
    ax.set_xticks(x)
    ax.set_xticklabels([b["label"] for b in bars])
    ax.tick_params(axis="x", length=0)
    ax.tick_params(axis="y", left=True, labelleft=True)
    ax.set_ylabel("USD / month")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["bottom"].set_visible(False)
    ax.spines["left"].set_visible(False)

    fig.subplots_adjust(left=0.2, right=0.96, bottom=0.16, top=0.96)
    out_path = os.path.join(OUT_DIR, f"{scene['id']}.svg")
    fig.savefig(out_path, transparent=True)
    plt.close(fig)
    print(f"Saved {out_path}")
