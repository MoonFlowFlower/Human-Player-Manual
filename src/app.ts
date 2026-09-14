import { recipes, sources } from './content.js';
import { foundationSources } from './learning-content.js';
import { decodeProgress, emptyProgress, conceptIndex, safeText } from './model.js';
import { chapterIndex, decodeLearning, emptyLearning, LEARNING_STORAGE_KEY, LEGACY_STORAGE_KEY, parseLocation, validLearningLocation } from './learning-model.js';
import { homePage, icon, must, announce, pageHeader, notFoundPage } from './ui.js';
import { atlasPage, mountAtlas } from './atlas.js';
import { guidePage, mountGuide } from './guide.js';
import { questsPage, mountQuests } from './quests.js';
import { routesPage, chapterPage, mountLearning } from './learning-ui.js';
import { practicePage, mountPractice } from './practice.js';
import { installSearch } from './search.js';
import type { AppState, SearchResult } from './types.js';

const state: AppState = {progress:emptyProgress(),learning:emptyLearning(),atlas:{selected:'energy',category:'all',recipe:'',scale:1,dx:0,dy:0},storageAvailable:true};
try {
 state.progress=decodeProgress(localStorage.getItem(LEGACY_STORAGE_KEY));
 state.learning=decodeLearning(localStorage.getItem(LEARNING_STORAGE_KEY));
} catch {state.storageAvailable=false;}
const root=must<HTMLElement>(document,'#app');
let controller=new AbortController(),lastRoute='';
function storageFailed(): void {
 if(state.storageAvailable)announce('浏览器无法保存记录；当前会话仍可继续，关闭页面后可能丢失。');
 state.storageAvailable=false;
 const status=document.querySelector('.local-status');
 if(status)status.textContent='记录暂存于当前会话，关闭后可能丢失';
}
function saveLearning(): void {
 try {localStorage.setItem(LEARNING_STORAGE_KEY,JSON.stringify(state.learning));} catch {storageFailed();}
}
function saveLegacy(): void {
 try {
  // Preserve unrecognized legacy note fields; only explicit reset discards them.
  const text=localStorage.getItem(LEGACY_STORAGE_KEY),old:unknown=text?JSON.parse(text):null;
  const previous=old&&typeof old==='object'&&!Array.isArray(old)?old as Record<string,unknown>:{};
  if(previous.version!==undefined&&previous.version!==1){storageFailed();return;}
  const notes=previous.notes&&typeof previous.notes==='object'&&!Array.isArray(previous.notes)?previous.notes as Record<string,unknown>:{};
  localStorage.setItem(LEGACY_STORAGE_KEY,JSON.stringify({...previous,...state.progress,notes:{...notes,...state.progress.notes}}));
 } catch {storageFailed();}
}
function header(route: string): string {
 const {view}=parseLocation(route);
 const nav=[['routes','学习路线',view==='routes'||view==='learn'||view==='home'],['atlas','知识地图',view==='atlas'||view==='guide'],['practice','小练习',view==='practice'||view==='quests']];
 return `<header class="site-header"><a class="brand" href="#home" aria-label="现实世界玩家手册首页">${icon('compass',30)}<span>EARTH</span><small>PLAYER<br>MANUAL</small></a><nav class="main-nav" aria-label="主导航">${nav.map(([path,title,current])=>`<a href="#${path}" ${current?'aria-current="page"':''}>${title}</a>`).join('')}</nav><button class="search-trigger" data-search aria-label="搜索章节或生活问题">${icon('search',18)}<span>搜索</span><kbd>Ctrl / ⌘ K</kbd></button></header>`;
}
function footer(): string {
 return `<footer class="site-footer"><a href="#home" class="footer-brand">EARTH <span>— PLAYER MANUAL</span></a><div><span class="local-status"><i></i>${state.storageAvailable?'阅读与练习记录保存在此浏览器':'记录暂存于当前会话，关闭后可能丢失'}</span><a href="#about">关于与资料来源 ${icon('diagonal',13)}</a><a href="#privacy">隐私说明</a></div></footer>`;
}
function privacyPage(): string {
 return `<main id="main" class="about-page page" tabindex="-1">${pageHeader('关于这本手册','隐私说明','阅读不需要账户。')}<div class="about-copy"><h2>记录保存在什么地方？</h2><p>阅读状态、练习回答和可选笔记保存在你正在使用的浏览器中，不由本网站上传或同步。换浏览器或设备不会自动带上这些记录。清除浏览器数据会删除它们。</p><p>浏览器禁用存储、隐私模式限制或空间不足时，记录可能只能留在当前会话。共用设备上的其他使用者可能看到本地记录；不要填写病史、住址、证件或账户信息。</p><h2>哪些操作会联网？</h2><p>在线访问时，GitHub Pages 等托管服务会收到正常的网页访问请求。点击外部资料来源，会打开对应机构的网站，并适用对方的隐私规则。本站没有加入统计追踪、广告或 AI 问答接口。</p><h2>怎样删除记录？</h2><p>睡眠记录旁可以单独删除那条笔记；旧面包练习可以单独重置。下面的操作会删除本手册在此浏览器中的全部阅读、练习和笔记记录，不影响浏览器的其他网站。</p><button class="button" data-reset-all>删除全部本地记录</button><p class="small muted">操作前会再确认一次。删除后无法通过本站恢复。</p><a class="text-link" href="#routes">返回学习路线 ${icon('arrow',16)}</a></div></main>`;
}
function aboutPage(): string {
 return `<main id="main" class="about-page page" tabindex="-1">${pageHeader('EARTH — PLAYER MANUAL','关于这本手册','理解生活，也理解世界怎样运转。')}<div class="about-copy"><h2>从哪里开始？</h2><p>学习路线帮助你选问题，知识地图帮助你看事物之间的联系。基础章节面向普通成年读者；已有世界系统内容以食物、生产与价格为例。其他主题会逐步补充。</p><h2>怎样使用这些内容？</h2><p>先读一个眼前需要的问题，再选择做练习或继续阅读。练习完成只记录这次操作，不代表长期掌握。生活记录不能用来诊断或证明健康问题已解决。</p><h2>资料与适用范围</h2><p>健康和学习方法的关键说法附有来源。案例、地图关系和价格实验经过简化；价格实验的成本份额为自编假设，不是实际市场数据。涉及地区制度的资料在来源说明中标明范围。</p><p>本轮新增基础章节的资料查阅日期为 2026-09-14。这表示编写时查阅了所列内容，不等于医疗或其他专业审核。本手册不提供个体诊断、处方或法律结论。</p><a class="text-link" href="#privacy">阅读隐私与本地记录说明 ${icon('arrow',16)}</a><h2>基础章节的资料</h2><div class="source-list">${foundationSources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer"><div><small>${safeText(s.publisher)}</small><h3>${safeText(s.title)}</h3><p>${safeText(s.scope)}</p></div>${icon('diagonal',18)}</a>`).join('')}</div><h2>世界系统的资料</h2><div class="source-list">${sources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer"><div><small>${safeText(s.publisher)}</small><h3>${safeText(s.title)}</h3><p>${safeText(s.scope)}</p></div>${icon('diagonal',18)}</a>`).join('')}</div></div></main>`;
}
function currentRoute(): string {return location.hash.slice(1)||'home';}
function render(force=false): void {
 const route=currentRoute();if(route==='main'){root.querySelector<HTMLElement>('main')?.focus();return;}if(route===lastRoute&&!force)return;lastRoute=route;
 controller.abort();controller=new AbortController();
 const parsed=parseLocation(route),id=parsed.id;let view=parsed.view,page:string;
 if(view==='guide'&&!id)view='routes';
 if(view==='atlas')page=atlasPage(state);
 else if(view==='routes')page=routesPage(id,state);
 else if(view==='learn')page=chapterPage(id,parsed.direction,state);
 else if(view==='guide'){
  const c=conceptIndex.get(id);
  if(c&&!state.progress.visited.includes(id)){state.progress.visited.push(id);saveLegacy();}
  page=guidePage(id,parsed.direction);
 }else if(view==='quests')page=questsPage(id,state);
 else if(view==='practice')page=practicePage(id,state);
 else if(view==='about')page=aboutPage();
 else if(view==='privacy')page=privacyPage();
 else if(view==='home')page=homePage(state.progress,state.learning);
 else page=notFoundPage();
 const remember=validLearningLocation(route);
 if(remember&&state.learning.lastLocation!==remember){state.learning.lastLocation=remember;saveLearning();}
 root.innerHTML=header(view===parsed.view?route:view)+page+footer();
 const title=view==='atlas'?'知识地图':view==='routes'?'学习路线':view==='learn'?(chapterIndex.get(id)?.title??'页面未找到'):view==='guide'?(conceptIndex.get(id)?.title??'页面未找到'):view==='quests'||view==='practice'?'小练习':view==='about'?'关于手册':view==='privacy'?'隐私说明':'现实世界玩家手册';
 document.title=`${title} — EARTH`;
 if(view==='atlas')mountAtlas(root,state,controller.signal);
 if(view==='guide')mountGuide(root,controller.signal);
 if(view==='learn')mountLearning(root,state,controller.signal,saveLearning);
 if(view==='quests')mountQuests(root,state,controller.signal,saveLegacy,()=>render(true));
 if(view==='practice')mountPractice(root,state,controller.signal,saveLearning,()=>render(true));
 window.scrollTo({top:0,behavior:'instant'});
}
function navigate(route: string): void {if(location.hash!==route)location.hash=route;render(true);root.querySelector<HTMLElement>('main')?.focus({preventScroll:true});}
function setRecipe(id: string): void {
 const recipe=recipes.find(r=>r.id===id);if(!recipe)return;
 state.atlas.recipe=id;state.atlas.category='all';state.atlas.selected=id==='bread'?'food':'prices';state.atlas.scale=1;state.atlas.dx=0;state.atlas.dy=0;
}
const search=installSearch((item:SearchResult)=>{
 if(item.kind==='recipe'){setRecipe(item.id);navigate('#atlas');}
 else navigate(item.path??`#guide/${item.id}`);
});
document.addEventListener('click',e=>{
 const target=e.target as Element;
 if(target.closest('[data-search]')){search.open();return;}
 if(target.closest('[data-reset-all]')){
  if(!window.confirm('删除本手册的全部本地阅读、练习和笔记记录？此操作无法撤销。'))return;
  state.progress=emptyProgress();state.learning=emptyLearning();
  try {localStorage.removeItem(LEGACY_STORAGE_KEY);localStorage.removeItem(LEARNING_STORAGE_KEY);}catch{storageFailed();}
  navigate('#home');announce('当前会话的记录已清除；浏览器存储可用时，本地记录也已删除。');return;
 }
 if(target.closest('[data-reset-progress]')){
  if(!window.confirm('只重置面包与价格练习及其笔记？基础章节、回忆练习和睡眠记录会保留。'))return;
  state.progress=emptyProgress();
  try {localStorage.setItem(LEGACY_STORAGE_KEY,JSON.stringify(state.progress));}catch{storageFailed();}
  navigate('#quests/trace');announce('面包与价格练习记录已重置。');return;
 }
 const recipe=target.closest<HTMLElement>('[data-recipe]');if(recipe){e.preventDefault();setRecipe(recipe.dataset.recipe!);navigate('#atlas');return;}
 if(target.closest('[data-clear-recipe]')){state.atlas.recipe='';render(true);return;}
 const homeNode=target.closest<HTMLElement>('[data-home-node]');if(homeNode){state.atlas.selected=homeNode.dataset.homeNode!;state.atlas.recipe='';}
 const anchor=target.closest<HTMLAnchorElement>('a[href^="#"]');
 if(anchor){if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();const href=anchor.getAttribute('href')!;if(href==='#main'){root.querySelector<HTMLElement>('main')?.focus();return;}navigate(href);}
});
window.addEventListener('hashchange',()=>{render();root.querySelector<HTMLElement>('main')?.focus({preventScroll:true});});
render();
