"""
GSCCCA Lien Index scraper.

Source: https://search.gsccca.org/Lien/namesearch.asp
Status: 🟡 SEMI-AUTOMATED — requires paid account ($9.99/month) for full access.

Pulls lis pendens, state/federal tax liens, judgment liens, mechanics liens
filed in Fulton County. Free tier has limited query throughput; paid tier
has API-like access.

Disabled by default. To enable, set:
  FULTON_GSCCCA_ENABLED=1
  GSCCCA_USERNAME=<your username>
  GSCCCA_PASSWORD=<your password>  (use GitHub Actions secrets)
"""
import os


def scrape() -> list[dict]:
    if os.environ.get("FULTON_GSCCCA_ENABLED") != "1":
        return []

    user = os.environ.get("GSCCCA_USERNAME")
    pw = os.environ.get("GSCCCA_PASSWORD")
    if not (user and pw):
        print("    GSCCCA credentials not set")
        return []

    # Production: log in, search by date range and county code (60 = Fulton),
    # paginate, extract lien records, match to parcels by name + address.
    print("    GSCCCA scraper not yet implemented — returning empty list")
    return []
