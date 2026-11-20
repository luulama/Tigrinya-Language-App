# 16 — AI Strategy

**Version:** DRAFT_V1 — complete specification for whole-Bible review  
**Date:** 20 November 2026  
**Authority:** [Vision FINAL_V1](01-Vision.md), approved and unchanged. All other sections are working specifications awaiting owner approval.  
**Primary dependencies:** Sections 01–15, especially child agency, content approval, private evidence and speaking validity.  
**Context:** All existing sections 01–15 read before this section was written. Later references are forward contracts reconciled in the whole-Bible review.  
**Evidence:** [Learning model and research](02-How-Humans-Learn.md); [source register](RESEARCH-REGISTER.md). Numerical targets, budgets, and thresholds below are design hypotheses unless explicitly sourced. No new Tigrinya teaching content or native approval is supplied.

## 1. AI is optional and subordinate to trustworthy teaching

The platform must remain useful without generative AI. The existing code contains interfaces only; this document activates no model, provider, tracking, speech service, or child conversation. A credible-looking response is not verified Tigrinya. Native approval cannot be issued by an AI model or simulated expert identity.

The decision test is whether a bounded use improves a defined workflow enough to justify accuracy, safety, privacy, cost, and maintenance risks. Use ordinary rules, search, and reviewed authored material when they solve the need more simply.

## 2. Capability contracts

| Role | Permitted proposed help | Where it can harm | Required boundary and fallback |
| --- | --- | --- | --- |
| AI content assistant | Draft planning briefs, tag missing metadata, suggest review questions. | Invented forms, false provenance, culturally narrow examples. | Draft-only output with sources checked by humans; never auto-publish. |
| AI reviewer assistant | Flag inconsistent fields, missing rights, suspicious associations. | False approval or missed errors interpreted as safety. | Suggestions only; qualified independent reviewer owns the decision. |
| AI recommendations | Summarise explicit objectives/evidence for adult reflection. | Opaque profiling or optimisation of screen time. | Deterministic planner remains authoritative; no inferred child traits. |
| AI tutor | Future bounded explanation grounded in approved material. | Unreviewed pronunciation, grammar, examples, or advice. | Approved retrieval boundaries, uncertainty, authored fallback, evaluated outputs. |
| AI conversation partner | Future controlled rehearsal for suitable users. | Inappropriate content, fabricated feedback, privacy exposure, false relationship. | Separate approval, population testing, constrained purpose, safe exit and human escalation. Not MVP. |
| AI coach | Future reflection on a defined task or plan. | Shame, unsupported mastery judgments, intrusive psychological inference. | No clinical/emotional diagnosis or autonomous high-stakes decision; descriptive guidance only. |

“Grounded” means the output is constrained and traceable; it does not guarantee correctness. Referencing an approved source does not approve newly generated language or a new association.

## 3. Human review workflow

Keep generated drafts separated from learner-visible content. Record tool/model version, relevant prompt/template version, source references, generated provenance, and human corrections where necessary for accountability. Do not include raw child work or credentials merely to make an authoring assistant convenient.

Run structural checks, then qualified language/teaching/rights/access review. A reviewer must inspect the exact text/media and intended use, not just accept a confidence label. Publication remains Section 15's explicit transaction. Changed generated material invalidates the affected approval scope.

## 4. Evaluation before enablement

For each proposed capability, define realistic and adversarial tasks, qualified reference judgments, acceptable error and uncertainty behaviour, relevant varieties/ages/access needs, privacy conditions, costs, and rollback criteria. Include unsupported questions, source conflicts, prompt injection in retrieved content, and attempts to obtain private data.

A model benchmark or broad multilingual claim is not evidence for Tigrinya child teaching. Speech recognition performance is not validated pronunciation feedback. Refusal or “I cannot verify that” may be the correct outcome; fallback to a reviewed model or no judgment.

## 5. Technical and operational controls

Put provider access behind an application port with scoped data, explicit timeouts, output schema validation, spend limits, version records, and a kill switch. Never send provider keys to the browser. Treat retrieved documents and model output as untrusted input. Tools cannot obtain permission to publish, message, or share data merely because generated text asks them to.

Service failures must return the ordinary reviewed experience, not a fake response or a failed learner score. Cache only non-private approved material under explicit policy; do not reuse one learner's generated response for another. Log structured operational events without raw personal content by default.

## 6. Prioritisation

MVP: no live learner-facing AI. V1: consider an adult authoring assistant only after a measured review/workflow benefit. V2: evaluate bounded explanations if content quality and privacy justify them. Future conversational coaching requires an explicitly approved population, purpose, safeguards, and evidence of benefit. AI should not consume the budget required for native recordings, review, and accessible foundations.

## 7. Acceptance

A feature is eligible only with a specified educational/operational purpose, demonstrated suitable error handling, human responsibility, a no-AI fallback, data minimisation, sustainable costs, and a documented decision to enable it. This section supplies a strategy, not authorisation to deploy a provider or claim AI improves learning.
