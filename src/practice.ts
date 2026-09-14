import { recallExample, transferOptions } from './learning-content.js';
import { checkTransfer, emptyRecall } from './learning-model.js';
import { safeText } from './model.js';
import { announce, icon, must, notFoundPage, pageHeader } from './ui.js';
import type { AppState, Comparison } from './types.js';

function exampleHTML(): string {return `<div class="recall-example"><p class="eyebrow">示例 · 某场馆的借伞说明</p><ul>${recallExample.map(text=>`<li>${text}</li>`).join('')}</ul><p class="small muted">这是练习用的虚构规则，不是某家场馆的实际规定。</p></div>`;}
function comparisonSummary(state: AppState): string {
 const r=state.learning.recall;
 const missing=r.comparison.map((value,i)=>value!=='included'?recallExample[i]:'').filter(Boolean);
 return `<div class="comparison-summary"><h3>根据你刚才的对照</h3><p>${missing.length?'下面是你标为遗漏或不确定的部分，可以重点再看：':'你把三个要点都标为已写到。接下来看看换个情境时能否用上。'}</p>${missing.length?`<ul>${missing.map(item=>`<li>${item}</li>`).join('')}</ul>`:''}<small>这是你的自我对照，网站没有自动判断自由文字。</small></div>`;
}
function recallBody(state: AppState): string {
 const r=state.learning.recall;
 if(r.stage==='example')return `<h2 id="practice-stage-title" tabindex="-1">先读这段说明</h2><p>读完后会暂时收起原文。接着写下记住的内容，看看哪些需要补上。</p>${exampleHTML()}<button class="button primary" id="hide-example">收起原文，开始回忆 ${icon('arrow')}</button>`;
 if(r.stage==='recall')return `<h2 id="practice-stage-title" tabindex="-1">不看原文，你记住了什么？</h2><p>尽量写出这段说明的内容，不必逐字一致。想不起来也可以写“暂时想不起来”，随后再对照。</p><form id="recall-form"><label for="recall-response">我的回忆</label><textarea id="recall-response" required maxlength="600" placeholder="用自己的话写下记住的内容。">${safeText(r.response)}</textarea><p class="small muted">文字只保存在此浏览器，不需要填写个人资料。</p><div class="next-actions"><button class="button primary" type="submit">对照原文 ${icon('arrow')}</button><button class="text-link" type="button" id="reread-example">先回去读一遍</button></div><p id="recall-error" role="status"></p></form>`;
 if(r.stage==='compare')return `<h2 id="practice-stage-title" tabindex="-1">对照一下，具体漏在哪里</h2><div class="your-recall"><h3>刚才写下的内容</h3><p>${safeText(r.response)}</p></div>${exampleHTML()}<form id="comparison-form"><p>请对照自己刚才写的内容，而不是现在是否已经看懂。</p>${recallExample.map((text,i)=>`<fieldset class="compare-point"><legend>${text}</legend>${[['included','已写到'],['missed','漏了或记错了'],['unsure','不确定']].map(([value,label])=>`<label><input type="radio" name="point-${i}" value="${value}" required ${r.comparison[i]===value?'checked':''}>${label}</label>`).join('')}</fieldset>`).join('')}<button class="button primary" type="submit">看看遗漏，再换个情境试试 ${icon('arrow')}</button><p id="comparison-error" role="status"></p></form>`;
 if(r.stage==='transfer')return `<h2 id="practice-stage-title" tabindex="-1">换个情境，这次怎么处理？</h2>${comparisonSummary(state)}<p class="transfer-situation">还是这家场馆。快闭馆时，你发现借来的伞有一根伞骨损坏了。按刚才的规则，下面哪种处理方式合适？</p><form id="transfer-form"><fieldset><legend>选择一种处理方式</legend>${transferOptions.map(option=>`<label class="answer"><input type="radio" name="answer" value="${option.id}" required ${r.answer===option.id?'checked':''}><span>${option.text}</span></label>`).join('')}</fieldset><button class="button primary" type="submit">查看反馈 ${icon('arrow')}</button></form><div id="transfer-feedback" class="quest-feedback" role="status">${r.answer&&r.answer!=='desk'?`<div class="feedback-retry"><strong>可以再试一次</strong><p>${transferOptions.find(option=>option.id===r.answer)?.feedback??''}</p></div>`:''}</div>`;
 return `<h2 id="practice-stage-title" tabindex="-1">这次练习已完成</h2><div class="feedback-success">${icon('check',28)}<div><strong>你在这个情境里选对了处理方式。</strong><p>${transferOptions.find(option=>option.id==='desk')!.feedback}</p></div></div><div class="attempt-receipt"><h3>这次做过的事</h3><p>收起原文后写下回忆；对照了三个要点；完成了一个相近情境的判断。</p><p>这不等于已经长期记住。下次隔一段时间再试，才知道还能想起多少。</p></div>${comparisonSummary(state)}<div class="next-actions"><a class="button primary" href="#learn/memory?route=study">继续读「回忆与复习」 ${icon('arrow')}</a><button class="button" id="review-later">${state.learning.reviewLater?'已加入稍后复习':'加入稍后复习'}</button></div><p class="small muted">稍后复习会显示在首页和小练习页，不会发送通知。</p><button class="text-link" id="restart-recall">重新做一次 ${icon('reset',16)}</button><p id="review-status" role="status"></p>`;
}
export function practicePage(id: string, state: AppState): string {
 if(!id)return `<main id="main" class="page practice-hub" tabindex="-1">${pageHeader('边读边试','小练习','选一个问题，试过之后看看反馈。')}<section class="featured-practice"><div><p class="eyebrow">学会学习 ${state.learning.recall.completed?'· 这次练习已完成':state.learning.recall.stage!=='example'?'· 可以继续上次':''}</p><h2>收起原文，<br>试着回忆</h2><p>写下记住的内容，对照遗漏，再用到一个相近情境。</p>${state.learning.reviewLater?'<p class="review-reminder">已加入稍后复习</p>':''}<a class="button primary" href="#practice/recall">${state.learning.recall.stage==='example'?'开始练习':'继续／查看这次练习'} ${icon('arrow')}</a><a class="text-link" href="#learn/practice?route=study">先读相关章节 ${icon('arrow',16)}</a></div><ol class="practice-flow"><li>读一个例子</li><li>收起原文，回忆</li><li>对照遗漏</li><li>换个情境应用</li></ol></section><section class="legacy-practice-list"><h2>理解世界</h2><p>保留的面包与价格练习，可以分别尝试。</p>${[['trace','运输和储存分别解决什么？','判断两个环节各自解决的问题。'],['predict','试算一个价格变化','先预测，再看简化模型的结果。'],['observe','看看食品包装上写了什么','可选记录：分开观察、推断与未知。']].map(([key,title,description])=>`<a href="#quests/${key}"><div><small>${state.progress.completed.includes(key)?key==='observe'?'已记录':'练习完成':'世界系统'}</small><h3>${title}</h3><p>${description}</p></div>${icon('arrow')}</a>`).join('')}</section><a class="text-link" href="#learn/sleep?route=care">睡眠章节：可选的生活记录 ${icon('arrow',16)}</a></main>`;
 if(id!=='recall')return notFoundPage();
 const stageNames=['读例子','回忆','对照','应用','完成'],index=['example','recall','compare','transfer','complete'].indexOf(state.learning.recall.stage);
 return `<main id="main" class="page practice-page" tabindex="-1"><div class="breadcrumbs"><a href="#practice">${icon('back',16)} 小练习</a><span>/</span><a href="#routes/study">学会学习和判断</a></div><div class="practice-layout"><aside class="practice-sidebar"><p class="eyebrow">回忆与应用</p><h1>收起原文，<br>试着回忆</h1><ol aria-label="练习步骤">${stageNames.map((name,i)=>`<li ${i===index?'aria-current="step"':''}><span>${String(i+1).padStart(2,'0')}</span>${name}</li>`).join('')}</ol><a href="#learn/practice?route=study" class="text-link">返回相关章节 ${icon('arrow',16)}</a></aside><section class="practice-body">${recallBody(state)}<div class="practice-exit"><a href="#routes/study">暂时离开，继续阅读 ${icon('arrow',16)}</a>${!state.storageAvailable?'<p class="storage-warning">浏览器无法保存记录；当前会话仍可练习，关闭后可能丢失。</p>':''}</div></section></div></main>`;
}
export function mountPractice(root: HTMLElement, state: AppState, signal: AbortSignal, save: () => void, render: () => void): void {
 const refresh=()=>{save();render();root.querySelector<HTMLElement>('#practice-stage-title')?.focus({preventScroll:true});};
 root.querySelector('#hide-example')?.addEventListener('click',()=>{state.learning.recall.stage='recall';refresh();},{signal});
 root.querySelector('#reread-example')?.addEventListener('click',()=>{state.learning.recall.stage='example';refresh();},{signal});
 root.querySelector('#recall-response')?.addEventListener('input',e=>{state.learning.recall.response=(e.target as HTMLTextAreaElement).value.slice(0,600);save();},{signal});
 root.querySelector('#recall-form')?.addEventListener('submit',e=>{
  e.preventDefault();const text=must<HTMLTextAreaElement>(root,'#recall-response').value.trim();
  if(!text){must(root,'#recall-error').textContent='请写下记住的内容，或写“暂时想不起来”。';return;}
  state.learning.recall.response=text.slice(0,600);state.learning.recall.stage='compare';refresh();
 },{signal});
 root.querySelector('#comparison-form')?.addEventListener('submit',e=>{
  e.preventDefault();const data=new FormData(e.target as HTMLFormElement), values=[0,1,2].map(i=>String(data.get(`point-${i}`)??''));
  if(!values.every(v=>['included','missed','unsure'].includes(v))){must(root,'#comparison-error').textContent='请对照三个要点；不确定的地方可以选“不确定”。';return;}
  state.learning.recall.comparison=values as Comparison[];state.learning.recall.stage='transfer';refresh();
 },{signal});
 root.querySelector('#transfer-form')?.addEventListener('submit',e=>{
  e.preventDefault();const feedback=checkTransfer(state.learning.recall,String(new FormData(e.target as HTMLFormElement).get('answer')??''));save();
  if(feedback.correct)refresh();else must(root,'#transfer-feedback').innerHTML=`<div class="feedback-retry"><strong>可以重新选择</strong><p>${feedback.message}</p></div>`;
 },{signal});
 root.querySelector('#review-later')?.addEventListener('click',()=>{state.learning.reviewLater=true;save();must(root,'#review-later').textContent='已加入稍后复习';must(root,'#review-status').textContent='首页和小练习页会保留复习入口；不会发送通知。';announce('已加入稍后复习。');},{signal});
 root.querySelector('#restart-recall')?.addEventListener('click',()=>{
  if(!window.confirm('重新做这次练习？会替换本次回忆和对照，阅读记录与其他笔记会保留。'))return;
  state.learning.recall=emptyRecall();state.learning.reviewLater=false;refresh();
 },{signal});
}
