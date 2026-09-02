import os
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

# Get the script directory and build the output path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(SCRIPT_DIR, "..", "public", "diagrams")

W, H = 3.8, 5.0
BAR_WIDTH = 0.9
X_PAD = 0.02
LIFECYCLE_W, LIFECYCLE_H = 6.0, 4.2

SCENE_BLUES = ["#bfdbfe", "#3b82f6", "#1e3a8a"]

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
]

LIFECYCLE_COMPONENTS = [
    ("Standing", "#bfdbfe"),
    ("Storage", "#3b82f6"),
    ("Movement", "#1e3a8a"),
]

LIFECYCLE_SCENARIOS = [
    {
        "id": "lifecycle-keep-everything",
        "title": "Full retention",
        "series": {
            "ISP": {
                "Standing": [700, 700, 700, 700, 700, 700, 700],
                "Storage": [300, 450, 600, 760, 940, 1120, 1300],
                "Movement": [50, 50, 50, 50, 50, 50, 50],
            },
            "CSP": {
                "Standing": [3200, 3200, 3200, 3200, 3200, 3200, 3200],
                "Storage": [1200, 1650, 2100, 2450, 2850, 3250, 3600],
                "Movement": [200, 220, 250, 260, 270, 290, 300],
            },
        },
    },
    {
        "id": "lifecycle-balanced-strategy",
        "title": "Balanced retention",
        "series": {
            "ISP": {
                "Standing": [700, 700, 700, 700, 700, 700, 700],
                "Storage": [250, 350, 420, 500, 550, 590, 620],
                "Movement": [50, 55, 60, 60, 60, 60, 60],
            },
            "CSP": {
                "Standing": [3200, 3200, 3200, 3200, 3200, 3200, 3200],
                "Storage": [1050, 1300, 1450, 1650, 1800, 1900, 2000],
                "Movement": [200, 230, 250, 260, 270, 290, 300],
            },
        },
    },
    {
        "id": "lifecycle-aggressive-deleting",
        "title": "Lean retention",
        "series": {
            "ISP": {
                "Standing": [700, 700, 700, 700, 700, 700, 700],
                "Storage": [230, 260, 280, 290, 295, 292, 290],
                "Movement": [50, 55, 60, 60, 60, 60, 60],
            },
            "CSP": {
                "Standing": [3200, 3200, 3200, 3200, 3200, 3200, 3200],
                "Storage": [900, 980, 1050, 1120, 1150, 1170, 1180],
                "Movement": [200, 220, 250, 260, 270, 285, 300],
            },
        },
    },
]

LIFECYCLE_SCENARIO_LINE_COLORS = {
    "lifecycle-keep-everything": "#1e3a8a",
    "lifecycle-balanced-strategy": "#3b82f6",
    "lifecycle-aggressive-deleting": "#bfdbfe",
}

def normalize_value_groups(values):
    if not values:
        return []
    if isinstance(values[0], list):
        return values
    return [values]


def to_segment_thicknesses(values):
    """Return actual segment costs as-is."""
    return values


def format_total(value):
    if value >= 1000:
        return f"${value / 1000:.1f}k"
    return f"${value:.0f}"


def total_for_bar(bar):
    value_groups = normalize_value_groups(bar["values"])
    return sum(sum(group_values) for group_values in value_groups)


GLOBAL_MAX = max(total_for_bar(bar) for scene in SCENES for bar in scene["bars"])
GLOBAL_Y_TOP = GLOBAL_MAX * 1


def render_cost_dimension_bars():
    for scene in SCENES:
        fig, ax = plt.subplots(figsize=(W, H))
        fig.patch.set_alpha(0)
        ax.set_facecolor("none")

        bars = scene["bars"]
        x = np.arange(len(bars))
        bar_totals = []

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

            bar_totals.append(bottom)

        y_top = GLOBAL_Y_TOP
        ax.set_ylim(0, y_top)
        ax.set_xlim(-0.5 + X_PAD, len(bars) - 0.5 - X_PAD)
        ax.set_yticks([])
        ax.set_yticklabels([])
        ax.yaxis.set_label_position("right")
        ax.set_ylabel("USD / month", labelpad=8, fontsize=10, color="#334155")
        ax.set_xlabel("")
        ax.set_xticks(x)
        ax.set_xticklabels([b["label"] for b in bars])
        ax.tick_params(axis="x", length=0)
        ax.tick_params(axis="y", left=False, labelleft=False, right=False, labelright=False)

        label_offset = y_top * 0.006
        for i, total in enumerate(bar_totals):
            ax.text(
                x[i],
                total + label_offset,
                format_total(total),
                ha="center",
                va="bottom",
                fontsize=11.5,
                fontweight="bold",
                fontfamily="DejaVu Sans",
                color="#0f172a",
            )

        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
        ax.spines["bottom"].set_visible(False)
        ax.spines["left"].set_visible(False)

        fig.subplots_adjust(left=0.03, right=0.97, bottom=0.05, top=0.998)
        out_path = os.path.join(OUT_DIR, f"{scene['id']}.svg")
        fig.savefig(out_path, transparent=True, bbox_inches="tight", pad_inches=0.005)
        plt.close(fig)
        print(f"Saved {out_path}")


def scenario_platform_totals(scenario):
    totals = {}
    for platform_name, platform_series in scenario["series"].items():
        component_arrays = [platform_series[component_name] for component_name, _ in LIFECYCLE_COMPONENTS]
        totals[platform_name] = [sum(values) for values in zip(*component_arrays)]
    return totals


def render_lifecycle_progression_charts():
    years = np.arange(1, 8)

    all_totals = []
    for scenario in LIFECYCLE_SCENARIOS:
        platform_totals = scenario_platform_totals(scenario)
        for total_series in platform_totals.values():
            all_totals.extend(total_series)
    y_top = max(all_totals) * 1.02

    for scenario_index, scenario in enumerate(LIFECYCLE_SCENARIOS):
        x_positions = np.arange(len(years))
        bar_width = 0.32
        platform_order = ["ISP", "CSP"]
        offsets = {"ISP": -bar_width / 2, "CSP": bar_width / 2}
        def draw_base_chart(total_line_indices=None, include_bars=True):
            if total_line_indices is None:
                total_line_indices = []
            fig, ax = plt.subplots(figsize=(LIFECYCLE_W, LIFECYCLE_H))
            fig.patch.set_alpha(0)
            ax.set_facecolor("none")

            if include_bars:
                for platform_name in platform_order:
                    platform_series = scenario["series"][platform_name]
                    bottom = np.zeros(len(years))

                    for component_name, color in LIFECYCLE_COMPONENTS:
                        values = np.array(platform_series[component_name])
                        ax.bar(
                            x_positions + offsets[platform_name],
                            values,
                            width=bar_width,
                            bottom=bottom,
                            color=color,
                            edgecolor="#f8fafc",
                            linewidth=1.2,
                        )
                        bottom += values

            if total_line_indices:
                for compared_index in total_line_indices:
                    compared_scenario = LIFECYCLE_SCENARIOS[compared_index]
                    compared_totals = scenario_platform_totals(compared_scenario)

                    is_current = compared_index == scenario_index
                    age = scenario_index - compared_index
                    alpha = 0.95 if is_current else max(0.35, 0.7 - age * 0.15)
                    linewidth = 1.9 if is_current else 1.5

                    ax.plot(
                        x_positions + offsets["ISP"],
                        compared_totals["ISP"],
                        color="#1d4ed8",
                        linewidth=linewidth,
                        alpha=alpha,
                    )
                    ax.plot(
                        x_positions + offsets["CSP"],
                        compared_totals["CSP"],
                        color="#1e3a8a",
                        linewidth=linewidth,
                        alpha=alpha,
                    )

            ax.set_ylim(0, y_top)
            ax.set_xlim(-0.8, len(years) - 0.2)
            ax.set_xticks(x_positions)
            ax.set_xticklabels([f"Y{year}" for year in years], fontsize=9)
            ax.set_yticks([])
            ax.set_yticklabels([])
            ax.tick_params(axis="x", length=0)
            ax.tick_params(axis="y", left=False, labelleft=False, right=False, labelright=False)

            # ax.text(
            #     0.02,
            #     0.98,
            #     "ISP",
            #     transform=ax.transAxes,
            #     ha="left",
            #     va="top",
            #     fontsize=9,
            #     fontweight="bold",
            #     color="#1d4ed8",
            # )
            # ax.text(
            #     0.98,
            #     0.98,
            #     "CSP",
            #     transform=ax.transAxes,
            #     ha="right",
            #     va="top",
            #     fontsize=9,
            #     fontweight="bold",
            #     color="#1e3a8a",
            # )

            ax.spines["top"].set_visible(False)
            ax.spines["right"].set_visible(False)
            ax.spines["bottom"].set_visible(False)
            ax.spines["left"].set_visible(False)

            fig.subplots_adjust(left=0.03, right=0.97, bottom=0.09, top=0.97)
            return fig

        bars_only_fig = draw_base_chart(total_line_indices=list(range(scenario_index)))
        bars_only_path = os.path.join(OUT_DIR, f"{scenario['id']}-bars.svg")
        bars_only_fig.savefig(bars_only_path, transparent=True, bbox_inches="tight", pad_inches=0.005)
        plt.close(bars_only_fig)
        print(f"Saved {bars_only_path}")

        with_total_fig = draw_base_chart(total_line_indices=list(range(scenario_index + 1)))
        with_total_path = os.path.join(OUT_DIR, f"{scenario['id']}.svg")
        with_total_fig.savefig(with_total_path, transparent=True, bbox_inches="tight", pad_inches=0.005)
        plt.close(with_total_fig)
        print(f"Saved {with_total_path}")

        totals_only_fig = draw_base_chart(total_line_indices=list(range(scenario_index + 1)), include_bars=False)
        totals_only_path = os.path.join(OUT_DIR, f"{scenario['id']}-totals.svg")
        totals_only_fig.savefig(totals_only_path, transparent=True, bbox_inches="tight", pad_inches=0.005)
        plt.close(totals_only_fig)
        print(f"Saved {totals_only_path}")

    fig, ax = plt.subplots(figsize=(LIFECYCLE_W, LIFECYCLE_H))
    fig.patch.set_alpha(0)
    ax.set_facecolor("none")

    x_positions = np.arange(len(years))

    for scenario in LIFECYCLE_SCENARIOS:
        totals = scenario_platform_totals(scenario)
        line_color = LIFECYCLE_SCENARIO_LINE_COLORS[scenario["id"]]

        ax.plot(
            x_positions,
            totals["ISP"],
            color=line_color,
            linewidth=2.2,
            alpha=0.98,
        )
        ax.plot(
            x_positions,
            totals["CSP"],
            color=line_color,
            linewidth=2.2,
            alpha=0.98,
            linestyle="--",
        )

    ax.set_ylim(0, y_top)
    ax.set_xlim(-0.8, len(years) - 0.2)
    ax.set_xticks(x_positions)
    ax.set_xticklabels([f"Y{year}" for year in years], fontsize=9)
    ax.set_yticks([])
    ax.set_yticklabels([])
    ax.tick_params(axis="x", length=0)
    ax.tick_params(axis="y", left=False, labelleft=False, right=False, labelright=False)

    ax.text(
        0.02,
        0.98,
        "Solid = ISP · Dashed = CSP",
        transform=ax.transAxes,
        ha="left",
        va="top",
        fontsize=8.6,
        fontweight="bold",
        color="#1e293b",
    )

    ax.text(
        0.02,
        0.91,
        "Full retention",
        transform=ax.transAxes,
        ha="left",
        va="top",
        fontsize=8.5,
        color=LIFECYCLE_SCENARIO_LINE_COLORS["lifecycle-keep-everything"],
    )
    ax.text(
        0.02,
        0.85,
        "Balanced retention",
        transform=ax.transAxes,
        ha="left",
        va="top",
        fontsize=8.5,
        color=LIFECYCLE_SCENARIO_LINE_COLORS["lifecycle-balanced-strategy"],
    )
    ax.text(
        0.02,
        0.79,
        "Lean retention",
        transform=ax.transAxes,
        ha="left",
        va="top",
        fontsize=8.5,
        color="#64748b",
    )

    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["bottom"].set_visible(False)
    ax.spines["left"].set_visible(False)

    fig.subplots_adjust(left=0.03, right=0.97, bottom=0.09, top=0.97)
    out_path = os.path.join(OUT_DIR, "lifecycle-scenario-comparison.svg")
    fig.savefig(out_path, transparent=True, bbox_inches="tight", pad_inches=0.005)
    plt.close(fig)
    print(f"Saved {out_path}")


render_cost_dimension_bars()
render_lifecycle_progression_charts()
