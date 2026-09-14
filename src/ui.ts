import { conceptIndex, safeText } from './model.js';
import { concepts, edges } from './content.js';
import type { Progress } from './types.js';

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
export function statusText(progress: Progress,id: string): string { return progress.visited.includes(id)?'已探索':'尚未探索'; }
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
    <text class="diagram-coordinate" x="58" y="55">SYSTEMS, NOT SILOS.</text><text class="diagram-coordinate" x="58" y="590">FIG. 01 — A WORLD IN A LOAF</text><text class="diagram-coordinate" x="848" y="590" text-anchor="end">N ↗</text>
  </svg>`;
}

export function homePage(progress: Progress): string {
 return `<main id="main" class="home" tabindex="-1">
   <section class="home-main"><div class="hero-copy">
     <p class="eyebrow"><span class="tiny-dot"></span> THE MISSING TUTORIAL</p>
     <h1>EARTH<span class="title-period">.</span></h1>
     <p class="hero-edition">A PLAYER’S MANUAL FOR THE REAL WORLD</p>
     <h2>世界的规则，<br>从此有迹可循。</h2>
     <p class="hero-description">你出生在这个世界，却没有收到说明书。<br>从熟悉的事物出发，看见隐藏的系统，<br>理解它们如何连接，也找到自己的下一步。</p>
     <div class="hero-actions"><a class="button primary" href="#atlas">展开世界地图 ${icon('arrow')}</a><a class="text-link" href="#quests/${progress.completed.length===0?'trace':progress.completed.length===1?'predict':'observe'}">${progress.completed.length?'继续你的探索':'从一块面包开始'} ${icon('diagonal',16)}</a></div>
     <div class="hero-stats"><span><b>12</b> 互联系统</span><span><b>03</b> 现场任务</span><span><b>01</b> 起始路线</span></div>
   </div><div class="hero-visual"><div class="plate-heading"><span>PLATE 001</span><span>THE EVERYDAY / RECONSIDERED</span></div>${homeDrawing()}<p class="diagram-caption"><span class="tiny-dot"></span> 一块面包的背后，藏着多少个世界？<span class="mono">EXPLORE THE CONNECTIONS ↗</span></p></div></section>
   <section class="home-route"><div class="route-section-index">01 <span>/ FIRST EXPEDITION</span></div><div class="route-intro"><h2>从餐桌开始，<br>读懂更大的世界。</h2><p>不必先学完整个世界。<br>跟着一个真实问题，走完一次发现。</p></div><div class="route-steps"><a href="#atlas" data-recipe="bread"><span>01</span><div><strong>展开关系</strong><small>食物从哪里来，又依赖什么？</small></div>${icon('diagonal')}</a><a href="#quests/predict"><span>02</span><div><strong>试着预测</strong><small>改变一个变量，看看影响如何传递。</small></div>${icon('diagonal')}</a><a href="#quests/observe"><span>03</span><div><strong>返回现实</strong><small>区分观察、推断和还不知道的部分。</small></div>${icon('diagonal')}</a></div></section>
 </main>`;
}
