"""
South Fulton Neighbor (legal organ) scraper.

Source: https://www.fultonneighbor.com/legals/
Status: 🟡 SEMI-AUTOMATED — HTML scrape, structure changes occasionally.

This source publishes:
- Foreclosure NOSUPs (4 weeks pre-auction)
- Probate notices (citation, year's support, petition to probate)
- Tax sale advertisements
- Name change petitions

Each notice is unstructured text. To extract structured fields (property,
owner, attorney, dates), you'd typically use either:
  (a) Regex with hand-tuned patterns per notice type, OR
  (b) An LLM extractor (Claude API or similar) for resilience.

This scraffold uses regex for foreclosure NOSUPs only. Probate notices
require LLM extraction in production.
"""
import os
import re

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    requests = None
    BeautifulSoup = None


def scrape() -> list[dict]:
    if os.environ.get("FULTON_LEGAL_ENABLED") != "1":
        return []

    if not (requests and BeautifulSoup):
        return []

    base = "https://www.fultonneighbor.com/legals/"

    try:
        r = requests.get(base, timeout=30)
        r.raise_for_status()
    except requests.RequestException as e:
        print(f"    legal organ fetch failed: {e}")
        return []

    soup = BeautifulSoup(r.text, "lxml")
    out = []

    # Site structure not locked in here — this is a placeholder pattern.
    # Inspect the actual page and replace selectors before production.
    for notice in soup.select("article, .notice, .legal-notice"):
        text = notice.get_text(separator="\n", strip=True)

        # Foreclosure NOSUP detection
        if re.search(r"NOTICE OF SALE UNDER POWER", text, re.IGNORECASE):
            # Extract address (very rough — production needs better parsing)
            addr_match = re.search(
                r"(\d+\s+[A-Z][A-Za-z\s]+(?:STREET|ST|DRIVE|DR|AVENUE|AVE|ROAD|RD|LANE|LN|COURT|CT|BLVD|BOULEVARD|WAY|TRAIL|PLACE|PL))",
                text
            )
            if not addr_match:
                continue

            address = addr_match.group(1).strip()
            out.append({
                "id": f"LEGAL-{abs(hash(address)) % 1000000}",
                "parcel": "",  # Would need to look up by address
                "owner": "",
                "address": address,
                "ownerMailing": "",
                "city": "Atlanta",
                "zip": "",
                "preforeclosure": True,
                "stage": "new",
                "addedAt": "2026-04-30",
                "source": "legal_organ",
            })

    return out
