const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
function section(a,b){return html.slice(html.indexOf(a),html.indexOf(b,html.indexOf(a)));}
const elements=new Map(),store=new Map();
function element(id){if(!elements.has(id))elements.set(id,{style:{},classList:{toggle(){},add(){},remove(){}},appendChild(){}});return elements.get(id);}
const c={console,Date,Promise,JSON,Object,Array,isFinite,setTimeout,clearTimeout,CURRENT_USER:{id:'account-a'},IS_ADMIN:false,document:{getElementById:element,createElement:()=>({}),querySelectorAll:()=>[]},window:{addEventListener(){}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},withTimeout:p=>p,subRender(){}};vm.createContext(c);
vm.runInContext(section('function subUserId(){','function subMsg('),c);
vm.runInContext(section('function tuSubActive(v){','function genGoSub(){'),c);
function client(record,old=[]){return {from(table){let q={select(){return q},eq(){return q},order(){return q},limit(){return q},maybeSingle(){return Promise.resolve({data:record})},then(a,b){return Promise.resolve({data:old}).then(a,b)}};return q}}}
(async()=>{
 const active={user_id:'account-a',expires_at:'2999-01-01',plan_type:'year'};
 c.sbClient=client(active);assert.equal(await c.genGateCheck(),true);assert.equal(element('gen-body-wrap').style.display,'');
 c.CURRENT_USER={id:'account-b'};assert.equal(c.subLocal(),null,'Cache must belong to signed-in account');
 c.sbClient=client({expires_at:'2000-01-01'});assert.equal(await c.genGateCheck(),false);assert.equal(element('gen-body-wrap').style.display,'none');
 c.sbClient=client(null,[{code:'legacy',plan_type:'lifetime',redeemed_at:'2020-01-01'}]);assert.equal(await c.genGateCheck(),true);
 c.sbClient=client(null,[]);assert.equal(await c.genGateCheck(),false);assert.equal(c.subLocal(),null);
 let resolve;c.sbClient={from(){const q={select(){return q},eq(){return q},order(){return q},limit(){return q},maybeSingle(){return new Promise(r=>resolve=r)}};return q}};
 const pending=c.genGateCheck();c.CURRENT_USER={id:'account-c'};resolve({data:active});await pending;assert.equal(c.subLocal(),null,'Discard in-flight response after account switch');
 let restored=0,screen='';c.goAuthScreen=x=>screen=x;c.authMsg=()=>{};c.afterLogin=async()=>{restored++};c.CURRENT_USER=null;
 vm.runInContext(section('var authBootPending=null;','window.onload=function(){'),c);
 let finish;c.sbClient={auth:{getSession:()=>new Promise(r=>finish=r)}};const boot=c.authBoot();assert.equal(screen,'loading');assert.equal(c.authBoot(),boot);finish({data:{session:{user:{id:'restored'}}}});await boot;assert.equal(restored,1);assert.equal(c.CURRENT_USER.id,'restored');
 c.CURRENT_USER=null;c.sbClient={auth:{getSession:async()=>({data:{session:null}})}};await c.authBoot();assert.equal(screen,'forms');
 c.sbClient={auth:{getSession:async()=>{throw Error('network')}}};await c.authBoot();assert.equal(screen,'forms');
 let expanded=false;c.TU_PLAN_EDIT=true;c.planExpandAll=v=>expanded=v;vm.runInContext(section('function planApplyOpenState(){','function planExpandAll('),c);c.planApplyOpenState();assert.equal(expanded,true,'Editing keeps all levels visible');
 let count=0;for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/src=|application\/ld\+json/.test(m[1]))continue;new vm.Script(m[2]);count++}
 console.log('PASS: active/expired/missing/legacy subscriptions, account isolation, stale response, session restore/deduplication/network failure, plan edit visibility; '+count+' scripts parse.');
})().catch(e=>{console.error(e);process.exitCode=1});
