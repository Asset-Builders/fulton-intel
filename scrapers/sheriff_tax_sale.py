"""
Fulton County Sheriff Tax Sale list scraper.

Source: https://fultoncountyga.gov/inside-fulton-county/fulton-county-departments/sheriff/tax-sales
Status: 🟡 SEMI-AUTOMATED — PDF parsing required, URL pattern shifts.

The Sheriff publishes a PDF list ~30 days before each first-Tuesday
auction. URL pattern roughly:
  https://fultoncountyga.gov/-/media/Departments/Sheriff/Tax-Sales/<YEAR>/FCSO-<MONTH>-<DAY>-<YEAR>-SALE-LIST-1.pdf

This scraper is disabled by default until the URL pattern is locked in
and pdfplumber column extraction is verified. Enable with
FULTON_SHERIFF_ENABLED=1.
"""
import os

try:
    import requests
    import pdfplumber
    from io import BytesIO
except ImportError:
    requests = None
    pdfplumber = None


def scrape() -> list[dict]:
    if os.environ.get("FULTON_SHERIFF_ENABLED") != "1":
        return []

    if not (requests and pdfplumber):
        print("    pdfplumber/requests not installed")
        return []

    # PDF URL would be set as an environment variable so the workflow
    # can be updated each month without changing code:
    #   FULTON_SHERIFF_PDF_URL=https://...
    pdf_url = os.environ.get("FULTON_SHERIFF_PDF_URL")
    if not pdf_url:
        print("    FULTON_SHERIFF_PDF_URL not set")
        return []

    try:
        r = requests.get(pdf_url, timeout=60)
        r.raise_for_status()
    except requests.RequestException as e:
        print(f"    PDF download failed: {e}")
        return []

    out = []
    try:
        with pdfplumber.open(BytesIO(r.content)) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for tbl in tables:
                    for row in tbl[1:]:  # skip header
                        # Column order varies by year; verify before production
                        if not row or len(row) < 4:
                            continue
                        parcel = (row[0] or "").strip()
                        if not parcel:
                            continue
                        out.append({
                            "id": f"SHF-{parcel}",
                            "parcel": parcel,
                            "owner": (row[1] or "").strip().upper(),
                            "address": (row[2] or "").strip(),
                            "ownerMailing": (row[2] or "").strip(),
                            "city": "Atlanta",
                            "zip": "",
                            "taxDelinquent": True,
                            "stage": "new",
                            "addedAt": "2026-04-30",
                            "source": "sheriff_tax_sale",
                        })
    except Exception as e:
        print(f"    PDF parse failed: {e}")
        return []

    return out
