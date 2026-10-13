'use strict';
const AttendanceModel={
 cutoff(value){const n=Number(value);if(!Number.isInteger(n)||n<0||n>30)throw Error('締日は末日または1～30日で設定してください。');return n;},
 closeDate(month,cutoff=0){const [year,m]=month.split('-').map(Number);const last=new Date(Date.UTC(year,m,0)).getUTCDate();return new Date(Date.UTC(year,m-1,cutoff?Math.min(this.cutoff(cutoff),last):last));},
 periodMonth(date,cutoff=0){const month=date.slice(0,7);const end=this.closeDate(month,cutoff).toISOString().slice(0,10);if(date<=end)return month;const [y,m]=month.split('-').map(Number);return new Date(Date.UTC(y,m,1)).toISOString().slice(0,7);},
 period(month,cutoff=0){const [y,m]=month.split('-').map(Number),previous=new Date(Date.UTC(y,m-2,1)).toISOString().slice(0,7);const start=this.closeDate(previous,cutoff);start.setUTCDate(start.getUTCDate()+1);const end=this.closeDate(month,cutoff),dates=[];for(let d=new Date(start);d<=end;d.setUTCDate(d.getUTCDate()+1))dates.push(d.toISOString().slice(0,10));return {start:dates[0],end:end.toISOString().slice(0,10),dates};},
 entries(reports,cutoff=0){return reports.flatMap(r=>(r.workers||[]).map(w=>({date:r.date,month:this.periodMonth(r.date,cutoff),projectId:r.projectId,projectNo:r.projectNo||'',projectName:r.projectName||'',workNote:r.workNote||'',workerId:w.workerId||w.workerNo||w.workerName,workerNo:w.workerNo||'',workerName:w.workerName||'',hours:Number(w.hours)||0,units:Number(w.baseHours)>0?Number(w.hours)/Number(w.baseHours):0,amount:Number(w.amount)||0})));},
 groups(entries,key){const groups=new Map();for(const e of entries){const k=key(e);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(e);}return [...groups];},
 total(entries){return {days:new Set(entries.map(e=>e.date)).size,hours:entries.reduce((n,e)=>n+e.hours,0),units:entries.reduce((n,e)=>n+e.units,0),amount:entries.reduce((n,e)=>n+e.amount,0)};},
 label(entries){if(!entries.length)return '';const hours=entries.reduce((n,e)=>n+e.hours,0),units=entries.reduce((n,e)=>n+e.units,0);if(Math.abs(units-1)<1e-8)return '１日';if(Math.abs(units-.5)<1e-8)return '半日';return Number(hours.toFixed(2))+'h';}
};if(typeof module!=='undefined')module.exports=AttendanceModel;
