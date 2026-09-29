# AARIZO CommunityOS - Complete Hosting & Production Deployment Guide
Stack: **React + Node.js (Express) + Prisma ORM + PostgreSQL**

---

## 1. Hosting Architecture
The entire system is packaged so it can be deployed directly to any host server (Ubuntu/Debian VPS, AWS EC2, DigitalOcean Droplet, Render, Railway, or Google Cloud VM):

- **Frontend**: React 19 (compiled to optimized static assets in `/dist`).
- **Backend API**: Node.js + Express with Prisma ORM (running on Port 5000, serving API endpoints and static React bundle with client routing fallback).
- **Database**: PostgreSQL 16 (running on Port 5432 with native Row-Level Security and automated initialization scripts).

---

## 2. One-Command Host Deployment (Docker)

If hosting on a server with Docker installed:

```bash
docker compose up -d --build
```

### Active Services:
- **Application (React + Node.js + Prisma)**: `http://<your-host-ip>:5000`
- **Database Web Admin (pgweb)**: `http://<your-host-ip>:8081`
- **PostgreSQL Database Port**: `5432`

---

## 3. Direct Host Deployment (Systemd / PM2 on Linux Host)

If hosting directly on a Linux/Windows VM without Docker:

### Step 1: Install PostgreSQL
```bash
sudo apt update && sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE USER aarizo_admin WITH PASSWORD 'aarizo_secure_password_2026';"
sudo -u postgres psql -c "CREATE DATABASE aarizo_community OWNER aarizo_admin;"
```

### Step 2: Initialize Database
```bash
psql -U aarizo_admin -d aarizo_community -f scripts/postgres/01_schema.sql
psql -U aarizo_admin -d aarizo_community -f scripts/postgres/02_rls_policies.sql
psql -U aarizo_admin -d aarizo_community -f scripts/postgres/03_seed.sql
```

### Step 3: Build & Start with PM2
```bash
# Build React frontend
npm run build

# Build Node.js backend
npm run prisma:generate
npm run server:build

# Start with PM2
npm install -g pm2
pm2 start server/dist/index.js --name "aarizo-community"
pm2 save
pm2 startup
```

---

## 4. Production Cloud Deployments

- **Render / Railway**: Point the repository root to `Dockerfile`. Set the environment variable:
  ```env
  DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db>?schema=public
  PORT=5000
  ```
- **Nginx Reverse Proxy Configuration** (for Custom Domain / SSL):
  ```nginx
  server {
      listen 80;
      server_name yourdomain.com;

      location / {
          proxy_pass http://localhost:5000;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
      }
  }
  ```
