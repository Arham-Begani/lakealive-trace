import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { JSDOM, VirtualConsole } from 'jsdom';
execFileSync(process.execPath,['scripts/build.mjs']);
const html=readFileSync('dist/index.html','utf8');
function mount(saved){
 const errors=[],downloads=[];const console=new VirtualConsole();console.on('jsdomError',err=>errors.push(err));
 const dom=new JSDOM(html,{url:'https://trace.test/',runScripts:'dangerously',virtualConsole:console,beforeParse(w){
  w.structuredClone=structuredClone;w.TextEncoder=TextEncoder;w.scrollTo=()=>{};
  // DOM-only tests: bridge browser-native dialog and download APIs, not app behavior.
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;};
  w.URL.createObjectURL=blob=>{downloads.push(blob);return 'blob:trace-test';};w.URL.revokeObjectURL=()=>{};
  w.HTMLAnchorElement.prototype.click=function(){downloads.push(this.download);};
  if(saved)w.localStorage.setItem('lakealive.trace.v1',saved);
 }});
 const d=dom.window.document;
 const click=sel=>{const node=d.querySelector(sel);assert.ok(node,'Missing UI control '+sel);node.click();};
 const submit=id=>d.querySelector(id).dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
 const snapshot=()=>JSON.parse(dom.window.localStorage.getItem('lakealive.trace.v1'));
 const collect=id=>{click('[data-sample="'+id+'"]');click('[data-action="simulate"]');submit('#sample-form');};
 return {dom,d,errors,downloads,click,submit,snapshot,collect};
}
test('actual app flow collects readings, updates explanation, preserves revisions, exports, and survives reload',()=>{
 const u=mount();
 try{
  assert.match(u.d.querySelector('h1').textContent,/Follow the evidence/);
  for(const id of ['A','B','C'])u.collect(id);
  assert.match(u.d.querySelector('.result-name').textContent,/North/);
  assert.equal(u.snapshot().observations.length,5);
  u.click('[data-tab="notebook"]');u.click('[data-edit="sample-B"]');
  const form=u.d.querySelector('#sample-form');form.elements.low.value='0';form.elements.high.value='.95';
  u.submit('#sample-form');assert.equal(u.snapshot().observations.find(o=>o.siteId==='B').revisions.length,2);
  u.click('[data-action="backup"]');assert.ok(u.downloads.includes('trace-first-signal.json'));
  u.click('[data-tab="report"]');u.click('[data-action="report-download"]');assert.ok(u.downloads.includes('trace-investigation-report.html'));
  assert.match(u.d.querySelector('.report-document').textContent,/superseded/);
  const v=mount(JSON.stringify(u.snapshot()));try{assert.equal(v.d.querySelectorAll('.map-pin').length,6);assert.match(v.d.body.textContent,/1 still fit/);assert.deepEqual(v.errors,[]);}finally{v.dom.window.close();}
  assert.deepEqual(u.errors,[]);
 }finally{u.dom.window.close();}
});
test('settings exclude blocked sites and invalid interval stays in the form without charging',()=>{
 const u=mount();try{
  u.click('[data-action="settings"]');const f=u.d.querySelector('#settings-form');f.elements['access-A'].value='blocked';u.submit('#settings-form');
  assert.equal(u.d.querySelector('.decision-panel [data-sample]').dataset.sample,'B');
  u.click('.decision-panel [data-sample]');const s=u.d.querySelector('#sample-form');s.elements.low.value='.9';s.elements.high.value='.2';u.submit('#sample-form');
  assert.match(u.d.querySelector('.form-error').textContent,/valid interval/);assert.equal(u.snapshot().observations.length,2);assert.ok(u.d.querySelector('#modal').open);
  assert.deepEqual(u.errors,[]);
 }finally{u.dom.window.close();}
});
test('the contradictory case visibly abstains instead of announcing a source',()=>{
 const u=mount();try{
  const select=u.d.querySelector('#scenario');select.value='contradiction';select.dispatchEvent(new u.dom.window.Event('change',{bubbles:true}));
  u.click('[data-reset="contradiction"]');for(const id of ['A','B','C'])u.collect(id);
  assert.match(u.d.querySelector('.decision-panel h2').textContent,/evidence does not fit/);
  assert.equal(u.d.querySelector('.result-name'),null);
  u.click('[data-tab="method"]');assert.equal(u.d.querySelectorAll('.model-table tbody tr').length,8);
  assert.deepEqual(u.errors,[]);
 }finally{u.dom.window.close();}
});
test('a threshold-adjacent input displays the same precision that drives the model',()=>{
 const u=mount();try{
  u.click('[data-sample="A"]');const f=u.d.querySelector('#sample-form');f.elements.low.value='0.39999';f.elements.high.value='0.39999';u.submit('#sample-form');
  u.click('[data-tab="notebook"]');assert.match(u.d.querySelector('.evidence-list').textContent,/0\.39999/);
 }finally{u.dom.window.close();}
});

test('conditions-changed control pauses the case and names its dialog for assistive technology',()=>{
 const u=mount();try{
  u.click('[data-action="settings"]');
  const modal=u.d.querySelector('#modal');assert.ok(modal.getAttribute('aria-labelledby'));
  u.d.querySelector('#settings-form').elements.conditions.checked=true;u.submit('#settings-form');
  assert.match(u.d.querySelector('.decision-panel').textContent,/session is paused/);
  assert.ok(u.snapshot().conditionsChanged);
  assert.equal(u.d.querySelector('.selected-card [data-sample]').disabled,true);
 }finally{u.dom.window.close();}
});
