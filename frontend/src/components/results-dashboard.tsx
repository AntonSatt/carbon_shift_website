'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimulationResponse } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Leaf, DollarSign, Award, Car, TreePine, Smartphone } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ResultsDashboardProps {
  result: SimulationResponse;
}

export function ResultsDashboard({ result }: ResultsDashboardProps) {
  const { current_region_result, comparison_regions, best_carbon_region, best_cost_region, equivalencies, ai_insights, ai_provider } = result;

  // Prepare chart data - include current region + all comparisons
  const allRegions = [current_region_result, ...comparison_regions];
  
  // Calculate dynamic chart height based on number of regions (min 400px, ~35px per region)
  const chartHeight = Math.max(400, allRegions.length * 35);
  
  const carbonChartData = allRegions
    .sort((a, b) => a.carbon_emissions_kg - b.carbon_emissions_kg)
    .map((region) => ({
      name: region.region_name,
      emissions: region.carbon_emissions_kg,
      isCurrent: region.is_current_region,
      isLowest: region.is_lowest_carbon,
    }));

  const costChartData = allRegions
    .sort((a, b) => a.monthly_cost_usd - b.monthly_cost_usd)
    .map((region) => ({
      name: region.region_name,
      cost: region.monthly_cost_usd,
      isCurrent: region.is_current_region,
      isLowest: region.is_lowest_cost,
    }));

  const getBarColor = (entry: { isCurrent?: boolean; isLowest?: boolean }, type: 'carbon' | 'cost') => {
    if (entry.isLowest) return type === 'carbon' ? '#22c55e' : '#3b82f6'; // Green for carbon, blue for cost
    if (entry.isCurrent) return '#f59e0b'; // Amber for current
    return '#94a3b8'; // Gray for others
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Current Region */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Your Current Setup</CardDescription>
            <CardTitle className="text-lg flex items-center gap-2">
              📍 {current_region_result.region_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">CO₂/month</span>
                <span className="font-medium">{current_region_result.carbon_emissions_kg} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost/month</span>
                <span className="font-medium">${current_region_result.monthly_cost_usd}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Carbon */}
        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Leaf className="h-3 w-3 text-green-600" />
              Lowest Carbon
            </CardDescription>
            <CardTitle className="text-lg flex items-center gap-2">
              🌱 {best_carbon_region.region_name}
              {best_carbon_region.is_current_region && <Badge variant="outline">Current</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">CO₂/month</span>
                <span className="font-medium text-green-600">{best_carbon_region.carbon_emissions_kg} kg</span>
              </div>
              {!best_carbon_region.is_current_region && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Savings</span>
                  <span className="font-medium text-green-600">
                    -{best_carbon_region.carbon_savings_kg} kg ({Math.abs(best_carbon_region.carbon_savings_percent)}%)
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Best Cost */}
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-blue-600" />
              Lowest Cost
            </CardDescription>
            <CardTitle className="text-lg flex items-center gap-2">
              💰 {best_cost_region.region_name}
              {best_cost_region.is_current_region && <Badge variant="outline">Current</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost/month</span>
                <span className="font-medium text-blue-600">${best_cost_region.monthly_cost_usd}</span>
              </div>
              {!best_cost_region.is_current_region && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Savings</span>
                  <span className="font-medium text-blue-600">
                    ${best_cost_region.cost_savings_usd}/mo
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Impact Equivalencies */}
      {equivalencies.yearly_savings_kg > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Yearly Savings Potential
            </CardTitle>
            <CardDescription>
              By switching to {best_carbon_region.region_name}, you could save {equivalencies.yearly_savings_kg} kg CO₂ per year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Car className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-bold text-lg">{equivalencies.car_km_saved.toLocaleString()} km</p>
                  <p className="text-sm text-muted-foreground">of car driving avoided</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <TreePine className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-bold text-lg">{equivalencies.tree_months.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">tree-months of absorption</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Smartphone className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="font-bold text-lg">{equivalencies.smartphone_charges.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">smartphone charges</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <Tabs defaultValue="carbon" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="carbon">🌱 Carbon Emissions</TabsTrigger>
          <TabsTrigger value="cost">💰 Monthly Cost</TabsTrigger>
        </TabsList>
        
        <TabsContent value="carbon">
          <Card>
            <CardHeader>
              <CardTitle>CO₂ Emissions by Region (kg/month)</CardTitle>
              <CardDescription>
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span> Lowest
                  <span className="w-3 h-3 rounded-full bg-amber-500 ml-2"></span> Current
                  <span className="w-3 h-3 rounded-full bg-slate-400 ml-2"></span> Others
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ height: `${chartHeight}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={carbonChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => [`${value} kg CO₂`, 'Emissions']}
                    />
                    <Bar dataKey="emissions" radius={[0, 4, 4, 0]}>
                      {carbonChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry, 'carbon')} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Cost by Region (USD)</CardTitle>
              <CardDescription>
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span> Lowest
                  <span className="w-3 h-3 rounded-full bg-amber-500 ml-2"></span> Current
                  <span className="w-3 h-3 rounded-full bg-slate-400 ml-2"></span> Others
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ height: `${chartHeight}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => [`$${value}`, 'Monthly Cost']}
                    />
                    <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                      {costChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry, 'cost')} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Insights */}
      {ai_insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <span className="flex items-center gap-2">
                ✨ Sustainability Report
              </span>
              {ai_provider && (
                <Badge 
                  variant={ai_provider === 'openrouter' ? 'default' : ai_provider === 'bedrock' ? 'secondary' : 'outline'}
                  className="font-normal"
                >
                  {ai_provider === 'openrouter' && '🤖 AI-Powered'}
                  {ai_provider === 'bedrock' && '☁️ AWS AI'}
                  {ai_provider === 'template' && '📋 Standard Report'}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {ai_provider === 'openrouter' && 'Personalized recommendations powered by Claude 3.5 Sonnet'}
              {ai_provider === 'bedrock' && 'AI-generated insights via AWS Bedrock'}
              {ai_provider === 'template' && 'Automated analysis based on your simulation data'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{ai_insights}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Region Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Regions Comparison</CardTitle>
          <CardDescription>Detailed breakdown of emissions and costs across all regions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Region</th>
                  <th className="text-left py-2 px-3">Country</th>
                  <th className="text-right py-2 px-3">Grid Intensity</th>
                  <th className="text-right py-2 px-3">CO₂/month</th>
                  <th className="text-right py-2 px-3">Cost/month</th>
                  <th className="text-right py-2 px-3">CO₂ Savings</th>
                </tr>
              </thead>
              <tbody>
                {allRegions
                  .sort((a, b) => a.carbon_emissions_kg - b.carbon_emissions_kg)
                  .map((region) => (
                    <tr
                      key={region.region_code}
                      className={`border-b ${region.is_current_region ? 'bg-amber-50 dark:bg-amber-950/20' : ''}`}
                    >
                      <td className="py-2 px-3 font-medium">
                        {region.region_name}
                        {region.is_current_region && (
                          <Badge variant="outline" className="ml-2 text-xs">Current</Badge>
                        )}
                        {region.is_lowest_carbon && (
                          <Badge className="ml-2 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            🌱 Lowest CO₂
                          </Badge>
                        )}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">{region.country}</td>
                      <td className="py-2 px-3 text-right font-mono">
                        {region.carbon_intensity_gco2_kwh} g/kWh
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {region.carbon_emissions_kg} kg
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        ${region.monthly_cost_usd}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {region.carbon_savings_percent > 0 ? (
                          <span className="text-green-600 font-medium">
                            -{region.carbon_savings_percent}%
                          </span>
                        ) : region.is_current_region ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span className="text-red-600 font-medium">
                            +{Math.abs(region.carbon_savings_percent)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
