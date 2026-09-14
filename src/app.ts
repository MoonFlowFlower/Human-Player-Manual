import { concepts, recipes, sources } from './content.js';
import { decodeProgress, emptyProgress, conceptIndex, safeText } from './model.js';
import { homePage, icon, must, announce, pageHeader } from './ui.js';
import { atlasPage, mountAtlas } from './atlas.js';
import { guidePage, mountGuide } from './guide.js';
import { questsPage, mountQuests } from './quests.js';
import { installSearch } from './search.js';
import type { AppState, SearchResult } from './types.js';

const STORAGE_KEY='earth-player-manual.v1';
const state:AppState={progress:emptyProgress(),atlas:{selected:'food',category:'all',recipe:'',scale:1,dx:0,dy:0},storageAvailable:true};
try {state.progress=decodeProgress(localStorage.getItem(STORAGE_KEY));}catch{state.storageAvailable=false;}
const root=must<HTMLElement>(document,'#app');
let controller=new AbortController();let lastRoute='';
function save():void {try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state.progress));}catch{if(state.storageAvailable)announce('无法保存到浏览器；当前会话仍可继续。');state.storageAvailable=false;}}
function header(route:string):string {
 const nav=[['atlas','01','世界地图'],['guide/food','02','系统说明'],['quests','03','现场任务']];
 return `<header class="site-header"><a class="brand" href="#home" aria-label="EARTH 首页">${icon('compass',30)}<span>EARTH</span><small>PLAYER<br>MANUAL</small></a><nav class="main-nav" aria-label="主导航">${nav.map(([path,n,t])=>`<a href="#${path}" ${route.startsWith(path.split('/')[0])?'aria-current="page"':''}><span>${n}</span>${t}</a>`).join('')}</nav><button class="search-trigger" data-search aria-label="搜索系统或现实问题">${icon('search',18)}<span>搜索世界</span><kbd>⌘ / Ctrl K</kbd></button></header>`;
}
function footer():string {return `<footer class="site-footer"><a href="#home" class="footer-brand">EARTH <span>— PLAYER MANUAL</span></a><span>先理解关系，再增加知识。</span><div><span class="local-status"><i></i>${state.storageAvailable?'进度仅保存在此浏览器':'当前环境无法持久保存 · 会话可用'}</span><a href="#about">关于 / 来源 ${icon('diagonal',13)}</a><span class="mono">ED. 001</span></div></footer>`;}
function aboutPage():string {return `<main id="main" class="about-page page" tabindex="-1">${pageHeader('COLOPHON / 关于这本手册','一本还在绘制的世界手册。','不是全世界的答案。<br>是开始理解关系的一种方式。')}<div class="about-copy"><h2>第一版只做一条完整路线。</h2><p>12 个互联系统，2 个预设问题配方，3 个现场任务。没有账户、付费接口或云端笔记。搜索只覆盖已编辑的内容，不是实时 AI 或通用问答。</p><h2>事实、模型、解释与未知，分开标记。</h2><p>世界地图是编辑者组织的简化关系模型，不是每件真实食品的溯源记录，也不把所有联系伪装成“前置依赖”。价格实验使用自编假设，没有采用真实成本份额。资料链接核查日期：2026-09-14；不等于专业同行审查。</p><h2>记录探索，不制造“已学会”的错觉。</h2><p>打开条目记为已探索；教学判断通过与真实观察分别记录。现实观察只能标为本人报告，网站不会声称独立核验。知识条目始终可读。清除浏览器数据会删除本地进度；存储不可用时可在当前会话继续。</p><h2>第一版的边界。</h2><p>这里不提供个体医疗、法律、税务或投资指导。资料涉及地区时单独说明，不把某个地区的制度推广为普遍规则。当前内容规模下使用原生 TypeScript、SVG 与 CSS；没有重型三维运行时。</p><h2>资料来源</h2><div class="source-list">${sources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer"><div><small>${safeText(s.publisher)}</small><h3>${safeText(s.title)}</h3><p>${safeText(s.scope)}</p></div>${icon('diagonal',18)}</a>`).join('')}</div></div></main>`;}
function currentRoute():string {return location.hash.slice(1)||'home';}
function render(force=false):void {
 const route=currentRoute();if(route==='main'){must<HTMLElement>(document,'main').focus();return;}if(route===lastRoute&&!force)return;lastRoute=route;
 controller.abort();controller=new AbortController();
 const [view,id]=route.split('/');let page:string;
 if(view==='atlas')page=atlasPage(state);
 else if(view==='guide'){
  const concept=conceptIndex.get(id||'food');if(concept&&!state.progress.visited.includes(concept.id)){state.progress.visited.push(concept.id);save();}
  page=guidePage(id||'food');
 }else if(view==='quests')page=questsPage(id??'',state);
 else if(view==='about')page=aboutPage();
 else if(view==='home')page=homePage(state.progress);
 else page=guidePage('__not_found__');
 root.innerHTML=header(route)+page+footer();
 document.title=`${view==='atlas'?'世界地图':view==='guide'?(conceptIndex.get(id)?.title??'系统说明'):view==='quests'?'现场任务':view==='about'?'关于手册':'现实世界玩家手册'} — EARTH`;
 if(view==='atlas')mountAtlas(root,state,controller.signal);
 if(view==='guide')mountGuide(root,controller.signal);
 if(view==='quests')mountQuests(root,state,controller.signal,save,()=>render(true));
 window.scrollTo({top:0,behavior:'instant'});
}
function navigate(route:string):void {if(location.hash!==route)location.hash=route;render(true);root.querySelector<HTMLElement>('main')?.focus({preventScroll:true});}
function setRecipe(id:string):void {const recipe=recipes.find(r=>r.id===id);if(!recipe)return;state.atlas.recipe=id;state.atlas.category='all';state.atlas.selected=id==='bread'?'food':'prices';state.atlas.scale=1;state.atlas.dx=0;state.atlas.dy=0;}
const search=installSearch((item:SearchResult)=>{if(item.kind==='recipe'){setRecipe(item.id);navigate('#atlas');}else navigate(`#guide/${item.id}`);});
document.addEventListener('click',e=>{
 const target=e.target as Element;
 if(target.closest('[data-search]')){search.open();return;}
 const reset=target.closest('[data-reset-progress]');if(reset){if(window.confirm('只清除这本手册在当前浏览器中的学习记录与现场笔记？此操作无法撤销。')){state.progress=emptyProgress();save();navigate('#quests/trace');announce('本地学习记录已清除。');}return;}
 const recipe=target.closest<HTMLElement>('[data-recipe]');if(recipe){e.preventDefault();setRecipe(recipe.dataset.recipe!);navigate('#atlas');return;}
 if(target.closest('[data-clear-recipe]')){state.atlas.recipe='';render(true);return;}
 const homeNode=target.closest<HTMLElement>('[data-home-node]');if(homeNode){state.atlas.selected=homeNode.dataset.homeNode!;state.atlas.recipe='';}
 const anchor=target.closest<HTMLAnchorElement>('a[href^="#"]');if(anchor){if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();const href=anchor.getAttribute('href')!;if(href==='#main'){must<HTMLElement>(document,'main').focus();return;}navigate(href);}
});
window.addEventListener('hashchange',()=>render());
render();
// The graph, recipe search and guide use the same index; no parallel content copies.
if(concepts.length===0)announce('当前内容索引为空。');
