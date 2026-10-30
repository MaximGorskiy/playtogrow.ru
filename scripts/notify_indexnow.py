"""Notify IndexNow about canonical Play to Grow pages after deployment."""

from __future__ import annotations

import argparse
import json
import urllib.request

from build_discovery import EN_BASE, INDEXNOW_KEY, RU_BASE, canonical_url, page_slugs


def payload(host: str, language: str) -> dict:
    base = RU_BASE if language == "ru" else EN_BASE
    return {
        "host": host,
        "key": INDEXNOW_KEY,
        "keyLocation": f"https://{host}/{INDEXNOW_KEY}.txt",
        "urlList": [base + "/"] + [canonical_url(language, slug) for slug in page_slugs()],
    }


def submit(data: dict) -> int:
    request = urllib.request.Request(
        "https://api.indexnow.org/indexnow",
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8", "User-Agent": "Play-to-Grow-GitHub-Actions/1.0"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.status


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    requests = [payload("playtogrow.ru", "ru"), payload("playtogrow.online", "en")]
    if args.dry_run:
        print(json.dumps(requests, ensure_ascii=False, indent=2))
        return 0
    for data in requests:
        status = submit(data)
        if status not in {200, 202}:
            raise RuntimeError(f"IndexNow returned HTTP {status} for {data['host']}")
        print(f"IndexNow accepted {len(data['urlList'])} URLs for {data['host']} (HTTP {status})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
