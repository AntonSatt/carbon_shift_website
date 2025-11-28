# Project Prompt: CarbonShift Simulator

## Project Goal
Create a modern, user-friendly web application that allows companies and individuals to simulate and visualize the carbon emissions and financial costs of their cloud infrastructure across different geographic regions. The goal is to empower users to make data-driven decisions to reduce their environmental impact and cloud bills.

## Core Value Proposition
"Move your bits, save the planet (and money)."
Users input their current or planned cloud resources, and the platform demonstrates how much CO2 and USD they could save by deploying in a different region (e.g., moving from Frankfurt to Stockholm).

## Target Audience
- **Developers & DevOps Engineers**: optimizing individual workloads.
- **CTOs & IT Managers**: planning large-scale migrations for ESG goals.
- **Individuals**: curious about the impact of their personal servers/projects.

## Functional Requirements

### 1. User Input (Simulation Configuration)
A clean, intuitive form where users can define their workload:
- **Cloud Provider**: AWS (initially), expandable to Azure/GCP.
- **Instance Type**: e.g., t3.micro, m5.large (dropdown with specs).
- **Count**: Number of instances.
- **Usage Profile**:
  - % CPU Utilization (avg).
  - Hours running per day/month.
- **Current Region**: Where the workload is currently hosted (e.g., eu-central-1).

### 2. Simulation Engine (Backend)
The core logic should calculate:
- **Power Consumption**: Use a linear power model: `Power = Idle_Watts + (Max_Watts - Idle_Watts) * Utilization`.
- **Carbon Emissions**: `Emissions (gCO2) = Power (kWh) * Grid_Intensity (gCO2/kWh)`.
- **Cost**: `Cost ($) = Price_Per_Hour * Hours`.
- **Comparison**: Calculate these metrics for the user's current region AND alternative regions (e.g., Sweden, France, UK, Germany, US East).

### 3. Data Sources
- **Carbon Intensity**: Real-time or historical average carbon intensity data (e.g., from Nowtricity, Electricity Maps, or static averages for simulation).
- **Cloud Pricing**: AWS Price List API or a static lookup table for common instances.

### 4. Visualization & Reporting
- **Dashboard**:
  - Bar charts comparing CO2 emissions across regions.
  - Bar charts comparing Monthly Costs across regions.
  - "Best Region" highlight (Lowest Carbon, Lowest Cost, Best Balance).
- **AI Insights**:
  - A generated textual report (using LLMs like Claude 3 via Amazon Bedrock) explaining the findings.
  - Example: "Moving your 10 m5.large instances from Germany to Sweden would save 500kg of CO2 per year, equivalent to driving a car 2,000km."

## Tech Stack Recommendations

### Frontend
- **Framework**: **Next.js 14+ (App Router)** - For SEO, performance, and server components.
- **Language**: TypeScript.
- **Styling**: **Tailwind CSS** + **Shadcn UI** (for accessible, professional components).
- **Charts**: **Recharts** or **Tremor** (specifically designed for dashboards).

### Backend
- **Framework**: **FastAPI (Python)**.
  - *Why?* Python is excellent for the calculation logic and integrates easily with AWS SDK (boto3) for Bedrock and data science libraries if needed. It allows reusing logic from the existing `CarbonShift` prototype.
- **Database**: **PostgreSQL** (via Supabase or Neon).
  - To store user simulations, cached pricing/carbon data, and user profiles.

### Infrastructure & AI
- **AI Provider**: **Amazon Bedrock** (Claude 3 Haiku/Sonnet) for generating the text reports.
- **Hosting**:
  - Frontend: Vercel.
  - Backend: AWS App Runner, Railway, or Render.

## Implementation Steps for the Agent

1.  **Scaffold the Project**: Set up a monorepo with `frontend` (Next.js) and `backend` (FastAPI).
2.  **Backend - Core Logic**:
    -   Implement the `PowerModel` class (Idle/Max watts for instances).
    -   Implement `CarbonService` to fetch/store grid intensity.
    -   Implement `PricingService` for AWS costs.
    -   Create a `/simulate` endpoint that takes user input and returns comparison data.
3.  **Backend - AI Integration**:
    -   Create a prompt template for the "Sustainability Report".
    -   Integrate `boto3` to call Amazon Bedrock with the simulation data.
4.  **Frontend - UI Construction**:
    -   Build the `SimulationForm` component.
    -   Build the `ResultsDashboard` with charts.
    -   Display the AI-generated markdown report nicely.
5.  **Polish**: Add loading states, error handling, and a "Share my Savings" feature.

## Reference Logic (from existing CarbonShift)
*Use this logic for the power calculation:*
```python
# Example t3.micro model
IDLE_POWER_WATTS = 3.5
MAX_POWER_WATTS = 18.0

def calculate_co2(cpu_percent, carbon_intensity):
    power_watts = IDLE_POWER_WATTS + (MAX_POWER_WATTS - IDLE_POWER_WATTS) * (cpu_percent / 100.0)
    power_kw = power_watts / 1000.0
    return power_kw * carbon_intensity
```
