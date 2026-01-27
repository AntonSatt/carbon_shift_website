# 🌱 CarbonShift Simulator

**Move your bits, save the planet (and money).**

🏆 **1st Place Winner - AWS Hackathon 2025**

A modern web application that helps companies and individuals simulate and visualize the carbon emissions and financial costs of their cloud infrastructure across different geographic regions.

## Features

- ⚡ **Instant Simulation**: Calculate carbon emissions and costs for your cloud workloads
- 🌍 **Multi-Region Comparison**: Compare across 20+ AWS regions worldwide
- 📊 **Visual Dashboard**: Interactive charts showing emissions and cost comparisons
- 🤖 **AI Insights**: Get personalized sustainability reports with actionable recommendations
- 🎯 **Smart Recommendations**: AI considers your location, priorities, latency, and compliance
- 💰 **Cost Optimization**: Find the most cost-effective regions for your workloads
- 🌿 **Environmental Impact**: See real-world equivalencies (car km, tree absorption, etc.)
- 🔧 **Priority Weighting**: Customize recommendations by carbon, price, latency, and compliance factors

## Tech Stack

### Frontend
- **Next.js 16** (App Router with React 19)
- **TypeScript**
- **Tailwind CSS 4** + **Shadcn UI** (Radix UI primitives)
- **Recharts** for data visualization
- **React Markdown** for AI insights rendering
- **next-themes** for dark mode support

### Backend
- **FastAPI** (Python 3.10+)
- **Pydantic** for data validation and settings
- **httpx** for async HTTP requests
- **Amazon Bedrock** (Claude 3) for AI insights (optional)
- **OpenRouter** (Gemini 2.0 Flash) for AI insights (recommended, optional)

### Data Sources
- Static carbon intensity database (based on Electricity Maps & IEA data)
- AWS EC2 pricing data (embedded)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- npm or pnpm

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000
```

The API will be available at http://localhost:8000

- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/v1/health

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at http://localhost:3000

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/metadata` | GET | Get available instances and regions |
| `/api/v1/simulate` | POST | Run a carbon simulation |

### Example Simulation Request

```json
{
  "cloud_provider": "aws",
  "instance_type": "t3.micro",
  "instance_count": 10,
  "cpu_utilization": 50,
  "hours_per_month": 730,
  "current_region": "eu-central-1",
  "user_location": "Germany",
  "priorities": {
    "carbon": 1.0,
    "price": 0.6,
    "latency": 0.3,
    "compliance": 0.2
  }
}
```

#### Request Parameters

- **cloud_provider**: Currently supports "aws" (default)
- **instance_type**: EC2 instance type (e.g., "t3.micro", "m5.large")
- **instance_count**: Number of instances (1-1000)
- **cpu_utilization**: Average CPU usage percentage (0-100)
- **hours_per_month**: Monthly runtime hours (1-744)
- **current_region**: AWS region code (e.g., "eu-central-1")
- **user_location** *(optional)*: Your location for latency-aware recommendations (e.g., "Germany", "United States", "Singapore")
- **priorities** *(optional)*: Custom weights for recommendation factors:
  - **carbon**: Weight for carbon reduction (0.0-1.0, default: 1.0)
  - **price**: Weight for cost savings (0.0-1.0, default: 0.6)
  - **latency**: Weight for low latency (0.0-1.0, default: 0.3)
  - **compliance**: Weight for data sovereignty (0.0-1.0, default: 0.2)

## Environment Variables

### Backend (.env)

```bash
# AI Provider Configuration (optional - defaults to template-based insights)

# Option 1: OpenRouter (Recommended) - Fast, cheap, reliable
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=google/gemini-2.0-flash-001  # Default model
OPENROUTER_APP_URL=http://localhost:3000  # Your app URL

# Option 2: Amazon Bedrock (Alternative)
USE_BEDROCK=false  # Set to true to use Bedrock instead
AWS_REGION=us-east-1  # AWS region for Bedrock
# Requires AWS credentials configured (via ~/.aws/credentials or environment variables)

# Note: If neither is configured, the app will use template-based insights
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## AI Insights Configuration

The application supports three modes for generating sustainability insights:

1. **OpenRouter (Recommended)**: Fast, cost-effective, reliable
   - Set `OPENROUTER_API_KEY` in backend `.env`
   - Get your API key from [openrouter.ai](https://openrouter.ai)
   - Default model: Gemini 2.0 Flash (very fast and cheap)

2. **Amazon Bedrock**: For AWS-integrated deployments
   - Set `USE_BEDROCK=true` in backend `.env`
   - Requires AWS credentials with Bedrock access
   - Uses Claude 3 models

3. **Template-based (Fallback)**: No API key required
   - Automatically used if no AI provider is configured
   - Generates insights using predefined templates

## Carbon Intensity Data

Carbon intensity values (gCO2/kWh) are based on:
- [Electricity Maps](https://app.electricitymaps.com/)
- [IEA World Energy Outlook](https://www.iea.org/)
- Regional electricity grid data (2024 averages)

The application includes data for 20+ AWS regions worldwide, with carbon intensities ranging from:
- **Lowest**: Sweden (Stockholm) - 45 gCO2/kWh
- **Highest**: Australia (Sydney) - 700 gCO2/kWh

## Pricing Data

AWS EC2 On-Demand pricing is embedded in the application based on public AWS Price List data.
Prices may vary - for production use with real-time pricing, integrate with AWS Price List API.

## Supported Instance Types

The application includes power consumption models for common AWS EC2 instance types:
- **t3 family**: t3.micro, t3.small, t3.medium, t3.large, t3.xlarge, t3.2xlarge
- **t4g family**: t4g.micro, t4g.small, t4g.medium, t4g.large (ARM-based)
- **m5 family**: m5.large, m5.xlarge, m5.2xlarge, m5.4xlarge
- **m6i family**: m6i.large, m6i.xlarge, m6i.2xlarge
- **c5 family**: c5.large, c5.xlarge, c5.2xlarge (compute-optimized)
- **r5 family**: r5.large, r5.xlarge, r5.2xlarge (memory-optimized)

Each instance type includes accurate idle and maximum power consumption values based on cloud provider specifications and industry benchmarks.

## Location-Aware Recommendations

The AI insights system includes intelligent location-aware recommendations:
- Maps your location to the nearest AWS regions (e.g., "Germany" → "eu-central-1", "eu-west-1")
- Considers network latency and data sovereignty requirements
- Prioritizes low-carbon regions in your geographic area
- Supports 100+ countries and regions worldwide

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete production deployment instructions.

The application is production-ready and deployed using:
- **Process Manager**: PM2 for both frontend and backend services
- **Web Server**: Nginx as reverse proxy with SSL/TLS (Certbot)
- **Platform**: DigitalOcean Droplet (Ubuntu 24 LTS)

### Quick Production Setup

```bash
# Backend (managed by PM2)
cd backend
source venv/bin/activate
pm2 start venv/bin/python --name carbonshift-backend \
  --interpreter none -- -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend (managed by PM2)
cd frontend
npm run build
pm2 start npm --name carbonshift-frontend -- start

# Save PM2 configuration
pm2 save
pm2 startup  # Enable auto-start on reboot
```

The application can also be deployed on:
- **Frontend**: Vercel, Netlify, or any Node.js hosting
- **Backend**: AWS App Runner, Railway, Render, or any Python hosting

## Project Structure

```
carbon_shift_website/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── data/
│   │   │   ├── carbon_intensity.py   # Carbon intensity database
│   │   │   └── pricing.py            # AWS pricing data
│   │   ├── models/
│   │   │   ├── power_models.py       # Instance power consumption models
│   │   │   └── schemas.py            # Pydantic request/response models
│   │   ├── routers/
│   │   │   └── simulation.py         # API endpoints
│   │   └── services/
│   │       ├── simulation_service.py  # Core simulation logic
│   │       ├── ai_service.py          # AI insights generation
│   │       └── aws_pricing_service.py # Pricing calculations
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Home page (simulator)
│   │   │   ├── about/
│   │   │   │   └── page.tsx          # About page
│   │   │   └── layout.tsx            # Root layout
│   │   ├── components/
│   │   │   ├── simulation-form.tsx   # Input form
│   │   │   ├── results-dashboard.tsx # Results visualization
│   │   │   └── ui/                   # Shadcn UI components
│   │   └── lib/
│   │       ├── api.ts                # API client
│   │       ├── types.ts              # TypeScript types
│   │       └── utils.ts              # Utilities
│   └── package.json
└── README.md
```

## License

Copyright © 2026 Anton Sätterkvist  
All rights reserved.

---

Built with 💚 for a sustainable cloud future by Team CarbonShift.