"""
Manual intake scraper.

Status: 🔴 MANUAL — but ingests structured CSVs that you put into the
scrapers/manual_intake/ folder.

When you receive Open Records responses (Tax Commissioner delinquent list,
Vacant Property Registry, probate filings, etc.), drop the CSV into
scrapers/manual_intake/ and commit. The next workflow run picks it up,
parses by source, merges into records.json.

Expected filenames (case-insensitive):
  tax_delinquent_*.csv     → sets taxDelinquent: True
  vacant_registry_*.csv    → sets vacant: True
  probate_*.csv            → sets probate: True
  bankruptcy_*.csv         → sets bankruptcy info
  custom_*.csv             → freeform; merge by parcel

CSV must have 'parcel' column. Other recognized columns:
  address, owner, ownerMailing, city, zip, decedentName, decedentDOD
"""
import csv
import os
from pathlib import Path

INTAKE_DIR = Path(__file__).parent / "manual_intake"


def scrape() -> list[dict]:
    if not INTAKE_DIR.exists():
        return []

    out = []
    for csv_path in INTAKE_DIR.glob("*.csv"):
        name = csv_path.stem.lower()

        # Determine flags based on filename prefix
        flags = {}
        if name.startswith("tax_delinquent"):
            flags["taxDelinquent"] = True
        elif name.startswith("vacant_registry") or name.startswith("vacant"):
            flags["vacant"] = True
        elif name.startswith("probate"):
            flags["probate"] = True
        elif name.startswith("bankruptcy"):
            pass  # No specific flag in current scoring rules

        try:
            with open(csv_path, newline="", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    parcel = (row.get("parcel") or row.get("Parcel") or "").strip()
                    if not parcel:
                        continue
                    rec = {
                        "id": f"INTAKE-{parcel}",
                        "parcel": parcel,
                        "owner": (row.get("owner") or "").strip().upper(),
                        "address": row.get("address") or "",
                        "ownerMailing": row.get("ownerMailing") or row.get("address") or "",
                        "city": row.get("city") or "Atlanta",
                        "zip": row.get("zip") or "",
                        "stage": "new",
                        "addedAt": "2026-04-30",
                        "source": f"manual_intake:{csv_path.name}",
                        **flags,
                    }
                    # Probate-specific fields
                    if "decedentName" in row:
                        rec["decedentName"] = row["decedentName"]
                    if "decedentDOD" in row:
                        rec["decedentDOD"] = row["decedentDOD"]
                    out.append(rec)
        except Exception as e:
            print(f"    failed to parse {csv_path.name}: {e}")
            continue

    return out
