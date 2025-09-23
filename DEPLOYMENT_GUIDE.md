# Activepieces Deployment Guide - kroniq.io

## Dosyalar

### 1. Main Deployment Script
- **`deploy-activepieces-safe.sh`** - Ana deployment script (error handling'li)

### 2. Nginx Configurations
- **`nginx-kroniq-dev.conf`** - Development mode için (Frontend: 4200, Backend: 3000)
- **`nginx-kroniq-unified.conf`** - Production mode için (Single port: 8080)

### 3. Vite Configuration
- **`packages/react-ui/vite.config.ts`** - kroniq.io allowedHosts eklendi

## Server Setup Commands

### İlk Kurulum
```bash
# 1. Dosyaları server'a kopyala
scp deploy-activepieces-safe.sh nginx-kroniq-dev.conf nginx-kroniq-unified.conf root@server:/tmp/

# 2. Development mode kurulumu
cd /tmp
chmod +x deploy-activepieces-safe.sh
bash deploy-activepieces-safe.sh development

# 3. Nginx config'i kopyala (development)
sudo cp nginx-kroniq-dev.conf /etc/nginx/sites-available/kroniq.io
sudo ln -sf /etc/nginx/sites-available/kroniq.io /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Port Configuration
- **Frontend (Vite):** 4200
- **Backend (API):** 3000
- **Nginx Proxy:** 443 → 4200 (frontend), /api/ → 3000/v1/ (backend)

### API Routing
- Frontend calls: `https://kroniq.io/api/v1/flags`
- Nginx proxies to: `http://localhost:3000/v1/flags`
- Backend serves: `/v1/` endpoints

### Troubleshooting

#### Port Conflicts
```bash
# Check port usage
sudo lsof -i :3000
sudo lsof -i :4200

# Stop conflicting services
sudo systemctl stop grafana-server
```

#### PM2 Management
```bash
# Status
pm2 status

# Logs
pm2 logs ap-dev

# Restart
pm2 restart ap-dev

# Delete all and restart
pm2 delete all
pm2 start ecosystem.config.js
```

#### Nginx Issues
```bash
# Test config
sudo nginx -t

# Check error logs
tail -f /var/log/nginx/kroniq_dev_error.log

# Reload
sudo systemctl reload nginx
```

## Environment Variables

### Required in .env
```bash
AP_FRONTEND_URL=https://kroniq.io
AP_WEBHOOK_URL=https://kroniq.io
AP_ENCRYPTION_KEY=generated_32_char_key
AP_JWT_SECRET=generated_32_char_key
AP_DB_TYPE=SQLITE3
AP_EXECUTION_MODE=UNSANDBOXED
AP_QUEUE_MODE=MEMORY
AP_PIECES_SOURCE=FILE
AP_PIECES_SYNC_MODE=NONE
AP_TELEMETRY_ENABLED=false
AP_CACHE_PATH=/var/www/kroniqio/cache
AP_CONFIG_PATH=/var/www/kroniqio/config
```

## Production Deployment

### Switch to Production Mode
```bash
# Build and start production
bash deploy-activepieces-safe.sh production

# Use production nginx config
sudo cp nginx-kroniq-unified.conf /etc/nginx/sites-available/kroniq.io
sudo systemctl reload nginx
```

### Production Differences
- Single port: 8080 (serves both frontend and backend)
- Built files served from dist/
- PM2 runs main.js instead of npm run dev

## SSL Configuration

### Cloudflare Origin Certificate
1. Create Origin Certificate in Cloudflare Dashboard
2. Save as:
   - `/etc/ssl/certs/cloudflare-kroniq.pem`
   - `/etc/ssl/private/cloudflare-kroniq.key`

### DNS Settings
- A record: `kroniq.io` → Server IP
- CNAME: `www.kroniq.io` → `kroniq.io`
- Cloudflare proxy enabled

## WhatsApp Integration

### Meta Developer Setup
1. Create WhatsApp Business API app
2. Configure webhook URL: `https://kroniq.io/v1/webhooks/{flow-id}`
3. Subscribe to messages field
4. Set verify token in flow

### Activepieces Flow Setup
1. Login to https://kroniq.io
2. Create new flow
3. Add WhatsApp trigger
4. Configure auth (System User Access Token + Business Account ID)
5. Copy webhook URL to Meta dashboard

## Common Issues

### 1. White Screen
- Check PM2 logs: `pm2 logs ap-dev`
- Verify API connectivity: `curl http://localhost:3000/v1/flags`
- Check browser console for errors

### 2. 502 Bad Gateway
- Backend not running: `pm2 status`
- Port conflicts: `sudo lsof -i :3000`
- Wrong nginx proxy config

### 3. 404 API Errors
- Wrong API routing in nginx
- Ensure `/api/` maps to `/v1/` on backend

### 4. Vite Host Errors
- Add domain to allowedHosts in vite.config.ts
- Restart development server

## Maintenance Commands

### Update Code
```bash
cd /var/www/kroniqio
git pull
pm2 restart ap-dev
```

### View Logs
```bash
# Application logs
pm2 logs ap-dev --lines 50

# Nginx logs
tail -f /var/log/nginx/kroniq_dev_error.log

# System logs
journalctl -f -u nginx
```

### Backup
```bash
# Database backup (SQLite)
cp /var/www/kroniqio/*.db /backup/

# Environment backup
cp /var/www/kroniqio/.env /backup/
```

---
Generated: $(date)
Server: kroniq.io
Mode: Development/Production
Stack: Node.js + React + Nginx + SQLite