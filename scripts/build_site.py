"""Package only the app's runtime files and linked review documentation."""
from html.parser import HTMLParser
from pathlib import Path
import shutil
import subprocess
import sys
from urllib.parse import unquote, urlsplit

root = Path(__file__).resolve().parent.parent
destination = root / 'dist'
subprocess.run([sys.executable, str(root / 'scripts/build_games.py')], cwd=root, check=True)
runtime = [
    'index.html', 'LEARNING_FLOW.md', 'RESEARCH_NOTES.md', 'FIDAL_WRITING.md',
    'QA_REPORT.md', 'DEMO_REQUIREMENTS.md',
    'unit-01-fidel-foundations/index.html',
    'unit-01-fidel-foundations/experience.css',
    'unit-01-fidel-foundations/assets/fidel-guide.png',
    'unit-01-fidel-foundations/b-family-content-pack.md',
    'unit-02-first-words/index.html',
    'unit-02-first-words/unit-2-content-review.json',
    'unit-02-first-words/unit-2-two-letter-words.md',
    'unit-02-first-words/unit-2-plan.md',
    'unit-02-first-words/lesson-01-review-brief.md',
    'shared/learning-path.js', 'shared/learning-path.css',
    'shared/unit-journey.js', 'shared/unit-journey.css',
    'shared/fidal-text.js', 'shared/fidal-content.js',
    'shared/fidal-writing.js', 'shared/fidal-writing.css',
    'shared/content-review/CONTENT_REVIEW.md',
    'shared/content-review/fidal-writing.json',
    'games/index.html', 'shared/game-content.js', 'shared/game-garden-core.js',
    'shared/game-garden.js', 'shared/game-garden.css',
]
expected = set(runtime)
if destination.exists():
    unexpected = {str(path.relative_to(destination)) for path in destination.rglob('*') if path.is_file()} - expected
    if unexpected:
        raise SystemExit(f'Unexpected generated files; preserve and inspect: {sorted(unexpected)}')
destination.mkdir(exist_ok=True)
for name in runtime:
    target = destination / name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(root / name, target)


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == 'a' and attrs.get('href'):
            self.urls.append(attrs['href'])
        if tag in ['script', 'img', 'audio', 'source'] and attrs.get('src'):
            self.urls.append(attrs['src'])
        if tag == 'link' and attrs.get('href'):
            self.urls.append(attrs['href'])


for name in [item for item in runtime if item.endswith('.html')]:
    page = destination / name
    parser = Links()
    parser.feed(page.read_text(encoding='utf-8'))
    for href in parser.urls:
        url = urlsplit(href)
        if url.scheme or url.netloc:
            continue
        target = page.parent / unquote(url.path) if url.path else page
        assert target.exists(), f'Missing published target: {name}: {href}'
print(f'PASS: dist contains {len(runtime)} runtime/review files; all HTML links and assets resolve.')
