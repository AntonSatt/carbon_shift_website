"""
CarbonShift Simulator - Instance Power Models

Contains power consumption data (Idle/Max watts) for various AWS instance types.
Based on empirical measurements and cloud carbon footprint research.
"""

from pydantic import BaseModel
from typing import Dict


class InstancePowerProfile(BaseModel):
    """Power profile for a cloud instance type."""
    instance_type: str
    vcpus: int
    memory_gb: float
    idle_watts: float
    max_watts: float
    
    def calculate_power(self, cpu_utilization: float) -> float:
        """
        Calculate power consumption using linear interpolation.
        
        Power = Idle_Watts + (Max_Watts - Idle_Watts) * Utilization
        
        Args:
            cpu_utilization: CPU utilization as percentage (0-100)
            
        Returns:
            Power consumption in watts
        """
        utilization = min(max(cpu_utilization, 0), 100) / 100.0
        return self.idle_watts + (self.max_watts - self.idle_watts) * utilization


# AWS Instance Power Profiles
# Power estimates based on SPECpower and cloud carbon footprint research
AWS_INSTANCE_PROFILES: Dict[str, InstancePowerProfile] = {
    # T3 Series (Burstable)
    "t3.micro": InstancePowerProfile(
        instance_type="t3.micro",
        vcpus=2,
        memory_gb=1.0,
        idle_watts=3.5,
        max_watts=18.0
    ),
    "t3.small": InstancePowerProfile(
        instance_type="t3.small",
        vcpus=2,
        memory_gb=2.0,
        idle_watts=4.5,
        max_watts=22.0
    ),
    "t3.medium": InstancePowerProfile(
        instance_type="t3.medium",
        vcpus=2,
        memory_gb=4.0,
        idle_watts=6.0,
        max_watts=28.0
    ),
    "t3.large": InstancePowerProfile(
        instance_type="t3.large",
        vcpus=2,
        memory_gb=8.0,
        idle_watts=8.0,
        max_watts=35.0
    ),
    "t3.xlarge": InstancePowerProfile(
        instance_type="t3.xlarge",
        vcpus=4,
        memory_gb=16.0,
        idle_watts=12.0,
        max_watts=55.0
    ),
    
    # M5 Series (General Purpose)
    "m5.large": InstancePowerProfile(
        instance_type="m5.large",
        vcpus=2,
        memory_gb=8.0,
        idle_watts=12.0,
        max_watts=45.0
    ),
    "m5.xlarge": InstancePowerProfile(
        instance_type="m5.xlarge",
        vcpus=4,
        memory_gb=16.0,
        idle_watts=18.0,
        max_watts=75.0
    ),
    "m5.2xlarge": InstancePowerProfile(
        instance_type="m5.2xlarge",
        vcpus=8,
        memory_gb=32.0,
        idle_watts=30.0,
        max_watts=130.0
    ),
    "m5.4xlarge": InstancePowerProfile(
        instance_type="m5.4xlarge",
        vcpus=16,
        memory_gb=64.0,
        idle_watts=55.0,
        max_watts=240.0
    ),
    
    # C5 Series (Compute Optimized)
    "c5.large": InstancePowerProfile(
        instance_type="c5.large",
        vcpus=2,
        memory_gb=4.0,
        idle_watts=10.0,
        max_watts=50.0
    ),
    "c5.xlarge": InstancePowerProfile(
        instance_type="c5.xlarge",
        vcpus=4,
        memory_gb=8.0,
        idle_watts=16.0,
        max_watts=85.0
    ),
    "c5.2xlarge": InstancePowerProfile(
        instance_type="c5.2xlarge",
        vcpus=8,
        memory_gb=16.0,
        idle_watts=28.0,
        max_watts=150.0
    ),
    
    # R5 Series (Memory Optimized)
    "r5.large": InstancePowerProfile(
        instance_type="r5.large",
        vcpus=2,
        memory_gb=16.0,
        idle_watts=14.0,
        max_watts=52.0
    ),
    "r5.xlarge": InstancePowerProfile(
        instance_type="r5.xlarge",
        vcpus=4,
        memory_gb=32.0,
        idle_watts=22.0,
        max_watts=88.0
    ),
    "r5.2xlarge": InstancePowerProfile(
        instance_type="r5.2xlarge",
        vcpus=8,
        memory_gb=64.0,
        idle_watts=38.0,
        max_watts=155.0
    ),
}


def get_instance_profile(instance_type: str) -> InstancePowerProfile | None:
    """Get the power profile for an instance type."""
    return AWS_INSTANCE_PROFILES.get(instance_type)


def get_available_instances() -> list[str]:
    """Get list of all available instance types."""
    return list(AWS_INSTANCE_PROFILES.keys())
