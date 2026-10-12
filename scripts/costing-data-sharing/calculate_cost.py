"""Calculate the standing-cost estimates and write a review CSV.

Rates are AWS public list prices for us-east-1 (US East, N. Virginia),
checked on 2026-10-12. Free-tier credits, discounts, taxes, and data-transfer
charges outside the stated assumptions are excluded.
"""

import csv
from decimal import Decimal
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_CSV = SCRIPT_DIR / "cost_table_revised.csv"

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
    "s3_get_per_1000_requests": Decimal("0.0004"),
    "s3_put_per_1000_requests": Decimal("0.005"),
    "dynamodb_read_per_million_units": Decimal("0.125"),
    "dynamodb_write_per_million_units": Decimal("0.625"),
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


COMPONENT_CALCULATORS = {
    "Network & access": ("#network-and-access", calculate_network_access),
    "Storage & metadata": ("#core-storage-and-metadata", calculate_storage_and_metadata),
    "Identity & security": ("#identity-and-security", calculate_identity_and_security),
    "Monitoring & audit": ("#monitoring-and-audit", calculate_monitoring_and_audit),
    "Baseline compute": ("#baseline-compute", calculate_baseline_compute),
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


def write_standing_csv():
    component_values = calculate_standing_costs()
    fieldnames = ["table", "group", "row", "link", "column", "value", "total"]
    with OUTPUT_CSV.open("w", newline="", encoding="utf-8") as output:
        writer = csv.DictWriter(output, fieldnames=fieldnames)
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
                        "value": f"{component_values[component, platform]:.2f}",
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
                    "value": f"{component_values['Total standing cost', platform]:.2f}",
                    "total": "1",
                }
            )


if __name__ == "__main__":
    write_standing_csv()
    print(f"Wrote standing-cost estimates to {OUTPUT_CSV}")
