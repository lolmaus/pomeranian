from pathlib import Path
from urllib.request import urlopen
from urllib.error import HTTPError, URLError
import subprocess, time, re, json, os
root = Path(__file__).resolve().parent
app = root / 'apps/docs'
node = os.environ.get('DOCS_VERIFY_NODE', 'node')
cli = app / 'node_modules/vitepress/bin/vitepress.js'
out = app / '.vitepress/dist'
assert (out / 'index.html').is_file()
assert (out / 'guide/start.html').is_file()
assert (out / 'guide/nested/next.html').is_file()
for path in out.rglob('*'):
    if path.is_file():
        assert b'EXCLUDED_RESEARCH_SENTINEL_20260922' not in path.read_bytes(), path
assert not (out / 'research').exists()
print('PASS build outputs and research exclusion', flush=True)
def get(url):
    with urlopen(url, timeout=2) as response:
        return response.status, response.read().decode()
def wait_get(url, contains=None, missing=False):
    for attempt in range(60):
        try:
            status, body = get(url)
            if missing and 'NEW_EXTERNAL_PAGE_20260922' not in body:
                print(f'Deleted module response: HTTP {status}; stale page marker absent; HTML fallback={"<!DOCTYPE html>" in body}', flush=True)
                return body
            if not missing and (contains is None or contains in body):
                return body
        except HTTPError as error:
            if missing and error.code == 404:
                return ''
        except (URLError, TimeoutError):
            pass
        time.sleep(0.2)
    raise AssertionError(f'Unavailable expected response {url}: {contains}, missing={missing}')
for mode, port in [('preview', 43179), ('dev', 43180)]:
    with (root / f'{mode}.log').open('w') as log:
        proc = subprocess.Popen([node, str(cli), mode, '--host', '127.0.0.1', '--port', str(port), '--strictPort'], cwd=app, stdout=log, stderr=subprocess.STDOUT)
        try:
            base=f'http://127.0.0.1:{port}'
            home=wait_get(base + '/')
            if mode == 'preview':
                assert 'Fixture home' in home
                page=wait_get(base + '/guide/start.html', 'EXTERNAL_CONTENT_INITIAL_20260922')
                assert 'href="./nested/next.html"' in page
                assert 'data:image/svg+xml' in page or re.search(r'<img[^>]+src="[^"]+\.svg', page)
                nested=wait_get(base + '/guide/nested/next.html', 'Nested next')
                assert 'href="./../start.html#guide-start"' in nested
                assert 'const' in nested and 'example' in nested
                print('PASS preview HTTP home/nested pages, rewritten .md links, rendered image, code fence', flush=True)
            else:
                module_url=base + '/guide/start.md?import'
                wait_get(module_url, 'EXTERNAL_CONTENT_INITIAL_20260922')
                page_path=root / 'docs/site/guide/start.md'
                original=page_path.read_text()
                page_path.write_text(original.replace('EXTERNAL_CONTENT_INITIAL_20260922','EXTERNAL_CONTENT_EDITED_20260922'))
                wait_get(module_url, 'EXTERNAL_CONTENT_EDITED_20260922')
                print('PASS dev serves edited external Markdown without restart', flush=True)
                added=root / 'docs/site/guide/added.md'
                added.write_text('# Added page\n\nNEW_EXTERNAL_PAGE_20260922\n')
                wait_get(base + '/guide/added.md?import','NEW_EXTERNAL_PAGE_20260922')
                print('PASS dev serves newly added external Markdown without restart', flush=True)
                added.unlink()
                wait_get(base + '/guide/added.md?import',missing=True)
                print('PASS dev deleted external Markdown no longer returns its former module content', flush=True)
                status, icon=get(base + '/guide/icon.svg')
                assert '<svg' in icon
                page_path.write_text(original)
                wait_get(module_url,'EXTERNAL_CONTENT_INITIAL_20260922')
                print('PASS dev relative SVG HTTP and original source restored', flush=True)
        finally:
            proc.terminate()
            try: proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill(); proc.wait()
            print(f'{mode} process stopped', flush=True)
print('ALL HTTP/OUTPUT CHECKS PASSED; browser HMR not exercised', flush=True)
