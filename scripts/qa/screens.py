"""Check complete, bounded menu layouts in Chromium. Graphics use the command adapter.
No network, native GPU or performance claims. Run test:browser:prepare first.
"""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_fixture import prepare_fixture
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'.cache/qa';OUT.mkdir(parents=True,exist_ok=True)
html=(ROOT/'index.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH'),headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':900},reduced_motion='reduce'); page.set_default_timeout(120000)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content('<!doctype html><html><head></head><body></body></html>')
 prepare_fixture(page, html, (ROOT/'src/ui/styles.css').read_text())
 page.add_script_tag(content=(OUT/'browser-harness.js').read_text())
 page.evaluate('''async()=>{const fixture=await __load('tests/browser.ts').browserFixture();const s=__load('tests/helpers.ts').smallSimulation();s.createSquads();
 const r=new (__load('src/rendering/renderer.ts').Renderer)(s,document.getElementById('world'),document.getElementById('hud'));
 const p=__load('src/core/progression.ts'),profile={games:40,wins:20,kills:876,best:4500};const c=p.ensureCareer(profile);c.name='LONG CALLSIGN 01234567890';c.xp=45678;
 for(const item of p.itemTracks)c.items[item.id]={xp:9000,equipped:'standard'};
 for(const medal of p.medalDefinitions)c.medals[medal.id]=8;
 for(let i=0;i<40;i++)c.history.push({id:'fixture-'+i,endedAt:1789000000000+i,seed:872419,seconds:1500,result:i%2?'victory':'defeat',score:12345,xp:4567,stats:{kills:123,assists:42,captures:9},medals:p.medalDefinitions.map(m=>m.id)});
 const app=new (__load('src/ui/app.ts').App)(s,r,{resume(){},sync(){},consume(){},dispose(){}},null,profile);document.getElementById('loading').hidden=true;
 window.__visual={app,s,r,fixture};__load('src/ui/career.ts').renderDebrief(c.history[0]);
 document.getElementById('roundTitle').textContent='VICTORY';document.getElementById('roundStats').textContent='Aegis · Metropolis · 25:00';}''')
 cases=['home','loadouts','challenges','barracks:overview','barracks:ribbons','barracks:history','barracks:profile','options:display','options:controls','options:audio','controls:movement','controls:combat','controls:classes','controls:world','lab:setup','lab:practice','lab:engine','lab:squads','credits','pause','confirm','results','map','orders','deployment','scoreboard','dialog']
 # Names come from source data attributes so renamed tabs cannot silently skip coverage.
 actual=page.evaluate("()=>[...document.querySelectorAll('[data-tab]')].map(b=>b.dataset.tab)")
 print('TABS',actual,flush=True)
 # Map the page-specific tab group names to their host screen.
 cases=[x for x in cases if ':' not in x]
 hosts={'career':'barracks','settings':'options','manual':'controls','lab':'lab'}
 cases += ['lab-checks','lab-members','lab-action','history-last','assignments-last']
 cases += [hosts[g]+':'+g+':'+v for g,v in [x.split(':') for x in actual] if g in hosts]
 cases += ['home-frontline','home-frontline-new']
 cases += ['item:'+id for id in page.evaluate("()=>__load('src/core/progression.ts').itemTracks.map(t=>t.id)")]
 results=[]
 for width,height in [(1920,1080),(1440,900),(1366,768),(1280,720),(1024,768),(844,390),(390,844),(375,667),(320,568)]:
  page.set_viewport_size({'width':width,'height':height})
  for case in cases:
   page.evaluate('''async name=>{const {app,s,r}=__visual;app.closeDialog();for(const id of ['scoreboard','loading','error'])document.getElementById(id).hidden=true;
    s.started=true;s.player.alive=true;s.initialDeployment=false;s.settings.scenario='city';let [screen,group,value]=name.split(':');
    if(name.startsWith('home-frontline')){screen='home';s.settings.scenario='frontline';s.started=name!=='home-frontline-new';app.syncSettings();}
    if(name.startsWith('item:')){screen='loadouts';app.screens.career.item=group;group=undefined;}
    if(name.startsWith('lab-')){screen='lab';group='lab';value=name==='lab-checks'?'engine':name==='lab-members'?'squads':'practice';}
    if(name==='history-last'){screen='barracks';group='career';value='history';app.screens.career.history=999;}
    if(name==='assignments-last'){screen='challenges';app.screens.career.assignments=999;}
    if(['map','orders','deployment'].includes(screen)){app.openTactical(screen);app.updateTactical();}
    else if(screen==='scoreboard'){app.show('play');app.showScores();}
    else if(screen==='dialog'){app.show('barracks');app.confirmAction('Load saved profile?','Your current progress remains in this session checkpoint. Loading replaces the career shown in this tab.',()=>{});}
    else app.show(screen);
    if(group){if(!document.querySelector(`[data-tab="${group}:${value}"]`))throw Error('Missing tab '+name);app.screens.select(group,value);}
    if(name==='lab-checks'&&document.getElementById('labCheckResult').hidden)document.getElementById('labCheck').click();
    if(name==='lab-members'){document.getElementById('labReport').value='squad';app.lab.update();}
    if(name==='lab-action')document.getElementById('labReposition').click();
    r.resize(); await new Promise(resolve=>setTimeout(resolve,10));
   }''',case)
   item=page.evaluate('''name=>{const screen=name.split(':')[0]; const root=document.getElementById(['map','orders','deployment'].includes(screen)?'tactical':screen==='scoreboard'?'scoreboard':screen==='dialog'?'actionDialog':'overlay');
    const visible=e=>!e.closest('[hidden]')&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
    const label=e=>e.id||e.getAttribute('data-panel')||e.className||e.tagName;
    const clips=[];for(const e of root.querySelectorAll('button,input,select,output')){
      if(!visible(e))continue;e.scrollIntoView({block:'nearest',inline:'nearest'});const r=e.getBoundingClientRect();if(r.width<1||r.height<1)continue;
      let b={left:0,right:innerWidth,top:0,bottom:innerHeight};
      for(let a=e.parentElement;a;a=a.parentElement){const s=getComputedStyle(a),ar=a.getBoundingClientRect();if(['hidden','clip','auto','scroll'].includes(s.overflowX)){b.left=Math.max(b.left,ar.left);b.right=Math.min(b.right,ar.right);}if(['hidden','clip','auto','scroll'].includes(s.overflowY)){b.top=Math.max(b.top,ar.top);b.bottom=Math.min(b.bottom,ar.bottom);}}
      if(r.left<b.left-1||r.right>b.right+1||r.top<b.top-1||r.bottom>b.bottom+1)clips.push({id:label(e),r:[r.left,r.top,r.right,r.bottom],box:b});
    }
    const overflow=[];for(const e of root.querySelectorAll('.hubPage,.frontContent,[data-panel],.loadoutBody,.settings,.tacticalCard,.tacticalGrid,.scoreCard,.assignmentGrid,.statsGrid,.labGrid,.helpGrid'))if(visible(e)&&['hidden','clip'].includes(getComputedStyle(e).overflowY)&&e.scrollHeight>e.clientHeight+2)overflow.push({id:label(e),height:e.clientHeight,scroll:e.scrollHeight});
    return {name,width:innerWidth,height:innerHeight,clipped:clips,overflow,body:[document.body.scrollWidth,document.body.scrollHeight]};}''',case)
   item['status']='pass' if not item['clipped'] and not item['overflow'] and item['body'][0]<=width+1 and item['body'][1]<=height+1 else 'fail'
   results.append(item)
   if item['status']=='fail':print('FAIL',width,height,case,json.dumps({'clips':item['clipped'],'overflow':item['overflow']}),flush=True)
   if (width,height) in [(1366,768),(844,390),(320,568)] and (item['status']=='fail' or case in ['home','loadouts','deployment']):page.screenshot(path=str(OUT/f'fit-{width}-{case.replace(":","-")}.png'))
 report={'browser':browser.version,'graphics':'Instrumented command adapter; no GPU execution','checks':results,'uncaughtErrors':errors}
 (OUT/'screen-fit-061.json').write_text(json.dumps(report,indent=2));print('FIT',sum(r['status']=='pass' for r in results),'/',len(results),'ERRORS',errors,flush=True)
 page.evaluate('__visual.app.dispose()');browser.close()
 if errors or any(r['status']=='fail' for r in results):raise SystemExit(1)
