import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { searchContent, emptyProgress, canComplete } from '../build/model.js';
import { homePage } from '../build/ui.js';

test('home presents all six learning directions instead of a bread-first entry', () => {
  const html = homePage(emptyProgress());
  for (const title of ['照顾好自己', '学会学习和判断', '独立安排生活', '与人相处和合作', '看懂世界怎样运转', '做选择，建设自己的生活']) assert.ok(html.includes(title), title);
  assert.ok(!html.includes('data-recipe="bread"'));
});
test('everyday sleep and memory questions find actual foundation chapters', () => {
  assert.equal(searchContent('睡不醒')[0]?.id, 'sleep');
  assert.equal(searchContent('看完记不住')[0]?.id, 'memory');
  assert.equal(searchContent('不知道先学什么')[0]?.id, 'routes');
});
test('navigation does not use food as the default guide', () => {
  assert.doesNotMatch(fs.readFileSync('src/app.ts','utf8'), /id\s*\|\|\s*'food'|\['guide\/food'/);
});
test('existing exercises can be attempted independently without invalid ids', () => {
  assert.equal(canComplete('predict', []), true);
  assert.equal(canComplete('observe', []), true);
  assert.equal(canComplete('invented', []), false);
});
