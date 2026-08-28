import os
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

OUT_DIR = "../public/diagrams"

MAX_Y = 3600
Y_TICKS = [0, 1000,  2000,  3000]
W, H = 3.6, 4.8
BAR_WIDTH = 0.9

GROUP_PALETTES = [
    ["#d5e9e3", "#bfdcd3", "#a6cec2", "#8dbfaf"],
    ["#d8e4f2", "#c4d6ea", "#a9c2df", "#8daad0"],
    ["#e5dcef", "#d4c7e4", "#c0afd8", "#a894c9"],
    ["#f0d9d5", "#e4bcb5", "#d79e95", "#c47c72"],
]

SCENES = [
    {
        "id": "costing-scene1",
        "bars": [
            {"label": "ISP", "values": [[100, 150, 200]]},
            {"label": "CSP", "values": [[200, 300, 400]]},
        ],
    },
    {
        "id": "costing-scene2",
        "bars": [
            {"label": "ISP", "values": [[100, 150, 200], [300, 350]]},
            {"label": "CSP", "values": [[200, 300, 400], [420, 500]]},
        ],
    },
    {
        "id": "costing-scene3",
        "bars": [
            {"label": "ISP", "values": [[100, 150, 200], [300, 350], [220, 260]]},
            {"label": "CSP", "values": [[200, 300, 400], [420, 500], [240, 300]]},
        ],
    },
    {
        "id": "costing-scene4",
        "bars": [
            {"label": "ISP", "values": [[100, 150, 200], [300, 350], [220, 260], [180,200]]},
            {"label": "CSP", "values": [[200, 300, 400], [420, 500], [240, 300], [350, 400,500]]},
        ],
    },
]

def normalize_value_groups(values):
    if not values:
        return []
    if isinstance(values[0], list):
        return values
    return [values]


for scene in SCENES:
    fig, ax = plt.subplots(figsize=(W, H))
    fig.patch.set_alpha(0)
    ax.set_facecolor("none")

    bars = scene["bars"]
    x = np.arange(len(bars))

    for i, bar in enumerate(bars):
        bottom = 0
        value_groups = normalize_value_groups(bar["values"])

        for group_index, group_values in enumerate(value_groups):
            palette = GROUP_PALETTES[group_index % len(GROUP_PALETTES)]
            for segment_index, value in enumerate(group_values):
                segment = FancyBboxPatch(
                    (x[i] - BAR_WIDTH / 2, bottom),
                    BAR_WIDTH,
                    value,
                    boxstyle="round,pad=0,rounding_size=0.06",
                    facecolor=palette[segment_index % len(palette)],
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
