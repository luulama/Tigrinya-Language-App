"""Package existing source content for the offline Game Garden. No invented language."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
words = json.loads((root / 'unit-02-first-words/unit-2-content-review.json').read_text())
data = {
    'words': [dict(id=item['id'], word=item['scriptCandidate'], letters=item['letters'],
                   concept=item['pictureLesson']['englishConcept'], art=item['pictureLesson']['art'],
                   sourceUrl=item['sourceUrl'])
              for item in words['items'] if item.get('includedInChildActivity')],
    'source': words['source'],
}
(root / 'shared/game-content.js').write_text(
    '// Generated from existing Unit 2 review records by scripts/build_games.py.\n'
    + 'globalThis.GardenWords = ' + json.dumps(data, ensure_ascii=False) + ';\n')
shell = (root / 'games/src/shell.html').read_text()
sprite = (root / 'unit-02-first-words/src/unit2-sprite.svg').read_text()
(root / 'games/index.html').write_text(shell.replace('__SPRITE__', sprite))
print('Built offline Game Garden with existing source words and artwork.')
