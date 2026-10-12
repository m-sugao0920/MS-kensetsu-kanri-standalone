'use strict';
const LedgerViewModel={
 categories:['material','labor','outsourced','expense','unclassified'],
 expand(rows,reports,projectId){return rows.map(row=>{const base={...row,name:row.workType||'',spec:'',quantity:'',unit:'',unitPrice:''};if(row.source!=='自社日報')return base;const matches=reports.filter(r=>r.projectId===projectId&&r.date===row.date&&Number(r.laborTotal)===Number(row.amount));const workers=matches.length===1?matches[0].workers:[];return {...base,name:'自社作業員',spec:row.workType||'',quantity:workers.length||'',unit:workers.length?'人':''};});},
 totals(rows){const totals=Object.fromEntries(this.categories.map(k=>[k,0]));for(const row of rows)totals[row.category]+=Number(row.amount);return totals;},
 groups(rows,mode="date"){const groups=new Map();for(const row of rows){const key=mode==='work'?(row.workTypeId||row.workType||'工種未登録'):(row.date?.slice(0,7)||'日付未登録');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);}for(const entries of groups.values())entries.sort((a,b)=>String(a.date).localeCompare(String(b.date)));return [...groups].sort(([a],[b])=>a.localeCompare(b));}
};
if(typeof module!=='undefined')module.exports=LedgerViewModel;
