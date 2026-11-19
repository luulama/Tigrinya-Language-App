from pathlib import Path


root = Path(__file__).resolve().parent.parent
output_path = root / "index.html"
sprite = (root / "src/unit2-sprite.svg").read_text(encoding="utf-8").rstrip()
shell = (root / "src/unit2-child-shell.html").read_text(encoding="utf-8")
styles = (root / "src/unit2-pairs.css").read_text(encoding="utf-8")
pairs_screen = (root / "src/unit2-pairs-screen.html").read_text(encoding="utf-8")
shell = shell.replace("    @media(prefers-reduced-motion:reduce)", styles + "\n    @media(prefers-reduced-motion:reduce)")
shell = shell.replace('      <section class="view" id="finishScreen"', pairs_screen + '      <section class="view" id="finishScreen"')
shell = shell.replace(
    "Play offers three pictures at a time. A chosen picture can also be played on its own.",
    "Play offers three pictures at a time, followed by a six-card picture-pair game using those same pictures and draft words. A chosen picture can also be played on its own.",
)
shell = shell.replace(
    "Only explicit Keep saves pictures in this tab; this does not record mastery or approval.",
    "The pair game has no timer or penalties. Two different pictures stay visible until the next tap; the lion can point to a matching card. Only explicit Keep saves pictures in this tab; matching pictures does not assess reading, pronunciation, mastery or approval.",
)
page = shell.replace("__SVG_SPRITE__", sprite)
page = page.replace("__CONTENT_JSON__", (root / "unit-2-content-review.json").read_text(encoding="utf-8"))
script = (root / "src/unit2-child-app.js").read_text(encoding="utf-8")
page = page.replace("__APP_SCRIPT__", "\n".join("    " + line if line else "" for line in script.splitlines()))
output_path.write_text(page,encoding="utf-8")
print(f"Built {output_path.name}")
