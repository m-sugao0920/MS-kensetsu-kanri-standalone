'use strict';
const DispatchModel={
 createId(){
  const api=globalThis.crypto;
  if(typeof api?.randomUUID==='function')return api.randomUUID();
  if(typeof api?.getRandomValues!=='function')throw Error('配置番号を作成できません。ブラウザーを更新して再度お試しください。');
  const bytes=api.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);
 },
 key:'mscm:dispatch:v1', resourceKey:'mscm:resources:v1',
 minutes(value){if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(value||''))throw Error('開始・終了時刻を入力してください。');const [h,m]=value.split(':').map(Number);return h*60+m;},
 duration(segment){const start=this.minutes(segment.start),end=this.minutes(segment.end),pause=Number(segment.breakMinutes??0);if(end<=start||!Number.isFinite(pause)||pause<0||pause>=end-start)throw Error('終了は開始より後、休憩は作業時間より短く入力してください。');return (end-start-pause)/60;},
 hours(segments){if(!Array.isArray(segments)||!segments.length)throw Error('作業時間を入力してください。');let minutes=0;const ranges=[];for(const s of segments){minutes+=this.duration(s)*60;const a=this.minutes(s.start),b=this.minutes(s.end);if(ranges.some(r=>a<r[1]&&b>r[0]))throw Error('同じ作業員の時間帯が重なっています。');ranges.push([a,b]);}return minutes/60;},
 blank(){return {slots:[{id:'am',name:'午前',start:'08:00',end:'12:00'},{id:'pm',name:'午後',start:'13:00',end:'17:00'}],projects:[],assignments:[],notes:{}};},
 validate(plan){if(!plan||!Array.isArray(plan.slots)||!plan.slots.length||!Array.isArray(plan.projects)||!Array.isArray(plan.assignments))throw Error('班割の内容を確認してください。');const slotIds=new Set(),projectIds=new Set(plan.projects);if(projectIds.size!==plan.projects.length)throw Error('工事が重複しています。');for(const s of plan.slots){if(!s.id||slotIds.has(s.id)||!s.name?.trim())throw Error('時間帯名を入力してください。');slotIds.add(s.id);this.duration({...s,breakMinutes:0});}const seen=[];for(const a of plan.assignments){const s=plan.slots.find(s=>s.id===a.slotId);if(!s||!projectIds.has(a.projectId)||!a.resourceId||!['worker','vehicle','heavy','machine'].includes(a.kind))throw Error('配置先を確認してください。');const start=this.minutes(s.start),end=this.minutes(s.end);if(seen.some(b=>b.kind===a.kind&&b.resourceId===a.resourceId&&start<b.end&&end>b.start))throw Error((a.name||'資源')+'が同じ時間帯に二重配置されています。');seen.push({...a,start,end});}return true;},
 formatTimestamp(value){return new Date(value).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});},
 localDate(date=new Date()){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');},
 previousDate(date){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()-1);return this.localDate(d);},
 clone(value){return JSON.parse(JSON.stringify(value));}
};
if(typeof module!=='undefined')module.exports=DispatchModel;
