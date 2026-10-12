'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 let ready=false;try{ready=MSShared.ping()?.workflowVersion===1;}catch(e){}
 if(ready)return;
 const notice=document.createElement('section');notice.className='panel';notice.setAttribute('role','status');notice.textContent='改修ファイルは反映済みです。新しい保存処理を有効にするため、起動中の「MS Construction Management」のサーバー画面を閉じ、通常の起動アイコンから起動し直してください。起動後はこの画面を再読み込みしてください。';
 document.querySelector('main')?.prepend(notice);
 for(const id of ['saveDraft','confirmPlan','saveReport','saveRates','saveResources']){const button=document.getElementById(id);if(button){button.disabled=true;button.title='サーバーの再起動後に保存できます。';}}
});
