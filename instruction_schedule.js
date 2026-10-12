'use strict';
const InstructionSchedule={
 segments(instruction,projectId,kind,resourceId){const plan=instruction.plan,rows=plan.assignments.filter(a=>a.projectId===projectId&&a.kind===kind&&a.resourceId===resourceId).map(a=>plan.slots.find(s=>s.id===a.slotId)).filter(Boolean).sort((a,b)=>a.start.localeCompare(b.start));const result=[];let previous=null;for(const slot of rows){const last=result.at(-1);const lunch=previous&&(previous.id==='am'||previous.name==='午前')&&(slot.id==='pm'||slot.name==='午後');const gap=last?DispatchModel.minutes(slot.start)-DispatchModel.minutes(last.end):0;const anotherSite=last&&plan.assignments.some(a=>a.projectId!==projectId&&a.kind===kind&&a.resourceId===resourceId&&(()=>{const s=plan.slots.find(s=>s.id===a.slotId);return s&&DispatchModel.minutes(s.start)<DispatchModel.minutes(slot.start)&&DispatchModel.minutes(s.end)>DispatchModel.minutes(last.end);})());if(last&&(gap===0||(lunch&&gap>0&&gap<=120&&!anotherSite))){last.breakMinutes+=gap;last.end=slot.end;}else result.push({start:slot.start,end:slot.end,breakMinutes:0});previous=slot;}return result;},
 hours(segments){return DispatchModel.hours(segments);},
 pause(minutes){return minutes===0?'なし':minutes%60===0?minutes/60+'時間':minutes+'分';}
};
if(typeof module!=='undefined')module.exports=InstructionSchedule;
