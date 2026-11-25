"""Synthetic manifest-integrity fixtures are not Tigrinya review decisions."""
import copy
import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from build_first_lesson import build


class FirstLessonManifest(unittest.TestCase):
    def setUp(self):self.source=json.loads((ROOT/'shared/content-review/fidal-writing.json').read_text())

    def fixture(self,root):
        source=copy.deepcopy(self.source)
        for form in source['families'][0]['forms'][:3]:form['status']='approved'
        file=root/'unit-01-fidel-foundations/assets/integrity-fixture.wav';file.parent.mkdir(parents=True)
        file.write_bytes(b'Synthetic hash fixture only; no language or audio quality approval')
        source['families'][0]['forms'][0]['audio'].update(status='approved',normal='assets/integrity-fixture.wav',reviewer='synthetic-test-only',reviewedAt='2026-11-25',rights='synthetic fixture',sourceUrl='https://example.invalid/fixture',sourceLocator='test-only',speaker='synthetic-test-only',variety='synthetic-test-only',sha256=hashlib.sha256(file.read_bytes()).hexdigest())
        return source,file

    def test_current_source_has_no_playable_native_media(self):
        result=build(self.source,ROOT);self.assertEqual(result['status'],'pending');self.assertIsNone(result['audioUrl'])

    def test_wrong_language_or_direction_cannot_enable_the_tigrinya_player(self):
        for field,value in [('language','am'),('direction','rtl'),('script','Latn')]:
            source=copy.deepcopy(self.source);source[field]=value;self.assertEqual(build(source,ROOT)['status'],'invalid')

    def test_exact_bytes_and_all_three_reviewed_form_records_are_required(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);source,file=self.fixture(root);self.assertEqual(build(source,root)['status'],'ready')
            file.write_bytes(b'changed');self.assertEqual(build(source,root)['status'],'invalid')
            source['families'][0]['forms'][1]['status']='pending';self.assertEqual(build(source,root)['status'],'pending')

    def test_traversal_remote_urls_and_missing_provenance_do_not_enable_sound(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);source,_=self.fixture(root)
            for normal in ['https://example.invalid/file.wav','assets/../../private.wav']:
                bad=copy.deepcopy(source);bad['families'][0]['forms'][0]['audio']['normal']=normal;self.assertEqual(build(bad,root)['status'],'invalid')
            for field in ['rights','speaker','variety','reviewer']:
                bad=copy.deepcopy(source);bad['families'][0]['forms'][0]['audio'][field]=None;self.assertEqual(build(bad,root)['status'],'invalid')


if __name__=='__main__':unittest.main()
