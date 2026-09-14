import { test } from 'node:test';
import assert from 'node:assert/strict';
import { projectPrice, decodeProgress, canComplete, safeText } from '../build/model.js';

test('synthetic transport shock affects only a 10% cost share, with adjustable pass-through', () => {
  assert.equal(projectPrice(50, 100), 105);
  assert.equal(projectPrice(50, 50), 102.5);
  assert.equal(projectPrice(0, 100), 100);
  assert.equal(projectPrice(100, 0), 100);
});
test('model clamps out-of-domain input and rejects NaN', () => {
  assert.equal(projectPrice(200, 100), 110);
  assert.equal(projectPrice(-20, 100), 100);
  assert.equal(projectPrice(NaN, 100), 100);
});
test('legacy exercises are independent; unknown quest IDs never pass', () => {
  assert.equal(canComplete('trace', []), true);
  assert.equal(canComplete('predict', []), true);
  assert.equal(canComplete('observe', ['trace']), true);
  assert.equal(canComplete('observe', ['trace', 'predict']), true);
  assert.equal(canComplete('invented', []), false);
});
test('storage recovery tolerates broken JSON, null, arrays, and future schema', () => {
  for (const input of [null, '', '{', 'null', '[]', '{"version":99,"completed":["trace"]}']) {
    assert.deepEqual(decodeProgress(input).completed, []);
  }
});
test('valid legacy completions are preserved without inventing new completions', () => {
  const good = decodeProgress(JSON.stringify({version:1, completed:['trace','predict'], visited:['energy'], notes:{observe:'a package label'}}));
  assert.deepEqual(good.completed, ['trace','predict']);
  assert.deepEqual(good.visited, ['energy']);
  assert.equal(good.notes.observe, 'a package label');
  const bad = decodeProgress(JSON.stringify({version:1,completed:['observe','trace','fake','trace'],visited:['energy',false,'evil']}));
  assert.deepEqual(bad.completed, ['trace','observe']);
  assert.deepEqual(bad.visited, ['energy']);
});
test('user notes cannot inject HTML into view templates', () => {
  assert.equal(safeText('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});

test('specific price intent outranks a generic food alias', async () => {
  const { searchContent } = await import('../build/model.js');
  for (const query of ['食物为什么变贵', '面包涨价了', 'food expensive', '面包运输成本']) {
    assert.equal(searchContent(query)[0]?.id, 'cost', query);
  }
  assert.equal(searchContent('面包从哪里来')[0]?.id, 'bread');
  assert.equal(searchContent('ENERGY')[0]?.id, 'energy');
  assert.deepEqual(searchContent('如何申请火星土地许可证'), []);
});

test('the content slice has valid edges, source references, and independent learning prerequisites', async () => {
  const { validateContent, connected } = await import('../build/model.js');
  const { concepts, sources, recipes } = await import('../build/content.js');
  assert.equal(concepts.length, 12);
  assert.deepEqual(validateContent(), []);
  const ids=new Set(sources.map(s=>s.id));
  for (const c of concepts) {
    assert.ok(connected(c.id).length>0, `${c.id} must not be isolated`);
    assert.ok(c.sources.every(s=>ids.has(s)), `${c.id} missing source`);
    assert.ok(c.fact && c.why && c.inputs.length && c.outputs.length && c.question);
  }
  for (const s of sources) {
    assert.equal(new URL(s.url).protocol, 'https:');
    assert.ok(s.scope && s.checked);
  }
  assert.equal(recipes.find(r=>r.id==='cost').relationMode, 'context');
  assert.equal(recipes.find(r=>r.id==='bread').relationMode, 'flow');
});
test('serialized real observations keep their separate epistemic categories and size limit', () => {
  const state={version:1,completed:['trace','predict','observe'],visited:['food'],notes:{observe:'包装上印着生产商地址',inference:'可能经过物流交接',unknown:'不知道原料产地',private:'discard'}};
  const saved=decodeProgress(JSON.stringify(state));
  assert.deepEqual(saved.completed,state.completed);
  assert.deepEqual(Object.keys(saved.notes), ['observe','inference','unknown']);
  assert.equal(saved.notes.observe,state.notes.observe);
  assert.equal(decodeProgress(JSON.stringify({...state,notes:{observe:'a'.repeat(2000)}})).notes.observe.length,1600);
});
