(function(global){
 'use strict';
 const yen=n=>Math.round(Number(n)||0).toLocaleString('ja-JP')+'円';
 const today=()=>new Date().toLocaleDateString('sv-SE');
 function policy(){try{return JSON.parse(MSShared.getItem('mscm:v1:meta')||'{}').taxPolicy||{rounding:'floor',rates:[{from:'1900-01-01',rate:10}]};}catch(e){return {rounding:'floor',rates:[{from:'1900-01-01',rate:10}]};}}
 function rateOn(date=today()){const rows=policy().rates.filter(r=>r.from<=date).sort((a,b)=>b.from.localeCompare(a.from));return rows.length?Number(rows[0].rate):10;}
 function calc(net,rate,rounding='floor'){net=Number(net)||0;rate=Number(rate);if(!Number.isFinite(rate)||rate<0||rate>100)throw Error('税率は0〜100の数値を入力してください。');const tax=Math[['floor','round','ceil'].includes(rounding)?rounding:'floor'](net*rate/100);return {net,tax,gross:net+tax,rate,rounding};}
 function quote(record,amount){record=record||{};const net=amount===undefined?Number(record.amount||0):Number(amount||0);const rate=record.taxRate??record.contractConditions?.tax??rateOn(record.orderDate||record.registeredDate||today());const q=calc(net,rate,record.taxRounding||policy().rounding);q.confirmed=record.moneyBasis==='net';return q;}
 function gross(record,amount){return quote(record,amount).gross;}
 function detail(record,amount){const q=quote(record,amount);return '税抜 '+yen(q.net)+' ／ 消費税 '+yen(q.tax)+'（'+q.rate+'％）'+(q.confirmed?'':' ／ 税抜として仮計算・基準未確認');}
 function invoiceQuote(rec){
  if(rec.netAmount!==undefined)return {net:Number(rec.netAmount),tax:Number(rec.taxAmount??(Number(rec.amount)-Number(rec.netAmount))),gross:Number(rec.amount)};
  if(rec.document?.items){const net=rec.document.items.reduce((a,i)=>a+Math.round(Number(i.quantity)*Number(i.unitPrice)),0);return {net,tax:Number(rec.amount)-net,gross:Number(rec.amount)};}
  const rate=Number(rec.taxRate??rec.document?.taxRate??rateOn(rec.invoiceDate||rec.date));const net=Math.round(Number(rec.amount)/(1+rate/100));return {net,tax:Number(rec.amount)-net,gross:Number(rec.amount)};
 }
 function fromGross(gross,rate,rounding='floor'){
  gross=Number(gross);if(!Number.isSafeInteger(gross)||gross<0)throw Error('税込総額は0以上の整数で入力してください。');calc(0,rate,rounding);
  const near=Math.floor(gross/(1+Number(rate)/100));
  for(let net=Math.max(0,near-3);net<=near+3;net++){const q=calc(net,rate,rounding);if(q.gross===gross)return q;}
  throw Error('現在の税率・端数処理では、整数の税抜金額でこの総額に一致しません。税込総額または端数処理を見直してください。');
 }
 function addRateOption(el,rate){if(!el)return;if(el.tagName==='SELECT'&&!Array.from(el.options).some(o=>Number(o.value)===Number(rate))){const o=document.createElement('option');o.value=String(rate);o.textContent=rate+'％';el.append(o);}el.value=String(rate);}
 function install(data){const save=data.save;data.save=function(entity,rec){
  if(['projects','orders'].includes(entity)&&rec.status!=='inactive'){
   const old=rec.id?data.get(entity,rec.id):null;
   if(old&&!old.moneyBasis&&!confirm('この記録の金額を税抜として確認・保存します。受注・発注に入力した金額は税抜で間違いありませんか？\n税込で入力された過去の記録ならキャンセルしてください。'))throw Error('金額基準の確認を中止しました。');
   const formVisible=document.getElementById('addPanel')?.style.display!=='none';
   const field=document.getElementById(entity==='orders'?(formVisible?'ccTax':'simpleTaxRate'):'recordTaxRate');
   const rate=field&&field.value!==''?Number(field.value):rec.contractConditions?.tax??rec.taxRate??old?.taxRate??rateOn(rec.orderDate||rec.registeredDate||today());
   const rounding=document.getElementById('recordTaxRounding')?.value||rec.taxRounding||old?.taxRounding||policy().rounding;
   const amount=entity==='projects'?data.contractValue(rec):rec.amount;
   const q=calc(amount,rate,rounding);
   rec={...rec,moneyBasis:'net',taxRate:q.rate,taxRounding:q.rounding,taxAmount:q.tax,grossAmount:q.gross,taxConfirmedAt:new Date().toISOString()};
   if(entity==='orders')rec.contractConditions={...rec.contractConditions,tax:String(q.rate)};
  }
  if(entity==='supplierInvoices'&&rec.status!=='inactive'&&rec.netAmount!==undefined){
   const q=calc(rec.netAmount,rec.taxRate??rateOn(rec.invoiceDate),rec.taxRounding||policy().rounding);
   rec={...rec,amount:q.gross,netAmount:q.net,taxAmount:q.tax,grossAmount:q.gross,taxRate:q.rate,taxRounding:q.rounding,moneyBasis:'net'};
  }
  return save(entity,rec);
 };}
 function ready(){
  const page=location.pathname.split('/').pop();
  if(['kouji_edit.html','juchu_keiyaku.html'].includes(page)){
   const id=new URLSearchParams(location.search).get('id')||sessionStorage.getItem('mscm:selectedProjectId');
   const rec=id?MSData.get('projects',id):null;
   const panel=document.createElement('section');panel.style.cssText='margin:12px 0;padding:12px;background:#eef6fb;border:1px solid #c9dbe8;border-radius:7px';
   panel.innerHTML='<b>受注金額は税抜で入力します</b>　税率 <input id="recordTaxRate" type="number" min="0" max="100" step="0.1" style="width:75px">％　端数 <select id="recordTaxRounding"><option value="floor">切捨て</option><option value="round">四捨五入</option><option value="ceil">切上げ</option></select><div id="recordTaxPreview" style="margin-top:7px"></div>';
   const host=document.querySelector('main')||document.body;
   if(page==='kouji_edit.html'){
    const amountField=document.getElementById('contractAmount')?.closest('.field');
    panel.style.cssText='margin-top:5px;font-size:12px;color:#587183';
    const preview=panel.querySelector('#recordTaxPreview');preview.style.marginTop='0';
    const settings=document.createElement('details');settings.innerHTML='<summary style="cursor:pointer;margin-top:5px">税の設定</summary>';
    while(panel.firstChild)settings.append(panel.firstChild);
    settings.querySelector('b').remove();preview.remove();panel.append(preview,settings);
    if(amountField)amountField.append(panel);else host.append(panel);
   }else host.prepend(panel);
   document.getElementById('recordTaxRate').value=rec?.taxRate??rateOn();document.getElementById('recordTaxRounding').value=rec?.taxRounding||policy().rounding;
   const update=()=>{const inp=document.getElementById('contractAmount')||document.getElementById('final');const raw=inp?Number(inp.value.replace(/[^0-9.-]/g,'')):Number(MSData.contractValue(rec)||0);try{const q=calc(raw,document.getElementById('recordTaxRate').value,document.getElementById('recordTaxRounding').value);document.getElementById('recordTaxPreview').textContent=page==='kouji_edit.html'?'税込 '+yen(q.gross)+' ／ 消費税 '+yen(q.tax):'受注総額（税込） '+yen(q.gross)+' ／ 税抜 '+yen(q.net)+' ／ 消費税 '+yen(q.tax);}catch(e){document.getElementById('recordTaxPreview').textContent=e.message;}};
   host.addEventListener('input',update);host.addEventListener('change',update);update();window.addEventListener('load',()=>setTimeout(update,0));
  }
  if(page==='kanri_settei.html'){const a=document.createElement('a');a.href='tax_settings.html';a.textContent='消費税率・端数処理の設定';a.style.cssText='display:inline-block;margin:12px;padding:12px;background:#176fa8;color:white;border-radius:6px';(document.querySelector('main')||document.body).prepend(a);}
 }
 global.MSTax={yen,today,policy,rateOn,calc,quote,gross,detail,invoiceQuote,fromGross,install,addRateOption};
 document.addEventListener('DOMContentLoaded',ready);
})(window);
