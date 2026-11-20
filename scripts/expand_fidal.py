"""Expand source-defined Fidäl inventory; never synthesize strokes or sounds.

Rows transcribed from BGN/PCGN Tigrinya 2007, validity checked 2022,
pages 1–3. Harvard ELIAS independently supports the common basic rows.
Run explicitly when updating the canonical content, then build_fidal.py.
"""
import copy
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
path = root / 'shared/content-review/fidal-writing.json'
data = json.loads(path.read_text(encoding='utf-8'))
existing = {form['character']: form for family in data['families'] for form in family['forms']}
template = copy.deepcopy(existing['በ'])
template['status'] = 'awaiting-qualified-native-tigrinya-review'
template['audio'] = {key: ('ti' if key == 'language' else template['status'] if key == 'status' else None) for key in template['audio']}
template['handwriting'] = {key: ([] if key == 'strokes' else 'ti' if key == 'language' else template['status'] if key == 'status' else None) for key in template['handwriting']}
bank = json.loads((root / 'unit-02-first-words/unit-2-content-review.json').read_text(encoding='utf-8'))
# Keep the familiar starting families, followed by the remaining reference rows.
rows = 'በቡቢባቤብቦ ተቱቲታቴትቶ መሙሚማሜምሞ ሀሁሂሃሄህሆ ለሉሊላሌልሎ ሐሑሒሓሔሕሖ ሠሡሢሣሤሥሦ ረሩሪራሬርሮ ሰሱሲሳሴስሶ ሸሹሺሻሼሽሾ ቀቁቂቃቄቅቆ ቐቑቒቓቔቕቖ ቸቹቺቻቼችቾ ኀኁኂኃኄኅኆ ነኑኒናኔንኖ ኘኙኚኛኜኝኞ አኡኢኣኤእኦ ከኩኪካኬክኮ ኸኹኺኻኼኽኾ ወዉዊዋዌውዎ ዐዑዒዓዔዕዖ ዘዙዚዛዜዝዞ ዠዡዢዣዤዥዦ የዩዪያዬይዮ ደዱዲዳዴድዶ ጀጁጂጃጄጅጆ ገጉጊጋጌግጎ ጠጡጢጣጤጥጦ ጨጩጪጫጬጭጮ ጰጱጲጳጴጵጶ ጸጹጺጻጼጽጾ ፀፁፂፃፄፅፆ ፈፉፊፋፌፍፎ ፐፑፒፓፔፕፖ ቨቩቪቫቬቭቮ'.split()
labialized = 'ኰኲኳኴኵ ዀዂዃዄዅ ቈቊቋቌቍ ቘቚቛቜቝ ጐጒጓጔጕ ኈኊኋኌኍ'.split()
additional = 'ሏሟሯሷሿቧቷቿኗኟዟዧዷጇጧጯጿፏ'
families = []
for number, row in enumerate(rows + labialized + [additional]):
    kind = 'basic' if number < len(rows) else 'labialized' if number < len(rows + labialized) else 'additional'
    family = row[0] if kind != 'additional' else 'additional'
    orders = list(range(1, 8)) if kind == 'basic' else [1, 3, 4, 5, 6] if kind == 'labialized' else [4] * len(row)
    record = {'family': family, 'kind': kind, 'label': 'Additional forms' if kind == 'additional' else family + ' family', 'forms': []}
    if family in ['ሠ', 'አ']:
        record['usageNote'] = 'The reference notes declining use. A native reviewer should confirm its teaching priority.'
    for character, order in zip(row, orders):
        form = copy.deepcopy(existing.get(character, template))
        form.update(character=character, family=family, order=order, unicode='U+' + format(ord(character), '04X'), structureSources=['uk-tigrinya'])
        if character not in existing:
            form['contexts'] = [{'word': item['scriptCandidate'], 'meaning': item['pictureLesson']['englishConcept'], 'source': item['sourceUrl'], 'corpusId': item['id'], 'status': form['status']} for item in bank['items'] if item['includedInChildActivity'] and character in item['letters']]
        record['forms'].append(form)
    families.append(record)
assert len(rows) == 35 and len({form['character'] for family in families for form in family['forms']}) == 293
data['families'] = families
data['sources'][1]['scope'] = 'All 35 basic rows on pages 1–2; six five-order labialized rows and 18 additional fourth-order forms on pages 2–3. Romanization is not audio or stroke evidence.'
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Expanded 35 basic families, six labialized families and 18 additional forms: 293 forms')
