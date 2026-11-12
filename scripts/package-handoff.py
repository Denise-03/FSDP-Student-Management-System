"""Create and verify a source-only archive. Never include runtime secrets or uploads."""
from pathlib import Path
import hashlib,json,re,zipfile
root=Path(__file__).resolve().parent.parent
archive=root.parent/'FSDP-Student-Management-System.zip'
excluded={'node_modules','.git','uploads','dist','test-results','playwright-report',
          '__pycache__','.cache','.vite','coverage','.vs','.idea'}
def allowed(path):
 relative=path.relative_to(root)
 if any(part in excluded for part in relative.parts):return False
 name=path.name.lower()
 if name.startswith('.env') and name!='.env.example':return False
 if name.endswith(('.zip','.log','.bak','.mdf','.ldf','.pyc','.pem','.key')):return False
 if name in {'thumbs.db','desktop.ini'}:return False
 return True
files=sorted(p for p in root.rglob('*') if p.is_file() and allowed(p))
for path in files:
 if path.suffix in {'.js','.jsx','.json','.md','.sql','.txt','.example'}:
  data=path.read_text(encoding='utf-8',errors='replace')
  if re.search(r'\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|\bwhsec_[A-Za-z0-9]{16,}',data):
   raise RuntimeError(f'Potential provider secret in {path.relative_to(root)}')
manifest={str(p.relative_to(root)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as output:
 for path in files:output.write(path,root.name+'/'+path.relative_to(root).as_posix())
 output.writestr(root.name+'/HANDOFF_MANIFEST.json',json.dumps(manifest,indent=2))
with zipfile.ZipFile(archive) as output:
 assert output.testzip() is None
 names=output.namelist()
 assert all(name.startswith(root.name+'/') and '..' not in Path(name).parts for name in names)
 assert not any(any(part in excluded for part in Path(name).parts) for name in names)
 assert not any(Path(name).name.startswith('.env') and Path(name).name!='.env.example' for name in names)
 for relative,digest in manifest.items():
  assert hashlib.sha256(output.read(root.name+'/'+relative)).hexdigest()==digest
 for required in ['README.md','AGENTS.md','package-lock.json','backend/src/app.js',
   'frontend/src/app/App.jsx','database/scripts/seed.js','docs/TEST_RESULTS.md']:
  assert root.name+'/'+required in names
print(f'Verified ZIP: {archive} ({archive.stat().st_size:,} bytes; {len(files)} files plus manifest)')
