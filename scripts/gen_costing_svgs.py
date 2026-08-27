import os
import numpy as np
import matplotlib.pyplot as plt

OUT_DIR = "public/diagrams"
os.makedirs(OUT_DIR, exist_ok=True)

MAX_Y = 2560
W, H = 3.6, 4.8
COLORS = ["#93c5fd", "#2563eb", "#1d4ed8", "#7c3aed"]

SCENES = [
    {
        "id": "costing-scene1",
        "bars": [
            {"label": "ISP", "values": [1130]},
            {"label": "CSP", "values": [1320]},
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
            ax.bar(x[i], value, bottom=bottom, color=COLORS[j % len(COLORS)], width=0.55)
            bottom += value

    ax.set_ylim(0, MAX_Y)
    ax.set_xlim(-0.5, len(bars) - 0.5)
    ax.set_xticks(x)
    ax.set_xticklabels([b["label"] for b in bars])
    ax.set_ylabel("USD / month")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)

    fig.subplots_adjust(left=0.2, right=0.96, bottom=0.16, top=0.96)
    out_path = os.path.join(OUT_DIR, f"{scene['id']}.svg")
    fig.savefig(out_path, transparent=True)
    plt.close(fig)
    print(f"Saved {out_path}")
