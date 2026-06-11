# Spectra Elite #38: Deployment and Configuration Guide

This document describes how to deploy, seed, and run the **Spectra Elite #38** PG, Coliving, Airbnb, and Rental Property Management Platform in production.

---

## 🏗️ Architecture Summary

Spectra Elite operates on a highly optimized, single-port full-stack architecture:
1. **Frontend**: Rich client-side SPA written in **TS/React 19** with **Tailwind CSS**, fully responsive, and compiled using **Vite**.
2. **Backend**: Custom REST API powered by **Express (Node.js)** handling CRM, PMS, automatic rent invoicing, housekeeping rosters, and simulated notification logs.
3. **Database**: Built-in, zero-config, localized ledger system using dynamic file-backed backups for the sandbox, with full schema readiness for **PostgreSQL**.

---

## 🐳 Quickstart: Docker Compose

The simplest way to spin up the entire application along with a dedicated PostgreSQL database server is via Docker Compose.

### Prerequisites
- Install **Docker** and **Docker Compose** on your host server.

### Steps
1. **Clone & Navigate** to the codebase container directory.
2. **Launch with Compose**:
   ```bash
   docker-compose up -d --build
   ```
3. Docker Compose will:
   - Start a PostgreSQL database container initialized on port `5432`.
   - Build a multi-stage production Docker image of the full-stack App.
   - Serve the application on port `3000`.
4. **Access the Application**: Open `http://localhost:3000` in your browser.

---

## 🗄️ Setting Up Your Relational PostgreSQL Database

We have included a complete, production-ready schema in `/database.sql`. To import it into your live PostgreSQL instances:

1. **Access your server terminal**:
   ```bash
   psql -h localhost -U spectra_admin -d spectra_db -f database.sql
   ```
2. For automated migrations in production Node backends, you can integrate standard ORMs such as **Prisma** or **Drizzle** utilizing the included schema mappings.

---

## ☁️ Deploying to Cloud Hosts (Heroku, Cloud Run, VPS)

### Option A: Serverless Deploy (Google Cloud Run / AWS Fargate)
Because the application is stateless and bundles both frontend assets and backend APIs on a single port (`3000`), it is perfectly optimized for cheap, serverless container hosting:

1. Build your container:
   ```bash
   docker build -t gcr.io/your-project/spectra-elite:latest .
   ```
2. Push and Deploy to Cloud Run, mapping port `3000` to your public TLS domains.

### Option B: VPS Host (Ubuntu + PM2)
If hosting on an AWS EC2 or DigitalOcean Droplet:

1. Install Node.js v20+ and global PM2:
   ```bash
   sudo npm install -g pm2
   ```
2. Build the applet:
   ```bash
   npm install
   npm run build
   ```
3. Run the compiled CommonJS server bundle:
   ```bash
   pm2 start dist/server.cjs --name "spectra-elite"
   ```

---

## ⚙️ Environment Variables Config File (`.env`)

Configure the following variables in your production environment:

| Variable Name | Description | Example Value |
|---|---|---|
| `PORT` | Bind port for Express app (default: 3000) | `3000` |
| `DATABASE_URL` | Full connection URI to your PostgreSQL instance | `postgresql://user:pass@host:5432/db` |
| `GEMINI_API_KEY` | Optional Google GenAI API Secret | `AIzaSy...` |
| `APP_URL`| The self-referential public endpoint domain URL | `https://spectra-elite.com` |

---

*Enjoy running Spectra Elite #38, the ultimate digital transformation suite for PG & Coliving franchises !*
