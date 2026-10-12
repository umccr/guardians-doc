"""Calculate standing, storage, data-movement, and lifecycle estimates.

Rates are AWS public list prices for us-east-1 (US East, N. Virginia),
checked on 2026-10-12. Free-tier credits, discounts, taxes, and data-transfer
charges outside the stated assumptions are excluded.
"""

import csv
from decimal import Decimal
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_CSV = SCRIPT_DIR / "cost_table.csv"

PRICE_REGION = "us-east-1"
PRICING_AS_OF = "2026-10-12"
HOURS_PER_MONTH = Decimal("730")
DAYS_PER_MONTH = Decimal("30")

# AWS public prices. Rates are grouped by the service's official pricing page.
# VPC/NAT Gateway: https://aws.amazon.com/vpc/pricing/
# PrivateLink: https://aws.amazon.com/privatelink/pricing/
# API Gateway: https://aws.amazon.com/api-gateway/pricing/
# S3: https://aws.amazon.com/s3/pricing/
# DynamoDB: https://aws.amazon.com/dynamodb/pricing/
# CloudTrail: https://aws.amazon.com/cloudtrail/pricing/
# KMS: https://aws.amazon.com/kms/pricing/
# CloudWatch: https://aws.amazon.com/cloudwatch/pricing/
# EC2: https://aws.amazon.com/ec2/pricing/on-demand/
# Lambda: https://aws.amazon.com/lambda/pricing/
AWS_PRICES = {
    "nat_gateway_per_hour": Decimal("0.045"),
    "nat_gateway_per_gb": Decimal("0.045"),
    "interface_endpoint_per_az_hour": Decimal("0.01"),
    "interface_endpoint_per_gb": Decimal("0.01"),
    "http_api_per_million_requests": Decimal("1.00"),
    "s3_standard_per_gb_month": Decimal("0.023"),
    "s3_glacier_deep_archive_per_gb_month": Decimal("0.00099"),
    "s3_get_per_1000_requests": Decimal("0.0004"),
    "s3_put_per_1000_requests": Decimal("0.005"),
    "step_functions_standard_per_1000_transitions": Decimal("0.025"),
    "cross_region_transfer_per_gb": Decimal("0.02"),
    "internet_data_transfer_out_per_gb": Decimal("0.09"),
    "dynamodb_read_per_million_units": Decimal("0.125"),
    "dynamodb_write_per_million_units": Decimal("0.625"),
    "dynamodb_storage_per_gb_month": Decimal("0.25"),
    "cloudtrail_data_events_per_100000": Decimal("0.10"),
    "kms_customer_managed_key_per_month": Decimal("1.00"),
    "kms_per_10000_requests": Decimal("0.03"),
    "cloudwatch_custom_metric_per_month": Decimal("0.30"),
    "cloudwatch_dashboard_per_month": Decimal("3.00"),
    "cloudwatch_standard_alarm_per_month": Decimal("0.10"),
    "cloudwatch_logs_ingestion_per_gb": Decimal("0.50"),
    "cloudwatch_logs_storage_per_gb_month": Decimal("0.03"),
    "ec2_t3_small_linux_per_hour": Decimal("0.0208"),
    "ec2_t3_medium_linux_per_hour": Decimal("0.0416"),
    "lambda_per_million_requests": Decimal("0.20"),
    "lambda_per_gb_second": Decimal("0.0000166667"),
}

# Explicit usage assumptions for each scenario. Interface endpoints are modeled
# in one Availability Zone each; their data volume is totalled across endpoints.
# CloudWatch log storage is estimated at steady state over the stated retention.
# Requests and compute use gross list rates, without free-tier deductions.
SCENARIOS = {
    "Internal Sharing Platform (ISP)": {
        "nat_gateways": 1,
        "nat_gb_per_gateway": Decimal("100"),
        "interface_endpoints": 3,
        "interface_endpoint_azs": 1,
        "interface_endpoint_gb_total": Decimal("100"),
        "http_apis": 1,
        "http_api_requests_each": Decimal("100000"),
        "s3_buckets": 2,
        "s3_storage_gb": Decimal("100"),
        "s3_get_requests": Decimal("100000"),
        "s3_put_requests": Decimal("10000"),
        "dynamodb_tables": 1,
        "dynamodb_read_units_per_table": Decimal("100000"),
        "dynamodb_write_units_per_table": Decimal("10000"),
        "cloudtrail_data_events": Decimal("0"),
        "kms_keys": 2,
        "kms_requests": Decimal("100000"),
        "cloudwatch_custom_metrics": 20,
        "cloudwatch_dashboards": 1,
        "cloudwatch_standard_alarms": 10,
        "cloudwatch_log_ingestion_gb_month": Decimal("20"),
        "cloudwatch_log_retention_days": Decimal("30"),
        "ec2_instance_type": "t3_small",
        "ec2_instances": 2,
        "lambda_invocations": Decimal("100000"),
        "lambda_memory_gb": Decimal("0.256"),
        "lambda_duration_seconds": Decimal("0.1"),
    },
    "Cross‑Organisation Sharing Platform (CSP)": {
        "nat_gateways": 2,
        "nat_gb_per_gateway": Decimal("500"),
        "interface_endpoints": 6,
        "interface_endpoint_azs": 1,
        "interface_endpoint_gb_total": Decimal("500"),
        "http_apis": 2,
        "http_api_requests_each": Decimal("500000"),
        "s3_buckets": 4,
        "s3_storage_gb": Decimal("200"),
        "s3_get_requests": Decimal("500000"),
        "s3_put_requests": Decimal("50000"),
        "dynamodb_tables": 2,
        "dynamodb_read_units_per_table": Decimal("250000"),
        "dynamodb_write_units_per_table": Decimal("25000"),
        "cloudtrail_data_events": Decimal("1000000"),
        "kms_keys": 6,
        "kms_requests": Decimal("500000"),
        "cloudwatch_custom_metrics": 100,
        "cloudwatch_dashboards": 5,
        "cloudwatch_standard_alarms": 50,
        "cloudwatch_log_ingestion_gb_month": Decimal("100"),
        "cloudwatch_log_retention_days": Decimal("365"),
        "ec2_instance_type": "t3_medium",
        "ec2_instances": 4,
        "lambda_invocations": Decimal("1000000"),
        "lambda_memory_gb": Decimal("0.512"),
        "lambda_duration_seconds": Decimal("0.2"),
    },
}

# Storage assumptions from storage.mdx. Storage prices are modeled in us-east-1;
# the CSP's additional replica is in us-west-2, using that region's S3 Standard rate.
# Archived data is assumed to remain in Deep Archive for at least its 180-day
# minimum duration. S3 request, retrieval, transition, and per-object archive
# metadata charges are excluded because the assumptions do not specify them.
# DynamoDB storage uses decimal units (1 KB = 1,000 bytes); free storage is excluded.
STORAGE_SCENARIOS = {
    "Internal Sharing Platform (ISP)": {
        "active_projects": 50,
        "active_output_gb_per_project": Decimal("150"),
        "archived_projects": 100,
        "archived_output_gb_per_project": Decimal("200"),
        "catalogue_tables": 1,
        "catalogue_records_per_table": 5000,
        "catalogue_record_kb": Decimal("4"),
        "catalogue_reads_per_table": Decimal("100000"),
        "catalogue_writes_per_table": Decimal("10000"),
        "replica_copies": 0,
    },
    "Cross‑Organisation Sharing Platform (CSP)": {
        "active_projects": 100,
        "active_output_gb_per_project": Decimal("150"),
        "archived_projects": 200,
        "archived_output_gb_per_project": Decimal("200"),
        "catalogue_tables": 2,
        "catalogue_records_per_table": 10000,
        "catalogue_record_kb": Decimal("4"),
        "catalogue_reads_per_table": Decimal("250000"),
        "catalogue_writes_per_table": Decimal("25000"),
        "replica_copies": 1,
    },
}

# Monthly data-movement usage from data-movement-egress.mdx. Costs use gross
# list prices before free-tier allowances or credits. External volumes are
# modeled at the standard internet data-transfer-out rate; Direct Connect,
# VPN, and provider-specific transfer rates are not separately modeled.
MOVEMENT_SCENARIOS = {
    "Internal Sharing Platform (ISP)": {
        "step_functions_executions": Decimal("100"),
        "step_functions_transitions_per_execution": Decimal("5"),
        "orchestration_lambda_invocations": Decimal("1000"),
        "orchestration_lambda_memory_gb": Decimal("0.512"),
        "orchestration_lambda_duration_seconds": Decimal("1"),
        "staging_gb_per_month": Decimal("50"),
        "staging_average_days": Decimal("1"),
        "staging_get_requests": Decimal("500"),
        "staging_put_requests": Decimal("100"),
        "internal_s3_get_requests": Decimal("100000"),
        "cross_region_transfer_gb": Decimal("1000"),
        "external_egress_gb": Decimal("250"),
    },
    "Cross‑Organisation Sharing Platform (CSP)": {
        "step_functions_executions": Decimal("1000"),
        "step_functions_transitions_per_execution": Decimal("8"),
        "orchestration_lambda_invocations": Decimal("10000"),
        "orchestration_lambda_memory_gb": Decimal("0.512"),
        "orchestration_lambda_duration_seconds": Decimal("2"),
        "staging_gb_per_month": Decimal("500"),
        "staging_average_days": Decimal("2"),
        "staging_get_requests": Decimal("5000"),
        "staging_put_requests": Decimal("1000"),
        "internal_s3_get_requests": Decimal("250000"),
        "cross_region_transfer_gb": Decimal("10000"),
        "external_egress_gb": Decimal("4000"),
    },
}

# Lifecycle model assumptions from the agreed seven-year scenarios. Annual
# project additions are spread evenly across months, and new projects enter at
# the active storage volume before moving to Deep Archive at the policy age.
# All opening active data starts at age zero; opening archive data stays archived.
# Standing and movement charges remain fixed at their current monthly estimates.
LIFECYCLE_MONTHS = 7 * 12
NEW_PROJECTS_PER_YEAR = {
    "Internal Sharing Platform (ISP)": Decimal("25"),
    "Cross‑Organisation Sharing Platform (CSP)": Decimal("50"),
}
LIFECYCLE_POLICIES = {
    "Full retention — keep most data indefinitely": None,
    "Balanced retention — archive and selectively delete": 24,
    "Lean retention — aggressive deletion of transient data": 12,
}

def calculate_network_access(assumptions):
    nat_cost = assumptions["nat_gateways"] * (
        HOURS_PER_MONTH * AWS_PRICES["nat_gateway_per_hour"]
        + assumptions["nat_gb_per_gateway"] * AWS_PRICES["nat_gateway_per_gb"]
    )
    endpoint_hours = (
        assumptions["interface_endpoints"]
        * assumptions["interface_endpoint_azs"]
        * HOURS_PER_MONTH
    )
    endpoint_cost = (
        endpoint_hours * AWS_PRICES["interface_endpoint_per_az_hour"]
        + assumptions["interface_endpoint_gb_total"]
        * AWS_PRICES["interface_endpoint_per_gb"]
    )
    api_cost = (
        assumptions["http_apis"]
        * assumptions["http_api_requests_each"]
        / Decimal("1000000")
        * AWS_PRICES["http_api_per_million_requests"]
    )
    return nat_cost + endpoint_cost + api_cost


def calculate_storage_and_metadata(assumptions):
    s3_cost = (
        assumptions["s3_storage_gb"] * AWS_PRICES["s3_standard_per_gb_month"]
        + assumptions["s3_get_requests"]
        / Decimal("1000")
        * AWS_PRICES["s3_get_per_1000_requests"]
        + assumptions["s3_put_requests"]
        / Decimal("1000")
        * AWS_PRICES["s3_put_per_1000_requests"]
    )
    dynamodb_cost = assumptions["dynamodb_tables"] * (
        assumptions["dynamodb_read_units_per_table"]
        / Decimal("1000000")
        * AWS_PRICES["dynamodb_read_per_million_units"]
        + assumptions["dynamodb_write_units_per_table"]
        / Decimal("1000000")
        * AWS_PRICES["dynamodb_write_per_million_units"]
    )
    return s3_cost + dynamodb_cost


def calculate_identity_and_security(assumptions):
    cloudtrail_cost = (
        assumptions["cloudtrail_data_events"]
        / Decimal("100000")
        * AWS_PRICES["cloudtrail_data_events_per_100000"]
    )
    kms_cost = (
        assumptions["kms_keys"]
        * AWS_PRICES["kms_customer_managed_key_per_month"]
        + assumptions["kms_requests"]
        / Decimal("10000")
        * AWS_PRICES["kms_per_10000_requests"]
    )
    return cloudtrail_cost + kms_cost


def calculate_monitoring_and_audit(assumptions):
    metrics_cost = (
        assumptions["cloudwatch_custom_metrics"]
        * AWS_PRICES["cloudwatch_custom_metric_per_month"]
    )
    dashboard_cost = (
        assumptions["cloudwatch_dashboards"]
        * AWS_PRICES["cloudwatch_dashboard_per_month"]
    )
    alarms_cost = (
        assumptions["cloudwatch_standard_alarms"]
        * AWS_PRICES["cloudwatch_standard_alarm_per_month"]
    )
    logs_storage_gb = (
        assumptions["cloudwatch_log_ingestion_gb_month"]
        * assumptions["cloudwatch_log_retention_days"]
        / DAYS_PER_MONTH
    )
    logs_cost = (
        assumptions["cloudwatch_log_ingestion_gb_month"]
        * AWS_PRICES["cloudwatch_logs_ingestion_per_gb"]
        + logs_storage_gb * AWS_PRICES["cloudwatch_logs_storage_per_gb_month"]
    )
    return metrics_cost + dashboard_cost + alarms_cost + logs_cost


def calculate_baseline_compute(assumptions):
    instance_price_key = f"ec2_{assumptions['ec2_instance_type']}_linux_per_hour"
    ec2_cost = (
        assumptions["ec2_instances"]
        * HOURS_PER_MONTH
        * AWS_PRICES[instance_price_key]
    )
    lambda_cost = (
        assumptions["lambda_invocations"]
        / Decimal("1000000")
        * AWS_PRICES["lambda_per_million_requests"]
        + assumptions["lambda_invocations"]
        * assumptions["lambda_memory_gb"]
        * assumptions["lambda_duration_seconds"]
        * AWS_PRICES["lambda_per_gb_second"]
    )
    return ec2_cost + lambda_cost


def calculate_active_curated_outputs(assumptions):
    stored_gb = (
        assumptions["active_projects"] * assumptions["active_output_gb_per_project"]
    )
    return stored_gb * AWS_PRICES["s3_standard_per_gb_month"]


def calculate_archived_outputs(assumptions):
    stored_gb = (
        assumptions["archived_projects"]
        * assumptions["archived_output_gb_per_project"]
    )
    return stored_gb * AWS_PRICES["s3_glacier_deep_archive_per_gb_month"]


def calculate_metadata_and_indexing(assumptions):
    catalogue_gb = (
        assumptions["catalogue_tables"]
        * assumptions["catalogue_records_per_table"]
        * assumptions["catalogue_record_kb"]
        / Decimal("1000000")
    )
    storage_cost = catalogue_gb * AWS_PRICES["dynamodb_storage_per_gb_month"]
    request_cost = assumptions["catalogue_tables"] * (
        assumptions["catalogue_reads_per_table"]
        / Decimal("1000000")
        * AWS_PRICES["dynamodb_read_per_million_units"]
        + assumptions["catalogue_writes_per_table"]
        / Decimal("1000000")
        * AWS_PRICES["dynamodb_write_per_million_units"]
    )
    return storage_cost + request_cost


def calculate_replication(assumptions):
    replicated_gb = (
        assumptions["active_projects"]
        * assumptions["active_output_gb_per_project"]
        * assumptions["replica_copies"]
    )
    return replicated_gb * AWS_PRICES["s3_standard_per_gb_month"]


def calculate_platform_infrastructure(assumptions):
    transitions = (
        assumptions["step_functions_executions"]
        * assumptions["step_functions_transitions_per_execution"]
    )
    step_functions_cost = (
        transitions
        / Decimal("1000")
        * AWS_PRICES["step_functions_standard_per_1000_transitions"]
    )
    lambda_invocations = assumptions["orchestration_lambda_invocations"]
    lambda_cost = (
        lambda_invocations
        / Decimal("1000000")
        * AWS_PRICES["lambda_per_million_requests"]
        + lambda_invocations
        * assumptions["orchestration_lambda_memory_gb"]
        * assumptions["orchestration_lambda_duration_seconds"]
        * AWS_PRICES["lambda_per_gb_second"]
    )
    staging_average_gb = (
        assumptions["staging_gb_per_month"]
        * assumptions["staging_average_days"]
        / DAYS_PER_MONTH
    )
    staging_cost = (
        staging_average_gb * AWS_PRICES["s3_standard_per_gb_month"]
        + assumptions["staging_get_requests"]
        / Decimal("1000")
        * AWS_PRICES["s3_get_per_1000_requests"]
        + assumptions["staging_put_requests"]
        / Decimal("1000")
        * AWS_PRICES["s3_put_per_1000_requests"]
    )
    return step_functions_cost + lambda_cost + staging_cost


def calculate_internal_transfers(assumptions):
    return (
        assumptions["internal_s3_get_requests"]
        / Decimal("1000")
        * AWS_PRICES["s3_get_per_1000_requests"]
    )


def calculate_cross_region_transfers(assumptions):
    return (
        assumptions["cross_region_transfer_gb"]
        * AWS_PRICES["cross_region_transfer_per_gb"]
    )


def calculate_external_egress(assumptions):
    return (
        assumptions["external_egress_gb"]
        * AWS_PRICES["internet_data_transfer_out_per_gb"]
    )


COMPONENT_CALCULATORS = {
    "Network & access": ("#network-and-access", calculate_network_access),
    "Storage & metadata": ("#core-storage-and-metadata", calculate_storage_and_metadata),
    "Identity & security": ("#identity-and-security", calculate_identity_and_security),
    "Monitoring & audit": ("#monitoring-and-audit", calculate_monitoring_and_audit),
    "Baseline compute": ("#baseline-compute", calculate_baseline_compute),
}

STORAGE_COMPONENT_CALCULATORS = {
    "Active curated outputs (hot storage)": (
        "",
        calculate_active_curated_outputs,
    ),
    "Archived outputs (cold storage)": (
        "",
        calculate_archived_outputs,
    ),
    "Metadata & indexing": (
        "",
        calculate_metadata_and_indexing,
    ),
    "Replication & multi‑region copies": (
        "",
        calculate_replication,
    ),
}

MOVEMENT_COMPONENT_CALCULATORS = {
    "Platform infrastructure (orchestration, APIs, logging, intermediate storage)": (
        "",
        calculate_platform_infrastructure,
    ),
    "Internal transfers (same region)": (
        "",
        calculate_internal_transfers,
    ),
    "Cross‑region transfers": (
        "",
        calculate_cross_region_transfers,
    ),
    "External egress (internet, on‑premises, other clouds)": (
        "",
        calculate_external_egress,
    ),
}


def calculate_standing_costs():
    """Return unrounded monthly values keyed by component and platform."""
    component_values = {}
    for platform, assumptions in SCENARIOS.items():
        for component, (_, calculator) in COMPONENT_CALCULATORS.items():
            component_values[component, platform] = calculator(assumptions)

    for platform in SCENARIOS:
        component_values["Total standing cost", platform] = sum(
            component_values[component, platform] for component in COMPONENT_CALCULATORS
        )
    return component_values


def calculate_storage_costs():
    """Return unrounded monthly storage values keyed by component and platform."""
    component_values = {}
    for platform, assumptions in STORAGE_SCENARIOS.items():
        for component, (_, calculator) in STORAGE_COMPONENT_CALCULATORS.items():
            component_values[component, platform] = calculator(assumptions)

    for platform in STORAGE_SCENARIOS:
        component_values["Total storage cost", platform] = sum(
            component_values[component, platform]
            for component in STORAGE_COMPONENT_CALCULATORS
        )
    return component_values


def calculate_data_movement_costs():
    """Return unrounded monthly data-movement values by component and platform."""
    component_values = {}
    for platform, assumptions in MOVEMENT_SCENARIOS.items():
        for component, (_, calculator) in MOVEMENT_COMPONENT_CALCULATORS.items():
            component_values[component, platform] = calculator(assumptions)

    for platform in MOVEMENT_SCENARIOS:
        component_values["Total data movement cost", platform] = sum(
            component_values[component, platform]
            for component in MOVEMENT_COMPONENT_CALCULATORS
        )
    return component_values


def calculate_lifecycle_costs():
    """Return actual annual spending by strategy, platform, and cost dimension."""
    annual_costs = {}
    standing_monthly = calculate_standing_costs()
    movement_monthly = calculate_data_movement_costs()

    for strategy, archive_after_months in LIFECYCLE_POLICIES.items():
        annual_costs[strategy] = {}
        for platform, storage_assumptions in STORAGE_SCENARIOS.items():
            active_gb = (
                storage_assumptions["active_projects"]
                * storage_assumptions["active_output_gb_per_project"]
            )
            archived_gb = (
                storage_assumptions["archived_projects"]
                * storage_assumptions["archived_output_gb_per_project"]
            )
            active_cohorts = [(0, active_gb)]
            new_project_gb_per_month = (
                NEW_PROJECTS_PER_YEAR[platform]
                * storage_assumptions["active_output_gb_per_project"]
                / Decimal("12")
            )
            metadata_monthly = calculate_metadata_and_indexing(storage_assumptions)
            replica_copies = storage_assumptions["replica_copies"]
            yearly = {"Standing": [], "Storage": [], "Movement": []}

            for month in range(1, LIFECYCLE_MONTHS + 1):
                active_cohorts.append((0, new_project_gb_per_month))
                active_gb = sum(volume for _, volume in active_cohorts)
                storage_monthly = (
                    active_gb
                    * (1 + replica_copies)
                    * AWS_PRICES["s3_standard_per_gb_month"]
                    + archived_gb
                    * AWS_PRICES["s3_glacier_deep_archive_per_gb_month"]
                    + metadata_monthly
                )

                yearly["Standing"].append(
                    standing_monthly["Total standing cost", platform]
                )
                yearly["Storage"].append(storage_monthly)
                yearly["Movement"].append(
                    movement_monthly["Total data movement cost", platform]
                )

                if archive_after_months is not None:
                    retained_cohorts = []
                    for age_months, volume in active_cohorts:
                        age_months += 1
                        if age_months >= archive_after_months:
                            archived_gb += volume
                        else:
                            retained_cohorts.append((age_months, volume))
                    active_cohorts = retained_cohorts

            annual_costs[strategy][platform] = {
                component: [
                    sum(monthly_values[index:index + 12])
                    for index in range(0, LIFECYCLE_MONTHS, 12)
                ]
                for component, monthly_values in yearly.items()
            }

    return annual_costs


def write_cost_csv():
    standing_values = calculate_standing_costs()
    storage_values = calculate_storage_costs()
    movement_values = calculate_data_movement_costs()
    lifecycle_values = calculate_lifecycle_costs()
    fieldnames = ["table", "group", "row", "link", "column", "value", "total"]
    with OUTPUT_CSV.open("w", newline="", encoding="utf-8") as output:
        writer = csv.DictWriter(output, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        for component, (link, _) in COMPONENT_CALCULATORS.items():
            for platform in SCENARIOS:
                writer.writerow(
                    {
                        "table": "standing",
                        "group": "",
                        "row": component,
                        "link": link,
                        "column": platform,
                        "value": f"{standing_values[component, platform]:.2f}",
                        "total": "",
                    }
                )
        for platform in SCENARIOS:
            writer.writerow(
                {
                    "table": "standing",
                    "group": "",
                    "row": "Total standing cost",
                    "link": "",
                    "column": platform,
                    "value": f"{standing_values['Total standing cost', platform]:.2f}",
                    "total": "1",
                }
            )
        for component, (link, _) in STORAGE_COMPONENT_CALCULATORS.items():
            for platform in STORAGE_SCENARIOS:
                writer.writerow(
                    {
                        "table": "storage",
                        "group": "",
                        "row": component,
                        "link": link,
                        "column": platform,
                        "value": f"{storage_values[component, platform]:.2f}",
                        "total": "",
                    }
                )
        for platform in STORAGE_SCENARIOS:
            writer.writerow(
                {
                    "table": "storage",
                    "group": "",
                    "row": "Total storage cost",
                    "link": "",
                    "column": platform,
                    "value": f"{storage_values['Total storage cost', platform]:.2f}",
                    "total": "1",
                }
            )
        for component, (link, _) in MOVEMENT_COMPONENT_CALCULATORS.items():
            for platform in MOVEMENT_SCENARIOS:
                writer.writerow(
                    {
                        "table": "data-movement",
                        "group": "",
                        "row": component,
                        "link": link,
                        "column": platform,
                        "value": f"{movement_values[component, platform]:.2f}",
                        "total": "",
                    }
                )
        for platform in MOVEMENT_SCENARIOS:
            writer.writerow(
                {
                    "table": "data-movement",
                    "group": "",
                    "row": "Total data movement cost",
                    "link": "",
                    "column": platform,
                    "value": f"{movement_values['Total data movement cost', platform]:.2f}",
                    "total": "1",
                }
            )
        for strategy, platform_costs in lifecycle_values.items():
            for platform, component_costs in platform_costs.items():
                platform_short = "ISP" if platform.endswith("(ISP)") else "CSP"
                for component, yearly_values in component_costs.items():
                    for year, annual_value in enumerate(yearly_values, start=1):
                        writer.writerow(
                            {
                                "table": "lifecycle-series",
                                "group": strategy,
                                "row": f"{platform_short} / {component}",
                                "link": "",
                                "column": f"Year {year}",
                                "value": f"{annual_value:.2f}",
                                "total": "",
                            }
                        )


if __name__ == "__main__":
    write_cost_csv()
    print(f"Wrote standing, storage, movement, and lifecycle estimates to {OUTPUT_CSV}")
