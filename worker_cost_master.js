'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 const key='mscm:costRates:v1',parse=(k,f)=>JSON.parse(MSShared.getItem(k)||JSON.stringify(f));
 let rates=parse(key,{});let allWorkers=parse('mscm:v1:workers',[]);const workers=allWorkers.filter(w=>w.companyId==='__SELF__'&&(w.status!=='inactive'||w.costMasterDeletedAt)).sort((a,b)=>String(a.no).localeCompare(String(b.no)));
 const body=document.getElementById('rateRows'),status=document.getElementById('rateStatus');
 const formattedRate=value=>String(value??'').replace(/,/g,'').replace(/\B(?=(\d{3})+(?!\d))/g,',');
 function formatInput(input){
  const normalize=value=>value.replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xfee0)).replace(/，/g,',');
  const raw=normalize(input.value),position=input.selectionStart??raw.length;
  if(!/^[\d,]*$/.test(raw)){input.setCustomValidity('１日原価単価は整数で入力してください。');return;}
  input.setCustomValidity('');const preceding=raw.slice(0,position).replace(/,/g,'').length;
  const digits=raw.replace(/,/g,'').replace(/^0+(?=\d)/,'');input.value=formattedRate(digits);
  let caret=0,count=0;while(caret<input.value.length&&count<preceding){if(/\d/.test(input.value[caret]))count++;caret++;}
  input.setSelectionRange(caret,caret);
 }
 function prepareRate(input){
  input.type='text';input.inputMode='numeric';input.autocomplete='off';
  input.value=formattedRate(input.value);
  input.addEventListener('beforeinput',e=>{const pos=input.selectionStart;if(pos!==input.selectionEnd)return;if(e.inputType==='deleteContentBackward'&&input.value[pos-1]===',')input.setSelectionRange(pos-1,pos-1);if(e.inputType==='deleteContentForward'&&input.value[pos]===',')input.setSelectionRange(pos+1,pos+1);});
 }

 for(const w of workers){const tr=document.createElement('tr');tr.dataset.id=w.id;for(const text of [w.no,w.name]){const td=document.createElement('td');td.textContent=text;tr.append(td);}for(const [field,cls,min,max,step,initial] of [['dayRate','rate',1,10000000,1,''],['baseHours','base',0.01,24,0.01,8]]){const td=document.createElement('td'),input=document.createElement('input');input.type='number';input.className=cls;input.min=min;input.max=max;input.step=step;input.value=rates[w.id]?.[field]??initial;if(field==='dayRate')prepareRate(input);input.setAttribute('aria-label',w.name+' '+(field==='dayRate'?'１日原価単価':'基準時間'));input.oninput=()=>{if(field==='dayRate')formatInput(input);tr.dataset.dirty='1';tr.querySelector('.status-text').textContent='未保存';};td.append(input);tr.append(td);}const td=document.createElement('td');td.className='status';const state=document.createElement('span');state.className='status-text';state.textContent=rates[w.id]?'登録済み':'単価未登録';const remove=document.createElement('button');remove.type='button';remove.className='remove-worker';td.append(state,remove);tr.append(td);body.append(tr);
 const display=()=>{const deleted=!!w.costMasterDeletedAt;tr.classList.toggle('deleted',deleted);tr.hidden=deleted&&!document.getElementById('showDeleted').checked;remove.textContent=deleted?'復元':'削除';remove.setAttribute('aria-label',w.name+'を'+remove.textContent);tr.querySelectorAll('input').forEach(i=>i.disabled=deleted);};tr._display=display;display();
 remove.onclick=()=>{try{if(tr.dataset.dirty==='1'){status.textContent='先に入力した単価を保存してから削除してください。';return;}const changed={...w};if(changed.costMasterDeletedAt){changed.status=changed.costMasterPreviousStatus||'active';delete changed.costMasterDeletedAt;delete changed.costMasterPreviousStatus;}else{changed.costMasterPreviousStatus=changed.status||'active';changed.status='inactive';changed.costMasterDeletedAt=new Date().toISOString();}const nextWorkers=allWorkers.map(person=>person.id===w.id?changed:person);MSShared.setItem('mscm:v1:workers',JSON.stringify(nextWorkers));allWorkers=nextWorkers;delete w.costMasterDeletedAt;delete w.costMasterPreviousStatus;Object.assign(w,changed);display();status.textContent=w.name+(w.costMasterDeletedAt?'を削除しました。「削除済みを表示」から復元できます。':'を復元しました。');}catch(e){status.textContent=e.message;}};}
 document.getElementById('showDeleted').onchange=()=>{for(const tr of body.children)tr._display();};
 if(!workers.length)status.textContent='作業員マスターで自社作業員を登録してください。';
 document.getElementById('saveRates').onclick=()=>{try{const next={...rates};let count=0;for(const tr of body.children){if(tr.dataset.dirty!=='1')continue;const raw=tr.querySelector('.rate').value;if(raw==='')continue;if(!/^[\d,]+$/.test(raw))throw Error('１日原価単価は整数で入力してください。');const dayRate=Number(raw.replace(/,/g,'')),baseHours=Number(tr.querySelector('.base').value);if(!Number.isInteger(dayRate)||dayRate<=0||dayRate>10000000||!Number.isFinite(baseHours)||baseHours<=0||baseHours>24)throw Error('単価は１～10,000,000円の整数、基準時間は０より大きく24以下で入力してください。');next[tr.dataset.id]={dayRate,baseHours,updatedAt:new Date().toISOString()};count++;}if(!count){status.textContent='保存する単価入力がありません。';return;}MSShared.setItem(key,JSON.stringify(next));rates=next;for(const tr of body.children){delete tr.dataset.dirty;tr.querySelector('.rate').value=formattedRate(rates[tr.dataset.id]?.dayRate??'');tr.querySelector('.base').value=rates[tr.dataset.id]?.baseHours??8;tr.querySelector('.status-text').textContent=rates[tr.dataset.id]?'登録済み':'単価未登録';}status.textContent=count+'人分の単価を保存しました。';alert(count+'人分の作業員原価単価を登録しました。');}catch(e){status.textContent=e.message;}};
 window.addEventListener('beforeunload',e=>{if([...body.children].some(tr=>tr.dataset.dirty==='1')){e.preventDefault();e.returnValue='';}});
});
