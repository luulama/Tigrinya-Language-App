# Cost planning and source register

Checked 25 November 2026. This is a transparent what-if worksheet, **not a cloud quote, measured app bill, approved budget or evidence that a provider can grade Tigrinya**. No service was activated. [cost-model.json](cost-model.json) contains inputs; [reference/cost_model.py](reference/cost_model.py) uses decimal arithmetic and no network, secrets or environment configuration.

## Checked rates versus assumptions

| Input | Evidence or assumption |
| --- | --- |
| GPT-Realtime-2.1 audio $32/million input tokens, $64/million output tokens | Current official model page; no discount/cache saving assumed. [Model pricing](https://developers.openai.com/api/docs/models/gpt-realtime-2.1) |
| User audio approximately 600 tokens/minute, assistant audio 1,200/minute | Official explanation: user token per 100 ms, assistant token per 50 ms; special tokens/history add cost. [Realtime cost guide](https://developers.openai.com/api/docs/guides/voice-latency-cost?voice-api=realtime) |
| Hosted Whisper $0.006/minute | Deprecated model; historical comparison only, excluded from recommended scenarios. [Model status and price](https://developers.openai.com/api/docs/models/whisper-1) |
| Azure speech/hosting/storage/CDN | Actual price depends on region, offer, SKU and usage. No selected quote retrieved. Replace the explicit illustrative inputs before procurement. [Azure Speech pricing](https://azure.microsoft.com/en-us/pricing/details/speech/) |
| Web $80 + API $80 + worker $40 + database $120 + monitoring $30 + secrets $10 monthly | **Unquoted planning allowances**, total $360. No claim these buy redundancy, a particular Azure SKU or the proposed service targets |
| Three times hosting allowance at 10,000 learners | **Assumption**, not a benchmark or autoscaling rule; valid only as the displayed scenario, not an arbitrary-volume forecast |
| 25 GB catalogue storage × $0.024/GB-month; delivery $0.12/GB | **Unquoted assumptions**; unchanged shared catalogue across cohorts; SI GB. Transactions, backups, request fees and container overhead extra |
| 60 plays × three seconds × 96 kbit/s per active learner/month | **Usage assumption**, 2.16 MB/learner before overhead; CDN cache saves origin load but does not make learner delivery free |
| Reviewer $30/hour; two minutes per learner clip; 5% participation × two clips/month | **Illustrative labor inputs**, not a wage offer, native quality guarantee or adequate review SLA |
| Gated AI: 5% participation × eight sessions/month, each one input minute plus one output minute | **Sensitivity scenario only**, distinct from the current eight-second recorder and excluded from MVP; requires a separately approved feature/consent/recording scope |
| AI planning multiplier 1.5 | **Assumption**, not an upper bound. Text, context replay, retries and evaluation can exceed it; reconcile measured bills and cap real spend |

## Reproducible monthly illustration

Run `python3 -B docs/production/reference/cost_model.py`. Rounded subtotals:

| Active learners | Native models only | Models + illustrative human feedback | Models + gated AI sensitivity |
| --- | ---: | ---: | ---: |
| 1,000 | $360.86 | $460.86 | $418.46 |
| 10,000 | $1,083.19 | $2,083.19 | $1,659.19 |

These are **partial operating subtotals**, not total costs or a claim that AI is preferable to human feedback. They exclude engineering/product/teaching salaries, native asset production, independent publication review, rights, legal/privacy/security, support, payment/store fees, tax, observability overages, backups, requests, outbound-provider bandwidth and demand spikes. Quality and eligibility gates decide whether a scenario is viable before price does.

At 1,000 learners the AI sensitivity uses 400 minutes of input **and** 400 minutes of output. Its fresh audio-only lower bound is `400 × 600 × 32 / 1,000,000 + 400 × 1200 × 64 / 1,000,000 = $38.40`; the illustrative buffer gives $57.60. One minute of each direction costs $0.096 before extras and represents **two minutes of audio**, not one wall-clock minute. Multi-turn histories can be billed again; no bounded total is promised by this arithmetic.

For 100 accepted native assets, five capture/edit minutes per candidate, $30/hour and 70% accepted takes yields approximately $357.14 candidate labor. Add at least the independently budgeted native review: for example, two reviewers × two minutes × 100 accepted assets × $30/hour = $200, **before** rejected-candidate review, rights, project coordination and re-recordings. Neither number establishes an actual commercial agreement or that two minutes is enough for every sentence.

## Self-hosting, Azure and revenue sensitivity

Self-hosted ASR cost is `measured GPU hours × actual hourly price + storage + egress + operations + recurring calibration/security`. Required GPU hours depend on measured real-time factor, batch size, utilization and availability. Do not supply a fictitious GPU price or compare a fully operated managed service with an unattended GPU. Language support and licensed training data remain separate feasibility gates.

Azure assessment requires a supported feature/locale before a regional quote has product value. If supported later, estimate billed audio seconds under the selected offer plus applicable assessment/storage/network charges; reconcile exact rounding and tier behavior from that offer. Current absence from the Tigrinya pronunciation-assessment table blocks the proposed automated evaluator regardless of a hypothetical low rate. [Azure feature-specific language support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=pronunciation-assessment)

Use `net receipts = paying families × approved monthly price × (1 − actual fee fraction)`. Contribution subtracts the operating subtotal **and all other variable content/review/support costs**. Break-even then also covers actual fixed payroll/rights/operations. Fees, tax and App Store arrangements need the owner's real jurisdiction/channel; this package invents none. Sponsored access and institutional licences need their own sales/support assumptions. Test pricing with adults alongside useful learning and access, never child purchase pressure.

Before activation: owner supplies region/offer, monthly and per-principal caps, corpus/reviewer budget, staffing/support allocation and eligible provider purpose. Put a hard operational stop on new paid jobs before a budget ceiling; report unavailable processing honestly. Do not put vendor keys or pricing overrides in a public client bundle.

## Primary source register and inference boundaries

| Source | Used for | What it does not establish |
| --- | --- | --- |
| [Azure language support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=pronunciation-assessment) | Pronunciation-assessment locale list omits Tigrinya; Tigrinya translation support is a different capability | Accuracy of an unlisted locale or equivalence with Amharic |
| [Whisper tokenizer](https://github.com/openai/whisper/blob/main/whisper/tokenizer.py) | Public Whisper language mapping omits Tigrinya | Capabilities of every current/future OpenAI audio model |
| [Whisper model](https://developers.openai.com/api/docs/models/whisper-1) | Hosted model deprecation and legacy price | A suitable new Tigrinya scoring dependency |
| [OpenAI model](https://developers.openai.com/api/docs/models/gpt-realtime-2.1) and [cost guide](https://developers.openai.com/api/docs/guides/voice-latency-cost?voice-api=realtime) | Listed rate and token-duration cost approximation | Child/Tigrinya pronunciation validity or fixed per-conversation cost |
| [SM-2 author](https://www.super-memory.com/english/ol/sm2.htm) | Public baseline interval/ease heuristic | All modern SuperMemo behavior or measured child-Tigrinya retention |
| [FSRS maintainer algorithm guide](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm) | Versioned difficulty/stability/retrievability model family | Proof that this project's FSRS-7 deployment has been calibrated |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Accessibility requirements | A passed conformance audit or a guarantee of child usability |
| [FTC children's rule update](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data) and [EU child safeguards](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/legal-grounds-processing-data/are-there-any-specific-safeguards-data-about-children_en) | Consent, minimization, retention and child-information design constraints | Legal advice or confirmation that this implementation complies |

Repository findings are pinned to `48c0b21`: generic content/version/reviewer workflow, .NET SM-2, TypeScript `ts-fsrs@6.0.0` FSRS-7 adapter, AI interfaces, and isolated default-offline mobile target. These are source observations, not a query of a live tenant, database, billing account or learner population.
