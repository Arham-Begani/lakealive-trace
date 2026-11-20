import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze, rankActions, expectedBand } from '../src/model.js';
import { createCase, recordSample, reviseSample, setAccess, setBudget, setTolerance, importCase, serializeCase } from '../src/state.js';
import { renderReport } from '../src/report.js';

const reading = (low, high = low) => ({ low, high, method: 'simulated-colorimetry', note: '', review: false });

test('outlet excess excludes only the zero-branch explanation; reference alone cannot identify a branch', () => {
 const s = createCase();
 assert.deepEqual(analyze(s).remaining, [1,2,3,4,5,6,7]);
 assert.deepEqual(expectedBand(0,'R'), [0.03,0.12]);
 assert.equal(rankActions(s)[0].worstRemaining, 4);
 assert.equal(rankActions(s)[0].site.id, 'A');
});
test('two simultaneous upstream signals remain possible, without forcing one culprit', () => {
 let s = recordSample(createCase(), 'A', reading(.5));
 s = recordSample(s, 'B', reading(.08));
 assert.deepEqual(analyze(s).remaining, [1,5]);
 s = recordSample(s, 'C', reading(.6));
 assert.deepEqual(analyze(s).remaining, [5]);
 assert.equal(analyze(s).status, 'narrowed');
});
test('conflicting outlet and upstream evidence triggers a model mismatch', () => {
 let s = createCase();
 for (const site of ['A','B','C']) s = recordSample(s, site, reading(.08));
 assert.equal(analyze(s).status,'conflict');
 assert.equal(rankActions(s).length,0);
});
test('wide intervals preserve uncertainty instead of being coerced to midpoint precision', () => {
 const s = recordSample(createCase(), 'A', reading(0,.9));
 assert.deepEqual(analyze(s).remaining, [1,2,3,4,5,6,7]);
});
test('unknown or blocked access and exhausted budgets exclude recommendations', () => {
 let s = setAccess(setAccess(createCase(),'A','blocked'),'B','unknown');
 assert.equal(rankActions(s)[0].site.id,'C');
 assert.throws(()=>recordSample(s,'A',reading(.5)), /access/i);
 s = setBudget(s,0);
 assert.equal(analyze(s).status,'budget');
 assert.equal(rankActions(s).length,0);
});
test('correction reopens conclusions and never charges or double-counts a revision', () => {
 let s = createCase();
 for (const [site,v] of [['A',.5],['B',.08],['C',.08]]) s = recordSample(s,site,reading(v));
 assert.deepEqual(analyze(s).remaining,[1]);
 s = reviseSample(s,'sample-A',reading(0,.9));
 assert.deepEqual(analyze(s).remaining,[1]); // outlet plus B/C still constrain A
 s = reviseSample(s,'sample-B',reading(0,.9));
 assert.deepEqual(analyze(s).remaining,[1,2,3]);
 assert.equal(analyze(s).spent,3);
 assert.equal(s.observations.find(o=>o.id==='sample-A').revisions.length,2);
 assert.throws(()=>recordSample(s,'A',reading(.5)),/already/i);
});
test('flagged evidence suspends advice until reviewed; invalid readings cannot enter the case', () => {
 let s = recordSample(createCase(),'A',{...reading(.5),review:true});
 assert.equal(analyze(s).status,'review');
 assert.equal(rankActions(s).length,0);
 s = reviseSample(s,'sample-A',reading(.5));
 assert.equal(analyze(s).status,'active');
 for (const r of [reading(NaN),reading(-1),reading(.8,.1),{...reading(.5),method:'unknown'}]) {
  assert.throws(()=>recordSample(createCase(),'A',r));
 }
});
test('extra uncertainty can reopen an apparent contradiction', () => {
 const s = recordSample(createCase(),'A',reading(.25));
 assert.equal(analyze(s).status,'conflict');
 assert.ok(analyze(setTolerance(s,.2)).remaining.length>0);
});
test('cannot lower total budget below already spent credits or spend over budget', () => {
 const s = recordSample(setBudget(createCase(),1),'A',reading(.5));
 assert.throws(()=>recordSample(s,'B',reading(.5)),/budget/i);
 assert.throws(()=>setBudget(s,0),/spent/i);
});
test('backup round-trip retains revision history, while malformed/tampered budgets and methods fail closed', () => {
 const s = reviseSample(recordSample(createCase(),'A',reading(.5)),'sample-A',reading(.7));
 assert.deepEqual(importCase(serializeCase(s)),s);
 const bad = JSON.parse(serializeCase(s)); bad.budget=0;
 assert.throws(()=>importCase(JSON.stringify(bad)),/budget/i);
 bad.budget=4; bad.observations[0].revisions[0].method='nitrate';
 assert.throws(()=>importCase(JSON.stringify(bad)),/method/i);
 assert.throws(()=>importCase('{"schema":"other"}'),/schema/i);
});
test('report escapes user text, includes uncertainty and full revision history', () => {
 let s=recordSample(createCase(),'A',{...reading(.5),note:'<script>alert(1)</script>'});
 s=reviseSample(s,'sample-A',{...reading(.6),note:'corrected'});
 const html=renderReport(s);
 assert.ok(!html.includes('<script>alert(1)</script>'));
 assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(html.includes('corrected'));
 assert.ok(html.includes('synthetic'));
 assert.ok(html.includes('0.5'));
});
test('a surviving explanation inferred by exclusion gets an explicit cross-check at its unmeasured branch',()=>{
 let s=recordSample(createCase(),'A',reading(.08));s=recordSample(s,'B',reading(.08));
 const result=analyze(s);assert.deepEqual(result.remaining,[4]);assert.equal(result.verification.site.id,'C');
 s=recordSample(s,'C',reading(.08));assert.equal(analyze(s).status,'conflict');
 assert.equal(analyze(s).verification,null);
});
