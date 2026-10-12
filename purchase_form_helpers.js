'use strict';
const PurchaseFormHelpers={
 lastMonthEnd(date=new Date()){const last=new Date(date.getFullYear(),date.getMonth(),0);return [last.getFullYear(),String(last.getMonth()+1).padStart(2,'0'),String(last.getDate()).padStart(2,'0')].join('-');},
 normalize(v){return String(v??'').normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60)).replace(/\s+/g,'');},
 projectMatches(p,q){return String(q).normalize('NFKC').trim().split(/\s+/).filter(Boolean).every(w=>[p.no,p.name,p.kana].some(v=>this.normalize(v).includes(this.normalize(w))));},
 tax(net,rate,rounding){const value=Number(net)*Number(rate)/100;return Math[['floor','round','ceil'].includes(rounding)?rounding:'floor'](value);},
 projectNames(entry,projects){return [...new Set(entry.allocations.map(l=>{const p=projects.find(p=>p.id===l.projectId);return p?((p.no||'')+' '+p.name).trim():((l.projectNo||'')+' '+(l.projectName||'工事未確認')).trim();}))].join('\n');}
};
if(typeof module!=='undefined')module.exports=PurchaseFormHelpers;
