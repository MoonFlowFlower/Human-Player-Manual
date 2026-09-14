import { questOrder, questTitles } from './content.js';
import { canComplete, projectPrice, safeText } from './model.js';
import { icon, must, nodeLink, pageHeader, notFoundPage } from './ui.js';
import { experimentHTML, mountExperiment } from './experiment.js';
import type { AppState } from './types.js';

function predictionOptions(shock:number,pass:number):string {
 const value=projectPrice(shock,pass),naive=100+shock;
 const wrong1=naive!==value?naive:value+10,wrong2=100!==value&&100!==wrong1?100:value+20;
 return [wrong1,value,wrong2].map(n=>`<label class="answer"><input type="radio" name="prediction" value="${n}" required><span>${n}</span></label>`).join('');
}
function feedbackHTML(id:string):string {
 return `<div class="feedback-success">${icon('check',24)}<div><strong>${id==='trace'?'这次判断正确。':'这次计算正确。'}</strong><p>${id==='trace'?'运输把商品从一个地点带到另一个地点；储存让商品在之后仍可使用。两者的作用不同，都不保证食物永不变质。':'结果只在给定份额与传递假设下成立。实际价格还可能受需求、替代方案和时滞等影响。'}</p><a class="text-link" href="#quests/${id==='trace'?'predict':'observe'}">${id==='trace'?'接着试算价格变化':'接着看看食品包装'} ${icon('arrow',16)}</a><a class="text-link" href="#routes/world">返回「看懂世界怎样运转」</a></div></div>`;
}
function observationSaved(state:AppState):string {
 return `<div class="quest-complete"><p class="eyebrow">食品包装观察</p><h2>这条观察已记录</h2><p>记录来自你的填写，网站没有独立核验。</p><details class="saved-observation" open><summary>查看我的笔记 ${icon('plus',16)}</summary>${[['observe','观察'],['inference','推断'],['unknown','未知']].map(([key,title])=>`<p><b>${title}</b>${safeText(state.progress.notes[key]||'未填写')}</p>`).join('')}</details><div class="completion-evidence"><span>运输与储存：${state.progress.completed.includes('trace')?'练习完成':'还未完成练习'}</span><span>价格变化：${state.progress.completed.includes('predict')?'练习完成':'还未完成练习'}</span></div><div class="next-actions"><a class="button primary" href="#guide/information?route=world">继续读「信息与证据」 ${icon('arrow')}</a><a class="text-link" href="#routes/world">返回这个学习方向</a></div></div>`;
}
function questBody(id:string,state:AppState):string {
 if(id==='trace')return `<p class="eyebrow">理解世界 · 运输与储存</p><h2>面包已经做好，<br>怎样在明早送到这里？</h2><p class="quest-lead">面包在另一座城市出炉，而你要到明天早晨才需要它。运输和储存分别在解决什么问题？</p><div class="quest-route">${['agriculture','processing','transport','storage','retail'].map(nodeLink).join('<span>→</span>')}</div><form id="trace-form"><fieldset><legend>选择对这两个环节的解释</legend><label class="answer"><input type="radio" name="answer" value="reverse" required><span>运输主要解决保存到明天，储存主要解决送到另一个地点。</span></label><label class="answer"><input type="radio" name="answer" value="space-time"><span>运输主要解决地点变化，储存主要解决之后仍可使用。</span></label><label class="answer"><input type="radio" name="answer" value="same"><span>两者都主要解决地点变化，只是搬运距离和数量不同。</span></label></fieldset><button class="button primary" type="submit">查看反馈 ${icon('arrow')}</button></form><div id="quest-feedback" class="quest-feedback" role="status">${state.progress.completed.includes('trace')?feedbackHTML('trace'):''}</div>`;
 if(id==='predict')return `<p class="eyebrow">理解世界 · 价格变化</p><h2>运输变贵，<br>总成本会增加多少？</h2><p class="quest-lead">按下面的假设做一次计算，选择答案后查看结果。这是教学模型，不是实际物价预测。</p>${experimentHTML(true)}<form id="predict-form"><fieldset><legend>按当前假设，模型输出应是多少？</legend><div id="prediction-options">${predictionOptions(50,100)}</div></fieldset><button class="button primary" type="submit">查看反馈 ${icon('arrow')}</button></form><div id="quest-feedback" class="quest-feedback" role="status">${state.progress.completed.includes('predict')?feedbackHTML('predict'):''}</div>`;
 if(state.progress.completed.includes('observe'))return observationSaved(state);
 const n=state.progress.notes;
 return `<p class="eyebrow">理解世界 · 可选观察</p><h2>看看食品包装上写了什么</h2><p class="quest-lead">找一件家里已有的包装食品，只看包装，不必购买、拆开或食用。把实际看到的内容，和自己猜测的过程分开。</p><div class="observation-note">${icon('info',20)}<p>不要填写姓名、具体住址或订单号。笔记只在此浏览器保存；不写也可以继续阅读。</p></div><form id="observe-form"><label class="field-label" for="observation">我实际看到的内容</label><textarea id="observation" name="observe" maxlength="1600" required placeholder="例如：包装上写有生产商名称。">${safeText(n.observe??'')}</textarea><label class="field-label" for="inference">我的推断（可选）</label><textarea id="inference" name="inference" maxlength="1600" placeholder="例如：它可能经过运输，但我没有看到实际运输记录。">${safeText(n.inference??'')}</textarea><label class="field-label" for="unknown">还不知道什么（可选）</label><textarea id="unknown" name="unknown" maxlength="1600" placeholder="例如：包装地址不等于原料产地，原料来自哪里还不清楚。">${safeText(n.unknown??'')}</textarea><p class="small muted" id="draft-status" role="status">${Object.values(n).some(Boolean)?'已有笔记草稿。':'填写后会保存草稿。'}</p><button class="button primary" type="submit">保存这条观察 ${icon('arrow')}</button><a class="text-link" href="#guide/information?route=world">不记录，继续阅读</a></form><div id="quest-feedback" class="quest-feedback" role="status"></div>`;
}
export function questsPage(id:string,state:AppState):string {
 if(id&&!questOrder.includes(id))return notFoundPage();
 const valid=id||questOrder.find(q=>!state.progress.completed.includes(q))||'observe',done=state.progress.completed.length;
 return `<main id="main" class="quests-page page" tabindex="-1">${pageHeader('理解世界','面包与价格练习','可以分别尝试，也可以沿着下面的顺序做。')}<div class="quest-layout"><aside class="quest-sidebar"><p class="eyebrow">保留的练习与笔记</p><h2>一块面包的旅程</h2><div class="quest-meter"><span style="width:${done/questOrder.length*100}%"></span></div><p class="quest-count"><strong>${done}</strong> / ${questOrder.length} 项已记录</p><nav aria-label="练习选择">${questOrder.map((q,i)=>{const completed=state.progress.completed.includes(q);return `<a href="#quests/${q}" class="quest-step ${q===valid?'active':''} ${completed?'completed':''}" ${q===valid?'aria-current="page"':''}><span class="quest-step-marker">${completed?icon('check',17):String(i+1).padStart(2,'0')}</span><span><strong>${questTitles[i]}</strong><small>${completed?q==='observe'?'已记录':'练习完成':'可开始'}</small></span></a>`;}).join('')}</nav><a class="text-link" href="#practice">返回小练习 ${icon('arrow',14)}</a><a class="text-link" href="#routes/world">返回这个学习方向 ${icon('arrow',14)}</a>${done||Object.values(state.progress.notes).some(Boolean)?'<button class="reset-progress" data-reset-progress>重置这些练习与笔记</button>':''}</aside><section class="quest-content">${questBody(valid,state)}</section></div></main>`;
}
export function mountQuests(root:HTMLElement,state:AppState,signal:AbortSignal,save:()=>void,render:()=>void):void {
 const complete=(id:string)=>{
  if(!canComplete(id,state.progress.completed))return;
  if(!state.progress.completed.includes(id))state.progress.completed.push(id);save();
  const count=state.progress.completed.length,bar=root.querySelector<HTMLElement>('.quest-meter span');if(bar)bar.style.width=`${count/questOrder.length*100}%`;
  const counter=root.querySelector('.quest-count strong');if(counter)counter.textContent=String(count);
  root.querySelectorAll<HTMLAnchorElement>('.quest-step').forEach(a=>{const q=a.hash.split('/')[1],done=state.progress.completed.includes(q);a.classList.toggle('completed',done);if(done){must(a,'.quest-step-marker').innerHTML=icon('check',17);must(a,'small').textContent=q==='observe'?'已记录':'练习完成';}});
 };
 root.querySelector('#trace-form')?.addEventListener('submit',e=>{
  e.preventDefault();const answer=new FormData(e.target as HTMLFormElement).get('answer'),feedback=must(root,'#quest-feedback');
  if(answer==='space-time'){complete('trace');feedback.innerHTML=feedbackHTML('trace');}
  else feedback.innerHTML=`<div class="feedback-retry"><strong>可以重新选择</strong><p>${answer==='reverse'?'你把两个主要作用反过来了。运输让商品换一个地点；储存让它在之后仍可使用。':'两者都可能涉及搬运，但储存的主要作用不是换地点，而是把可用时间延伸到之后。'}</p></div>`;
 },{signal});
 if(root.querySelector('#shock')){
  const experiment=mountExperiment(root,signal,true,()=>{const [s,p]=experiment.values();must(root,'#prediction-options').innerHTML=predictionOptions(s,p);must(root,'#quest-feedback').innerHTML='';});
  root.querySelector('#predict-form')?.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.target as HTMLFormElement),[s,p]=experiment.values();experiment.reveal();const feedback=must(root,'#quest-feedback');if(data.has('prediction')&&Number(data.get('prediction'))===projectPrice(s,p)){complete('predict');feedback.innerHTML=feedbackHTML('predict');}else feedback.innerHTML=`<div class="feedback-retry"><strong>再检查份额与传递比例</strong><p>按当前假设：100 + 10 × ${s/100} × ${p/100} = ${projectPrice(s,p)}。只改变运输那一部分，不能把运输的百分比直接加到总成本上。可以重新选择。</p></div>`;},{signal});
 }
 root.querySelector('#observe-form')?.addEventListener('input',e=>{const field=e.target as HTMLTextAreaElement;if(['observe','inference','unknown'].includes(field.name)){state.progress.notes[field.name]=field.value.slice(0,1600);save();must(root,'#draft-status').textContent=state.storageAvailable?'草稿已保存；尚未提交为观察记录。':'草稿暂存于当前会话，关闭页面后可能丢失。';}},{signal});
 root.querySelector('#observe-form')?.addEventListener('submit',e=>{
  e.preventDefault();const data=new FormData(e.target as HTMLFormElement);
  if(!String(data.get('observe')??'').trim()){must(root,'#quest-feedback').textContent='请写下实际看到的内容；也可以不记录，继续阅读。';return;}
  for(const key of ['observe','inference','unknown'])state.progress.notes[key]=String(data.get(key)??'').trim().slice(0,1600);
  complete('observe');render();root.querySelector<HTMLElement>('main')?.focus({preventScroll:true});
 },{signal});
}
