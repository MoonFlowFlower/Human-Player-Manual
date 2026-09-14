import { concepts, sources } from './content.js';
import { conceptIndex, connected, safeText, unlocks } from './model.js';
import { icon, nodeLink, must } from './ui.js';
import { experimentHTML, mountExperiment } from './experiment.js';

const sections=[['what','是什么'],['why','为什么存在'],['mechanism','核心机制'],['flow','输入与输出'],['dependencies','前置理解'],['failures','如何出问题'],['traps','常见误解'],['unlocks','继续理解'],['quest','现场任务'],['sources','证据与来源']];
export function guidePage(id: string): string {
 const c=conceptIndex.get(id);
 if(!c)return `<main id="main" class="page not-found" tabindex="-1"><p class="eyebrow">UNMAPPED TERRITORY</p><h1>这片区域还没有收录。</h1><p>没有为未知条目生成一个看似完整的答案。</p><a class="button primary" href="#atlas">返回已绘制的地图 ${icon('arrow')}</a></main>`;
 const related=[...new Set(connected(c.id).map(e=>e.from===c.id?e.to:e.from))];
 const next=unlocks(c.id); const ownSources=sources.filter(s=>c.sources.includes(s.id));
 return `<main id="main" class="guide-page page" tabindex="-1"><div class="breadcrumbs"><a href="#atlas">${icon('back',15)} 返回世界地图</a><span>/</span><span>FIELD GUIDE</span><span>/</span><span>${c.index}</span></div>
 <div class="guide-layout"><aside class="guide-toc"><p class="eyebrow">IN THIS SYSTEM</p><nav aria-label="文章章节">${sections.map(([key,label],i)=>`<button data-scroll="${key}"><span>${String(i+1).padStart(2,'0')}</span>${label}</button>`).join('')}</nav><div class="toc-stamp">${icon('compass',38)}<span>不是记住一个词。<br>是看见它的位置。</span></div></aside>
 <article class="guide-article"><header class="article-header"><div><p class="eyebrow">${safeText(c.en)}</p><h1>${safeText(c.title)}</h1></div><span class="article-number">${c.index}</span></header><p class="article-deck">${safeText(c.summary)}</p><div class="article-meta"><span>${icon('map',14)} ${safeText(c.jurisdiction)}</span><span>链接核查 ${c.lastReviewed}</span></div>
 <section id="section-what"><div class="section-title"><span>01</span><h2>它是什么</h2></div><div class="fact-block"><span class="evidence-badge">FACT</span><p>${safeText(c.fact)}</p><button class="source-link" data-scroll="sources">查看依据 ${icon('diagonal',13)}</button></div></section>
 <section id="section-why"><div class="section-title"><span>02</span><h2>为什么存在</h2></div><p>${safeText(c.why)}</p></section>
 <section id="section-mechanism"><div class="section-title"><span>03</span><h2>真正驱动它的机制</h2><span class="evidence-badge">MODEL</span></div><p>${safeText(c.mechanism)}</p><div class="related-inline"><span>在图中连接</span>${related.map(nodeLink).join('')}</div></section>
 <section id="section-flow"><div class="section-title"><span>04</span><h2>输入 → 过程 → 输出</h2></div><div class="io-diagram"><div><span class="eyebrow">INPUTS</span>${c.inputs.map(t=>`<p>${safeText(t)}</p>`).join('')}</div><span class="io-arrow">→</span><div class="io-process"><span class="eyebrow">PROCESS</span>${icon(c.icon,28)}<p>${safeText(c.process)}</p></div><span class="io-arrow">→</span><div><span class="eyebrow">OUTPUTS</span>${c.outputs.map(t=>`<p>${safeText(t)}</p>`).join('')}</div></div><p class="diagram-note">概念示意 · 省略具体工艺与地区差异</p></section>
 ${['prices','transport'].includes(id)?experimentHTML():''}
 <section id="section-dependencies"><div class="section-title"><span>05</span><h2>先理解什么</h2></div><p class="small muted">建议的学习顺序，不是访问限制，也不与图中的物品流混为一谈。</p><div class="node-link-list">${c.prerequisites.length?c.prerequisites.map(nodeLink).join(''):'<span class="muted">没有必须先阅读的系统，可直接从这里开始。</span>'}</div></section>
 <div class="failure-pair"><section id="section-failures"><div class="section-title"><span>06</span><h2>可能怎样出问题</h2></div><p>${safeText(c.failure)}</p></section><section id="section-traps"><div class="section-title"><span>07</span><h2>最容易误解什么</h2></div><p>${safeText(c.trap)}</p></section></div>
 <section id="section-unlocks"><div class="section-title"><span>08</span><h2>理解它以后</h2></div><p>现在，你可以带着这个视角继续探索。</p><div class="node-link-list">${(next.length?next:concepts.filter(x=>related.includes(x.id))).slice(0,4).map(x=>nodeLink(x.id)).join('')}</div></section>
 <section id="section-quest" class="field-question"><p class="eyebrow">09 / FIELD QUEST</p><h2>${safeText(c.question)}</h2><p>能阅读一种解释，还不等于能把它用在新的情境中。</p><a class="button primary" href="#quests/${['prices','transport'].includes(id)?'predict':'trace'}">检验你的理解 ${icon('arrow')}</a></section>
 <section id="section-sources"><div class="section-title"><span>10</span><h2>证据与边界</h2></div><p class="small muted">FACT 为来源支持的概括；机制、关系线和练习是本站教学建模。链接已查阅，不代表整篇文章经过专业同行审查。</p><div class="source-list">${ownSources.map((s,i)=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer"><span class="source-number">${String(i+1).padStart(2,'0')}</span><div><small>${safeText(s.publisher)}</small><h3>${safeText(s.title)}</h3><p>${safeText(s.scope)}</p></div>${icon('diagonal',18)}</a>`).join('')}</div><div class="evidence-key"><span>FACT / 有来源的概括</span><span>MODEL / 简化机制</span><span>INTERPRETATION / 解释</span><span>UNCERTAINTY / 待验证</span></div></section>
 <a class="guide-return" href="#atlas">${icon('back',18)} 回到刚才的地图<span>KEEP CONNECTING</span></a></article></div></main>`;
}
export function mountGuide(root: HTMLElement,signal: AbortSignal):void {
 root.addEventListener('click',e=>{const button=(e.target as Element).closest<HTMLElement>('[data-scroll]');if(!button)return;const section=root.querySelector<HTMLElement>(`#section-${button.dataset.scroll}`);if(!section)return;section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});section.setAttribute('tabindex','-1');section.focus({preventScroll:true});},{signal});
 if(root.querySelector('#shock'))mountExperiment(root,signal);
 if(!root.querySelector('.guide-toc'))return;
 const nav=must(root,'.guide-toc');
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){nav.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.scroll===e.target.id.replace('section-','')));}}, {rootMargin:'-15% 0px -65% 0px',threshold:0});
 root.querySelectorAll('section[id]').forEach(e=>observer.observe(e));signal.addEventListener('abort',()=>observer.disconnect(),{once:true});
}
