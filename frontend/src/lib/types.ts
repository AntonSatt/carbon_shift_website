// API Types matching the backend schemas

export interface SimulationRequest {
  cloud_provider: string;
  instance_type: string;
  instance_count: number;
  cpu_utilization: number;
  hours_per_month: number;
  current_region: string;
}

export interface RegionResult {
  region_code: string;
  region_name: string;
  country: string;
  carbon_intensity_gco2_kwh: number;
  power_consumption_kwh: number;
  carbon_emissions_kg: number;
  monthly_cost_usd: number;
  is_current_region: boolean;
  is_lowest_carbon: boolean;
  is_lowest_cost: boolean;
  carbon_savings_kg: number;
  cost_savings_usd: number;
  carbon_savings_percent: number;
  cost_savings_percent: number;
}

export interface Equivalencies {
  yearly_savings_kg: number;
  car_km_saved: number;
  tree_months: number;
  smartphone_charges: number;
}

export interface SimulationResponse {
  success: boolean;
  request: SimulationRequest;
  current_region_result: RegionResult;
  comparison_regions: RegionResult[];
  best_carbon_region: RegionResult;
  best_cost_region: RegionResult;
  ai_insights: string | null;
  equivalencies: Equivalencies;
}

export interface InstanceInfo {
  instance_type: string;
  vcpus: number;
  memory_gb: number;
  idle_watts: number;
  max_watts: number;
}

export interface RegionInfo {
  region_code: string;
  region_name: string;
  country: string;
  carbon_intensity_gco2_kwh: number;
}

export interface MetadataResponse {
  instances: InstanceInfo[];
  regions: RegionInfo[];
  cloud_providers: string[];
}
