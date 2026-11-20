export const MODEL_VERSION = 'trace-intervals-1.0';
export const METHOD = 'simulated-colorimetry';
export const UNIT = 'mg/L as P';
export const SITES = [
 {id:'R',name:'Reference reach',short:'Reference',kind:'reference',mask:0,cost:1,x:108,y:120,description:'A separate reference reach. A reading outside the reference band challenges the baseline assumption.'},
 {id:'A',name:'West inlet',short:'West',kind:'branch',mask:1,cost:1,x:185,y:270,description:'Samples branch A before it joins the central channel. Separates explanations that include the west branch.'},
 {id:'B',name:'North inlet',short:'North',kind:'branch',mask:2,cost:1,x:394,y:140,description:'Samples branch B upstream of the junction. Separates explanations that include the north branch.'},
 {id:'C',name:'East inlet',short:'East',kind:'branch',mask:4,cost:1,x:651,y:245,description:'Samples branch C before lake entry. Separates explanations that include the east branch.'},
 {id:'J',name:'Two-branch junction',short:'Junction',kind:'junction',mask:3,cost:2,x:363,y:337,description:'A combined sample from A and B. Useful when individual branches are inaccessible; cannot by itself distinguish A from B.'},
 {id:'L',name:'Lake entry',short:'Lake entry',kind:'outlet',mask:7,cost:1,x:482,y:435,description:'Combined inflow before broad lake mixing. Historical excess here starts the investigation.'}
];
export const HYPOTHESES = Array.from({length:8},(_,id)=>({id, name:id===0?'No modeled branch':SITES.filter(s=>s.kind==='branch'&&(s.mask&id)).map(s=>s.short).join(' + ')}));
export const SCENARIOS = [
 {id:'first-signal',name:'A signal upstream',tag:'Start here',subtitle:'One lake. Three inlets. Four test credits.',description:'A reference reading is low, but the combined inflow is elevated. Find which modeled upstream explanations still fit.',budget:4,access:{}},
 {id:'two-signals',name:'More than one answer',tag:'Multiple branches',subtitle:'A single-source assumption would miss the story.',description:'Follow the evidence when more than one branch may contribute. Trace keeps multi-branch explanations in play.',budget:4,access:{}},
 {id:'restricted',name:'The closed footpath',tag:'Access constraints',subtitle:'The most useful site is not always reachable.',description:'West is blocked and north access is unverified. Explore what the remaining sites can—and cannot—resolve.',budget:4,access:{A:'blocked',B:'unknown'}},
 {id:'ambiguous',name:'The uncertain reading',tag:'Wide intervals',subtitle:'A coarse measurement must stay coarse.',description:'The simulated method returns broad intervals. Watch the system preserve uncertainty instead of inventing precision.',budget:4,access:{}},
 {id:'contradiction',name:'When the story breaks',tag:'Model mismatch',subtitle:'Conflicting evidence should change the conclusion.',description:'The downstream observation and subsequent upstream samples disagree with the model. Investigate until the assumptions fail.',budget:4,access:{}}
];
export function siteById(id) { return SITES.find(s=>s.id===id); }
export function scenarioById(id) { return SCENARIOS.find(s=>s.id===id); }
export function hypothesisName(id) { return HYPOTHESES.find(h=>h.id===id)?.name ?? 'Unknown'; }
