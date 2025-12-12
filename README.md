# 🌱 CarbonShift Simulator

**Move your bits, save the planet (and money).**

A modern web application that helps companies and individuals simulate and visualize the carbon emissions and financial costs of their cloud infrastructure across different geographic regions.

![CarbonShift Screenshot](docs/screenshot.png)

## Features

- ⚡ **Instant Simulation**: Calculate carbon emissions and costs for your cloud workloads
- 🌍 **Multi-Region Comparison**: Compare across 20+ AWS regions worldwide
- 📊 **Visual Dashboard**: Interactive charts showing emissions and cost comparisons
- 🤖 **AI Insights**: Get generated sustainability reports with actionable recommendations
- 💰 **Cost Optimization**: Find the most cost-effective regions for your workloads
- 🌿 **Environmental Impact**: See real-world equivalencies (car km, tree absorption, etc.)

## Tech Stack

### Frontend
- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS** + **Shadcn UI**
- **Recharts** for data visualization

### Backend
- **FastAPI** (Python)
- **Pydantic** for data validation
- **Amazon Bedrock** (Claude 3) for AI insights (optional)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- npm or pnpm

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000

# To kill development server:
pkill -f "uvicorn app.main:app" 2>/dev/null; cd /home/kaffe/Documents/My\ Projects/carbon_shiftv2/backend
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
  "current_region": "eu-central-1"
}
```

## Environment Variables

### Backend (.env)
```bash
USE_BEDROCK=false  # Enable Amazon Bedrock AI insights
AWS_REGION=us-east-1
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Carbon Intensity Data

Carbon intensity values (gCO2/kWh) are based on:
- [Electricity Maps](https://app.electricitymaps.com/)
- [IEA World Energy Outlook](https://www.iea.org/)
- Regional electricity grid data (2024 averages)

## Pricing Data

AWS EC2 On-Demand pricing is based on public AWS Price List data.
Prices may vary - for production use, integrate with AWS Price List API.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with 💚 for a sustainable cloud future.

Copyright (c) 2025 Anton Sätterkvist
All rights reserved.