"""
CarbonShift Simulator - Carbon Intensity Data

Carbon intensity values (gCO2/kWh) for electricity grids in various regions.
Data sourced from Electricity Maps, IEA, and public carbon intensity databases.

These are annual average values - real-time values would require API integration.
"""

from pydantic import BaseModel
from typing import Dict


class RegionCarbonData(BaseModel):
    """Carbon intensity data for a region."""
    region_code: str
    region_name: str
    country: str
    carbon_intensity_gco2_kwh: float  # grams CO2 per kWh
    renewable_percentage: float = 0.0  # % of electricity from renewables
    

# AWS Regions with Carbon Intensity Data
# Values are annual averages (2024 estimates)
AWS_REGION_CARBON_DATA: Dict[str, RegionCarbonData] = {
    # Europe
    "eu-north-1": RegionCarbonData(
        region_code="eu-north-1",
        region_name="Stockholm",
        country="Sweden",
        carbon_intensity_gco2_kwh=45,  # Very low - hydro/nuclear
        renewable_percentage=75.0
    ),
    "eu-west-1": RegionCarbonData(
        region_code="eu-west-1",
        region_name="Ireland",
        country="Ireland",
        carbon_intensity_gco2_kwh=296,
        renewable_percentage=42.0
    ),
    "eu-west-2": RegionCarbonData(
        region_code="eu-west-2",
        region_name="London",
        country="United Kingdom",
        carbon_intensity_gco2_kwh=233,
        renewable_percentage=45.0
    ),
    "eu-west-3": RegionCarbonData(
        region_code="eu-west-3",
        region_name="Paris",
        country="France",
        carbon_intensity_gco2_kwh=56,  # Low - nuclear
        renewable_percentage=25.0
    ),
    "eu-central-1": RegionCarbonData(
        region_code="eu-central-1",
        region_name="Frankfurt",
        country="Germany",
        carbon_intensity_gco2_kwh=385,  # Higher - coal/gas mix
        renewable_percentage=52.0
    ),
    "eu-central-2": RegionCarbonData(
        region_code="eu-central-2",
        region_name="Zurich",
        country="Switzerland",
        carbon_intensity_gco2_kwh=28,  # Very low - hydro
        renewable_percentage=80.0
    ),
    "eu-south-1": RegionCarbonData(
        region_code="eu-south-1",
        region_name="Milan",
        country="Italy",
        carbon_intensity_gco2_kwh=315,
        renewable_percentage=40.0
    ),
    
    # North America
    "us-east-1": RegionCarbonData(
        region_code="us-east-1",
        region_name="N. Virginia",
        country="United States",
        carbon_intensity_gco2_kwh=378,
        renewable_percentage=22.0
    ),
    "us-east-2": RegionCarbonData(
        region_code="us-east-2",
        region_name="Ohio",
        country="United States",
        carbon_intensity_gco2_kwh=415,  # Higher - coal
        renewable_percentage=15.0
    ),
    "us-west-1": RegionCarbonData(
        region_code="us-west-1",
        region_name="N. California",
        country="United States",
        carbon_intensity_gco2_kwh=210,  # Lower - renewables
        renewable_percentage=48.0
    ),
    "us-west-2": RegionCarbonData(
        region_code="us-west-2",
        region_name="Oregon",
        country="United States",
        carbon_intensity_gco2_kwh=115,  # Very low - hydro
        renewable_percentage=72.0
    ),
    "ca-central-1": RegionCarbonData(
        region_code="ca-central-1",
        region_name="Montreal",
        country="Canada",
        carbon_intensity_gco2_kwh=25,  # Very low - hydro
        renewable_percentage=95.0
    ),
    
    # Asia Pacific
    "ap-northeast-1": RegionCarbonData(
        region_code="ap-northeast-1",
        region_name="Tokyo",
        country="Japan",
        carbon_intensity_gco2_kwh=465,
        renewable_percentage=22.0
    ),
    "ap-northeast-2": RegionCarbonData(
        region_code="ap-northeast-2",
        region_name="Seoul",
        country="South Korea",
        carbon_intensity_gco2_kwh=420,
        renewable_percentage=10.0
    ),
    "ap-southeast-1": RegionCarbonData(
        region_code="ap-southeast-1",
        region_name="Singapore",
        country="Singapore",
        carbon_intensity_gco2_kwh=408,
        renewable_percentage=5.0
    ),
    "ap-southeast-2": RegionCarbonData(
        region_code="ap-southeast-2",
        region_name="Sydney",
        country="Australia",
        carbon_intensity_gco2_kwh=660,  # High - coal
        renewable_percentage=32.0
    ),
    "ap-south-1": RegionCarbonData(
        region_code="ap-south-1",
        region_name="Mumbai",
        country="India",
        carbon_intensity_gco2_kwh=708,  # High - coal
        renewable_percentage=20.0
    ),
    
    # South America
    "sa-east-1": RegionCarbonData(
        region_code="sa-east-1",
        region_name="São Paulo",
        country="Brazil",
        carbon_intensity_gco2_kwh=75,  # Low - hydro
        renewable_percentage=85.0
    ),
}


def get_region_carbon_data(region_code: str) -> RegionCarbonData | None:
    """Get carbon intensity data for a region."""
    return AWS_REGION_CARBON_DATA.get(region_code)


def get_all_regions() -> list[RegionCarbonData]:
    """Get all available regions with carbon data."""
    return list(AWS_REGION_CARBON_DATA.values())


def get_regions_sorted_by_carbon() -> list[RegionCarbonData]:
    """Get regions sorted by carbon intensity (lowest first)."""
    return sorted(
        AWS_REGION_CARBON_DATA.values(),
        key=lambda r: r.carbon_intensity_gco2_kwh
    )
