const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
let catalog=[]; let rates={default_rate:.18,states:{US:.18}};
async function loadData(){
  try{catalog=(await (await fetch('/data/catalog.json')).json()).items||[]}catch(e){catalog=[]}
  try{rates=await (await fetch('/data/electricity_rates.json')).json()}catch(e){}
  renderRecommendations('sauna');
}
function money(n){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n||0)}
function rateFor(state){return (rates.states&&rates.states[state])||rates.default_rate||.18}
function renderRecommendations(cat, budget=Infinity, outdoor='both'){
  const box=$('#recommendations'); if(!box)return;
  let items=catalog.filter(x=>x.category===cat && x.price<=budget*1.15);
  if(outdoor==='outdoor') items=items.filter(x=>x.indoor_outdoor==='outdoor'||x.indoor_outdoor==='both');
  if(outdoor==='indoor') items=items.filter(x=>x.indoor_outdoor==='indoor'||x.indoor_outdoor==='both');
  items.sort((a,b)=>a.price-b.price); items=items.slice(0,3);
  if(!items.length){box.innerHTML='<div class="muted">No exact catalog match in the starter data. Browse the full InHouse collection below.</div>';return}
  box.innerHTML=items.map(x=>`<div class="rec"><div><b>${x.name}</b><br><small>${x.brand} · Featured retailer: InHouse Wellness</small><br><a href="${x.url}" target="_blank" rel="noopener">View at InHouse Wellness →</a></div><div class="price">${money(x.price)}</div></div>`).join('');
}
function initSegments(){
  $$('.seg').forEach(group=>group.addEventListener('click',e=>{if(e.target.tagName!=='BUTTON')return;$$('button',group).forEach(b=>b.classList.remove('active'));e.target.classList.add('active');group.dataset.value=e.target.dataset.value;calculatePlanner();}));
}
function calculatePlanner(){
  if(!$('#planner')) return;
  const width=+$('#spaceWidth').value||10, depth=+$('#spaceDepth').value||10, area=width*depth;
  const budget=+$('#budget').value||7000, state=$('#state').value||'US', rate=rateFor(state);
  const pref=$('#experience').dataset.value||'balanced', electric=$('#electric').dataset.value||'unsure', setting=$('#setting').dataset.value||'outdoor';
  let primary='sauna', title='Sauna-first setup', reason='A sauna gives the strongest fit for the space and budget you entered.';
  if(pref==='cold'){primary='cold-plunge';title='Cold-plunge-first setup';reason='Your preferences favor a compact cold-water station with room left for seating or a future sauna.'}
  if(pref==='soak'){primary='hot-tub';title='Hot-tub-first setup';reason='Your priority is soaking and shared relaxation, so a spa-style tub is the natural anchor.'}
  if(pref==='balanced'){
    if(area>=55 && budget>=7000){primary='combo';title='Heat + cold contrast setup';reason='Your footprint and budget can support two complementary stations instead of forcing a single centerpiece.'}
    else if(area<30){primary='cold-plunge';title='Compact recovery setup';reason='The available footprint favors a vertical or compact plunge over a full outdoor sauna or hot tub.'}
  }
  if(primary==='hot-tub' && area<38){title='Compact soak setup';reason='The space is tight for a conventional hot tub; consider a compact soaking tub or rethink the layout before purchasing.'}
  const saunaKW=electric==='240'?7.5:1.8; const saunaSessions=4; const saunaCost=saunaKW*0.75*saunaSessions*52*rate;
  const plungeCost=2.3*365*rate; const hotTubCost=6.5*365*rate;
  const footprint= primary==='combo'?'About 45–70 sq ft':primary==='hot-tub'?'About 35–55 sq ft':primary==='sauna'?'About 18–45 sq ft':'About 10–18 sq ft';
  const annual=primary==='combo'?saunaCost+plungeCost:primary==='sauna'?saunaCost:primary==='cold-plunge'?plungeCost:hotTubCost;
  $('#planTitle').textContent=title; $('#planReason').textContent=reason;
  $('#areaOut').textContent=`${area} sq ft`; $('#footprintOut').textContent=footprint; $('#energyOut').textContent=`~${money(annual)}/yr`; $('#rateOut').textContent=`${(rate*100).toFixed(1)}¢/kWh planning rate`;
  let cat=primary==='cold-plunge'?'cold-plunge':'sauna'; if(primary==='combo')cat='sauna';
  $('#recHeading').textContent=primary==='combo'?'Start with these sauna options':'Matching InHouse options';
  renderRecommendations(cat,budget,setting);
  const comboNote=$('#comboNote'); if(comboNote) comboNote.classList.toggle('hide',primary!=='combo');
  const yard=$('#yardPreview'); if(yard){
    if(primary==='combo') yard.innerHTML='<div class="unit-block unit-sauna">SAUNA</div><div class="unit-block unit-plunge">PLUNGE</div><div class="unit-block unit-seat">SEATING / SERVICE</div>';
    else if(primary==='sauna') yard.innerHTML='<div class="unit-block unit-sauna" style="left:22%;width:56%">SAUNA</div>';
    else if(primary==='cold-plunge') yard.innerHTML='<div class="unit-block unit-plunge" style="right:35%;width:30%;height:54%;bottom:20%">PLUNGE</div><div class="unit-block unit-seat" style="right:7%;width:25%">TOWEL / SERVICE</div>';
    else yard.innerHTML='<div class="unit-block unit-hot">HOT TUB / SOAKER</div>';
  }
}
function initPlanner(){
  if(!$('#planner'))return; initSegments(); ['spaceWidth','spaceDepth','budget','state'].forEach(id=>$('#'+id).addEventListener('input',calculatePlanner));calculatePlanner();
}
function initCost(){
  if(!$('#costCalc'))return;
  const run=()=>{
    const kw=+$('#kw').value||0, hrs=+$('#hours').value||0, weekly=+$('#weekly').value||0, state=$('#costState').value||'US', rate=rateFor(state);
    const yearlyKwh=kw*hrs*weekly*52, yearly=yearlyKwh*rate;
    $('#yearCost').textContent=money(yearly); $('#monthCost').textContent=money(yearly/12); $('#kwhCost').textContent=Math.round(yearlyKwh).toLocaleString(); $('#usedRate').textContent=`${(rate*100).toFixed(1)}¢/kWh`;
  };['kw','hours','weekly','costState'].forEach(id=>$('#'+id).addEventListener('input',run));run();
}
document.addEventListener('DOMContentLoaded',async()=>{await loadData();initPlanner();initCost();});
