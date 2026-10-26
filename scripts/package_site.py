"""Package the static site and a double-clickable offline preview, without dependencies."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import base64
import hashlib

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'docs'
OUTPUT = ROOT / 'release'
OUTPUT.mkdir(exist_ok=True)

files = [
    'index.html', 'demo.html', 'landing.css', 'landing.js', 'contact-config.js',
    'styles.css', 'app.js', 'model.js', '.nojekyll', 'package.json', 'assets/mark.svg',
]
support_files = ['.github/workflows/pages.yml', 'tests/model.test.mjs', 'README.md', 'PROJECT_LOG.md', 'scripts/package_site.py', 'start-preview.cmd']
variants = {
    'ru': {
        'archive': 'playtogrow-ru-github-pages.zip',
        'preview': 'Play to Grow — RU.html',
        'demo_preview': 'Play to Grow — RU Demo.html',
        'html_lang': 'ru',
        'title': 'Play to Grow — играй, чтобы расти',
        'description': 'Play to Grow — пилотный проект для семей, столкнувшихся с компьютерной или игровой зависимостью. Игра становится мотивацией для реальных шагов в развитии ребенка.',
        'demo_title': 'Play to Grow — демоверсия',
        'demo_description': 'Демонстрация Play to Grow: три роли, развивающие задания, прогресс и согласованные игровые награды.',
        'skip': 'Перейти к содержимому',
        'landing_noscript': 'Для переключения языка включите JavaScript. Основная информация о проекте доступна на этой странице.',
        'demo_noscript': 'Для работы Play to Grow включите JavaScript в браузере. Данные демоверсии хранятся только на этом устройстве.',
    },
    'en': {
        'archive': 'playtogrow-en-github-pages.zip',
        'preview': 'Play to Grow — EN.html',
        'demo_preview': 'Play to Grow — EN Demo.html',
        'html_lang': 'ru',
        'title': 'Play to Grow — играй, чтобы расти',
        'description': 'Play to Grow — пилотный проект для семей, столкнувшихся с компьютерной или игровой зависимостью. Игра становится мотивацией для реальных шагов в развитии ребенка.',
        'demo_title': 'Play to Grow — демоверсия',
        'demo_description': 'Демонстрация Play to Grow: три роли, развивающие задания, прогресс и согласованные игровые награды.',
        'skip': 'Перейти к содержимому',
        'landing_noscript': 'Для переключения языка включите JavaScript. Основная информация о проекте доступна на этой странице.',
        'demo_noscript': 'Для работы Play to Grow включите JavaScript в браузере. Данные демоверсии хранятся только на этом устройстве.',
    },
}

source_index = (SITE / 'index.html').read_text(encoding='utf-8')
source_demo = (SITE / 'demo.html').read_text(encoding='utf-8')

def localized_html(source, language, page):
    config = variants[language]
    html = source.replace(
        '<html lang="ru" data-default-language="ru"',
        f'<html lang="{config["html_lang"]}" data-default-language="{config["html_lang"]}"',
    )
    title = config['title'] if page == 'landing' else config['demo_title']
    description = config['description'] if page == 'landing' else config['demo_description']
    original_title = 'Play to Grow — играй, чтобы расти' if page == 'landing' else 'Play to Grow — демоверсия'
    original_description = (
        'Play to Grow — пилотный проект для семей, столкнувшихся с компьютерной или игровой зависимостью. Игра становится мотивацией для реальных шагов в развитии ребенка.'
        if page == 'landing' else
        'Демонстрация Play to Grow: три роли, развивающие задания, прогресс и согласованные игровые награды.'
    )
    html = html.replace(f'<title>{original_title}</title>', f'<title>{title}</title>')
    html = html.replace(f'content="{original_description}"', f'content="{description}"')
    html = html.replace('>Перейти к содержимому</a>', f'>{config["skip"]}</a>')
    start, end = html.index('<noscript>'), html.index('</noscript>')
    noscript = config['landing_noscript'] if page == 'landing' else config['demo_noscript']
    return html[:start] + f'<noscript>{noscript}' + html[end:]

for language, config in variants.items():
    with ZipFile(OUTPUT / config['archive'], 'w', ZIP_DEFLATED) as archive:
        for name in files:
            if name == 'index.html':
                archive.writestr('docs/index.html', localized_html(source_index, language, 'landing'))
            elif name == 'demo.html':
                archive.writestr('docs/demo.html', localized_html(source_demo, language, 'demo'))
            else:
                archive.write(SITE / name, f'docs/{name}')
        for name in support_files:
            archive.write(ROOT / name, name)

mark = 'data:image/svg+xml;base64,' + base64.b64encode((SITE / 'assets/mark.svg').read_bytes()).decode()

contact_code = (SITE / 'contact-config.js').read_text(encoding='utf-8').replace('export const CONTACTS', 'const CONTACTS')
landing_source = (SITE / 'landing.js').read_text(encoding='utf-8').split('\n', 1)[1]
landing_code = contact_code + '\n' + landing_source
landing_digest = base64.b64encode(hashlib.sha256(landing_code.encode()).digest()).decode()

model = (SITE / 'model.js').read_text(encoding='utf-8')
app = (SITE / 'app.js').read_text(encoding='utf-8').split('\n', 1)[1]
demo_code = (model + '\n' + app).replace('./assets/mark.svg', mark)
demo_digest = base64.b64encode(hashlib.sha256(demo_code.encode()).digest()).decode()

for language, config in variants.items():
    landing_html = localized_html(source_index, language, 'landing')
    landing_html = landing_html.replace('data-demo-url="./demo.html"', f'data-demo-url="./{config["demo_preview"]}"')
    landing_html = landing_html.replace('href="./assets/mark.svg"', f'href="{mark}"')
    landing_html = landing_html.replace('src="./assets/mark.svg"', f'src="{mark}"')
    landing_html = landing_html.replace('<link rel="stylesheet" href="./landing.css">', '<style>' + (SITE / 'landing.css').read_text(encoding='utf-8') + '</style>')
    landing_html = landing_html.replace('<script type="module" src="./landing.js"></script>', '<script type="module">' + landing_code + '</script>')
    landing_html = landing_html.replace("script-src 'self'", f"script-src 'sha256-{landing_digest}'")
    preview = OUTPUT / config['preview']
    preview.write_text(landing_html, encoding='utf-8')

    demo_html = localized_html(source_demo, language, 'demo')
    demo_html = demo_html.replace('href="./assets/mark.svg"', f'href="{mark}"')
    demo_html = demo_html.replace('<link rel="stylesheet" href="./styles.css">', '<style>' + (SITE / 'styles.css').read_text(encoding='utf-8') + '</style>')
    demo_html = demo_html.replace('<script type="module" src="./app.js"></script>', '<script type="module">' + demo_code + '</script>')
    demo_html = demo_html.replace("script-src 'self'", f"script-src 'sha256-{demo_digest}'")
    demo_preview = OUTPUT / config['demo_preview']
    demo_preview.write_text(demo_html, encoding='utf-8')

    assert './landing.js' not in landing_html and './contact-config.js' not in landing_html
    assert './app.js' not in demo_html and './model.js' not in demo_html
    assert f'data-default-language="{config["html_lang"]}"' in landing_html
    with ZipFile(OUTPUT / config['archive']) as archive:
        assert archive.testzip() is None
        assert f'data-default-language="{config["html_lang"]}"' in archive.read('docs/index.html').decode()
        assert f'data-default-language="{config["html_lang"]}"' in archive.read('docs/demo.html').decode()
        assert all(name.startswith(('docs/', 'tests/', '.github/', 'scripts/')) or name in ['README.md', 'PROJECT_LOG.md', 'start-preview.cmd'] for name in archive.namelist())
    print(f'Created {language.upper()} offline landing ({preview.stat().st_size:,} bytes)')
    print(f'Created {language.upper()} offline demo ({demo_preview.stat().st_size:,} bytes)')
    print(f'Created {language.upper()} GitHub Pages archive ({(OUTPUT / config["archive"]).stat().st_size:,} bytes)')
