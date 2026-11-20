"""Import sourced dictionary candidates as drafts only; preserve the legacy bank."""
import json,uuid
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=json.loads((root/'unit-02-first-words/unit-2-content-review.json').read_text())
records=[]
for item in source['items']:
    records.append({'id':str(uuid.uuid5(uuid.NAMESPACE_URL,item['sourceUrl']+'#'+item['id'])),'languageTag':'ti','kind':'Word','title':item['scriptCandidate'],'state':'Draft','payload':{'script':item['scriptCandidate'],'meaning':'; '.join(item['englishMeaningCandidates']),'senseId':item['id'],'source':item['sourceUrl'],'attribution':'English Wiktionary contributors via Kaikki.org / Wiktextract; CC BY-SA 4.0; see legacy source/review records.','imageAssetId':None,'audioAssetId':None}})
(root/'content/tigrinya-drafts.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
print(f'Imported {len(records)} dictionary candidates as drafts; none approved or published.')
