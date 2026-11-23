"""Read the web packager's literal allowlist as data; never execute its builders."""
import ast
import json
from pathlib import Path

root = Path(__file__).resolve().parents[3]
tree = ast.parse((root / 'scripts/build_site.py').read_text())
lists = [ast.literal_eval(node.value) for node in tree.body
         if isinstance(node, ast.Assign) and isinstance(node.value, ast.List)
         and any(isinstance(target, ast.Name) and target.id == 'runtime' for target in node.targets)]
if len(lists) != 1:
    raise SystemExit('Expected exactly one literal runtime allowlist in build_site.py; review packaging changes.')
files = lists[0]
for folder in ['stories/assets', 'shared/mascot/assets']:
    files += [str(path.relative_to(root)) for path in sorted((root / folder).glob('*.svg'))]
reviews = json.loads((root / 'shared/content-review/pronunciation-cards.json').read_text())
inventory = json.loads((root / 'shared/content-review/fidal-writing.json').read_text())
approved = {target['character'] for target in reviews['targets'] if target.get('status') == 'approved'}
for family in inventory['families']:
    for form in family['forms']:
        if form['character'] in approved:
            for speed in ['normal', 'slow']:
                files.append('shared/' + form['audio'][speed].removeprefix('../shared/'))
for name in files:
    path = root / name
    if not path.is_file() or root.resolve() not in path.resolve().parents:
        raise SystemExit(f'Invalid or missing mobile source: {name}')
print(json.dumps(list(dict.fromkeys(files))))
