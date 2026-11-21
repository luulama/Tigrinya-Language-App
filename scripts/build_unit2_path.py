"""Build the Unit 2-onward visual path solely from existing source candidates."""
import json
import hashlib
from pathlib import Path

root = Path(__file__).resolve().parents[1]
unit = root / 'unit-02-first-words'
source = json.loads((unit / 'unit-2-content-review.json').read_text())
words = [dict(id=x['id'], word=x['scriptCandidate'], letters=x['letters'],
              concept=x['pictureLesson']['englishConcept'], art=x['pictureLesson']['art'],
              group=x['pictureLesson']['group'], sourceUrl=x['sourceUrl'])
         for x in source['items'] if x.get('includedInChildActivity')]
by_script = {w['word']: w for w in words}
first = [by_script[s] for s in ['ቤት', 'ማይ', 'ድሙ']]
seen_art = {w['art'] for w in first}
eligible = first[:]
excluded = []
for w in words:
    if w in first:
        continue
    if w['art'] in seen_art:
        excluded.append(dict(id=w['id'], reason='Same-picture alternative needs a native usage distinction; retained in the original review bank.'))
    else:
        eligible.append(w)
        seen_art.add(w['art'])
lessons = []
def add(unit_number, title, kind, targets, goal, chapter, requires=None):
    number = sum(x['unit'] == unit_number for x in lessons) + 1
    identity = f'u{unit_number}-{number:02d}'
    prerequisites = requires if requires is not None else ([lessons[-1]['id']] if lessons else [])
    lesson = dict(id=identity, unit=unit_number, title=title, kind=kind, chapter=chapter,
                  wordIds=[w['id'] for w in targets], goal=goal, prerequisites=prerequisites,
                  characters=list(dict.fromkeys(c for w in targets for c in w['letters'])),
                  vocabulary=[dict(wordId=w['id'], script=w['word'], concept=w['concept']) for w in targets],
                  sounds='Not taught or assessed: reviewed recordings are missing.', grammar=[],
                  skills=['picture-word recognition', 'left-to-right form construction'] if unit_number==2 else ['visual reading', 'Ethiopic text entry'],
                  prerequisiteKnowledge='Relevant Fidäl forms from the unchanged Unit 1; model help is available.' if not lessons else 'Pass the preceding visual practice check.',
                  languageScope='Existing two-character Tigrinya source candidates; no new sounds or grammar.',
                  recipe=['Model', 'Guided practice', 'Recap', 'Visual check without the answer model'],
                  completionRule='Solve every check prompt on a fresh run without answer-revealing help. This unlocks practice, not language mastery.',
                  reviewPlan='Brief cumulative checkpoints; due visual reviews after 1, 3 and 7 days. Same-day repeats do not advance the interval.',
                  releaseStatus='awaiting-qualified-native-tigrinya-review', available=True)
    lessons.append(lesson)
    if kind == 'checkpoint':
        lesson['recipe'] = ['Recall familiar words without a pre-answer model', 'Optional model and corrective retry', 'Mixed visual check', 'Delayed review']
    elif kind == 'introduce':
        lesson['recipe'] = ['Picture-word model and two forms', 'Look, build and find each word', 'Recap taught words', 'Mixed picture-word check']
    elif kind == 'positions':
        lesson['skills'] = ['word segmentation', 'first/last form recognition']
        lesson['recipe'] = ['Model the two-form word', 'Locate first and last forms', 'Recap', 'Check both positions in each taught word']
    elif kind == 'family':
        lesson['skills'] = ['source family/order relationships', 'locating forms in taught words']
        lesson['recipe'] = ['Show the sourced seven-order family', 'Find related forms in real taught words', 'Recap', 'Locate the target forms again']
    elif kind in ['copy', 'write']:
        lesson['skills'] = ['guided Ethiopic copying', 'optional printed-form writing'] if kind=='copy' else ['picture-cued Ethiopic text entry']
        lesson['recipe'] = ['Show the word model', 'Copy with Ethiopic input; optional printed-form writing', 'Recap', 'Enter the taught word from a picture cue']
    elif kind in ['read', 'mixed']:
        lesson['skills'] = ['word-to-picture visual reading'] if kind=='read' else ['word-to-picture visual reading', 'picture-cued Ethiopic text entry']
        lesson['recipe'] = ['Model the taught word-picture links', 'Read or copy with support', 'Recap', 'Read-to-picture check' if kind=='read' else 'Mixed reading and text-entry check']
    return lesson

add(2, 'Three familiar pictures', 'introduce', first, 'Connect three pictures to two-form words.', 'Begin')
add(2, 'Your first word check', 'checkpoint', first, 'Find the same words in a different arrangement.', 'Begin')
familiar = first[-1]
for group, label in [('food', 'At the table'), ('home', 'Around home'), ('nature', 'Outside'), ('people', 'People & me')]:
    fresh = [w for w in eligible if w not in first and w['group'] == group]
    for start in range(0, len(fresh), 2):
        targets = [familiar] + fresh[start:start+2]
        add(2, f'{label} · {start//2+1}', 'introduce', targets,
            'Meet two source picture words and revisit one familiar word.' if len(targets)==3 else 'Meet one source picture word and revisit a familiar word.', label)
        familiar = targets[-1]
    add(2, f'{label} · review', 'checkpoint', [first[0]] + fresh[-2:],
        'Retrieve familiar picture-word links in a mixed check.', label)

u2_last = lessons[-1]['id']
add(3, 'First and last', 'positions', first, 'Locate the first and last Fidäl forms in taught words.', 'Read & write')
add(3, 'One family, real words', 'family', [by_script[s] for s in ['ባኒ', 'ሩባ', 'ቤት']], 'Notice sourced vowel-order forms from the same family inside familiar words.', 'Read & write')
add(3, 'A word on the page', 'copy', first, 'Copy taught words with actual Ethiopic input; explore a printed form by writing.', 'Read & write')
add(3, 'Read, then find', 'read', [by_script[s] for s in ['ማይ', 'ባኒ', 'ጸባ']], 'Read a familiar word and select its picture.', 'Read & write')
add(3, 'Remember and write', 'write', first, 'Retrieve the two forms of a taught word from a picture cue.', 'Read & write')
add(3, 'Your mixed word check', 'mixed', [by_script[s] for s in ['ድሙ', 'ባኒ', 'ጸባ']], 'Revisit taught word recognition and text entry without a visible answer.', 'Read & write')

for n, title, kinds in [(4, 'Listen & respond', ['Hear familiar words', 'Say a familiar word']), (5, 'First connected meanings', ['A useful message', 'A short reply'])]:
    for i, name in enumerate(kinds):
        lesson = add(n, name, 'pending', first if n == 4 else [],
                     'Connect reviewed native recordings with taught meanings.' if n == 4 else 'Use a native-authored, reviewed sentence pattern in a meaningful exchange.', title)
        lesson.update(available=False,
                      skills=['planned native listening', 'human-supported word rehearsal'] if n==4 else ['planned meaningful messages', 'human-reviewed conversational response'],
                      blockedReason='Needs reviewed, licensed Tigrinya word recordings, spoken directions and a human pronunciation rubric.' if n == 4 else 'Needs native-authored Tigrinya constructions, translations, accepted responses and recordings. No sentence has been invented.',
                      languageScope='Known source words; native sound content missing.' if n == 4 else 'Sentence inventory not yet authored or verified.',
                      recipe=['Reviewed model', 'Supported discrimination/rehearsal', 'Human-reviewed response', 'Delayed review'],
                      completionRule='Not assessed while content is unavailable. A qualified native reviewer must approve the task and rubric before release.')

data = dict(version=1, language='ti', script='Ethi', direction='ltr', words=eligible,
            excludedCandidates=excluded, lessons=lessons,
            units=[dict(number=2, title='First words', goal='Move from familiar Fidäl forms to picture-linked two-character words.'),
                   dict(number=3, title='Read & write', goal='Revisit taught words through positions, family relationships, reading and Ethiopic input.'),
                   dict(number=4, title='Listen & respond', goal='Connect reviewed native sound with familiar meanings.', contentBlocked=True),
                   dict(number=5, title='First connected meanings', goal='Use native-authored useful messages and replies.', contentBlocked=True)],
            source='unit-2-content-review.json', reviewStatus='pending', unit1Unchanged=True)
data['contentVersion'] = hashlib.sha256(json.dumps(data, ensure_ascii=False, sort_keys=True).encode()).hexdigest()
data['compatibleProgressVersions'] = [data['contentVersion']]
data['materialVersion'] = hashlib.sha256(json.dumps(dict(words=data['words'],lessons=[{key:l[key] for key in ['id','unit','kind','wordIds','prerequisites','available']} for l in lessons]),ensure_ascii=False,sort_keys=True).encode()).hexdigest()
data['spacedReview'] = dict(version=1,timeIntervalsDays=[1,3,7,14,30,60],lessonGaps=[2,4,7,11],mixedBudget=2,correctiveRevisits=1)
first_taught = set()
for lesson in lessons:
    lesson['introduceWordIds'] = [id for id in lesson['wordIds'] if id not in first_taught] if lesson['kind']=='introduce' else []
    if lesson['kind']=='introduce':
        first_taught.update(lesson['wordIds'])
        lesson['goal'] = 'Meet a small group of picture words, with older words returning when ready.'
        lesson['recipe'] = ['Model the new targets only', 'Look, build and find new words', 'At most two spaced older items between new-word activities', 'Recap and check the new targets']
    if lesson['available']:
        lesson['reviewPlan'] = 'Older items return after lesson gaps and elapsed time, with 1/3/7/14/30/60-day intervals for successful delayed recall. Hints shorten spacing. At most two mixed items and one supported revisit; other items remain due.'
data['contentVersion'] = hashlib.sha256(json.dumps(data, ensure_ascii=False, sort_keys=True).encode()).hexdigest()
(unit / 'path-content.js').write_text('// Generated from existing review records by scripts/build_unit2_path.py.\n' + 'globalThis.WordPathContent = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n')
(unit / 'path-curriculum.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
shell = (unit / 'src/path-shell.html').read_text()
(unit / 'path.html').write_text(shell.replace('__SPRITE__', (unit / 'src/unit2-sprite.svg').read_text()))
print(f'Built path: {len(eligible)} existing word candidates, {sum(x["available"] for x in lessons)} playable lessons; future content gates remain closed.')
