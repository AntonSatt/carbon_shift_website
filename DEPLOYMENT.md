# CarbonShift Production Deployment Guide

**Server:** DigitalOcean Droplet  
**OS:** Ubuntu 24 LTS

## Quick Update Guide

### Update Code After Changes

```bash
# SSH into droplet
ssh user@your-server-ip

# Navigate to project
cd ~/apps/carbon_shift_website

# Pull latest changes
git checkout frontend/package-lock.json (if you have changes)
git pull

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
pm2 restart carbonshift-backend

# Update frontend
cd ../frontend
npm install
npm run build
pm2 restart carbonshift-frontend

# Check status
pm2 status
```

## Service Management

### View Status
```bash
pm2 status
```

### View Logs
```bash
pm2 logs                           # All services
pm2 logs carbonshift-frontend      # Frontend only
pm2 logs carbonshift-backend       # Backend only
```

### Restart Services
```bash
pm2 restart all                    # Restart everything
pm2 restart carbonshift-frontend   # Frontend only
pm2 restart carbonshift-backend    # Backend only
```

### Stop/Start Services
```bash
pm2 stop all                       # Stop all
pm2 start all                      # Start all
```

## Project Structure on Server

```
~/apps/carbon_shift_website/
├── backend/           # FastAPI backend (port 8000)
│   ├── venv/         # Python virtual environment
│   └── app/          # Backend code
└── frontend/          # Next.js frontend (port 3000)
    └── .env.local    # Contains: NEXT_PUBLIC_API_URL=https://your-domain.com
```

## Nginx Configuration

**Config file:** `/etc/nginx/sites-available/carbonshift`

- Frontend: Routes to `localhost:3000`
- Backend API: Routes `/api/*` to `localhost:8000/api/*`
- SSL: Managed by Certbot (auto-renews)

### Reload Nginx After Config Changes
```bash
sudo nano /etc/nginx/sites-available/carbonshift
sudo nginx -t
sudo systemctl reload nginx
```

## Troubleshooting

### Site Shows 502 Bad Gateway
```bash
pm2 status              # Check if services are running
pm2 restart all         # Restart services
```

### API Not Working
```bash
# Check backend logs
pm2 logs carbonshift-backend

# Verify backend is running
curl http://localhost:8000/api/health
```

### Frontend Not Updating
```bash
cd ~/apps/carbon_shift_website/frontend
npm run build
pm2 restart carbonshift-frontend
```

### SSL Certificate Renewal
Certbot auto-renews. To manually renew:
```bash
sudo certbot renew
```

## Environment Variables

**Backend:** `~/apps/carbon_shift_website/backend/.env`
- `USE_BEDROCK=false`
- `AWS_REGION=us-east-1`

**Frontend:** `~/apps/carbon_shift_website/frontend/.env.local`
- `NEXT_PUBLIC_API_URL=https://your-domain.com`

## Starting From Scratch (If Services Crash)

```bash
cd ~/apps/carbon_shift_website

# Start backend
cd backend
pm2 start venv/bin/python --name carbonshift-backend --interpreter none -- -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Start frontend
cd ../frontend
pm2 start npm --name carbonshift-frontend -- start

# Save configuration
pm2 save
```

## DNS Configuration

**DNS Provider:** DigitalOcean (or your provider)
- A Record: `subdomain` → `your-server-ip`

## Useful Commands

```bash
# View running processes
pm2 monit

# Delete a process
pm2 delete carbonshift-backend
pm2 delete carbonshift-frontend

# Save PM2 configuration
pm2 save

# View nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```
