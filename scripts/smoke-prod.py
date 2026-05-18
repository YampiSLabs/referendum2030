"""
Production smoke test for Referendum 2030 API.
Usage: python scripts/smoke-prod.py [--base-url https://referendum.yampi.eu/api/v1]
"""
import argparse, json, sys, urllib.request, urllib.error

PASS, FAIL = 0, 1
BASE_URL = "https://referendum.yampi.eu/api/v1"

def req(method, path, data=None):
    url = f"{BASE_URL.rstrip('/')}/{path.lstrip('/')}"
    body = json.dumps(data).encode() if data else None
    headers = {"Content-Type": "application/json"} if data else {}
    r = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(r, timeout=15)
        ct = resp.headers.get("Content-Type", "")
        if "json" in ct:
            return json.loads(resp.read().decode())
        return resp.read().decode()
    except urllib.error.HTTPError as e:
        detail = e.read().decode()
        print(f"  ERROR {e.code}: {detail[:200]}")
        raise SystemExit(FAIL)

def step(n, label):
    print(f"\n[{n}] {label}...", end=" ")

def ok(msg=""):
    print(f"PASS {msg}")

parser = argparse.ArgumentParser(description="Smoke test referendum2030 production API")
parser.add_argument("--base-url", default=BASE_URL)
args = parser.parse_args()
BASE_URL = args.base_url.rstrip("/")

print(f"=== Referendum 2030 Production Smoke Test ===")
print(f"Target: {BASE_URL}")

step(1, "Healthcheck")
data = req("GET", "/healthz/")
assert data.get("status") == "ok", f"expected ok, got {data}"
ok()

step(2, "Current referendum")
ref = req("GET", "/referendums/current/")
slug = ref.get("slug", "")
assert slug, "no slug in response"
assert "question" in ref
assert len(ref["question"]["options"]) >= 2
ok(f"(slug={slug}, options={len(ref['question']['options'])})")

step(3, "Issue demo token")
tok = req("POST", f"/referendums/{slug}/tokens/")
token = tok.get("token", "")
assert token.startswith("REF30-"), f"unexpected token format: {token}"
ok(f"(token={token})")

step(4, "Cast vote (Sí, option_id=1)")
vote = req("POST", f"/referendums/{slug}/votes/", data={"token": token, "option_id": 1})
assert vote.get("success"), f"vote failed: {vote}"
receipt = vote.get("receipt_code", "")
assert receipt.startswith("RCP-"), f"unexpected receipt: {receipt}"
ok(f"(receipt={receipt})")

step(5, "Results")
results = req("GET", f"/referendums/{slug}/results/")
assert results.get("total_votes", 0) > 0
assert len(results.get("options", [])) >= 2
ok(f"(total_votes={results['total_votes']})")

step(6, "Audit log")
audit = req("GET", f"/referendums/{slug}/audit/")
assert isinstance(audit, list) and len(audit) > 0
events = {e["event_type"] for e in audit}
assert "vote_cast" in events, f"vote_cast not in audit events: {events}"
assert "token_issued" in events, f"token_issued not in audit events: {events}"
ok(f"(events={len(audit)}, types={len(events)})")

print(f"\n{'='*50}")
print("ALL CHECKS PASSED")
sys.exit(PASS)
