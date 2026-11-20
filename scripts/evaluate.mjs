import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createCase, recordSample, reviseSample, setAccess, setBudget } from '../src/state.js';
import { SITES, METHOD, MODEL_VERSION } from '../src/scenarios.js';
import { analyze, expectedBand } from '../src/model.js';

function rng(seed){let x=seed;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};}
function readingFor(mask,id){const [l,h]=expectedBand(mask,id),m=(l+h)/2;return {low:Math.max(0,m-.03),high:m+.03,method:METHOD,note:'Synthetic evaluation fixture',review:false};}
function choose(state,policy,random){
 const a=analyze(state);if(['conflict','review'].includes(a.status))return null;
 if(a.status==='narrowed')return a.verification?.site.id||null;
 if(policy==='trace')return a.actions[0]?.site.id||null;
 const options=SITES.filter(s=>!state.observations.some(o=>o.siteId===s.id)&&state.access[s.id]==='open'&&s.cost<=a.available);
 if(!options.length)return null;
 if(policy==='random')return options[Math.floor(random()*options.length)].id;
 return ['A','B','C','J'].find(id=>options.some(s=>s.id===id))||null;
}
export function runCase({mask=2,budget=4,access={},policy='trace',seed=1,measurement=null,start=null}){
 let state=setBudget(createCase(),budget);state=reviseSample(state,'sample-L',start||readingFor(mask,'L'));
 for(const [id,value] of Object.entries(access))state=setAccess(state,id,value);
 const random=rng(seed),path=[];
 for(let i=0;i<6;i++){
  const id=choose(state,policy,random);if(!id)break;
  // Ground truth is used only after policy selection, to synthesize the observation.
  state=recordSample(state,id,measurement?measurement(id):readingFor(mask,id));path.push(id);
 }
 const a=analyze(state);
 return {mask,budget,access,policy,seed,path,remaining:a.remaining,status:a.status,credits:a.spent,correctlyNarrowed:a.remaining.length===1&&a.remaining[0]===mask,falseNarrowing:a.remaining.length===1&&a.remaining[0]!==mask};
}
export async function evaluate(){
 const policies=['trace','fixed','random'],rows=[];
 for(const policy of policies)for(let mask=0;mask<8;mask++)for(const budget of [1,3,4])for(const access of [{},{A:'blocked'},{A:'blocked',B:'unknown'}])for(const seed of [1,7,42,91]) rows.push(runCase({mask,budget,access,policy,seed}));
 const summary=policies.map(policy=>{const r=rows.filter(r=>r.policy===policy);return {policy,runs:r.length,correctlyNarrowed:r.filter(x=>x.correctlyNarrowed).length,falseNarrowing:r.filter(x=>x.falseNarrowing).length,unresolved:r.filter(x=>x.remaining.length!==1).length,meanCredits:Number((r.reduce((n,x)=>n+x.credits,0)/r.length).toFixed(3))};});
 const high=readingFor(1,'L');
 const stress=[
 {name:'Coarse intervals preserve all seven candidates',result:runCase({start:high,measurement:()=>({low:0,high:.95,method:METHOD,note:'Wide interval',review:false})})},
 {name:'Contradictory upstream/downstream bands produce a mismatch',result:runCase({start:high,measurement:id=>readingFor(0,id)})},
 {name:'Unmodeled process mimics branch B: narrow but unsupported attribution',result:runCase({mask:0,start:high,measurement:id=>readingFor(2,id)})}
 ];
 const data={model:MODEL_VERSION,scope:'Synthetic finite-model test. Not field validation or an accuracy estimate.',design:'8 source subsets × 3 budgets × 3 access patterns × 4 deterministic random seeds per policy; same outcome fixtures and costs. All policies cross-check an unmeasured active branch after singleton inference. Fixed visits A, B, C, J if accessible and affordable. Random samples uniformly among affordable unmeasured open sites.',summary,stress,rows};
 await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
 await writeFile(new URL('../artifacts/evaluation.json',import.meta.url),JSON.stringify(data,null,2));
 const table=['| Policy | Runs | Correct singleton | Unresolved | Wrong singleton | Mean credits |','|---|---:|---:|---:|---:|---:|',...summary.map(s=>`| ${s.policy} | ${s.runs} | ${s.correctlyNarrowed} | ${s.unresolved} | ${s.falseNarrowing} | ${s.meanCredits} |`)].join('\n');
 const md=`# Synthetic evaluation\n\nModel: ${MODEL_VERSION}.\n\n${data.scope}\n\n${data.design}\n\n${table}\n\nEvery test is generated from the same deliberately simple forward model; success on these cases does not demonstrate performance on real water networks. Repeated deterministic seeds duplicate fixed/Trace runs so each policy has the same case weighting. Means include early stops and unresolved cases; lower spend alone does not mean better investigation. There are no statistical significance claims.\n\n## Stress cases\n\n${stress.map(x=>`- **${x.name}:** ${x.result.status}; remaining [${x.result.remaining.join(', ')}]; path ${x.result.path.join(' → ')}; ${x.result.credits} credits.`).join('\n')}\n\nThe third stress case is an intentional counterexample: a closed-world model can narrow to one explanation even when the real cause is outside its hypothesis set. No abstention rule can detect every such case from indistinguishable observations. The interface therefore never calls a singleton a proven source, and field use requires a validated forward model, comparable measurements, expert review, and a defined sampling protocol.\n\n## Reproduce\n\nRun \`npm run evaluate\`. Full trajectories are written to \`artifacts/evaluation.json\`. The planner never receives the hidden mask: only the evaluator uses it after action selection to generate measurements. The demonstration is explicitly modeled decision support, not an LLM-generated chemistry claim.\n`;
 await writeFile(new URL('../docs/evaluation.md',import.meta.url),md);
 console.log(table);console.log('\nStress cases:',stress.map(s=>({name:s.name,status:s.result.status,remaining:s.result.remaining})));
 return data;
}
if(process.argv[1]===fileURLToPath(import.meta.url))await evaluate();
