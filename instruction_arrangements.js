'use strict';
const InstructionArrangements={
 sections:[
  {key:'lease',title:'リース機械・車両',fields:[['company','リース会社'],['name','機械・車両名'],['quantity','台数','number'],['time','搬入時刻','time'],['note','備考']]},
  {key:'transport',title:'重機回送',fields:[['company','回送会社'],['name','重機名'],['from','出発地'],['to','到着地'],['time','予定時刻','time'],['note','備考']]},
  {key:'purchase',title:'仕入品・納入予定',fields:[['company','仕入先'],['name','品名'],['quantity','数量','number'],['unit','単位'],['delivery','配達','select'],['time','予定時刻','time'],['note','備考']]}
 ],
 meaningful(row){return Object.entries(row).some(([key,value])=>key!=='id'&&String(value??'').trim());},
 editor(plan,projectId,edit){
  const root=document.createElement('details');root.className='arrangement-editor';
  const heading=document.createElement('summary');heading.textContent='リース・回送・仕入品の手配';root.append(heading);
  const hint=document.createElement('p');hint.textContent='手配予定を入力します。「変更を保存」で作業指示書に反映します。';root.append(hint);
  const update=fn=>edit(p=>{p.arrangements=p.arrangements||{};p.arrangements[projectId]=p.arrangements[projectId]||{};fn(p.arrangements[projectId]);},false);
  for(const section of this.sections){
   const title=document.createElement('h4');title.textContent=section.title;root.append(title);
   const list=document.createElement('div');root.append(list);
   const rows=plan.arrangements?.[projectId]?.[section.key]||[];
   const drawRow=row=>{
    const item=document.createElement('div');item.className='arrangement-row';
    for(const [key,label,type] of section.fields){
     const wrap=document.createElement('label');wrap.textContent=label;
     const input=document.createElement(type==='select'?'select':'input');
     if(type==='select'){for(const [value,text] of [['','未定'],['yes','配達あり'],['no','引取り']])input.add(new Option(text,value));}
     else {input.type=type||'text';if(type==='number'){input.min='0';input.step=section.key==='lease'?'1':'any';}else if(type!=='time')input.maxLength=500;}
     input.value=row[key]??'';input.setAttribute('aria-label',section.title+' '+label);
     input.oninput=()=>update(data=>{const saved=data[section.key]?.find(r=>r.id===row.id);if(saved)saved[key]=input.value;});
     wrap.append(input);item.append(wrap);
    }
    const remove=document.createElement('button');remove.type='button';remove.textContent='削除';remove.onclick=()=>{update(data=>{data[section.key]=(data[section.key]||[]).filter(r=>r.id!==row.id);});item.remove();};item.append(remove);list.append(item);
   };
   rows.forEach(drawRow);
   const add=document.createElement('button');add.type='button';add.textContent='＋ '+section.title;add.onclick=()=>{const row={id:DispatchModel.createId()};update(data=>{data[section.key]=data[section.key]||[];data[section.key].push(row);});drawRow(row);list.lastElementChild.querySelector('input')?.focus();};root.append(add);
  }
  return root;
 },
 print(sheet,plan,projectId){
  for(const section of this.sections){const rows=(plan.arrangements?.[projectId]?.[section.key]||[]).filter(row=>this.meaningful(row));if(!rows.length)continue;
   const title=document.createElement('h3');title.textContent=section.title;sheet.append(title);
   const table=document.createElement('table');table.className='arrangement-table';const head=document.createElement('tr');
   for(const [,label] of section.fields){const th=document.createElement('th');th.textContent=label;head.append(th);}table.append(head);
   for(const row of rows){const tr=document.createElement('tr');for(const [key] of section.fields){const td=document.createElement('td');td.textContent=key==='delivery'?({yes:'配達あり',no:'引取り'}[row[key]]||'未定'):row[key]??'';tr.append(td);}table.append(tr);}sheet.append(table);
  }
 }
};
if(typeof module!=='undefined')module.exports=InstructionArrangements;
