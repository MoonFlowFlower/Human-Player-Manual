import { concepts, sources } from './content.js';
import { conceptIndex, connected, safeText, suggestedAfter } from './model.js';
import { readingDirection, readingInfo, readingUrl, nextReading, relatedReadings } from './learning-model.js';
import { directions } from './learning-content.js';
import { icon, nodeLink, must, notFoundPage } from './ui.js';
import { experimentHTML, mountExperiment } from './experiment.js';

const sections=[['what','是什么'],['why','为什么存在'],['mechanism','核心机制'],['flow','输入与输出'],['dependencies','相关基础'],['failures','如何出问题'],['traps','常见误解'],['suggestedAfter','继续理解'],['quest','想一想'],['sources','资料来源']];
export function guidePage(id: string, requested = ''): string {
 const c=conceptIndex.get(id);
 if(!c)return notFoundPage();
 const ref={kind:'concept' as const,id}, direction=readingDirection(ref,requested), d=directions.find(d=>d.id===direction)!;
 const onward=nextReading(ref,direction), learning=relatedReadings(`concept:${id}`);
 const related=[...new Set(connected(c.id).map(e=>e.from===c.id?e.to:e.from))];
 const exercise = ['prices','transport'].includes(id) ? {id:'predict',title:'试算一个价格变化'} : id==='storage' ? {id:'trace',title:'比较运输与储存'} : ['packaging','information'].includes(id) ? {id:'observe',title:'查看食品包装'} : undefined;
 const next=suggestedAfter(c.id); const ownSources=sources.filter(s=>c.sources.includes(s.id));
 return `<main id="main" class="guide-page page" tabindex="-1"><div class="breadcrumbs"><a href="#routes/${direction}">${icon('back',15)} ${d.title}</a><span>/</span><a href="#atlas">知识地图</a><span>/</span><span>${c.title}</span></div>
 <div class="guide-layout"><aside class="guide-toc"><p class="eyebrow">本篇内容</p><nav aria-label="文章章节">${sections.map(([key,label],i)=>`<button data-scroll="${key}"><span>${String(i+1).padStart(2,'0')}</span>${label}</button>`).join('')}</nav></aside>
 <article class="guide-article"><header class="article-header"><div><p class="eyebrow">${safeText(c.en)}</p><h1>${safeText(c.title)}</h1></div><span class="article-number">${c.index}</span></header><p class="article-deck">${safeText(c.summary)}</p><div class="article-meta"><span>${icon('map',14)} ${safeText(c.jurisdiction)}</span></div>
 <section id="section-what"><div class="section-title"><span>01</span><h2>它是什么</h2></div><div class="fact-block"><p>${safeText(c.fact)}</p><button class="source-link" data-scroll="sources">查看依据 ${icon('diagonal',13)}</button></div></section>
 <section id="section-why"><div class="section-title"><span>02</span><h2>为什么存在</h2></div><p>${safeText(c.why)}</p></section>
 <section id="section-mechanism"><div class="section-title"><span>03</span><h2>怎样运作</h2><span class="evidence-badge">简化说明</span></div><p>${safeText(c.mechanism)}</p><div class="related-inline"><span>在图中连接</span>${related.map(nodeLink).join('')}</div></section>
 <section id="section-flow"><div class="section-title"><span>04</span><h2>输入 → 过程 → 输出</h2></div><div class="io-diagram"><div><span class="eyebrow">输入</span>${c.inputs.map(t=>`<p>${safeText(t)}</p>`).join('')}</div><span class="io-arrow">→</span><div class="io-process"><span class="eyebrow">过程</span>${icon(c.icon,28)}<p>${safeText(c.process)}</p></div><span class="io-arrow">→</span><div><span class="eyebrow">输出</span>${c.outputs.map(t=>`<p>${safeText(t)}</p>`).join('')}</div></div><p class="diagram-note">概念示意 · 省略具体工艺与地区差异</p></section>
 ${['prices','transport'].includes(id)?experimentHTML():''}
 <section id="section-dependencies"><div class="section-title"><span>05</span><h2>相关基础</h2></div><div class="node-link-list">${c.recommendedBefore.length?c.recommendedBefore.map(nodeLink).join(''):'<span class="muted">这一节可以直接阅读。</span>'}</div></section>
 <div class="failure-pair"><section id="section-failures"><div class="section-title"><span>06</span><h2>可能怎样出问题</h2></div><p>${safeText(c.failure)}</p></section><section id="section-traps"><div class="section-title"><span>07</span><h2>最容易误解什么</h2></div><p>${safeText(c.trap)}</p></section></div>
 <section id="section-suggestedAfter"><div class="section-title"><span>08</span><h2>理解它以后</h2></div><div class="node-link-list">${(next.length?next:concepts.filter(x=>related.includes(x.id))).slice(0,4).map(x=>nodeLink(x.id)).join('')}</div></section>
 <section id="section-quest" class="field-question"><p class="eyebrow">想一想</p><h2>${safeText(c.question)}</h2>${exercise?`<a class="button primary" href="#quests/${exercise.id}">${exercise.title} ${icon('arrow')}</a>`:''}</section>
 <section id="section-sources"><div class="section-title"><span>10</span><h2>资料来源</h2></div><div class="source-list">${ownSources.map((s,i)=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer"><span class="source-number">${String(i+1).padStart(2,'0')}</span><div><small>${safeText(s.publisher)}</small><h3>${safeText(s.title)}</h3><p>${safeText(s.scope)}</p></div>${icon('diagonal',18)}</a>`).join('')}</div></section>
 ${learning.length?`<section class="chapter-related"><h2>和生活有什么关系</h2>${learning.map(item=>`<a href="${readingUrl(item.ref)}"><strong>${readingInfo(item.ref)!.title} ${icon('diagonal',16)}</strong><p>${item.reason}</p></a>`).join('')}</section>`:''}<a class="guide-return" href="${onward.path}">${safeText(onward.title)} ${icon('arrow',18)}</a><a class="text-link" href="#routes/${direction}">返回「${d.title}」</a></article></div></main>`;
}
export function mountGuide(root: HTMLElement,signal: AbortSignal):void {
 root.addEventListener('click',e=>{const button=(e.target as Element).closest<HTMLElement>('[data-scroll]');if(!button)return;const section=root.querySelector<HTMLElement>(`#section-${button.dataset.scroll}`);if(!section)return;section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});section.setAttribute('tabindex','-1');section.focus({preventScroll:true});},{signal});
 if(root.querySelector('#shock'))mountExperiment(root,signal);
 if(!root.querySelector('.guide-toc'))return;
 const nav=must(root,'.guide-toc');
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){nav.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.scroll===e.target.id.replace('section-','')));}}, {rootMargin:'-15% 0px -65% 0px',threshold:0});
 root.querySelectorAll('section[id]').forEach(e=>observer.observe(e));signal.addEventListener('abort',()=>observer.disconnect(),{once:true});
}
