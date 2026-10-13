'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 const form=document.getElementById('workerActual'),tabs=[...form.querySelectorAll('[role=tab]')];
 function activate(tab,focus=false){for(const t of tabs){const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!selected;}if(focus)tab.focus();}
 for(const tab of tabs){tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',e=>{let index=tabs.indexOf(tab);if(e.key==='ArrowRight')index=(index+1)%tabs.length;else if(e.key==='ArrowLeft')index=(index+tabs.length-1)%tabs.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=tabs.length-1;else return;e.preventDefault();activate(tabs[index],true);});}
 // Reveal the first invalid field before the browser tries to focus it.
 form.addEventListener('invalid',e=>{const first=[...form.querySelectorAll('input,select,textarea')].find(field=>!field.disabled&&!field.validity.valid);const panel=first?.closest('[role=tabpanel]');if(panel){const tab=tabs.find(t=>t.getAttribute('aria-controls')===panel.id);if(tab)activate(tab);}},true);
 function counts(){document.getElementById('peopleCount').textContent=document.getElementById('actualPeople').children.length+'名';document.getElementById('equipmentCount').textContent=document.getElementById('actualMachines').children.length+'件';}
 for(const id of ['actualPeople','actualMachines'])new MutationObserver(counts).observe(document.getElementById(id),{childList:true});
 window.WorkerReportTabs={reset(date,project){document.getElementById('reportContext').textContent=[date,project?.no,project?.name].filter(Boolean).join(' ／ ');activate(tabs[0]);counts();}};
 counts();
});
