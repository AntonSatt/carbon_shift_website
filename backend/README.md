# CarbonShift Simulator - Backend

## Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

- `GET /` - API info
- `GET /docs` - Swagger documentation
- `GET /api/v1/health` - Health check
- `GET /api/v1/metadata` - Get available instances and regions
- `POST /api/v1/simulate` - Run a simulation

## Environment Variables

```bash
USE_BEDROCK=false  # Set to true to enable AI insights via Amazon Bedrock
AWS_REGION=us-east-1  # AWS region for Bedrock
```
