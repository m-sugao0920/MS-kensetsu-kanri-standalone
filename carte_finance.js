(function(global){
'use strict';
const active=rows=>(rows||[]).filter(r=>r&&r.status!=='inactive');
const number=value=>{const n=Number(value);if(!Number.isFinite(n))throw Error('金額に未確認の値があります。各管理画面で確認してください。');return n;};
function calculate(input,tax){
 const {contract,ledger}=input,invoices=active(input.invoices),receipts=active(input.receipts);
 const billed=invoices.reduce((n,r)=>n+number(tax.invoiceQuote(r).net),0),gross=invoices.reduce((n,r)=>n+number(r.amount),0),received=receipts.reduce((n,r)=>n+number(r.amount),0);
 const labor=ledger.rows.filter(r=>r.source==='自社日報').reduce((n,r)=>n+number(r.amount),0),supplier=ledger.rows.filter(r=>r.source!=='自社日報').reduce((n,r)=>n+number(r.amount),0),cost=number(ledger.total);
 if(Math.abs(labor+supplier-cost)>0.01)throw Error('原価の明細と合計が一致しません。原価台帳を確認してください。');
 const validContract=contract!==null&&contract!==undefined&&contract!=='';
 const c=validContract?number(contract):null,remaining=c===null?null:c-cost;
 return {contract:c,billed,billRemaining:c===null?null:c-billed,unpaid:gross-received,gross,received,supplier,labor,cost,remaining,rate:c>0?remaining/c*100:null,invoiceCount:invoices.length,costCount:ledger.rows.length,warnings:ledger.warnings||[]};
}
const money=n=>n===null||n===undefined?'未登録':Math.round(n).toLocaleString('ja-JP')+'円';
async function render(context){
 const {id,project,budget,orders,salesProject}=context,noticeBox=document.getElementById('financeNotices');
 const url=page=>page+'?id='+encodeURIComponent(id);
 document.getElementById('invoiceBreakdownButton').href=url('hacchu_seikyu_kanri.html')+'#invoiceReview';
 for(const link of document.querySelectorAll('[data-finance-page]'))link.href=url(link.dataset.financePage);
 const cells={};for(const card of document.querySelectorAll('[data-finance]'))cells[card.dataset.finance]={card,value:card.querySelector('.value'),sub:card.querySelector('.metric-sub')};
 const rows=[...document.querySelectorAll('#financeProgress .progress-row')];
 const progress=(index,text,status)=>{rows[index].children[1].textContent=text;rows[index].children[2].textContent=status;};
 const contract=MSData.contractValue(project);
 let receipts=salesProject.receipts;if(!Array.isArray(receipts))receipts=MSData.all('payments').filter(r=>String(r.projectId)===String(id)&&(!r.dataSide||r.dataSide==='sales'));
 try{
  const response=await fetch('/api/cost/ledger?projectId='+encodeURIComponent(id),{cache:'no-store'});const ledger=await response.json();if(!response.ok)throw Error(ledger.error||'原価台帳を読み込めません。');
  const values=calculate({contract,ledger,invoices:salesProject.invoices||[],receipts},MSTax);
  for(const [key,cell]of Object.entries(cells)){cell.value.textContent=key==='remaining'?money(values.remaining)+(values.rate===null?'':' ／ '+values.rate.toFixed(1)+'％'):money(values[key]);cell.card.classList.toggle('finance-negative',values[key]!==null&&values[key]<0);}
  cells.contract.sub.textContent=values.contract===null?'受注・契約で金額を登録してください':'増減契約を含む ／ 税込 '+money(MSTax.gross(project,values.contract));
  cells.billed.sub.textContent='登録済みの元請請求 '+values.invoiceCount+'件';
  cells.supplier.sub.textContent='発注書なしの請求も含む ／ 登録済みの原価';
  cells.cost.sub.textContent='下請・仕入請求＋自社労務費 ／ 原価台帳と一致';
  if(values.warnings.length){cells.cost.sub.textContent='一部原価に確認事項あり（下の要確認を参照）';cells.remaining.sub.textContent='原価に未確認項目あり ／ 参考額';}
  progress(0,'受注金額（税抜） '+money(values.contract),values.contract===null?'未登録':'登録済');
  const hasBudget=budget.totalAmount!==undefined&&budget.totalAmount!==null;
  if(project.budgetManagement==='none')progress(1,'予算管理なし ／ 登録済みの請求・日報から原価を集計','予算管理なし');
  else if(hasBudget){const total=number(budget.totalAmount);progress(1,'実行予算（税抜） '+money(total)+' ／ 予定利益 '+money(values.contract===null?null:values.contract-total)+' ／ 現在の予算残 '+money(total-values.cost),'予定');}
  else progress(1,'予算未登録 ／ 請求・日報の原価は集計しています','未登録');
  progress(2,'下請・仕入請求累計（税抜） '+money(values.supplier),'登録済み原価');
  progress(3,'元請請求（税抜） '+money(values.billed)+' ／ 入金（税込） '+money(values.received)+' ／ 未収金（税込） '+money(values.unpaid),'登録済み実績');
  progress(4,'現在の原価 '+money(values.cost)+' ／ 受注額からの残額 '+money(values.remaining),'暫定');
  progress(5,orders.length?'発注済（税抜） '+money(orders.reduce((n,r)=>n+number(r.amount),0))+' ／ '+orders.length+'件':'発注書の登録なし ／ 請求だけでも原価集計できます','参考');
  noticeBox.replaceChildren();const add=text=>{const div=document.createElement('div');div.className='notice normal finance-note';div.textContent=text;noticeBox.append(div);};
  add('残額は受注金額から登録済み原価を差し引いた暫定額です。今後の請求・未計上の原価は含みません。確定利益ではありません。');
  if(values.billRemaining!==null&&values.billRemaining<0)add('元請請求が受注金額を超えています。受注金額・増減契約を確認してください。');
  if(values.unpaid<0)add('入金額が元請請求額を超えています。前受金・請求・入金の登録を確認してください。');
  for(const warning of values.warnings)add(warning);
  if(project.legacyFinancials&&(!values.invoiceCount||!orders.length))add('旧データの請求・入金・予算発注額は、現在の登録明細に足し合わせていません。必要な記録は各管理画面で確認してください。');
 }catch(error){for(const cell of Object.values(cells)){cell.value.textContent='確認できません';}noticeBox.textContent='金額を読み込めませんでした：'+error.message+'。再読み込み、または原価台帳で確認してください。';for(const row of rows){row.children[1].textContent='金額を確認できません';row.children[2].textContent='要確認';}}
}
const api={calculate,render};if(typeof module!=='undefined')module.exports=api;else global.CarteFinance=api;
})(typeof window!=='undefined'?window:globalThis);
