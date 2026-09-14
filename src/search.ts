import { searchContent, safeText } from './model.js';
import { icon, must } from './ui.js';
import type { SearchResult } from './types.js';

export function installSearch(onChoose:(item:SearchResult)=>void):{open:()=>void} {
 const root=must(document,'#search-root');
 root.innerHTML=`<dialog id="search-dialog" aria-labelledby="search-title"><div class="search-heading"><span class="eyebrow" id="search-title">搜索章节或生活问题</span><button class="icon-button" id="search-close" aria-label="关闭搜索">${icon('close',20)}</button></div><div class="search-input-row">${icon('search',23)}<input id="search-input" role="combobox" aria-label="搜索章节或生活问题" aria-autocomplete="list" aria-expanded="true" aria-controls="search-results" placeholder="试试：睡不醒、看完记不住、食物变贵" autocomplete="off" spellcheck="false"></div><div id="search-results" role="listbox" aria-label="搜索结果"></div><div class="search-footer"><span>↑ ↓ 选择 &nbsp; ↵ 打开 &nbsp; ESC 关闭</span><span>只搜索手册中已有的内容</span></div></dialog>`;
 const dialog=must<HTMLDialogElement>(root,'#search-dialog'),input=must<HTMLInputElement>(root,'#search-input'),list=must(root,'#search-results');
 let results:SearchResult[]=[],active=0;
 const showActive=()=>{list.querySelectorAll<HTMLElement>('[role="option"]').forEach((el,i)=>{el.setAttribute('aria-selected',String(i===active));el.classList.toggle('active',i===active);});if(results.length){input.setAttribute('aria-activedescendant',`result-${active}`);list.querySelector(`#result-${active}`)?.scrollIntoView({block:'nearest'});}else input.removeAttribute('aria-activedescendant');};
 const render=()=>{
  results=searchContent(input.value);active=0;
  list.innerHTML=results.length?results.map((item,i)=>`<div role="option" id="result-${i}" aria-selected="${i===0}" data-result="${i}"><span class="result-icon">${icon(item.kind==='recipe'?'map':'book',22)}</span><div><strong>${safeText(item.title)}</strong><small>${safeText(item.sub)}</small></div><span class="result-kind">${item.kind==='recipe'?'问题':item.kind==='direction'?'方向':item.kind==='practice'?'练习':'阅读'}</span>${icon('arrow',16)}</div>`).join(''):`<div class="search-empty"><h2>没有找到相关内容</h2><p>换个具体说法，或回到学习路线看看。</p><button data-example="睡不醒">试试“睡不醒” ${icon('arrow',15)}</button><button id="search-routes">查看学习路线 ${icon('arrow',15)}</button></div>`;
  showActive();
 };
 const choose=(i:number)=>{const item=results[i];if(!item)return;dialog.close();onChoose(item);};
 const open=()=>{input.value='';render();if(!dialog.open)dialog.showModal();input.focus();};
 input.addEventListener('input',render);
 input.addEventListener('keydown',e=>{if(e.isComposing)return;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(results.length)active=(active+(e.key==='ArrowDown'?1:-1)+results.length)%results.length;showActive();}if(e.key==='Enter'){e.preventDefault();choose(active);}});
 list.addEventListener('click',e=>{const target=e.target as Element;if(target.closest('#search-routes')){dialog.close();onChoose({kind:'direction',id:'routes',title:'学习路线',sub:'',path:'#routes'});return;}const item=target.closest<HTMLElement>('[data-result]');if(item)choose(Number(item.dataset.result));const example=target.closest<HTMLElement>('[data-example]');if(example){input.value=example.dataset.example!;render();input.focus();}});
 must(root,'#search-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 document.addEventListener('keydown',e=>{if(e.isComposing)return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(dialog.open)dialog.close();else open();}});
 return {open};
}
