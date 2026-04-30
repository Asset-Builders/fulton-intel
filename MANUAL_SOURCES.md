# Manual Data Sources — Step by Step

These sources can't be scraped reliably. Here's exactly what to do for each.

---

## 1. Delinquent Tax List (Tax Commissioner)

**What it is:** the full list of every property in Fulton with any unpaid tax balance from any prior year. The Sheriff's monthly sale list only shows properties levied for sale — this list is broader.

**Cadence:** quarterly is enough. Monthly is overkill.

### Steps

1. Go to https://fultoncountyga.nextrequest.com/
2. Click **Sign Up** if you don't have an account, otherwise **Sign In**
3. Click **New Request**
4. Department: **Tax Commissioner**
5. Paste this exact text:
   > I request a current list of all real property accounts with delinquent property taxes (any unpaid balance from any prior tax year). For each account I request: parcel ID, property address, owner name and mailing address, total balance due, and year of oldest unpaid bill. Format: Excel or CSV preferred. I'll cover any reasonable copy fee.
6. Submit.
7. Within 3–10 business days you'll get a notification with a downloadable file. Pay whatever copy fee they assess (typically $25–$100).
8. Convert to CSV if it's Excel.
9. Rename to `tax_delinquent_<YYYY-Q#>.csv` (e.g., `tax_delinquent_2026-Q2.csv`).
10. Required columns: `parcel`, `address`, `owner`, `ownerMailing` (the rest is optional).
11. Drop in `scrapers/manual_intake/`, commit and push.

The next workflow run picks it up and flags everything in the file as `taxDelinquent: true`.

---

## 2. Probate Filings

**What it is:** estates opened in Fulton Probate Court. Decedents from the past 12–18 months with real property are high-value motivated-seller leads.

**The honest reality:** Fulton Probate has no online docket. Three options:

### Option A — Use the legal organ proxy (recommended)

Probate notices (Citation to Administer, Notice of Petition, Year's Support) are required by law to be published in the South Fulton Neighbor for 4 weeks. The `legal_organ.py` scraper can pick these up automatically (when enabled). You'll catch ~80% of new estates within 60 days of opening.

**Action:** turn on `FULTON_LEGAL_ENABLED=1` in repo Variables. No manual work.

### Option B — Buy from a third-party data provider

Several services aggregate GA probate data and resell it:
- **US Probate Leads** — ~$80–$200/month for Fulton
- **ProbatePlus**
- **ProbatePro**

You'd download their CSV, rename to `probate_<YYYY-MM>.csv`, drop in `scrapers/manual_intake/`, commit. Same as the delinquent tax list above.

CSV columns needed: `parcel`, `address`, `owner`, `decedentName`, `decedentDOD`.

### Option C — In person at the courthouse

Probate Records Division, 136 Pryor St SW, 2nd floor. They keep a physical filing log. Realistic? Probably not for ongoing monitoring.

---

## 3. Vacant Property Registry

**What it is:** Atlanta and several other Fulton municipalities require owners of vacant residential properties to register them within 60 days, including a local agent contact. Goldmine because the owner is on record as not occupying the property.

**Cadence:** every 6 months. Owners must re-register annually.

### Atlanta

1. Email `codesrequests@atlantaga.gov`
2. Subject: "Open Records Request — Vacant Property Registry"
3. Body:
   > Pursuant to the Georgia Open Records Act, I request a current copy of the Vacant Property Registry maintained by the Atlanta Police Code Enforcement Section per Atlanta Housing Code Article VI, including parcel ID, property address, owner name, owner mailing address, and registered local agent contact information. Format: Excel or CSV preferred.
4. Response in 2–4 weeks.
5. Rename to `vacant_registry_atlanta_<YYYY-Q#>.csv`. Drop in `scrapers/manual_intake/`. Commit.

### Other Fulton cities

Each has its own process. Most common ones:

- **South Fulton:** form at https://www.cityofsouthfultonga.gov/3252/Vacant-Abandoned-Property-Request
- **Sandy Springs:** Open Records request via city clerk
- **Roswell, Alpharetta, Johns Creek, Milton, East Point, College Park, Hapeville, Fairburn, Union City, Palmetto, Chattahoochee Hills, Mountain Park** — submit Open Records request to each city's clerk office

If you only have time for one, Atlanta is the highest-value (largest housing stock + most distress).

---

## 4. Bankruptcy (PACER)

**What it is:** federal bankruptcy filings, Northern District of Georgia. Property in active Chapter 13 may be saleable through the bankruptcy court.

**Cadence:** case-by-case only. Bulk pulls are not allowed.

### Steps

1. Sign up at https://pacer.uscourts.gov/ (free signup)
2. When a high-value lead is identified by other signals (e.g., pre-foreclosure + high equity), do a party search: https://pcl.uscourts.gov/pcl/
3. $0.10/page. Fees capped at $30/quarter for occasional users.
4. If the owner has an active filing, note the case number and trustee. Their interest in selling may be different (court approval required).

PACER data does not flow into the dashboard automatically. Use it as a manual due-diligence step on hot leads.

---

## 5. Municipal Code Enforcement (non-Atlanta cities)

**What it is:** code violation case files for cities other than Atlanta. The dashboard's `atlanta_accela.py` scraper covers Atlanta only.

**Cadence:** quarterly per city.

### Steps

For each city you want to cover:

1. Find the city's clerk or code enforcement office contact
2. File an Open Records request: "Current open code enforcement cases including parcel, property address, violation type, and case status"
3. Convert response to CSV
4. Rename to `code_violations_<city>_<YYYY-Q#>.csv` and drop in `scrapers/manual_intake/`

CSV columns needed: `parcel`, `address`, `owner`, optional `codeIssues` (semicolon-separated list).

The intake will flag these as `codeViolations: true`. You'd want to tweak `manual_intake.py` to recognize the filename prefix `code_violations_*`.

---

## Setting expectations

For full coverage of all 11 sources, expect:

- **One-time setup:** 10–15 hours building Open Records relationships, signing up for accounts, learning each portal
- **Ongoing per quarter:** ~4 hours filing requests, processing CSVs, dropping into the repo
- **Per month:** ~30 minutes confirming the auto scrapers ran and reviewing new leads

If you're doing more than ~15 hours/month on data acquisition, hire a VA. The work is repetitive once the templates are set.
