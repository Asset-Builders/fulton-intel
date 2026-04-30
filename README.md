# Fulton County Intel

Motivated seller intelligence dashboard for Fulton County, Georgia. Aggregates pre-foreclosure, tax-delinquent, probate, code-violation, vacant-property, and lien data; scores each lead 0–100; supports skip-trace and Go High Level CSV exports.

**Live dashboard** (after deploy): `https://<your-username>.github.io/fulton-intel/`

---

## What's automated and what's manual

| Source | Status | Cadence |
|---|---|---|
| Fulton GIS Open Data | 🟢 Auto (when enabled) | Quarterly |
| Sheriff Tax Sale PDF | 🟡 Semi-auto | Monthly |
| South Fulton Neighbor (legal organ) | 🟡 Semi-auto | Weekly |
| Atlanta Accela code enforcement | 🟡 Semi-auto | Weekly |
| GSCCCA Lien Index (paid acct required) | 🟡 Semi-auto | Weekly |
| Delinquent tax list (full) | 🔴 Manual via Open Records | Quarterly |
| Probate filings | 🔴 Manual or via legal organ | N/A |
| Vacant property registries (per city) | 🔴 Manual via Open Records | Quarterly |
| Bankruptcy (PACER) | 🔴 Manual, paid, case-by-case | N/A |
| Other municipal code (14 cities) | 🔴 Manual via Open Records | Quarterly |

See `MANUAL_SOURCES.md` for step-by-step instructions on the manual sources.

---

## Repo structure

```
fulton-intel/
├── docs/
│   ├── index.html            ← landing page (GitHub Pages serves this)
│   ├── dashboard.js          ← all dashboard logic
│   └── data/
│       └── records.json      ← lead data; refreshed by GitHub Action
├── scrapers/
│   ├── run_all.py            ← orchestrator
│   ├── requirements.txt      ← Python deps
│   ├── gis.py                ← GIS Open Data
│   ├── sheriff_tax_sale.py   ← Sheriff PDF
│   ├── legal_organ.py        ← South Fulton Neighbor
│   ├── atlanta_accela.py     ← Atlanta code enforcement
│   ├── gsccca_liens.py       ← GSCCCA lien index
│   ├── manual_intake.py      ← processes CSVs in manual_intake/
│   └── manual_intake/        ← drop CSVs here for one-time imports
└── .github/workflows/
    └── scrape.yml            ← daily cron job
```

---

## To deploy

1. **Create a new GitHub repo** named `fulton-intel` (private or public, your call). Don't initialize with README, .gitignore, or license.

2. **From your Mac terminal**, in the unzipped folder:
   ```bash
   cd path/to/fulton-intel
   git init
   git add .
   git commit -m "Initial fulton-intel commit"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/fulton-intel.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - In the repo on github.com, go to **Settings → Pages**
   - **Source:** Deploy from a branch
   - **Branch:** `main`, folder: `/docs`
   - Save. Wait ~60 seconds.
   - Your dashboard is live at `https://<username>.github.io/fulton-intel/`

4. **Verify the GitHub Action runs**:
   - Go to **Actions** tab on github.com
   - The `Scrape Fulton County data` workflow shows up. Click it → **Run workflow** → **Run** to trigger manually.
   - First run will use demo data because all scrapers are off by default.

5. **Enable scrapers one at a time** as you verify each works:
   - Go to **Settings → Secrets and variables → Actions → Variables** (the Variables tab, not Secrets)
   - Add `FULTON_GIS_ENABLED=1` to start with the safest scraper (GIS Open Data)
   - Re-run the workflow. Confirm `records.json` gets updated.
   - Add `FULTON_SHERIFF_ENABLED=1`, `FULTON_LEGAL_ENABLED=1`, etc., as you verify each one in turn.

---

## Manual data drops

When you get an Open Records response (CSV or Excel from Fulton's NextRequest portal):

1. Convert to CSV if it's Excel
2. Rename based on source:
   - `tax_delinquent_2026-Q2.csv` for Tax Commissioner delinquent list
   - `vacant_registry_atlanta_2026-Q2.csv` for vacant property registries
   - `probate_2026-04.csv` for probate filings
3. Drop the CSV into `scrapers/manual_intake/`
4. Commit and push. The next scheduled workflow run picks it up and merges into the dashboard.

CSV must have a `parcel` column. See `scrapers/manual_intake.py` for full column conventions.

---

## Local development

You can preview the dashboard locally without deploying:

```bash
cd docs
python3 -m http.server 8000
# open http://localhost:8000
```

Or just open `docs/index.html` directly in a browser (some features need a local server because of CORS — running the Python server above is safest).

---

## Scoring rules

| Trigger | Points | Hot? |
|---|---|---|
| Pre-foreclosure (NOSUP filed) | +40 | 🔥 |
| Probate (decedent < 18mo) | +35 | 🔥 |
| Tax delinquent | +30 | |
| Registered vacant property | +25 | |
| Heir property (no probate) | +22 | |
| Active code violations | +20 | |
| Landlord with multiple evictions | +20 | |
| Lien filed | +18 | |
| Divorce filed | +18 | |
| Out-of-state owner | +15 | |
| High equity (>50%) | +15 | |
| Owned > 15 years | +10 | |
| **Stacking bonus**: 2+ triggers | +10 | |
| **Stacking bonus**: 3+ triggers | +20 | |

Final score is capped at 100. 70+ is "hot." 90+ is blazing.

---

## License

Private project. Not for redistribution.
