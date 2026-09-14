import { projectPrice } from './model.js';
import { must, icon } from './ui.js';

export function experimentHTML(hidden=false): string {
 return `<div class="experiment"><div class="experiment-top"><span class="eyebrow">调整数字试试看</span><span class="evidence-badge">教学假设</span></div><h3>改变一个环节，<br>整个结果会怎样？</h3><p>把基准成本指数设为 100，其中运输占 10。只改变运输成本，其他条件保持不变。</p>
 <div class="cost-breakdown" aria-label="假设成本份额：农业原料25，加工20，包装10，运输10，其他35"><span style="flex:25">25</span><span style="flex:20">20</span><span style="flex:10">10</span><span class="transport-share" style="flex:10">10</span><span style="flex:35">35</span></div><div class="cost-labels"><span>原料</span><span>加工</span><span>包装</span><span class="accent">运输</span><span>其他</span></div>
 <div class="experiment-controls"><label for="shock">运输环节成本变化 <output id="shock-value" for="shock">+50%</output></label><input id="shock" type="range" min="0" max="100" step="5" value="50"><label for="pass">传递给消费者的比例 <output id="pass-value" for="pass">100%</output></label><input id="pass" type="range" min="0" max="100" step="10" value="100"></div>
 <div class="experiment-result"><span>模型输出<br><small>基准指数 100</small></span><output id="model-result" aria-live="polite"><b id="model-value">${hidden?'?':'105.0'}</b><span id="model-change">${hidden?'先选择一个答案':'↑ 5.0%'}</span></output></div>
 <p class="model-formula mono">100 + 10 × 成本变化率 × 传递比例</p><details class="model-limits"><summary>这个模型没有告诉你什么 ${icon('plus',14)}</summary><p>所有份额均为自编教学假设，不是市场调查或 USDA 数据。线性传递省略了需求变化、库存、替代选择、合同、利润变化和时间滞后。它展示的是局部成本怎样影响整体，不能预测真实面包价格。</p></details></div>`;
}
export function mountExperiment(root: HTMLElement,signal: AbortSignal,hidden=false,onChange?:()=>void): {values:()=>[number,number]; reveal:()=>void} {
 let revealed=!hidden;
 const shock=must<HTMLInputElement>(root,'#shock'),pass=must<HTMLInputElement>(root,'#pass');
 const values=():[number,number]=>[Number(shock.value),Number(pass.value)];
 const update=()=>{
  const [s,p]=values(),out=projectPrice(s,p);
  must(root,'#shock-value').textContent=`+${s}%`;must(root,'#pass-value').textContent=`${p}%`;
  must(root,'#model-value').textContent=revealed?out.toFixed(1):'?';
  must(root,'#model-change').textContent=revealed?`↑ ${(out-100).toFixed(1)}%`:'先选择一个答案';
 };
 for(const input of [shock,pass])input.addEventListener('input',()=>{if(hidden)revealed=false;update();onChange?.();},{signal});
 return {values,reveal:()=>{revealed=true;update();}};
}
