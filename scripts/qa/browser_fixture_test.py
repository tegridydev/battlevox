"""Regression checks for Chromium fixture preparation; run with Python unittest."""
import os
import unittest
from playwright.sync_api import sync_playwright
from browser_fixture import prepare_fixture


class BrowserFixtureTests(unittest.TestCase):
    def test_parser_removes_scripts_before_fixture_installation(self):
        with sync_playwright() as p:
            browser = p.chromium.launch(
                executable_path=os.environ.get('CHROMIUM_PATH'),
                headless=True, args=['--no-sandbox'])
            try:
                page = browser.new_page()
                html = '''<!doctype html><html><head><script>throw Error('head')</script></head>
                  <body><p id="retained" title=">">Menu &amp; controls</p>
                  <!-- <script>comment</script> --!>
                  <ScRiPt data-value=">">window.injected=true</sCrIpT extra="value">
                  <script src="https://example.invalid/entry.js"></script>
                  <template><template><script>window.injected=true</script></template></template>
                  <script>window.injected=true'''
                css = 'body { color: red; }'
                prepare_fixture(page, html, css)
                state = page.evaluate('''() => {
                  document.body.innerHTML = __fixtureBody;
                  function count(root) {
                    return root.querySelectorAll('script').length +
                      [...root.querySelectorAll('template')].reduce((n, t) => n + count(t.content), 0);
                  }
                  return {scripts: count(document), text: document.getElementById('retained').textContent,
                    injected: !!window.injected, css: __fixtureCSS};
                }''')
                self.assertEqual(state, {'scripts': 0, 'text': 'Menu & controls',
                                         'injected': False, 'css': css})
            finally:
                browser.close()


if __name__ == '__main__':
    unittest.main()
