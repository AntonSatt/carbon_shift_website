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
import { Loader2, Zap, Cloud, MapPin, Clock } from 'lucide-react';
import { SimulationRequest, InstanceInfo, RegionInfo } from '@/lib/types';

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
  const [instanceType, setInstanceType] = useState('t3.micro');
  const [instanceCount, setInstanceCount] = useState(1);
  const [cpuUtilization, setCpuUtilization] = useState(50);
  const [hoursPerMonth, setHoursPerMonth] = useState(730);
  const [currentRegion, setCurrentRegion] = useState('eu-central-1');

  const availableInstances = instances || DEFAULT_INSTANCES;
  const availableRegions = regions || DEFAULT_REGIONS;

  const selectedInstance = availableInstances.find((i) => i.instance_type === instanceType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      cloud_provider: 'aws',
      instance_type: instanceType,
      instance_count: instanceCount,
      cpu_utilization: cpuUtilization,
      hours_per_month: hoursPerMonth,
      current_region: currentRegion,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-blue-500" />
          Configure Your Workload
        </CardTitle>
        <CardDescription>
          Enter your cloud infrastructure details to simulate carbon emissions and costs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Instance Type */}
          <div className="space-y-2">
            <Label htmlFor="instance-type" className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Instance Type
            </Label>
            <Select value={instanceType} onValueChange={setInstanceType}>
              <SelectTrigger id="instance-type">
                <SelectValue placeholder="Select instance type" />
              </SelectTrigger>
              <SelectContent>
                {availableInstances.map((instance) => (
                  <SelectItem key={instance.instance_type} value={instance.instance_type}>
                    <span className="font-mono">{instance.instance_type}</span>
                    <span className="ml-2 text-muted-foreground">
                      ({instance.vcpus} vCPU, {instance.memory_gb}GB RAM)
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
            <Label htmlFor="hours" className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
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
            <Label htmlFor="region" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-500" />
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
                    <span className="ml-2 text-muted-foreground">
                      ({region.country}) – {region.carbon_intensity_gco2_kwh} gCO₂/kWh
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
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
