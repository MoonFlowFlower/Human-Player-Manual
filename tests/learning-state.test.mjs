import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chapters, directions, learningRelations } from '../build/learning-content.js';
import { emptyLearning, decodeLearning, validateLearning, nextReading, checkTransfer, markReading, validLearningLocation, LEARNING_STORAGE_KEY, LEGACY_STORAGE_KEY } from '../build/learning-model.js';

test('directions and articles reference real content and scoped sources', () => {
 assert.equal(chapters.length,7); assert.equal(directions.length,6);
 assert.deepEqual(validateLearning(),[]);
 assert.ok(learningRelations.every(r=>['related','recommended','prerequisite'].includes(r.type)));
});
test('old exercise completions and notes are not new course completions', () => {
 const old = JSON.stringify({version:1,completed:['trace','predict','observe'],visited:['food'],notes:{observe:'保留旧笔记'}});
 assert.deepEqual(decodeLearning(old),emptyLearning());
 assert.notEqual(LEARNING_STORAGE_KEY,LEGACY_STORAGE_KEY);
});
test('invalid learning data is bounded and cannot forge completion', () => {
 for (const text of [null,'{','null','[]','{"version":9}']) assert.deepEqual(decodeLearning(text),emptyLearning());
 const data=decodeLearning(JSON.stringify({version:2,read:['sleep','fake','sleep'],skipped:['sleep','memory'],notes:{sleep:'a'.repeat(1100),address:'discard'},lastLocation:'https://evil.example/',recall:{stage:'complete',completed:true,answer:'desk',attempts:1}}));
 assert.deepEqual(data.read,['sleep']);assert.deepEqual(data.skipped,['memory']);assert.equal(data.lastLocation,'');
 assert.equal(data.notes.sleep.length,1000);assert.equal(data.notes.address,undefined);
 assert.equal(data.recall.completed,false);assert.equal(data.recall.stage,'recall');
});
test('read and skip reflect explicit actions, not merely opening a page', () => {
 const p=emptyLearning();assert.deepEqual(p.read,[]);
 markReading(p,'sleep','skip');assert.deepEqual(p.read,[]);assert.deepEqual(p.skipped,['sleep']);
 markReading(p,'sleep','read');assert.deepEqual(p.read,['sleep']);assert.deepEqual(p.skipped,[]);
 markReading(p,'fake','read');assert.deepEqual(p.read,['sleep']);
});
test('next reading honors the direction used to enter and never defaults to bread', () => {
 assert.equal(nextReading({kind:'chapter',id:'attention'},'study').path,'#learn/practice?route=study');
 assert.equal(nextReading({kind:'chapter',id:'attention'},'choices').path,'#learn/claims?route=choices');
 assert.equal(nextReading({kind:'chapter',id:'help'},'care').path,'#routes/care');
 assert.equal(nextReading({kind:'chapter',id:'help'},'living').path,'#guide/prices?route=living');
 assert.equal(validLearningLocation('guide/food'),'guide/food?route=world');
 assert.equal(validLearningLocation('learn/fake'),'');
 assert.equal(validLearningLocation('learn/sleep/extra'),'');
});
test('recall requires response, comparison and transfer; mistakes allow retry', () => {
 const p=emptyLearning();assert.equal(checkTransfer(p.recall,'desk').correct,false);
 p.recall.stage='transfer';p.recall.response='编号；闭馆前；损坏交服务台';p.recall.comparison=['included','missed','unsure'];
 assert.equal(checkTransfer(p.recall,'rack').correct,false);assert.equal(p.recall.completed,false);assert.equal(p.recall.stage,'transfer');
 assert.equal(checkTransfer(p.recall,'desk').correct,true);assert.equal(p.recall.completed,true);assert.equal(p.recall.attempts,2);
 const restored=decodeLearning(JSON.stringify(p));assert.deepEqual(restored.recall,p.recall);assert.deepEqual(restored.read,[]);
});

test('world chapter practice links match the chapter instead of a universal bread task', async () => {
 const {guidePage}=await import('../build/guide.js');
 assert.match(guidePage('transport'), /href="#quests\/predict"/);
 assert.match(guidePage('storage'), /href="#quests\/trace"/);
 assert.match(guidePage('prices'), /href="#quests\/predict"/);
 assert.match(guidePage('information'), /href="#quests\/observe"/);
 assert.doesNotMatch(guidePage('water'), /href="#quests\/trace"/);
});
