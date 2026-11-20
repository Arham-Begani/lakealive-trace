import { SITES, HYPOTHESES, siteById } from './scenarios.js';

export function expectedBand(hypothesis, siteId) {
 const site=siteById(siteId);
 if (!site || !Number.isInteger(hypothesis) || hypothesis<0 || hypothesis>7) throw new Error('Unknown model input');
 return (hypothesis & site.mask) ? [0.4,0.9] : [0.03,0.12];
}
export function latest(observation) { return observation.revisions.at(-1); }
export function compatible(h,site,low,high,tolerance=0) {
 const [a,b]=expectedBand(h,site);
 // A tiny arithmetic guard preserves mathematical endpoint overlap. It is not scientific uncertainty.
 const epsilon=1e-12;
 return high+tolerance+epsilon>=a && low-tolerance-epsilon<=b;
}
export function spentCredits(state) {
 return state.observations.filter(o=>o.origin==='collected').reduce((sum,o)=>sum+siteById(o.siteId).cost,0);
}
export function compatibleHypotheses(state) {
 return HYPOTHESES.map(h=>h.id).filter(h=>state.observations.every(o=>{
  const r=latest(o);
  return r.review || compatible(h,o.siteId,r.low,r.high,state.tolerance);
 }));
}
function candidatesFor(state,remaining) {
 const available=state.budget-spentCredits(state);
 const sampled=new Set(state.observations.map(o=>o.siteId));
 return SITES.filter(s=>!sampled.has(s.id)&&state.access[s.id]==='open'&&s.cost<=available).map(site=>{
  // Partition the entire nonnegative reading-center line at compatibility boundaries.
  // A predicted reading has half-width 0.03; user-entered intervals may be wider.
  const radius=.03+state.tolerance;
  const boundaries=[0,...remaining.flatMap(h=>{const [l,u]=expectedBand(h,site.id);return [Math.max(0,l-radius),u+radius];})].sort((a,b)=>a-b);
  const centers=[...boundaries,...boundaries.slice(1).map((v,i)=>(v+boundaries[i])/2)];
  const worstRemaining=Math.max(...centers.map(c=>remaining.filter(h=>compatible(h,site.id,Math.max(0,c-.03),c+.03,state.tolerance)).length));
  const low=remaining.filter(h=>!(h&site.mask)).length;
  const high=remaining.length-low;
  return {site,worstRemaining,guaranteedReduction:remaining.length-worstRemaining,low,high};
 }).filter(a=>a.guaranteedReduction>0).sort((a,b)=>a.worstRemaining-b.worstRemaining||a.site.cost-b.site.cost||a.site.id.localeCompare(b.site.id));
}
export function rankActions(state) {
 const remaining=compatibleHypotheses(state);
 if(state.conditionsChanged || remaining.length<2 || state.observations.some(o=>latest(o).review)) return [];
 return candidatesFor(state,remaining);
}
export function analyze(state) {
 const remaining=compatibleHypotheses(state), spent=spentCredits(state), available=state.budget-spent;
 const actions=rankActions(state);
 let status='active';
 if(state.conditionsChanged) status='conditions';
 else if(state.observations.some(o=>latest(o).review)) status='review';
 else if(!remaining.length) status='conflict';
 else if(remaining.length===1) status='narrowed';
 else if(available<1) status='budget';
 else if(!actions.length) status='inconclusive';
 const verificationPending=status==='narrowed'?SITES.filter(site=>site.kind==='branch'&&(remaining[0]&site.mask)).flatMap(site=>{
  const observation=state.observations.find(o=>o.siteId===site.id),r=observation&&latest(observation);
  if(r&&!compatible(0,site.id,r.low,r.high,state.tolerance))return [];
  const reason=observation?'broad':state.access[site.id]!=='open'?state.access[site.id]:site.cost>available?'budget':'ready';
  return [{site,band:expectedBand(remaining[0],site.id),feasible:reason==='ready',reason,observationId:observation?.id||null}];
 }):[];
 const verification=verificationPending.find(v=>v.feasible)||verificationPending[0]||null;
 if(verification)status='crosscheck';
 return {remaining,spent,available,actions,status,verification,verificationPending};
}
export function verificationMessage(v) {
 const name=v.site.name;
 if(v.reason==='broad')return name+': its interval cannot distinguish low from elevated. Review the observation; a genuinely more precise test requires a new sampling session.';
 if(v.reason==='budget')return name+': still unmeasured; its cross-check exceeds the remaining budget.';
 if(v.reason==='blocked'||v.reason==='unknown')return name+': still unmeasured; access is '+v.reason+'.';
 return name+': not measured yet. Test this prediction before closing the case.';
}
export const STATUS = {
 conditions:{label:'Conditions changed',title:'This session is paused.',text:'The underlying sampling conditions have changed. Existing readings should not be combined with a new session. Export this case, then start fresh.'},
 crosscheck:{label:'Cross-check pending',title:'One explanation remains. Its check is pending.',text:'Agreement by exclusion needs a discriminating observation. Preserve the unresolved cross-check; a matching model still does not prove a cause.'},
 active:{label:'Investigation open',title:'Let the next sample do more.',text:'Compare the explanations, then collect the most useful accessible sample.'},
 narrowed:{label:'Model narrowed',title:'One explanation fits. Keep the caveat.',text:'One modeled explanation fits the current readings. This is not proof of a pollution source; unmodeled causes, timing and transport can change the result.'},
 conflict:{label:'Model mismatch',title:'The evidence does not fit.',text:'No modeled explanation fits all accepted readings. Check timing, reference conditions, methods and recorded intervals. Do not attribute a source.'},
 review:{label:'Review needed',title:'Check the flagged reading first.',text:'A reading is marked for review. Advice is paused until it is corrected or accepted; flagged readings do not constrain the candidate set.'},
 budget:{label:'Budget reached',title:'Save the uncertainty, too.',text:'No test credits remain. Export the evidence and unresolved alternatives, or explicitly increase the scenario budget.'},
 inconclusive:{label:'Cannot narrow further',title:'The next step needs better evidence.',text:'No affordable, accessible, unmeasured site offers a guaranteed distinction under this model. Revisit access, precision, or the model with a qualified coordinator.'}
};
