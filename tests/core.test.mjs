import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze, rankActions, expectedBand } from '../src/model.js';
import { createCase, recordSample, reviseSample, setAccess, setBudget, setTolerance, importCase, serializeCase, markConditionsChanged } from '../src/state.js';
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
test('decimal boundary contact is compatible in both inference and recommendation scoring',()=>{
 let s=setTolerance(createCase(),.11);
 assert.equal(rankActions(s).length,0);
 s=recordSample(s,'A',reading(.23,.29));
 assert.deepEqual(analyze(s).remaining,[1,2,3,4,5,6,7]);
});
test('unaffordable or blocked singleton cross-checks remain explicitly pending in UI state and report',()=>{
 let s=recordSample(setBudget(createCase(),2),'A',reading(.08));s=recordSample(s,'B',reading(.08));
 assert.equal(analyze(s).status,'crosscheck');
 assert.equal(analyze(s).verification.feasible,false);assert.equal(analyze(s).verification.reason,'budget');
 assert.match(renderReport(s),/Cross-check pending/);
 s=setAccess(setBudget(s,4),'C','blocked');
 assert.equal(analyze(s).verification.reason,'blocked');
 assert.match(renderReport(s),/blocked/);
});
test('a broad sample does not count as a discriminating cross-check',()=>{
 let s=recordSample(createCase(),'A',reading(.08));s=recordSample(s,'B',reading(.08));s=recordSample(s,'C',reading(0,.9));
 assert.deepEqual(analyze(s).remaining,[4]);assert.equal(analyze(s).status,'crosscheck');
 assert.equal(analyze(s).verification.reason,'broad');
 assert.match(renderReport(s),/cannot distinguish/);
});
test('a legitimately large case with maximum-length notes can reload its own backup',()=>{
 let s=setBudget(createCase(),6);
 for(const site of ['A','B','C','J'])s=recordSample(s,site,reading(.5));
 for(const o of [...s.observations])for(let i=0;i<28;i++)s=reviseSample(s,o.id,{...reading(.5),note:'"'.repeat(1000)});
 const backup=serializeCase(s);assert.ok(backup.length>300000);
 assert.deepEqual(importCase(backup),s);
});

test('declaring changed water conditions suspends new sampling and survives backup restore',()=>{
 const s=markConditionsChanged(createCase());
 assert.equal(analyze(s).status,'conditions');assert.equal(rankActions(s).length,0);
 assert.throws(()=>recordSample(s,'A',reading(.5)),/Conditions changed/);
 assert.equal(importCase(serializeCase(s)).conditionsChanged,true);
 assert.match(renderReport(s),/Archived-session/);
 assert.equal(createCase(s.scenarioId).conditionsChanged,false);
});
