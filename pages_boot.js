/* GitHub Pages demo: all business processing and user data stay in this browser. */
(async()=>{
 'use strict';
 const originalFetch=window.fetch.bind(window),NativeXHR=window.XMLHttpRequest;
 const base=new URL('.',location.href),storageKey='mscm-pages-v2:'+base.pathname;
 const overlay=document.createElement('div');overlay.style.cssText='position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:#f3f8fc;color:#173f6b;font:18px Meiryo,sans-serif';
 const notice=document.createElement('div');notice.textContent=localStorage.getItem(storageKey)?'':'デモを準備しています…';overlay.append(notice);document.body.append(overlay);
 const script=url=>new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=url;el.onload=resolve;el.onerror=()=>reject(Error('デモの実行環境を読み込めませんでした。接続を確認して再読み込みしてください。'));document.head.append(el);});

 async function unlock(){
  const key='mscm-demo-login:'+base.pathname;
  if(sessionStorage.getItem(key)==='allowed')return;
  notice.replaceChildren();
  const form=document.createElement('form');form.style.cssText='width:min(360px,85vw);background:white;padding:28px;border:1px solid #cadce8;border-radius:12px';
  const heading=document.createElement('h1');heading.textContent='MS建設管理 デモ';heading.style.fontSize='22px';
  const label=document.createElement('label');label.textContent='パスワード';label.htmlFor='demo-password';
  const input=document.createElement('input');input.id='demo-password';input.type='password';input.autocomplete='current-password';input.required=true;input.style.cssText='display:block;width:100%;box-sizing:border-box;font-size:20px;margin:12px 0;padding:10px;border:1px solid #91afc6;border-radius:6px';
  const button=document.createElement('button');button.type='submit';button.textContent='デモを開く';button.style.cssText='width:100%;padding:12px;background:#176fa8;color:white;border:0;border-radius:6px;font-size:16px';
  const message=document.createElement('p');message.setAttribute('role','status');message.style.cssText='font-size:14px;color:#a13220';
  form.append(heading,label,input,button,message);notice.append(form);input.focus();
  await new Promise(resolve=>{form.onsubmit=async event=>{event.preventDefault();button.disabled=true;
   try{const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input.value));const hash=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
    if(hash==='a447121cc5948970732efda054e44237f70bb347515964b80f6ae301638df0a8'){sessionStorage.setItem(key,'allowed');resolve();}else{message.textContent='パスワードが違います。';input.select();}
   }catch(error){message.textContent='パスワードを確認できません。公開URLまたは確認用の起動ボタンから開いてください。';}
   finally{button.disabled=false;}
  };});
  notice.textContent=localStorage.getItem(storageKey)?'':'デモを読み込んでいます…';
 }
 try{
  if(location.protocol==='file:')throw Error('この版はWeb上で開きます。公開前の確認には「デモを確認.bat」を使ってください。');
  await unlock();
  let raw=localStorage.getItem(storageKey);
  if(!raw){const response=await originalFetch(new URL('demo_data.json.txt',base));if(!response.ok)throw Error('デモデータを読み込めません。');raw=JSON.stringify(await response.json());localStorage.setItem(storageKey,raw);}
  JSON.parse(raw);
  notice.textContent=localStorage.getItem(storageKey)?'':'デモを読み込んでいます…';
  await script('https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.js');
  const py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/'});
  py.FS.mkdirTree('/app');
  await script(new URL('pages_code.js?v=20261012b',base).href);
  for(const name of ['purchase_office','cost_ledger','office_validation','dispatch_validation','worker_reports','pages_backend']){const code=window.MSPagesCode&&window.MSPagesCode[name];if(!code)throw Error('集計処理が不足しています：'+name);py.FS.writeFile('/app/'+name+'.py',code);}
  py.runPython("import sys; sys.path.insert(0, '/app'); from pages_backend import request as pages_request");
  const request=py.globals.get('pages_request');
  function localRequest(url,method,body){
   try{
    const current=localStorage.getItem(storageKey);if(!current)throw Error('保存データがありません。画面を再読み込みしてください。');
    const result=JSON.parse(request(current,url,method,body||'{}'));
    if(result.storage){localStorage.setItem(storageKey,JSON.stringify(result.storage));delete result.storage;}
    return result;
   }catch(error){return {status:507,data:{error:'デモデータを保存できませんでした。バックアップを書き出してからブラウザーの空き容量を確認してください。 '+error.message}};}
  }
  const isAPI=url=>new URL(url,location.href).origin===location.origin&&new URL(url,location.href).pathname.startsWith('/api/');
  const apiURL=url=>{const u=new URL(url,location.href);return u.pathname+u.search;};
  function special(url){if(url.startsWith('/api/network'))return {status:200,data:{ok:true,mode:'browser-demo',addresses:[base.href+'index.html'],runningPort:0,savedPort:0,dataFile:'このブラウザーのデモデータ',localAdmin:false}};return null;}
  class LocalXHR{
   constructor(){this.native=new NativeXHR();this.status=0;this.responseText='';this.readyState=0;}
   open(method,url,async=true){this.method=method;this.url=url;this.local=isAPI(url);this.async=async;if(!this.local)this.native.open(method,url,async);this.readyState=1;}
   setRequestHeader(key,value){if(!this.local)this.native.setRequestHeader(key,value);}
   send(body){if(!this.local){this.native.send(body);this.status=this.native.status;this.responseText=this.native.responseText;return;}const result=special(apiURL(this.url))||localRequest(apiURL(this.url),this.method,body);this.status=result.status;this.responseText=JSON.stringify(result.data);this.response=this.responseText;this.readyState=4;this.onreadystatechange?.();this.onload?.();}
   abort(){if(!this.local)this.native.abort();}
   getResponseHeader(){return 'application/json';}
  }
  window.XMLHttpRequest=LocalXHR;
  let documentsDB;
  const openDB=()=>documentsDB||(documentsDB=new Promise((resolve,reject)=>{const r=indexedDB.open('mscm-pages-documents:'+base.pathname,1);r.onupgradeneeded=()=>r.result.createObjectStore('documents',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);}));
  async function documents(url,init){const u=new URL(url,location.href),db=await openDB();
   const operation=(mode,fn)=>new Promise((resolve,reject)=>{const tx=db.transaction('documents',mode),r=fn(tx.objectStore('documents'));tx.oncomplete=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});
   if(u.pathname.endsWith('/list')){const rows=await operation('readonly',s=>s.getAll());return {documents:rows.filter(r=>r.projectId===u.searchParams.get('projectId')).map(({blob,...r})=>({...r,url:URL.createObjectURL(blob)}))};}
   if(u.pathname.endsWith('/delete')){await operation('readwrite',s=>s.delete(JSON.parse(init.body).id));return {ok:true};}
   const headers=new Headers(init.headers),blob=init.body instanceof Blob?init.body:new Blob([init.body],{type:'application/pdf'});
   if(blob.size>100*1024*1024||!new TextDecoder().decode(await blob.slice(0,5).arrayBuffer()).startsWith('%PDF-'))throw Error('PDFファイルを選択してください。');
   const record={id:crypto.randomUUID(),projectId:headers.get('X-Project-Id'),fileName:decodeURIComponent(headers.get('X-File-Name')||''),title:decodeURIComponent(headers.get('X-Title')||''),category:decodeURIComponent(headers.get('X-Category')||'その他'),registeredAt:new Date().toISOString(),size:blob.size};
   await operation('readwrite',s=>s.put({...record,blob}));return {ok:true,document:{...record,url:URL.createObjectURL(blob)}};
  }
  window.fetch=async(input,init={})=>{
   const url=typeof input==='string'?input:input.url||String(input);if(!isAPI(url))return originalFetch(input,init);
   let result;
   if(apiURL(url).startsWith('/api/documents/')){try{result={status:200,data:await documents(url,init)}}catch(e){result={status:400,data:{error:e.message}}}}
   else result=special(apiURL(url))||localRequest(apiURL(url),init.method||'GET',init.body);
   return new Response(JSON.stringify(result.data),{status:result.status,headers:{'Content-Type':'application/json'}});
  };
  const pending=[],loadPending=[],docAdd=document.addEventListener.bind(document),winAdd=window.addEventListener.bind(window);
  document.addEventListener=function(type,listener,options){if(type==='DOMContentLoaded')pending.push(listener);else docAdd(type,listener,options);};
  window.addEventListener=function(type,listener,options){if(type==='load')loadPending.push(listener);else winAdd(type,listener,options);};
  for(const original of document.querySelectorAll('script[type="text/pages-deferred"]')){
   const active=document.createElement('script');
   if(original.src){active.src=original.src;await new Promise((resolve,reject)=>{active.onload=resolve;active.onerror=()=>reject(Error('画面を読み込めませんでした。'));original.after(active);});}
   else{active.textContent=original.textContent;original.after(active);}
  }
  document.addEventListener=docAdd;window.addEventListener=winAdd;
  for(const callback of pending)typeof callback==='function'?callback.call(document,new Event('DOMContentLoaded')):callback.handleEvent(new Event('DOMContentLoaded'));
  for(const callback of loadPending)typeof callback==='function'?callback.call(window,new Event('load')):callback.handleEvent(new Event('load'));
  document.documentElement.classList.remove('ms-app-loading');
  const banner=document.createElement('aside');banner.className='no-print';banner.style.cssText='padding:8px 16px;background:#fff4cf;color:#493b13;font:13px Meiryo,sans-serif';banner.textContent='デモ版・架空62工事 ／ 入力内容はこのブラウザーだけに保存されます。';document.body.prepend(banner);
  window.MSPagesDemo={ready:true,storageKey};overlay.remove();
 }catch(error){document.documentElement.classList.remove('ms-app-loading');notice.textContent=error.message+' 再読み込みしてお試しください。';console.error(error);}
})();
