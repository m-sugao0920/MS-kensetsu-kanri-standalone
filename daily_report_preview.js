'use strict';
const DailyReportPreview={
 open(report,render,fallback){
  const popup=window.open('about:blank','mscmDailyReportPreview','popup=yes,width=1100,height=800,resizable=yes,scrollbars=yes');
  if(!popup){fallback();return false;}
  const doc=popup.document;
  doc.documentElement.lang='ja';
  doc.head.replaceChildren();doc.body.replaceChildren();
  const title=doc.createElement('title');title.textContent='日報の確認｜'+report.date+' '+(report.projectNo||'');doc.head.append(title);
  const viewport=doc.createElement('meta');viewport.name='viewport';viewport.content='width=device-width, initial-scale=1';doc.head.append(viewport);
  const style=doc.createElement('style');
  style.textContent='*{box-sizing:border-box}body{margin:0;background:#f2f7fb;color:#172b3a;font-family:Meiryo,sans-serif;font-size:15px}header{background:#205680;color:white;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px}h1{font-size:21px;margin:0}main{max-width:1080px;margin:24px auto;padding:24px;background:white;border:1px solid #d5e2ec;border-radius:8px}button,.btn{padding:9px 16px;border:1px solid #b9ccd9;border-radius:5px;background:white;color:#205680;cursor:pointer;text-decoration:none;font:inherit}strong{font-size:19px}h3{font-size:16px;margin-top:24px}p{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7}.scroll{overflow:auto}table{border-collapse:collapse;width:100%;min-width:750px;font-size:14px}th,td{border-bottom:1px solid #dce6ee;padding:12px 8px;text-align:left}th{background:#edf5fa}header div{display:flex;gap:10px}@media(max-width:600px){header{padding:14px;flex-wrap:wrap}main{margin:12px;padding:16px}}@media print{body{background:white}header{background:white;color:black;padding:0 24px}header div{display:none}main{border:0;margin:0;max-width:none}.scroll{overflow:visible}table{min-width:0}.btn{display:none}}';
  doc.head.append(style);
  const header=doc.createElement('header'),heading=doc.createElement('h1');heading.textContent='登録済み日報の確認';header.append(heading);
  const actions=doc.createElement('div');
  for(const [label,action] of [['印刷',()=>popup.print()],['閉じて一覧へ戻る',()=>{popup.close();window.focus();}]]){
   const button=doc.createElement('button');button.type='button';button.textContent=label;button.onclick=action;actions.append(button);
  }
  header.append(actions);const content=doc.createElement('main');doc.body.append(header,content);
  render(report,content);popup.focus();return true;
 }
};
