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
    
    def generate_insights(self, simulation: SimulationResponse, user_location: Optional[str] = None) -> tuple[str, str, Optional[str]]:
        """
        Generate sustainability insights for a simulation.
        
        Args:
            simulation: The simulation results
            user_location: Optional user location for personalized recommendations
        
        Returns:
            tuple[str, str, Optional[str]]: (insights_text, provider_name, recommended_region_code)
        
        Uses AI when available, falls back to template-based generation.
        """
        # Determine the AI-recommended region based on user location
        recommended_region_code = self._determine_recommended_region(simulation, user_location)
        
        if self.use_openrouter:
            try:
                insights = self._generate_with_openrouter(simulation, user_location)
                return (insights, "openrouter", recommended_region_code)
            except Exception as e:
                print(f"✗ OpenRouter failed, falling back to template: {e}")
                insights = self._generate_template_insights(simulation)
                return (insights, "template", recommended_region_code)
        elif self.use_bedrock and self.bedrock_client:
            try:
                insights = self._generate_with_bedrock(simulation, user_location)
                return (insights, "bedrock", recommended_region_code)
            except Exception as e:
                print(f"✗ Bedrock failed, falling back to template: {e}")
                insights = self._generate_template_insights(simulation)
                return (insights, "template", recommended_region_code)
        insights = self._generate_template_insights(simulation)
        return (insights, "template", recommended_region_code)
    
    def _determine_recommended_region(self, simulation: SimulationResponse, user_location: Optional[str] = None) -> Optional[str]:
        """
        Determine the AI-recommended region based on user location and carbon efficiency.
        
        Prioritizes:
        1. Local regions (for latency/GDPR) if user location is provided
        2. Falls back to lowest carbon region
        
        Returns:
            Region code of the recommended region
        """
        current = simulation.current_region_result
        all_regions = [current] + simulation.comparison_regions
        
        if user_location:
            user_lower = user_location.lower()
            
            # Find regions in the same country/area as user
            nearby_regions = [
                r for r in all_regions 
                if user_lower in r.country.lower() 
                or user_lower in r.region_name.lower()
                or any(word in r.country.lower() for word in user_lower.split())
            ]
            
            if nearby_regions:
                # Find best nearby option (prioritize carbon, then cost)
                best_nearby = min(nearby_regions, key=lambda x: (x.carbon_emissions_kg, x.monthly_cost_usd))
                return best_nearby.region_code
        
        # Fall back to lowest carbon region
        return simulation.best_carbon_region.region_code
    
    def _generate_with_openrouter(self, simulation: SimulationResponse, user_location: Optional[str] = None) -> str:
        """Generate insights using OpenRouter API."""
        prompt = self._build_prompt(simulation, user_location)

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
    
    def _generate_with_bedrock(self, simulation: SimulationResponse, user_location: Optional[str] = None) -> str:
        """Generate insights using Amazon Bedrock (Claude)."""
        
        prompt = self._build_prompt(simulation, user_location)
        
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
    
    def _build_prompt(self, simulation: SimulationResponse, user_location: Optional[str] = None) -> str:
        """Build the prompt for AI generation with personalized context."""
        req = simulation.request
        current = simulation.current_region_result
        best_carbon = simulation.best_carbon_region
        best_cost = simulation.best_cost_region
        equiv = simulation.equivalencies
        all_regions = [current] + simulation.comparison_regions
        
        # Build location context with nearby region detection
        location_context = ""
        nearby_region_info = ""
        
        if user_location:
            # Find regions in the same country/area as user
            user_lower = user_location.lower()
            nearby_regions = [
                r for r in all_regions 
                if user_lower in r.country.lower() 
                or user_lower in r.region_name.lower()
                or any(word in r.country.lower() for word in user_lower.split())
            ]
            
            if nearby_regions:
                # Find best nearby option (prioritize carbon, then cost)
                best_nearby = min(nearby_regions, key=lambda x: (x.carbon_emissions_kg, x.monthly_cost_usd))
                
                nearby_region_info = f"""

**CRITICAL - LOCAL REGION DETECTED:**
The user is in {user_location}, and {best_nearby.region_name} ({best_nearby.country}) is a LOCAL region:
- Carbon: {best_nearby.carbon_emissions_kg} kg CO2/month
- Cost: ${best_nearby.monthly_cost_usd}/month
- Latency: MINIMAL (<5-10ms) - BEST for performance and user experience
- Compliance: IDEAL for {user_location} data residency and regulations (e.g., GDPR for EU)
- This should be your PRIMARY recommendation unless carbon/cost savings from other regions are DRAMATICALLY better (>50% improvement)
"""
            
            location_context = f"""
**User Context:**
- User is located in: {user_location}
- Prioritize nearby regions for latency (<10ms local vs 50-100ms+ distant)
- Consider data sovereignty: EU data should stay in EU, etc.
- Local regions offer better user experience and regulatory compliance
"""
        
        return f"""You are a sustainability consultant analyzing cloud infrastructure carbon emissions for a client.
        
Generate a structured sustainability report using CLEAR MARKDOWN SECTIONS based on this data:

**Current Setup:**
- {req.instance_count}x {req.instance_type} instances in {current.region_name} ({current.country})
- {req.cpu_utilization}% average CPU utilization
- {req.hours_per_month} hours/month runtime
- Current emissions: {current.carbon_emissions_kg} kg CO2/month
- Current cost: ${current.monthly_cost_usd}/month

**Best Low-Carbon Alternative (Global):**
- Region: {best_carbon.region_name} ({best_carbon.country})
- Emissions: {best_carbon.carbon_emissions_kg} kg CO2/month
- Monthly savings: {best_carbon.carbon_savings_kg} kg CO2 ({best_carbon.carbon_savings_percent}%)
- Yearly savings: {equiv.get('yearly_savings_kg', 0)} kg CO2

**Best Low-Cost Alternative (Global):**
- Region: {best_cost.region_name} ({best_cost.country})
- Cost: ${best_cost.monthly_cost_usd}/month
- Monthly savings: ${best_cost.cost_savings_usd}

**Equivalencies for yearly carbon savings:**
- Equivalent to {equiv.get('car_km_saved', 0)} km of car driving avoided
- Equal to {equiv.get('tree_months', 0)} tree-months of CO2 absorption
{location_context}{nearby_region_info}

**FORMATTING REQUIREMENTS - VERY IMPORTANT:**
Use this EXACT structure with markdown headers:

## 📊 Current Analysis
Brief analysis of current setup (2-3 sentences)

## 🌱 Recommended Action
Primary recommendation with key benefits and specific numbers (2-3 sentences)

## 🌍 Alternative Options
If relevant, mention 1-2 alternative regions with key tradeoffs (2-3 bullet points)

## ✅ Summary
One clear, actionable sentence summarizing the recommendation

Keep each section SHORT and FOCUSED. Use bullet points for lists. Bold **key numbers** and **region names**.
If a local region is detected, recommend it as primary option due to latency/compliance benefits."""


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
