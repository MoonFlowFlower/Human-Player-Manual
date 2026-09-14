"""Targeted interaction regressions. Runs on the built artifact, not a hosted URL."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import json, os
out=Path(__file__).parent/'results'
out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None),args=['--no-sandbox'])
 html=(Path(__file__).resolve().parents[1]/'dist/EARTH-player-manual.html').read_text()
 page=browser.new_page(viewport={'width':1440,'height':900})
 page.set_default_timeout(2500)
 page.set_content(html)
 page.locator('a[href="#routes/world"]').click()
 page.locator('[data-home-node="water"]').click()
 expect(page.locator('.node-panel h2')).to_have_text('水')
 page.get_by_role('button',name='为什么食物会变贵？',exact=False).click()
 assert page.locator('.recipe-detail .chain-arrow').count()==0,'A multi-factor inquiry must not invent a causal chain'
 mobile=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 mobile.set_content(html)
 mobile.get_by_role('navigation',name='主导航').get_by_role('link',name='知识地图',exact=True).click()
 expect(mobile.get_by_role('link',name='阅读这个系统')).to_be_in_viewport()
 mobile.locator('#mobile-node-select').select_option('transport')
 expect(mobile.locator('#mobile-node-select')).to_be_focused()
 mobile.get_by_role('link',name='阅读这个系统').click()
 expect(mobile.locator('main')).to_be_focused()
 expect(mobile.get_by_role('heading',name='运输',exact=True)).to_be_visible()
 result={'status':'passed','checks':['SVG node deep navigation','No invented causal arrows for context recipe','Immediate mobile read action','Focus retained after mobile select','Main focus after route navigation']}
 (out/'interaction-report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
 print(json.dumps(result,ensure_ascii=False,indent=2))
 browser.close()
