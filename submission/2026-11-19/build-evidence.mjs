import {writeFileSync} from 'node:fs';
import {createCase,recordSample,reviseSample,serializeCase,importCase} from '../../src/state.js';
import {analyze} from '../../src/model.js';
import {simulatedReading} from '../../src/simulator.js';
import {mapSVG} from '../../src/map.js';
import {renderReport} from '../../src/report.js';
import assert from 'node:assert/strict';
const base=new URL('./assets/',import.meta.url);
const outputs=[];
function snapshot(name,s){const a=analyze(s);const row={name,remaining:a.remaining,status:a.status,spent:a.spent,next:a.actions[0]?.site.id??null,crossCheck:a.verification?.site.id??null};outputs.push(row);return row;}
let normal=createCase('first-signal');snapshot('start',normal);
const raw=mapSVG(normal,'A','A').replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ').replaceAll('system-ui,sans-serif','DejaVu Sans').replaceAll('system-ui','DejaVu Sans');
writeFileSync(new URL('prototype-map.svg',base),raw);
for(const site of ['A','B','C']){normal=recordSample(normal,site,simulatedReading(normal.scenarioId,site));snapshot('first-signal after '+site,normal);}
assert.deepEqual(analyze(normal).remaining,[2]);
writeFileSync(new URL('demo-north-case.json',base),serializeCase(normal));
const revise={...simulatedReading('first-signal','B'),low:0,high:.95,review:true,note:'Synthetic demo revision: uncertain method; coordinator review required.'};
const reviewed=reviseSample(normal,'sample-B',revise);snapshot('flagged revision',reviewed);
assert.equal(analyze(reviewed).status,'review');
writeFileSync(new URL('example-revision-report.html',base),renderReport(reviewed));
let conflict=createCase('contradiction');
for(const site of ['A','B','C']){conflict=recordSample(conflict,site,simulatedReading(conflict.scenarioId,site));snapshot('contradiction after '+site,conflict);}
assert.equal(analyze(conflict).status,'conflict');
assert.deepEqual(analyze(conflict).remaining,[]);
writeFileSync(new URL('demo-conflict-case.json',base),serializeCase(conflict));
assert.deepEqual(importCase(serializeCase(reviewed)),reviewed);
writeFileSync(new URL('demo-model-check.json',base),JSON.stringify({note:'Direct model execution and import parser round-trip. Not a graphical browser or native file-chooser test.',appCommit:'94d6db0',steps:outputs},null,2));
console.log(JSON.stringify(outputs,null,2));
