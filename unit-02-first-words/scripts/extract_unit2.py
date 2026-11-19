import hashlib
import json
import unicodedata
from collections import defaultdict
from pathlib import Path
from urllib.parse import quote


SOURCE_PATH = Path(__file__).resolve().parent.parent / "tests/fixtures/kaikki-tigrinya.jsonl"
STATUS = "awaiting-qualified-native-tigrinya-review"
WORLD_GROUPS = [
    {"id": "home", "name": "At home", "number": "01", "art": "house", "concept": "House", "description": "Places and things you know.", "background": "#f7edce", "ink": "#8a6631"},
    {"id": "food", "name": "Food & drink", "number": "02", "art": "banana", "concept": "Banana", "description": "Little words at the table.", "background": "#e0eff3", "ink": "#3c7081"},
    {"id": "nature", "name": "Animals & nature", "number": "03", "art": "cat", "concept": "Cat", "description": "Things to spot in your world.", "background": "#e6edda", "ink": "#506c3c"},
    {"id": "people", "name": "People & me", "number": "04", "art": "hand", "concept": "Hand", "description": "Family, faces, and little fingers.", "background": "#f0e4ef", "ink": "#875c82"},
]
PICTURE_CANDIDATES = [
    ("ቤት", "home", "House", "house", "A roof and a door. What can you notice about this house?", "With a grown-up, point to a house in a book or through a window."),
    ("ገዛ", "home", "House", "house", "Notice the roof, windows, and door. What can you point to?", "Find a house in a picture book together. This dictionary has more than one two-letter house word; a native reviewer will explain their usage."),
    ("ጫማ", "home", "Shoe", "shoe", "Look at the shoe. Can you point to its sole?", "With a grown-up, point to a shoe. Notice its shape."),
    ("ሱሪ", "home", "Trousers", "trousers", "Notice the two trouser legs. Can you trace their shape in the air?", "Point to a pair of trousers or a picture of some with a grown-up."),
    ("ምሔ", "home", "Rug", "rug", "Look at the rug and its pattern. What colours can you see?", "With a grown-up, find a rug in a room or in a picture book."),
    ("ዳሉ", "home", "Pail", "pail", "Notice the handle on this pail. Can you point to it?", "Find a picture of a pail together. Notice how its handle curves."),
    ("ጌጽ", "home", "Gift", "gift", "Look at the ribbon around this gift. Can you follow its shape?", "Draw a little gift together, or make a pretend one with paper."),
    ("ማይ", "food", "Water", "water", "Look at the clear glass. Can you point to the water inside?", "With a grown-up, notice how light shines through a glass of drinking water."),
    ("ሙዝ", "food", "Banana", "banana", "Look at the curved banana. Can you trace a curve in the air?", "Find a banana in a book or at home with a grown-up."),
    ("ባኒ", "food", "Bread", "bread", "Notice the loaf of bread. What shapes can you spot?", "With a grown-up, find bread or a picture of bread. Notice its shape."),
    ("ጸባ", "food", "Milk", "milk", "Notice the milk inside the glass. What colour is it?", "With a grown-up, point to milk or a picture of a glass of milk."),
    ("ሩዝ", "food", "Rice", "rice", "Look closely at the rice in the bowl. Can you spot the little grains?", "Find rice in a picture or look at some together with a grown-up."),
    ("ጨው", "food", "Salt", "salt", "Notice the little grains beside the salt shaker.", "Point to salt in a picture or at the table with a grown-up."),
    ("ዱባ", "food", "Pumpkin", "pumpkin", "Look at the pumpkin and its curved stripes. What else do you notice?", "Find a pumpkin in a book or draw a round pumpkin together."),
    ("ዶማ", "food", "Coconut", "coconut", "Notice the brown outside and the white inside of this coconut.", "Find a coconut in a book together. Point to its outside and inside."),
    ("ፍረ", "food", "Fruit", "fruit", "Look at the fruit together. What colours can you notice?", "With a grown-up, point to fruit in a book or at home."),
    ("ድሙ", "nature", "Cat", "cat", "A little cat with ears and whiskers. What can you point to?", "Find a cat in a picture book together. Can you spot its whiskers?"),
    ("ዓሳ", "nature", "Fish", "fish", "Notice the fish and its tail. Can you make a swimming motion?", "Find a fish in a book together, or draw a fish with a tail."),
    ("ዑፍ", "nature", "Bird", "bird", "Notice the bird's beak and wing. Can you point to them?", "With a grown-up, spot a bird through a window or in a book."),
    ("ኦም", "nature", "Tree", "tree", "A trunk, branches, and leaves. What can you notice about this tree?", "With a grown-up, point to a tree through a window or in a book."),
    ("ላም", "nature", "Cow", "cow", "Look at the cow and its patches. Can you spot its ears?", "Find a cow in a picture book together. Point to its tail."),
    ("ጤል", "nature", "Goat", "goat", "Notice the goat's horns and little beard.", "Find a goat in a picture book with a grown-up. What do you notice?"),
    ("ድቢ", "nature", "Bear", "bear", "Round ears and a little nose. What do you notice about this bear?", "Find a bear in a book or a toy bear with a grown-up."),
    ("ጻጸ", "nature", "Ant", "ant", "Look at the ant's little legs. Can you point to them?", "Find an ant in a picture book together. Notice its little body parts."),
    ("ሑጻ", "nature", "Sand", "sand", "Notice the soft curves in this little mound of sand.", "Draw a little mound of sand together, or find one in a picture."),
    ("ሩባ", "nature", "Stream", "stream", "Notice the water winding between the green banks.", "Find a stream in a picture book with a grown-up. Trace its path with your finger."),
    ("ኣቦ", "people", "Father", "father", "This is one picture of a father. Families can look different.", "Look at a family picture or a picture book with a grown-up. Talk about the people you know."),
    ("ኣደ", "people", "Mother", "mother", "This is one picture of a mother. Families can look different.", "With a grown-up, look at a family picture or a book and talk about the people in it."),
    ("ኢድ", "people", "Hand / arm", "hand", "Look at the hand and arm. Can you wiggle your fingers?", "With a grown-up, wave your hand or make a hand shape in the air."),
    ("ስኒ", "people", "Tooth", "tooth", "Notice the tooth's shape. What do you see at the top?", "With a grown-up, look at a tooth in a picture book, or show a smile."),
    ("ገጽ", "people", "Face", "face", "Look at the face. Can you point to its nose?", "With a grown-up, look in a mirror or at a picture of a face."),
    ("ልቢ", "people", "Heart", "heart", "This heart is a picture symbol. Can you trace its shape in the air?", "Draw a heart shape with a grown-up. A native reviewer will check this picture association."),
]


def fidel_letters(word):
    normalized = unicodedata.normalize("NFC", word)
    letters = []
    for character in normalized:
        name = unicodedata.name(character, "")
        if name.startswith("ETHIOPIC SYLLABLE "):
            letters.append(character)
        elif name.startswith("ETHIOPIC COMBINING ") and letters:
            letters[-1] += character
        else:
            return []
    return letters


def unique(values):
    return list(dict.fromkeys(values))


def main():
    source_bytes = SOURCE_PATH.read_bytes()
    records = [json.loads(line) for line in source_bytes.decode("utf-8").splitlines() if line]
    assert records and all(entry["lang_code"] == "ti" for entry in records)
    grouped = defaultdict(list)
    for entry in records:
        if len(fidel_letters(entry["word"])) == 2:
            grouped[unicodedata.normalize("NFC", entry["word"])].append(entry)
    assert len(grouped) == 142
    pictures = {candidate[0]: candidate[1:] for candidate in PICTURE_CANDIDATES}
    assert len(pictures) == 32 and set(pictures).issubset(grouped)
    items = []
    for word, entries in sorted(grouped.items()):
        senses = []
        for entry in entries:
            for sense in entry.get("senses", []):
                senses.append({"partOfSpeech": entry["pos"], "glossCandidates": sense.get("glosses", []), "tags": sense.get("tags", []), "sourceSenseId": sense.get("id"), "alternativeOf": sense.get("alt_of", [])})
        romanizations = unique(form["form"] for entry in entries for form in entry.get("forms", []) if "romanization" in form.get("tags", []))
        canonical = unique(form["form"] for entry in entries for form in entry.get("forms", []) if "canonical" in form.get("tags", []))
        item = {
            "id": "u2-" + "-".join(format(ord(letter), "x") for letter in word),
            "scriptCandidate": word,
            "letters": fidel_letters(word),
            "letterCount": 2,
            "transliterationCandidates": romanizations,
            "canonicalSpellingsInSource": canonical,
            "englishMeaningCandidates": unique(gloss for sense in senses for gloss in sense["glossCandidates"]),
            "senses": senses,
            "sourceUrl": "https://en.wiktionary.org/wiki/" + quote(word, safe="") + "#Tigrinya",
            "sourceHistoryUrl": "https://en.wiktionary.org/w/index.php?title=" + quote(word, safe="") + "&action=history",
            "status": STATUS,
            "imageAssociationStatus": STATUS,
            "audio": {"status": STATUS, "src": None, "usageRights": None},
            "reviewer": None,
            "approvedAt": None,
            "includedInChildActivity": word in pictures,
            "childSuitabilityStatus": "picture-lesson-candidate-awaiting-native-and-age-review" if word in pictures else "grownup-review-bank-only",
        }
        if word in pictures:
            group, concept, artwork, notice, offline = pictures[word]
            item["pictureLesson"] = {"group": group, "englishConcept": concept, "art": artwork, "notice": notice, "offline": offline}
        items.append(item)
    data = {
        "unit": 2,
        "title": "Two-letter Words",
        "releaseStatus": STATUS,
        "approvedForLearnerRelease": False,
        "countingRule": "Exactly two Ethiopic syllable-letter graphemes in the NFC-normalized dictionary headword. Attached Ethiopic combining marks do not add a letter. Spaces, punctuation, affix markers, Latin text and numbers are not stripped to manufacture matches. No words are shortened.",
        "scope": "All matching headwords in the downloaded Tigrinya dictionary snapshot, not an exhaustive inventory of the Tigrinya language. Inflected forms embedded inside entries are not added as separate headwords. Alternative headwords are retained; senses with the same spelling are grouped, not discarded.",
        "source": {
            "name": "Kaikki.org Tigrinya dictionary, extracted from English Wiktionary",
            "indexUrl": "https://kaikki.org/dictionary/Tigrinya/index.html",
            "downloadUrl": "https://kaikki.org/dictionary/Tigrinya/kaikki.org-dictionary-Tigrinya.jsonl",
            "retrievedOn": "2026-11-17",
            "wiktionaryDumpDate": "2026-10-01",
            "extractedOn": "2026-10-30",
            "sha256": hashlib.sha256(source_bytes).hexdigest(),
            "recordCount": len(records),
            "distinctHeadwordCount": len(set(entry["word"] for entry in records)),
            "matchedRecordCount": sum(len(entries) for entries in grouped.values()),
            "distinctTwoLetterHeadwordCount": len(items),
            "attribution": "English Wiktionary contributors; data extraction by Kaikki.org / Wiktextract. Headwords, dictionary glosses and romanizations adapted by filtering and grouping; no native approval or endorsement is implied.",
            "contentLicense": "CC BY-SA 4.0 (dictionary-derived content)",
            "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
            "copyrightPolicyUrl": "https://en.wiktionary.org/wiki/Wiktionary:Copyrights",
        },
        "requiredReview": ["word-selection-and-two-letter-count", "script-and-canonical-spelling", "meaning-and-child-appropriate-usage", "transliteration-and-regional-variation", "image-association", "activity-prompts", "native-audio-and-usage-rights"],
        "pictureLessonCandidateCount": len(pictures),
        "worlds": WORLD_GROUPS,
        "items": items,
        "previousConceptsExcluded": [
            {"scriptCandidate": "በጊዕ", "englishConcept": "sheep", "reason": "Three Ethiopic letters, so outside Unit 2's two-letter criterion.", "status": STATUS},
            {"scriptCandidate": None, "englishConcept": "ball", "reason": "No sourced two-letter dictionary headword was selected. No translation was invented or shortened.", "status": STATUS},
        ],
    }
    rows = []
    for item in items:
        meaning = "; ".join(" / ".join(sense["glossCandidates"]) + (" [" + ", ".join(sense["tags"]) + "]" if sense["tags"] else "") for sense in item["senses"]).replace("|", " / ").replace("\n", " ")
        roman = " / ".join(item["transliterationCandidates"]) or "Not supplied"
        placement = "Picture lesson candidate" if item["includedInChildActivity"] else "Grown-up review bank"
        rows.append(f"| [{item['scriptCandidate']}]({item['sourceUrl']}) | {' + '.join(item['letters'])} | {roman} | {meaning} | {placement} |")
    markdown = "\n".join([
        "# Unit 2: Two-letter word bank",
        "",
        "**Every word, transliteration, meaning, picture association and future audio is awaiting qualified native Tigrinya review. Nothing in this list is approved for learner release.**",
        "",
        "All 142 distinct two-letter headwords found by scanning all 942 Tigrinya records (917 distinct headwords) in the [Kaikki.org Tigrinya dictionary](https://kaikki.org/dictionary/Tigrinya/index.html). This covers this dictionary snapshot, not every word in Tigrinya. Multiple senses and alternative spellings are preserved in the JSON review brief.",
        "",
        "Counting: exactly two Ethiopic syllable-letter graphemes in each normalized headword; attached combining marks do not add letters. No clipping, removal of spaces, or removal of affix markers. Embedded inflections are not additional dictionary headwords. For example, the previous sheep candidate has three letters and is excluded.",
        "",
        "The 32 picture lesson candidates are a provisional teaching subset, not an approval decision. The remaining 110 headwords are retained in Unit 2's grown-up review bank, including abstract, context-dependent and more mature concepts.",
        "",
        "| Draft headword and source | Two letters | Dictionary transliteration candidate | Dictionary meaning candidates | Placement |",
        "| --- | --- | --- | --- | --- |",
        *rows,
        "",
        "## Source and attribution",
        "",
        "English Wiktionary contributors, via Kaikki.org / Wiktextract. [Downloaded dictionary](https://kaikki.org/dictionary/Tigrinya/kaikki.org-dictionary-Tigrinya.jsonl), retrieved 17 November 2026. The source index reports extraction on 30 October 2026 from the 1 October 2026 English Wiktionary dump. Each linked headword identifies its contributors through its page history.",
        "",
        "Dictionary-derived text is provided under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: selected two-letter headwords, grouped same-spelling senses, retained source romanizations and added review metadata and provisional picture lesson placement. No source images, quotations or recordings are copied. Source file SHA-256: `" + data["source"]["sha256"] + "`.",
        "",
    ])
    print(json.dumps({"data": data, "markdown": markdown.rstrip() + "\n"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
