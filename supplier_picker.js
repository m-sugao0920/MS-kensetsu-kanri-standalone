'use strict';
const SupplierSearch={
 normalize(value){return String(value??'').normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60)).replace(/\s+/g,'');},
 matches(s,query){const words=String(query).normalize('NFKC').trim().split(/\s+/).filter(Boolean).map(this.normalize);const fields=[s.no,s.name,s.kana].map(this.normalize);return words.every(w=>fields.some(f=>f.includes(w)));},
 eligible(s){return s.status!=='inactive'&&['発注','両方'].includes(s.tradeType);}
};
if(typeof module!=='undefined')module.exports=SupplierSearch;
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>{
 const $=id=>document.getElementById(id),select=$('supplier'),search=$('supplierSearch'),all=$('supplierAll'),box=$('supplierCandidates');
 const suppliers=JSON.parse(MSShared.getItem('mscm:v1:partners')||'[]');
 const label=s=>(s.no||'番号なし')+'｜'+s.name+(s.status==='inactive'?'（休止）':'');
 let rows=[],active=-1,committed=select.value,composing=false;
 function close(){box.hidden=true;search.setAttribute('aria-expanded','false');search.removeAttribute('aria-activedescendant');}
 function highlight(){[...box.children].forEach((b,i)=>{b.style.background=i===active?'#e5f1fa':'white';b.setAttribute('aria-selected',String(i===active));});if(active>=0){search.setAttribute('aria-activedescendant','supplierCandidate'+active);box.children[active]?.scrollIntoView({block:'nearest'});}}
 function render(){
  const q=select.value?'':search.value;
  const preferred=new Set(window.PurchasePrioritySupplierIds?.()||[]);
  rows=suppliers.filter(s=>(all.checked||SupplierSearch.eligible(s))&&SupplierSearch.matches(s,q)).sort((a,b)=>Number(preferred.has(b.id))-Number(preferred.has(a.id))||String(a.no||'').localeCompare(String(b.no||''),'ja',{numeric:true}));
  box.replaceChildren();active=-1;
  rows.forEach((s,i)=>{const b=document.createElement('div');b.id='supplierCandidate'+i;b.setAttribute('role','option');b.style.cssText='padding:10px 12px;cursor:pointer;border-bottom:1px solid #e8eef2';b.textContent=label(s)+(preferred.has(s.id)?'（この工事で発注あり）':'');b.onmousedown=e=>e.preventDefault();b.onclick=()=>choose(s.id);box.append(b);});
  if(!rows.length){const empty=document.createElement('div');empty.style.padding='12px';empty.textContent='候補がありません。「全取引先」でも検索できます。';box.append(empty);}
  $('supplierCount').textContent=select.value?'選択済み：'+label(suppliers.find(s=>s.id===select.value)):rows.length+'社の候補。候補をクリック、または↓キーとEnterで選択できます。';
  box.hidden=false;search.setAttribute('aria-expanded','true');
 }
 function choose(id){
  const s=suppliers.find(s=>s.id===id);if(!s)return;
  const changed=committed!==id;
  if(![...select.options].some(o=>o.value===id))select.add(new Option(label(s),id));
  select.value=id;committed=id;search.value=label(s);search.setCustomValidity('');close();
  $('supplierCount').textContent='選択済み：'+label(s);
  if(changed)select.dispatchEvent(new Event('change'));
 }
 function clearSelection(){const changed=!!committed;select.value='';committed='';search.value='';search.setCustomValidity('');close();$('supplierCount').textContent='番号・名前で検索、またはスペース／↓で一覧を開きます。';if(changed)select.dispatchEvent(new Event('change'));}
 window.SupplierPicker={select:choose,clear:clearSelection};
 // Focus leaves the candidate list closed; typing or an explicit key opens it.
 search.addEventListener('input',()=>{select.value='';search.setCustomValidity('候補から業者を選択してください。');render();});
 all.addEventListener('change',()=>{if(!box.hidden)render();});
 search.addEventListener('compositionstart',()=>composing=true);search.addEventListener('compositionend',()=>composing=false);
 search.addEventListener('keydown',e=>{
  if(composing||e.isComposing||e.keyCode===229)return;
  if((e.key===' '||e.key==='Spacebar')&&(!search.value.trim()||select.value)){e.preventDefault();render();return;}
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(box.hidden)render();if(rows.length){active=e.key==='ArrowDown'?Math.min(active+1,rows.length-1):Math.max(active-1,0);highlight();}}
  if(e.key==='Enter'){e.preventDefault();if(!box.hidden&&rows.length&&(active>=0||rows.length===1)){choose(rows[active>=0?active:0].id);$('invoiceDate').focus();}else if(select.value){close();$('invoiceDate').focus();}}
  if(e.key==='Escape')close();
 });
 search.addEventListener('blur',close);
 $('supplierSearchClear').onclick=()=>{const changed=!!committed;select.value='';committed='';search.value='';search.setCustomValidity('');if(changed)select.dispatchEvent(new Event('change'));close();search.focus();};
 $('costForm').addEventListener('submit',e=>{if(!select.value){e.preventDefault();e.stopImmediatePropagation();search.setCustomValidity('候補から業者を選択してください。');search.reportValidity();}},true);
 $('supplierCount').textContent='番号・名前で検索、またはスペース／↓で一覧を開きます。';
});
