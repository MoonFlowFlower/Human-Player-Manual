import { questOrder, questTitles } from './content.js';
import { canComplete, safeText, projectPrice } from './model.js';
import { icon, must, nodeLink, pageHeader } from './ui.js';
import { experimentHTML, mountExperiment } from './experiment.js';
import type { AppState } from './types.js';

function questBody(id:string,state:AppState):string {
 if(!canComplete(id,state.progress.completed))return `<div class="locked-quest">${icon('lock',40)}<p class="eyebrow">ONE CONNECTION AT A TIME</p><h2>先完成前一步的验证。</h2><p>这条路线按观察 → 预测 → 应用展开。所有知识仍可自由阅读，不会被锁住。</p><a class="button primary" href="#quests/${questOrder[state.progress.completed.length]??'trace'}">继续当前任务 ${icon('arrow')}</a><a class="text-link" href="#guide/information">先阅读信息与证据 ${icon('diagonal',15)}</a></div>`;
 if(id==='trace')return `<p class="eyebrow">QUEST 01 / TRACE</p><h2>面包已经做好。<br>为什么你还吃不到？</h2><p class="quest-lead">想象面包在另一座城市刚刚出炉，而你要到明天早晨才需要它。<br>从“那里有”，到“我需要时这里有”，中间还缺什么？</p><div class="quest-route">${['agriculture','processing','transport','storage','retail'].map(nodeLink).join('<span>→</span>')}</div><p class="small muted">上面是可以随时打开的系统说明。不熟悉的环节，先点进去看看。</p>
 <form id="trace-form"><fieldset><legend>运输和储存，分别在解决什么问题？</legend><label class="answer"><input type="radio" name="answer" value="price" required><span>只是为了把价格抬高</span></label><label class="answer"><input type="radio" name="answer" value="space-time"><span>运输连接地点，储存连接时间</span></label><label class="answer"><input type="radio" name="answer" value="forever"><span>把任何食物都变成永远不会坏的商品</span></label></fieldset><button class="button primary" type="submit">检验判断 ${icon('arrow')}</button></form><div id="quest-feedback" class="quest-feedback" role="status" aria-live="polite">${state.progress.completed.includes('trace')?feedbackHTML('trace'):''}</div>`;
 if(id==='predict')return `<p class="eyebrow">QUEST 02 / PREDICT</p><h2>局部变化，<br>不等于整体同比变化。</h2><p class="quest-lead">先做一个预测，再揭示模型结果。注意：你正在检验一个简化机制，不是在预测真实物价。</p>${experimentHTML(true)}
 <form id="predict-form"><fieldset><legend>按当前假设，模型输出应是多少？</legend><div id="prediction-options">${predictionOptions(50,100)}</div></fieldset><button class="button primary" type="submit">检验预测 ${icon('arrow')}</button></form><div id="quest-feedback" class="quest-feedback" role="status" aria-live="polite">${state.progress.completed.includes('predict')?feedbackHTML('predict'):''}</div>`;
 const n=state.progress.notes;
 return `<p class="eyebrow">QUEST 03 / OBSERVE</p><h2>把模型放下。<br>看一眼真实的世界。</h2><p class="quest-lead">找一件家里已有的包装食品，只观察包装，不必购买、拆开或食用。用三句话，分开你看到的、推断的、还不知道的。</p><div class="observation-note">${icon('info',20)}<p>不填写姓名、住址或订单号。内容只尝试保存在当前浏览器，不上传。网站不能独立核验你的实际观察。</p></div><form id="observe-form"><label class="field-label" for="observation">我确实观察到 <span>OBSERVATION</span></label><textarea id="observation" name="observe" minlength="6" maxlength="1600" required placeholder="例如：包装上印有生产商名称和地址。">${safeText(n.observe??'')}</textarea><label class="field-label" for="inference">我的推断是 <span>INTERPRETATION</span></label><textarea id="inference" name="inference" minlength="6" maxlength="1600" required placeholder="例如：它可能经过运输与零售，但我没有看到完整路线。">${safeText(n.inference??'')}</textarea><label class="field-label" for="unknown">我仍然不知道 <span>UNCERTAINTY</span></label><textarea id="unknown" name="unknown" minlength="6" maxlength="1600" required placeholder="例如：原料究竟来自哪里？需要进一步查哪些记录？">${safeText(n.unknown??'')}</textarea><label class="observation-check"><input type="checkbox" name="ack" required><span>我理解：包装地址不等于原料产地；这份观察仅由我本人报告。</span></label><button class="button primary" type="submit">保存观察，完成路线 ${icon('arrow')}</button></form><div id="quest-feedback" class="quest-feedback" role="status" aria-live="polite"></div>`;
}
function predictionOptions(shock:number,pass:number):string {
 const value=projectPrice(shock,pass), naive=100+shock;
 const wrong1=naive!==value?naive:value+10;
 const wrong2=100!==value&&100!==wrong1?100:value+20;
 return `<label class="answer"><input type="radio" name="prediction" value="${wrong1}" required><span>${wrong1}：把一个环节的变化直接应用于整体</span></label><label class="answer"><input type="radio" name="prediction" value="${value}"><span>${value}：只改变受影响的那一部分</span></label><label class="answer"><input type="radio" name="prediction" value="${wrong2}"><span>${wrong2}：忽略当前份额与传递条件</span></label>`;
}
function feedbackHTML(id:string):string {
 return `<div class="feedback-success">${icon('check',24)}<div><strong>${id==='trace'?'判断成立。你找到了两种不同的连接。':'预测成立。你分清了局部与整体。'}</strong><p>${id==='trace'?'运输把商品从一个地点带到另一个地点；储存把可用时间延伸到之后。它们并不保证食物永不变质。':'结果只在给定份额与传递假设下成立。真实价格还可能受需求、替代方案和时滞等影响。'}</p><a class="text-link" href="#quests/${id==='trace'?'predict':'observe'}">进入下一步 ${icon('arrow',16)}</a></div></div>`;
}
function completionHTML(state:AppState):string {
 return `<div class="quest-complete"><div class="completion-stamp">${icon('compass',55)}<span>FIRST EXPEDITION<br>COMPLETED</span></div><p class="eyebrow">A SMALL THING. A BIGGER WORLD.</p><h1>你已经看见，<br>一块面包之外的世界。</h1><p>从一个物品，展开一张关系图；<br>从一种解释，走到可以检验的判断。</p><div class="completion-evidence"><span>${icon('check',18)} 两次教学判断已通过</span><span>${icon('info',18)} 现实观察：本人报告，未独立核验</span></div><details class="saved-observation"><summary>查看我的现场笔记 ${icon('plus',16)}</summary>${[['observe','观察'],['inference','推断'],['unknown','未知']].map(([k,t])=>`<p><b>${t}</b>${safeText(state.progress.notes[k]??'')}</p>`).join('')}</details><div class="next-expedition"><p class="eyebrow">NEXT / NOT MORE FACTS. MORE CONNECTIONS.</p><h2>下一次，看见一个价格时，<br>试着寻找它背后的变化。</h2><a class="button primary" href="#atlas" data-recipe="cost">展开价格关系路线 ${icon('arrow')}</a><p class="small muted">这是自由探索的延伸，不是另一条已制作的完整任务线。</p></div></div>`;
}
export function questsPage(id:string,state:AppState):string {
 const valid=questOrder.includes(id)?id:questOrder[state.progress.completed.length]??'observe';const done=state.progress.completed.length;
 return `<main id="main" class="quests-page page" tabindex="-1">${pageHeader('FIELDWORK / 现场任务手册','把理解，带回现实。','阅读是起点。<br>能解释、能预测，再去观察。')}<div class="quest-layout"><aside class="quest-sidebar"><p class="eyebrow">EXPEDITION 001</p><h2>一块面包的旅程</h2><div class="quest-meter"><span style="width:${done/3*100}%"></span></div><p class="quest-count"><strong>${String(done).padStart(2,'0')}</strong> / 03 任务完成</p><nav aria-label="任务步骤">${questOrder.map((q,i)=>{const completed=state.progress.completed.includes(q),allowed=canComplete(q,state.progress.completed);return `<a href="#quests/${q}" class="quest-step ${q===valid?'active':''} ${completed?'completed':''}"><span class="quest-step-marker">${completed?icon('check',17):String(i+1).padStart(2,'0')}</span><span><strong>${questTitles[i]}</strong><small>${completed?'已完成':allowed?'可开始':'前一步验证后开启'}</small></span>${!allowed?icon('lock',13):''}</a>`;}).join('')}</nav><p class="quest-sidebar-note">不靠经验值衡量理解。<br>阅读记录与验证结果分开保存。</p><a class="text-link" href="#atlas">返回世界地图 ${icon('arrow',14)}</a>${done?'<button class="reset-progress" data-reset-progress>重新开始这条路线</button>':''}</aside><section class="quest-content">${done===3&&valid==='observe'?completionHTML(state):questBody(valid,state)}</section></div></main>`;
}
export function mountQuests(root:HTMLElement,state:AppState,signal:AbortSignal,save:()=>void,render:()=>void):void {
 const complete=(id:string)=>{if(!canComplete(id,state.progress.completed))return;if(!state.progress.completed.includes(id))state.progress.completed.push(id);save();updateProgressSidebar();};
 const updateProgressSidebar=()=>{
  const count=state.progress.completed.length;const bar=root.querySelector<HTMLElement>('.quest-meter span');if(bar)bar.style.width=`${count/3*100}%`;
  const counter=root.querySelector('.quest-count strong');if(counter)counter.textContent=String(count).padStart(2,'0');
  root.querySelectorAll<HTMLAnchorElement>('.quest-step').forEach(a=>{const q=a.hash.split('/')[1];const done=state.progress.completed.includes(q);a.classList.toggle('completed',done);if(done){must(a,'.quest-step-marker').innerHTML=icon('check',17);must(a,'small').textContent='已完成';}else if(canComplete(q,state.progress.completed)){must(a,'small').textContent='可开始';a.querySelector(':scope > svg')?.remove();}});
 };
 root.querySelector('#trace-form')?.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.target as HTMLFormElement);const feedback=must(root,'#quest-feedback');if(data.get('answer')==='space-time'){complete('trace');feedback.innerHTML=feedbackHTML('trace');}else feedback.innerHTML='<div class="feedback-retry"><strong>再想一步：问题分别发生在哪里、什么时候？</strong><p>价格不是这道题的核心。让东西移动，与让它保存到明天，是两种不同的工作。可以重新选择。</p></div>';},{signal});
 if(root.querySelector('#shock')){
  const experiment=mountExperiment(root,signal,true,()=>{const [s,p]=experiment.values();must(root,'#prediction-options').innerHTML=predictionOptions(s,p);must(root,'#quest-feedback').innerHTML='';});
  root.querySelector('#predict-form')?.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.target as HTMLFormElement);const [s,p]=experiment.values();experiment.reveal();const feedback=must(root,'#quest-feedback');if(Number(data.get('prediction'))===projectPrice(s,p)){complete('predict');feedback.innerHTML=feedbackHTML('predict');}else feedback.innerHTML=`<div class="feedback-retry"><strong>再检查一下份额与传递比例。</strong><p>按当前假设：100 + 10 × ${s/100} × ${p/100} = ${projectPrice(s,p)}。模型只改变运输那一部分。看看解释后，可以再试。</p></div>`;},{signal});
 }
 root.querySelector('#observe-form')?.addEventListener('input',e=>{
  const field=e.target as HTMLTextAreaElement;
  if(['observe','inference','unknown'].includes(field.name)){
   state.progress.notes[field.name]=field.value.slice(0,1600);save();
  }
 },{signal});
 root.querySelector('#observe-form')?.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.target as HTMLFormElement);const fields=['observe','inference','unknown'];if(!data.get('ack')||fields.some(k=>String(data.get(k)??'').trim().length<6)){must(root,'#quest-feedback').textContent='请分别填写观察、推断和未知，每栏至少 6 个字符。';return;}for(const key of fields)state.progress.notes[key]=String(data.get(key)).trim().slice(0,1600);complete('observe');render();must<HTMLElement>(root,'.quest-complete').scrollIntoView({block:'start'});},{signal});
}
