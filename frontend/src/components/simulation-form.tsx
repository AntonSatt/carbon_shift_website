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
import { Loader2, Cloud, MapPin, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
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
      <CardHeader className="pb-3 gap-1">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Cloud className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
          Configure Your Workload
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Set up your cloud infrastructure to analyze carbon impact
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cloud Provider & Instance Type - 2 column */}
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <Label htmlFor="cloud-provider" className="text-xs font-medium mb-1.5 block">
                Cloud Provider
              </Label>
              <Select value={cloudProvider} onValueChange={setCloudProvider}>
                <SelectTrigger id="cloud-provider" className="h-9 w-full">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aws">
                    <span className="flex items-center gap-2">
                      <span>☁️</span>
                      <span>AWS</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="azure" disabled>
                    <span className="text-muted-foreground">Azure (Soon)</span>
                  </SelectItem>
                  <SelectItem value="gcp" disabled>
                    <span className="text-muted-foreground">GCP (Soon)</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="min-w-0">
              <Label htmlFor="instance-type" className="text-xs font-medium mb-1.5 block">
                Instance Type
              </Label>
              <Select value={instanceType} onValueChange={setInstanceType}>
                <SelectTrigger id="instance-type" className="h-9 w-full">
                  <SelectValue placeholder="Select instance" />
                </SelectTrigger>
                <SelectContent>
                  {availableInstances.map((instance) => (
                    <SelectItem key={instance.instance_type} value={instance.instance_type}>
                      <span className="font-mono text-xs">{instance.instance_type}</span>
                      <span className="ml-1 text-muted-foreground text-xs">
                        ({instance.vcpus}vCPU, {instance.memory_gb}GB)
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Instance Count & Hours - 2 column */}
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <Label htmlFor="instance-count" className="text-xs font-medium mb-1.5 block">
                Instances
              </Label>
              <Input
                id="instance-count"
                type="number"
                min={1}
                max={1000}
                value={instanceCount}
                onChange={(e) => setInstanceCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="h-9 w-full"
              />
            </div>
            <div className="min-w-0">
              <Label htmlFor="hours" className="text-xs font-medium mb-1.5 block">
                Hours/Month
              </Label>
              <Input
                id="hours"
                type="number"
                min={1}
                max={744}
                value={hoursPerMonth}
                onChange={(e) => setHoursPerMonth(Math.min(744, Math.max(1, parseInt(e.target.value) || 730)))}
                className="h-9 w-full"
              />
            </div>
          </div>

          {/* CPU Utilization - Compact */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs font-medium">CPU Utilization</Label>
              <span className="text-xs font-mono text-muted-foreground">{cpuUtilization}%</span>
            </div>
            <Slider
              value={[cpuUtilization]}
              onValueChange={(value) => setCpuUtilization(value[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Current Region */}
          <div>
            <Label htmlFor="region" className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-red-500" />
              Current Region
            </Label>
            <Select value={currentRegion} onValueChange={setCurrentRegion}>
              <SelectTrigger id="region" className="h-9">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {availableRegions.map((region) => (
                  <SelectItem key={region.region_code} value={region.region_code}>
                    <span className="font-medium">{region.region_name}</span>
                    <span className="ml-1 text-muted-foreground text-xs">({region.country})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User Location */}
          <div>
            <Label htmlFor="user-location" className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-purple-500" />
              Your Location
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="user-location"
              type="text"
              placeholder="e.g., Germany, Finland, USA"
              value={userLocation}
              onChange={(e) => setUserLocation(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Advanced Options - More compact toggle */}
          <div className="border-t pt-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors w-full justify-between py-2 px-3 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/30"
            >
              <span className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                <span>Priority Settings</span>
                <span className="text-xs font-normal text-muted-foreground">(customize weighting)</span>
              </span>
              {showAdvanced ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-primary" />}
            </button>
            
            {showAdvanced && (
              <div className="mt-3 space-y-3 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Adjust how recommendations are weighted:
                </p>
                
                {/* Priority Sliders - Compact 2x2 grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs">🌱 Carbon</span>
                      <span className="text-xs font-mono text-muted-foreground">{Math.round(priorities.carbon * 100)}%</span>
                    </div>
                    <Slider
                      value={[priorities.carbon * 100]}
                      onValueChange={(value) => setPriorities({ ...priorities, carbon: value[0] / 100 })}
                      min={0}
                      max={100}
                      step={10}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs">💰 Cost</span>
                      <span className="text-xs font-mono text-muted-foreground">{Math.round(priorities.price * 100)}%</span>
                    </div>
                    <Slider
                      value={[priorities.price * 100]}
                      onValueChange={(value) => setPriorities({ ...priorities, price: value[0] / 100 })}
                      min={0}
                      max={100}
                      step={10}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs">⚡ Latency</span>
                      <span className="text-xs font-mono text-muted-foreground">{Math.round(priorities.latency * 100)}%</span>
                    </div>
                    <Slider
                      value={[priorities.latency * 100]}
                      onValueChange={(value) => setPriorities({ ...priorities, latency: value[0] / 100 })}
                      min={0}
                      max={100}
                      step={10}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs">🔒 Compliance</span>
                      <span className="text-xs font-mono text-muted-foreground">{Math.round(priorities.compliance * 100)}%</span>
                    </div>
                    <Slider
                      value={[priorities.compliance * 100]}
                      onValueChange={(value) => setPriorities({ ...priorities, compliance: value[0] / 100 })}
                      min={0}
                      max={100}
                      step={10}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setPriorities({ carbon: 1.0, price: 0.6, latency: 0.3, compliance: 0.2 })}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Reset defaults
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            size="default"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
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
