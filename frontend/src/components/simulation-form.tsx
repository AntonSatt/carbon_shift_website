'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Zap, Cloud, MapPin, Clock, Server, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { SimulationRequest, InstanceInfo, RegionInfo, PriorityPreferences } from '@/lib/types';

// Static data for when API is not available
const DEFAULT_INSTANCES: InstanceInfo[] = [
  { instance_type: 't3.micro', vcpus: 2, memory_gb: 1, idle_watts: 3.5, max_watts: 18 },
  { instance_type: 't3.small', vcpus: 2, memory_gb: 2, idle_watts: 4.5, max_watts: 22 },
  { instance_type: 't3.medium', vcpus: 2, memory_gb: 4, idle_watts: 6, max_watts: 28 },
  { instance_type: 't3.large', vcpus: 2, memory_gb: 8, idle_watts: 8, max_watts: 35 },
  { instance_type: 'm5.large', vcpus: 2, memory_gb: 8, idle_watts: 12, max_watts: 45 },
  { instance_type: 'm5.xlarge', vcpus: 4, memory_gb: 16, idle_watts: 18, max_watts: 75 },
  { instance_type: 'm5.2xlarge', vcpus: 8, memory_gb: 32, idle_watts: 30, max_watts: 130 },
  { instance_type: 'c5.large', vcpus: 2, memory_gb: 4, idle_watts: 10, max_watts: 50 },
  { instance_type: 'c5.xlarge', vcpus: 4, memory_gb: 8, idle_watts: 16, max_watts: 85 },
  { instance_type: 'r5.large', vcpus: 2, memory_gb: 16, idle_watts: 14, max_watts: 52 },
];

const DEFAULT_REGIONS: RegionInfo[] = [
  { region_code: 'eu-central-1', region_name: 'Frankfurt', country: 'Germany', carbon_intensity_gco2_kwh: 385 },
  { region_code: 'eu-west-1', region_name: 'Ireland', country: 'Ireland', carbon_intensity_gco2_kwh: 296 },
  { region_code: 'eu-west-2', region_name: 'London', country: 'United Kingdom', carbon_intensity_gco2_kwh: 233 },
  { region_code: 'eu-west-3', region_name: 'Paris', country: 'France', carbon_intensity_gco2_kwh: 56 },
  { region_code: 'eu-north-1', region_name: 'Stockholm', country: 'Sweden', carbon_intensity_gco2_kwh: 45 },
  { region_code: 'us-east-1', region_name: 'N. Virginia', country: 'United States', carbon_intensity_gco2_kwh: 378 },
  { region_code: 'us-west-2', region_name: 'Oregon', country: 'United States', carbon_intensity_gco2_kwh: 115 },
  { region_code: 'ca-central-1', region_name: 'Montreal', country: 'Canada', carbon_intensity_gco2_kwh: 25 },
  { region_code: 'ap-southeast-2', region_name: 'Sydney', country: 'Australia', carbon_intensity_gco2_kwh: 660 },
];

interface SimulationFormProps {
  onSubmit: (request: SimulationRequest) => void;
  isLoading: boolean;
  instances?: InstanceInfo[];
  regions?: RegionInfo[];
}

export function SimulationForm({ onSubmit, isLoading, instances, regions }: SimulationFormProps) {
  // Cloud provider state
  const [cloudProvider, setCloudProvider] = useState('aws');
  
  // Default to m5.large - a good general-purpose instance for medium companies
  const [instanceType, setInstanceType] = useState('m5.large');
  const [instanceCount, setInstanceCount] = useState(1);
  const [cpuUtilization, setCpuUtilization] = useState(50);
  const [hoursPerMonth, setHoursPerMonth] = useState(730);
  const [currentRegion, setCurrentRegion] = useState('eu-central-1');
  const [userLocation, setUserLocation] = useState('');
  
  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priorities, setPriorities] = useState<PriorityPreferences>({
    carbon: 1.0,
    price: 0.6,
    latency: 0.3,
    compliance: 0.2,
  });

  const availableInstances = instances || DEFAULT_INSTANCES;
  const availableRegions = regions || DEFAULT_REGIONS;

  const selectedInstance = availableInstances.find((i) => i.instance_type === instanceType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      cloud_provider: cloudProvider,
      instance_type: instanceType,
      instance_count: instanceCount,
      cpu_utilization: cpuUtilization,
      hours_per_month: hoursPerMonth,
      current_region: currentRegion,
      user_location: userLocation || undefined,
      priorities: showAdvanced ? priorities : undefined,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 sm:pb-3 gap-1.5">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Cloud className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
          Configure Your Workload
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Enter your cloud infrastructure details to simulate carbon emissions and costs
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-4 sm:pb-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Cloud Provider */}
          <div>
            <Label htmlFor="cloud-provider" className="flex items-center gap-2 text-sm mb-1.5">
              <Server className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
              Cloud Provider
            </Label>
            <Select value={cloudProvider} onValueChange={setCloudProvider}>
              <SelectTrigger id="cloud-provider">
                <SelectValue placeholder="Select cloud provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aws">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">☁️</span>
                    <span className="font-medium">Amazon Web Services (AWS)</span>
                  </div>
                </SelectItem>
                <SelectItem value="azure" disabled>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔷</span>
                    <span className="font-medium text-muted-foreground">Microsoft Azure</span>
                    <span className="text-xs text-muted-foreground">(Coming Soon)</span>
                  </div>
                </SelectItem>
                <SelectItem value="gcp" disabled>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌐</span>
                    <span className="font-medium text-muted-foreground">Google Cloud Platform</span>
                    <span className="text-xs text-muted-foreground">(Coming Soon)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Instance Type */}
          <div className="space-y-2">
            <Label htmlFor="instance-type" className="flex items-center gap-2 text-sm">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
              Instance Type
            </Label>
            <Select value={instanceType} onValueChange={setInstanceType}>
              <SelectTrigger id="instance-type">
                <SelectValue placeholder="Select instance type" />
              </SelectTrigger>
              <SelectContent>
                {availableInstances.map((instance) => (
                  <SelectItem key={instance.instance_type} value={instance.instance_type}>
                    <span className="font-mono text-sm">{instance.instance_type}</span>
                    <span className="ml-2 text-muted-foreground text-xs sm:text-sm">
                      ({instance.vcpus} vCPU, {instance.memory_gb}GB)
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedInstance && (
              <p className="text-sm text-muted-foreground">
                Power: {selectedInstance.idle_watts}W idle – {selectedInstance.max_watts}W max
              </p>
            )}
          </div>

          {/* Instance Count */}
          <div className="space-y-2">
            <Label htmlFor="instance-count">Number of Instances</Label>
            <Input
              id="instance-count"
              type="number"
              min={1}
              max={1000}
              value={instanceCount}
              onChange={(e) => setInstanceCount(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          {/* CPU Utilization */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Average CPU Utilization</span>
              <span className="font-mono text-sm">{cpuUtilization}%</span>
            </Label>
            <Slider
              value={[cpuUtilization]}
              onValueChange={(value) => setCpuUtilization(value[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Idle (0%)</span>
              <span>Heavy (100%)</span>
            </div>
          </div>

          {/* Hours per Month */}
          <div className="space-y-2">
            <Label htmlFor="hours" className="flex items-center gap-2 text-sm">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
              Hours Running per Month
            </Label>
            <Input
              id="hours"
              type="number"
              min={1}
              max={744}
              value={hoursPerMonth}
              onChange={(e) => setHoursPerMonth(Math.min(744, Math.max(1, parseInt(e.target.value) || 730)))}
            />
            <p className="text-sm text-muted-foreground">
              {hoursPerMonth === 730 || hoursPerMonth === 744
                ? '24/7 operation (full month)'
                : `~${Math.round((hoursPerMonth / 730) * 100)}% uptime`}
            </p>
          </div>

          {/* Current Region */}
          <div className="space-y-2">
            <Label htmlFor="region" className="flex items-center gap-2 text-sm">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
              Current Region
            </Label>
            <Select value={currentRegion} onValueChange={setCurrentRegion}>
              <SelectTrigger id="region">
                <SelectValue placeholder="Select current region" />
              </SelectTrigger>
              <SelectContent>
                {availableRegions.map((region) => (
                  <SelectItem key={region.region_code} value={region.region_code}>
                    <span className="font-medium">{region.region_name}</span>
                    <span className="ml-1 sm:ml-2 text-muted-foreground text-xs">
                      ({region.country})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User Location */}
          <div className="space-y-2">
            <Label htmlFor="user-location" className="flex items-center gap-2 text-sm">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
              Your Location (Optional)
            </Label>
            <Input
              id="user-location"
              type="text"
              placeholder="e.g., United States, Germany, Singapore"
              value={userLocation}
              onChange={(e) => setUserLocation(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Get personalized recommendations based on latency and regional compliance
            </p>
          </div>

          {/* Advanced Options Toggle */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Advanced Options
              </span>
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-3">
                  Customize how recommendations are weighted. Higher values = more importance.
                </p>
                
                {/* Carbon Priority */}
                <div className="space-y-2">
                  <Label className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      🌱 Carbon Reduction
                    </span>
                    <span className="font-mono text-xs">{Math.round(priorities.carbon * 100)}%</span>
                  </Label>
                  <Slider
                    value={[priorities.carbon * 100]}
                    onValueChange={(value) => setPriorities({ ...priorities, carbon: value[0] / 100 })}
                    min={0}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
                
                {/* Price Priority */}
                <div className="space-y-2">
                  <Label className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      💰 Cost Savings
                    </span>
                    <span className="font-mono text-xs">{Math.round(priorities.price * 100)}%</span>
                  </Label>
                  <Slider
                    value={[priorities.price * 100]}
                    onValueChange={(value) => setPriorities({ ...priorities, price: value[0] / 100 })}
                    min={0}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
                
                {/* Latency Priority */}
                <div className="space-y-2">
                  <Label className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      ⚡ Low Latency
                    </span>
                    <span className="font-mono text-xs">{Math.round(priorities.latency * 100)}%</span>
                  </Label>
                  <Slider
                    value={[priorities.latency * 100]}
                    onValueChange={(value) => setPriorities({ ...priorities, latency: value[0] / 100 })}
                    min={0}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
                
                {/* Compliance Priority */}
                <div className="space-y-2">
                  <Label className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      🔒 Data Compliance
                    </span>
                    <span className="font-mono text-xs">{Math.round(priorities.compliance * 100)}%</span>
                  </Label>
                  <Slider
                    value={[priorities.compliance * 100]}
                    onValueChange={(value) => setPriorities({ ...priorities, compliance: value[0] / 100 })}
                    min={0}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
                
                {/* Reset Button */}
                <button
                  type="button"
                  onClick={() => setPriorities({ carbon: 1.0, price: 0.6, latency: 0.3, compliance: 0.2 })}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Reset to defaults
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Simulation...
              </>
            ) : (
              <>
                🌱 Calculate Carbon Impact
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
