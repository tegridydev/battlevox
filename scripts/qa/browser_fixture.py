"""Prepare the trusted repository shell using Chromium's HTML parser, without scripts.

This is fixture preparation, not sanitization of arbitrary user-provided HTML.
"""


def prepare_fixture(page, html, css):
    page.evaluate("""data => {
      const shell = new DOMParser().parseFromString(data.html, 'text/html');
      function removeScripts(root) {
        for (const script of root.querySelectorAll('script')) script.remove();
        for (const template of root.querySelectorAll('template')) removeScripts(template.content);
      }
      removeScripts(shell);
      window.__fixtureBody = shell.body.innerHTML;
      window.__fixtureCSS = data.css;
    }""", {'html': html, 'css': css})
