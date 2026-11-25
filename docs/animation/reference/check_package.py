"""Generate/check token CSS and validate local design-package coverage."""
import argparse
import hashlib
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
ROOT = BASE.parents[1]
sys.path.insert(0, str(ROOT / 'docs/production/reference'))
from check_package import link_exists  # Existing repository-local link checker.


def token_css(tokens):
    lines=['/* Generated from ../motion-tokens.json. Do not edit independently. */', ':root {']
    for name,value in tokens['durationMs'].items():
        assert isinstance(value,int) and not isinstance(value,bool) and 0 <= value <= 500
        lines.append(f'  --motion-{name}: {value}ms;')
    for name,value in tokens['easing'].items():
        assert re.fullmatch(r'cubic-bezier\([0-9., ]+\)',value)
        lines.append(f'  --motion-{name}: {value};')
    lines.append('}')
    return '\n'.join(lines)+'\n'


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write-tokens',action='store_true')
    args=parser.parse_args()
    tokens=json.loads((BASE/'motion-tokens.json').read_text())
    states=['idle','walking','talking','listening','thinking','teaching','celebrating','encouraging','waiting','sleeping']
    assert tokens['states']==states
    assert tokens['limits']['foregroundSequences']==1
    assert tokens['limits']['particles']<=8 and tokens['limits']['waveformFps']<=30
    css=token_css(tokens)
    if args.write_tokens:
        (BASE/'reference/tokens.css').write_text(css)
        print('Generated motion tokens CSS.')
        return
    assert (BASE/'reference/tokens.css').read_text()==css, 'Generated CSS drifted from tokens'
    headings=re.findall(r'^## (\d+) ',(BASE/'README.md').read_text(),re.M)
    assert headings==[str(i) for i in range(1,13)], 'Twelve deliverables required'
    catalogue=(BASE/'CATALOG.md').read_text()
    assert re.findall(r'\| (A\d\d) ',catalogue)==[f'A{i:02}' for i in range(1,33)]
    for source in BASE.rglob('*.md'):
        for target in re.findall(r'\[[^\]]+\]\(([^)]+)\)',source.read_text()):
            link_exists(source,target)
    assert hashlib.sha256((ROOT/'Product-Bible/01-Vision.md').read_bytes()).hexdigest()=='8dc45861ef7edcd1f20db25ac07a29372659e854b261f88a2b2b6fbdccf865af'
    # These are pending records, not assets that a renderer may approve itself.
    writing=json.loads((ROOT/'shared/content-review/fidal-writing.json').read_text())
    assert writing, 'Existing review source missing'
    for name in ['idle','listening','thinking','demonstrating','celebrating','encouraging','resting','sleepy']:
        svg=ET.parse(ROOT/f'shared/mascot/assets/neri-{name}.svg')
        for node in svg.iter():
            assert node.tag.split('}')[-1] not in {'script','foreignObject','image','audio','video'}
            for attribute,value in node.attrib.items():
                assert not attribute.lower().startswith('on')
                if attribute.split('}')[-1] in {'href','src'}:
                    assert value.startswith('#'), 'External asset reference'
    print('PASS: 12 deliverables, 10 states, 32 catalogue items, token CSS, local links, 8 local SVG posters and locked vision digest.')


if __name__=='__main__':
    main()
