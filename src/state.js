import { SITES, METHOD, MODEL_VERSION, scenarioById, siteById } from './scenarios.js';
import { spentCredits } from './model.js';
export const MAX_BACKUP_BYTES=4*1024*1024;
const now=()=>new Date().toISOString();
const clone=s=>structuredClone(s);
const fail=message=>{throw new Error(message);};
function validReading(r) {
 if(!r||!Number.isFinite(r.low)||!Number.isFinite(r.high)||r.low<0||r.high>10||r.low>r.high) fail('Enter a valid interval from 0 to 10, with lower ≤ upper.');
 if(r.method!==METHOD) fail('This model only supports the declared simulated method.');
 if(typeof r.note!=='string'||r.note.length>1000||typeof r.review!=='boolean') fail('Invalid reading note or review flag.');
}
function event(s,type,detail) { s.history.push({time:now(),type,detail}); if(s.history.length>200) fail('History limit reached. Export this case and start a new one.'); }
function stampReading(r) {validReading(r);return {...r,time:now()};}
export function createCase(scenarioId='first-signal') {
 const scenario=scenarioById(scenarioId); if(!scenario) fail('Unknown scenario.');
 const time=now();
 return {schema:'trace.case.v1',modelVersion:MODEL_VERSION,scenarioId,createdAt:time,conditionsChanged:false,budget:scenario.budget,tolerance:0,
  access:Object.fromEntries(SITES.map(s=>[s.id,scenario.access[s.id]||'open'])),
  observations:[['R',.06,.1],['L',.54,.6]].map(([siteId,low,high])=>({id:'sample-'+siteId,siteId,origin:'historical',revisions:[{low,high,method:METHOD,note:'Synthetic starting observation; supplied at no additional test cost.',review:false,time}]})),
  history:[{time,type:'created',detail:'Started '+scenario.name+' with two synthetic historical observations.'}]};
}
export function recordSample(state,siteId,r) {
 validReading(r);if(state.conditionsChanged)fail('Conditions changed: export this case and start a new session before sampling.');const s=clone(state),site=siteById(siteId);
 if(!site) fail('Unknown site.');
 if(s.observations.some(o=>o.siteId===siteId)) fail('This site already has a sample. Edit its current observation instead.');
 if(s.access[siteId]!=='open') fail('Confirm open access before recording this sample.');
 if(spentCredits(s)+site.cost>s.budget) fail('This sample exceeds the remaining budget.');
 s.observations.push({id:'sample-'+siteId,siteId,origin:'collected',revisions:[stampReading(r)]});
 event(s,'sample','Recorded '+site.name+' · '+site.cost+' test credit(s).');return s;
}
export function reviseSample(state,id,r) {
 validReading(r);const s=clone(state),o=s.observations.find(x=>x.id===id);if(!o) fail('Observation not found.');
 if(o.revisions.length>=50) fail('Revision limit reached.');
 o.revisions.push(stampReading(r));event(s,'revision','Revised '+siteById(o.siteId).name+'; retained original reading.');return s;
}
export function setAccess(state,id,access) {
 if(!siteById(id)||!['open','blocked','unknown'].includes(access)) fail('Invalid access condition.');
 const s=clone(state);s.access[id]=access;event(s,'access',siteById(id).name+' access → '+access);return s;
}
export function setBudget(state,budget) {
 if(!Number.isInteger(budget)||budget<0||budget>20) fail('Budget must be a whole number from 0 to 20.');
 if(budget<spentCredits(state)) fail('Budget cannot be below credits already spent.');
 const s=clone(state);s.budget=budget;event(s,'budget','Total budget → '+budget+' credits.');return s;
}
export function setTolerance(state,tolerance) {
 if(!Number.isFinite(tolerance)||tolerance<0||tolerance>.2) fail('Additional tolerance must be from 0 to 0.20.');
 const s=clone(state);s.tolerance=tolerance;event(s,'assumption','Extra interval tolerance → '+tolerance+' mg/L as P; recomputed all evidence.');return s;
}
export function markConditionsChanged(state) {const s=clone(state);if(!s.conditionsChanged){s.conditionsChanged=true;event(s,'conditions','Underlying water conditions or sampling session changed; new sampling paused.');}return s;}
export function serializeCase(s) { return JSON.stringify(s,null,2); }
export function importCase(text) {
 if(typeof text!=='string'||new TextEncoder().encode(text).byteLength>MAX_BACKUP_BYTES) fail('Backup is too large.');
 let s;try{s=JSON.parse(text);}catch{fail('This is not a valid JSON backup.');}
 if(s?.schema!=='trace.case.v1'||s.modelVersion!==MODEL_VERSION) fail('Unsupported backup schema or model version.');
 if(s.conditionsChanged!==undefined&&typeof s.conditionsChanged!=='boolean')fail('Invalid session condition flag.');
 if(!scenarioById(s.scenarioId)) fail('Unknown scenario.');
 const validTime=t=>typeof t==='string'&&t.length<40&&Number.isFinite(Date.parse(t));
 if(!validTime(s.createdAt)) fail('Invalid creation time.');
 if(!Number.isInteger(s.budget)||s.budget<0||s.budget>20) fail('Invalid budget.');
 if(!Number.isFinite(s.tolerance)||s.tolerance<0||s.tolerance>.2) fail('Invalid tolerance.');
 if(!s.access||SITES.some(site=>!['open','unknown','blocked'].includes(s.access[site.id]))) fail('Invalid access data.');
 if(!Array.isArray(s.observations)||s.observations.length<2||s.observations.length>6) fail('Invalid observations.');
 const seen=new Set();
 for(const o of s.observations) {
  if(!siteById(o.siteId)||seen.has(o.siteId)||o.id!=='sample-'+o.siteId) fail('Invalid or duplicate observation.');
  seen.add(o.siteId);
  if(o.origin!==(['R','L'].includes(o.siteId)?'historical':'collected')) fail('Invalid sample origin.');
  if(!Array.isArray(o.revisions)||!o.revisions.length||o.revisions.length>50) fail('Invalid revisions.');
  for(const r of o.revisions) {validReading(r);if(!validTime(r.time)) fail('Invalid reading time.');}
 }
 if(!seen.has('R')||!seen.has('L')) fail('Starting observations missing.');
 if(spentCredits(s)>s.budget) fail('Backup budget is below credits spent.');
 if(!Array.isArray(s.history)||s.history.length<1||s.history.length>200||s.history.some(h=>!validTime(h.time)||typeof h.type!=='string'||h.type.length>30||typeof h.detail!=='string'||h.detail.length>1000)) fail('Invalid history.');
 // Reconstruct known fields; imported arbitrary properties never become application state.
 return {schema:s.schema,modelVersion:s.modelVersion,scenarioId:s.scenarioId,createdAt:s.createdAt,conditionsChanged:s.conditionsChanged||false,budget:s.budget,tolerance:s.tolerance,
 access:Object.fromEntries(SITES.map(x=>[x.id,s.access[x.id]])),observations:s.observations.map(o=>({id:o.id,siteId:o.siteId,origin:o.origin,revisions:o.revisions.map(r=>({low:r.low,high:r.high,method:r.method,note:r.note,review:r.review,time:r.time}))})),history:s.history.map(h=>({time:h.time,type:h.type,detail:h.detail}))};
}
