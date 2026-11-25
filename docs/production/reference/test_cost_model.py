"""Tests for the planning worksheet, not provider or learner behavior."""
import copy
import json
import unittest
from decimal import Decimal
from pathlib import Path

from cost_model import contribution, monthly, production_labor


class CostModelTests(unittest.TestCase):
    def setUp(self):
        self.config = json.loads((Path(__file__).parents[1] / 'cost-model.json').read_text())

    def test_native_audio_units_and_default_no_ai(self):
        result = monthly(self.config, 1000)
        self.assertEqual(result['delivery_gb'], Decimal('2.16'))
        self.assertEqual(result['delivery_usd'], Decimal('0.2592'))
        self.assertEqual(result['cloud_feedback_usd'], 0)
        self.assertEqual(result['subtotal_usd'], Decimal('360.8592'))

    def test_human_review_includes_time_and_wage(self):
        result = monthly(self.config, 1000, 'human_feedback')
        self.assertEqual(result['human_review_hours'], Decimal('3.333333333333333333333333333'))
        self.assertAlmostEqual(result['cloud_feedback_usd'], Decimal('100'))

    def test_realtime_input_output_count_separately(self):
        result = monthly(self.config, 1000, 'gated_ai')
        self.assertEqual(result['input_audio_minutes'], 400)
        self.assertEqual(result['output_audio_minutes'], 400)
        self.assertEqual(result['audio_only_lower_bound_usd'], Decimal('38.4000'))
        self.assertEqual(result['cloud_feedback_usd'], Decimal('57.60000'))

    def test_scale_changes_delivery_and_uses_explicit_host_multiplier(self):
        result = monthly(self.config, 10000, 'gated_ai')
        self.assertEqual(result['delivery_gb'], Decimal('21.6'))
        self.assertEqual(result['hosting_usd'], Decimal('1080'))
        self.assertEqual(result['audio_only_lower_bound_usd'], Decimal('384.0000'))

    def test_zero_activity_keeps_planned_fixed_capacity(self):
        result = monthly(self.config, 0)
        self.assertEqual(result['delivery_gb'], 0)
        self.assertEqual(result['subtotal_usd'], Decimal('360.600'))

    def test_rejected_takes_increase_content_labor(self):
        self.assertAlmostEqual(production_labor(self.config, 100), Decimal('357.1428571428571428571428571'))

    def test_unpriced_business_costs_are_not_profit(self):
        self.assertEqual(contribution(100, 10, Decimal('.2'), 100, 50), Decimal('650.0'))

    def test_invalid_inputs_fail_instead_of_fabricating_cost(self):
        for count in [-1, True, 1.5, float('inf')]:
            with self.subTest(count=count), self.assertRaises(ValueError):
                monthly(self.config, count)
        for value in [0, -1, 1.1, float('nan')]:
            bad = copy.deepcopy(self.config)
            bad['assumptions']['accepted_take_fraction'] = value
            with self.subTest(value=value), self.assertRaises(ValueError):
                production_labor(bad, 100)
        with self.assertRaises(ValueError):
            monthly(self.config, 1000, 'automatic_child_grading')


if __name__ == '__main__':
    unittest.main()
