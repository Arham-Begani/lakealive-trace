import test from 'node:test';
import assert from 'node:assert/strict';
import { runCase } from '../scripts/evaluate.mjs';
import { METHOD } from '../src/scenarios.js';
test('evaluation cross-checks inferred branch C and never exceeds the same budget',()=>{
 const result=runCase({mask:4});
 assert.deepEqual(result.path,['A','B','C']);assert.equal(result.correctlyNarrowed,true);assert.equal(result.credits,3);
 for(const policy of ['trace','fixed','random']){
  const constrained=runCase({mask:5,budget:1,policy});assert.ok(constrained.credits<=1);assert.ok(constrained.remaining.length>1);
 }
});
test('contradiction stress case cannot be mistaken for a successful modeled source',()=>{
 const r=runCase({mask:2,measurement:()=>({low:.045,high:.105,method:METHOD,note:'low',review:false})});
 assert.equal(r.status,'conflict');assert.deepEqual(r.remaining,[]);assert.equal(r.correctlyNarrowed,false);
});
