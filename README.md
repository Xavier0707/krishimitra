# KrashiMitra AI (कृषि मित्र AI)
> **“Your Farm. Your Data. Smarter Decisions.”**  
> **“आपका खेत। आपका डेटा। बेहतर निर्णय।”**

KrashiMitra is an AI-powered smart agriculture platform helping Indian farmers make informed decisions through live mandi price discovery, weather risk alerts, soil health translation, crop health guidance, profit calculation, and multilingual AI assistance. Designed for usability in rural India, with deep agronomic modeling for **Madhya Pradesh** (Sehore, Indore, Vidisha, Bhopal, Ujjain, Hoshangabad).

---

## 🌾 Overview & Vision

Indian agriculture requires actionable clarity, not generic dashboards. **KrashiMitra AI** addresses genuine operational bottlenecks faced by farmers in rural India:

1. **Where & When to Sell**: Calculating true in-hand returns after freight, labor, handling, and mandi charges rather than relying on headline modal rates alone.
2. **Hyperlocal Weather Risks**: Translating Open-Meteo meteorological models into crop-specific advisories (frost prevention in Gram/Mustard, fungal rust risks during humid weather, rain protection during harvest).
3. **Transparent Crop Doctor**: Plant pathology assistance for leaf/stem symptoms with biological/cultural management first and label-compliant chemical protection with strict disclaimers.
4. **Soil Health Translation**: Interpreting Soil Health Card parameters (pH, EC, Organic Carbon, Available NPK) into explainable crop suitability scores and balanced fertilizer doses.
5. **Smart Storage vs Immediate Sale**: Financial scenario calculator factoring in monthly warehouse fees, moisture weight loss, and break-even selling prices.
6. **Krishi Copilot**: Hindi-first, voice-enabled agricultural decision assistant powered by Google Gemma 4 31B and grounded in verified ICAR & KVK agronomy practices.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 App Router, TypeScript (strict mode)
- **Styling**: Tailwind CSS with nature-inspired Forest Green & Mint design system
- **Icons**: Lucide React
- **Maps**: OpenStreetMap and Leaflet
- **AI Decision Intelligence**: Google Gemma 4 31B (`gemma-4-31b-it`) dense multimodal instruction model powered by official `@google/genai` SDK, with grounded ICAR/KVK agronomy fallback
- **Weather**: Open-Meteo Meteorological API (Open Data)
- **Mandi Feeds**: Official Government of India daily Agmarknet dataset (`api.data.gov.in`) with resilient benchmark fallback
- **Database & Auth**: Supabase PostgreSQL with strict Row Level Security (RLS) & Offline Local Demo Mode
- **Offline / PWA**: IndexedDB / localStorage caching, Service Worker & Manifest
- **Testing**: Vitest unit & integration testing suite (42 tests covering calculations, RAG, and model resilience)

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18.x or 20.x
- npm 9.x or higher

### 1. Clone & Install
```bash
git clone https://github.com/Xavier0707/krishimitra.git
cd krishimitra
npm install
```

### 2. Configure Environment (Optional for Demo Mode)
Copy the example environment configuration:
```bash
cp .env.example .env.local
```

> **Note on Zero-Configuration Demo Mode**:  
> If no external API keys are configured, KrashiMitra AI automatically boots into **Local Demo Mode** with complete verified benchmark data for Sehore, Madhya Pradesh.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Tests
```bash
npm run test
```

---

## 📊 Database Architecture & Migrations

All PostgreSQL schema migrations are stored in `supabase/migrations/`:
- `001_initial_schema.sql`: Normalised schema for profiles, farms, farm_plots, activities, soil_tests, mandi_prices, weather_observations, and storage_scenarios.
- `002_rls_policies.sql`: Complete Row-Level Security ensuring farmers only view and mutate their own farm records.
- `003_seed_demo_data.sql`: Seed benchmark datasets for MP Kharif/Rabi crops and Mandis.

To apply via Supabase Dashboard, run the SQL files in order inside the Supabase SQL Editor.

---

## 🛡️ Data Transparency & Ethical AI Policy

KrashiMitra AI strictly follows transparent agricultural principles:
- **No False Yield Guarantees**: We never claim to guarantee 100% crop yields or disease eradication.
- **Distinction of Data Sources**: Every screen clearly labels whether data is **Live API**, **Cached**, or **Demo Benchmark**.
- **Safe Chemical Prescriptions**: Chemical treatments emphasize label compliance, protective gear, and Economic Threshold Levels (ETL), with strong advisories to consult the nearest Krishi Vigyan Kendra (KVK).

---

## 📄 License & Community

KrashiMitra is open-source software licensed under the [MIT License](LICENSE).
Contributions, localization improvements, and regional agronomy rule additions are warmly welcomed! Please see [CONTRIBUTING.md](CONTRIBUTING.md).
