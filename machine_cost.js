(function(root){
'use strict';
function identify(machine,resources){
 if(machine.resourceId)return resources.find(r=>r.id===machine.resourceId)||null;
 const name=String(machine.name||'').replace(/（(通勤|材料運搬)）$/,'');
 const matches=resources.filter(r=>r.name===name);
 return matches.length===1?matches[0]:null;
}
function quote(machine,resources){
 const resource=identify(machine,resources),purpose=machine.vehiclePurpose||(/（通勤）$/.test(machine.name)?'commute':/（材料運搬）$/.test(machine.name)?'transport':'');
 const saved=machine.costSnapshot;
 let fee,unit,resourceId=resource?.id||machine.resourceId||'';
 if(saved&&saved.fee!==null&&saved.fee!==undefined&&saved.resourceId===resourceId&&saved.vehiclePurpose===purpose){fee=saved.fee;unit=saved.unit;}
 else if(resource){const rate=resource.kind==='vehicle'?resource.vehicleRates?.[purpose]:null;fee=rate?.fee??resource.usageFee??null;unit=rate?.fee!==null&&rate?.fee!==undefined?rate.unit:(resource.usageUnit||'day');}
 else fee=null;
 if(fee!==null&&fee!==undefined&&(!Number.isInteger(fee)||fee<0||fee>10000000||!['day','hour'].includes(unit)))throw Error('機械・車両の単価をマスターで確認してください。');
 const amount=fee===null||fee===undefined?null:Math.round(fee*Number(machine.hours)/(unit==='day'?8:1));
 return {...machine,resourceId,vehiclePurpose:purpose,costSnapshot:{resourceId,vehiclePurpose:purpose,fee:fee??null,unit:unit||'day',baseHours:unit==='hour'?1:8},amount};
}
const api={identify,quote};if(typeof module!=='undefined')module.exports=api;else root.MachineCost=api;
})(typeof window!=='undefined'?window:globalThis);
