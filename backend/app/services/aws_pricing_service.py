"""
CarbonShift Simulator - AWS Pricing Service

Fetches real-time EC2 pricing from AWS Price List API.
Caches prices locally and refreshes once per day.
"""

import os
import json
import boto3
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Optional
from app.data.pricing import AWS_BASE_PRICING, REGION_PRICE_MULTIPLIERS


# Cache file location
CACHE_DIR = Path(__file__).parent.parent / "cache"
PRICE_CACHE_FILE = CACHE_DIR / "ec2_prices.json"
CACHE_EXPIRY_HOURS = 24


class AWSPricingService:
    """Service for fetching EC2 prices from AWS Price List API."""
    
    def __init__(self):
        self.enabled = self._check_credentials()
        self.client = None
        self._cached_prices: Dict[str, Dict[str, float]] = {}
        self._cache_timestamp: Optional[datetime] = None
        
        if self.enabled:
            try:
                # Price List API must be called from us-east-1
                self.client = boto3.client(
                    'pricing',
                    region_name='us-east-1',
                    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                )
                print("✓ AWS Pricing API initialized")
            except Exception as e:
                print(f"✗ Failed to initialize AWS Pricing client: {e}")
                self.enabled = False
        
        # Load cached prices on startup
        self._load_cache()
    
    def _check_credentials(self) -> bool:
        """Check if AWS credentials are configured."""
        access_key = os.getenv('AWS_ACCESS_KEY_ID')
        secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        return bool(access_key and secret_key)
    
    def _load_cache(self):
        """Load prices from cache file if valid."""
        if not PRICE_CACHE_FILE.exists():
            return
        
        try:
            with open(PRICE_CACHE_FILE, 'r') as f:
                data = json.load(f)
            
            cache_time = datetime.fromisoformat(data.get('timestamp', '2000-01-01'))
            if datetime.now() - cache_time < timedelta(hours=CACHE_EXPIRY_HOURS):
                self._cached_prices = data.get('prices', {})
                self._cache_timestamp = cache_time
                print(f"✓ Loaded {len(self._cached_prices)} cached prices from {cache_time}")
        except Exception as e:
            print(f"✗ Failed to load price cache: {e}")
    
    def _save_cache(self):
        """Save prices to cache file."""
        try:
            CACHE_DIR.mkdir(parents=True, exist_ok=True)
            with open(PRICE_CACHE_FILE, 'w') as f:
                json.dump({
                    'timestamp': datetime.now().isoformat(),
                    'prices': self._cached_prices,
                }, f, indent=2)
            print(f"✓ Saved {len(self._cached_prices)} prices to cache")
        except Exception as e:
            print(f"✗ Failed to save price cache: {e}")
    
    def _is_cache_valid(self) -> bool:
        """Check if cache is still valid."""
        if not self._cache_timestamp:
            return False
        return datetime.now() - self._cache_timestamp < timedelta(hours=CACHE_EXPIRY_HOURS)
    
    def _get_region_name(self, region_code: str) -> str:
        """Convert region code to AWS region name for pricing API."""
        region_names = {
            'us-east-1': 'US East (N. Virginia)',
            'us-east-2': 'US East (Ohio)',
            'us-west-1': 'US West (N. California)',
            'us-west-2': 'US West (Oregon)',
            'ca-central-1': 'Canada (Central)',
            'eu-west-1': 'EU (Ireland)',
            'eu-west-2': 'EU (London)',
            'eu-west-3': 'EU (Paris)',
            'eu-central-1': 'EU (Frankfurt)',
            'eu-central-2': 'EU (Zurich)',
            'eu-north-1': 'EU (Stockholm)',
            'eu-south-1': 'EU (Milan)',
            'ap-northeast-1': 'Asia Pacific (Tokyo)',
            'ap-northeast-2': 'Asia Pacific (Seoul)',
            'ap-southeast-1': 'Asia Pacific (Singapore)',
            'ap-southeast-2': 'Asia Pacific (Sydney)',
            'ap-south-1': 'Asia Pacific (Mumbai)',
            'sa-east-1': 'South America (Sao Paulo)',
        }
        return region_names.get(region_code, region_code)
    
    def fetch_instance_price(self, instance_type: str, region_code: str) -> Optional[float]:
        """
        Fetch the hourly price for an EC2 instance from AWS API.
        
        Args:
            instance_type: EC2 instance type (e.g., 't3.micro')
            region_code: AWS region code (e.g., 'us-east-1')
            
        Returns:
            Price in USD per hour, or None if not available
        """
        if not self.enabled or not self.client:
            return None
        
        cache_key = f"{region_code}:{instance_type}"
        
        # Return cached price if valid
        if self._is_cache_valid() and cache_key in self._cached_prices:
            return self._cached_prices[cache_key]
        
        try:
            region_name = self._get_region_name(region_code)
            
            response = self.client.get_products(
                ServiceCode='AmazonEC2',
                Filters=[
                    {'Type': 'TERM_MATCH', 'Field': 'instanceType', 'Value': instance_type},
                    {'Type': 'TERM_MATCH', 'Field': 'location', 'Value': region_name},
                    {'Type': 'TERM_MATCH', 'Field': 'operatingSystem', 'Value': 'Linux'},
                    {'Type': 'TERM_MATCH', 'Field': 'tenancy', 'Value': 'Shared'},
                    {'Type': 'TERM_MATCH', 'Field': 'preInstalledSw', 'Value': 'NA'},
                    {'Type': 'TERM_MATCH', 'Field': 'capacitystatus', 'Value': 'Used'},
                ],
                MaxResults=10
            )
            
            for price_item in response.get('PriceList', []):
                product = json.loads(price_item)
                terms = product.get('terms', {}).get('OnDemand', {})
                
                for term in terms.values():
                    for price_dimension in term.get('priceDimensions', {}).values():
                        price_per_unit = price_dimension.get('pricePerUnit', {})
                        usd_price = price_per_unit.get('USD')
                        
                        if usd_price:
                            price = float(usd_price)
                            # Cache the price
                            self._cached_prices[cache_key] = price
                            return price
            
            return None
            
        except Exception as e:
            print(f"✗ Error fetching price for {instance_type} in {region_code}: {e}")
            return None
    
    def refresh_all_prices(self, instance_types: list[str], region_codes: list[str]) -> Dict[str, Dict[str, float]]:
        """
        Refresh prices for all instance types and regions.
        Call this once per day to update the cache.
        
        Returns:
            Dict mapping region_code -> {instance_type -> price}
        """
        if not self.enabled:
            print("AWS Pricing API not enabled, using static prices")
            return {}
        
        print(f"Refreshing prices for {len(instance_types)} instances across {len(region_codes)} regions...")
        
        prices_by_region: Dict[str, Dict[str, float]] = {}
        fetched_count = 0
        
        for region_code in region_codes:
            prices_by_region[region_code] = {}
            
            for instance_type in instance_types:
                price = self.fetch_instance_price(instance_type, region_code)
                if price is not None:
                    prices_by_region[region_code][instance_type] = price
                    fetched_count += 1
        
        # Update cache timestamp and save
        self._cache_timestamp = datetime.now()
        self._save_cache()
        
        print(f"✓ Fetched {fetched_count} prices")
        return prices_by_region
    
    def get_price(self, instance_type: str, region_code: str) -> float:
        """
        Get the price for an instance, using cache or falling back to static prices.
        
        Args:
            instance_type: EC2 instance type
            region_code: AWS region code
            
        Returns:
            Price in USD per hour
        """
        cache_key = f"{region_code}:{instance_type}"
        
        # Try cached AWS price first
        if cache_key in self._cached_prices:
            return self._cached_prices[cache_key]
        
        # Try fetching from API if enabled
        if self.enabled and self.client:
            price = self.fetch_instance_price(instance_type, region_code)
            if price is not None:
                return price
        
        # Fall back to static pricing
        base_price = AWS_BASE_PRICING.get(instance_type)
        if base_price is None:
            return 0.0
        
        multiplier = REGION_PRICE_MULTIPLIERS.get(region_code, 1.10)
        return round(base_price * multiplier, 4)
    
    def get_monthly_cost(self, instance_type: str, region_code: str, hours_per_month: float, instance_count: int = 1) -> float:
        """
        Calculate the monthly cost for instances.
        
        Args:
            instance_type: The EC2 instance type
            region_code: The AWS region code
            hours_per_month: Hours the instances run per month
            instance_count: Number of instances
            
        Returns:
            Monthly cost in USD
        """
        hourly_price = self.get_price(instance_type, region_code)
        return round(hourly_price * hours_per_month * instance_count, 2)


# Singleton instance
aws_pricing_service = AWSPricingService()
