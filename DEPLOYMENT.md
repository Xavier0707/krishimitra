# KrishiConnect AI — Zero-Cost Architecture & Deployment Guide (₹0 / Month)

This document provides a comprehensive operational manual for running, configuring, and deploying **KrishiConnect AI** on a **₹0 / month budget** using free-first open-source services.

---

## 1. Zero-Cost Technology Stack Overview

Every service chosen operates within an eligible free tier that requires no upfront credit card commitment:

| Component | Provider / Tool | Free Tier Limits | Failover / Fallback Behavior |
| :--- | :--- | :--- | :--- |
| **Frontend & SSR** | Next.js 14 (App Router) + TypeScript | Open Source (Self-hostable) | N/A |
| **Hosting** | Cloudflare Pages / Vercel Free | Unlimited bandwidth / 100k requests/day | Static build & serverless functions |
| **Free Subdomain** | `*.pages.dev` or `*.vercel.app` | 100% Free included | Custom domains optional |
| **Authentication & DB** | Supabase Free Tier | 50,000 monthly active users, 500MB PostgreSQL | **Automatic Local Demo Mode**: full local storage and offline calculations if unconfigured |
| **Meteorological Data** | Open-Meteo API | Free for non-commercial use (up to 10,000 calls/day) | Built-in cached meteorological observations for Central MP |
| **Agricultural Mandi Data** | data.gov.in / Agmarknet | Free daily API key registration | Central MP verified APMC benchmark cache (Sehore, Indore, Vidisha, Bhopal) |
| **AI Decision Support** | Google Gemini 1.5 Flash / Local RAG | Free tier: 15 RPM, 1,500 requests/day | **KrishiConnect Domain Agronomy Engine**: deterministic ICAR & KVK rule-based RAG |
| **Offline Vault** | IndexedDB & LocalStorage | Browser local storage quota (50MB+) | Offline sync queue with timestamp synchronization |
| **Testing Suite** | Vitest | Open Source | 26 unit & integration tests passing |

---

## 2. Local Installation & Verification

### Prerequisites
- Node.js v20.x or later
- npm v10.x or later

### Quick Start
```bash
# 1. Clone repository
git clone https://github.com/your-username/krishiconnect-ai.git
cd krishiconnect-ai

# 2. Install dependencies
npm install

# 3. Setup environment configuration
cp .env.example .env.local

# 4. Run automated test suite (all 26 tests must pass)
npm test

# 5. Build production bundle
npm run build

# 6. Launch production server
npm start
# -> Access at http://localhost:3000
```

---

## 3. Environment Variables & Secret Security

KrishiConnect strictly isolates client and server credentials:

| Variable | Scope | Mandatory? | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Public (Client) | No (defaults to `http://localhost:3000`) | Base application URL |
| `NEXT_PUBLIC_APP_NAME` | Public (Client) | No | Platform branding label |
| `NEXT_PUBLIC_DEFAULT_REGION` | Public (Client) | No (defaults to `Madhya Pradesh`) | Primary agricultural region |
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client) | No (Optional) | Supabase project URL (`https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client) | No (Optional) | Public Supabase anon/publishable token |
| `SUPABASE_SERVICE_ROLE_KEY` | **Private (Server ONLY)** | No | Database administration; **NEVER** expose to client |
| `OPEN_METEO_BASE_URL` | Server | No (defaults to Open-Meteo free API) | Weather endpoint URL |
| `DATA_GOV_IN_API_KEY` | **Private (Server ONLY)** | No (Optional) | Free API key from data.gov.in for live Agmarknet feeds |
| `AI_PROVIDER` | Server | No (`gemini` or `mock`) | AI provider selector |
| `GEMINI_API_KEY` | **Private (Server ONLY)** | No (Optional) | Google AI Studio free-tier API token |

> [!IMPORTANT]
> **No Secrets in Frontend Bundles**: `DATA_GOV_IN_API_KEY`, `GEMINI_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are never prefixed with `NEXT_PUBLIC_` and are strictly accessed inside server-side route handlers (`/api/mandi`, `/api/copilot`).

---

## 4. Zero-Cost Database Setup (Supabase Free)

1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project (e.g. `krishiconnect-mp`). Choose the AWS Mumbai (`ap-south-1`) region for lowest latency to India.
3. In the Supabase SQL Editor, execute the migration files sequentially:
   - [`supabase/migrations/001_initial_schema.sql`](file:///c:/Users/karti/Downloads/krishiconnect/supabase/migrations/001_initial_schema.sql): Creates all 14 tables including `profiles`, `farms`, `farm_plots`, `farm_activities`, `soil_tests`, `crop_assessments`, `saved_profit_scenarios`, and `decision_reports`.
   - [`supabase/migrations/002_rls_policies.sql`](file:///c:/Users/karti/Downloads/krishiconnect/supabase/migrations/002_rls_policies.sql): Enables Row Level Security (RLS) on all user-owned tables ensuring complete privacy.
   - [`supabase/migrations/003_seed_demo_data.sql`](file:///c:/Users/karti/Downloads/krishiconnect/supabase/migrations/003_seed_demo_data.sql): Seeds ICAR crop benchmarks and Central MP mandi quotes.
4. Copy `Project URL` and `anon public` key to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

---

## 5. Free API Keys Setup

### A. Weather (Open-Meteo) — No Key Needed
Open-Meteo is completely free for non-commercial use up to 10,000 calls per day. No registration or credit card is required.

### B. Agricultural Mandi Prices (data.gov.in) — Free
1. Register for a free citizen developer account at [data.gov.in](https://data.gov.in).
2. Generate an API Key under "My Account" > "API Key".
3. Add to `.env.local` or host secrets:
   ```env
   DATA_GOV_IN_API_KEY=your_key_here
   ```
4. *If unconfigured:* KrishiConnect automatically falls back to verified Central MP benchmark prices with clear demonstration badges.

### C. Krishi Copilot (Google Gemini Free Tier) — Free
1. Go to [Google AI Studio](https://aistudio.google.com).
2. Create a free API Key for `gemini-1.5-flash`.
3. Add to `.env.local`:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=AIzaSy...
   ```
4. *If unconfigured:* KrishiConnect automatically uses its local deterministic agronomic RAG engine containing ICAR-IIWBR and KVK Sehore guidance.

---

## 6. Production Deployment Options (Zero Cost)

### Option A: Cloudflare Pages (Recommended)
1. Push your code to GitHub (Free tier).
2. Connect your repository to **Cloudflare Pages** via the Cloudflare dashboard.
3. Configure build settings:
   - **Framework Preset**: Next.js or None
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (or `out` for static exports)
4. Add environment variables in Cloudflare Pages > Settings > Environment variables:
   - `DATA_GOV_IN_API_KEY` (Secret)
   - `GEMINI_API_KEY` (Secret)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Cloudflare automatically assigns a free SSL-secured subdomain: `https://krishiconnect.pages.dev`.

### Option B: Vercel Free Tier
1. Import repository on [vercel.com](https://vercel.com).
2. Vercel automatically detects Next.js App Router.
3. Set environment variables.
4. Deploy to free production URL: `https://krishiconnect.vercel.app`.

---

## 7. Troubleshooting & Recovery Procedures

| Issue | Root Cause | Resolution |
| :--- | :--- | :--- |
| **data.gov.in 403 or Timeout** | Gov API key invalid or portal under maintenance | The app catches the error after an 8-second timeout and serves verified MP benchmark quotes with a yellow banner explaining the state. |
| **Gemini 429 Rate Limit** | Free tier limit (15 requests/min) exceeded | Krishi Copilot catches 429 status and immediately falls back to the deterministic ICAR local knowledge base. |
| **Supabase Inactivity Pause** | Supabase free projects pause after 7 days of inactivity | Open the Supabase dashboard and click "Restore Project", or use KrishiConnect in Local Demo Mode with zero data loss in IndexedDB. |
| **GPS Location Denied** | Farmer clicked "Block" on browser geolocation prompt | The app displays an informative error card and preserves the MP District selector dropdown. |
