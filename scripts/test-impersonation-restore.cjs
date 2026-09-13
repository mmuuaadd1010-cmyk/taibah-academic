const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('visitor-analytics.js','utf8');
const patch=source.slice(source.indexOf('/* Account switching recovery'));
function setup(){
 const ls=new Map(),writes=[];const storage={getItem:k=>ls.get(k)||null,setItem:(k,v)=>ls.set(k,String(v)),removeItem:k=>ls.delete(k)};
 const spec={id:'cs',name:'علوم الحاسب',levels:[{level:1,courses:[{id:'CS111',name:'برمجة',hrs:4}]}]};
 const c={console,Date,Promise,JSON,Object,Array,Number,String,Error,setTimeout,clearTimeout,localStorage:storage,CURRENT_USER:{id:'target'},PULLING:false,_pushTimer:null,_pushPending:false,student:{},planStore:{},planData:null,currentPlan:null,currentSpec:null,goalsData:[],scheduleData:{},genData:{},pomoStats:{},USER_DATA_KEYS:['tu_pro_st','tu_pro_plan','tu_pro_plans','tu_pro_profile','tu_pro_grad','tu_pro_goals'],TAIBAH_SPECS:[{entries:[spec]}],IMAM_SPECS:[],PNU_SPECS:[],withTimeout:p=>p,toast(){},clearLocalUserData(){c.USER_DATA_KEYS.forEach(k=>ls.delete(k));ls.delete('tu_pro_ts');ls.delete('tu_pro_uid');c.planStore={};c.planData=null},reloadStateFromLS(){},cloudPull(){},scheduleCloudPush(){},cloudPush(){},flushCloudPushIfPending(){},afterLogin(){},injectAccountUI(){},syncProfile(){},subscribeInbox(){},checkAdminStatus(){},routeLocal(){},saveSt(){}};
 c._origSet=storage.setItem;vm.createContext(c);vm.runInContext(patch,c);
 c.client=(data,profile={name:'طالب',spec:'cs',username:'target',level:3},error=null)=>{c.sbClient={from(table){let q={select(){return q},eq(){return q},maybeSingle:async()=>({data:table==='user_data'?data:profile,error}),upsert:async row=>{writes.push(row);return {error}}};return q;}}};
 return {c,ls,writes};
}
(async()=>{
 const plan={specId:'cs',levels:[{level:1,courses:[{id:'CS111',hrs:4,grade:'A'}]}]},blob={tu_pro_st:JSON.stringify({name:'طالب',spec:'cs'}),tu_pro_plan:JSON.stringify(plan),tu_pro_ts:'50'};
 let t=setup();t.ls.set('tu_pro_uid','admin');t.ls.set('tu_pro_st',JSON.stringify({name:'admin',spec:'other'}));t.c.client({data:blob});await t.c.cloudPull();assert.equal(t.c.student.university,'taibah');assert.equal(t.c.planStore.cs.levels[0].courses[0].grade,'A');assert.equal(JSON.parse(t.ls.get('tu_pro_profile')).username,'target');await t.c.cloudPush();assert.equal(t.writes[0].user_id,'target');assert.equal(JSON.parse(t.writes[0].data.tu_pro_plan).levels[0].courses[0].grade,'A');
 t=setup();t.ls.set('tu_pro_uid','admin');t.ls.set('tu_pro_plan',JSON.stringify(plan));t.c.client(null);await t.c.cloudPull();assert.equal(t.c.planData,null);assert.equal(t.ls.has('tu_pro_plan'),false);
 t=setup();t.ls.set('tu_pro_uid','admin');t.c.client(null,null,{message:'network'});await assert.rejects(t.c.cloudPull());await t.c.cloudPush();assert.equal(t.writes.length,0);
 console.log('PASS: developer email login restores legacy grades, GPA source, specialization/university and profile; isolates empty/failed account loads.');
})().catch(e=>{console.error(e);process.exitCode=1});
