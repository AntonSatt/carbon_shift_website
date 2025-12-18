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
from app.models.power_models import AWS_INSTANCE_PROFILES, get_available_instances
from app.data.carbon_intensity import get_all_regions
from app.services.simulation_service import simulation_service
from app.services.ai_service import ai_insights_service
from app.services.aws_pricing_service import aws_pricing_service

router = APIRouter()


@router.post("/simulate", response_model=SimulationResponse)
async def run_simulation(request: SimulationRequest):
    """
    Run a carbon emissions and cost simulation.
    
    Takes workload configuration and returns comparisons across all regions.
    Optionally accepts user_location for personalized AI recommendations.
    Optionally accepts priorities for custom weighting of carbon/price/latency/compliance.
    """
    try:
        # Run the simulation
        result = simulation_service.run_simulation(request)
        
        # Convert priorities to dict if provided
        priorities_dict = None
        if request.priorities:
            priorities_dict = {
                "carbon": request.priorities.carbon,
                "price": request.priorities.price,
                "latency": request.priorities.latency,
                "compliance": request.priorities.compliance,
            }
        
        # Generate AI insights with user location context and priorities
        insights, provider, recommended_region_code = ai_insights_service.generate_insights(
            result, 
            user_location=request.user_location,
            priorities=priorities_dict
        )
        result.ai_insights = insights
        result.ai_provider = provider
        
        # Set the AI-recommended region
        if recommended_region_code:
            # Find the region result for the recommended region
            all_regions = [result.current_region_result] + result.comparison_regions
            for region in all_regions:
                if region.region_code == recommended_region_code:
                    result.ai_recommended_region = region
                    break
        
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


@router.post("/refresh-prices")
async def refresh_prices():
    """
    Manually refresh EC2 prices from AWS Price List API.
    
    This endpoint fetches the latest prices for all instance types
    and regions, then caches them locally. Call this once per day
    or when you need to update prices.
    
    Requires AWS credentials to be configured.
    """
    if not aws_pricing_service.enabled:
        return {
            "success": False,
            "message": "AWS Pricing API not configured. Add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to .env",
            "using_static_prices": True,
        }
    
    try:
        instance_types = get_available_instances()
        region_codes = [r.region_code for r in get_all_regions()]
        
        prices = aws_pricing_service.refresh_all_prices(instance_types, region_codes)
        
        total_prices = sum(len(p) for p in prices.values())
        
        return {
            "success": True,
            "message": f"Refreshed {total_prices} prices across {len(region_codes)} regions",
            "regions_updated": len(prices),
            "instance_types": len(instance_types),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh prices: {str(e)}")


@router.get("/pricing-status")
async def pricing_status():
    """Check the status of the AWS Pricing integration."""
    return {
        "aws_pricing_enabled": aws_pricing_service.enabled,
        "cache_valid": aws_pricing_service._is_cache_valid(),
        "cached_prices_count": len(aws_pricing_service._cached_prices),
        "cache_timestamp": aws_pricing_service._cache_timestamp.isoformat() if aws_pricing_service._cache_timestamp else None,
    }
