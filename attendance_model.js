'use strict';
const AttendanceModel={
 entries(reports){return reports.flatMap(r=>(r.workers||[]).map(w=>({date:r.date,month:r.date.slice(0,7),projectId:r.projectId,projectNo:r.projectNo||'',projectName:r.projectName||'',workNote:r.workNote||'',workerId:w.workerId||w.workerNo||w.workerName,workerNo:w.workerNo||'',workerName:w.workerName||'',hours:Number(w.hours)||0,units:Number(w.baseHours)>0?Number(w.hours)/Number(w.baseHours):0,amount:Number(w.amount)||0})));},
 groups(entries,key){const groups=new Map();for(const e of entries){const k=key(e);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(e);}return [...groups];},
 total(entries){return {days:new Set(entries.map(e=>e.date)).size,hours:entries.reduce((n,e)=>n+e.hours,0),units:entries.reduce((n,e)=>n+e.units,0),amount:entries.reduce((n,e)=>n+e.amount,0)};},
 label(entries){if(!entries.length)return '';const hours=entries.reduce((n,e)=>n+e.hours,0),units=entries.reduce((n,e)=>n+e.units,0);if(Math.abs(units-1)<1e-8)return '１日';if(Math.abs(units-.5)<1e-8)return '半日';return Number(hours.toFixed(2))+'h';}
};if(typeof module!=='undefined')module.exports=AttendanceModel;
