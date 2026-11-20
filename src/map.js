import { SITES } from './scenarios.js';
import { latest } from './model.js';
export function mapSVG(state,selected,recommended) {
 const paths=['M180 -20 C80 90 260 140 185 270 S260 323 363 337','M400 -20 C465 55 340 76 394 140 S410 230 363 337','M790 105 C700 125 723 165 651 245 S590 360 482 435','M363 337 C390 382 433 378 482 435'];
 const contours=['M-80 160C65 70 115 195 234 125S374-46 520 28 640 22 790-20','M-80 173C68 83 116 210 238 139S377-30 520 42 640 38 790-5','M-80 187C70 98 122 227 242 154S378-16 520 58 640 55 790 10','M-70 510C40 360 108 330 154 405S245 544 342 465 325 380 400 342','M-55 530C50 375 110 347 149 420S246 560 355 480 342 395 417 360','M-38 550C68 388 117 368 145 438S248 582 367 496 360 410 429 382','M620 370C670 303 815 320 820 477','M632 387C679 320 801 337 802 478','M645 404C687 340 787 357 785 480'];
 const trees=[[78,307],[98,326],[65,343],[125,404],[146,430],[210,100],[234,76],[576,114],[596,132],[615,110],[716,375],[735,396],[708,412],[52,472],[286,217],[306,203]];
 return `<svg class="terrain" viewBox="0 0 800 560" role="group" aria-label="Fictional water network. Select a sampling location using the labeled points.">
 <defs><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#b9c5b4" opacity=".45"/></pattern><linearGradient id="lake" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#9ecbc1"/><stop offset="1" stop-color="#c1ddd0"/></linearGradient><filter id="pin-shadow"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#244f44" flood-opacity=".14"/></filter></defs>
 <rect width="800" height="560" fill="#edf0e5"/><rect width="800" height="560" fill="url(#grid)"/>
 <g fill="none" stroke="#c8d1bd" stroke-width="1" opacity=".6">${contours.map(d=>`<path d="${d}"/>`).join('')}</g>
 <g fill="#dce4d3">${trees.map(([x,y])=>`<path d="M${x} ${y-12}l-9 16h5l-8 12h24l-8-12h5z"/><path d="M${x} ${y+13}v8" stroke="#b0bda4"/>`).join('')}</g>
 <path d="M-20 230C130 178 228 365 321 270S535 100 810 302" fill="none" stroke="#d4ccba" stroke-width="11"/><path d="M-20 230C130 178 228 365 321 270S535 100 810 302" fill="none" stroke="#f8f5e9" stroke-width="7"/>
 <g fill="none" stroke-linecap="round">${paths.map(d=>`<path d="${d}" stroke="#a4c7bc" stroke-width="14"/><path d="${d}" stroke="#cadfd0" stroke-width="7"/>`).join('')}</g>
 <path d="M481 422C523 441 602 423 629 455S713 465 724 515 678 578 557 590 392 575 404 524 437 482 448 457Z" fill="url(#lake)" stroke="#9cbbaf" stroke-width="1.3"/>
 <path d="M489 459C529 478 580 452 610 482M464 491C490 509 540 485 565 507M606 518C632 530 665 512 683 526" fill="none" stroke="#dceee2" stroke-width="2" stroke-linecap="round"/>
 <path d="M108 120C110 88 107 50 74 27" fill="none" stroke="#accabc" stroke-width="7"/>
 <g font-family="system-ui,sans-serif" font-size="10" letter-spacing="2" fill="#7d8f7d"><text x="134" y="180" transform="rotate(25 134 180)">WEST REACH</text><text x="438" y="78">NORTH REACH</text><text x="593" y="335" transform="rotate(-40 593 335)">EAST REACH</text><text x="500" y="540" fill="#49766b" font-size="16" letter-spacing="4">MILLBROOK</text><text x="261" y="503" font-size="9" letter-spacing="1.2">SCHEMATIC · NOT TO SCALE</text></g>
 <g transform="translate(742 42)" fill="#6b8273"><path d="M0 0l-5 20 5-3 5 3Z"/><text x="0" y="-7" text-anchor="middle" font-size="10" font-family="system-ui">N</text></g>
 ${SITES.map(site=>{
  const o=state.observations.find(o=>o.siteId===site.id),r=o&&latest(o),blocked=state.access[site.id]!=='open',isSelected=selected===site.id,isRec=recommended===site.id;
  const color=blocked?'#8b9384':isRec?'#b94f29':o?'#21685c':'#506b58';
  const labelWidth=site.name.length*6.3+25,dx=site.id==='C'?-labelWidth/2:18,dy=site.id==='C'?45:-19;
  return `<g class="map-pin ${isSelected?'selected':''}" tabindex="0" role="button" aria-label="${site.name}, ${state.access[site.id]}${o?', sample recorded':''}${isRec?', recommended next':''}" aria-pressed="${isSelected}" data-site="${site.id}">
  ${isRec?`<circle class="pulse" cx="${site.x}" cy="${site.y}" r="26" fill="none" stroke="${color}" opacity=".24"/>`:''}
  ${isSelected?`<circle cx="${site.x}" cy="${site.y}" r="23" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="3 3"/>`:''}
  <circle cx="${site.x}" cy="${site.y}" r="16" fill="${color}" stroke="#fafaf0" stroke-width="4" filter="url(#pin-shadow)"/>
  <text x="${site.x}" y="${site.y+4}" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="700" fill="white">${blocked?'×':site.id}</text>
  <rect x="${site.x+dx}" y="${site.y+dy-13}" width="${labelWidth}" height="27" rx="5" fill="#fcfbf4" stroke="${isSelected?color:'#dfe4d6'}"/>
  <text x="${site.x+dx+12}" y="${site.y+dy+4}" fill="#294b3c" font-family="system-ui" font-size="11" font-weight="600">${site.name}</text>
  ${o?`<circle cx="${site.x+12}" cy="${site.y+11}" r="6" fill="${r.review?'#d88846':'#d7edd3'}" stroke="white" stroke-width="2"/>`:''}
  </g>`;
 }).join('')}</svg>`;
}
