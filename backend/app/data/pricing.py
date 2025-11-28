"""
CarbonShift Simulator - AWS Pricing Data

Pricing data for AWS EC2 instances across regions.
Prices are On-Demand Linux pricing in USD per hour.

Note: In production, use AWS Price List API for real-time pricing.
"""

from typing import Dict

# AWS EC2 On-Demand Pricing (USD/hour)
# Prices are approximate and vary by region
# Format: {region_code: {instance_type: price_per_hour}}

AWS_BASE_PRICING: Dict[str, float] = {
    # Base US East prices (reference)
    "t3.micro": 0.0104,
    "t3.small": 0.0208,
    "t3.medium": 0.0416,
    "t3.large": 0.0832,
    "t3.xlarge": 0.1664,
    "m5.large": 0.096,
    "m5.xlarge": 0.192,
    "m5.2xlarge": 0.384,
    "m5.4xlarge": 0.768,
    "c5.large": 0.085,
    "c5.xlarge": 0.170,
    "c5.2xlarge": 0.340,
    "r5.large": 0.126,
    "r5.xlarge": 0.252,
    "r5.2xlarge": 0.504,
}

# Regional price multipliers (relative to us-east-1)
REGION_PRICE_MULTIPLIERS: Dict[str, float] = {
    # North America
    "us-east-1": 1.00,
    "us-east-2": 1.00,
    "us-west-1": 1.10,
    "us-west-2": 1.00,
    "ca-central-1": 1.05,
    
    # Europe
    "eu-west-1": 1.08,
    "eu-west-2": 1.10,
    "eu-west-3": 1.12,
    "eu-central-1": 1.10,
    "eu-central-2": 1.18,
    "eu-north-1": 1.05,
    "eu-south-1": 1.12,
    
    # Asia Pacific
    "ap-northeast-1": 1.20,
    "ap-northeast-2": 1.18,
    "ap-southeast-1": 1.12,
    "ap-southeast-2": 1.15,
    "ap-south-1": 1.05,
    
    # South America
    "sa-east-1": 1.45,  # Typically more expensive
}


def get_instance_price(instance_type: str, region_code: str) -> float | None:
    """
    Get the hourly price for an instance in a specific region.
    
    Args:
        instance_type: The EC2 instance type (e.g., t3.micro)
        region_code: The AWS region code (e.g., us-east-1)
        
    Returns:
        Price in USD per hour, or None if not found
    """
    base_price = AWS_BASE_PRICING.get(instance_type)
    if base_price is None:
        return None
    
    multiplier = REGION_PRICE_MULTIPLIERS.get(region_code, 1.10)  # Default 10% premium
    return round(base_price * multiplier, 4)


def get_monthly_cost(instance_type: str, region_code: str, hours_per_month: float, instance_count: int = 1) -> float | None:
    """
    Calculate the monthly cost for instances.
    
    Args:
        instance_type: The EC2 instance type
        region_code: The AWS region code
        hours_per_month: Hours the instances run per month
        instance_count: Number of instances
        
    Returns:
        Monthly cost in USD, or None if pricing not available
    """
    hourly_price = get_instance_price(instance_type, region_code)
    if hourly_price is None:
        return None
    
    return round(hourly_price * hours_per_month * instance_count, 2)


def get_available_pricing() -> Dict[str, float]:
    """Get all available instance pricing."""
    return AWS_BASE_PRICING.copy()
