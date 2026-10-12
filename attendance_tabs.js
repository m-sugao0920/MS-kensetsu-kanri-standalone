'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 const main=document.querySelector('main'),filters=document.querySelector('.filters');
 const nav=document.createElement('div');nav.className='attendance-tabs no-print';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','作業員出面集計の表示');
 const searchTab=document.createElement('button'),listTab=document.createElement('button');
 searchTab.textContent='検索';listTab.textContent='集計一覧';
 for(const [tab,id,panel] of [[searchTab,'attendanceSearchTab','attendanceSearchPanel'],[listTab,'attendanceListTab','attendanceListPanel']]){tab.type='button';tab.id=id;tab.setAttribute('role','tab');tab.setAttribute('aria-controls',panel);nav.append(tab);}
 filters.id='attendanceSearchPanel';filters.setAttribute('role','tabpanel');filters.setAttribute('aria-labelledby',searchTab.id);
 const result=document.createElement('section');result.id='attendanceListPanel';result.setAttribute('role','tabpanel');result.setAttribute('aria-labelledby',listTab.id);
 const nodes=[];for(let node=filters.nextSibling;node;node=node.nextSibling)nodes.push(node);result.append(...nodes);main.append(result);filters.before(nav);
 const toolbar=document.createElement('div');toolbar.className='attendance-result-toolbar no-print';const change=document.createElement('button');change.type='button';change.textContent='検索条件を変更';toolbar.append(change,document.getElementById('refresh'),document.getElementById('print'));result.prepend(toolbar);
 const apply=document.createElement('button');apply.type='button';apply.className='attendance-apply';apply.textContent='この条件で集計一覧を表示';document.querySelector('.attendance-search-actions').append(apply);
 function show(which,focus=false){const searching=which==='search';filters.hidden=!searching;result.hidden=searching;searchTab.setAttribute('aria-selected',String(searching));listTab.setAttribute('aria-selected',String(!searching));searchTab.tabIndex=searching?0:-1;listTab.tabIndex=searching?-1:0;if(focus)(searching?searchTab:listTab).focus();}
 searchTab.onclick=()=>show('search');listTab.onclick=()=>show('list');change.onclick=()=>show('search',true);apply.onclick=()=>show('list',true);
 nav.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();show(event.key==='Home'?'search':event.key==='End'?'list':searchTab.getAttribute('aria-selected')==='true'?'list':'search',true);}});
 window.addEventListener('beforeprint',()=>{result.dataset.wasHidden=String(result.hidden);result.hidden=false;});window.addEventListener('afterprint',()=>{result.hidden=result.dataset.wasHidden==='true';});show('search');
});