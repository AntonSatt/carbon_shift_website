"""
CarbonShift Simulator - AI Insights Service

Generates human-readable sustainability reports using LLMs.
Supports OpenRouter (recommended), Amazon Bedrock, and template fallback.
"""

import os
import json
import httpx
from typing import Optional
from app.models.schemas import SimulationResponse


class AIInsightsService:
    """Service for generating AI-powered sustainability insights."""
    
    # Mapping of countries/regions to their nearest AWS regions
    # Prioritizes low-carbon regions when multiple options exist
    COUNTRY_TO_NEARBY_REGIONS = {
        # ============ EUROPE ============
        # Nordic countries → Stockholm (eu-north-1) - very low carbon
        "finland": ["eu-north-1"],
        "sweden": ["eu-north-1"],
        "norway": ["eu-north-1"],
        "denmark": ["eu-north-1", "eu-central-1"],
        "iceland": ["eu-north-1", "eu-west-1"],
        
        # Western Europe
        "germany": ["eu-central-1"],
        "austria": ["eu-central-1"],
        "switzerland": ["eu-central-2"],
        "liechtenstein": ["eu-central-2"],
        "france": ["eu-west-3"],
        "monaco": ["eu-west-3"],
        "belgium": ["eu-west-3", "eu-central-1"],
        "luxembourg": ["eu-west-3", "eu-central-1"],
        "netherlands": ["eu-central-1", "eu-west-1"],
        "holland": ["eu-central-1", "eu-west-1"],
        
        # British Isles
        "united kingdom": ["eu-west-2"],
        "uk": ["eu-west-2"],
        "england": ["eu-west-2"],
        "scotland": ["eu-west-2"],
        "wales": ["eu-west-2"],
        "northern ireland": ["eu-west-1", "eu-west-2"],
        "ireland": ["eu-west-1"],
        "republic of ireland": ["eu-west-1"],
        
        # Southern Europe
        "italy": ["eu-south-1"],
        "san marino": ["eu-south-1"],
        "vatican": ["eu-south-1"],
        "spain": ["eu-west-3", "eu-south-1"],
        "portugal": ["eu-west-3", "eu-west-1"],
        "andorra": ["eu-west-3"],
        "malta": ["eu-south-1"],
        "greece": ["eu-south-1"],
        "cyprus": ["eu-south-1", "me-south-1"],
        
        # Central/Eastern Europe
        "poland": ["eu-central-1"],
        "czech republic": ["eu-central-1"],
        "czechia": ["eu-central-1"],
        "slovakia": ["eu-central-1"],
        "hungary": ["eu-central-1"],
        "slovenia": ["eu-central-1", "eu-south-1"],
        "croatia": ["eu-central-1", "eu-south-1"],
        "bosnia": ["eu-central-1"],
        "bosnia and herzegovina": ["eu-central-1"],
        "serbia": ["eu-central-1"],
        "montenegro": ["eu-south-1"],
        "albania": ["eu-south-1"],
        "north macedonia": ["eu-south-1"],
        "macedonia": ["eu-south-1"],
        "kosovo": ["eu-central-1"],
        "romania": ["eu-central-1"],
        "bulgaria": ["eu-central-1"],
        "moldova": ["eu-central-1"],
        
        # Baltic States
        "estonia": ["eu-north-1"],
        "latvia": ["eu-north-1"],
        "lithuania": ["eu-north-1", "eu-central-1"],
        
        # Eastern Europe
        "ukraine": ["eu-central-1"],
        "belarus": ["eu-central-1"],
        "russia": ["eu-north-1", "eu-central-1"],
        
        # ============ NORTH AMERICA ============
        "united states": ["us-west-2", "us-east-1"],  # Oregon first (low carbon)
        "usa": ["us-west-2", "us-east-1"],
        "us": ["us-west-2", "us-east-1"],
        "america": ["us-west-2", "us-east-1"],
        "canada": ["ca-central-1"],  # Montreal - very low carbon
        "mexico": ["us-west-1", "us-east-1"],
        
        # US States (for more specific matching)
        "california": ["us-west-1"],
        "oregon": ["us-west-2"],
        "washington": ["us-west-2"],
        "nevada": ["us-west-1", "us-west-2"],
        "arizona": ["us-west-1"],
        "texas": ["us-east-1"],
        "florida": ["us-east-1"],
        "new york": ["us-east-1"],
        "virginia": ["us-east-1"],
        "ohio": ["us-east-2"],
        "illinois": ["us-east-2"],
        "michigan": ["us-east-2", "ca-central-1"],
        
        # Canadian Provinces
        "ontario": ["ca-central-1"],
        "quebec": ["ca-central-1"],
        "british columbia": ["us-west-2", "ca-central-1"],
        "alberta": ["us-west-2", "ca-central-1"],
        
        # ============ SOUTH AMERICA ============
        "brazil": ["sa-east-1"],
        "argentina": ["sa-east-1"],
        "chile": ["sa-east-1"],
        "peru": ["sa-east-1"],
        "colombia": ["sa-east-1", "us-east-1"],
        "venezuela": ["sa-east-1", "us-east-1"],
        "ecuador": ["sa-east-1"],
        "bolivia": ["sa-east-1"],
        "paraguay": ["sa-east-1"],
        "uruguay": ["sa-east-1"],
        "guyana": ["sa-east-1"],
        "suriname": ["sa-east-1"],
        
        # ============ ASIA PACIFIC ============
        # East Asia
        "japan": ["ap-northeast-1"],
        "south korea": ["ap-northeast-2"],
        "korea": ["ap-northeast-2"],
        "taiwan": ["ap-northeast-1", "ap-southeast-1"],
        "china": ["ap-northeast-1", "ap-southeast-1"],
        "hong kong": ["ap-southeast-1", "ap-northeast-1"],
        "macau": ["ap-southeast-1"],
        "mongolia": ["ap-northeast-1"],
        
        # Southeast Asia
        "singapore": ["ap-southeast-1"],
        "malaysia": ["ap-southeast-1"],
        "indonesia": ["ap-southeast-1", "ap-southeast-2"],
        "thailand": ["ap-southeast-1"],
        "vietnam": ["ap-southeast-1"],
        "philippines": ["ap-southeast-1"],
        "myanmar": ["ap-southeast-1"],
        "burma": ["ap-southeast-1"],
        "cambodia": ["ap-southeast-1"],
        "laos": ["ap-southeast-1"],
        "brunei": ["ap-southeast-1"],
        "timor-leste": ["ap-southeast-2"],
        
        # South Asia
        "india": ["ap-south-1"],
        "pakistan": ["ap-south-1", "me-south-1"],
        "bangladesh": ["ap-south-1"],
        "sri lanka": ["ap-south-1"],
        "nepal": ["ap-south-1"],
        "bhutan": ["ap-south-1"],
        "maldives": ["ap-south-1"],
        "afghanistan": ["ap-south-1", "me-south-1"],
        
        # Oceania
        "australia": ["ap-southeast-2"],
        "new zealand": ["ap-southeast-2"],
        "fiji": ["ap-southeast-2"],
        "papua new guinea": ["ap-southeast-2"],
        "new caledonia": ["ap-southeast-2"],
        
        # ============ MIDDLE EAST ============
        "united arab emirates": ["me-south-1"],
        "uae": ["me-south-1"],
        "dubai": ["me-south-1"],
        "saudi arabia": ["me-south-1"],
        "qatar": ["me-south-1"],
        "kuwait": ["me-south-1"],
        "bahrain": ["me-south-1"],
        "oman": ["me-south-1"],
        "yemen": ["me-south-1"],
        "iraq": ["me-south-1"],
        "iran": ["me-south-1"],
        "jordan": ["me-south-1"],
        "lebanon": ["me-south-1"],
        "syria": ["me-south-1"],
        "israel": ["me-south-1", "eu-south-1"],
        "palestine": ["me-south-1"],
        "turkey": ["eu-south-1", "me-south-1"],
        
        # ============ AFRICA ============
        # North Africa
        "egypt": ["me-south-1", "eu-south-1"],
        "libya": ["eu-south-1"],
        "tunisia": ["eu-south-1"],
        "algeria": ["eu-south-1", "eu-west-3"],
        "morocco": ["eu-west-3", "eu-south-1"],
        
        # Sub-Saharan Africa
        "south africa": ["af-south-1"],
        "nigeria": ["eu-west-1", "af-south-1"],
        "kenya": ["af-south-1", "me-south-1"],
        "ethiopia": ["me-south-1", "af-south-1"],
        "ghana": ["eu-west-1"],
        "senegal": ["eu-west-1"],
        "tanzania": ["af-south-1"],
        "uganda": ["af-south-1"],
        "rwanda": ["af-south-1"],
        "angola": ["af-south-1"],
        "mozambique": ["af-south-1"],
        "zimbabwe": ["af-south-1"],
        "botswana": ["af-south-1"],
        "namibia": ["af-south-1"],
        "zambia": ["af-south-1"],
        "malawi": ["af-south-1"],
        "democratic republic of congo": ["af-south-1"],
        "drc": ["af-south-1"],
        "congo": ["af-south-1"],
        "cameroon": ["eu-west-1", "af-south-1"],
        "ivory coast": ["eu-west-1"],
        "cote d'ivoire": ["eu-west-1"],
        
        # ============ CENTRAL AMERICA & CARIBBEAN ============
        "panama": ["us-east-1", "sa-east-1"],
        "costa rica": ["us-east-1"],
        "nicaragua": ["us-east-1"],
        "honduras": ["us-east-1"],
        "guatemala": ["us-east-1"],
        "el salvador": ["us-east-1"],
        "belize": ["us-east-1"],
        "jamaica": ["us-east-1"],
        "cuba": ["us-east-1"],
        "haiti": ["us-east-1"],
        "dominican republic": ["us-east-1"],
        "puerto rico": ["us-east-1"],
        "bahamas": ["us-east-1"],
        "trinidad and tobago": ["sa-east-1", "us-east-1"],
        "barbados": ["us-east-1", "sa-east-1"],
    }
    
    # Default priority weights (carbon is most important)
    DEFAULT_PRIORITIES = {
        "carbon": 1.0,      # Most important
        "price": 0.6,       # Second priority
        "latency": 0.3,     # Third priority
        "compliance": 0.2,  # Fourth priority
    }
    
    def __init__(self):
        # Check for OpenRouter (recommended)
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        self.openrouter_app_url = os.getenv("OPENROUTER_APP_URL", "http://localhost:3000")
        self.openrouter_model = os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-20b:free")
        self.use_openrouter = bool(self.openrouter_api_key)
        
        # Fallback to Bedrock
        self.use_bedrock = os.getenv("USE_BEDROCK", "false").lower() == "true"
        self.bedrock_client = None
        
        if self.use_openrouter:
            print("✓ OpenRouter AI enabled")
        elif self.use_bedrock:
            try:
                import boto3
                self.bedrock_client = boto3.client(
                    service_name="bedrock-runtime",
                    region_name=os.getenv("AWS_REGION", "us-east-1")
                )
                print("✓ AWS Bedrock AI enabled")
            except Exception as e:
                print(f"✗ Failed to initialize Bedrock client: {e}")
                self.use_bedrock = False
        
        if not self.use_openrouter and not self.use_bedrock:
            print("ℹ Using template-based insights (no AI API configured)")
    
    def generate_insights(self, simulation: SimulationResponse, user_location: Optional[str] = None, priorities: Optional[dict] = None) -> tuple[str, str, Optional[str]]:
        """
        Generate sustainability insights for a simulation.
        
        Args:
            simulation: The simulation results
            user_location: Optional user location for personalized recommendations
            priorities: Optional dict with priority weights for carbon, price, latency, compliance (0-1)
        
        Returns:
            tuple[str, str, Optional[str]]: (insights_text, provider_name, recommended_region_code)
        
        Uses AI when available, falls back to template-based generation.
        """
        # Merge user priorities with defaults
        effective_priorities = {**self.DEFAULT_PRIORITIES, **(priorities or {})}
        
        # Determine the AI-recommended region based on user location and priorities
        recommended_region_code = self._determine_recommended_region(simulation, user_location, effective_priorities)
        
        if self.use_openrouter:
            try:
                insights = self._generate_with_openrouter(simulation, user_location, effective_priorities, recommended_region_code)
                return (insights, "openrouter", recommended_region_code)
            except Exception as e:
                print(f"✗ OpenRouter failed, falling back to template: {e}")
                insights = self._generate_template_insights(simulation)
                return (insights, "template", recommended_region_code)
        elif self.use_bedrock and self.bedrock_client:
            try:
                insights = self._generate_with_bedrock(simulation, user_location, effective_priorities, recommended_region_code)
                return (insights, "bedrock", recommended_region_code)
            except Exception as e:
                print(f"✗ Bedrock failed, falling back to template: {e}")
                insights = self._generate_template_insights(simulation)
                return (insights, "template", recommended_region_code)
        insights = self._generate_template_insights(simulation)
        return (insights, "template", recommended_region_code)
    
    def _determine_recommended_region(self, simulation: SimulationResponse, user_location: Optional[str] = None, priorities: Optional[dict] = None) -> Optional[str]:
        """
        Determine the AI-recommended region based on user location and priority weights.
        
        Priority order (default):
        1. Carbon emissions (most important)
        2. Cost
        3. Latency (proximity to user)
        4. Data sovereignty/compliance
        
        Returns:
            Region code of the recommended region
        """
        current = simulation.current_region_result
        all_regions = [current] + simulation.comparison_regions
        priorities = priorities or self.DEFAULT_PRIORITIES
        
        # Find nearby regions for the user
        nearby_region_codes = self._get_nearby_regions(user_location, all_regions)
        
        # Calculate scores for each region
        scored_regions = []
        
        # Get min/max values for normalization
        min_carbon = min(r.carbon_emissions_kg for r in all_regions)
        max_carbon = max(r.carbon_emissions_kg for r in all_regions)
        min_cost = min(r.monthly_cost_usd for r in all_regions)
        max_cost = max(r.monthly_cost_usd for r in all_regions)
        
        for region in all_regions:
            # Normalize carbon (0 = best, 1 = worst)
            if max_carbon > min_carbon:
                carbon_score = (region.carbon_emissions_kg - min_carbon) / (max_carbon - min_carbon)
            else:
                carbon_score = 0
            
            # Normalize cost (0 = best, 1 = worst)
            if max_cost > min_cost:
                cost_score = (region.monthly_cost_usd - min_cost) / (max_cost - min_cost)
            else:
                cost_score = 0
            
            # Latency score (0 = nearby/good, 1 = far/bad)
            if nearby_region_codes:
                latency_score = 0 if region.region_code in nearby_region_codes else 1
            else:
                latency_score = 0.5  # No location provided, neutral
            
            # Compliance score (0 = EU for EU users, 1 = outside region)
            compliance_score = 0
            if user_location:
                user_lower = user_location.lower()
                # Check if user is in EU and region is in EU
                eu_countries = ["germany", "france", "sweden", "ireland", "italy", "spain", 
                               "netherlands", "belgium", "austria", "finland", "denmark", 
                               "norway", "poland", "switzerland", "united kingdom", "uk"]
                eu_regions = ["eu-north-1", "eu-west-1", "eu-west-2", "eu-west-3", 
                             "eu-central-1", "eu-central-2", "eu-south-1"]
                
                user_in_eu = any(c in user_lower for c in eu_countries)
                region_in_eu = region.region_code in eu_regions
                
                if user_in_eu and not region_in_eu:
                    compliance_score = 1  # Penalty for EU user with non-EU region
            
            # Calculate weighted score (lower is better)
            total_score = (
                carbon_score * priorities.get("carbon", 1.0) +
                cost_score * priorities.get("price", 0.6) +
                latency_score * priorities.get("latency", 0.3) +
                compliance_score * priorities.get("compliance", 0.2)
            )
            
            scored_regions.append((region, total_score, {
                "carbon": carbon_score,
                "cost": cost_score,
                "latency": latency_score,
                "compliance": compliance_score
            }))
        
        # Sort by total score (ascending - lower is better)
        scored_regions.sort(key=lambda x: x[1])
        
        # Return the best region
        best_region = scored_regions[0][0]
        return best_region.region_code
    
    def _get_nearby_regions(self, user_location: Optional[str], all_regions: list) -> list[str]:
        """
        Get list of nearby AWS region codes for a user location.
        
        Handles:
        1. Direct country matches (e.g., "Germany" → eu-central-1)
        2. Mapped countries without AWS regions (e.g., "Finland" → eu-north-1)
        3. City names and variations
        """
        if not user_location:
            return []
        
        user_lower = user_location.lower().strip()
        nearby_codes = []
        
        # First, check our comprehensive country mapping (most reliable)
        for country, region_codes in self.COUNTRY_TO_NEARBY_REGIONS.items():
            # Check if user input matches or contains the country name
            if (country == user_lower or 
                country in user_lower or 
                user_lower in country or
                # Handle cases like "Helsinki, Finland" or "Berlin, Germany"
                any(word == country for word in user_lower.replace(',', ' ').split())):
                nearby_codes.extend(region_codes)
                break
        
        # If no match in our mapping, check direct matches in available regions
        if not nearby_codes:
            for region in all_regions:
                region_country_lower = region.country.lower()
                region_name_lower = region.region_name.lower()
                
                if (user_lower == region_country_lower or
                    user_lower in region_country_lower or 
                    user_lower in region_name_lower or
                    region_country_lower in user_lower or
                    any(word in region_country_lower for word in user_lower.split())):
                    nearby_codes.append(region.region_code)
        
        return list(set(nearby_codes))  # Remove duplicates
    
    def _generate_with_openrouter(self, simulation: SimulationResponse, user_location: Optional[str] = None, priorities: Optional[dict] = None, recommended_region_code: Optional[str] = None) -> str:
        """Generate insights using OpenRouter API."""
        prompt = self._build_prompt(simulation, user_location, priorities, recommended_region_code)

        def _extract_content(message: object) -> Optional[str]:
            if not isinstance(message, dict):
                return None
            content = message.get("content")
            if isinstance(content, str):
                return content
            # Some OpenAI-compatible APIs/models may return content as a list of parts
            # e.g. [{"type":"text","text":"..."}, ...]
            if isinstance(content, list):
                parts: list[str] = []
                for part in content:
                    if isinstance(part, str):
                        parts.append(part)
                        continue
                    if isinstance(part, dict):
                        text = part.get("text")
                        if isinstance(text, str):
                            parts.append(text)
                joined = "".join(parts)
                return joined if joined else None
            return None

        def _call_openrouter(model: str) -> str:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openrouter_api_key}",
                        "HTTP-Referer": self.openrouter_app_url,
                        "X-Title": "CarbonShift Simulator",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model,
                        "messages": [
                            {
                                "role": "user",
                                "content": prompt,
                            }
                        ],
                        "max_tokens": 1500,
                        "temperature": 0.7,
                    },
                )

                if response.status_code != 200:
                    error_msg = f"Status {response.status_code}: {response.text[:200]}"
                    print(f"✗ OpenRouter API error: {error_msg}")
                    raise Exception(error_msg)

                data = response.json()
                choices = data.get("choices") or []
                choice0 = choices[0] if choices else {}
                message = choice0.get("message") if isinstance(choice0, dict) else None

                content = _extract_content(message)
                if not isinstance(content, str) or not content.strip():
                    request_id = data.get("id")
                    resolved_model = data.get("model") or model
                    finish_reason = choice0.get("finish_reason") if isinstance(choice0, dict) else None
                    message_keys = list(message.keys()) if isinstance(message, dict) else None
                    print(
                        "✗ OpenRouter returned empty content "
                        f"(id={request_id}, model={resolved_model}, finish_reason={finish_reason}, message_keys={message_keys})"
                    )
                    raise Exception("OpenRouter returned empty message content")

                return content
        
        try:
            return _call_openrouter(self.openrouter_model)
        except Exception as e:
            # Free-tier models occasionally return empty content with HTTP 200.
            # Try one retry with a slightly more deterministic setup before failing.
            print(f"✗ OpenRouter API error: {e}")
            if self.openrouter_model.endswith(":free"):
                try:
                    return _call_openrouter(self.openrouter_model)
                except Exception as e2:
                    print(f"✗ OpenRouter retry failed: {e2}")
            raise
    
    def _generate_with_bedrock(self, simulation: SimulationResponse, user_location: Optional[str] = None, priorities: Optional[dict] = None, recommended_region_code: Optional[str] = None) -> str:
        """Generate insights using Amazon Bedrock (Claude)."""
        
        prompt = self._build_prompt(simulation, user_location, priorities, recommended_region_code)
        
        try:
            response = self.bedrock_client.invoke_model(
                modelId="anthropic.claude-3-haiku-20240307-v1:0",
                body=json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 1024,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                })
            )
            
            result = json.loads(response["body"].read())
            return result["content"][0]["text"]
            
        except Exception as e:
            print(f"Bedrock API error: {e}")
            return self._generate_template_insights(simulation)
    
    def _build_prompt(self, simulation: SimulationResponse, user_location: Optional[str] = None, priorities: Optional[dict] = None, recommended_region_code: Optional[str] = None) -> str:
        """Build the prompt for AI generation with personalized context and priorities."""
        req = simulation.request
        current = simulation.current_region_result
        best_carbon = simulation.best_carbon_region
        best_cost = simulation.best_cost_region
        equiv = simulation.equivalencies
        all_regions = [current] + simulation.comparison_regions
        priorities = priorities or self.DEFAULT_PRIORITIES
        
        # Identify the recommended region object
        recommended_region = None
        if recommended_region_code:
            for r in all_regions:
                if r.region_code == recommended_region_code:
                    recommended_region = r
                    break
        
        # Fallback if not found
        if not recommended_region:
            recommended_region = best_carbon

        # Get nearby regions for the user
        nearby_region_codes = self._get_nearby_regions(user_location, all_regions)
        nearby_regions = [r for r in all_regions if r.region_code in nearby_region_codes]
        
        # Build location context
        location_context = ""
        nearby_region_info = ""
        
        if user_location:
            location_context = f"""
**User Location:** {user_location}
"""
            if nearby_regions:
                best_nearby = min(nearby_regions, key=lambda x: x.carbon_emissions_kg)
                nearby_region_info = f"""
**Nearest AWS Region to User:** {best_nearby.region_name} ({best_nearby.country})
- Region code: {best_nearby.region_code}
- Carbon emissions: {best_nearby.carbon_emissions_kg} kg CO2/month
- Cost: ${best_nearby.monthly_cost_usd}/month
- Latency advantage: Yes (geographically close to {user_location})
"""
            else:
                nearby_region_info = f"""
**Note:** No AWS region exists in {user_location}. Nearest low-carbon options should be recommended.
"""
        
        # Build priority context
        priority_order = sorted(priorities.items(), key=lambda x: -x[1])
        priority_list = "\n".join([f"   {i+1}. **{p[0].capitalize()}** (weight: {p[1]})" for i, p in enumerate(priority_order)])
        
        # Build region comparison table
        sorted_by_carbon = sorted(all_regions, key=lambda x: x.carbon_emissions_kg)[:5]
        region_table = "\n".join([
            f"   - {r.region_name} ({r.country}) [Code: {r.region_code}]: {r.carbon_emissions_kg} kg CO2, ${r.monthly_cost_usd}/month"
            for r in sorted_by_carbon
        ])
        
        return f"""You are a sustainability consultant for cloud infrastructure. Your PRIMARY goal is to reduce carbon emissions.

**DECISION PRIORITIES (in order of importance):**
{priority_list}

**Current Setup:**
- Instances: {req.instance_count}x {req.instance_type} in {current.region_name} ({current.country})
- CPU utilization: {req.cpu_utilization}%
- Runtime: {req.hours_per_month} hours/month
- Current carbon emissions: **{current.carbon_emissions_kg} kg CO2/month**
- Current cost: **${current.monthly_cost_usd}/month**
{location_context}{nearby_region_info}
**Top 5 Lowest-Carbon Regions:**
{region_table}

**CALCULATED RECOMMENDATION (You MUST recommend this region):**
- **Region:** {recommended_region.region_name} ({recommended_region.country})
- **Region Code:** {recommended_region.region_code}
- **Carbon:** {recommended_region.carbon_emissions_kg} kg CO2/month
- **Cost:** ${recommended_region.monthly_cost_usd}/month
- **Carbon Savings:** {recommended_region.carbon_savings_kg} kg ({recommended_region.carbon_savings_percent}%)
- **Cost Savings:** ${recommended_region.cost_savings_usd}

**Environmental Impact of Switching:**
- Yearly CO2 savings: {equiv.get('yearly_savings_kg', 0)} kg
- Equivalent to {equiv.get('car_km_saved', 0)} km of driving avoided
- Equal to {equiv.get('tree_months', 0)} tree-months of CO2 absorption

**CRITICAL INSTRUCTIONS:**
1. You MUST recommend **{recommended_region.region_name} ({recommended_region.region_code})** as the primary action. Do NOT recommend a different region.
2. Explain WHY this region was chosen based on the user's priorities (Carbon, Price, Latency, Compliance).
3. If the user is in an EU country, emphasize GDPR compliance if the recommended region is in the EU.
4. Be accurate with region codes. Stockholm is eu-north-1. Frankfurt is eu-central-1. Paris is eu-west-3. Zurich is eu-central-2.
5. If the current region is already the recommended one, congratulate the user.

**FORMATTING - Use this exact structure:**

## 📊 Current Analysis
2-3 sentences about current setup and emissions.

## 🌱 Recommended Action
Recommend **{recommended_region.region_name}** ({recommended_region.region_code}). State the benefits clearly.

## 🌍 Alternative Options
1-2 bullet points with alternatives if relevant (e.g. lowest cost option if different).

## ✅ Summary
One actionable sentence recommending {recommended_region.region_name}.

Be concise. Bold **key numbers** and **region names**."""


    def _generate_template_insights(self, simulation: SimulationResponse) -> str:
        """Generate template-based insights without AI."""
        req = simulation.request
        current = simulation.current_region_result
        best_carbon = simulation.best_carbon_region
        best_cost = simulation.best_cost_region
        equiv = simulation.equivalencies
        
        # Determine if migration is recommended
        carbon_improvement = best_carbon.carbon_savings_percent
        same_region = best_carbon.region_code == current.region_code
        
        if same_region:
            intro = f"""## 📊 Current Analysis

Great news! Your current deployment in **{current.region_name}** ({current.country}) is already one of the most carbon-efficient options available. Your **{req.instance_count}x {req.instance_type}** instances emit approximately **{current.carbon_emissions_kg} kg CO2 per month**."""
        else:
            intro = f"""## 📊 Current Analysis

Your current deployment of **{req.instance_count}x {req.instance_type}** instances in **{current.region_name}** ({current.country}) produces approximately **{current.carbon_emissions_kg} kg CO2 per month**."""

        # Recommendation section
        if same_region:
            recommendation = """

## 🌱 Recommended Action

**Stay in your current region!** You've already optimized for carbon efficiency. Consider monitoring your CPU utilization to ensure you're right-sizing your instances."""
        elif carbon_improvement > 50:
            recommendation = f"""

## 🌱 Recommended Action

**Strongly recommended:** Migrate to **{best_carbon.region_name}** for significant environmental benefits. This would reduce emissions to just **{best_carbon.carbon_emissions_kg} kg CO2 per month** — a **{carbon_improvement}% reduction**!"""
        elif carbon_improvement > 20:
            recommendation = f"""

## 🌱 Recommended Action

**Consider migrating** to **{best_carbon.region_name}** for meaningful carbon savings. This would reduce emissions to **{best_carbon.carbon_emissions_kg} kg CO2 per month** — a **{carbon_improvement}% reduction**."""
        else:
            recommendation = f"""

## 🌱 Recommended Action

Your current region is reasonably efficient. If you prioritize sustainability, **{best_carbon.region_name}** offers a **{carbon_improvement}%** reduction to **{best_carbon.carbon_emissions_kg} kg CO2 per month**."""

        # Impact section
        if equiv.get('yearly_savings_kg', 0) > 0:
            impact = f"""

## 🌍 Environmental Impact

Over a year, this migration would save approximately **{equiv.get('yearly_savings_kg', 0)} kg of CO2**:
- 🚙 Equivalent to avoiding **{int(equiv.get('car_km_saved', 0)):,} km** of car travel
- 🌳 Equal to **{int(equiv.get('tree_months', 0))} tree-months** of CO2 absorption
- 📱 Same as **{int(equiv.get('smartphone_charges', 0)):,}** smartphone charges"""
        else:
            impact = """

## 🌍 Environmental Impact

Your current region is already optimized for low carbon emissions. Keep up the great work!"""

        # Cost note
        if best_cost.cost_savings_usd > 0 and best_cost.region_code != best_carbon.region_code:
            cost_note = f"""

## ✅ Summary

For the best sustainability outcome, migrate to **{best_carbon.region_name}**. Note: **{best_cost.region_name}** offers the lowest cost at **${best_cost.monthly_cost_usd}/month** if budget is your priority."""
        elif same_region:
            cost_note = """

## ✅ Summary

Your infrastructure is already well-optimized. Continue monitoring your usage for further efficiency gains."""
        else:
            cost_note = f"""

## ✅ Summary

Migrate to **{best_carbon.region_name}** for a **{carbon_improvement}%** reduction in carbon emissions."""

        return intro + recommendation + impact + cost_note


# Singleton instance
ai_insights_service = AIInsightsService()
