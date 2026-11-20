"""Build and run offline checks from any directory. Requires Python 3 and Node."""
import argparse
from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--node', default='node', help='Node executable or absolute path')
args = parser.parse_args()
commands = [
    [sys.executable, 'scripts/build_fidal.py'],
    [sys.executable, 'unit-02-first-words/scripts/build_unit2.py'],
    [sys.executable, 'scripts/build_games.py'],
    [sys.executable, 'unit-02-first-words/tests/check_unit2.py'],
    [sys.executable, 'tests/check_project.py'],
    [sys.executable, 'scripts/check_product_spec.py'],
    [args.node, 'tests/check_product_scheduler.cjs'],
    [args.node, '--check', 'unit-02-first-words/src/unit2-child-app.js'],
    [args.node, '--check', 'shared/unit-journey.js'],
    [args.node, '--check', 'shared/fidal-text.js'],
    [args.node, '--check', 'shared/fidal-writing.js'],
    [args.node, '--check', 'shared/game-garden-core.js'],
    [args.node, '--check', 'shared/game-garden.js'],
    [args.node, 'tests/check_game_garden.cjs'],
    [args.node, 'unit-01-fidel-foundations/check_unit1.cjs'],
    [args.node, 'unit-02-first-words/tests/check_unit2_pairs.cjs'],
    [args.node, 'unit-02-first-words/tests/check_unit2_literacy.cjs'],
    [args.node, 'unit-02-first-words/tests/check_unit2_practice.cjs'],
    [args.node, 'tests/check_journey.cjs'],
    [args.node, 'tests/check_learning_path.cjs'],
    [args.node, 'tests/check_fidal.cjs'],
]
for command in commands:
    print('Running: ' + ' '.join(command), flush=True)
    subprocess.run(command, cwd=root, check=True)
print('PASS: builds, source/content/HTML checks, JavaScript syntax and behavior checks')
