"""
City of Atlanta Accela code enforcement scraper.

Source: https://aca-prod.accela.com/ATLANTA_GA/Cap/CapHome.aspx?module=Enforcement
Status: 🟡 SEMI-AUTOMATED — Accela has search but session-based; rate-limited.

NOTE: This scraper covers City of Atlanta only — about half of Fulton.
Other municipalities (Sandy Springs, Roswell, Alpharetta, etc.) each
have their own code enforcement systems and would need separate scrapers.

Disabled by default. Enable with FULTON_ACCELA_ENABLED=1 once you've
verified search parameters work without rate-limit issues.
"""
import os


def scrape() -> list[dict]:
    if os.environ.get("FULTON_ACCELA_ENABLED") != "1":
        return []

    # Production implementation would:
    # 1. POST to Accela search endpoint with date range
    # 2. Parse paginated results
    # 3. For each open case, extract parcel + violation type
    # 4. Return records with codeViolations: True flag
    print("    Accela scraper not yet implemented — returning empty list")
    return []
