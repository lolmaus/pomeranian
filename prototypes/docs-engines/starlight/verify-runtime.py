from pathlib import Path
from urllib.request import urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlsplit
from html.parser import HTMLParser
import subprocess, time, json, os, shutil, sys
root=Path(__file__).resolve().parent
app=root/'apps/docs'
node=os.environ.get('NODE_BINARY', shutil.which('node'))
cli=app/'node_modules/astro/bin/astro.mjs'
results=[]
def record(name, ok, details=''):
 results.append(dict(name=name,passed=ok,details=details));print(json.dumps(results[-1]),flush=True)
def get(url):
 try:
  with urlopen(url, timeout=4) as r:return r.status,r.read().decode()
 except HTTPError as e:return e.code,e.read().decode()
def wait(url, needle=None, absent=False):
 for i in range(100):
  try:
   status,body=get(url)
   if absent and needle not in body:return status,body
   if not absent and status==200 and (needle is None or needle in body):return status,body
  except (URLError, TimeoutError,ConnectionResetError):pass
  time.sleep(.2)
 raise AssertionError(f'No expected response: {url} {needle} absent={absent}')
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.images=[];self.current=None
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='a': self.current=[a.get('href',''),''];self.links.append(self.current)
  if tag=='img':self.images.append(a)
 def handle_data(self,data):
  if self.current is not None:self.current[1]+=data
 def handle_endtag(self,tag):
  if tag=='a':self.current=None
out=app/'dist'
built_start=(out/'guide/start/index.html').read_text()
record('production explicit guide sidebar',all(any(('href="'+variant+'"') in built_start for variant in [route,route+'/']) for route in ['/guide/start','/guide/nested/next']))
record('research exclusion',not any(b'EXCLUDED_RESEARCH_SENTINEL_20260922' in x.read_bytes() for x in out.rglob('*') if x.is_file()))
pagepath=root/'docs/site/guide/start.md';original=pagepath.read_text();added=root/'docs/site/guide/added.md'
modes=[('preview',43279)] if '--preview-only' in sys.argv else [('preview',43279),('dev',43280)]
for mode,port in modes:
 if mode=='dev':
  for cache in [app/'.astro',app/'node_modules/.vite',app/'node_modules/.astro']:
   shutil.rmtree(cache,ignore_errors=True)
 with (root/f'{mode}.log').open('w') as log:
  proc=subprocess.Popen([node,str(cli),mode,'--host','127.0.0.1','--port',str(port),'--ignore-lock'],cwd=app,stdout=log,stderr=subprocess.STDOUT,env={**os.environ,'ASTRO_TELEMETRY_DISABLED':'1'})
  try:
   base=f'http://127.0.0.1:{port}'
   wait(base+'/','Fixture home')
   for route,marker in [('/','Fixture home'),('/guide/start/','EXTERNAL_CONTENT_INITIAL_20260922'),('/guide/nested/next/','Nested next')]:
    status,body=wait(base+route,marker);record(mode+' page '+route,status==200)
    parsed=Links();parsed.feed(body)
    for href,label in parsed.links:
     if href.rstrip('/') in ['/guide/start', '/guide/nested/next']:
      status,destination=get(urljoin(base+route,href))
      marker='EXTERNAL_CONTENT_INITIAL_20260922' if href.rstrip('/')=='/guide/start' else 'Nested next'
      record(mode+' generated navigation '+href,status==200 and marker in destination,{'href':href,'status':status})
     if label.strip() not in ['Start','Home','Next','Back']:continue
     target=urljoin(base+route,href);status,destination=get(target)
     fragment=urlsplit(target).fragment
     marker={'Start':'EXTERNAL_CONTENT_INITIAL_20260922','Home':'Fixture home','Next':'Nested next','Back':'EXTERNAL_CONTENT_INITIAL_20260922'}[label.strip()]
     ok=status==200 and marker in destination and (not fragment or ('id="'+fragment+'"') in destination)
     record(mode+' authored link '+label.strip(),ok,{'href':href,'url':target,'status':status,'fragment':fragment})
    if route=='/guide/start/':
     for img in parsed.images:
      if img.get('alt')=='Fixture icon':
       url=urljoin(base+route,img['src']);status,image=get(url);record(mode+' image',status==200 and '<svg' in image,{'src':img['src'],'status':status})
     edits=[href for href,label in parsed.links if 'github.com/example/fixture' in href]
     record(mode+' edit link',len(edits)==1 and '/edit/main/docs/site/guide/start.md' in edits[0],edits)
     record(mode+' lastUpdated observation (not a proof)',None,{'timeElement':'<time' in body,'gitHistoryPresent':False})
   if mode=='dev':
    pagepath.write_text(original.replace('EXTERNAL_CONTENT_INITIAL_20260922','EXTERNAL_CONTENT_EDITED_20260922'))
    wait(base+'/guide/start/','EXTERNAL_CONTENT_EDITED_20260922');record('dev edit without restart',True)
    added.write_text('---\ntitle: Added page\n---\n\nNEW_EXTERNAL_PAGE_20260922\n')
    wait(base+'/guide/added/','NEW_EXTERNAL_PAGE_20260922');record('dev add without restart',True)
    added.unlink();status,body=wait(base+'/guide/added/','NEW_EXTERNAL_PAGE_20260922',True);record('dev delete without restart',True,{'status':status,'staleContentAbsent':True})
  finally:
   pagepath.write_text(original)
   if added.exists():added.unlink()
   proc.terminate()
   try:proc.wait(timeout=5)
   except subprocess.TimeoutExpired:proc.kill();proc.wait()
   print(mode+' server stopped',flush=True)
(root/('runtime-results-preview.json' if '--preview-only' in sys.argv else 'runtime-results.json')).write_text(json.dumps(results,indent=2))
print('Observed failures are recorded rather than suppressed. No browser hydration/HMR check.',flush=True)
