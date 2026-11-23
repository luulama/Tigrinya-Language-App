import json
import plistlib
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

mobile = Path(__file__).resolve().parents[1]
bundle = mobile / 'www'

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.policies = []
    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == 'meta' and attrs.get('http-equiv', '').lower() == 'content-security-policy':
            self.policies.append(attrs.get('content', ''))
        if tag == 'a' and attrs.get('href'):
            self.links.append((attrs['href'], False))
        if tag in ['script', 'img', 'audio', 'source'] and attrs.get('src'):
            self.links.append((attrs['src'], True))
        if tag == 'link' and attrs.get('href'):
            self.links.append((attrs['href'], True))

pages = list(bundle.rglob('*.html'))
assert len(pages) >= 10, 'Learning pages are missing'
for page in pages:
    source = page.read_text()
    parser = Links(); parser.feed(source)
    assert len(parser.policies) == 1, f'Missing or duplicated CSP: {page}'
    assert "object-src 'none'" in parser.policies[0] and "base-uri 'none'" in parser.policies[0]
    assert 'viewport-fit=cover' in source
    for href, resource in parser.links:
        url = urlsplit(href)
        if url.scheme or url.netloc:
            assert not resource, f'Unexpected external runtime dependency: {page}: {href}'
            continue
        target = bundle / unquote(url.path).lstrip('/') if url.path.startswith('/') else page.parent / unquote(url.path)
        if not url.path: target = page
        assert target.resolve().is_relative_to(bundle.resolve()), f'Link escapes mobile bundle: {href}'
        assert target.exists(), f'Missing mobile target: {page.relative_to(bundle)}: {href}'

plist = plistlib.loads((mobile / 'ios/App/App/Info.plist').read_bytes())
assert 'NSMicrophoneUsageDescription' in plist and 'never uploaded' in plist['NSMicrophoneUsageDescription']
assert not any(key in plist for key in ['NSCameraUsageDescription', 'NSLocationWhenInUseUsageDescription', 'UIBackgroundModes'])
assert not plist.get('NSAppTransportSecurity', {}).get('NSAllowsArbitraryLoads', False)
print(f'PASS: {len(pages)} mobile HTML pages, all local links/assets, safe-area policies and microphone-only native permissions.')
