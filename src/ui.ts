import { conceptIndex, safeText } from './model.js';
import { concepts, edges } from './content.js';
import { directions } from './learning-content.js';
import { emptyLearning, locationLabel, validLearningLocation } from './learning-model.js';
import type { Progress, LearningProgress } from './types.js';

const iconPaths: Record<string,string> = {
  compass:'<circle cx="12" cy="12" r="8"/><path d="M12 0v7m0 10v7M0 12h7m10 0h7m-9-15-5 10-5 2 5-10z"/>',
  arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
  diagonal:'<path d="M6 18 18 6M6 6h12v12"/>',
  back:'<path d="M20 12H5m6-6-6 6 6 6"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  energy:'<path d="m14 2-9 12h6l-1 8 9-13h-6z"/>',
  water:'<path d="M12 2C10 6 5 11 5 15a7 7 0 0 0 14 0c0-4-5-9-7-13Z"/><path d="M8 15c0 2 1 3 3 3"/>',
  wheat:'<path d="M12 23V4m0 13c-6 0-7-4-7-6 5 0 7 2 7 6Zm0-6C7 11 6 7 6 5c5 0 6 2 6 6Zm0 9c6 0 7-4 7-6-5 0-7 2-7 6Zm0-9c5 0 6-4 6-6-5 0-6 2-6 6Zm0-7c-2-1-2-3 0-4 2 1 2 3 0 4Z"/>',
  factory:'<path d="M3 21V10l6 3V7l6 4V3h5v18ZM7 17h2m3 0h2m3 0h1"/>',
  box:'<path d="m3 7 9-5 9 5v11l-9 5-9-5Zm0 0 9 5 9-5M12 12v11M7.5 4.5l9 5"/>',
  truck:'<path d="M2 5h13v12H2Zm13 5h4l3 4v3h-7"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/>',
  store:'<path d="M3 9 12 3l9 6v12H3ZM8 21V11h8v10M8 15h8m-8 3h8"/>',
  shop:'<path d="M3 10v11h18V10M2 4h20l-2 6H4ZM8 21v-7h8v7"/>',
  people:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-4a6 6 0 0 1 12 0v4M17 5a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 5v2"/>',
  price:'<path d="M21 13 11 3H3v8l10 10Z"/><circle cx="7" cy="7" r="1"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
  bread:'<path d="M4 8c-3 0-3-5 1-5h14c4 0 4 5 1 5v13H4Z"/><path d="m8 7 2 4m4-4 2 4M8 17h8"/>',
  book:'<path d="M12 5c-3-2-7-2-10-1v16c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v16"/>',
  map:'<path d="m2 5 7-3 6 3 7-3v17l-7 3-6-3-7 3Zm7-3v17m6-14v17"/>',
  check:'<path d="m4 12 5 5L20 6"/>',
  plus:'<path d="M12 4v16M4 12h16"/>',
  minus:'<path d="M4 12h16"/>',
  reset:'<path d="M3 10a9 9 0 1 1 2 8M3 3v7h7"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="1"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 4v3"/>',
};
export function icon(name: string, size=20): string { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]??iconPaths.info}</svg>`; }
export function nodeLink(id: string): string { const c=conceptIndex.get(id); return c?`<a class="inline-node" href="#guide/${id}">${icon(c.icon,15)}${safeText(c.title)}${icon('diagonal',12)}</a>`:''; }
export function statusText(progress: Progress,id: string): string { return progress.visited.includes(id)?'曾打开':'未打开'; }
export function pageHeader(kicker: string,title: string,sub: string): string { return `<div class="page-heading"><div><p class="eyebrow">${kicker}</p><h1>${title}</h1></div><p class="heading-aside">${sub}</p></div>`; }
export function must<T extends Element = HTMLElement>(root: ParentNode, selector: string): T { const el=root.querySelector<T>(selector); if(!el) throw new Error(`Missing UI element: ${selector}`); return el; }
export function announce(message: string): void { const el=document.getElementById('toast'); if(!el) return; el.textContent=message; el.classList.add('visible'); window.setTimeout(()=>el.classList.remove('visible'),3200); }

export function homeDrawing(): string {
  let contours='';
  for(let j=0;j<21;j++) {
    const pts=[];
    for(let i=0;i<=180;i++) {
      const a=i/180*Math.PI*2;
      const r=85+j*9 + (11+j*.25)*Math.sin(a*3+.6) + 9*Math.cos(a*5+j*.10);
      pts.push(`${i?'L':'M'}${(445+Math.cos(a)*r*1.08).toFixed(1)},${(312+Math.sin(a)*r).toFixed(1)}`);
    }
    contours+=`<path d="${pts.join('')}Z"/>`;
  }
  const links=edges.filter(e=>e.type==='flow').map(e=>{
    const a=conceptIndex.get(e.from)!,b=conceptIndex.get(e.to)!;
    return `<path d="M${a.x} ${a.y} Q${(a.x+b.x)/2+25} ${(a.y+b.y)/2-25} ${b.x} ${b.y}"/>`;
  }).join('');
  return `<svg class="home-diagram" viewBox="0 0 930 650" aria-label="面包背后的互联系统，点击节点开始探索" role="img">
    <defs><pattern id="home-grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="currentColor" stroke-width=".5" opacity=".13"/></pattern></defs>
    <rect x="30" y="12" width="870" height="612" fill="url(#home-grid)"/>
    <g class="contours" fill="none" stroke="currentColor" stroke-width=".6">${contours}</g>
    <g class="orbit-guides" fill="none" stroke="currentColor" stroke-width=".8"><circle cx="445" cy="312" r="287" stroke-dasharray="2 8"/><path d="M445 8v616M10 312h900" stroke-dasharray="3 7"/><path d="M35 25h22m-11-11v22M867 25h22m-11-11v22M35 604h22m-11-11v22M867 604h22m-11-11v22"/></g>
    <g class="hero-flow" fill="none" stroke="currentColor" stroke-width="1.5">${links}</g>
    ${concepts.filter(c=>['energy','water','agriculture','processing','transport','retail','food'].includes(c.id)).map(c=>`<a href="#atlas" data-home-node="${c.id}" aria-label="探索${c.title}"><g class="hero-map-node ${c.id==='food'?'hero-food':''}" transform="translate(${c.x},${c.y})"><circle r="${c.id==='food'?43:23}"/><g transform="translate(-12,-12)">${icon(c.icon,24)}</g><text x="0" y="${c.id==='food'?64:44}" text-anchor="middle">${c.title}</text><text class="hero-label-en" x="0" y="${c.id==='food'?80:57}" text-anchor="middle">${c.en}</text></g></a>`).join('')}
    <text class="diagram-coordinate" x="58" y="55">生产与生活的联系</text><text class="diagram-coordinate" x="58" y="590">面包的相关环节</text><text class="diagram-coordinate" x="848" y="590" text-anchor="end">N ↗</text>
  </svg>`;
}

export function notFoundPage(): string {
 return `<main id="main" class="page not-found" tabindex="-1"><p class="eyebrow">页面未找到</p><h1>没有找到这一页</h1><p>链接可能不完整，或这一页已经移动。</p><div class="hero-actions"><a class="button primary" href="#routes">查看学习路线 ${icon('arrow')}</a><button class="button" data-search>搜索内容 ${icon('search')}</button></div></main>`;
}
export function routeBoard(): string {
 return `<div class="route-board"><div class="board-heading"><span>学习方向</span><span>从眼下需要的地方开始</span></div><ol class="direction-board">${directions.map((d,i)=>`<li class="direction-cell ${i<2?'foundation-direction':''}"><a class="direction-entry" href="#routes/${d.id}"><span class="direction-number">${d.number}</span><div><h2>${d.title}</h2><p>${d.summary}</p><small>${d.topics}</small></div>${icon('diagonal',18)}</a>${i===0?'<div class="direction-shortcuts"><a href="#learn/sleep?route=care">睡眠与休息 →</a><a href="#learn/meals?route=care">吃饭与活动 →</a></div>':i===1?'<div class="direction-shortcuts"><a href="#learn/practice?route=study">从看懂到会做 →</a><a href="#learn/memory?route=study">回忆与复习 →</a></div>':''}</li>`).join('')}</ol><p class="board-caption">生活基础和学习方法可以一起学，也可以直接选择其他方向。</p></div>`;
}
export function homePage(progress: Progress, learning: LearningProgress = emptyLearning()): string {
 const resume = validLearningLocation(learning.lastLocation);
 const legacy = !resume && progress.completed.length > 0;
 return `<main id="main" class="home foundation-home" tabindex="-1"><section class="foundation-hero"><div class="foundation-copy"><p class="eyebrow"><span class="tiny-dot"></span> EARTH — PLAYER MANUAL</p><h1>现实世界<br><span>玩家手册</span></h1><p class="foundation-deck">睡眠、学习、工作、人际关系……<br>把生活中重要的事，一件件弄明白。</p><div class="hero-actions"><a class="button primary" href="#routes">看看从哪里开始 ${icon('arrow')}</a><button class="text-link" data-search>查一个问题 ${icon('search',17)}</button></div>${resume?`<a class="resume-reading" href="#${resume}"><small>继续上次</small><strong>${safeText(locationLabel(resume))}</strong>${icon('arrow',18)}</a>`:legacy?'<a class="resume-reading" href="#quests"><small>之前的练习记录还在</small><strong>查看面包与价格练习 →</strong></a>':''}${learning.reviewLater?'<a class="review-reminder" href="#practice/recall">稍后复习：收起原文，试着回忆 →</a>':''}<div class="hero-margin-note"><span class="margin-rule"></span><p>先选一个具体问题。<br>读一读，再试一小步。</p></div></div>${routeBoard()}</section><section class="learning-invitation"><div><p class="eyebrow">可以在这里试一遍</p><h2>看懂了，<br>离开原文还能想起来吗？</h2></div><div><p>读一个简短例子，收起原文试着回忆。<br>对照遗漏，再换个情境用一次。</p><a class="button primary" href="#practice/recall">开始回忆练习 ${icon('arrow')}</a><a class="text-link" href="#learn/practice?route=study">先读「从看懂到会做」 ${icon('diagonal',16)}</a></div></section></main>`;
}
