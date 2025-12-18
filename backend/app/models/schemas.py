"""
CarbonShift Simulator - Pydantic Schemas

Request/Response models for the API.
"""

from pydantic import BaseModel, Field
from typing import Optional


class PriorityPreferences(BaseModel):
    """User's priority preferences for recommendations (0.0 to 1.0 scale)."""
    carbon: float = Field(default=1.0, ge=0.0, le=1.0, description="Priority weight for carbon reduction (default: 1.0 - highest)")
    price: float = Field(default=0.6, ge=0.0, le=1.0, description="Priority weight for cost savings (default: 0.6)")
    latency: float = Field(default=0.3, ge=0.0, le=1.0, description="Priority weight for low latency (default: 0.3)")
    compliance: float = Field(default=0.2, ge=0.0, le=1.0, description="Priority weight for data sovereignty/compliance (default: 0.2)")


class SimulationRequest(BaseModel):
    """Request model for running a carbon simulation."""
    cloud_provider: str = Field(default="aws", description="Cloud provider (aws, azure, gcp)")
    instance_type: str = Field(..., description="Instance type (e.g., t3.micro, m5.large)")
    instance_count: int = Field(default=1, ge=1, le=1000, description="Number of instances")
    cpu_utilization: float = Field(default=50.0, ge=0, le=100, description="Average CPU utilization (%)")
    hours_per_month: float = Field(default=730, ge=1, le=744, description="Hours running per month")
    current_region: str = Field(..., description="Current AWS region (e.g., eu-central-1)")
    user_location: Optional[str] = Field(None, description="User's location for personalized recommendations (e.g., 'United States', 'Germany', 'Singapore')")
    priorities: Optional[PriorityPreferences] = Field(None, description="Advanced: Custom priority weights for recommendations")


class RegionResult(BaseModel):
    """Carbon and cost results for a single region."""
    region_code: str
    region_name: str
    country: str
    carbon_intensity_gco2_kwh: float
    power_consumption_kwh: float
    carbon_emissions_kg: float
    monthly_cost_usd: float
    is_current_region: bool = False
    is_lowest_carbon: bool = False
    is_lowest_cost: bool = False
    carbon_savings_kg: float = 0.0
    cost_savings_usd: float = 0.0
    carbon_savings_percent: float = 0.0
    cost_savings_percent: float = 0.0


class SimulationResponse(BaseModel):
    """Response model for a carbon simulation."""
    success: bool
    request: SimulationRequest
    current_region_result: RegionResult
    comparison_regions: list[RegionResult]
    best_carbon_region: RegionResult
    best_cost_region: RegionResult
    ai_recommended_region: Optional[RegionResult] = None  # AI's overall recommendation (considers latency, GDPR, user location)
    ai_insights: Optional[str] = None
    ai_provider: Optional[str] = None  # "openrouter", "bedrock", or "template"
    equivalencies: dict = Field(default_factory=dict)


class InstanceInfo(BaseModel):
    """Information about an available instance type."""
    instance_type: str
    vcpus: int
    memory_gb: float
    idle_watts: float
    max_watts: float


class RegionInfo(BaseModel):
    """Information about an available region."""
    region_code: str
    region_name: str
    country: str
    carbon_intensity_gco2_kwh: float


class MetadataResponse(BaseModel):
    """Metadata about available options."""
    instances: list[InstanceInfo]
    regions: list[RegionInfo]
    cloud_providers: list[str]
