"""Build design-only coverage and lesson maps from the existing curriculum.

No app source, review record, progress file or learner-facing manifest is written.
Run with --check to verify committed artifacts without modifying them.
"""

import argparse
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import unquote


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
SOURCES = (
    "Product-Bible/01-Vision.md",
    "shared/content-review/fidal-writing.json",
    "unit-02-first-words/path-curriculum.json",
    "unit-02-first-words/unit-2-content-review.json",
    "unit-02-first-words/src/word-routine.js",
    "unit-02-first-words/src/path-app.js",
    "unit-02-first-words/src/path-srs.js",
    "shared/game-garden-core.js",
    "apps/web/lib/learning-start.ts",
    "stories/content/collection.json",
    "stories/content/review.json",
)
PENDING_FORM = "awaiting-qualified-native-tigrinya-review"
PENDING_STORY = "awaiting-fluent-tigrinya-review"


def require(condition, message):
    if not condition:
        raise ValueError(message)


def read_json(path):
    return json.loads((ROOT / path).read_text())


def check_document_links():
    checked = 0
    for path in (HERE / "README.md", HERE / "LESSONS.md", HERE / "VALIDATION.md"):
        for target in re.findall(r"\[[^\]]*\]\(([^)]+)\)", path.read_text()):
            if target.startswith(("https:", "http:", "mailto:")):
                continue
            filename, _, anchor = target.partition("#")
            resolved = path.parent / unquote(filename) if filename else path
            require(resolved.exists(), f"Missing document link: {path.name}: {target}")
            if anchor and resolved.suffix == ".md":
                headings = re.findall(r"^#+\s+(.+)$", resolved.read_text(), re.M)
                slugs = [re.sub(r"[^\w\- ]", "", h.lower()).replace(" ", "-") for h in headings]
                require(unquote(anchor) in slugs, f"Missing heading: {path.name}: {target}")
            checked += 1
    return checked


def build():
    fidal = read_json(SOURCES[1])
    path = read_json(SOURCES[2])
    review = read_json(SOURCES[3])
    stories = read_json(SOURCES[9])
    story_review = read_json(SOURCES[10])
    recommendations = json.loads((HERE / "lesson-recommendations.json").read_text())
    require(recommendations["status"] == "design-proposal-not-runtime-content",
            "Recommendations must remain explicitly design-only")
    lessons = path["lessons"]
    plans = recommendations["lessons"]
    require([x["lessonId"] for x in plans] == [x["id"] for x in lessons],
            "Recommendation IDs/order differ from the actual path")
    require(len({x["id"] for x in lessons}) == len(lessons), "Duplicate lesson IDs")
    require(len(lessons) == 31 and sum(x["available"] for x in lessons) == 27,
            "Path scope changed; revise the audit before regenerating")
    require(len(path["words"]) == 31, "Word scope changed; revise the audit")
    require(path["direction"] == "ltr" and fidal["direction"] == "ltr",
            "Tigrinya must retain left-to-right direction")
    require(path["reviewStatus"] == "pending" and not review["approvedForLearnerRelease"],
            "Review state changed; re-audit the release-readiness claims")
    word_map = {x["id"]: x for x in path["words"]}
    review_ids = {x["id"] for x in review["items"] if x.get("includedInChildActivity")}
    excluded_ids = {x["id"] for x in path["excludedCandidates"]}
    require(not set(word_map).intersection(excluded_ids) and
            set(word_map).union(excluded_ids) == review_ids,
            "Path targets and documented exclusions differ from the review bank")
    reviewed_words = {x["id"]: x for x in review["items"]}
    for word in word_map.values():
        candidate = reviewed_words[word["id"]]
        require(word["word"] == candidate["scriptCandidate"] and
                word["letters"] == candidate["letters"] and
                word["concept"] == candidate["pictureLesson"]["englishConcept"] and
                word["sourceUrl"] == candidate["sourceUrl"],
                "Path target differs from its exact review source")

    form_rows = []
    for family_index, family in enumerate(fidal["families"]):
        for form_index, form in enumerate(family["forms"]):
            require(form["status"] == PENDING_FORM and
                    form["audio"]["status"] == PENDING_FORM and
                    form["handwriting"]["status"] == PENDING_FORM,
                    "A form review state changed; revise the audit before regenerating")
            pointer = f"/families/{family_index}/forms/{form_index}"
            form_rows.append({
                "character": form["character"],
                "family": family["family"],
                "familyKind": family["kind"],
                "order": form["order"],
                "unicode": form["unicode"],
                "sourceRef": f"{SOURCES[1]}#{pointer}",
                "sourceStatuses": {
                    "form": form["status"],
                    "audio": form["audio"]["status"],
                    "handwriting": form["handwriting"]["status"],
                },
                "contextSourceRefs": [
                    f"{SOURCES[1]}#{pointer}/contexts/{i}"
                    for i in range(len(form["contexts"]))
                ],
                "modeBlueprint": "F1",
            })
    require(len(fidal["families"]) == 42 and len(form_rows) == 293,
            "Fidäl scope changed; revise the audit before regenerating")
    require(len({x["character"] for x in form_rows}) == len(form_rows),
            "Duplicate source character")
    require(len(stories["stories"]) == 20 and stories["language"] == "ti",
            "Story inventory changed; revise the audit")
    require(sum(len(x["paragraphs"]) for x in stories["stories"]) == 160,
            "Story paragraph count changed; revise the audit")
    require([x["id"] for x in stories["stories"]] ==
            [x["id"] for x in story_review["stories"]], "Story review IDs differ")
    require(all(x["status"] == PENDING_STORY for x in story_review["stories"]),
            "Story review changed; revise the audit before regenerating")

    lesson_rows = []
    for index, (lesson, plan) in enumerate(zip(lessons, plans)):
        require(all(isinstance(plan.get(key), str) and plan[key].strip() for key in (
            "learningObjective", "recommendation", "teachingStep",
            "independentCheck", "correction", "review")), "Incomplete lesson recommendation")
        require(set(lesson["wordIds"]) <= word_map.keys(), "Unknown lesson word")
        require(set(lesson["introduceWordIds"]) <= set(lesson["wordIds"]),
                "New targets must belong to the lesson")
        require(all(x in {y["id"] for y in lessons[:index]} for x in lesson["prerequisites"]),
                "Forward or missing prerequisite")
        require(lesson["releaseStatus"] == PENDING_FORM,
                "Lesson review state changed; revise the audit")
        lesson_rows.append({
            "id": lesson["id"], "title": lesson["title"], "kind": lesson["kind"],
            "unit": lesson["unit"], "sourceRef": f"{SOURCES[2]}#/lessons/{index}",
            "prerequisites": lesson["prerequisites"],
            "sourceGoal": lesson["goal"], "wordIds": lesson["wordIds"],
            "introduceWordIds": lesson["introduceWordIds"],
            "softwareAvailableInPreview": lesson["available"],
            "sourceReleaseStatus": lesson["releaseStatus"],
            "blockedReason": lesson.get("blockedReason"),
            "recommendation": plan,
        })

    fingerprints = {p: hashlib.sha256((ROOT / p).read_bytes()).hexdigest() for p in SOURCES}
    fingerprints["docs/learning-path/lesson-recommendations.json"] = hashlib.sha256(
        (HERE / "lesson-recommendations.json").read_bytes()).hexdigest()
    inventory = {
        "schemaVersion": 1, "status": "design-only-not-a-runtime-manifest",
        "auditDate": "2026-11-26", "baselineCommit": recommendations["baselineCommit"],
        "releaseEffect": "none", "sourceSha256": fingerprints,
        "summary": {
            "families": len(fidal["families"]), "forms": len(form_rows),
            "formsWithContextCandidates": sum(bool(x["contextSourceRefs"]) for x in form_rows),
            "contextCandidateReferences": sum(len(x["contextSourceRefs"]) for x in form_rows),
            "pathWords": len(word_map), "pathNodes": len(lesson_rows),
            "reviewBankPictureCandidates": len(review_ids),
            "pathExcludedCandidates": len(excluded_ids),
            "previewAvailableNodes": sum(x["softwareAvailableInPreview"] for x in lesson_rows),
            "contentBlockedNodes": sum(not x["softwareAvailableInPreview"] for x in lesson_rows),
            "storyDrafts": len(stories["stories"]), "storyParagraphs": 160,
        },
        "modeBlueprints": {"F1": {
            "specification": "README.md#fidäl-learning-design-for-every-source-form",
            "modes": ["recognition", "recall", "listening", "reading", "writing", "usage"],
            "scope": "Learning cycle across visits; not six compulsory tasks in every lesson",
            "releaseGate": "Exact content/model, qualified review, rights and modality-specific evidence",
        }},
        "forms": form_rows, "lessons": lesson_rows,
        "sourceExcludedCandidates": path["excludedCandidates"],
    }
    lines = [
        "# Lesson by lesson recommendations", "",
        "Design proposal · 26 November 2026 · code baseline `adf5d79`.", "",
        "Generated from the canonical path and authored English design notes. This is not a new course manifest. "
        "Unit 1, lesson order, prerequisites, unlocks and stored progress remain unchanged. "
        "Source concept labels below are existing editorial labels, not newly certified translations. "
        "Every row remains pending qualified native review; preview availability is separate from release approval.", "",
        "All proposed checks are additive observations until explicitly implemented and validated. "
        "Current introduction unlock checks still measure recognition; the new routine already provides reading and entry practice. "
        "Use [the full design](README.md) for heritage routing, six-mode blueprints, media gates and assessment rules.", "",
    ]
    for lesson, row in zip(lessons, lesson_rows):
        plan = row["recommendation"]
        labels = lambda ids: "; ".join(
            f"`{i}` **{word_map[i]['word']}** ({word_map[i]['concept']})" for i in ids)
        prerequisite = ", ".join(f"`{x}`" for x in lesson["prerequisites"]) or "Current Unit 2 entry; no new hard gate"
        status = "Implemented visual preview; native review pending" if lesson["available"] else "Content-blocked outline; unavailable"
        lines.extend([
            f"## {lesson['id']} {lesson['title']}", "",
            f"**Current:** {status}. Kind: `{lesson['kind']}`. Prerequisite: {prerequisite}.", "",
            f"**Current goal:** {lesson['goal']}", "",
            f"**Source targets:** {labels(lesson['wordIds']) or 'No authored sentence inventory; no word targets supplied.'}", "",
            f"**New targets:** {labels(lesson['introduceWordIds']) or 'None; revisit previously introduced content or retain the content block.'}", "",
            "| Design field | Proposed behavior |", "| --- | --- |",
        ])
        for label, key in (
            ("Learning goal", "learningObjective"), ("Improvement", "recommendation"),
            ("Teach first", "teachingStep"), ("Independent observation", "independentCheck"),
            ("Correction and retry", "correction"), ("Later review", "review"),
        ):
            value = plan[key].replace("|", "\\|")
            lines.append(f"| {label} | {value} |")
        gate = lesson.get("blockedReason") or (
            "Existing spelling, meaning, image and instructions need qualified native review. "
            "Audio, stroke order, phonetic scoring and contextual sentences additionally require their own approved assets/rubrics; "
            "the proposal enables none of them.")
        lines.extend([f"| Content gate | {gate} |", ""])
    return {
        HERE / "coverage.json": json.dumps(inventory, ensure_ascii=False, indent=2) + "\n",
        HERE / "LESSONS.md": "\n".join(lines).rstrip() + "\n",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Compare only; do not write files")
    args = parser.parse_args()
    artifacts = build()
    if args.check:
        stale = [str(p.relative_to(ROOT)) for p, expected in artifacts.items()
                 if not p.exists() or p.read_text() != expected]
        require(not stale, "Stale design artifacts: " + ", ".join(stale))
        checked = check_document_links()
        print("Design inventory verified: 293 forms, 42 groups, 31 nodes, 31 word candidates, 20 story drafts; no runtime writes.")
        print(f"Verified {checked} local design-document links.")
    else:
        for path, content in artifacts.items():
            path.write_text(content)
        print("Generated docs/learning-path/coverage.json and LESSONS.md only.")


if __name__ == "__main__":
    main()
