'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 const main=document.querySelector('main'),search=document.querySelector('.ledger-search'),sheet=document.getElementById('ledgerSheet'),message=document.getElementById('message');
 const nav=document.createElement('div');nav.className='ledger-tabs no-print';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','工事原価台帳の表示');
 const searchTab=document.createElement('button'),ledgerTab=document.createElement('button');
 searchTab.textContent='工事を検索';ledgerTab.textContent='原価台帳';
 for(const [tab,id,panel] of [[searchTab,'ledgerSearchTab','ledgerSearchPanel'],[ledgerTab,'ledgerViewTab','ledgerViewPanel']]){tab.type='button';tab.id=id;tab.setAttribute('role','tab');tab.setAttribute('aria-controls',panel);nav.append(tab);}
 search.id='ledgerSearchPanel';search.setAttribute('role','tabpanel');search.setAttribute('aria-labelledby',searchTab.id);
 const view=document.createElement('section');view.id='ledgerViewPanel';view.setAttribute('role','tabpanel');view.setAttribute('aria-labelledby',ledgerTab.id);
 const controls=document.querySelector('.ledger-controls');controls.classList.add('no-print');view.append(controls,sheet,message);main.append(view);search.before(nav);
 function show(which,focus=false){const isSearch=which==='search';search.hidden=!isSearch;view.hidden=isSearch;searchTab.setAttribute('aria-selected',String(isSearch));ledgerTab.setAttribute('aria-selected',String(!isSearch));searchTab.tabIndex=isSearch?0:-1;ledgerTab.tabIndex=isSearch?-1:0;if(focus)(isSearch?searchTab:ledgerTab).focus();}
 searchTab.onclick=()=>show('search');ledgerTab.onclick=()=>show('ledger');
 nav.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();show(e.key==='Home'?'search':e.key==='End'?'ledger':searchTab.getAttribute('aria-selected')==='true'?'ledger':'search',true);}});
 document.getElementById('searchResults').addEventListener('click',e=>{if(e.target.closest('.open-btn')){show('ledger');ledgerTab.focus();}});
 document.getElementById('project').addEventListener('change',()=>show('ledger'));
 show(new URLSearchParams(location.search).get('id')?'ledger':'search');
 window.addEventListener('beforeprint',()=>{view.dataset.wasHidden=String(view.hidden);view.hidden=false;});
 window.addEventListener('afterprint',()=>{view.hidden=view.dataset.wasHidden==='true';});
});