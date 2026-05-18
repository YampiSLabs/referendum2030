"""Verify generated OpenAPI paths match the committed contract snapshot."""

from __future__ import annotations

import json
import sys
from pathlib import Path


def load_json(path: str) -> dict:
    with Path(path).open(encoding="utf-8") as handle:
        return json.load(handle)


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: verify-openapi-contract.py GENERATED_SCHEMA COMMITTED_CONTRACT")
        return 2

    generated_path, committed_path = sys.argv[1:]
    generated = load_json(generated_path)
    committed = load_json(committed_path)

    if generated.get("paths") != committed.get("paths"):
        print("ERROR: OpenAPI contract is stale.")
        print(
            "Regenerate with: pnpm contract:generate "
            "and commit packages/contracts/openapi.json"
        )
        return 1

    print("OpenAPI contract is up to date.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
