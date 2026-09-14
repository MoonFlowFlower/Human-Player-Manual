export type Category = 'nature' | 'making' | 'infrastructure' | 'exchange';
export type EvidenceKind = 'FACT' | 'MODEL' | 'INTERPRETATION' | 'UNCERTAINTY';
export interface Source { id: string; title: string; publisher: string; url: string; scope: string; checked: string; }
export interface Concept {
  id: string; title: string; en: string; category: Category; index: string;
  summary: string; why: string; fact: string; mechanism: string;
  inputs: string[]; process: string; outputs: string[];
  prerequisites: string[]; failure: string; trap: string; question: string;
  sources: string[]; jurisdiction: string; lastReviewed: string;
  x: number; y: number; icon: string;
}
export interface Edge { from: string; to: string; type: 'flow' | 'support' | 'feedback'; label: string; }
export interface Recipe { id: string; title: string; en: string; description: string; aliases: string[]; intentTerms: string[]; relationMode: 'flow' | 'context'; nodes: string[]; outcome: string; }
export interface Progress { version: 1; completed: string[]; visited: string[]; notes: Record<string, string>; }
export interface SearchResult { kind: 'concept' | 'recipe'; id: string; title: string; sub: string; }
export interface AtlasState { selected: string; category: string; recipe: string; scale: number; dx: number; dy: number; }
export interface AppState { progress: Progress; atlas: AtlasState; storageAvailable: boolean; }
