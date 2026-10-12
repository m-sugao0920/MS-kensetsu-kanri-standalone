'use strict';
const FieldInvoiceList=(()=>{
 const norm=x=>String(x||'').normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60)).replace(/\s+/g,'');
 const status=(i,orders)=>i.reviewStatus==='noOrderRequired'?'noOrderRequired':orders.some(o=>o.id===i.orderId&&o.status!=='inactive')?'linked':'pending';
 function select(invoices,orders,partners,f){return invoices.filter(i=>i.status!=='inactive').filter(i=>f.status==='all'||status(i,orders)===f.status).filter(i=>f.period==='all'||f.period==='month'&&i.invoiceDate?.startsWith(f.month)||f.period==='custom'&&i.invoiceDate>=f.start&&i.invoiceDate<=f.end).filter(i=>{const p=partners.find(p=>p.id===i.supplierId)||{};const text=norm([p.no,p.code,p.name,i.supplierName].join(' '));return String(f.supplier||'').trim().split(/\s+/).every(q=>text.includes(norm(q)));}).sort((a,b)=>String(a.invoiceDate||'').localeCompare(String(b.invoiceDate||''))||String(a.id).localeCompare(String(b.id)));}
 function page(rows,number,size=10){const pages=Math.max(1,Math.ceil(rows.length/size)),current=Math.max(1,Math.min(number,pages));return {rows:rows.slice((current-1)*size,current*size),current,pages,total:rows.length,net:rows.reduce((s,i)=>s+Number(i.netAmount||0),0)};}
 return {status,select,page};
})();
if(typeof module!=='undefined')module.exports=FieldInvoiceList;
