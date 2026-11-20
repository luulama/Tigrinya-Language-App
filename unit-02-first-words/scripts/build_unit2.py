from pathlib import Path


root = Path(__file__).resolve().parent.parent
output_path = root / "index.html"
sprite = (root / "src/unit2-sprite.svg").read_text(encoding="utf-8").rstrip()
shell = (root / "src/unit2-child-shell.html").read_text(encoding="utf-8")
styles = "\n".join((root / name).read_text(encoding="utf-8") for name in ["../shared/learning-path.css", "../shared/unit-journey.css", "src/unit2-pairs.css", "src/unit2-literacy.css", "src/unit2-experience.css", "../shared/fidal-writing.css"])
pairs_screen = (root / "src/unit2-pairs-screen.html").read_text(encoding="utf-8")
shell = shell.replace("</style>", styles + "\n</style>", 1)
shell = shell.replace('      <section class="view" id="finishScreen"', pairs_screen + '      <section class="view" id="finishScreen"')
page = shell.replace("__SVG_SPRITE__", sprite)
page = page.replace("__LEARNING_PATH__", (root.parent / "shared/learning-path.js").read_text(encoding="utf-8"))
page = page.replace("__UNIT_JOURNEY__", (root.parent / "shared/unit-journey.js").read_text(encoding="utf-8"))
page = page.replace("__FIDAL_TEXT__", (root.parent / "shared/fidal-text.js").read_text(encoding="utf-8"))
page = page.replace("__CONTENT_JSON__", (root / "unit-2-content-review.json").read_text(encoding="utf-8"))
script = (root / "src/unit2-child-app.js").read_text(encoding="utf-8")
page = page.replace("__APP_SCRIPT__", "\n".join("    " + line if line else "" for line in script.splitlines()))
output_path.write_text(page,encoding="utf-8")
print(f"Built {output_path.name}")
