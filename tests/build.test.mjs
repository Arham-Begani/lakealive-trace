import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
test('portable build contains valid executable JavaScript and needs no external runtime assets',()=>{
 execFileSync(process.execPath,['scripts/build.mjs']);
 const html=readFileSync('dist/index.html','utf8');
 assert.ok(html.includes('<style>'));
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 assert.doesNotThrow(()=>new vm.Script(script));
 assert.ok(!/<script[^>]+src=/.test(html));
 assert.ok(!/<link[^>]+rel="stylesheet"/.test(html));
 assert.ok(!/\bimport\s.*from\s/.test(script));
});
