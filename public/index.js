/* index.js - Fabrice Pro Calculator (frontend)
   Mobile-first, touch-friendly, history, memory, conversions, themes.
*/

const display = document.getElementById('display');
const subdisplay = document.getElementById('subdisplay');
const buttonsGrid = document.getElementById('buttonsGrid');
const historyPanel = document.getElementById('historyPanel');
const historyList = document.getElementById('historyList');
const historyToggle = document.getElementById('historyToggle');
const clearHistoryBtn = document.getElementById('clearHistory');
const convBtn = document.getElementById('convBtn');
const convValue = document.getElementById('convValue');
const convType = document.getElementById('convType');
const convResult = document.getElementById('convResult');
const memValueSpan = document.getElementById('memValue');
const modeToggle = document.getElementById('modeToggle');
const themeToggle = document.getElementById('themeToggle');

let mode = localStorage.getItem('calcMode') || 'standard'; // standard, scientific, programmer, converter
let theme = localStorage.getItem('calcTheme') || 'light';
let history = JSON.parse(localStorage.getItem('calcHistory') || '[]');
let memory = Number(localStorage.getItem('calcMemory') || '0');

memValueSpan.textContent = memory;
if(theme === 'dark') document.body.classList.add('dark');
modeToggle.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);

// initial building of buttons depending on mode
function buildButtons() {
  buttonsGrid.innerHTML = '';
  // Layout: We'll create a fixed set that covers standard + extras. Buttons flagged by class.
  const buttons = [
    {t:'AC', cls:'btn clear'},
    {t:'DEL', cls:'btn'},
    {t:'%', cls:'btn'},
    {t:'/', cls:'btn op'},

    {t:'7', cls:'btn num'},
    {t:'8', cls:'btn num'},
    {t:'9', cls:'btn num'},
    {t:'*', cls:'btn op'},

    {t:'4', cls:'btn num'},
    {t:'5', cls:'btn num'},
    {t:'6', cls:'btn num'},
    {t:'-', cls:'btn op'},

    {t:'1', cls:'btn num'},
    {t:'2', cls:'btn num'},
    {t:'3', cls:'btn num'},
    {t:'+', cls:'btn op'},

    {t:'±', cls:'btn'},
    {t:'0', cls:'btn num'},
    {t:'.', cls:'btn num'},
    {t:'=', cls:'btn eq'}
  ];

  buttons.forEach(b=>{
    const el = document.createElement('button');
    el.className = b.cls;
    el.textContent = b.t;
    el.setAttribute('data-key', b.t);
    buttonsGrid.appendChild(el);
  });

  // logical/memory/conversion extra small row:
  const extras = [
    {t:'AND', cls:'btn small logic'},{t:'OR', cls:'btn small logic'},
    {t:'XOR', cls:'btn small logic'},{t:'NOT', cls:'btn small logic'},
    {t:'M+', cls:'btn small mem'},{t:'M-', cls:'btn small mem'},
    {t:'MR', cls:'btn small mem'},{t:'MC', cls:'btn small mem'},
    {t:'km→mi', cls:'btn small conv'},{t:'kg→lb', cls:'btn small conv'},
    {t:'C→F', cls:'btn small conv'},{t:'USD→EUR', cls:'btn small conv'}
  ];

  extras.forEach(b=>{
    const el = document.createElement('button');
    el.className = b.cls;
    el.textContent = b.t;
    el.setAttribute('data-key', b.t);
    buttonsGrid.appendChild(el);
  });

  attachButtonHandlers();
}

// Calculation state
let current = '';
let previous = null;
let op = null;

function setDisplay(text) {
  display.textContent = String(text);
}
function setSub(text) { subdisplay.textContent = text || ''; }

// Handlers
function attachButtonHandlers() {
  buttonsGrid.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', () => handleButton(btn.textContent));
    // Touch visual
    btn.addEventListener('touchstart', ()=> btn.classList.add('active'), {passive:true});
    btn.addEventListener('touchend', ()=> btn.classList.remove('active'));
  });
}

function handleButton(key){
  if(key === 'AC') { current=''; previous=null; op=null; setDisplay(0); setSub(''); return; }
  if(key === 'DEL') { current = current.slice(0,-1); setDisplay(current||0); return; }
  if(key === '±'){ if(current) current = String(-Number(current)); setDisplay(current); return; }

  // memory
  if(key === 'M+') { memory += Number(current||0); saveMemory(); return; }
  if(key === 'M-') { memory -= Number(current||0); saveMemory(); return; }
  if(key === 'MR') { current = String(memory); setDisplay(current); return; }
  if(key === 'MC') { memory = 0; saveMemory(); return; }

  // conversions (quick client-side)
  if(key === 'km→mi'){ convertQuick(Number(current||0),'km-mi'); return; }
  if(key === 'kg→lb'){ convertQuick(Number(current||0),'kg-lb'); return; }
  if(key === 'C→F'){ convertQuick(Number(current||0),'c-f'); return; }
  if(key === 'USD→EUR'){ // uses backend example
    const value = Number(current||0);
    fetch('/api/convert-currency', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({value,from:'USD',to:'EUR'})})
      .then(r=>r.json()).then(d=>{ if(d.result!==undefined){ setSub(`1 USD ≈ ${d.rate.toFixed(4)} EUR`); setDisplay(d.result); pushHistory(`${value} USD → ${d.result} EUR`);} else setSub(d.error); })
    return;
  }

  // logical operators (apply to integers)
  if(['AND','OR','XOR','NOT'].includes(key)){
    applyLogic(key);
    return;
  }

  if(key === '%'){ if(current) { current = String(Number(current)/100); setDisplay(current); } return; }

  if(key === '='){
    if(op && previous !== null && current !== '') {
      const a = Number(previous), b = Number(current);
      const result = compute(a,b,op);
      pushHistory(`${previous} ${op} ${current} = ${result}`);
      setDisplay(result);
      setSub(`${previous} ${op} ${current}`);
      current = String(result);
      previous = null;
      op = null;
    }
    return;
  }

  // number or dot or operator
  if(['+','-','*','/'].includes(key)){
    if(current === '' && previous === null) return;
    if(previous === null){ previous = current||'0'; op = key; current = ''; setSub(`${previous} ${op}`); return;}
    // if we already have previous and op, evaluate chain
    if(previous !== null && current !== ''){
      const result = compute(Number(previous), Number(current), op);
      previous = String(result); op = key; current=''; setDisplay(previous); setSub(`${previous} ${op}`); return;
    }
    return;
  }

  // numbers and dot
  if(key === '.' && current.includes('.')) return;
  current += key;
  setDisplay(current);
}

// quick client-side conversions
function convertQuick(val, type){
  let out;
  switch(type){
    case 'km-mi': out = (val * 0.621371).toFixed(4); pushHistory(`${val} km -> ${out} mi`); break;
    case 'kg-lb': out = (val * 2.20462).toFixed(4); pushHistory(`${val} kg -> ${out} lb`); break;
    case 'c-f': out = ((val * 9/5) + 32).toFixed(2); pushHistory(`${val} °C -> ${out} °F`); break;
    default: out = val; break;
  }
  setDisplay(out);
  setSub(`${val} → ${out}`);
}

// logical functions
function applyLogic(key){
  if(current === '') return;
  let n = parseInt(current);
  let out;
  switch(key){
    case 'AND': out = (n & 1); pushHistory(`${n} AND 1 = ${out}`); break;
    case 'OR': out = (n | 1); pushHistory(`${n} OR 1 = ${out}`); break;
    case 'XOR': out = (n ^ 1); pushHistory(`${n} XOR 1 = ${out}`); break;
    case 'NOT': out = (~n); pushHistory(`NOT ${n} = ${out}`); break;
  }
  current = String(out);
  setDisplay(current);
}

// compute arithmetic
function compute(a,b,op){
  let r;
  switch(op){
    case '+': r = a + b; break;
    case '-': r = a - b; break;
    case '*': r = a * b; break;
    case '/': r = b === 0 ? 'Error' : a / b; break;
    default: r = b; break;
  }
  return Number.isFinite(r) ? Number(r.toString()) : r;
}

// history
function pushHistory(text){
  const entry = { text, at: new Date().toISOString() };
  history.unshift(entry);
  if(history.length > 100) history.pop();
  localStorage.setItem('calcHistory', JSON.stringify(history));
  renderHistory();
}

function renderHistory(){
  historyList.innerHTML = '';
  history.forEach(h=>{
    const li = document.createElement('li');
    li.textContent = `${new Date(h.at).toLocaleString()} — ${h.text}`;
    historyList.appendChild(li);
  });
}
document.getElementById('clearHistory')?.addEventListener('click', ()=>{ history=[]; localStorage.removeItem('calcHistory'); renderHistory(); });

// memory
function saveMemory(){ localStorage.setItem('calcMemory', String(memory)); memValueSpan.textContent = memory; pushHistory(`Memory updated: ${memory}`); }
document.getElementById('mPlus').addEventListener('click', ()=>{ memory += Number(current||0); saveMemory(); });
document.getElementById('mMinus').addEventListener('click', ()=>{ memory -= Number(current||0); saveMemory(); });
document.getElementById('mRecall').addEventListener('click', ()=>{ current = String(memory); setDisplay(current); });
document.getElementById('mClear').addEventListener('click', ()=>{ memory = 0; saveMemory(); });

// conversions panel
document.getElementById('convBtn').addEventListener('click', async ()=>{
  const v = Number(convValue.value);
  const t = convType.value;
  if(isNaN(v)){ convResult.textContent = 'Enter a number'; return; }
  // client-side km/mi / kg/lb / temp
  if(t === 'km-mi'){ convResult.textContent = `${(v*0.621371).toFixed(4)} mi`; pushHistory(`${v} km -> ${(v*0.621371).toFixed(4)} mi`); return; }
  if(t === 'mi-km'){ convResult.textContent = `${(v/0.621371).toFixed(4)} km`; pushHistory(`${v} mi -> ${(v/0.621371).toFixed(4)} km`); return; }
  if(t === 'kg-lb'){ convResult.textContent = `${(v*2.20462).toFixed(4)} lb`; pushHistory(`${v} kg -> ${(v*2.20462).toFixed(4)} lb`); return; }
  if(t === 'lb-kg'){ convResult.textContent = `${(v/2.20462).toFixed(4)} kg`; pushHistory(`${v} lb -> ${(v/2.20462).toFixed(4)} kg`); return; }
  if(t === 'c-f'){ convResult.textContent = `${((v*9/5)+32).toFixed(2)} °F`; pushHistory(`${v} °C -> ${((v*9/5)+32).toFixed(2)} °F`); return; }
  if(t === 'f-c'){ convResult.textContent = `${((v-32)*5/9).toFixed(2)} °C`; pushHistory(`${v} °F -> ${((v-32)*5/9).toFixed(2)} °C`); return; }
  // currency: example USD/EUR using backend endpoint
  if(t === 'usd-eur' || t === 'eur-usd'){
    const from = t === 'usd-eur' ? 'USD' : 'EUR';
    const to = t === 'usd-eur' ? 'EUR' : 'USD';
    const res = await fetch('/api/convert-currency', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({value:v,from,to})});
    const data = await res.json();
    if(data.result !== undefined){ convResult.textContent = `${data.result} ${to}`; pushHistory(`${v} ${from} -> ${data.result} ${to}`); } else convResult.textContent = data.error || 'Error';
    return;
  }
});

// basic UI wiring
historyToggle.addEventListener('click', ()=> historyPanel.classList.toggle('hidden'));
document.getElementById('historyToggle').addEventListener('click', ()=> historyPanel.classList.toggle('hidden'));
document.getElementById('clearHistory').addEventListener('click', ()=> { history=[]; localStorage.setItem('calcHistory', JSON.stringify(history)); renderHistory(); });

// theme and mode
modeToggle.addEventListener('click', ()=>{
  // cycle modes: standard -> scientific -> programmer -> converter
  const modes = ['standard','scientific','programmer','converter'];
  const idx = modes.indexOf(mode);
  mode = modes[(idx+1)%modes.length];
  modeToggle.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
  localStorage.setItem('calcMode', mode);
  buildButtons();
});

themeToggle.addEventListener('click', ()=>{
  document.body.classList.toggle('dark');
  theme = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('calcTheme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
});

// init
buildButtons();
renderHistory();

// load persisted memory
memValueSpan.textContent = memory;
if(history.length) renderHistory();
