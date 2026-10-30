"""Package GitHub Pages archives and double-clickable landing/demo previews."""

from __future__ import annotations

import base64
import hashlib
import subprocess
import sys
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from build_discovery import generated_outputs

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "docs"
OUTPUT = ROOT / "release"
OUTPUT.mkdir(exist_ok=True)
VERSION = "20261030-2"

subprocess.run([sys.executable, str(ROOT / "scripts" / "build_discovery.py"), "--check"], check=True)

support_files = [
    ".github/workflows/pages.yml", "tests/model.test.mjs", "tests/site.test.mjs",
    "README.md", "PROJECT_LOG.md", "scripts/build_discovery.py",
    "scripts/notify_indexnow.py", "scripts/package_site.py", "start-preview.cmd",
]
variants = {
    "ru": {
        "domain": "ru",
        "archive": "playtogrow-ru-github-pages.zip",
        "preview": "Play to Grow — RU.html",
        "demo_preview": "Play to Grow — RU Demo.html",
        "landing": SITE / "index.html",
        "language": "ru",
    },
    "en": {
        "domain": "online",
        "archive": "playtogrow-en-github-pages.zip",
        "preview": "Play to Grow — EN.html",
        "demo_preview": "Play to Grow — EN Demo.html",
        "landing": SITE / "en" / "index.html",
        "language": "en",
    },
}


def write_archive(config: dict) -> None:
    overrides = generated_outputs(config["domain"], metadata_only=True)
    archive_path = OUTPUT / config["archive"]
    with ZipFile(archive_path, "w", ZIP_DEFLATED) as archive:
        for path in sorted(SITE.rglob("*")):
            if not path.is_file():
                continue
            relative = path.relative_to(SITE)
            override = overrides.get(relative)
            if override is None:
                archive.write(path, (Path("docs") / relative).as_posix())
            else:
                archive.writestr((Path("docs") / relative).as_posix(), override)
        for name in support_files:
            archive.write(ROOT / name, Path(name).as_posix())
    with ZipFile(archive_path) as archive:
        assert archive.testzip() is None
        robots = archive.read("docs/robots.txt").decode("utf-8")
        expected_sitemap = "playtogrow.ru" if config["domain"] == "ru" else "playtogrow.online"
        assert f"Sitemap: https://{expected_sitemap}/sitemap.xml" in robots
        assert "docs/demo.html" in archive.namelist()
        assert "docs/en/index.html" in archive.namelist()
        assert "tests/site.test.mjs" in archive.namelist()
    print(f"Created {config['language'].upper()} GitHub Pages archive ({archive_path.stat().st_size:,} bytes)")


mark = "data:image/svg+xml;base64," + base64.b64encode((SITE / "assets" / "mark.svg").read_bytes()).decode()
contact_code = (SITE / "contact-config.js").read_text(encoding="utf-8").replace("export const CONTACTS", "const CONTACTS")
landing_source = (SITE / "landing.js").read_text(encoding="utf-8").split("\n", 1)[1]
landing_code = contact_code + "\n" + landing_source
landing_digest = base64.b64encode(hashlib.sha256(landing_code.encode()).digest()).decode()
model = (SITE / "model.js").read_text(encoding="utf-8")
app = (SITE / "app.js").read_text(encoding="utf-8").split("\n", 1)[1]
demo_code = (model + "\n" + app).replace("./assets/mark.svg", mark)
demo_digest = base64.b64encode(hashlib.sha256(demo_code.encode()).digest()).decode()


def offline_landing(config: dict) -> str:
    result = config["landing"].read_text(encoding="utf-8")
    asset_prefix = "./" if config["language"] == "ru" else "../"
    result = result.replace(f'href="{asset_prefix}assets/mark.svg"', f'href="{mark}"')
    result = result.replace(f'src="{asset_prefix}assets/mark.svg"', f'src="{mark}"')
    result = result.replace(f'<link rel="stylesheet" href="{asset_prefix}landing.css?v={VERSION}">', "<style>" + (SITE / "landing.css").read_text(encoding="utf-8") + "</style>")
    result = result.replace(f'<script type="module" src="{asset_prefix}landing.js?v={VERSION}"></script>', '<script type="module">' + landing_code + "</script>")
    result = result.replace("script-src 'self'", f"script-src 'sha256-{landing_digest}'")
    result = result.replace("../demo.html", f'./{config["demo_preview"]}').replace("./demo.html", f'./{config["demo_preview"]}')
    result = result.replace('data-local-url="./"', f'data-local-url="./{config["preview"]}"', 1)
    result = result.replace('data-local-url="./en/"', 'data-local-url="./Play to Grow — EN.html"')
    result = result.replace('data-local-url="../"', 'data-local-url="./Play to Grow — RU.html"')
    return result


def offline_demo(config: dict) -> str:
    result = (SITE / "demo.html").read_text(encoding="utf-8")
    if config["language"] == "en":
        result = result.replace('data-default-language="ru"', 'data-default-language="en"')
    result = result.replace('href="./assets/mark.svg"', f'href="{mark}"')
    result = result.replace(f'<link rel="stylesheet" href="./styles.css?v={VERSION}">', "<style>" + (SITE / "styles.css").read_text(encoding="utf-8") + "</style>")
    result = result.replace(f'<script type="module" src="./app.js?v={VERSION}"></script>', '<script type="module">' + demo_code + "</script>")
    result = result.replace("script-src 'self'", f"script-src 'sha256-{demo_digest}'")
    return result


for config in variants.values():
    write_archive(config)
    landing_html = offline_landing(config)
    demo_html = offline_demo(config)
    preview = OUTPUT / config["preview"]
    demo_preview = OUTPUT / config["demo_preview"]
    preview.write_text(landing_html, encoding="utf-8", newline="\n")
    demo_preview.write_text(demo_html, encoding="utf-8", newline="\n")
    assert "landing.js" not in landing_html and "contact-config.js" not in landing_html
    assert "app.js" not in demo_html and "model.js" not in demo_html
    print(f"Created {config['language'].upper()} offline landing ({preview.stat().st_size:,} bytes)")
    print(f"Created {config['language'].upper()} offline demo ({demo_preview.stat().st_size:,} bytes)")
