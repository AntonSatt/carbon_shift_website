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
import { Leaf, Award, Car, TreePine, Smartphone } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ResultsDashboardProps {
  result: SimulationResponse;
}

export function ResultsDashboard({ result }: ResultsDashboardProps) {
  const { current_region_result, comparison_regions, best_carbon_region, equivalencies, ai_insights, ai_provider, ai_recommended_region } = result;

  // Use AI recommendation when available, fallback to lowest carbon region
  const recommended_region = ai_recommended_region || best_carbon_region;

  // Prepare chart data - include current region + all comparisons
  const allRegions = [current_region_result, ...comparison_regions];

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
    <div className="space-y-4 md:space-y-6">
      {/* AI Insights / Sustainability Report - Now at the top */}
      {ai_insights && (
        <Card className="overflow-hidden pt-0 gap-0">
          <CardHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-4 md:pb-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-500/5 dark:via-teal-500/5 dark:to-cyan-500/5 border-b border-border/50">
            <CardTitle className="flex flex-row items-center gap-2 justify-between">
              <span className="flex items-center gap-2">
                <span className="text-xl md:text-2xl">✨</span>
                <span className="inline-block font-bold text-base md:text-lg bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  Sustainability Report
                </span>
              </span>
              {ai_provider && (
                <Badge
                  variant={ai_provider === 'openrouter' ? 'default' : ai_provider === 'bedrock' ? 'secondary' : 'outline'}
                  className="font-normal text-xs"
                >
                  {ai_provider === 'openrouter' && '🤖 AI-Powered'}
                  {ai_provider === 'bedrock' && '☁️ AWS AI'}
                  {ai_provider === 'template' && '📋 Standard Report'}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {ai_provider === 'openrouter' && 'Personalized recommendations powered by advanced AI analysis'}
              {ai_provider === 'bedrock' && 'AI-generated insights via AWS Bedrock'}
              {ai_provider === 'template' && 'Automated analysis based on your simulation data'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6 pt-4 md:pt-6 pb-4 md:pb-6">
            <div className="ai-report-prose max-w-none text-sm leading-relaxed">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-base md:text-lg font-semibold mt-5 md:mt-6 mb-2 md:mb-3 pb-2 border-b border-border/50 first:mt-0">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm md:text-base font-semibold mt-4 md:mt-5 mb-2 text-foreground/90">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-3 md:mb-4 last:mb-0 text-muted-foreground leading-relaxed">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">
                      {children}
                    </strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-2 md:my-3 ml-4 space-y-1.5 md:space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-2 md:my-3 ml-4 space-y-1.5 md:space-y-2 list-decimal">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-muted-foreground pl-1 relative before:content-['•'] before:absolute before:-left-4 before:text-emerald-500 before:font-bold">
                      {children}
                    </li>
                  ),
                  em: ({ children }) => (
                    <em className="text-foreground/80 not-italic font-medium">
                      {children}
                    </em>
                  ),
                }}
              >
                {ai_insights}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards - 2 cards: Current Setup vs AI Recommended */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2">
        {/* Current Region */}
        <Card className="border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/20">
          <CardHeader className="p-4 md:p-6 pb-2">
            <CardDescription className="text-xs md:text-sm">Your Current Setup</CardDescription>
            <CardTitle className="text-base md:text-xl flex items-center gap-2">
              📍 {current_region_result.region_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
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

        {/* AI Recommended */}
        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
          <CardHeader className="p-4 md:p-6 pb-2">
            <CardDescription className="flex items-center gap-1 text-xs md:text-sm">
              <Leaf className="h-3 w-3 text-green-600" />
              AI Recommended
            </CardDescription>
            <CardTitle className="text-base md:text-xl flex items-center gap-2">
              🌱 {recommended_region.region_name}
              {recommended_region.is_current_region && <Badge variant="outline" className="text-xs">Current</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">CO₂/month</span>
                <span className="font-medium text-green-600">{recommended_region.carbon_emissions_kg} kg</span>
              </div>
              {!recommended_region.is_current_region && recommended_region.carbon_savings_kg > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CO₂ Savings</span>
                  <span className="font-medium text-green-600">
                    -{recommended_region.carbon_savings_kg} kg ({Math.abs(recommended_region.carbon_savings_percent)}%)
                  </span>
                </div>
              )}
              {!recommended_region.is_current_region && recommended_region.cost_savings_usd !== 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost Savings</span>
                  <span className={`font-medium ${recommended_region.cost_savings_usd > 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {recommended_region.cost_savings_usd > 0 ? '$' + recommended_region.cost_savings_usd + '/mo' : '+$' + Math.abs(recommended_region.cost_savings_usd) + '/mo'}
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
          <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Yearly Savings Potential
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              By switching to {recommended_region.region_name}, you could save {equivalencies.yearly_savings_kg} kg CO₂ per year
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Car className="h-7 w-7 md:h-8 md:w-8 text-blue-500 shrink-0" />
                <div>
                  <p className="font-bold text-base md:text-lg">{equivalencies.car_km_saved.toLocaleString()} km</p>
                  <p className="text-xs md:text-sm text-muted-foreground">of car driving avoided</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <TreePine className="h-7 w-7 md:h-8 md:w-8 text-green-500 shrink-0" />
                <div>
                  <p className="font-bold text-base md:text-lg">{equivalencies.tree_months.toLocaleString()}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">tree-months of absorption</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Smartphone className="h-7 w-7 md:h-8 md:w-8 text-purple-500 shrink-0" />
                <div>
                  <p className="font-bold text-base md:text-lg">{equivalencies.smartphone_charges.toLocaleString()}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">smartphone charges</p>
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
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
              <CardTitle className="text-base md:text-lg">CO₂ Emissions by Region (kg/month)</CardTitle>
              <CardDescription>
                <span className="inline-flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Lowest</span>
                  <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Current</span>
                  <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-400"></span> Others</span>
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div style={{ height: `${Math.max(300, allRegions.length * 35)}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={carbonChartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
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
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
              <CardTitle className="text-base md:text-lg">Monthly Cost by Region (USD)</CardTitle>
              <CardDescription>
                <span className="inline-flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Lowest</span>
                  <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Current</span>
                  <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-400"></span> Others</span>
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div style={{ height: `${Math.max(300, allRegions.length * 35)}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costChartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} />
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

      {/* Region Comparison Table - Desktop only */}
      <Card className="hidden md:block">
        <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">All Regions Comparison</CardTitle>
          <CardDescription>Detailed breakdown of emissions and costs across all regions</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
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
                      <td className="py-2.5 px-3 font-medium">
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
                      <td className="py-2.5 px-3 text-muted-foreground">{region.country}</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {region.carbon_intensity_gco2_kwh} g/kWh
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {region.carbon_emissions_kg} kg
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        ${region.monthly_cost_usd}
                      </td>
                      <td className="py-2.5 px-3 text-right">
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

      {/* Mobile Region Cards - Show on mobile only */}
      <div className="md:hidden space-y-2">
        <h3 className="text-sm font-semibold px-1">All Regions</h3>
        {allRegions
          .sort((a, b) => a.carbon_emissions_kg - b.carbon_emissions_kg)
          .map((region) => (
            <Card
              key={region.region_code}
              className={`${region.is_current_region ? 'border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-950/30' : ''} ${region.is_lowest_carbon ? 'border-green-300 dark:border-green-700' : ''}`}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium text-sm">{region.region_name}</span>
                    {region.is_lowest_carbon && <span className="ml-1">🌱</span>}
                    {region.is_current_region && <span className="ml-1 text-[10px] text-amber-600">(current)</span>}
                  </div>
                  {region.carbon_savings_percent > 0 ? (
                    <span className="text-xs font-medium text-green-600">-{region.carbon_savings_percent}%</span>
                  ) : region.carbon_savings_percent < 0 ? (
                    <span className="text-xs font-medium text-red-500">+{Math.abs(region.carbon_savings_percent)}%</span>
                  ) : null}
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block">CO₂</span>
                    <span className="font-mono font-medium">{region.carbon_emissions_kg} kg</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Cost</span>
                    <span className="font-mono font-medium">${region.monthly_cost_usd}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Grid</span>
                    <span className="font-mono font-medium">{region.carbon_intensity_gco2_kwh}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
