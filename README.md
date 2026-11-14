# BhopalAIR by Prateek
### Civic Air Quality Briefing Studio

A connected civic intelligence platform designed to convert raw, messy air-quality sensor data into structured analysis, persona-tailored operational interventions, and multi-lingual citizen advisories for Bhopal and urban municipal zones.

## 🌟 Hackathon-Ready Key Features

- **Messy Data Ingestion Engine**: Accepts CSV, Excel (`.xlsx`), and raw pasted sensor feeds. Normalizes varied column headers, handles missing attributes, and validates physical plausibility (flagging sensor anomalies such as PM2.5 > PM10).
- **Target Persona Intelligence**: Generates role-calibrated interventions for:
  - 🏛️ **Municipal & Ward Authorities**: Anti-smog mist cannon routing, traffic diversion, waste-burning enforcement.
  - 🏡 **Housing Societies / RWAs**: Resident vulnerability alerts, common driveway wet-sweeping, construction pauses.
  - 🏫 **Schools & Educational Campuses**: Outdoor activity & recess protocols, bus drop-off engine idling restrictions.
- **Traceable Decision Matrices**: Every recommendation links directly back to specific sensor data points and detected micro-hotspots.
- **Multi-Lingual Citizen Advisories**: Generates broadcasts in both English and Hindi at multiple reading levels (General Citizen & School-Child/Easy-Read).
- **Historical Baseline Comparison**: Ingest previous monitoring runs to calculate delta trends (Improving, Stable, Deteriorating).
- **Interactive Visualizations**: Spatial concentration comparison (PM2.5 vs PM10) and temporal curve progression powered by Recharts.
- **Strict ₹0 Budget Compliance & Demo Mode**: Full functionality without requiring any paid subscriptions. If no Google Gemini API key is configured or free-tier quotas are reached, high-fidelity civic heuristics seamlessly take over.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Lucide React Icons
- **Data Visualization**: Recharts
- **Parsing & Schemas**: PapaParse, XLSX, Zod
- **AI Integration**: Official Google Gemini SDK (`@google/genai`), configurable via `GEMINI_MODEL` (`gemini-2.5-flash`)

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd civic-air-quality-studio
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(Optional) Add your free Google Gemini API key from [Google AI Studio](https://aistudio.google.com/). If omitted, the studio operates in offline Demo Mode with complete functionality.*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment to Vercel (Free Tier)

1. Push your code to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/civic-air-quality-briefing-studio.git
   git push -u origin main
   ```
2. Log into [Vercel](https://vercel.com) and click **Add New** &rarr; **Project**.
3. Import this GitHub repository.
4. Click **Deploy**. Vercel will automatically detect Next.js and build the application.
