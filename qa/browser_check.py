"""Exercise production files; HTTP mode additionally verifies native reload/storage.

Local sandbox: --offline renders the exact self-contained production HTML, without
relaxing browser policy. CI: --base-url serves dist as ESM; no fallback is allowed.
QA responses below are synthetic fixtures, never personal user data.
"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
V1 = 'earth-player-manual.v1'
V2 = 'earth-player-manual.learning.v2'
DIRECTIONS = ['care', 'study', 'living', 'people', 'world', 'choices']
CHAPTERS = ['sleep', 'meals', 'attention', 'practice', 'memory', 'claims', 'help']


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--offline', action='store_true')
    mode.add_argument('--base-url')
    parser.add_argument('--out', default=str(ROOT / 'qa' / 'results'))
    args = parser.parse_args()
    out = Path(args.out); out.mkdir(parents=True, exist_ok=True)
    report = {'mode': 'offline-artifact' if args.offline else 'http-esm', 'checks': [], 'errors': [], 'skipped': [], 'revision': os.environ.get('GITHUB_SHA', 'local-working-tree')}
    if args.offline:
        report['skipped'] = ['HTTP navigation, native reload and localStorage persistence require --base-url.']
    errors = report['errors']
    html = (ROOT / 'dist' / 'EARTH-player-manual.html').read_text()
    screenshot_names = []

    def record(message):
        report['checks'].append(message)
        print('PASS', message, flush=True)

    def route(page, path):
        page.evaluate('path => { location.hash=path; window.dispatchEvent(new HashChangeEvent("hashchange")); }', path)
        expect(page.locator('main')).to_be_visible()

    def no_overflow(page):
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'horizontal page overflow'

    def screenshot(page, name, full=False):
        page.screenshot(path=str(out / name), full_page=full)
        screenshot_names.append(name)

    with sync_playwright() as p:
        executable = os.environ.get('CHROMIUM_PATH')
        if not executable and Path('/usr/bin/chromium').exists(): executable = '/usr/bin/chromium'
        browser = p.chromium.launch(executable_path=executable, args=['--no-sandbox'])

        def new_page(mobile=False, reduced=False, fixture=None, storage_blocked=False):
            context = browser.new_context(viewport={'width': 390 if mobile else 1440, 'height': 844 if mobile else 900},
                                          device_scale_factor=1, is_mobile=mobile, has_touch=mobile,
                                          reduced_motion='reduce' if reduced else 'no-preference')
            if fixture:
                # Persistent marker prevents this initial fixture replacing data on reload.
                context.add_init_script("""(() => {
                  if (sessionStorage.getItem('qa-fixture-applied')) return;
                  const data=FIXTURE;
                  for (const [key,value] of Object.entries(data)) localStorage.setItem(key,value);
                  sessionStorage.setItem('qa-fixture-applied','1');
                })();""".replace('FIXTURE', json.dumps(fixture)))
            if storage_blocked:
                context.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new DOMException('QA storage blocked','SecurityError')}})")
            page = context.new_page(); page.set_default_timeout(5000)
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.on('console', lambda m: errors.append('console: '+m.text) if m.type == 'error' else None)
            if args.offline: page.set_content(html, wait_until='load')
            else: page.goto(args.base_url, wait_until='networkidle')
            expect(page.locator('.foundation-home')).to_be_visible()
            return page

        try:
            page = new_page()
            expect(page.locator('h1')).to_contain_text('现实世界')
            expect(page.locator('.direction-board > li')).to_have_count(6)
            assert not page.locator('.foundation-home a[href="#guide/food"]').count()
            no_overflow(page); screenshot(page, 'desktop-home.png')
            page.get_by_role('link', name='看看从哪里开始').click()
            expect(page.locator('h1')).to_have_text('人生知识路线图')
            for id in DIRECTIONS:
                route(page, 'routes/'+id)
                expect(page.locator('.reading-list > li').first).to_be_visible()
                assert page.locator('.planned-topics a').count() == 0
                no_overflow(page)
            record('Home exposes six directions; unfinished topics are not fake links; no bread default')

            route(page, 'home')
            page.get_by_role('link', name='睡眠与休息').click()
            expect(page.locator('h1')).to_have_text('怎样判断自己有没有休息够？')
            expect(page.locator('.chapter-sources a')).to_have_count(4)
            expect(page.locator('.safety-note')).to_contain_text('评估')
            screenshot(page, 'desktop-sleep.png'); screenshot(page, 'desktop-sleep-full.png', True)
            initial_hash = page.evaluate('location.hash')
            page.locator('[data-source-jump]').first.click()
            assert page.evaluate('location.hash') == initial_hash, 'source jump lost reading route'
            expect(page.locator('.chapter-sources a').first).to_be_focused()
            page.locator('[data-reading-action="read"]').click()
            expect(page.locator('h1')).to_have_text('吃饭和活动，怎样安排得简单一些？')
            page.locator('[data-reading-action="skip"]').click()
            expect(page.locator('h1')).to_have_text('遇到自己处理不了的问题，怎样求助？')
            route(page, 'routes/care')
            expect(page.locator('.reading-list > li').nth(0)).to_contain_text('已读')
            expect(page.locator('.reading-list > li').nth(1)).to_contain_text('已跳过')
            route(page, 'learn/help?route=people'); page.locator('[data-reading-action="read"]').click()
            expect(page.locator('h1')).to_have_text('劳动与协作')
            assert 'route=people' in page.evaluate('location.hash')
            route(page, 'learn/claims?route=study'); page.locator('[data-reading-action="skip"]').click()
            expect(page.locator('h1')).to_have_text('学会学习和判断')
            for id in CHAPTERS:
                route(page, 'learn/'+id)
                expect(page.locator('.chapter-section')).to_have_count(4)
                no_overflow(page)
            record('Seven substantive chapters, source jumps, explicit read/skip and direction-aware next paths')

            route(page, 'learn/sleep?route=care')
            page.locator('.sleep-record summary').click()
            page.get_by_role('button', name='保存这条记录').click()
            expect(page.locator('#sleep-note-status')).to_contain_text('不记录也可以继续')
            note = 'QA 示例：昨晚睡得比平时晚。<img src=x onerror=alert(1)>'
            page.locator('#sleep-note').fill(note); page.get_by_role('button', name='保存这条记录').click()
            route(page, 'routes/care'); route(page, 'learn/sleep')
            page.locator('.sleep-record summary').click()
            expect(page.locator('#sleep-note')).to_have_value(note)
            assert page.locator('.sleep-record img').count() == 0
            page.once('dialog', lambda d: d.dismiss()); page.locator('#delete-sleep-note').click()
            expect(page.locator('#sleep-note')).to_have_value(note)
            page.once('dialog', lambda d: d.accept()); page.locator('#delete-sleep-note').click()
            expect(page.locator('#sleep-note')).to_have_value('')
            record('Optional sleep note, same-session retention, escaped input and confirmed scoped deletion')

            route(page, 'practice/recall')
            expect(page.locator('.recall-example')).to_be_visible()
            page.locator('#hide-example').click()
            assert page.locator('.recall-example').count() == 0, 'original must be removed during recall'
            page.locator('#recall-response').fill('QA 示例：闭馆前还伞，记下编号。')
            page.get_by_role('button', name='对照原文', exact=True).click()
            expect(page.locator('.your-recall')).to_contain_text('记下编号')
            for i, value in enumerate(['included','included','missed']):
                page.locator(f'input[name="point-{i}"][value="{value}"]').check()
            page.get_by_role('button', name='看看遗漏，再换个情境试试').click()
            expect(page.locator('.comparison-summary ul')).to_contain_text('损坏')
            page.locator('input[name="answer"][value="rack"]').check()
            page.get_by_role('button', name='查看反馈', exact=True).click()
            expect(page.locator('#transfer-feedback')).to_contain_text('漏了损坏时的处理方式')
            assert page.locator('.attempt-receipt').count() == 0
            page.locator('input[name="answer"][value="desk"]').check()
            page.get_by_role('button', name='查看反馈', exact=True).click()
            expect(page.locator('#practice-stage-title')).to_have_text('这次练习已完成')
            expect(page.locator('.attempt-receipt')).to_contain_text('不等于已经长期记住')
            page.locator('#review-later').click()
            route(page, 'home'); expect(page.locator('.review-reminder')).to_be_visible()
            expect(page.locator('.resume-reading')).to_have_attribute('href', '#practice/recall')
            page.locator('.resume-reading').click()
            expect(page.locator('#toast')).not_to_have_class('visible')
            screenshot(page, 'desktop-practice-complete.png')
            page.get_by_role('link', name='继续读「回忆与复习」').click()
            expect(page.locator('h1')).to_have_text('学过的东西，怎样记得更牢？')
            record('Recall → self-comparison → plausible transfer → specific error/retry → completion → next reading/review')

            for query, title in [('睡不醒','怎样判断自己有没有休息够？'),('看完记不住','学过的东西，怎样记得更牢？'),('不知道先学什么','人生知识路线图')]:
                page.keyboard.press('Control+k'); page.get_by_role('combobox').fill(query)
                expect(page.get_by_role('option').first).to_contain_text('看看从哪里开始' if query == '不知道先学什么' else title)
                page.keyboard.press('Enter'); expect(page.locator('h1')).to_have_text(title)
            trigger=page.locator('.search-trigger'); trigger.focus(); trigger.click()
            page.get_by_role('combobox').fill('如何申请火星土地许可证')
            expect(page.locator('.search-empty')).to_contain_text('没有找到相关内容')
            page.keyboard.press('Escape'); expect(trigger).to_be_focused()
            trigger.click(); page.get_by_role('combobox').fill('食物为什么变贵')
            page.keyboard.press('Enter'); expect(page.locator('.recipe-detail h2')).to_contain_text('为什么食物会变贵')
            assert page.locator('.recipe-detail .chain-arrow').count() == 0
            page.get_by_role('button',name='清除路线高亮').click()
            page.get_by_role('button', name='选择 运输', exact=True).click()
            page.get_by_role('button', name='放大地图').click(); expect(page.locator('#zoom-value')).to_have_text('115%')
            page.get_by_role('button', name='复位地图').click(); expect(page.locator('#zoom-value')).to_have_text('100%')
            before=page.locator('#graph-transform').get_attribute('transform')
            page.locator('.desktop-map').focus(); page.keyboard.press('ArrowRight')
            assert before != page.locator('#graph-transform').get_attribute('transform')
            page.get_by_role('button',name='复位地图').click()
            box=page.locator('.desktop-map').bounding_box(); before=page.locator('#graph-transform').get_attribute('transform')
            page.mouse.move(box['x']+45,box['y']+45); page.mouse.down()
            page.mouse.move(box['x']+95,box['y']+75,steps=5); page.mouse.up()
            assert before != page.locator('#graph-transform').get_attribute('transform')
            assert not page.locator('.desktop-map').evaluate('(el)=>el.classList.contains("dragging")')
            page.get_by_role('button',name='复位地图').click()
            node=page.get_by_role('button',name='选择 储存',exact=True); node.focus(); page.keyboard.press('Enter')
            expect(page.locator('.node-panel h2')).to_have_text('储存'); expect(node).to_be_focused()
            screenshot(page, 'desktop-atlas.png')
            for id in ['food','prices']:
                route(page,'guide/'+id); expect(page.locator('h1')).to_be_visible(); no_overflow(page)
            record('Real-language search, keyboard/focus recovery, honest empty state, legacy links and atlas pan/zoom/keyboard')

            route(page,'quests/observe')
            expect(page.locator('#observe-form')).to_be_visible()
            page.locator('#observation').fill('QA 示例：包装上印有生产商名称。')
            route(page,'atlas'); route(page,'quests/observe')
            expect(page.locator('#observation')).to_have_value('QA 示例：包装上印有生产商名称。')
            page.get_by_role('button',name='保存这条观察').click()
            expect(page.locator('.quest-complete h2')).to_have_text('这条观察已记录')
            expect(page.locator('.completion-evidence')).to_contain_text('还未完成练习')
            route(page,'quests/predict')
            expect(page.locator('#model-value')).to_have_text('?')
            page.locator('input[name="prediction"][value="150"]').check()
            page.get_by_role('button',name='查看反馈').click()
            expect(page.locator('#quest-feedback')).to_contain_text('只改变运输那一部分')
            expect(page.locator('#model-value')).to_have_text('105.0')
            page.locator('#pass').fill('50'); expect(page.locator('#model-value')).to_have_text('?')
            page.locator('input[name="prediction"][value="102.5"]').check()
            page.get_by_role('button',name='查看反馈').click()
            expect(page.locator('#quest-feedback')).to_contain_text('这次计算正确')
            route(page,'quests/trace')
            page.locator('input[value="reverse"]').check(); page.get_by_role('button',name='查看反馈').click()
            expect(page.locator('#quest-feedback')).to_contain_text('运输')
            page.locator('input[value="space-time"]').check(); page.get_by_role('button',name='查看反馈').click()
            expect(page.locator('#quest-feedback')).to_contain_text('这次判断正确')
            page.once('dialog',lambda d:d.dismiss()); page.locator('[data-reset-progress]').click()
            expect(page.locator('.quest-count strong')).to_have_text('3')
            page.once('dialog',lambda d:d.accept()); page.locator('[data-reset-progress]').click()
            expect(page.locator('.quest-count strong')).to_have_text('0')
            route(page,'practice/recall'); expect(page.locator('.attempt-receipt')).to_be_visible()
            record('Independent world exercises, optional observation, numerical prediction/reset, retries and scoped reset')

            for path in ['nonsense','learn/missing','routes/missing','practice/missing','quests/missing','guide/missing']:
                route(page,path); expect(page.locator('h1')).to_have_text('没有找到这一页')
                expect(page.get_by_role('link',name='查看学习路线')).to_be_visible()
            route(page,'guide'); expect(page.locator('h1')).to_have_text('人生知识路线图')
            record('Unknown route recovery and bare #guide no longer defaults to food')

            mobile=new_page(mobile=True)
            for label in ['学习路线','知识地图','小练习']:
                expect(mobile.get_by_role('navigation',name='主导航').get_by_role('link',name=label,exact=True)).to_be_visible()
            no_overflow(mobile); screenshot(mobile,'mobile-home.png'); screenshot(mobile,'mobile-home-full.png',True)
            for id in DIRECTIONS:
                route(mobile,'routes/'+id); no_overflow(mobile)
            for id in CHAPTERS:
                route(mobile,'learn/'+id); no_overflow(mobile)
                assert mobile.locator('.chapter-section p').first.evaluate('el=>parseFloat(getComputedStyle(el).fontSize)') >= 17
            route(mobile,'learn/sleep'); screenshot(mobile,'mobile-sleep.png'); screenshot(mobile,'mobile-sleep-full.png',True)
            route(mobile,'practice/recall'); screenshot(mobile,'mobile-practice.png'); no_overflow(mobile)
            mobile.locator('#hide-example').click(); mobile.locator('#recall-response').fill('暂时想不起来')
            mobile.get_by_role('button',name='对照原文',exact=True).click()
            for i in range(3): mobile.locator(f'input[name="point-{i}"][value="unsure"]').check()
            no_overflow(mobile); mobile.get_by_role('button',name='看看遗漏，再换个情境试试').click()
            mobile.locator('input[value="desk"]').check(); mobile.get_by_role('button',name='查看反馈').click()
            no_overflow(mobile); expect(mobile.locator('.attempt-receipt')).to_be_visible()
            route(mobile,'atlas'); no_overflow(mobile)
            expect(mobile.locator('.mobile-node-explorer')).to_be_visible()
            expect(mobile.get_by_role('link',name='阅读这个系统')).to_be_in_viewport()
            mobile.locator('#mobile-node-select').select_option('transport')
            expect(mobile.locator('#mobile-node-select')).to_be_focused()
            mobile.get_by_role('link',name='阅读这个系统').click()
            expect(mobile.locator('main')).to_be_focused(); expect(mobile.locator('h1')).to_have_text('运输')
            route(mobile,'quests/predict'); no_overflow(mobile)
            mobile.locator('.search-trigger').click(); mobile.get_by_role('combobox').fill('看完记不住')
            expect(mobile.get_by_role('option').first).to_contain_text('记得更牢'); no_overflow(mobile)
            screenshot(mobile,'mobile-search.png')
            record('390×844: all nav items, six directions, seven readable chapters, complete recall flow, touch atlas and search')

            reduced=new_page(reduced=True)
            assert reduced.evaluate('matchMedia("(prefers-reduced-motion: reduce)").matches')
            reduced.get_by_role('link',name='看看从哪里开始').focus(); reduced.keyboard.press('Enter')
            expect(reduced.locator('main')).to_be_focused()
            record('Reduced-motion preference and keyboard route entry with main focus')

            if args.base_url:
                legacy=json.dumps({'version':1,'visited':['food'],'completed':['trace','predict','observe'],
                                   'notes':{'observe':'QA 旧包装笔记','unrecognized':'保留字段'}},ensure_ascii=False)
                saved=new_page(fixture={V1:legacy})
                assert saved.evaluate('key=>localStorage.getItem(key)',V1) == legacy
                saved.get_by_role('link',name='睡眠与休息').click()
                assert saved.evaluate('key=>JSON.parse(localStorage.getItem(key)).read',V2) == []
                assert saved.evaluate('key=>localStorage.getItem(key)',V1) == legacy
                saved.locator('.sleep-record summary').click(); saved.locator('#sleep-note').fill('QA 持久化睡眠记录')
                saved.get_by_role('button',name='保存这条记录').click()
                saved.locator('[data-reading-action="read"]').click()
                assert saved.evaluate('key=>localStorage.getItem(key)',V1) == legacy
                saved.reload(wait_until='networkidle'); expect(saved.locator('h1')).to_contain_text('吃饭和活动')
                route(saved,'home'); expect(saved.locator('.resume-reading')).to_contain_text('吃饭和活动')
                route(saved,'practice/recall'); saved.locator('#hide-example').click()
                saved.locator('#recall-response').fill('QA 原生刷新后的回忆草稿')
                saved.reload(wait_until='networkidle'); expect(saved.locator('#recall-response')).to_have_value('QA 原生刷新后的回忆草稿')
                saved.get_by_role('button',name='对照原文',exact=True).click()
                for i in range(3): saved.locator(f'input[name="point-{i}"][value="unsure"]').check()
                saved.get_by_role('button',name='看看遗漏，再换个情境试试').click()
                saved.locator('input[value="desk"]').check(); saved.get_by_role('button',name='查看反馈').click()
                saved.reload(wait_until='networkidle'); expect(saved.locator('.attempt-receipt')).to_be_visible()
                route(saved,'learn/sleep'); saved.locator('.sleep-record summary').click()
                expect(saved.locator('#sleep-note')).to_have_value('QA 持久化睡眠记录')
                route(saved,'quests/observe'); expect(saved.locator('.saved-observation')).to_contain_text('QA 旧包装笔记')
                route(saved,'guide/energy')
                assert saved.evaluate('key=>JSON.parse(localStorage.getItem(key)).notes.unrecognized',V1) == '保留字段'
                # Actual browser history (not our route helper) returns to the previous direction.
                route(saved,'routes'); saved.locator('a[href="#routes/study"]').click()
                saved.go_back(wait_until='load'); expect(saved.locator('h1')).to_have_text('人生知识路线图')
                record('HTTP ESM, native reload, browser Back, old-note preservation, no false migration and resumable recall')
                malformed=new_page(fixture={V1:'{broken',V2:json.dumps({'version':2,'recall':{'stage':'complete','completed':True}})})
                route(malformed,'practice/recall'); expect(malformed.locator('#recall-response')).to_be_visible()
                blocked=new_page(storage_blocked=True)
                route(blocked,'practice/recall'); blocked.locator('#hide-example').click()
                expect(blocked.locator('#recall-response')).to_be_visible()
                expect(blocked.locator('.storage-warning')).to_contain_text('无法保存')
                record('Corrupted stored completion cannot grant success; storage denial preserves readable session mode')

            assert not errors, errors
            report['status']='passed'
        except Exception as exc:
            report['status']='failed'; report['failure']=str(exc)
            try: page.screenshot(path=str(out/'failure.png'),full_page=True)
            except Exception: pass
            raise
        finally:
            report['screenshots']=screenshot_names
            (out/'browser-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
            browser.close()
    print(json.dumps(report,ensure_ascii=False,indent=2))

if __name__ == '__main__': main()
