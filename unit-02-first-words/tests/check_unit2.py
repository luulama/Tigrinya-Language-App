import hashlib
import json
import re
import sys
import unicodedata
from html.parser import HTMLParser
from pathlib import Path

root = Path(__file__).resolve().parent.parent
sys.path.insert(0,str(root / "scripts"))
from extract_unit2 import fidel_letters


source_path = root / "tests/fixtures/kaikki-tigrinya.jsonl"
records = [json.loads(line) for line in source_path.read_text(encoding="utf-8").splitlines()]
data = json.loads((root / "unit-2-content-review.json").read_text(encoding="utf-8"))
html = (root / "index.html").read_text(encoding="utf-8")
items = data["items"]
expected_words = {
    entry["word"] for entry in records
    if len(entry["word"]) == 2
    and all(unicodedata.name(letter, "").startswith("ETHIOPIC SYLLABLE ") for letter in entry["word"])
}
assert len(records) == 942
assert len({entry["word"] for entry in records}) == 917
assert len(expected_words) == 142
assert len(items) == len({item["scriptCandidate"] for item in items}) == 142
assert {item["scriptCandidate"] for item in items} == expected_words
assert data["source"]["sha256"] == hashlib.sha256(source_path.read_bytes()).hexdigest()
assert data["source"]["matchedRecordCount"] == sum(entry["word"] in expected_words for entry in records) == 148
assert len(fidel_letters("ማይ")) == 2
assert len(fidel_letters("ቤት")) == 2
assert len(fidel_letters("በጊዕ")) == 3
assert len(fidel_letters("ኩዕሶ")) == 3
assert len(fidel_letters("ስሳ፟")) == 2
assert fidel_letters("ቤ ት") == []
assert fidel_letters("-ቤት") == []
assert fidel_letters("123") == []
assert fidel_letters("፟ማይ") == []
assert not data["approvedForLearnerRelease"]
for item in items:
    assert item["letters"] == fidel_letters(item["scriptCandidate"])
    assert len(item["letters"]) == item["letterCount"] == 2
    assert item["reviewer"] is None and item["approvedAt"] is None
    assert item["audio"]["src"] is None and item["audio"]["usageRights"] is None
    assert all(item[field] == "awaiting-qualified-native-tigrinya-review" for field in ["status", "imageAssociationStatus"])
    assert item["audio"]["status"] == "awaiting-qualified-native-tigrinya-review"
    raw = [entry for entry in records if entry["word"] == item["scriptCandidate"]]
    source_romanizations = {form["form"] for entry in raw for form in entry.get("forms", []) if "romanization" in form.get("tags", [])}
    assert set(item["transliterationCandidates"]) == source_romanizations
    assert len(item["senses"]) == sum(len(entry.get("senses", [])) for entry in raw)
picture_items = [item for item in items if item["includedInChildActivity"]]
assert len(picture_items) == data["pictureLessonCandidateCount"] == 32
assert {item["pictureLesson"]["group"] for item in picture_items} == {world["id"] for world in data["worlds"]}
assert "በጊዕ" not in expected_words
assert all(f'id="art-{item["pictureLesson"]["art"]}"' in html for item in picture_items)
embedded = re.search(r'<script id="unit2Content" type="application/json">(.*?)</script>', html, re.S)
assert json.loads(embedded.group(1)) == data
app_script = re.search(r'  <script>\n(.*?)  </script>', html, re.S).group(1)
unindented = "\n".join(line[4:] if line.startswith("    ") else line for line in app_script.splitlines()).strip()
assert unindented == (root / "src/unit2-child-app.js").read_text(encoding="utf-8").strip()
assert not any(api in app_script for api in ["fetch(", "localStorage", "speechSynthesis", "getUserMedia"])
assert "escapeText" in app_script
assert 'id="parentDialog"' in html
assert 'id="gameScreen"' in html
assert 'id="pairsScreen"' in html
assert 'id="pairGrid"' in html
assert (root / "src/unit2-pairs.css").read_text(encoding="utf-8") in html
assert (root / "src/unit2-literacy.css").read_text(encoding="utf-8") in html
assert (root / "src/unit2-pairs-screen.html").read_text(encoding="utf-8") in html
assert 'id="art-guide"' in html
assert 'id="reviewNotice"' in html and "Native review pending" in html
assert "word.letters[state.placed.length]" in app_script
assert "state.session.forEach(word => state.saved.add(word.id))" in app_script
assert not any(prompt in app_script for prompt in ["with a grown-up", "Take a moment to look together", "spelling display", "Show dictionary sound guide"])
HTMLParser().feed(html)
bank = (root / "unit-2-two-letter-words.md").read_text(encoding="utf-8")
assert sum(line.startswith("| [") for line in bank.splitlines()) == 142
print("PASS: all 142 source matches included exactly once; 148 entry records and all senses preserved")
print("PASS: grapheme counting, combining marks, no truncation or manufactured matches")
print("PASS: 32 two-letter picture candidates with artwork; every approval and audio field remains pending")
print("PASS: sourced transliterations, source checksum, inline data parity, script parity, complete downloadable word bank")
