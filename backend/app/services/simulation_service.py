"""
CarbonShift Simulator - Simulation Service

Core business logic for calculating carbon emissions and costs.
"""

from app.models.power_models import get_instance_profile, AWS_INSTANCE_PROFILES
from app.models.schemas import (
    SimulationRequest,
    SimulationResponse,
    RegionResult,
)
from app.data.carbon_intensity import get_region_carbon_data, get_all_regions
from app.services.aws_pricing_service import aws_pricing_service


class SimulationService:
    """Service for running carbon/cost simulations."""
    
    # CO2 equivalencies for context
    CO2_EQUIVALENCIES = {
        "car_km_per_kg": 4.0,  # 1 kg CO2 = ~4 km driving (avg car)
        "tree_months_per_kg": 0.83,  # 1 kg CO2 absorbed by tree in ~1 month
        "smartphone_charges_per_kg": 120,  # 1 kg CO2 = ~120 smartphone charges
        "flights_paris_london_per_ton": 10,  # 1 ton CO2 = ~10 short flights
    }
    
    def run_simulation(self, request: SimulationRequest) -> SimulationResponse:
        """
        Run a complete carbon/cost simulation.
        
        Calculates emissions and costs for the current region
        and compares against all available alternative regions.
        """
        # Validate instance type
        instance_profile = get_instance_profile(request.instance_type)
        if not instance_profile:
            raise ValueError(f"Unknown instance type: {request.instance_type}")
        
        # Validate current region
        current_region_data = get_region_carbon_data(request.current_region)
        if not current_region_data:
            raise ValueError(f"Unknown region: {request.current_region}")
        
        # Calculate power consumption (same for all regions)
        power_watts = instance_profile.calculate_power(request.cpu_utilization)
        power_kw = power_watts / 1000.0
        
        # Total kWh per month for all instances
        total_kwh = power_kw * request.hours_per_month * request.instance_count
        
        # Calculate results for all regions
        all_results: list[RegionResult] = []
        
        for region_data in get_all_regions():
            # Carbon emissions (convert gCO2 to kg)
            carbon_emissions_g = total_kwh * region_data.carbon_intensity_gco2_kwh
            carbon_emissions_kg = carbon_emissions_g / 1000.0
            
            # Cost calculation using AWS Pricing Service (with fallback to static)
            monthly_cost = aws_pricing_service.get_monthly_cost(
                request.instance_type,
                region_data.region_code,
                request.hours_per_month,
                request.instance_count
            )
            
            result = RegionResult(
                region_code=region_data.region_code,
                region_name=region_data.region_name,
                country=region_data.country,
                carbon_intensity_gco2_kwh=region_data.carbon_intensity_gco2_kwh,
                power_consumption_kwh=round(total_kwh, 2),
                carbon_emissions_kg=round(carbon_emissions_kg, 2),
                monthly_cost_usd=monthly_cost,
                is_current_region=(region_data.region_code == request.current_region)
            )
            all_results.append(result)
        
        # Find current region result
        current_result = next(r for r in all_results if r.is_current_region)
        
        # Find best regions
        best_carbon = min(all_results, key=lambda r: r.carbon_emissions_kg)
        best_cost = min(all_results, key=lambda r: r.monthly_cost_usd)
        
        # Mark best regions
        for result in all_results:
            result.is_lowest_carbon = (result.region_code == best_carbon.region_code)
            result.is_lowest_cost = (result.region_code == best_cost.region_code)
            
            # Calculate savings compared to current region
            result.carbon_savings_kg = round(
                current_result.carbon_emissions_kg - result.carbon_emissions_kg, 2
            )
            result.cost_savings_usd = round(
                current_result.monthly_cost_usd - result.monthly_cost_usd, 2
            )
            
            # Calculate percentage savings
            if current_result.carbon_emissions_kg > 0:
                result.carbon_savings_percent = round(
                    (result.carbon_savings_kg / current_result.carbon_emissions_kg) * 100, 1
                )
            if current_result.monthly_cost_usd > 0:
                result.cost_savings_percent = round(
                    (result.cost_savings_usd / current_result.monthly_cost_usd) * 100, 1
                )
        
        # Separate comparison regions (exclude current)
        comparison_regions = [r for r in all_results if not r.is_current_region]
        comparison_regions.sort(key=lambda r: r.carbon_emissions_kg)
        
        # Calculate equivalencies for potential savings
        max_carbon_savings = current_result.carbon_emissions_kg - best_carbon.carbon_emissions_kg
        yearly_carbon_savings = max_carbon_savings * 12
        
        equivalencies = {
            "yearly_savings_kg": round(yearly_carbon_savings, 1),
            "car_km_saved": round(yearly_carbon_savings * self.CO2_EQUIVALENCIES["car_km_per_kg"], 0),
            "tree_months": round(yearly_carbon_savings * self.CO2_EQUIVALENCIES["tree_months_per_kg"], 0),
            "smartphone_charges": round(yearly_carbon_savings * self.CO2_EQUIVALENCIES["smartphone_charges_per_kg"], 0),
        }
        
        return SimulationResponse(
            success=True,
            request=request,
            current_region_result=current_result,
            comparison_regions=comparison_regions,
            best_carbon_region=best_carbon,
            best_cost_region=best_cost,
            equivalencies=equivalencies,
        )


# Singleton instance
simulation_service = SimulationService()
