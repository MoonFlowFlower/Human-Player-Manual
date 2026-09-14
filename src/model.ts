import { concepts, edges, recipes, questOrder } from './content.js';
import { chapters, directions } from './learning-content.js';
import { readingUrl } from './learning-model.js';
import type { Concept, Edge, Progress, SearchResult } from './types.js';

export const conceptIndex = new Map(concepts.map(c => [c.id,c]));
export const emptyProgress = (): Progress => ({version:1,completed:[],visited:[],notes:{}});
export function safeText(text: unknown): string { return String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!)); }
export function projectPrice(shock: number, pass: number): number {
  const bound = (v: number) => Number.isFinite(v) ? Math.min(100,Math.max(0,v)) : 0;
  return Math.round((100 + 10 * bound(shock)/100 * bound(pass)/100) * 100)/100;
}
export function canComplete(id: string, completed: string[]): boolean {
  void completed;
  return questOrder.includes(id);
}
export function decodeProgress(text: string | null): Progress {
  const clean = emptyProgress();
  if (!text) return clean;
  try {
    const raw: unknown = JSON.parse(text);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return clean;
    const obj = raw as Record<string,unknown>;
    if (obj.version !== 1) return clean;
    if (Array.isArray(obj.completed)) for (const id of questOrder) {
      if (obj.completed.includes(id) && canComplete(id, clean.completed)) clean.completed.push(id);
    }
    if (Array.isArray(obj.visited)) clean.visited = [...new Set(obj.visited.filter((id): id is string => typeof id==='string' && conceptIndex.has(id)))];
    if (obj.notes && typeof obj.notes==='object' && !Array.isArray(obj.notes)) {
      for (const key of ['observe','inference','unknown']) {
        const value = (obj.notes as Record<string,unknown>)[key];
        if (typeof value==='string') clean.notes[key] = value.slice(0,1600);
      }
    }
    return clean;
  } catch { return clean; }
}
export function connected(id: string): Edge[] { return edges.filter(e => e.from===id || e.to===id); }
export function suggestedAfter(id: string): Concept[] { return concepts.filter(c => c.recommendedBefore.includes(id)); }
export function searchContent(query: string): SearchResult[] {
  const q = query.trim().toLocaleLowerCase();
  // Curated intent keywords outrank generic objects: 'food expensive' asks
  // about a change in price, not merely the source of food. This is not AI.
  const recipeResults = recipes.map(r => {
    const exact=r.title.toLocaleLowerCase()===q;
    const matches=r.aliases.filter(a=>q.includes(a)||(q.length>1&&a.includes(q)));
    const intent=r.intentTerms.some(term=>q.includes(term));
    const score=!q?1:exact?200:((intent?100:0)+Math.max(0,...matches.map(a=>a.length)));
    return {recipe:r,score};
  }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score).map(({recipe:r}) => ({kind:'recipe' as const,id:r.id,title:r.title,sub:'世界中的问题 · 查看相关环节'}));
  const conceptResults = concepts.filter(c => !q || `${c.title} ${c.en} ${c.summary}`.toLocaleLowerCase().includes(q)).map(c => ({kind:'concept' as const,id:c.id,title:c.title,sub:'知识地图 · 运作方式'}));
  const foundations: SearchResult[] = chapters.filter(c => !q || `${c.title} ${c.summary}`.includes(q) || c.aliases.some(a => q.includes(a) || (q.length > 1 && a.includes(q)))).map(c => ({kind:'chapter',id:c.id,title:c.title,sub:'基础章节',path:readingUrl({kind:'chapter',id:c.id})}));
  const routes: SearchResult[] = directions.filter(d => !q || `${d.title} ${d.topics} ${d.summary}`.includes(q)).map(d => ({kind:'direction',id:d.id,title:d.title,sub:'学习方向',path:`#routes/${d.id}`}));
  if (/先学|从哪里开始|学习路线/.test(q)) routes.unshift({kind:'direction',id:'routes',title:'看看从哪里开始',sub:'学习路线总览',path:'#routes'});
  if (/回忆练习|借伞|小练习/.test(q)) foundations.unshift({kind:'practice',id:'recall',title:'收起原文，试着回忆',sub:'回忆、对照与应用',path:'#practice/recall'});
  return [...recipeResults.filter(()=>Boolean(q)),...foundations,...routes,...conceptResults,...recipeResults.filter(()=>!q)].slice(0,20);
}
export function validateContent(): string[] {
  const errors: string[]=[];
  const ids = new Set(concepts.map(c=>c.id));
  if (ids.size!==concepts.length) errors.push('Duplicate concept ids');
  for (const c of concepts) {
    for (const prior of c.recommendedBefore) if(!ids.has(prior) || prior===c.id) errors.push(`Invalid reading recommendation: ${c.id}/${prior}`);
    if(!c.sources.length || !c.mechanism || !c.failure || !c.trap) errors.push(`Incomplete concept: ${c.id}`);
  }
  for (const e of edges) if(!ids.has(e.from)||!ids.has(e.to)||e.from===e.to||!e.label) errors.push(`Invalid edge: ${e.from}/${e.to}`);
  for (const r of recipes) if(r.nodes.some(id=>!ids.has(id))) errors.push(`Invalid recipe: ${r.id}`);
  const visiting = new Set<string>(), visited = new Set<string>();
  const walk=(id:string):void=>{ if(visiting.has(id)) { errors.push(`Reading recommendation cycle at ${id}`); return; } if(visited.has(id)) return; visiting.add(id); for(const p of conceptIndex.get(id)?.recommendedBefore??[]) walk(p); visiting.delete(id);visited.add(id); };
  for(const c of concepts) walk(c.id);
  return errors;
}
