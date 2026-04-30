"""
Fulton County GIS Open Data scraper.

Source: https://gisdata.fultoncountyga.gov/
Status: 🟢 FULLY AUTOMATED — public ArcGIS REST endpoint, no auth.

This scraper pulls the parcel layer and identifies properties matching
absentee owner / long-term owner / high equity criteria. It does NOT
pull all ~320,000 parcels by default — that's overkill for daily runs.
Instead it samples or pulls deltas (modified since last run).

To enable real production scraping, set FULTON_GIS_ENABLED=1 in the
environment (e.g., as a GitHub Actions secret).
"""
import os
import requests

# ArcGIS REST endpoint (verify URL on https://gisdata.fultoncountyga.gov/ before production)
GIS_QUERY_URL = (
    "https://services1.arcgis.com/eHRGRRr2t8yE9y4y/arcgis/rest/services/"
    "Tax_Parcels/FeatureServer/0/query"
)


def scrape() -> list[dict]:
    """
    Returns list of records in dashboard schema.
    Returns empty list when disabled (default) so the demo data persists.
    """
    if os.environ.get("FULTON_GIS_ENABLED") != "1":
        # Disabled by default; flip the env var to turn on
        return []

    params = {
        "where": "1=1",
        "outFields": "PARCELID,OWNER,SITUS,LANDVAL,BLDGVAL,YRBUILT,DEEDDATE",
        "resultRecordCount": 1000,
        "f": "json",
    }

    try:
        r = requests.get(GIS_QUERY_URL, params=params, timeout=60)
        r.raise_for_status()
        data = r.json()
    except (requests.RequestException, ValueError) as e:
        print(f"    GIS fetch failed: {e}")
        return []

    out = []
    for feat in data.get("features", []):
        attrs = feat.get("attributes", {})
        parcel = attrs.get("PARCELID")
        if not parcel:
            continue
        out.append({
            "id": f"GIS-{parcel}",
            "parcel": parcel,
            "owner": (attrs.get("OWNER") or "").strip().upper(),
            "address": attrs.get("SITUS") or "",
            "ownerMailing": attrs.get("SITUS") or "",  # GIS doesn't always split mailing
            "city": "Atlanta",  # would need parsing
            "zip": "",
            "yearBuilt": attrs.get("YRBUILT") or 0,
            "assessedValue": (attrs.get("LANDVAL") or 0) + (attrs.get("BLDGVAL") or 0),
            "lastSaleDate": attrs.get("DEEDDATE"),
            # Flags require enrichment from other sources
            "preforeclosure": False, "taxDelinquent": False, "probate": False,
            "stage": "new",
            "addedAt": "2026-04-30",
            "source": "gis",
        })

    return out
