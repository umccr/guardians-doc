import os
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

# Get the script directory and build the output path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(SCRIPT_DIR, "..", "public", "diagrams")

MAX_Y = 5000
Y_TICKS = [0, 1000,  2000,  3000, 4000, 5000]
W, H = 3.8, 5.0
BAR_WIDTH = 0.9
X_PAD = 0.02

SCENE_BLUES = ["#dbeafe", "#93c5fd", "#3b82f6", "#1e40af"]

SCENES = [
    {
        "id": "standing-costs",
        "bars": [
            {"label": "ISP", "values": [[150, 75, 75, 150, 350]]},
            {"label": "CSP", "values": [[750, 150, 350, 750, 1000]]},
        ],
    },
    {
        "id": "storage-costs",
        "bars": [
            {"label": "ISP", "values": [[150, 75, 75, 150, 350],[200, 100, 35, 35, 25]]},
            {"label": "CSP", "values": [[750, 150, 350, 750, 1000],[400, 200, 75, 100, 200]]},
        ],
    },
    {
        "id": "data-movement-egress",
        "bars": [
            {"label": "ISP", "values": [[150, 75, 75, 150, 350], [200, 100, 35, 35, 25], [100, 10, 25, 25]]},
            {"label": "CSP", "values": [[750, 150, 350, 750, 1000], [400, 200, 75, 100, 200], [225, 35, 100, 200]]},
        ],
    },
    {
        "id": "data-lifecycle",
        "bars": [
            {"label": "ISP", "values": [[150, 75, 75, 150, 350], [200, 100, 35, 35, 25], [100, 10, 25, 25], [200, 100, 35, 35]]},
            {"label": "CSP", "values": [[750, 150, 350, 750, 1000], [400, 200, 75, 100, 200], [225, 35, 100, 200], [350, 200, 75, 100]]},
        ],
    },
]

def normalize_value_groups(values):
    if not values:
        return []
    if isinstance(values[0], list):
        return values
    return [values]


def to_segment_thicknesses(values):
    """Return actual segment costs as-is."""
    return values


for scene_index, scene in enumerate(SCENES):
    fig, ax = plt.subplots(figsize=(W, H))
    fig.patch.set_alpha(0)
    ax.set_facecolor("none")

    bars = scene["bars"]
    x = np.arange(len(bars))

    for i, bar in enumerate(bars):
        bottom = 0
        value_groups = normalize_value_groups(bar["values"])

        for group_index, group_values in enumerate(value_groups):
            group_color = SCENE_BLUES[group_index % len(SCENE_BLUES)]
            segment_values = to_segment_thicknesses(group_values)
            for value in segment_values:
                segment = FancyBboxPatch(
                    (x[i] - BAR_WIDTH / 2, bottom),
                    BAR_WIDTH,
                    value,
                    boxstyle="round,pad=0,rounding_size=0.06",
                    facecolor=group_color,
                    edgecolor="#f8fafc",
                    linewidth=2,
                    mutation_scale=8,
                )
                ax.add_patch(segment)
                bottom += value

    ax.set_ylim(0, MAX_Y)
    ax.set_xlim(-0.5 + X_PAD, len(bars) - 0.5 - X_PAD)
    ax.set_yticks(Y_TICKS)
    ax.set_xticks(x)
    ax.set_xticklabels([b["label"] for b in bars])
    ax.tick_params(axis="x", length=0)
    ax.yaxis.tick_right()
    ax.yaxis.set_label_position("right")
    ax.tick_params(axis="y", left=False, labelleft=False, right=True, labelright=True, pad=2)
    ax.set_ylabel("USD / month", labelpad=6)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["bottom"].set_visible(False)
    ax.spines["left"].set_visible(False)

    fig.subplots_adjust(left=0.03, right=0.78, bottom=0.08, top=0.99)
    out_path = os.path.join(OUT_DIR, f"{scene['id']}.svg")
    fig.savefig(out_path, transparent=True, bbox_inches="tight", pad_inches=0.02)
    plt.close(fig)
    print(f"Saved {out_path}")
