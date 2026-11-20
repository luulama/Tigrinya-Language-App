"""Copy the checked legacy preview without modifying its sources or learner data."""
from pathlib import Path
import shutil
import subprocess
import sys
root=Path(__file__).resolve().parents[1]
subprocess.run([sys.executable,str(root/'scripts/build_site.py')],cwd=root,check=True)
for path in (root/'dist').rglob('*'):
    if path.is_file():
        target=root/'apps/web/public/preview'/path.relative_to(root/'dist')
        target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(path,target)
print('Prepared standalone practice preview for the web app.')
