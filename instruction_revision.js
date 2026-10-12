'use strict';
const InstructionRevision={
 create(days,date,instructionId,projectId,edited,now,id){
  const next=DispatchModel.clone(days),day=next.find(d=>d.date===date),latest=day?.instructions?.at(-1);
  if(!latest||latest.id!==instructionId)throw Error('指示書が更新されています。画面を更新してから編集してください。');
  if(JSON.stringify(day.draft)!==JSON.stringify(latest.plan))throw Error('班割に変更された仮保存があります。班割を確認して確定してから、指示書を編集してください。');
  if(!latest.plan.projects.includes(projectId))throw Error('指示書の現場を確認してください。');
  const plan=DispatchModel.clone(latest.plan);
  for(const key of ['projectLabels','notes','directives','arrangements']){
   plan[key]=plan[key]||{};
   if(edited[key]&&Object.prototype.hasOwnProperty.call(edited[key],projectId))plan[key][projectId]=DispatchModel.clone(edited[key][projectId]);
  }
  DispatchModel.validate(plan);day.draft=DispatchModel.clone(plan);day.updatedAt=now;
  const instruction={id,revision:latest.revision+1,confirmedAt:now,plan:DispatchModel.clone(plan),projectNames:DispatchModel.clone(latest.projectNames)};
  day.instructions.push(instruction);return {days:next,instruction};
 }
};
if(typeof module!=='undefined')module.exports=InstructionRevision;
