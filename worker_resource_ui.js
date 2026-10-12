'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 const $=id=>document.getElementById(id),norm=s=>String(s||'').replace(/[\s　]/g,'').toLowerCase();
 if($('resourceRows')){
  let active='vehicle';
  function shape(card){
   if(card.querySelector('.resource-main'))return;
   const main=document.createElement('div');main.className='resource-main';
   const extra=card.querySelector('.more-fields'),fees=card.querySelector('.fee-fields'),more=card.querySelector('.more-button'),vehicleFees=card.querySelector('.vehicle-fees');
   main.append(card.querySelector('.name-line'),fees,vehicleFees,more);card.prepend(main);
   more.textContent='編集';more.setAttribute('aria-label','備考・区分を編集');
   const legacy=document.createElement('div');legacy.className='legacy-fee';extra.prepend(legacy);card._legacy=legacy;
  }
  function apply(){
   const query=norm($('resourceSearch').value),state=$('resourceFilter').value,deleted=$('showDeleted').checked;
   for(const section of document.querySelectorAll('.resource-column')){
    const kind=section.dataset.kind;section.hidden=kind!==active;
    let total=0,visible=0;
    for(const card of section.querySelectorAll('.resource-card')){
     shape(card);const isVehicle=card.querySelector('.kind').value==='vehicle';card.classList.toggle('vehicle-line',isVehicle);
     const fees=card.querySelector('.fee-fields'),main=card.querySelector('.resource-main');
     if(isVehicle&&fees.parentElement!==card._legacy)card._legacy.append(fees);
     if(!isVehicle&&fees.parentElement!==main)main.append(fees);
     const removed=!!card._record.deletedAt;if(!removed)total++;
     card.hidden=(!deleted&&removed)||(state!=='all'&&card.querySelector('.status').value!==state)||(query&&!norm(card.querySelector('.name').value).includes(query));
     if(!card.hidden)visible++;
    }
    $('tab-'+kind).textContent=({vehicle:'車両',heavy:'重機',machine:'機械'}[kind])+'（'+total+'件）';
    $('tab-'+kind).setAttribute('aria-selected',String(kind===active));$('tab-'+kind).tabIndex=kind===active?0:-1;
    section.querySelectorAll('.empty-resources').forEach(e=>e.remove());
    if(!visible){const p=document.createElement('p');p.className='empty-resources';p.textContent='該当する登録はありません。';section.querySelector('.resource-list').append(p);}
   }
  }
  const tabs=[...document.querySelectorAll('[role=tab]')];tabs.forEach((button,i)=>{button.onclick=()=>{active=button.dataset.kind;apply();};button.onkeydown=e=>{let next;if(e.key==='ArrowRight')next=(i+1)%3;if(e.key==='ArrowLeft')next=(i+2)%3;if(e.key==='Home')next=0;if(e.key==='End')next=2;if(next!==undefined){e.preventDefault();tabs[next].click();tabs[next].focus();}};});
  $('resourceSearch').oninput=apply;$('resourceFilter').onchange=apply;
  $('resourceRows').addEventListener('input',apply);$('resourceRows').addEventListener('change',apply);
  window.addEventListener('resource-list-updated',apply);apply();
 }
 if($('rateRows')){
  function filter(){const q=norm($('workerSearch').value);for(const tr of $('rateRows').children){tr._display();if(!tr.hidden&&q&&!norm(tr.cells[0].textContent+' '+tr.cells[1].textContent).includes(q))tr.hidden=true;}}
  $('workerSearch').oninput=filter;$('showDeleted').addEventListener('change',filter);
 }
});
window.addEventListener('load',()=>{
 const $=id=>document.getElementById(id);if(!$('workers'))return;
 const norm=s=>String(s||'').replace(/[\s　]/g,'').toLowerCase();
 function filter(){const q=norm($('workerSearch').value),state=$('workerFilter').value;let count=0;
  for(const row of document.querySelectorAll('.worker')){if(!row.querySelector('.worker-core-details')){const extra=row.querySelector('.more'),core=document.createElement('div');core.className='worker-core-details';for(const field of [...row.querySelector('.r1').children].slice(5,9))core.append(field);extra.prepend(core);core.after(row.querySelector('.r2'));}const text=row.querySelector('.no').textContent+' '+[...row.querySelectorAll('[data-k=name],[data-k=kana],[data-k=occupation]')].map(e=>e.value).join(' ');row.hidden=(state!=='all'&&row._data.status!==state)||(q&&!norm(text).includes(q));if(!row.hidden)count++;}
  $('workerVisibleCount').textContent=count+'名';
 }
 $('workerSearch').oninput=filter;$('workerFilter').onchange=filter;$('workers').addEventListener('input',filter);
 $('stop').addEventListener('click',filter);
 new MutationObserver(filter).observe($('workers'),{childList:true});filter();
});
