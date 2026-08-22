# CampusPlus — Production Deployment Runbook & Operations Guide

> **Target Audience:** DevOps Engineers, System Administrators, Full-Stack Developers  
> **Supported Environments:** Docker Compose, Cloud Platforms (Render, Vercel, Railway), Ubuntu/Debian VPS (Nginx + PM2)

---

## 📑 Table of Contents

- [Deployment Architectures](#-deployment-architectures)
- [Option 1: Modern Cloud Deployment (Vercel + Render + Managed DB)](#-option-1-modern-cloud-deployment-vercel--render--managed-db)
- [Option 2: Single Ubuntu VPS Deployment (Docker Compose)](#-option-2-single-ubuntu-vps-deployment-docker-compose)
- [Option 3: Bare-Metal Ubuntu VPS Deployment (Nginx + PM2)](#-option-3-bare-metal-ubuntu-vps-deployment-nginx--pm2)
- [Database Migrations & Maintenance](#-database-migrations--maintenance)
- [Persistent File Storage](#-persistent-file-storage)
- [SSL/TLS Setup with Let's Encrypt](#-ssltls-setup-with-lets-encrypt)
- [Monitoring, Health Checks & Log Management](#-monitoring-health-checks--log-management)

---

## 🏛 Deployment Architectures

```
                              [ User / Client Traffic ]
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │     Cloudflare / CDN / DNS Layer      │
                     └───────────────────┬───────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │    Student Portal SPA     │                   │    Admin Console SPA      │
   │  (Vercel / Netlify/ CDN)  │                   │  (Vercel / Netlify/ CDN)  │
   │  https://report.campus.edu│                   │  https://admin.campus.edu │
   └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         │ REST API / JWT
                                         ▼
                     ┌───────────────────────────────────────┐
                     │          Backend API Service          │
                     │    Node.js / Express / Multer         │
                     │       https://api.campus.edu          │
                     └───────────────────┬───────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │         PostgreSQL Database           │
                     │   Managed DB / Self-Hosted Instance   │
                     └───────────────────────────────────────┘
```

---

## ☁ Option 1: Modern Cloud Deployment (Vercel + Render + Managed DB)

### 1. Database (Neon / Supabase / AWS RDS)
1. Provision a PostgreSQL 14+ database cluster.
2. Retrieve the connection string:
   ```env
   DATABASE_URL="postgresql://user:password@db-host.neon.tech/campusplus?sslmode=require"
   ```

### 2. Backend API (Render / Railway / Fly.io)
1. Create a new **Web Service** connected to your repository.
2. Set **Root Directory:** `backend`
3. Set **Build Command:**
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy
   ```
4. Set **Start Command:**
   ```bash
   npm start
   ```
5. Configure Environment Variables in the platform dashboard:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `DATABASE_URL=<Your_Production_DB_URL>`
   - `JWT_SECRET=<Generate_Secure_64_Char_Key>`
   - `JWT_EXPIRES_IN=8h`
   - `CORS_ORIGIN=https://report.yourdomain.edu,https://admin.yourdomain.edu`
   - `UPLOAD_DIR=./uploads`
   - `MAX_FILE_SIZE_MB=5`
6. Attach a **Persistent Disk** mounted at `/var/data/uploads` (or set `UPLOAD_DIR=/var/data/uploads`) to retain uploaded evidence photos across redeployments.

### 3. Frontends (Vercel / Netlify)
Deploy `student-app` and `admin-app` as two separate Vercel projects:

#### Project A: Student Portal
- **Framework Preset:** Vite
- **Root Directory:** `student-app`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variable:** `VITE_API_BASE_URL=https://api.yourdomain.edu/api/v1`

#### Project B: Admin Console
- **Framework Preset:** Vite
- **Root Directory:** `admin-app`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variable:** `VITE_API_BASE_URL=https://api.yourdomain.edu/api/v1`

---

## 🐳 Option 2: Single Ubuntu VPS Deployment (Docker Compose)

Create a production `docker-compose.prod.yml` on your server:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: campusplus
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: campusplus_prod
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - campusplus_net

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      NODE_ENV: production
      PORT: 5000
      DATABASE_URL: postgresql://campusplus:${DB_PASSWORD}@postgres:5432/campusplus_prod
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: https://${DOMAIN_NAME}
      UPLOAD_DIR: /app/uploads
    volumes:
      - uploads_data:/app/uploads
    depends_on:
      - postgres
    networks:
      - campusplus_net

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./student-app/dist:/var/www/student:ro
      - ./admin-app/dist:/var/www/admin:ro
      - uploads_data:/var/www/uploads:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - backend
    networks:
      - campusplus_net

volumes:
  pgdata:
  uploads_data:

networks:
  campusplus_net:
    driver: bridge
```

Launch the stack:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 🖥 Option 3: Bare-Metal Ubuntu VPS Deployment (Nginx + PM2)

### 1. Install Node.js, PostgreSQL & PM2
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx postgresql postgresql-contrib

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 Process Manager
sudo npm install -g pm2
```

### 2. Clone & Build
```bash
cd /var/www
sudo git clone https://github.com/your-username/CampusPlus.git campusplus
cd campusplus
sudo chown -R $USER:$USER /var/www/campusplus

# Install dependencies & build
npm install
npm --prefix student-app run build
npm --prefix admin-app run build
```

### 3. Run Migrations & Start Backend with PM2
```bash
cd /var/www/campusplus/backend
npx prisma migrate deploy
node prisma/seedReports.js # Optional initial seed

# Start API in PM2 Cluster Mode
pm2 start src/server.js --name "campusplus-api" -i max
pm2 save
pm2 startup
```

### 4. Configure Nginx
Create `/etc/nginx/sites-available/campusplus`:

```nginx
server {
    listen 80;
    server_name campusplus.yourdomain.edu;

    # Static file uploads
    location /uploads/ {
        alias /var/www/campusplus/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin App
    location /admin {
        alias /var/www/campusplus/admin-app/dist;
        try_files $uri $uri/ /admin/index.html;
    }

    # Student Portal (Root)
    location / {
        root /var/www/campusplus/student-app/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/campusplus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 💾 Database Migrations & Maintenance

### Applying Production Migrations
Always apply schema migrations using the deploy command:
```bash
npx prisma migrate deploy
```

### Automated Daily PostgreSQL Backups (Cron Job)
Create `/usr/local/bin/backup_campusplus_db.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/campusplus_db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR

pg_dump -U postgres campusplus_prod | gzip > "$BACKUP_DIR/campusplus_$TIMESTAMP.sql.gz"

# Retain backups for 14 days
find $BACKUP_DIR -name "campusplus_*.sql.gz" -mtime +14 -delete
```
Make executable and schedule in crontab:
```bash
chmod +x /usr/local/bin/backup_campusplus_db.sh
# Run daily at 02:00 AM
0 2 * * * /usr/local/bin/backup_campusplus_db.sh
```

---

## 🔒 SSL/TLS Setup with Let's Encrypt

Obtain a free SSL certificate via Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d campusplus.yourdomain.edu
```

---

## 📊 Monitoring, Health Checks & Log Management

1. **Health Check Endpoint:** Configure external monitors (UptimeRobot, BetterUptime) to ping:
   `https://api.yourdomain.edu/api/v1/health` (Expects `200 OK`).
2. **PM2 Process Monitoring:**
   ```bash
   pm2 status
   pm2 logs campusplus-api
   pm2 monit
   ```
3. **Structured Logs:** Pino logs JSON to stdout, which integrates automatically with Datadog, Grafana Loki, or CloudWatch.
