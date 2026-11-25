import copy
import json
import unittest
from pathlib import Path
from uuid import uuid4
from check_package import SpecError, check_api, check_register, validate

BASE = Path(__file__).parents[1]


class ContractTests(unittest.TestCase):
    def setUp(self):
        self.api = json.loads((BASE / 'openapi.json').read_text())
        self.schemas = self.api['components']['schemas']

    def check(self, name, value):
        validate(value, self.schemas[name], self.schemas)

    def test_abstention_cannot_become_a_score(self):
        result = {'outcome':'not_assessed','source':'none','reasonCode':'unsupported',
                  'feedbackVersionIds':[],'evaluatedAt':'2026-11-25T00:00:00Z'}
        self.check('Evaluation', result)
        with self.assertRaises(SpecError):
            self.check('Evaluation', dict(result, confidence=.95))
        with self.assertRaises(SpecError):
            self.check('Evaluation', dict(result, outcome='correct'))

    def test_client_cannot_send_correctness_or_arbitrary_fields(self):
        answer = {'mode':'choice','choiceVersionId':str(uuid4())}
        self.check('Answer', answer)
        with self.assertRaises(SpecError):
            self.check('Answer', dict(answer, correct=True))

    def test_model_grade_requires_calibration_and_uncertainty(self):
        result = {'outcome':'close','source':'validated_model','rubricVersionId':str(uuid4()),
                  'engineVersion':'fixture','reasonCode':'fixture','confidence':.9,
                  'calibrationDigest':'a'*64,'feedbackVersionIds':[],
                  'evaluatedAt':'2026-11-25T00:00:00Z'}
        self.check('Evaluation', result)
        for field in ['confidence','calibrationDigest']:
            bad = dict(result)
            del bad[field]
            with self.subTest(field=field), self.assertRaises(SpecError):
                self.check('Evaluation', bad)

    def test_input_limits_and_boolean_as_number(self):
        body = {'targetReleaseId':str(uuid4()),'consentReceiptId':str(uuid4()),
                'sha256':'a'*64,'durationMs':8000,'bytes':10000,'mimeType':'audio/mp4'}
        self.check('SpeechCreate', body)
        for update in [{'durationMs':8001},{'durationMs':True},{'sha256':'bad'},{'bytes':1048577}]:
            with self.subTest(update=update), self.assertRaises(SpecError):
                self.check('SpeechCreate', dict(body, **update))

    def test_child_analytics_cannot_be_enabled_in_control_contract(self):
        body = dict(saveProgress=True, cloudSpeech=False, humanSpeechSharing=False,
                    optionalAnalytics=False, policyVersion='fixture', etag='fixture')
        self.check('PrivacyControls', body)
        with self.assertRaises(SpecError):
            self.check('PrivacyControls', dict(body, optionalAnalytics=True))

    def test_api_references_and_idempotency_are_required(self):
        check_api(self.api)
        broken = copy.deepcopy(self.api)
        broken['paths']['/api/v1/speech-submissions']['post']['parameters'] = []
        with self.assertRaises((SpecError, KeyError)):
            check_api(broken)
        broken = copy.deepcopy(self.api)
        broken['components']['schemas']['SpeechCreate']['properties']['bad'] = {'$ref':'#/components/schemas/Missing'}
        with self.assertRaises(SpecError):
            check_api(broken)

    def test_complete_coverage_cannot_claim_implementation(self):
        register = json.loads((BASE / 'requirements.json').read_text())
        check_register(register)
        register['requirements'][0]['status'] = 'implemented'
        with self.assertRaises(SpecError):
            check_register(register)


if __name__ == '__main__':
    unittest.main()
