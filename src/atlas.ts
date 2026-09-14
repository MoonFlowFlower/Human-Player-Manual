import { concepts, edges, categories, recipes } from './content.js';
import { conceptIndex, connected, suggestedAfter, safeText } from './model.js';
import { relatedReadings, readingInfo, readingUrl } from './learning-model.js';
import { icon, must, nodeLink, pageHeader, statusText } from './ui.js';
import type { AppState, AtlasState, Edge } from './types.js';

function isActiveEdge(e: Edge, state: AtlasState): boolean {
  const recipe=recipes.find(r=>r.id===state.recipe);
  return recipe ? recipe.nodes.includes(e.from)&&recipe.nodes.includes(e.to) : e.from===state.selected||e.to===state.selected;
}
function atlasSVG(state: AppState): string {
 const s=state.atlas, focus=conceptIndex.get(s.selected)!;
 const network=connected(s.selected).flatMap(e=>[e.from,e.to]);
 const recipe=recipes.find(r=>r.id===s.recipe);
 return `<svg id="atlas-svg" viewBox="0 0 930 610" aria-label="现实系统关系图。Tab 访问节点，回车选择。" xmlns="http://www.w3.org/2000/svg">
  <defs><pattern id="atlas-grid" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="currentColor" opacity=".22"/></pattern><marker id="edge-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="m1 1 8 4-8 4" fill="none" stroke="context-stroke" stroke-width="1.4"/></marker></defs>
  <rect class="graph-background" width="930" height="610" fill="url(#atlas-grid)"/>
  <g id="graph-transform" transform="translate(${s.dx},${s.dy}) translate(465 305) scale(${s.scale}) translate(-465 -305)">
    <g class="graph-coordinates"><path d="M70 70h790v480H70Z"/><text x="82" y="88">世界系统 · 关系示意</text><text x="800" y="535">N ↑</text></g>
    ${edges.map(e=>{const a=conceptIndex.get(e.from)!,b=conceptIndex.get(e.to)!;const dist=Math.hypot(b.x-a.x,b.y-a.y);const x2=b.x-(b.x-a.x)/dist*28,y2=b.y-(b.y-a.y)/dist*28;const bend=e.type==='feedback'?-75:18;return `<path class="graph-edge ${e.type} ${isActiveEdge(e,s)?'active':''}" d="M${a.x} ${a.y} Q${(a.x+x2)/2+bend} ${(a.y+y2)/2-20} ${x2} ${y2}" marker-end="url(#edge-arrow)"><title>${safeText(a.title)} → ${safeText(b.title)}：${safeText(e.label)}（${e.type==='flow'?'物品流':e.type==='support'?'支持关系':'可能的反馈'}）</title></path>`;}).join('')}
    ${concepts.map(c=>{const active=c.id===s.selected;const lit=recipe?recipe.nodes.includes(c.id):network.includes(c.id);const dim=s.category!=='all'&&c.category!==s.category;return `<g class="graph-node ${active?'selected':''} ${lit?'connected':''} ${dim?'dimmed':''} ${state.progress.visited.includes(c.id)?'visited':''}" transform="translate(${c.x} ${c.y})" role="button" tabindex="0" aria-label="选择 ${c.title}" aria-pressed="${active}" data-node="${c.id}">
      <circle class="node-hit" r="38" fill="transparent" stroke="none"/><circle class="node-halo" r="38"/><circle class="node-disc" r="25"/><g transform="translate(-11 -11)">${icon(c.icon,22)}</g><text class="node-index" x="34" y="-22">${c.index}</text><text class="node-title" text-anchor="middle" y="49">${c.title}</text><text class="node-en" text-anchor="middle" y="63">${c.en}</text>${state.progress.visited.includes(c.id)?'<circle class="visited-mark" cx="18" cy="-18" r="3.5"/>':''}
    </g>`;}).join('')}
  </g></svg><span class="sr-only">当前系统：${safeText(focus.title)}。</span>`;
}
function nodePanel(state: AppState): string {
 const c=conceptIndex.get(state.atlas.selected)!; const relations=connected(c.id); const next=suggestedAfter(c.id);
 return `<div class="panel-heading"><span class="eyebrow">系统 / ${c.index}</span><span class="status-label ${state.progress.visited.includes(c.id)?'explored':''}">${statusText(state.progress,c.id)}</span></div>
   <div class="panel-icon">${icon(c.icon,38)}</div><p class="eyebrow">${safeText(c.en)}</p><h2>${safeText(c.title)}</h2><p class="panel-summary">${safeText(c.summary)}</p>
   <div class="panel-section"><h3>相关基础</h3>${c.recommendedBefore.length?`<div class="node-link-list">${c.recommendedBefore.map(nodeLink).join('')}</div>`:'<p class="small muted">可直接从这里开始。</p>'}</div>
   <div class="panel-section"><h3>它与什么相连 <span>${relations.length} 处关联</span></h3><div class="panel-relations">${relations.slice(0,4).map(e=>{const other=conceptIndex.get(e.from===c.id?e.to:e.from)!;return `<button data-select="${other.id}"><span>${e.from===c.id?'→':'←'} ${safeText(other.title)}</span><small>${safeText(e.label)}</small></button>`;}).join('')}</div></div>
   ${next.length?`<p class="panel-next">继续理解 ${next.slice(0,2).map(x=>safeText(x.title)).join('、')} ${icon('arrow',14)}</p>`:''}
   <a class="button primary full" href="#guide/${c.id}">阅读运作方式 ${icon('arrow')}</a>${relatedReadings(`concept:${c.id}`).length?`<div class="panel-section"><h3>相关的生活问题</h3>${relatedReadings(`concept:${c.id}`).map(item=>`<a class="text-link" href="${readingUrl(item.ref)}">${safeText(readingInfo(item.ref)!.title)}</a>`).join('')}</div>`:''}`;
}
function mobileExplorer(state: AppState): string {
 const c=conceptIndex.get(state.atlas.selected)!;
 return `<div class="mobile-focus"><span class="eyebrow">当前系统 / ${c.index}</span><div class="focus-symbol">${icon(c.icon,42)}</div><strong>${safeText(c.title)}</strong><span class="mobile-focus-en">${safeText(c.en)}</span><a class="text-link mobile-read" href="#guide/${c.id}">阅读这个系统 ${icon('arrow',16)}</a></div><div class="mobile-links">${connected(c.id).map(e=>{const other=conceptIndex.get(e.from===c.id?e.to:e.from)!;return `<button data-select="${other.id}">${icon(other.icon,20)}<span><b>${safeText(other.title)}</b><small>${e.from===c.id?'影响':'依赖或受到影响'} · ${safeText(e.label)}</small></span>${icon('arrow',16)}</button>`;}).join('')}</div><label class="mobile-system-select">跳到任一系统<select id="mobile-node-select">${concepts.map(n=>`<option value="${n.id}" ${n.id===c.id?'selected':''}>${n.index} · ${n.title}</option>`).join('')}</select></label>`;
}
export function atlasPage(state: AppState): string {
 const recipe=recipes.find(r=>r.id===state.atlas.recipe);
 return `<main id="main" class="atlas-page page" tabindex="-1">${pageHeader('世界系统','知识地图','选一个事物，看看它依赖什么，<br>又会影响什么。')}
  <div class="recipe-strip"><span class="eyebrow">从一个问题出发</span>${recipes.map(r=>`<button class="recipe-trigger ${recipe?.id===r.id?'active':''}" data-recipe="${r.id}" aria-pressed="${recipe?.id===r.id}">${r.title} ${icon('diagonal',14)}</button>`).join('')}${recipe?'<button class="clear-recipe" data-clear-recipe aria-label="清除路线高亮">'+icon('close',16)+'</button>':''}</div>
  <div class="atlas-shell"><div class="map-side"><div class="atlas-filters" aria-label="高亮系统分类"><button data-category="all" class="${state.atlas.category==='all'?'active':''}" aria-pressed="${state.atlas.category==='all'}">全部系统</button>${categories.map(c=>`<button data-category="${c.id}" class="${state.atlas.category===c.id?'active':''}" aria-pressed="${state.atlas.category===c.id}">${c.title}</button>`).join('')}</div>
    <div class="desktop-map" tabindex="0" role="region" aria-label="可移动系统地图，方向键平移，加减键缩放"><div id="graph-container">${atlasSVG(state)}</div><div class="map-tools"><button data-zoom="out" aria-label="缩小地图">${icon('minus',18)}</button><span id="zoom-value" class="mono">${Math.round(state.atlas.scale*100)}%</span><button data-zoom="in" aria-label="放大地图">${icon('plus',18)}</button><button data-zoom="reset" aria-label="复位地图">${icon('reset',18)}</button></div><span class="map-instruction mono">拖动地图 · 选择节点</span></div>
    <div class="mobile-node-explorer">${mobileExplorer(state)}</div>
    <div class="map-legend"><span><i class="line-sample flow"></i>物品流动</span><span><i class="line-sample support"></i>支持关系</span><span><i class="line-sample feedback"></i>可能的反馈</span><span class="legend-model">关系示意 · 非实际溯源</span></div>
  </div><aside class="node-panel" aria-label="当前系统详情">${nodePanel(state)}</aside></div>
  ${recipe?`<div class="recipe-detail"><div><span class="eyebrow">相关问题</span><h2>${safeText(recipe.title)}</h2><p>${safeText(recipe.outcome)}</p></div><div class="recipe-chain">${recipe.nodes.map((id,i)=>`${i?(recipe.relationMode==='flow'?'<span class="chain-arrow">→</span>':'<span class="context-separator" aria-hidden="true">·</span>'):''}${nodeLink(id)}`).join('')}${recipe.relationMode==='context'?'<p class="recipe-context-note">共同帮助理解这个问题，不表示单一因果链。</p>':''}</div><a class="text-link" href="#quests/${recipe.id==='cost'?'predict':'trace'}">${recipe.id==='cost'?'试算价格变化':'比较运输与储存'} ${icon('arrow',16)}</a></div>`:''}
  <details class="text-graph"><summary>查看文字版关系 ${icon('plus',14)}</summary><p>每条联系的含义列在下面。这张图概括一般关系，不是一件商品的完整溯源记录。</p><div>${edges.map(e=>`<p>${nodeLink(e.from)} → ${nodeLink(e.to)}<span>${safeText(e.label)} · ${e.type==='flow'?'物品流动':e.type==='support'?'支持关系':'可能的反馈'}</span></p>`).join('')}</div></details>
 </main>`;
}
export function mountAtlas(root: HTMLElement,state: AppState,signal: AbortSignal): void {
 const redraw=()=>{
   must(root,'#graph-container').innerHTML=atlasSVG(state);
   must(root,'.node-panel').innerHTML=nodePanel(state);
   must(root,'.mobile-node-explorer').innerHTML=mobileExplorer(state);
   root.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(b=>{const active=b.dataset.category===state.atlas.category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 };
 const select=(id:string,keyboard=false)=>{if(!conceptIndex.has(id))return;state.atlas.selected=id;redraw();if(keyboard)root.querySelector<SVGElement>(`[data-node="${id}"]`)?.focus();};
 root.addEventListener('click',e=>{
   const target=e.target as Element; const node=target.closest<HTMLElement>('[data-node],[data-select]');
   if(node){select(node.dataset.node??node.dataset.select!);return;}
   const cat=target.closest<HTMLElement>('[data-category]');if(cat){state.atlas.category=cat.dataset.category!;redraw();return;}
   const zoom=target.closest<HTMLElement>('[data-zoom]'); if(zoom)changeZoom(zoom.dataset.zoom!);
 },{signal});
 root.addEventListener('change',e=>{const target=e.target as HTMLSelectElement;if(target.id==='mobile-node-select'){select(target.value);must<HTMLSelectElement>(root,'#mobile-node-select').focus({preventScroll:true});}},{signal});
 const applyTransform=()=>{
   const s=state.atlas; must(root,'#graph-transform').setAttribute('transform',`translate(${s.dx},${s.dy}) translate(465 305) scale(${s.scale}) translate(-465 -305)`);
   must(root,'#zoom-value').textContent=`${Math.round(s.scale*100)}%`;
 };
 const changeZoom=(kind:string)=>{if(kind==='reset'){state.atlas.scale=1;state.atlas.dx=0;state.atlas.dy=0;}else state.atlas.scale=Math.max(.65,Math.min(1.8,Math.round((state.atlas.scale+(kind==='in'?.15:-.15))*100)/100));applyTransform();};
 const map=must<HTMLElement>(root,'.desktop-map');
 let drag: {x:number;y:number;dx:number;dy:number;pointer:number}|null=null;
 map.addEventListener('pointerdown',e=>{if((e.target as Element).closest('[data-node],button'))return;drag={x:e.clientX,y:e.clientY,dx:state.atlas.dx,dy:state.atlas.dy,pointer:e.pointerId};map.setPointerCapture(e.pointerId);map.classList.add('dragging');},{signal});
 map.addEventListener('pointermove',e=>{if(!drag)return;const ratio=930/map.clientWidth;state.atlas.dx=Math.max(-600,Math.min(600,drag.dx+(e.clientX-drag.x)*ratio));state.atlas.dy=Math.max(-400,Math.min(400,drag.dy+(e.clientY-drag.y)*ratio));applyTransform();},{signal});
 const endDrag=()=>{drag=null;map.classList.remove('dragging');};
 map.addEventListener('pointerup',endDrag,{signal});map.addEventListener('pointercancel',endDrag,{signal});map.addEventListener('lostpointercapture',endDrag,{signal});
 map.addEventListener('keydown',e=>{
   const n=(e.target as Element).closest<HTMLElement>('[data-node]');
   if(n&&(e.key==='Enter'||e.key===' ')){e.preventDefault();select(n.dataset.node!,true);return;}
   if(e.target!==map)return;
   const shifts:Record<string,[number,number]>={ArrowLeft:[35,0],ArrowRight:[-35,0],ArrowUp:[0,35],ArrowDown:[0,-35]};
   if(shifts[e.key]){e.preventDefault();state.atlas.dx+=shifts[e.key][0];state.atlas.dy+=shifts[e.key][1];applyTransform();}
   if(['+','=','-','0'].includes(e.key)){e.preventDefault();changeZoom(e.key==='0'?'reset':e.key==='-'?'out':'in');}
 },{signal});
}
