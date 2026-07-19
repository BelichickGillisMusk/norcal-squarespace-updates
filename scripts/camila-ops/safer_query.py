#!/usr/bin/env python3
"""
FMCSA QCMobile / SAFER client — NorCal CARB Mobile / Camila Ops

Free structured JSON API for USDOT snapshot, basics, and name search.
Use for VIN/fleet enrichment, safety checks, and cold-lead scoring.

WebKey (one-time):
  https://mobile.fmcsa.dot.gov/ → Login.gov → My WebKeys → Get a new WebKey
  export FMCSA_API_KEY=your_webkey   # or FMCSA_WEBKEY

Usage:
  python3 safer_query.py snapshot 785221
  python3 safer_query.py basics 785221
  python3 safer_query.py name "TEICHERT" --limit 5
  python3 safer_query.py batch --in leads/federal-tonight-candidates.csv --out leads/safer-enriched.csv
  python3 safer_query.py batch --in leads/federal-150mi-sac-oak.csv --limit 25 --delay 1.0
  python3 safer_query.py --dry-run

Env:
  FMCSA_API_KEY or FMCSA_WEBKEY  — required for live calls (not for --dry-run)
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional

BASE_URL = "https://mobile.fmcsa.dot.gov/qc/services"
USER_AGENT = "NorCalCARBMobile-SaferQuery/1.0"


def get_webkey() -> str:
    return (
        os.environ.get("FMCSA_API_KEY")
        or os.environ.get("FMCSA_WEBKEY")
        or ""
    ).strip()


class FMCSASaferClient:
    def __init__(self, webkey: str, timeout: float = 30.0):
        if not webkey:
            raise ValueError(
                "Missing WebKey. Get one at https://mobile.fmcsa.dot.gov/ "
                "(My WebKeys), then: export FMCSA_API_KEY=your_webkey"
            )
        self.webkey = webkey
        self.timeout = timeout

    def _request(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Any:
        full_params: Dict[str, Any] = {"webKey": self.webkey}
        if params:
            full_params.update(params)
        qs = urllib.parse.urlencode(full_params)
        url = f"{BASE_URL}{endpoint}?{qs}"
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                raw = resp.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")[:300]
            raise RuntimeError(f"FMCSA HTTP {e.code}: {body}") from e
        except urllib.error.URLError as e:
            raise RuntimeError(f"FMCSA network error: {e.reason}") from e

        data = json.loads(raw)
        # QCMobile often wraps payload
        if isinstance(data, dict) and "content" in data:
            return data["content"]
        return data

    def get_carrier_snapshot(self, dot_number: str) -> Any:
        return self._request(f"/carriers/{dot_number}")

    def get_carrier_basics(self, dot_number: str) -> Any:
        return self._request(f"/carriers/{dot_number}/basics")

    def search_by_name(self, name: str, start: int = 0, size: int = 10) -> Any:
        encoded = urllib.parse.quote(name, safe="")
        return self._request(
            f"/carriers/name/{encoded}",
            {"start": start, "size": size},
        )

    def search_by_docket(self, docket: str) -> Any:
        encoded = urllib.parse.quote(docket, safe="")
        return self._request(f"/carriers/docket-number/{encoded}")


def _dig(obj: Any, *path: str, default: Any = None) -> Any:
    cur = obj
    for key in path:
        if not isinstance(cur, dict):
            return default
        cur = cur.get(key, default)
        if cur is default:
            return default
    return cur


def _carrier_blob(snapshot: Any) -> Dict[str, Any]:
    """Normalize snapshot shapes (carrier nested or flat)."""
    if not isinstance(snapshot, dict):
        return {}
    if isinstance(snapshot.get("carrier"), dict):
        return snapshot["carrier"]
    # Some responses are the carrier object itself
    return snapshot


def extract_crm_fields(dot: str, snapshot: Any, basics: Any = None) -> Dict[str, Any]:
    c = _carrier_blob(snapshot)
    phy = c.get("phyAddress") or c.get("physicalAddress") or {}
    if isinstance(phy, str):
        phy_street, phy_city, phy_state, phy_zip = phy, "", "", ""
    else:
        phy_street = phy.get("street") or phy.get("addressLine1") or ""
        phy_city = phy.get("city") or ""
        phy_state = phy.get("state") or phy.get("stateCode") or ""
        phy_zip = phy.get("zip") or phy.get("zipCode") or ""

    oos_pct = c.get("vehicleOosRate") or c.get("vehicleOutOfServiceRate")
    driver_oos = c.get("driverOosRate") or c.get("driverOutOfServiceRate")

    power = c.get("totalPowerUnits") or c.get("nbrPowerUnit") or c.get("powerUnits")
    drivers = c.get("totalDrivers") or c.get("driverTotal") or c.get("totalDrivers")

    safety = (
        c.get("safetyRating")
        or c.get("safetyRatingDesc")
        or _dig(c, "safetyRating", "rating")
        or ""
    )

    row = {
        "usdot": str(dot),
        "legal_name": c.get("legalName") or c.get("legal_name") or "",
        "dba_name": c.get("dbaName") or c.get("dba_name") or "",
        "phone": c.get("telephone") or c.get("phone") or "",
        "phy_street": phy_street,
        "phy_city": phy_city,
        "phy_state": phy_state,
        "phy_zip": phy_zip,
        "safety_rating": safety,
        "power_units": power if power is not None else "",
        "drivers": drivers if drivers is not None else "",
        "vehicle_oos_rate": oos_pct if oos_pct is not None else "",
        "driver_oos_rate": driver_oos if driver_oos is not None else "",
        "allow_to_operate": c.get("allowToOperate") or c.get("allowedToOperate") or "",
        "bipd_insurance_required": c.get("bipdInsuranceRequired") or "",
        "safer_url": (
            "https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY"
            f"&query_type=queryCarrierSnapshot&query_param=USDOT&query_string={dot}"
        ),
        "enrich_ok": "YES",
        "enrich_error": "",
    }

    # Optional weighting for opacity-test prioritization (higher = better prospect)
    try:
        pu = int(float(str(power).replace(",", "") or 0))
    except ValueError:
        pu = 0
    rating = str(safety).upper()
    score = 0
    if pu >= 50:
        score += 40
    elif pu >= 10:
        score += 25
    elif pu >= 3:
        score += 15
    elif pu >= 1:
        score += 5
    if rating in ("SATISFACTORY", "S"):
        score += 20
    elif rating in ("CONDITIONAL", "C"):
        score += 10
    elif rating in ("UNSATISFACTORY", "U"):
        score -= 20
    # Prefer operable carriers
    if str(row["allow_to_operate"]).upper() in ("Y", "YES", "TRUE", "1"):
        score += 10
    row["prospect_score"] = score
    return row


def find_dot_column(fieldnames: List[str]) -> Optional[str]:
    aliases = {
        "usdot",
        "dot",
        "dot_number",
        "dotnumber",
        "usd ot",
        "carrier number",
        "carrier_number",
    }
    for name in fieldnames:
        key = name.strip().lower().replace("-", "_")
        if key in aliases or key.replace("_", "") in ("usdot", "dotnumber"):
            return name
    return None


def cmd_dry_run() -> int:
    print("🚛 FMCSA SAFER / QCMobile client — dry-run")
    print(f"   Base: {BASE_URL}")
    key = get_webkey()
    print(f"   WebKey set: {'YES' if key else 'NO'}")
    if not key:
        print("   Get key: https://mobile.fmcsa.dot.gov/ → My WebKeys")
        print("   Then:    export FMCSA_API_KEY=your_webkey")
    print("   Commands: snapshot | basics | name | batch | --dry-run")
    print("   Batch example:")
    print(
        "     python3 safer_query.py batch "
        "--in leads/federal-tonight-candidates.csv --out leads/safer-enriched.csv"
    )
    return 0


def cmd_snapshot(client: FMCSASaferClient, dot: str, with_basics: bool) -> int:
    snap = client.get_carrier_snapshot(dot)
    basics = client.get_carrier_basics(dot) if with_basics else None
    fields = extract_crm_fields(dot, snap, basics)
    safe_fields = dict(fields)
    if safe_fields.get("phone"):
        safe_fields["phone"] = "[REDACTED]"
    if safe_fields.get("phy_zip"):
        safe_fields["phy_zip"] = "[REDACTED]"
    print(json.dumps({"snapshot": snap, "basics": basics, "crm": safe_fields}, indent=2, default=str))
    return 0


def cmd_name(client: FMCSASaferClient, name: str, start: int, size: int) -> int:
    result = client.search_by_name(name, start=start, size=size)
    print(json.dumps(result, indent=2, default=str))
    return 0


def cmd_batch(
    client: FMCSASaferClient,
    in_path: str,
    out_path: str,
    limit: int,
    delay: float,
    with_basics: bool,
) -> int:
    if not os.path.isfile(in_path):
        print(f"❌ Input not found: {in_path}", file=sys.stderr)
        return 1

    with open(in_path, newline="", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            print("❌ Empty CSV", file=sys.stderr)
            return 1
        dot_col = find_dot_column(list(reader.fieldnames))
        if not dot_col:
            print(
                f"❌ No USDOT column in {in_path}. "
                f"Have: {reader.fieldnames}",
                file=sys.stderr,
            )
            return 1
        rows = list(reader)

    if limit > 0:
        rows = rows[:limit]

    enrich_cols = [
        "safer_legal_name",
        "safer_dba_name",
        "safer_phone",
        "safer_phy_street",
        "safer_phy_city",
        "safer_phy_state",
        "safer_phy_zip",
        "safer_safety_rating",
        "safer_power_units",
        "safer_drivers",
        "safer_vehicle_oos_rate",
        "safer_driver_oos_rate",
        "safer_allow_to_operate",
        "safer_prospect_score",
        "safer_enrich_ok",
        "safer_enrich_error",
        "safer_url",
    ]

    out_fields = list(rows[0].keys()) if rows else []
    for col in enrich_cols:
        if col not in out_fields:
            out_fields.append(col)

    os.makedirs(os.path.dirname(os.path.abspath(out_path)) or ".", exist_ok=True)
    written = 0
    ok = 0
    fail = 0

    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=out_fields, extrasaction="ignore")
        writer.writeheader()

        for i, row in enumerate(rows, 1):
            raw_dot = str(row.get(dot_col) or "").strip()
            # Strip .0 from floaty CSV exports
            if raw_dot.endswith(".0"):
                raw_dot = raw_dot[:-2]
            digs = "".join(ch for ch in raw_dot if ch.isdigit())
            if not digs:
                row.update({c: "" for c in enrich_cols})
                row["safer_enrich_ok"] = "NO"
                row["safer_enrich_error"] = "missing_usdot"
                writer.writerow(row)
                fail += 1
                written += 1
                continue

            try:
                snap = client.get_carrier_snapshot(digs)
                basics = client.get_carrier_basics(digs) if with_basics else None
                crm = extract_crm_fields(digs, snap, basics)
                row["safer_legal_name"] = crm["legal_name"]
                row["safer_dba_name"] = crm["dba_name"]
                row["safer_phone"] = crm["phone"]
                row["safer_phy_street"] = crm["phy_street"]
                row["safer_phy_city"] = crm["phy_city"]
                row["safer_phy_state"] = crm["phy_state"]
                row["safer_phy_zip"] = crm["phy_zip"]
                row["safer_safety_rating"] = crm["safety_rating"]
                row["safer_power_units"] = crm["power_units"]
                row["safer_drivers"] = crm["drivers"]
                row["safer_vehicle_oos_rate"] = crm["vehicle_oos_rate"]
                row["safer_driver_oos_rate"] = crm["driver_oos_rate"]
                row["safer_allow_to_operate"] = crm["allow_to_operate"]
                row["safer_prospect_score"] = crm["prospect_score"]
                row["safer_enrich_ok"] = "YES"
                row["safer_enrich_error"] = ""
                row["safer_url"] = crm["safer_url"]
                ok += 1
            except Exception as e:  # noqa: BLE001 — batch must continue
                row.update({c: "" for c in enrich_cols})
                row["safer_enrich_ok"] = "NO"
                row["safer_enrich_error"] = str(e)[:200]
                fail += 1

            writer.writerow(row)
            written += 1
            print(f"   [{i}/{len(rows)}] USDOT {digs} → {row.get('safer_enrich_ok')}")
            if delay > 0 and i < len(rows):
                time.sleep(delay)

    print(f"\n✅ Wrote {written} rows → {out_path} (ok={ok} fail={fail})")
    return 0 if ok or written else 1


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="FMCSA QCMobile SAFER query — Camila Ops enrichment"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate config / print usage (no API calls)",
    )
    sub = parser.add_subparsers(dest="cmd")

    p_snap = sub.add_parser("snapshot", help="Carrier snapshot by USDOT")
    p_snap.add_argument("dot")
    p_snap.add_argument("--basics", action="store_true", help="Also fetch /basics")

    p_bas = sub.add_parser("basics", help="Carrier basics by USDOT")
    p_bas.add_argument("dot")

    p_name = sub.add_parser("name", help="Search carriers by name")
    p_name.add_argument("name")
    p_name.add_argument("--start", type=int, default=0)
    p_name.add_argument("--limit", type=int, default=10)

    p_batch = sub.add_parser("batch", help="Enrich a CSV that has a usdot column")
    p_batch.add_argument("--in", dest="in_path", required=True)
    p_batch.add_argument(
        "--out",
        dest="out_path",
        default="",
        help="Default: <in> with -safer-enriched before .csv",
    )
    p_batch.add_argument("--limit", type=int, default=0, help="Max rows (0=all)")
    p_batch.add_argument(
        "--delay",
        type=float,
        default=1.0,
        help="Seconds between API calls (default 1.0)",
    )
    p_batch.add_argument(
        "--basics",
        action="store_true",
        help="Also call /basics (2x requests)",
    )

    args = parser.parse_args(argv)

    if args.dry_run or not args.cmd:
        if not args.cmd and not args.dry_run:
            parser.print_help()
            print()
        return cmd_dry_run()

    key = get_webkey()
    if not key:
        print(
            "❌ FMCSA_API_KEY / FMCSA_WEBKEY not set.\n"
            "   Get a WebKey: https://mobile.fmcsa.dot.gov/ → My WebKeys\n"
            "   Then: export FMCSA_API_KEY=your_webkey",
            file=sys.stderr,
        )
        return 1

    client = FMCSASaferClient(key)

    if args.cmd == "snapshot":
        return cmd_snapshot(client, args.dot, with_basics=args.basics)
    if args.cmd == "basics":
        data = client.get_carrier_basics(args.dot)
        print(json.dumps(data, indent=2, default=str))
        return 0
    if args.cmd == "name":
        return cmd_name(client, args.name, start=args.start, size=args.limit)
    if args.cmd == "batch":
        out = args.out_path
        if not out:
            base, ext = os.path.splitext(args.in_path)
            out = f"{base}-safer-enriched{ext or '.csv'}"
        return cmd_batch(
            client,
            in_path=args.in_path,
            out_path=out,
            limit=args.limit,
            delay=args.delay,
            with_basics=args.basics,
        )

    parser.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
