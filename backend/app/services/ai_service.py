"""
CarbonShift Simulator - AI Insights Service

Generates human-readable sustainability reports using LLMs.
Supports Amazon Bedrock (Claude) with fallback to template-based generation.
"""

import os
from typing import Optional
from app.models.schemas import SimulationResponse


class AIInsightsService:
    """Service for generating AI-powered sustainability insights."""
    
    def __init__(self):
        self.use_bedrock = os.getenv("USE_BEDROCK", "false").lower() == "true"
        self.bedrock_client = None
        
        if self.use_bedrock:
            try:
                import boto3
                self.bedrock_client = boto3.client(
                    service_name="bedrock-runtime",
                    region_name=os.getenv("AWS_REGION", "us-east-1")
                )
            except Exception as e:
                print(f"Failed to initialize Bedrock client: {e}")
                self.use_bedrock = False
    
    def generate_insights(self, simulation: SimulationResponse) -> str:
        """
        Generate sustainability insights for a simulation.
        
        Uses AI when available, falls back to template-based generation.
        """
        if self.use_bedrock and self.bedrock_client:
            return self._generate_with_bedrock(simulation)
        return self._generate_template_insights(simulation)
    
    def _generate_with_bedrock(self, simulation: SimulationResponse) -> str:
        """Generate insights using Amazon Bedrock (Claude)."""
        import json
        
        prompt = self._build_prompt(simulation)
        
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
    
    def _build_prompt(self, simulation: SimulationResponse) -> str:
        """Build the prompt for AI generation."""
        req = simulation.request
        current = simulation.current_region_result
        best_carbon = simulation.best_carbon_region
        best_cost = simulation.best_cost_region
        equiv = simulation.equivalencies
        
        return f"""You are a sustainability consultant analyzing cloud infrastructure carbon emissions.
        
Generate a brief, engaging sustainability report (3-4 paragraphs) based on this data:

**Current Setup:**
- {req.instance_count}x {req.instance_type} instances in {current.region_name} ({current.country})
- {req.cpu_utilization}% average CPU utilization
- {req.hours_per_month} hours/month runtime
- Current emissions: {current.carbon_emissions_kg} kg CO2/month
- Current cost: ${current.monthly_cost_usd}/month

**Best Low-Carbon Alternative:**
- Region: {best_carbon.region_name} ({best_carbon.country})
- Emissions: {best_carbon.carbon_emissions_kg} kg CO2/month
- Monthly savings: {best_carbon.carbon_savings_kg} kg CO2 ({best_carbon.carbon_savings_percent}%)
- Yearly savings: {equiv.get('yearly_savings_kg', 0)} kg CO2

**Best Low-Cost Alternative:**
- Region: {best_cost.region_name} ({best_cost.country})
- Cost: ${best_cost.monthly_cost_usd}/month
- Monthly savings: ${best_cost.cost_savings_usd}

**Equivalencies for yearly carbon savings:**
- Equivalent to {equiv.get('car_km_saved', 0)} km of car driving avoided
- Equal to {equiv.get('tree_months', 0)} tree-months of CO2 absorption

Write in a professional but accessible tone. Include specific numbers and make the environmental impact tangible and relatable. End with a clear recommendation."""

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
            intro = f"""## 🌱 Sustainability Analysis

Great news! Your current deployment in **{current.region_name}** ({current.country}) is already one of the most carbon-efficient options available.

Your **{req.instance_count}x {req.instance_type}** instances emit approximately **{current.carbon_emissions_kg} kg CO2 per month**, which is excellent compared to other regions."""
        else:
            intro = f"""## 🌱 Sustainability Analysis

Your current deployment of **{req.instance_count}x {req.instance_type}** instances in **{current.region_name}** ({current.country}) produces approximately **{current.carbon_emissions_kg} kg CO2 per month**.

By migrating to **{best_carbon.region_name}** ({best_carbon.country}), you could reduce emissions to just **{best_carbon.carbon_emissions_kg} kg CO2 per month** — a **{carbon_improvement}% reduction**!"""

        # Impact section
        if equiv.get('yearly_savings_kg', 0) > 0:
            impact = f"""
### 🚗 Environmental Impact

Over a year, this migration would save approximately **{equiv.get('yearly_savings_kg', 0)} kg of CO2**. To put that in perspective:
- 🚙 Equivalent to avoiding **{int(equiv.get('car_km_saved', 0)):,} km** of car travel
- 🌳 Equal to **{int(equiv.get('tree_months', 0))} tree-months** of CO2 absorption
- 📱 Same as **{int(equiv.get('smartphone_charges', 0)):,}** smartphone charges"""
        else:
            impact = """
### 🌿 Environmental Impact

Your current region is already optimized for low carbon emissions. Keep up the great work!"""

        # Cost analysis
        if best_cost.cost_savings_usd > 0:
            cost_section = f"""
### 💰 Cost Optimization

The most cost-effective region is **{best_cost.region_name}** ({best_cost.country}) at **${best_cost.monthly_cost_usd}/month**, saving you **${best_cost.cost_savings_usd}/month** (${round(best_cost.cost_savings_usd * 12, 2)}/year)."""
        else:
            cost_section = f"""
### 💰 Cost Analysis

Your current region offers competitive pricing at **${current.monthly_cost_usd}/month**."""

        # Recommendation
        if same_region:
            recommendation = """
### ✅ Recommendation

**Stay in your current region!** You've already optimized for carbon efficiency. Consider monitoring your CPU utilization to ensure you're right-sizing your instances."""
        elif carbon_improvement > 50:
            recommendation = f"""
### 🎯 Recommendation

**Strongly recommended:** Migrate to **{best_carbon.region_name}** for significant environmental benefits. The {carbon_improvement}% carbon reduction makes this a high-impact sustainability win."""
        elif carbon_improvement > 20:
            recommendation = f"""
### 🎯 Recommendation

**Consider migrating** to **{best_carbon.region_name}** for meaningful carbon savings. A {carbon_improvement}% reduction contributes positively to your sustainability goals."""
        else:
            recommendation = f"""
### 🎯 Recommendation

Your current region is reasonably efficient. If you prioritize sustainability, **{best_carbon.region_name}** offers modest improvements. Consider other factors like latency and compliance when making your decision."""

        return intro + impact + cost_section + recommendation


# Singleton instance
ai_insights_service = AIInsightsService()
