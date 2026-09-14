export type Category = 'nature' | 'making' | 'infrastructure' | 'exchange';
export type EvidenceKind = 'FACT' | 'MODEL' | 'INTERPRETATION' | 'UNCERTAINTY';
export interface Source { id: string; title: string; publisher: string; url: string; scope: string; checked: string; }
export interface Concept {
  id: string; title: string; en: string; category: Category; index: string;
  summary: string; why: string; fact: string; mechanism: string;
  inputs: string[]; process: string; outputs: string[];
  recommendedBefore: string[]; failure: string; trap: string; question: string;
  sources: string[]; jurisdiction: string; lastReviewed: string;
  x: number; y: number; icon: string;
}
export interface Edge { from: string; to: string; type: 'flow' | 'support' | 'feedback'; label: string; }
export interface Recipe { id: string; title: string; en: string; description: string; aliases: string[]; intentTerms: string[]; relationMode: 'flow' | 'context'; nodes: string[]; outcome: string; }
export interface Progress { version: 1; completed: string[]; visited: string[]; notes: Record<string, string>; }
export interface SearchResult { kind: 'concept' | 'recipe' | 'chapter' | 'direction' | 'practice'; id: string; title: string; sub: string; path?: string; }
export interface AtlasState { selected: string; category: string; recipe: string; scale: number; dx: number; dy: number; }
export interface AppState { progress: Progress; learning: LearningProgress; atlas: AtlasState; storageAvailable: boolean; }

export interface ChapterSection { title: string; paragraphs: string[]; example?: boolean; sources?: string[]; }
export interface Chapter {
  id: string; title: string; shortTitle: string; direction: string; summary: string;
  aliases: string[]; lead: string; sections: ChapterSection[];
  action: { title: string; text: string; practice?: string };
  caution?: string; sources: string[];
}
export interface ReadingRef { kind: 'chapter' | 'concept'; id: string; }
export interface Direction {
  id: string; number: string; title: string; summary: string; topics: string;
  intro: string; readings: ReadingRef[]; planned: string[];
}
// These are editorial learning relationships, never physical flows or unlocks.
export interface LearningRelation { from: string; to: string; type: 'recommended' | 'prerequisite' | 'related'; reason: string; }
export type RecallStage = 'example' | 'recall' | 'compare' | 'transfer' | 'complete';
export type Comparison = 'included' | 'missed' | 'unsure';
export interface RecallState {
  stage: RecallStage; response: string; comparison: Comparison[];
  answer: string; attempts: number; completed: boolean;
}
export interface LearningProgress {
  version: 2; read: string[]; skipped: string[]; notes: Record<string, string>;
  lastLocation: string; reviewLater: boolean; recall: RecallState;
}
