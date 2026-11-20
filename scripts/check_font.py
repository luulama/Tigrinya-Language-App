"""Optional macOS font-data/rendering diagnostic, separate from browser QA."""
import argparse
import json
from pathlib import Path
import subprocess
import sys
import tempfile

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', required=True, help='PNG specimen destination')
args = parser.parse_args()
if sys.platform != 'darwin':
    parser.error('This optional diagnostic requires macOS CoreText and Swift; the app does not.')
root = Path(__file__).resolve().parent.parent
forms = json.loads((root / 'shared/content-review/fidal-writing.json').read_text(encoding='utf-8'))
bank = json.loads((root / 'unit-02-first-words/unit-2-content-review.json').read_text(encoding='utf-8'))
strings = [form['character'] for family in forms['families'] for form in family['forms']]
strings += [item['scriptCandidate'] for item in bank['items']]
strings += ['በጊዕ', 'ቡን', 'ስሳ፟', '፡', '።']  # Includes a labelled combining-mark fixture, not new vocabulary.
output = Path(args.output).resolve()
output.parent.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix='tigrinya-font-') as folder:
    corpus = Path(folder) / 'corpus.json'
    corpus.write_text(json.dumps(strings, ensure_ascii=False), encoding='utf-8')
    cache = Path(tempfile.gettempdir()) / 'tigrinya-fidal-swift-modules'
    subprocess.run(['/usr/bin/swift', '-module-cache-path', str(cache), str(root / 'tests/check_fidal_font.swift'), str(corpus), str(output)], check=True)
print(f'Specimen: {output}')
