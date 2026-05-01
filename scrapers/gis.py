"""
Fulton County GIS Tax Parcel scraper.

Source: https://gismaps.fultoncountyga.gov/arcgispub2/rest/services/PropertyMapViewer/PropertyMapViewer/MapServer/11
Status: 🟢 FULLY AUTOMATED — public ArcGIS REST endpoint, no auth.

This pulls the Fulton County Tax Parcel layer and identifies properties
matching absentee owner / out-of-state mailing criteria.

ArcGIS endpoints have a hard limit of 2000 records per request. Fulton
has ~320,000 parcels, so we paginate. To keep daily runs fast and
respectful of the public server, this scraper pulls a CONFIGURABLE SLICE
each run (default 5,000 absentee-owner candidates).

Enable with FULTON_GIS_ENABLED=1 in repo Variables.
Optional FULTON_GIS_MAX (default 5000) caps records per run.
"""
import os
import time
import requests

ENDPOINT = (
    "https://gismaps.fultoncountyga.gov/arcgispub2/rest/services/"
    "PropertyMapViewer/PropertyMapViewer/MapServer/11/query"
)

# Fields we care about (exact case matching layer schema)
OUT_FIELDS = (
    "ParcelID,Owner,Address,AddrNumber,AddrPreDir,AddrStreet,"
    "AddrSuffix,AddrPosDir,AddrUntTyp,AddrUnit,"
    "OwnerAddr1,OwnerAddr2,TotAssess,LandAssess,ImprAssess,"
    "LandAcres,Subdiv"
)

# Heuristic for "absentee owner": owner mailing not in GA
# (We can't filter by state in ArcGIS, but OwnerAddr2 contains
# "City, ST ZIP" — non-GA mailings are absentee candidates)
PAGE_SIZE = 2000  # ArcGIS hard cap


def fetch_page(offset: int, page_size: int = PAGE_SIZE):
    params = {
        "where": "1=1",
        "outFields": OUT_FIELDS,
        "resultOffset": offset,
        "resultRecordCount": page_size,
        "orderByFields": "ParcelID",
        "returnGeometry": "false",
        "f": "json",
    }
    r = requests.get(ENDPOINT, params=params, timeout=60)
    r.raise_for_status()
    return r.json()


def is_absentee(owner_addr2: str) -> bool:
    """Owner mailing outside Georgia → absentee candidate."""
    if not owner_addr2:
        return False
    addr = owner_addr2.upper()
    # If GA appears as the state, it's in-state
    return " GA " not in addr and not addr.endswith(" GA")


def is_out_of_state(owner_addr2: str) -> bool:
    """Stricter — owner mailing in a different state entirely."""
    if not owner_addr2:
        return False
    addr = owner_addr2.upper().strip()
    states_other = [
        " AL ", " AK ", " AZ ", " AR ", " CA ", " CO ", " CT ", " DE ",
        " FL ", " HI ", " ID ", " IL ", " IN ", " IA ", " KS ", " KY ",
        " LA ", " ME ", " MD ", " MA ", " MI ", " MN ", " MS ", " MO ",
        " MT ", " NE ", " NV ", " NH ", " NJ ", " NM ", " NY ", " NC ",
        " ND ", " OH ", " OK ", " OR ", " PA ", " RI ", " SC ", " SD ",
        " TN ", " TX ", " UT ", " VT ", " VA ", " WA ", " WV ", " WI ",
        " WY ", " DC ",
    ]
    return any(st in addr for st in states_other)


def parse_owner_addr(addr1: str, addr2: str) -> tuple[str, str, str]:
    """Pull city/state/zip out of OwnerAddr2 like 'ATLANTA GA 30306'."""
    if not addr2:
        return ("", "", "")
    parts = addr2.strip().split()
    if len(parts) < 3:
        return (addr2, "", "")
    zip_code = parts[-1] if parts[-1].replace("-", "").isdigit() else ""
    state = parts[-2] if len(parts[-2]) == 2 else ""
    city = " ".join(parts[:-2]).strip()
    return (city, state, zip_code)


def scrape() -> list[dict]:
    if os.environ.get("FULTON_GIS_ENABLED") != "1":
        return []

    max_records = int(os.environ.get("FULTON_GIS_MAX", "5000"))

    print(f"    Pulling up to {max_records:,} parcels from Fulton GIS")
    out = []
    offset = 0
    page_num = 1

    while offset < max_records:
        try:
            data = fetch_page(offset)
        except requests.RequestException as e:
            print(f"    Page {page_num} failed: {e}")
            break

        feats = data.get("features", [])
        if not feats:
            print(f"    No more records at offset {offset}")
            break

        for feat in feats:
            attrs = feat.get("attributes", {})
            parcel = attrs.get("ParcelID")
            if not parcel:
                continue

            owner_addr1 = (attrs.get("OwnerAddr1") or "").strip()
            owner_addr2 = (attrs.get("OwnerAddr2") or "").strip()
            mailing_full = ", ".join(p for p in [owner_addr1, owner_addr2] if p)
            mail_city, mail_state, mail_zip = parse_owner_addr(owner_addr1, owner_addr2)

            absentee = is_absentee(owner_addr2)
            out_of_state = is_out_of_state(owner_addr2)

            # Property address — use combined Address field if present
            prop_addr = (attrs.get("Address") or "").strip()

            assessed = attrs.get("TotAssess") or 0

            out.append({
                "id": f"GIS-{parcel.replace(' ', '')}",
                "parcel": parcel,
                "owner": (attrs.get("Owner") or "").strip().upper(),
                "address": prop_addr,
                "ownerMailing": mailing_full,
                "city": "Atlanta",  # Fulton GIS doesn't split property city; default
                "zip": "",
                "yearBuilt": 0,  # Not in this layer
                "assessedValue": assessed,
                "estimatedARV": int(assessed * 1.3),  # Rough — replace with comps
                "mortgageBalance": 0,  # Not in GIS — would need separate source
                "lastSaleDate": None,
                "lastSalePrice": 0,
                # Flags that this scraper can determine on its own
                "preforeclosure": False,
                "taxDelinquent": False,
                "probate": False,
                "codeViolations": False,
                "vacant": False,
                "absenteeOwner": out_of_state,
                "longTermOwner": False,
                "highEquity": True,  # Most Fulton parcels have no listed mortgage in GIS
                "multipleEvictions": False,
                "lien": False,
                "inheritedNotProbated": False,
                "divorce": False,
                "stage": "new",
                "addedAt": time.strftime("%Y-%m-%d"),
                "source": "gis",
                "subdivision": attrs.get("Subdiv") or "",
                "landAcres": attrs.get("LandAcres") or 0,
                "legalDesc": attrs.get("Subdiv") or "",
            })

        print(f"    Page {page_num}: {len(feats)} records (total: {len(out)})")
        offset += PAGE_SIZE
        page_num += 1

        # Be polite — small delay between pages
        if data.get("exceededTransferLimit"):
            time.sleep(0.5)
            continue
        else:
            # No more pages
            break

    # Filter to high-signal records only — out-of-state owners are
    # the most actionable from a pure-GIS pull
    filtered = [r for r in out if r["absenteeOwner"]]
    print(f"    Total {len(out):,} parcels pulled, {len(filtered):,} out-of-state owners")
    return filtered
