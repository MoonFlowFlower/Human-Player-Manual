import { concepts, questOrder } from './content.js';
import { chapters, directions, foundationSources, learningRelations, transferOptions } from './learning-content.js';
import type { Comparison, LearningProgress, ReadingRef, RecallState } from './types.js';

export const chapterIndex = new Map(chapters.map(c => [c.id, c]));
export const directionIndex = new Map(directions.map(d => [d.id, d]));
export const emptyRecall = (): RecallState => ({stage:'example',response:'',comparison:[],answer:'',attempts:0,completed:false});
export const emptyLearning = (): LearningProgress => ({version:2,read:[],skipped:[],notes:{},lastLocation:'',reviewLater:false,recall:emptyRecall()});
export const LEARNING_STORAGE_KEY = 'earth-player-manual.learning.v2';
export const LEGACY_STORAGE_KEY = 'earth-player-manual.v1';

export function parseLocation(value: string): { view: string; id: string; direction: string } {
 const [path, query = ''] = value.replace(/^#/, '').split('?');
 const [view = 'home', id = '', extra] = path.split('/');
 const direction = new URLSearchParams(query).get('route') ?? '';
 return {view: extra ? '__invalid__' : view || 'home', id, direction};
}
export function readingInfo(ref: ReadingRef): { title: string; summary: string } | undefined {
 return ref.kind === 'chapter' ? chapterIndex.get(ref.id) : concepts.find(c => c.id === ref.id);
}
export function readingUrl(ref: ReadingRef, direction = ''): string {
 const context = directionIndex.get(direction)?.readings.some(r => r.kind === ref.kind && r.id === ref.id) ? `?route=${direction}` : '';
 return `#${ref.kind === 'chapter' ? 'learn' : 'guide'}/${ref.id}${context}`;
}
export function readingDirection(ref: ReadingRef, requested = ''): string {
 if (directionIndex.get(requested)?.readings.some(r => r.kind === ref.kind && r.id === ref.id)) return requested;
 return ref.kind === 'chapter' ? chapterIndex.get(ref.id)?.direction ?? '' : 'world';
}
export function nextReading(ref: ReadingRef, requested = ''): { title: string; path: string } {
 const direction = readingDirection(ref, requested), d = directionIndex.get(direction);
 const index = d?.readings.findIndex(r => r.kind === ref.kind && r.id === ref.id) ?? -1;
 const next = index >= 0 ? d?.readings[index + 1] : undefined;
 return next ? {title: readingInfo(next)!.title, path: readingUrl(next, direction)} : {title: d ? `返回「${d.title}」` : '返回学习路线', path:d ? `#routes/${direction}` : '#routes'};
}
export function validLearningLocation(value: unknown): string {
 if (typeof value !== 'string' || value.length > 120) return '';
 const {view, id, direction} = parseLocation(value);
 if (direction && !directionIndex.has(direction)) return '';
 if (view === 'learn' && chapterIndex.has(id)) return readingUrl({kind:'chapter',id}, readingDirection({kind:'chapter',id}, direction)).slice(1);
 if (view === 'guide' && concepts.some(c => c.id === id)) return readingUrl({kind:'concept',id}, readingDirection({kind:'concept',id}, direction)).slice(1);
 if (view === 'practice' && id === 'recall') return 'practice/recall';
 if (view === 'quests' && questOrder.includes(id)) return `quests/${id}`;
 return '';
}
export function locationLabel(value: string): string {
 const {view,id} = parseLocation(value);
 if (view === 'learn') return chapterIndex.get(id)?.title ?? '';
 if (view === 'guide') return concepts.find(c => c.id === id)?.title ?? '';
 if (view === 'practice') return '收起原文，试着回忆';
 return id === 'trace' ? '运输和储存分别解决什么？' : id === 'predict' ? '试算一个价格变化' : '查看食品包装';
}
export function decodeLearning(text: string | null): LearningProgress {
 const clean = emptyLearning();
 try {
  const raw: unknown = JSON.parse(text ?? 'null');
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return clean;
  const o = raw as Record<string, unknown>;
  if (o.version !== 2) return clean;
  for (const key of ['read','skipped'] as const) {
   if (Array.isArray(o[key])) clean[key] = [...new Set(o[key].filter((id): id is string => typeof id === 'string' && chapterIndex.has(id)))];
  }
  clean.skipped = clean.skipped.filter(id => !clean.read.includes(id));
  if (o.notes && typeof o.notes === 'object' && !Array.isArray(o.notes)) {
   const sleep = (o.notes as Record<string, unknown>).sleep;
   if (typeof sleep === 'string' && sleep.trim()) clean.notes.sleep = sleep.slice(0,1000);
  }
  clean.lastLocation = validLearningLocation(o.lastLocation);
  clean.reviewLater = o.reviewLater === true;
  if (o.recall && typeof o.recall === 'object' && !Array.isArray(o.recall)) {
   const r = o.recall as Record<string, unknown>, recall = clean.recall;
   recall.response = typeof r.response === 'string' ? r.response.slice(0,600) : '';
   if (Array.isArray(r.comparison) && r.comparison.length === 3 && r.comparison.every(v => ['included','missed','unsure'].includes(String(v)))) recall.comparison = r.comparison as Comparison[];
   recall.answer = transferOptions.some(option => option.id === r.answer) ? String(r.answer) : '';
   recall.attempts = typeof r.attempts === 'number' && Number.isFinite(r.attempts) ? Math.min(999,Math.max(0,Math.floor(r.attempts))) : 0;
   const stages = ['example','recall','compare','transfer','complete'] as const;
   recall.stage = stages.find(stage => stage === r.stage) ?? 'example';
   if (['compare','transfer','complete'].includes(recall.stage) && !recall.response.trim()) recall.stage = 'recall';
   if (['transfer','complete'].includes(recall.stage) && recall.comparison.length !== 3) recall.stage = 'compare';
   if (recall.stage === 'complete' && !(r.completed === true && recall.answer === 'desk' && recall.attempts > 0)) recall.stage = 'transfer';
   recall.completed = recall.stage === 'complete';
  }
  return clean;
 } catch { return clean; }
}
export function markReading(progress: LearningProgress, id: string, action: 'read' | 'skip'): void {
 if (!chapterIndex.has(id)) return;
 if (action === 'read') {
  if (!progress.read.includes(id)) progress.read.push(id);
  progress.skipped = progress.skipped.filter(item => item !== id);
 } else if (!progress.read.includes(id) && !progress.skipped.includes(id)) progress.skipped.push(id);
}
export function checkTransfer(recall: RecallState, answer: string): { correct: boolean; message: string } {
 const option = transferOptions.find(item => item.id === answer);
 if (!option || recall.stage !== 'transfer' || !recall.response.trim() || recall.comparison.length !== 3) return {correct:false,message:'请先完成回忆和对照，再选择一个处理方式。'};
 recall.answer = answer; recall.attempts = Math.min(999,recall.attempts + 1);
 const correct = answer === 'desk';
 if (correct) { recall.completed = true; recall.stage = 'complete'; }
 return {correct,message:option.feedback};
}
export function relatedReadings(reference: string): { ref: ReadingRef; reason: string }[] {
 return learningRelations.filter(r => r.type === 'related' && (r.from === reference || r.to === reference)).map(r => {
  const [kind,id] = (r.from === reference ? r.to : r.from).split(':');
  return {ref:{kind:kind as ReadingRef['kind'],id},reason:r.reason};
 });
}
export function validateLearning(): string[] {
 const errors: string[] = [], ids = new Set([...chapters.map(c => `chapter:${c.id}`),...concepts.map(c => `concept:${c.id}`)]);
 const sourceIds = new Set(foundationSources.map(s => s.id));
 if (chapterIndex.size !== chapters.length || directionIndex.size !== directions.length) errors.push('Duplicate learning ids');
 for (const c of chapters) {
  if (!directionIndex.has(c.direction) || !c.lead || c.sections.length < 3 || !c.action.text) errors.push(`Incomplete chapter ${c.id}`);
  if (!c.sources.length || c.sources.some(id => !sourceIds.has(id))) errors.push(`Invalid chapter source ${c.id}`);
  for (const s of c.sections) if (s.sources?.some(id => !c.sources.includes(id))) errors.push(`Undeclared section source ${c.id}`);
 }
 for (const d of directions) for (const r of d.readings) if (!ids.has(`${r.kind}:${r.id}`)) errors.push(`Invalid reading ${d.id}/${r.id}`);
 for (const r of learningRelations) if (!ids.has(r.from) || !ids.has(r.to) || r.from === r.to || !r.reason) errors.push(`Invalid relation ${r.from}/${r.to}`);
 const visiting = new Set<string>(), visited = new Set<string>();
 const walk = (id: string): void => {
  if (visiting.has(id)) {errors.push(`Prerequisite cycle ${id}`); return;}
  if (visited.has(id)) return;
  visiting.add(id); for (const r of learningRelations.filter(r => r.type === 'prerequisite' && r.to === id)) walk(r.from);
  visiting.delete(id); visited.add(id);
 };
 for (const id of ids) walk(id);
 return errors;
}
