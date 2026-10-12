'use strict';
const FieldInvoiceRegistration=(()=>{
 const active=e=>!['inactive','cancelled','canceled','void','deleted'].includes(e.status);
 const norm=s=>String(s||'').normalize('NFKC').replace(/\s+/g,'').toLowerCase();
 function candidates(entries,draft,exclude=''){
  return entries.filter(e=>active(e)&&e.id!==exclude&&e.supplierId===draft.supplierId&&(e.inputSource==='office'||(e.inputSource!=='field'&&!(e.legacyInvoiceIds||[]).length))).filter(e=>{
   const a=norm(e.invoiceNo),b=norm(draft.invoiceNo);
   return a&&b?a===b:e.date===draft.date&&Number(e.grossAmount??(e.netAmount+e.taxAmount))===draft.grossAmount;
  });
 }
 function request(method,path,body){const x=new XMLHttpRequest();x.open(method,path,false);if(body)x.setRequestHeader('Content-Type','application/json');x.send(body?JSON.stringify(body):null);const d=JSON.parse(x.responseText||'{}');if(x.status<200||x.status>=300)throw Error(d.error||'請求データを取得できませんでした。');return d;}
 function warning(matches,state,show){return new Promise(resolve=>{
  const dialog=document.createElement('dialog');dialog.id='fieldDuplicateWarning';dialog.style.cssText='width:min(720px,92vw);max-height:85vh;overflow:auto;border:1px solid #b8cdda;border-radius:10px;padding:22px;color:#263f50';
  function node(tag,text){const n=document.createElement(tag);n.textContent=text;return n;}
  dialog.append(node('h2','経理に登録済みの請求があります'),node('p','同じ請求と思われる候補が見つかりました。登録済みの請求を確認してください。'));
  for(const e of matches){const projects=(e.allocations||[]).map(l=>state.projects.find(p=>p.id===l.projectId)?.name||l.projectName||'').filter(Boolean);dialog.append(node('p',[e.supplierName,e.date,'請求書番号：'+(e.invoiceNo||'なし'),'税込 '+Number(e.grossAmount??(e.netAmount+e.taxAmount)).toLocaleString('ja-JP')+'円',[...new Set(projects)].join('／')].join('　')));
   const open=node('button','登録済みの請求を開く');open.type='button';open.onclick=()=>{dialog.close();const inv=state.invoices.find(i=>active(i)&&i.costEntryId===e.id);if(inv)show(inv);resolve(false);};dialog.append(open);
  }
  const cancel=node('button','入力に戻る');cancel.type='button';cancel.onclick=()=>{dialog.close();resolve(false);};
  const proceed=node('button','別の請求として登録');proceed.type='button';proceed.onclick=()=>{dialog.close();resolve(true);};dialog.append(node('p','別の請求であることを確認できた場合のみ、登録を続けてください。'),cancel,proceed);
  dialog.addEventListener('cancel',()=>resolve(false));dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();cancel.focus();
 });}
 async function save(record,subject,show){
  const state=request('GET','/api/purchase/list'),existing=record.id?state.invoices.find(i=>i.id===record.id):null,old=existing?state.entries.find(e=>e.id===existing.costEntryId):null;
  if(record.id&&!old)throw Error('請求が変更されています。画面を更新してください。');
  if(old&&((old.allocations||[]).length!==1||old.inputSource!=='field'))throw Error('この請求の入力内容は事務入力から修正してください。発注との対応付けはこの画面で行えます。');
  const tax=MSTax.calc(Number(record.netAmount),record.taxRate,MSTax.policy().rounding);
  const draft={...(old||{}),id:old?.id,inputSource:'field',supplierId:record.supplierId,date:record.invoiceDate,invoiceNo:record.memo||'',netAmount:tax.net,taxAmount:tax.tax,taxRate:record.taxRate,grossAmount:tax.gross,allocations:[{projectId:record.projectId,orderId:record.orderId||'',subject,workTypeId:old?.allocations?.[0]?.workTypeId||'',content:record.content||'',netAmount:tax.net}]};
  if(!old){const matches=candidates(state.entries,draft);if(matches.length&&!await warning(matches,state,show))return null;}
  const result=request('POST','/api/purchase/save',{record:draft,expected:state.versions});MSShared.refresh();
  const refreshed=request('GET','/api/purchase/list'),inv=refreshed.invoices.find(i=>active(i)&&i.costEntryId===result.record.id&&i.projectId===record.projectId);
  if(!inv)throw Error('保存後の請求を確認できません。画面を更新してください。');
  return inv;
 }
 return {candidates,save};
})();
if(typeof module!=='undefined')module.exports=FieldInvoiceRegistration;
