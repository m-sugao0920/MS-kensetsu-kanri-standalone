/* MS建設管理システム スタンドアロン保存 Ver.1.0
   GitHub Pages等の静的配布用。データはこのブラウザのlocalStorageだけに保存します。
   他PC・他ブラウザとは共有されません。
*/
(function(global){
  'use strict';
  const PREFIX='';
  global.MS_STANDALONE=true;
  global.MSShared={
    getItem(key){ try{return localStorage.getItem(PREFIX+key)}catch(e){throw new Error('ブラウザ保存データを読み込めません。')} },
    setItem(key,value){ try{localStorage.setItem(PREFIX+key,String(value))}catch(e){throw new Error('ブラウザへ保存できません。容量またはブラウザ設定を確認してください。')} },
    removeItem(key){ try{localStorage.removeItem(PREFIX+key)}catch(e){} },
    refresh(){ return true; },
    ping(){ return {ok:true,mode:'standalone'}; }
  };
})(window);
