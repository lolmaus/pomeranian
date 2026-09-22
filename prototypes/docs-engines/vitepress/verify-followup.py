from pathlib import Path
from urllib.request import urlopen
from urllib.parse import urljoin, urlparse
from urllib.error import URLError
from html.parser import HTMLParser
import os, subprocess, time, json, shutil

root = Path(__file__).resolve().parent
app = root / 'apps/docs'
node = os.environ.get('DOCS_VERIFY_NODE', 'node')
cli = app / 'node_modules/vitepress/bin/vitepress.js'
config = app / '.vitepress/config.mts'
original = config.read_text()
results = []

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self.links.extend(value for key, value in attrs if key == 'href')

def get(url):
    with urlopen(url, timeout=3) as response:
        return response.status, response.read().decode()

def wait(url):
    for _ in range(80):
        try:
            return get(url)
        except (URLError, TimeoutError):
            time.sleep(0.2)
    raise AssertionError(f'No server at {url}')

def stop(proc):
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()
        proc.wait()

try:
    for variant, port in [('baseline', 43181), ('optimizer-alias', 43182)]:
        shutil.rmtree(app / '.vitepress/cache', ignore_errors=True)
        config.write_text((root / f'{variant}-config.mts').read_text())
        log_path = root / f'followup-{variant}-dev.log'
        with log_path.open('w') as log:
            proc = subprocess.Popen([node, str(cli), 'dev', '--force', '--host', '127.0.0.1', '--port', str(port), '--strictPort'], cwd=app, stdout=log, stderr=subprocess.STDOUT)
            try:
                base = f'http://127.0.0.1:{port}'
                wait(base + '/')
                for route, marker in [('/guide/start.md?import', 'EXTERNAL_CONTENT_INITIAL_20260922'), ('/guide/nested/next.md?import', 'Nested next')]:
                    status, body = wait(base + route)
                    assert status == 200 and marker in body, (route, status, body[:100])
                time.sleep(2)
            finally:
                stop(proc)
        warnings = [line for line in log_path.read_text().splitlines() if 'Failed to resolve dependency' in line]
        result = {'variant': variant, 'cold_optimizer_warnings': warnings, 'external_markdown_modules': 'passed'}
        results.append(result)
        print(json.dumps(result), flush=True)

    # Test the alias remedy's production output and follow actual emitted links.
    with (root / 'followup-build.log').open('w') as log:
        subprocess.run([node, str(cli), 'build'], cwd=app, stdout=log, stderr=subprocess.STDOUT, check=True)
    with (root / 'followup-preview.log').open('w') as log:
        proc = subprocess.Popen([node, str(cli), 'preview', '--host', '127.0.0.1', '--port', '43183', '--strictPort'], cwd=app, stdout=log, stderr=subprocess.STDOUT)
        try:
            base = 'http://127.0.0.1:43183'
            wait(base + '/')
            links = []
            for route in ['/', '/guide/start.html', '/guide/nested/next.html']:
                _, body = get(base + route)
                parser = Links()
                parser.feed(body)
                for href in sorted(set(parser.links)):
                    target = urljoin(base + route, href)
                    if urlparse(target).netloc != urlparse(base).netloc:
                        continue
                    status, rendered = get(target)
                    assert status == 200, (href, target, status)
                    if '/guide/start' in target:
                        assert 'EXTERNAL_CONTENT_INITIAL_20260922' in rendered
                    if '/guide/nested/next' in target:
                        assert 'Nested next' in rendered
                    links.append({'from': route, 'href': href, 'target': target, 'status': status})
            print(json.dumps({'preview_links': links}), flush=True)
            results.append({'production_build': 'passed', 'preview_links': links, 'browser_hydration': 'not tested; browser unavailable'})
        finally:
            stop(proc)
finally:
    config.write_text(original)
    (root / 'followup-results.json').write_text(json.dumps(results, indent=2) + '\n')
