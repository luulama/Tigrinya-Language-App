"""Build the first-practice media manifest without inventing language or approvals."""
import argparse
from datetime import date
import hashlib
import json
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]


def build(source, root):
    forms=source['families'][0]['forms'][:3]
    revision=hashlib.sha256(json.dumps(forms,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
    result={'schemaVersion':1,'sourceRevision':revision,'status':'pending','audioUrl':None,'sha256':None}
    if source.get('language')!='ti' or source.get('direction')!='ltr' or source.get('script')!='Ethi':
        result['status']='invalid';return result
    audio=forms[0]['audio']
    if any(f['status']!='approved' for f in forms) or audio['status']!='approved':return result
    result['status']='invalid'
    try:
        required=['reviewer','reviewedAt','rights','sourceUrl','sourceLocator','speaker','variety']
        if audio['language']!='ti' or not all(isinstance(audio.get(k),str) and audio[k].strip() for k in required):return result
        if date.fromisoformat(audio['reviewedAt']).isoformat()!=audio['reviewedAt'] or not audio['sourceUrl'].startswith('https://'):return result
        normal=audio['normal']
        if not isinstance(normal,str) or not re.fullmatch(r'(?:\.\./shared/)?assets/[A-Za-z0-9_./-]+\.(?:mp3|wav|ogg|m4a)',normal):return result
        shared=normal.startswith('../shared/')
        relative=normal.removeprefix('../shared/') if shared else normal
        if '..' in relative or not re.fullmatch(r'[0-9a-f]{64}',audio.get('sha256','')):return result
        allowed=(root/('shared/assets' if shared else 'unit-01-fidel-foundations/assets')).resolve()
        file=(root/('shared' if shared else 'unit-01-fidel-foundations')/relative).resolve()
        if not file.is_relative_to(allowed) or not file.is_file() or file.stat().st_size>20*1024*1024:return result
        digest=hashlib.sha256(file.read_bytes()).hexdigest()
        if digest!=audio['sha256']:return result
        result.update(status='ready',audioUrl='/preview/'+('shared' if shared else 'unit-01-fidel-foundations')+'/'+relative,sha256=digest)
    except (OSError,ValueError,TypeError,KeyError):pass
    return result


def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--check',action='store_true');args=parser.parse_args()
    manifest=build(json.loads((ROOT/'shared/content-review/fidal-writing.json').read_text()),ROOT)
    output=ROOT/'content/first-lesson-media.json';content=json.dumps(manifest,ensure_ascii=False,indent=2)+'\n'
    if args.check:assert output.read_text()==content,'First lesson media manifest is stale; run scripts/build_first_lesson.py'
    else:output.write_text(content)
    print('First lesson media manifest: '+manifest['status']+'; no review approval created.')


if __name__=='__main__':main()
