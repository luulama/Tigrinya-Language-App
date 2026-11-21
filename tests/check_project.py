"""Offline structural checks; this is not browser or screen-reader validation."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re

ROOT = Path(__file__).resolve().parent.parent
PAGES = [ROOT / 'index.html', ROOT / 'unit-01-fidel-foundations/index.html', ROOT / 'unit-02-first-words/index.html', ROOT / 'games/index.html', ROOT / 'unit-02-first-words/path.html']
PAGES.append(ROOT / 'unit-01-fidel-foundations/pronunciation.html')
PAGES.append(ROOT / 'stories/index.html')


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.refs = []
        self.links = []
        self.assets = []
        self.nodes = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        self.nodes.append((tag, attrs))
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        for name in ['aria-labelledby', 'aria-describedby']:
            self.refs.extend(attrs.get(name, '').split())
        if tag == 'a' and 'href' in attrs:
            self.links.append(attrs['href'])
        if tag in ['img', 'script', 'audio', 'video', 'source'] and attrs.get('src'):
            self.assets.append(attrs['src'])
        if tag == 'link' and attrs.get('href'):
            self.assets.append(attrs['href'])


for path in PAGES:
    source = path.read_text(encoding='utf-8')
    page = Page()
    page.feed(source)
    assert len(page.ids) == len(set(page.ids)), f'Duplicate IDs: {path}'
    assert set(page.refs) <= set(page.ids), f'Missing accessible references: {path}'
    for href in page.links + page.assets:
        url = urlsplit(href)
        if url.scheme or url.netloc:
            assert href not in page.assets, f'External runtime asset: {href}'
            continue
        target = path.parent / unquote(url.path) if url.path else path
        assert target.exists(), f'Missing local target: {target}'
        if target == path and url.fragment:
            assert url.fragment in page.ids, f'Missing local fragment: {href}'
    privacy_source=source.replace((ROOT / 'shared/learning-path.js').read_text(), '')
    assert not re.search(r'\b(?:fetch|localStorage|sessionStorage|speechSynthesis|getUserMedia|XMLHttpRequest)\b', privacy_source), path
    assert 'viewport' in source
    assert 'Native review pending' in source or 'Awaiting qualified native Tigrinya review' in source
    assert not any(tag == 'button' and attrs.get('aria-describedby') == 'audioNotice' for tag, attrs in page.nodes), f'Unavailable audio must be status text, not a button: {path}'
    assert not source.split('</html>')[-1].strip(), f'Runtime markup after document end: {path}'
    print(f'PASS: {path.relative_to(ROOT)} — local links, assets, IDs, ARIA references and privacy checks')

unit1 = Page()
unit1.feed(PAGES[1].read_text(encoding='utf-8'))
audio = next((tag, attrs) for tag, attrs in unit1.nodes if attrs.get('id') == 'listenAction')
assert audio[0] == 'span'
assert 'id="notReady"' not in PAGES[1].read_text(encoding='utf-8')
for name in ['form', 'word']:
    attrs = next(attrs for _, attrs in unit1.nodes if attrs.get('id') == name)
    assert attrs.get('lang') == 'ti' and attrs.get('dir') == 'ltr'
for name in ['unit-01-fidel-foundations/experience.css', 'unit-02-first-words/src/unit2-experience.css']:
    css = (ROOT / name).read_text(encoding='utf-8')
    assert '44px' in css
    if 'fidel' in name:
        assert 'focus-visible' in css
assert 'unit2-experience.css' in (ROOT / 'unit-02-first-words/scripts/build_unit2.py').read_text()
assert (ROOT / 'shared/unit-journey.js').read_text() in PAGES[2].read_text()
assert (ROOT / 'shared/unit-journey.css').read_text() in PAGES[2].read_text()
assert (ROOT / 'shared/fidal-text.js').read_text() in PAGES[2].read_text()
assert (ROOT / 'shared/fidal-writing.css').read_text() in PAGES[2].read_text()
assert 'class="family-strip order-strip"' in PAGES[1].read_text()
assert 'id="writingWorkshop"' in PAGES[1].read_text()
assert 'id="traceLetter"' not in PAGES[1].read_text()
for name in ['shared/fidal-text.js','shared/fidal-writing.js']:
    assert not re.search(r'\b(?:fetch|localStorage|sessionStorage|speechSynthesis|getUserMedia|XMLHttpRequest)\b',(ROOT / name).read_text())
print('PASS: no inactive audio control or placeholder family screen; Ethiopic metadata and touch-target styles')


def luminance(color):
    rgb = [int(color[index:index+2], 16) / 255 for index in [1, 3, 5]]
    linear = [value / 12.92 if value <= .04045 else ((value + .055) / 1.055) ** 2.4 for value in rgb]
    return sum(value * weight for value, weight in zip(linear, [.2126, .7152, .0722]))


for foreground, background in [('#ffffff', '#6242b3'), ('#ffffff', '#176f58'), ('#513492', '#ffffff'), ('#273849', '#ffffff'), ('#4f5e69', '#ffffff'), ('#17634f', '#edf6ee')]:
    values = sorted([luminance(foreground), luminance(background)])
    assert (values[1] + .05) / (values[0] + .05) >= 4.5
print('PASS: new primary, helper, body, metadata and result text color pairs meet 4.5:1 contrast (not a browser accessibility audit)')
