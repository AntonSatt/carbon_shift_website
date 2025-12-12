'use client';

import { useState, useEffect } from 'react';
import { SimulationForm } from '@/components/simulation-form';
import { ResultsDashboard } from '@/components/results-dashboard';
import { ThemeToggle } from '@/components/theme-toggle';
import { SimulationRequest, SimulationResponse, MetadataResponse } from '@/lib/types';
import { apiClient } from '@/lib/api';
import { Leaf, Github, Linkedin, Globe } from 'lucide-react';

export default function Home() {
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);

  // Fetch metadata on mount
  useEffect(() => {
    apiClient.getMetadata()
      .then(setMetadata)
      .catch(() => {
        console.log('Could not fetch metadata from API, using defaults');
      });
  }, []);

  const handleSubmit = async (request: SimulationRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.runSimulation(request);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
      // Demo mode: show mock result when API is unavailable
      if (!metadata) {
        setResult(getMockResult(request));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            <span className="text-lg sm:text-xl font-bold">CarbonShift</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <p className="text-sm text-muted-foreground hidden md:block">
              Move your bits, save the planet (and money) 🌍
            </p>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 sm:mb-3">
            Cloud Carbon <span className="text-green-600">Simulator</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Discover how much CO₂ and money you can save by choosing the right cloud region for your workloads.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-[400px_1fr]">
          {/* Form */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SimulationForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              instances={metadata?.instances}
              regions={metadata?.regions}
            />

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                ⚠️ {error}
                {!metadata && <p className="mt-1 text-xs">Running in demo mode with sample data.</p>}
              </div>
            )}
          </div>

          {/* Results */}
          <div>
            {result ? (
              <ResultsDashboard result={result} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] sm:h-[400px] text-center text-muted-foreground border-2 border-dashed rounded-lg px-4">
                <Leaf className="h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 opacity-50" />
                <p className="text-base sm:text-lg font-medium">Configure your workload</p>
                <p className="text-xs sm:text-sm">Enter your cloud details and click &quot;Calculate Carbon Impact&quot;</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-8 sm:mt-16 py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground px-4">
        <p>
          Built with 💚 for a sustainable cloud future.
        </p>
        <p className="mt-2">
          Carbon intensity data from Electricity Maps • Pricing based on AWS On-Demand rates
        </p>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground/70">
            Made by{' '}
            <span className="font-medium text-foreground/80">Anton Sätterkvist</span>
          </p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <a
              href="https://antonsatt.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/60 hover:text-green-600 transition-colors duration-200"
              aria-label="Personal Website"
            >
              <Globe className="h-4 w-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/anton-satterkvist/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/60 hover:text-blue-600 transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/AntonSatt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/60 hover:text-foreground transition-colors duration-200"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Mock result for demo mode when API is unavailable
function getMockResult(request: SimulationRequest): SimulationResponse {
  const mockRegions = [
    { code: 'eu-north-1', name: 'Stockholm', country: 'Sweden', intensity: 45, multiplier: 1.05 },
    { code: 'ca-central-1', name: 'Montreal', country: 'Canada', intensity: 25, multiplier: 1.05 },
    { code: 'eu-west-3', name: 'Paris', country: 'France', intensity: 56, multiplier: 1.12 },
    { code: 'us-west-2', name: 'Oregon', country: 'United States', intensity: 115, multiplier: 1.00 },
    { code: 'eu-west-2', name: 'London', country: 'United Kingdom', intensity: 233, multiplier: 1.10 },
    { code: 'eu-central-1', name: 'Frankfurt', country: 'Germany', intensity: 385, multiplier: 1.10 },
    { code: 'us-east-1', name: 'N. Virginia', country: 'United States', intensity: 378, multiplier: 1.00 },
  ];

  const baseWatts = 12; // Simplified power calculation
  const powerKw = baseWatts / 1000;
  const totalKwh = powerKw * request.hours_per_month * request.instance_count;
  const baseCost = 0.096 * request.hours_per_month * request.instance_count;

  const results = mockRegions.map((region) => ({
    region_code: region.code,
    region_name: region.name,
    country: region.country,
    carbon_intensity_gco2_kwh: region.intensity,
    power_consumption_kwh: Math.round(totalKwh * 100) / 100,
    carbon_emissions_kg: Math.round((totalKwh * region.intensity) / 10) / 100,
    monthly_cost_usd: Math.round(baseCost * region.multiplier * 100) / 100,
    is_current_region: region.code === request.current_region,
    is_lowest_carbon: false,
    is_lowest_cost: false,
    carbon_savings_kg: 0,
    cost_savings_usd: 0,
    carbon_savings_percent: 0,
    cost_savings_percent: 0,
  }));

  const current = results.find((r) => r.is_current_region) || results[0];

  // Find minimum values
  const minCarbon = Math.min(...results.map((r) => r.carbon_emissions_kg));
  const minCost = Math.min(...results.map((r) => r.monthly_cost_usd));

  // Mark ALL regions that tie for the lowest (not just one)
  results.forEach((r) => {
    r.is_lowest_carbon = r.carbon_emissions_kg === minCarbon;
    r.is_lowest_cost = r.monthly_cost_usd === minCost;
    r.carbon_savings_kg = Math.round((current.carbon_emissions_kg - r.carbon_emissions_kg) * 100) / 100;
    r.cost_savings_usd = Math.round((current.monthly_cost_usd - r.monthly_cost_usd) * 100) / 100;
    r.carbon_savings_percent = Math.round((r.carbon_savings_kg / current.carbon_emissions_kg) * 1000) / 10;
    r.cost_savings_percent = Math.round((r.cost_savings_usd / current.monthly_cost_usd) * 1000) / 10;
  });

  const bestCarbon = results.find((r) => r.is_lowest_carbon)!;
  const bestCost = results.find((r) => r.is_lowest_cost)!;
  const yearlyCarbon = (current.carbon_emissions_kg - minCarbon) * 12;

  return {
    success: true,
    request,
    current_region_result: current,
    comparison_regions: results.filter((r) => !r.is_current_region),
    best_carbon_region: bestCarbon,
    best_cost_region: bestCost,
    ai_recommended_region: bestCarbon,  // In demo mode, recommend lowest carbon
    ai_insights: `## 🌱 Sustainability Analysis\n\nYour current deployment in **${current.region_name}** produces approximately **${current.carbon_emissions_kg} kg CO₂ per month**.\n\nBy migrating to **${bestCarbon.region_name}** (${bestCarbon.country}), you could reduce emissions to just **${bestCarbon.carbon_emissions_kg} kg CO₂ per month** — a **${Math.abs(bestCarbon.carbon_savings_percent)}% reduction**!\n\n### 🎯 Recommendation\n\n**Consider migrating** to **${bestCarbon.region_name}** for meaningful carbon savings. This contributes positively to your sustainability goals while potentially reducing costs.`,
    ai_provider: 'template',
    equivalencies: {
      yearly_savings_kg: Math.round(yearlyCarbon * 10) / 10,
      car_km_saved: Math.round(yearlyCarbon * 4),
      tree_months: Math.round(yearlyCarbon * 0.83),
      smartphone_charges: Math.round(yearlyCarbon * 120),
    },
  };
}
