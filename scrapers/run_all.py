"""
Orchestrator. Runs each scraper, merges results by parcel ID,
recalculates motivation scores, and writes docs/data/records.json.

Each scraper module exposes a `scrape() -> list[dict]` function.
Records are merged by parcel ID — flags from different sources stack.
"""
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Add this directory to import path
sys.path.insert(0, str(Path(__file__).parent))

# Import scraper modules — each has a scrape() function
from gis import scrape as scrape_gis
from sheriff_tax_sale import scrape as scrape_sheriff
from legal_organ import scrape as scrape_legal
from atlanta_accela import scrape as scrape_accela
from gsccca_liens import scrape as scrape_gsccca
from manual_intake import scrape as scrape_manual

DATA_PATH = Path(__file__).parent.parent / "docs" / "data" / "records.json"


def merge_records(existing: list[dict], incoming: list[dict]) -> list[dict]:
    """Merge incoming records into existing by parcel ID."""
    by_parcel = {r.get("parcel"): r for r in existing if r.get("parcel")}
    for rec in incoming:
        parcel = rec.get("parcel")
        if not parcel:
            continue
        if parcel in by_parcel:
            # Merge: keep existing fields, update with new flags
            by_parcel[parcel].update({k: v for k, v in rec.items() if v is not None})
        else:
            by_parcel[parcel] = rec
    return list(by_parcel.values())


def load_existing() -> dict:
    """Load the current records.json so we can preserve user-edited fields."""
    if DATA_PATH.exists():
        try:
            with open(DATA_PATH) as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    return {"records": [], "source": "demo", "county": "Fulton", "state": "GA"}


def main():
    print("Fulton County scraper — starting")
    existing_data = load_existing()
    records = list(existing_data.get("records", []))

    scrapers = [
        ("GIS Open Data", scrape_gis),
        ("Sheriff Tax Sale", scrape_sheriff),
        ("Legal Organ", scrape_legal),
        ("Atlanta Accela", scrape_accela),
        ("GSCCCA Liens", scrape_gsccca),
        ("Manual Intake", scrape_manual),
    ]

    for name, fn in scrapers:
        try:
            print(f"  → {name}")
            new_records = fn()
            print(f"    got {len(new_records)} records")
            records = merge_records(records, new_records)
        except Exception as e:
            # Don't let one scraper break the whole job
            print(f"    ERROR: {e}")
            continue

    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": "live" if any(records) else "demo",
        "county": "Fulton",
        "state": "GA",
        "records": records,
    }

    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_PATH, "w") as f:
        json.dump(output, f, indent=2)
    print(f"Wrote {len(records)} records to {DATA_PATH}")


if __name__ == "__main__":
    main()
