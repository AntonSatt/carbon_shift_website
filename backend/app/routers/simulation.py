"""
CarbonShift Simulator - API Routes

Main API endpoints for the simulation service.
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    SimulationRequest,
    SimulationResponse,
    MetadataResponse,
    InstanceInfo,
    RegionInfo,
)
from app.models.power_models import AWS_INSTANCE_PROFILES
from app.data.carbon_intensity import get_all_regions
from app.services.simulation_service import simulation_service
from app.services.ai_service import ai_insights_service

router = APIRouter()


@router.post("/simulate", response_model=SimulationResponse)
async def run_simulation(request: SimulationRequest):
    """
    Run a carbon emissions and cost simulation.
    
    Takes workload configuration and returns comparisons across all regions.
    """
    try:
        # Run the simulation
        result = simulation_service.run_simulation(request)
        
        # Generate AI insights
        result.ai_insights = ai_insights_service.generate_insights(result)
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


@router.get("/metadata", response_model=MetadataResponse)
async def get_metadata():
    """
    Get available options for the simulation form.
    
    Returns lists of instance types, regions, and supported cloud providers.
    """
    # Build instance info list
    instances = [
        InstanceInfo(
            instance_type=profile.instance_type,
            vcpus=profile.vcpus,
            memory_gb=profile.memory_gb,
            idle_watts=profile.idle_watts,
            max_watts=profile.max_watts,
        )
        for profile in AWS_INSTANCE_PROFILES.values()
    ]
    
    # Build region info list
    regions = [
        RegionInfo(
            region_code=region.region_code,
            region_name=region.region_name,
            country=region.country,
            carbon_intensity_gco2_kwh=region.carbon_intensity_gco2_kwh,
        )
        for region in get_all_regions()
    ]
    
    # Sort regions by name for better UX
    regions.sort(key=lambda r: r.region_name)
    
    return MetadataResponse(
        instances=instances,
        regions=regions,
        cloud_providers=["aws"],  # Expandable to azure, gcp
    )


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "carbonshift-api"}
