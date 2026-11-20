import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createCase, recordSample, reviseSample, setAccess, setBudget } from '../src/state.js';
import { SITES, METHOD, MODEL_VERSION } from '../src/scenarios.js';
import { analyze, expectedBand } from '../src/model.js';

function rng(seed){let x=seed;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};}
function readingFor(mask,id){const [l,h]=expectedBand(mask,id),m=(l+h)/2;return {low:Math.max(0,m-.03),high:m+.03,method:METHOD,note:'Synthetic evaluation fixture',review:false};}
function startCase({mask=2,budget=4,access={},start=null}){
 let state=setBudget(createCase(),budget);state=reviseSample(state,'sample-L',start||readingFor(mask,'L'));
 for(const [id,value] of Object.entries(access))state=setAccess(state,id,value);
 return state;
}
function choices(state,policy){
 const a=analyze(state);if(['conflict','review','conditions'].includes(a.status))return [];
 if(a.remaining.length===1)return a.verification?.feasible?[a.verification.site]:[];
 if(policy==='trace')return a.actions.length?[a.actions[0].site]:[];
 const options=SITES.filter(s=>!state.observations.some(o=>o.siteId===s.id)&&state.access[s.id]==='open'&&s.cost<=a.available);
 if(policy==='fixed')return options.slice(0,1); // SITES orders A, B, C, J among unmeasured sites.
 return options;
}
function result(state,{mask,budget,access,policy,path,weight=1}){
 const a=analyze(state);
 return {mask,budget,access,policy,path,weight,remaining:a.remaining,status:a.status,credits:a.spent,
  correctlyNarrowed:a.remaining.length===1&&a.remaining[0]===mask,
  crosscheckPending:a.status==='crosscheck',
  falseNarrowing:a.remaining.length===1&&a.remaining[0]!==mask};
}
export function runCase({mask=2,budget=4,access={},policy='trace',seed=1,measurement=null,start=null}={}){
 let state=startCase({mask,budget,access,start});const random=rng(seed),path=[];
 for(let i=0;i<6;i++){
  const options=choices(state,policy);if(!options.length)break;
  const id=options[policy==='random'?Math.floor(random()*options.length):0].id;
  // Hidden ground truth is consulted only after the policy selects the action.
  state=recordSample(state,id,measurement?measurement(id):readingFor(mask,id));path.push(id);
 }
 return result(state,{mask,budget,access,policy,path});
}
export function runRandomCase({mask=2,budget=4,access={}}={}){
 const leaves=[];
 function visit(state,path,weight){
  const options=choices(state,'random-exact');
  if(!options.length){leaves.push(result(state,{mask,budget,access,policy:'random-exact',path,weight}));return;}
  for(const site of options)visit(recordSample(state,site.id,readingFor(mask,site.id)),[...path,site.id],weight/options.length);
 }
 visit(startCase({mask,budget,access}),[],1);
 return leaves;
}
export async function evaluate(){
 const policies=['trace','fixed','random-exact'],rows=[];
 for(let mask=0;mask<8;mask++)for(const budget of [1,3,4])for(const access of [{},{A:'blocked'},{A:'blocked',B:'unknown'}]){
  for(const policy of ['trace','fixed'])rows.push(runCase({mask,budget,access,policy}));
  rows.push(...runRandomCase({mask,budget,access}));
 }
 const round=v=>Number(v.toFixed(3));
 const summary=policies.map(policy=>{const r=rows.filter(r=>r.policy===policy),sum=fn=>r.reduce((n,x)=>n+(fn(x)?x.weight:0),0),cases=sum(()=>true);return {policy,cases:round(cases),trajectories:r.length,correctCompatibleSingleton:round(sum(x=>x.correctlyNarrowed)),pendingCrosscheck:round(sum(x=>x.crosscheckPending)),wrongSingleton:round(sum(x=>x.falseNarrowing)),unresolved:round(sum(x=>x.remaining.length!==1)),meanCredits:round(r.reduce((n,x)=>n+x.credits*x.weight,0)/cases)};});
 const high=readingFor(1,'L');
 const stress=[
 {name:'Coarse intervals preserve all seven candidates',result:runCase({start:high,measurement:()=>({low:0,high:.95,method:METHOD,note:'Wide interval',review:false})})},
 {name:'Contradictory upstream/downstream bands produce a mismatch',result:runCase({start:high,measurement:id=>readingFor(0,id)})},
 {name:'Unmodeled process mimics branch B: narrow but unsupported attribution',result:runCase({mask:0,start:high,measurement:id=>readingFor(2,id)})}
 ];
 const data={model:MODEL_VERSION,scope:'Synthetic finite-model test. Not field validation or an accuracy estimate.',design:'8 source subsets × 3 budgets × 3 access patterns = 72 equally weighted cases per policy. The random baseline exactly enumerates every legal trajectory with uniform probability at each action; leaves carry their product probability. All policies cross-check an unmeasured active branch after singleton inference if possible. Fixed visits A, B, C, J if accessible and affordable. Same outcome fixtures, costs and budgets.',summary,stress,rows};
 await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
 await writeFile(new URL('../artifacts/evaluation.json',import.meta.url),JSON.stringify(data,null,2));
 const table=['| Policy | Cases | Correct compatible singleton | Of these: check pending | Unresolved | Wrong singleton | Mean credits |','|---|---:|---:|---:|---:|---:|---:|',...summary.map(s=>`| ${s.policy} | ${s.cases} | ${s.correctCompatibleSingleton} | ${s.pendingCrosscheck} | ${s.unresolved} | ${s.wrongSingleton} | ${s.meanCredits} |`)].join('\n');
 const md=`# Synthetic evaluation\n\nModel: ${MODEL_VERSION}.\n\n${data.scope}\n\n${data.design}\n\n${table}\n\nRandom values are exact probability-weighted expectations (rounded for display), not counts from random seeds. There are ${rows.length} enumerated policy trajectories in the saved JSON. A compatible singleton is not a proven source; the pending-check column identifies singletons lacking a discriminating observation.\n\nAll test measurements are generated from the same deliberately simple forward model. Success here does not demonstrate performance on real water networks. Means include early stops and unresolved cases; lower spend alone does not mean better investigation. The fixed baseline is a reasonable bracketing sequence, not a deliberately weak opponent. There are no statistical significance claims.\n\n## Stress cases\n\n${stress.map(x=>`- **${x.name}:** ${x.result.status}; remaining [${x.result.remaining.join(', ')}]; path ${x.result.path.join(' → ')}; ${x.result.credits} credits.`).join('\n')}\n\nThe third stress case is an intentional counterexample: a closed-world model can narrow to one explanation even when the real cause is outside its hypothesis set. No abstention rule can detect every such case from indistinguishable observations. The interface therefore never calls a singleton a proven source, and field use requires a validated forward model, comparable measurements, expert review, and a defined sampling protocol.\n\n## Reproduce\n\nRun \`npm run evaluate\`. Full weighted trajectories are written to \`artifacts/evaluation.json\`. The planner never receives the hidden mask: only the evaluator uses it after action selection to generate measurements. This is modeled decision support, not an LLM-generated chemistry claim.\n`;
 await writeFile(new URL('../docs/evaluation.md',import.meta.url),md);
 console.log(table);console.log('Enumerated trajectories:',rows.length);console.log('Stress cases:',stress.map(s=>({name:s.name,status:s.result.status,remaining:s.result.remaining})));
 return data;
}
if(process.argv[1]===fileURLToPath(import.meta.url))await evaluate();
