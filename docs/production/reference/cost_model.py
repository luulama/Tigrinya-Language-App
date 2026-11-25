"""Deterministic USD planning arithmetic. No network, environment or service use."""
import json
from decimal import Decimal, InvalidOperation
from pathlib import Path


def number(value, lower=Decimal('0'), upper=None):
    if isinstance(value, bool):
        raise ValueError('Boolean is not a monetary or usage quantity')
    try:
        result = Decimal(str(value))
    except InvalidOperation as error:
        raise ValueError('Invalid quantity') from error
    if not result.is_finite() or result < lower or (upper is not None and result > upper):
        raise ValueError('Quantity outside permitted range')
    return result


def count(value):
    result = number(value)
    if result != result.to_integral_value():
        raise ValueError('Count must be an integer')
    return result


def monthly(config, learners, scenario='native_only'):
    """A subtotal excluding unpriced staff, rights, support, tax and vendor overhead."""
    if scenario not in ('native_only', 'human_feedback', 'gated_ai'):
        raise ValueError('Unknown planning scenario')
    n = count(learners)
    assumptions = config['assumptions']
    rates = config['rates']
    a = lambda name: number(assumptions[name])
    r = lambda name: number(rates[name])
    participation = number(assumptions['feedback_participation_fraction'], upper=Decimal('1'))
    hosting = sum(number(value) for value in assumptions['hosting_monthly_usd'].values())
    if n >= count(assumptions['large_cohort_threshold']):
        hosting *= number(assumptions['large_cohort_host_multiplier'], lower=Decimal('1'))
    # SI GB; 1 kbit/s = 1000 bits/s, 8 bits per byte. Container overhead omitted.
    delivery_gb = n * a('plays_per_learner_month') * a('seconds_per_play') * a('delivery_kilobits_per_second') * 1000 / 8 / 10**9
    result = {
        'learners': n, 'scenario': scenario, 'hosting_usd': hosting,
        'delivery_gb': delivery_gb, 'delivery_usd': delivery_gb * a('delivery_per_gb_usd'),
        'storage_usd': a('catalogue_storage_gb') * a('storage_per_gb_month_usd'),
        'cloud_feedback_usd': Decimal('0'), 'human_review_hours': Decimal('0'),
        'input_audio_minutes': Decimal('0'), 'output_audio_minutes': Decimal('0'),
        'audio_only_lower_bound_usd': Decimal('0'),
    }
    if scenario == 'human_feedback':
        hours = n * participation * a('human_clips_per_participant_month') * a('human_minutes_per_clip') / 60
        result['human_review_hours'] = hours
        result['cloud_feedback_usd'] = hours * a('reviewer_hourly_usd')
    if scenario == 'gated_ai':
        sessions = n * participation * a('ai_sessions_per_participant_month')
        incoming = sessions * a('ai_input_minutes_per_session')
        outgoing = sessions * a('ai_output_minutes_per_session')
        base = (incoming * r('audio_input_tokens_per_minute') * r('audio_input_per_million_usd')
                + outgoing * r('audio_output_tokens_per_minute') * r('audio_output_per_million_usd')) / 10**6
        result.update(input_audio_minutes=incoming, output_audio_minutes=outgoing, audio_only_lower_bound_usd=base)
        result['cloud_feedback_usd'] = base * number(assumptions['ai_planning_multiplier'], lower=Decimal('1'))
    result['subtotal_usd'] = sum(result[key] for key in ('hosting_usd', 'delivery_usd', 'storage_usd', 'cloud_feedback_usd'))
    return result


def production_labor(config, accepted_assets):
    """Capture/edit candidate labor only; independent review/rights excluded."""
    a = config['assumptions']
    accepted = number(a['accepted_take_fraction'], lower=Decimal('0'), upper=Decimal('1'))
    if not accepted:
        raise ValueError('Accepted take fraction must exceed zero')
    return (count(accepted_assets) * number(a['production_minutes_per_candidate'])
            * number(a['reviewer_hourly_usd']) / 60 / accepted)


def contribution(payers, price, fee_fraction, operating_subtotal, other_variable_costs):
    """Scenario contribution before unpriced fixed costs; not net profit."""
    return (count(payers) * number(price) * (1 - number(fee_fraction, upper=Decimal('1')))
            - number(operating_subtotal) - number(other_variable_costs))


if __name__ == '__main__':
    config = json.loads((Path(__file__).parents[1] / 'cost-model.json').read_text())
    for learners in (1000, 10000):
        for scenario in ('native_only', 'human_feedback', 'gated_ai'):
            result = monthly(config, learners, scenario)
            print(f"{learners:>5} {scenario:>14}: planning subtotal ${result['subtotal_usd']:.2f}; not a quote or full operating budget")
    print(f"100 accepted assets: candidate capture/edit labor ${production_labor(config, 100):.2f}; independent review/rights extra")
