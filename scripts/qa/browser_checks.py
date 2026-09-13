"""Real Chromium DOM tests using the project's instrumented graphics fixture.

Requires Python Playwright and a Chromium binary. No network is used. This validates DOM,
controls and graphics command arguments, NOT real WebGL shader execution or GPU performance.
Run build-browser-harness.cjs first. Screenshots show the actual menus, not a simulated battle.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_fixture import prepare_fixture

ROOT = Path(__file__).resolve().parents[2]
html = (ROOT / 'index.html').read_text()
css = (ROOT / 'src/ui/styles.css').read_text()
output = ROOT / '.cache/qa'
output.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH'), headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.set_default_timeout(120000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.set_content('<!doctype html><html><head></head><body></body></html>')
    prepare_fixture(page, html, css)
    page.add_script_tag(content=(output / 'browser-harness.js').read_text())
    count = page.evaluate('__tests.length')
    results = []
    for i in range(count):
        result = page.evaluate('(i)=>__runTest(i)', i)
        results.append(result)
        print(result['status'].upper(), result['name'], result.get('error', ''), flush=True)
    # Build the menu through the real App/career view. The graphics fixture remains explicit.
    page.evaluate('''async () => {
      const fixture=await __load('tests/browser.ts').browserFixture();
      const s=new (__load('src/simulation/simulation.ts').Simulation)();s.settings.scenario=s.testArena='frontline';s.settings.teamSize=s.battleTeamSize=60;s.settings.loadout='engineer';s.reset();s.started=false;
      const r=new (__load('src/rendering/renderer.ts').Renderer)(s,document.getElementById('world'),document.getElementById('hud'));
      const profile={games:0,wins:0,kills:0,best:0};
      const app=new (__load('src/ui/app.ts').App)(s,r,{resume(){},sync(){},consume(){},dispose(){}},null,profile);
      document.getElementById('loading').hidden=true;
      window.__visual={app,s,r,fixture};app.show('home');
    }''')
    page.wait_for_timeout(600)
    page.screenshot(path=str(output / 'home-desktop.png'))
    pages = ['loadouts', 'barracks', 'challenges', 'options', 'controls', 'home']
    layout = []
    for width, height in [(1440, 900), (1024, 768), (390, 844)]:
        page.set_viewport_size({'width': width, 'height': height})
        for screen in pages:
            page.evaluate('(screen)=>__visual.app.show(screen)', screen)
            item = page.evaluate('''() => ({width:innerWidth,page:__visual.s.menuState,bodyWidth:document.body.scrollWidth,
              shellWidth:document.querySelector('.frontShell').getBoundingClientRect().width,
              contentWidth:document.querySelector('.frontContent').clientWidth,
              contentScrollWidth:document.querySelector('.frontContent').scrollWidth,
              errors:document.getElementById('error').hidden?null:document.getElementById('error').textContent,
              activePage:document.querySelector('[data-page]:not([hidden])')?.getAttribute('data-page')})''')
            item['status'] = 'pass' if item['bodyWidth'] <= width + 1 and item['shellWidth'] <= width + 1 and item['contentScrollWidth'] <= item['contentWidth'] + 1 and item['activePage'] == screen and not item['errors'] else 'fail'
            layout.append(item)
        if width == 390:
            page.wait_for_timeout(600)
            page.screenshot(path=str(output / 'home-mobile.png'))
    # Every GUI surface uses the same theme and is checked at desktop, phone and short landscape sizes.
    all_screens = ['home', 'loadouts', 'barracks', 'challenges', 'options', 'controls', 'credits', 'lab', 'pause', 'confirm', 'results', 'map', 'orders', 'deployment', 'scoreboard', 'dialog', 'loading', 'error']
    surfaces = []
    page.evaluate("""()=>{const {s}=__visual;s.started=true;s.initialDeployment=false;s.player.alive=true;
      __load('src/ui/career.ts').renderDebrief({id:'layout-fixture',endedAt:0,seed:872419,seconds:540,result:'victory',score:3120,xp:4120,stats:{kills:16,assists:9,captures:3,revives:2},medals:['combat','objective']});
      document.getElementById('roundTitle').textContent='OPERATION COMPLETE';
      document.getElementById('roundStats').textContent='AEGIS VICTORY · 9 MINUTES · CIVIC FRONTLINE';
    }""")
    for width, height in [(1440, 900), (390, 844), (844, 390)]:
        page.set_viewport_size({'width': width, 'height': height})
        for screen in all_screens:
            page.evaluate("""screen=>{
              const {app,s,r}=__visual;app.closeDialog();
              for(const id of ['loading','error','scoreboard'])document.getElementById(id).hidden=true;
              s.started=true;s.player.alive=true;s.initialDeployment=false;
              if(['map','orders','deployment'].includes(screen))app.openTactical(screen);
              else if(screen==='scoreboard'){app.show('play');app.showScores();}
              else if(screen==='dialog'){app.show('barracks');app.confirmAction('LOAD A SAVED PROFILE?','Your current session remains in its checkpoint. Loading replaces the career shown in this tab.',()=>{});}
              else if(screen==='loading'){app.show('home');document.getElementById('loading').hidden=false;}
              else if(screen==='error'){app.show('home');document.getElementById('error').hidden=false;document.getElementById('error').textContent='Graphics unavailable. Enable hardware acceleration, then reload Battlevox.';}
              else app.show(screen);
              r.resize();if(['map','orders','deployment'].includes(screen))app.updateTactical();
            }""", screen)
            item = page.evaluate("""screen=>{const id=['map','orders','deployment'].includes(screen)?'tactical':screen==='scoreboard'?'scoreboard':screen==='dialog'?'actionDialog':screen==='loading'?'loading':screen==='error'?'error':'overlay';
              const el=document.getElementById(id),box=el.getBoundingClientRect();return {screen,width:innerWidth,height:innerHeight,visible:!el.hidden,
              left:box.left,right:box.right,top:box.top,bottom:box.bottom,bodyWidth:document.body.scrollWidth,
              background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color};}""", screen)
            item['status'] = 'pass' if item['visible'] and item['left'] >= -1 and item['right'] <= width+1 and item['top'] >= -1 and item['bottom'] <= height+1 and item['bodyWidth'] <= width+1 else 'fail'
            surfaces.append(item)
            if (width == 1440 and screen in ['home','loadouts','barracks','options','lab','results','deployment','orders','scoreboard','dialog']) or (width == 390 and screen in ['lab','deployment','dialog']):
                page.wait_for_timeout(250)
                page.screenshot(path=str(output / f'ui-{screen}-{width}.png'))
    page.evaluate('__visual.app.dispose()')
    report = {'environment': browser.version, 'graphics': 'Instrumented command adapter; no GPU execution', 'navigation': 'In-memory document, no network', 'tests': results, 'layout': layout, 'surfaces': surfaces, 'uncaughtErrors': errors}
    (output / 'browser-tests.json').write_text(json.dumps(report, indent=2))
    print('BROWSER RESULT', sum(r['status']=='pass' for r in results), '/', len(results), 'LAYOUT', sum(r['status']=='pass' for r in layout), '/', len(layout), 'SURFACES', sum(r['status']=='pass' for r in surfaces), '/', len(surfaces), 'UNCAUGHT', len(errors))
    browser.close()
    if any(r['status']=='fail' for r in results+layout+surfaces) or errors:
        raise SystemExit(1)
