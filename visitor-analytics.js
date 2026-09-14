/* Daily analytics. All day boundaries and account IDs are assigned by the server. */
/* National Day 96 campaign: visual promotion only; checkout remains on Salla. */
(function(){
 'use strict';
 var offerUrl='https://salla.sa/silvrcol/%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83-%D9%85%D8%AF%D9%89-%D8%A7%D9%84%D8%AD%D9%8A%D8%A7%D9%87-%D9%84%D9%83-%D8%B3%D9%86%D8%AA%D9%8A%D9%86-%D9%84%D8%AE%D9%88%D9%8A%D9%83/p1390590194';
 function bootNationalOffer(){
  if(document.getElementById('tu-national96'))return;
  var style=document.createElement('style');
  style.textContent='#tu-national96{box-sizing:border-box;width:min(440px,calc(100vw - 28px));max-height:calc(100dvh - 36px);overflow:auto;padding:0;border:1px solid #80cda066;border-radius:28px;background:#082c24;color:#fff;box-shadow:0 28px 100px #0009;font-family:inherit;text-align:center}#tu-national96::backdrop{background:#020b09c9;backdrop-filter:blur(7px)}#tu-national96 *{box-sizing:border-box}#tu-national96 .nd-body{padding:38px 26px 24px;position:relative;isolation:isolate;background:radial-gradient(ellipse at 50% 0,#1c795766,transparent 64%)}#tu-national96 .nd-close{position:absolute;top:12px;left:12px;background:#ffffff12;border:1px solid #ffffff30;color:#fff;width:36px;height:36px;border-radius:50%;font:24px sans-serif;cursor:pointer}#tu-national96 .nd-kicker{display:inline-block;color:#c9f8d9;font-size:12px;font-weight:700;letter-spacing:.4px;border:1px solid #91d3ab55;border-radius:99px;padding:8px 15px;margin:10px 0 18px}#tu-national96 .nd-96{font-size:64px;font-weight:900;line-height:1;color:#c7e9b5;letter-spacing:-4px;margin-bottom:12px}#tu-national96 h2{font-size:30px;line-height:1.4;margin:0 0 10px;color:#fff;font-weight:900}#tu-national96 .nd-sub{font-size:14px;color:#c0d9d0;line-height:1.8;margin:0 0 22px}#tu-national96 .nd-bundle{display:grid;grid-template-columns:1fr 28px 1fr;align-items:center;gap:6px;margin-bottom:20px}#tu-national96 .nd-benefit{border:1px solid #b8e6ca33;background:#ffffff08;border-radius:18px;padding:17px 8px}#tu-national96 .nd-benefit small{display:block;color:#bdd8cd;font-size:12px;margin-bottom:7px}#tu-national96 .nd-benefit strong{font-size:22px;display:block;color:#fff}#tu-national96 .nd-plus{font-size:25px;color:#bce5a8}#tu-national96 .nd-limited{color:#e4edbc;font-size:12px;margin:0 0 12px}#tu-national96 .nd-cta{display:block;padding:16px 12px;border-radius:14px;background:#cee9b1;color:#10382b;font-size:17px;font-weight:900;text-decoration:none;box-shadow:0 6px 24px #b9e8a21a}#tu-national96 .nd-cta:hover{background:#e1f3cc}#tu-national96 .nd-note{font-size:11px;color:#a7c6b8;margin:12px 0 0;line-height:1.8}#tu-national96 .nd-later{display:block;margin:13px auto 0;padding:8px 14px;border:0;background:transparent;color:#c0d9d0;font:inherit;font-size:13px;cursor:pointer}#tu-national96 :focus-visible,#tu-national96-open:focus-visible{outline:3px solid #fff;outline-offset:3px}#tu-national96-open{position:fixed;inset-inline-end:14px;bottom:calc(90px + env(safe-area-inset-bottom,0px));z-index:900;background:#164c38;color:#e7f6ce;border:1px solid #b7db9666;padding:11px 17px;border-radius:99px;box-shadow:0 5px 20px #0004;font:inherit;font-weight:800;font-size:12px;cursor:pointer}#tu-national96-open[hidden]{display:none}@media(max-width:360px){#tu-national96 .nd-body{padding:32px 18px 20px}#tu-national96 h2{font-size:25px}}';
  document.head.appendChild(style);
  var modal=document.createElement('dialog');modal.id='tu-national96';modal.dir='rtl';modal.setAttribute('aria-labelledby','tu-nd-title');modal.setAttribute('aria-describedby','tu-nd-desc');
  modal.innerHTML='<div class="nd-body"><button class="nd-close" type="button" aria-label="إغلاق العرض">×</button><div class="nd-kicker">بمناسبة اليوم الوطني السعودي</div><div class="nd-96" aria-label="96">96</div><h2 id="tu-nd-title">لك مدى الحياة.<br>ولخويك سنتين.</h2><p class="nd-sub" id="tu-nd-desc">احتفلوا سوا… واستفيدوا سوا.<br>عرض يجمع اشتراكك واشتراك خويك.</p><div class="nd-bundle"><div class="nd-benefit"><small>اشتراكك أنت</small><strong>مدى الحياة</strong></div><span class="nd-plus" aria-hidden="true">+</span><div class="nd-benefit"><small>اشتراك خويك</small><strong>سنتين</strong></div></div><p class="nd-limited">عرض اليوم الوطني 96 · لفترة محدودة</p><a class="nd-cta" target="_blank" rel="noopener noreferrer">خذ العرض لك ولخويك ←</a><p class="nd-note">اطّلع على السعر وتفاصيل العرض في متجرنا على سلة.</p><button class="nd-later" type="button">أكمل للموقع</button></div>';
  var price=document.createElement('div');price.style.cssText='margin:0 0 18px;color:#fff';
  price.innerHTML='<div style="font-size:12px;color:#c0d9d0;margin-bottom:5px">الاشتراكان معًا</div><div><strong style="font-size:44px;font-weight:900;line-height:1.2">96</strong> <span style="font-size:20px;font-weight:800;color:#cee9b1">ريال فقط</span></div>';
  modal.querySelector('.nd-limited').before(price);
  modal.querySelector('.nd-cta').textContent='خذ العرض بـ 96 ريال ←';
  modal.querySelector('.nd-note').textContent='مدى الحياة لك + سنتين لخويك · تفاصيل العرض والشراء عبر سلة';
  modal.querySelector('.nd-cta').href=offerUrl;
  var reopen=document.createElement('button');reopen.id='tu-national96-open';reopen.type='button';reopen.textContent='عرض اليوم الوطني 96';reopen.setAttribute('aria-haspopup','dialog');
  document.body.appendChild(modal);document.body.appendChild(reopen);
  function seen(){try{sessionStorage.setItem('tu_national96_seen','1')}catch(e){}}
  function open(){if(modal.open)return;modal.showModal();reopen.hidden=true;seen();}
  function close(){modal.close();}
  modal.querySelector('.nd-close').onclick=close;modal.querySelector('.nd-later').onclick=close;
  modal.addEventListener('close',function(){reopen.hidden=false;seen();});
  modal.addEventListener('click',function(e){if(e.target===modal){var r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
  reopen.onclick=open;
  var shown=false;try{shown=sessionStorage.getItem('tu_national96_seen')==='1'}catch(e){}
  if(!shown)setTimeout(open,900);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootNationalOffer,{once:true});else bootNationalOffer();
})();
(function(){
'use strict';
var report=null,loading=null,inflight=false,lastKey='',memoryVisitor=null,memorySession=null,adminViewKey='';
function read(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function uuid(){return crypto.randomUUID()}
function identity(){
 var visitor=read('tu_analytics_visitor_v1')||memoryVisitor;
 if(typeof visitor!=='string'||! /^[0-9a-f-]{36}$/i.test(visitor))visitor=uuid();
 memoryVisitor=visitor;write('tu_analytics_visitor_v1',visitor);
 var session=read('tu_analytics_session_v1')||memorySession,now=Date.now();
 if(!session||now-session.last>30*60*1000)session={id:uuid(),last:now};
 session.last=now;memorySession=session;write('tu_analytics_session_v1',session);
 return {visitor:visitor,session:session.id};
}
async function track(force){
 if(inflight||document.visibilityState==='hidden'||typeof sbClient==='undefined'||!sbClient)return;
 var ids=identity(),uid=(typeof CURRENT_USER!=='undefined'&&CURRENT_USER&&CURRENT_USER.id)||'anon';
 var day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh'}).format(new Date());
 var key=ids.session+'|'+uid+'|'+day;
 if(!force&&lastKey===key)return;
 inflight=true;
 try{var r=await sbClient.rpc('tu_track_visit',{p_visitor:ids.visitor,p_session:ids.session});if(r.error)throw r.error;lastKey=key;}catch(e){console.warn('Visitor tracking temporarily unavailable');}finally{inflight=false;}
}
function text(id,v){var e=document.getElementById(id);if(e)e.textContent=v}
function number(n){return Number(n||0).toLocaleString('en-US')}
function escapeText(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function dashboard(){
 var host=document.getElementById('tu-visits-total-card');if(!host)return;
 if(!document.getElementById('tu-analytics-daily'))host.insertAdjacentHTML('afterend','<section id="tu-analytics-daily" style="margin:12px 0;padding:14px;background:var(--s2);border:1px solid var(--bor);border-radius:14px"><h3>الزوار يوم بيوم — آخر ٣٠ يوم</h3><p style="font-size:.78rem;color:var(--t2);line-height:1.8">بتوقيت السعودية. الحساب يُحسب مرة في اليوم عبر أجهزته. الزائر بدون حساب يُميّز حسب المتصفح؛ تسجيل دخوله في نفس اليوم يدمج الزيارة مع حسابه. الزيارة جلسة تنتهي بعد ٣٠ دقيقة دون نشاط. السجل السابق معروض في قسم مستقل أعلاه؛ تعداد الحسابات يبدأ من التتبع الجديد.</p><button type="button" onclick="tuLoadVisits()" style="padding:8px 14px;background:var(--s3);color:var(--t);border:1px solid var(--bor);border-radius:8px">تحديث الإحصائيات</button><div id="tu-analytics-status" role="status" style="padding:8px 0"></div><div style="overflow:auto"><table style="width:100%;text-align:right;border-collapse:collapse"><thead><tr><th>اليوم</th><th>الزوار المميزون*</th><th>حسابات</th><th>بدون حساب</th><th>جلسات زيارة</th></tr></thead><tbody id="tu-analytics-rows"></tbody></table></div><small>* مجموع الحسابات والمتصفحات غير المرتبطة بحساب؛ ليس قياسًا مؤكدًا لعدد الأشخاص.</small></section>');
}
function renderHistory(){
 var legacy=report.legacy||{},days=legacy.days||[],anchor=document.getElementById('tu-analytics-daily');
 if(!anchor)return;
 var panel=document.getElementById('tu-analytics-history');
 if(!panel){anchor.insertAdjacentHTML('beforebegin','<section id="tu-analytics-history" style="margin:12px 0;padding:14px;background:var(--s2);border:1px solid var(--bor);border-radius:14px"><h3>الإحصائيات السابقة — العداد القديم</h3><p id="tu-history-summary" style="font-weight:700"></p><p style="font-size:.78rem;color:var(--t2);line-height:1.7">هذه سجلات الزيارات السابقة كما حُفظت بتواريخ العداد القديم. الزيارات تشمل تحديث الصفحة، والزوار المختلفون تقدير حسب المتصفح لكل يوم. لا تتوفر أعداد الحسابات السابقة، ولا تُجمع هذه الأرقام مع جلسات التتبع الجديد.</p><label>عرض شهر: <select id="tu-history-month" onchange="tuRenderHistoryRows()" style="padding:7px;background:var(--s3);color:var(--t);border:1px solid var(--bor);border-radius:8px"></select></label><div style="overflow:auto;max-height:480px;margin-top:10px"><table style="width:100%;text-align:right;border-collapse:collapse"><thead><tr><th>اليوم</th><th>الزيارات المسجلة</th><th>زوار مختلفون — تقديري</th></tr></thead><tbody id="tu-history-rows"></tbody></table></div></section>');}
 text('tu-history-summary',days.length?number(days.length)+' يومًا محفوظًا — من '+legacy.since+' — إجمالي الزيارات: '+number(legacy.total_visits):'لا توجد سجلات سابقة.');
 var picker=document.getElementById('tu-history-month'),selected=picker.value;
 var months=Array.from(new Set(days.map(function(d){return d.day.slice(0,7)})));
 picker.innerHTML='<option value="">كل السجل السابق</option>'+months.map(function(m){return '<option value="'+escapeText(m)+'">'+escapeText(m)+'</option>'}).join('');if(months.indexOf(selected)!==-1)picker.value=selected;
 window.tuRenderHistoryRows();
}
window.tuRenderHistoryRows=function(){
 var box=document.getElementById('tu-history-rows');if(!box||!report)return;
 var month=(document.getElementById('tu-history-month')||{}).value||'';
 box.innerHTML=((report.legacy||{}).days||[]).filter(function(d){return !month||d.day.slice(0,7)===month}).map(function(d){return '<tr>'+[d.day,number(d.visits),number(d.uniques)].map(function(v){return '<td style="padding:10px;border-top:1px solid var(--bor)">'+escapeText(v)+'</td>'}).join('')+'</tr>'}).join('');
};
function render(){
 if(!report)return;dashboard();renderHistory();var today=report.days[0]||{};
 text('tu-vis-today',number(today.visits));text('tu-vis-uniq',number(Number(today.accounts)+Number(today.anonymous)));text('tu-logins-today',number(today.accounts));
 text('tu-vis-total',number(report.total_visits));text('tu-vis-total-uniq',number(Number(report.total_accounts)+Number(report.total_anonymous)));text('tu-vis-since',report.since?new Intl.DateTimeFormat('ar-SA',{timeZone:'Asia/Riyadh',dateStyle:'medium'}).format(new Date(report.since)):'يبدأ من أول زيارة');
 text('tu-analytics-status','آخر تحديث: '+new Intl.DateTimeFormat('ar-SA',{timeZone:'Asia/Riyadh',timeStyle:'short'}).format(new Date()));
 var rows=document.getElementById('tu-analytics-rows');if(rows)rows.innerHTML=report.days.filter(function(d){return !report.since||d.day>=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh'}).format(new Date(report.since))}).map(function(d){return '<tr>'+[d.day,number(Number(d.accounts)+Number(d.anonymous)),number(d.accounts),number(d.anonymous),number(d.visits)].map(function(v){return '<td style="padding:9px;border-top:1px solid var(--bor)">'+escapeText(v)+'</td>'}).join('')+'</tr>'}).join('');
 var people=report.people||[],box=document.getElementById('tu-logins-list');text('tu-logins-meta','حسابات نشطة اليوم: '+number(today.accounts)+(Number(today.accounts)>200?' — أحدث ٢٠٠ حساب':''));
 if(box)box.innerHTML=people.map(function(p){return '<div style="padding:9px;border-bottom:1px solid var(--bor)">'+escapeText(p.name||p.username||'طالب')+' <small>'+escapeText(new Intl.DateTimeFormat('ar-SA',{timeZone:'Asia/Riyadh',timeStyle:'short'}).format(new Date(p.last_seen)))+'</small></div>'}).join('')||'لا توجد حسابات نشطة مسجلة اليوم.';
 window.admRenderAttendance();
}
window.tuLoadVisits=function(){
 if(loading)return loading;
 dashboard();
 if(typeof sbClient==='undefined'||!sbClient){text('tu-analytics-status','خدمة الاتصال لم تجهز بعد. اضغط تحديث بعد لحظات.');return Promise.resolve();}
 if(typeof CURRENT_USER==='undefined'||!CURRENT_USER){text('tu-analytics-status','سجّل الدخول بحساب المشرف لعرض الإحصائيات. فتح لوحة المطوّر محليًا لا يمنح صلاحية قراءة الحسابات.');['tu-vis-today','tu-vis-uniq','tu-logins-today','tu-vis-total','tu-vis-total-uniq'].forEach(function(id){text(id,'—')});return Promise.resolve();}
 text('tu-analytics-status','جارٍ تحميل الإحصائيات...');
 loading=(async function(){try{var controller=new AbortController(),timer=setTimeout(function(){controller.abort()},12000);var r;try{r=await sbClient.rpc('tu_visit_report').abortSignal(controller.signal)}finally{clearTimeout(timer)}if(r.error)throw r.error;if(!r.data||!Array.isArray(r.data.days))throw new Error('Invalid report');report=r.data;render();}catch(e){text('tu-analytics-status',(e.code==='42501'||e.code==='PGRST301')?'الحساب الحالي لا يملك صلاحية قراءة الإحصائيات. سجّل الدخول بحساب المشرف.':'تعذّر الاتصال بالإحصائيات. اضغط تحديث للمحاولة مجددًا.');['tu-vis-today','tu-vis-uniq','tu-logins-today','tu-vis-total','tu-vis-total-uniq'].forEach(function(id){text(id,'—')})}finally{loading=null}})();return loading;
};
window.tuLoadTotalVisits=window.tuLoadLogins=window.tuLoadLoginsList=window.admLoadAttendance=window.tuLoadVisits;
window.admRenderAttendance=function(){
 if(!report)return;var hours=report.hours||[],daily=report.days||[],peak=hours.reduce(function(a,b){return b.accounts>a.accounts?b:a},{hour:0,accounts:0});
 var hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Riyadh',hour:'2-digit',hourCycle:'h23'}).format(new Date()));
 text('aa-k-today',number((daily[0]||{}).accounts));text('aa-k-peak',peak.accounts?String(peak.hour).padStart(2,'0')+':00':'—');text('aa-k-last',number((hours[hour]||{}).accounts));
 text('adm-att-msg','الحضور الفعلي للحسابات — بتوقيت السعودية، وليس تاريخ تعديل الملف الشخصي.');
 var cv=document.getElementById('ch-adm-att');if(!cv||typeof Chart==='undefined')return;
 if(typeof admAttReady==='function')admAttReady();if(typeof TU_ATT_CHART!=='undefined'&&TU_ATT_CHART)TU_ATT_CHART.destroy();
 var hourly=typeof TU_ATT_MODE==='undefined'||TU_ATT_MODE==='hour',data=hourly?hours:daily.slice(0,7).reverse();
 TU_ATT_CHART=new Chart(cv,{type:'bar',data:{labels:data.map(function(d){return hourly?String(d.hour).padStart(2,'0'):d.day}),datasets:[{label:hourly?'أول دخول للحساب اليوم':'حسابات نشطة',data:data.map(function(d){return Number(d.accounts)}),backgroundColor:'#5b9dfd',borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,ticks:{precision:0}}}}});
};
function syncAdminView(){
 var pane=document.getElementById('p-admin'),visible=!!(pane&&pane.classList.contains('on'));
 var uid=(typeof CURRENT_USER!=='undefined'&&CURRENT_USER&&CURRENT_USER.id)||'';
 var key=visible?'admin|'+uid:'';
 if(key&&key!==adminViewKey){adminViewKey=key;window.tuLoadVisits()}else if(!key)adminViewKey='';
}
function boot(){syncAdminView();setInterval(syncAdminView,1500);track(false);setInterval(function(){track(false)},15000);setInterval(function(){track(true);if(document.visibilityState!=='hidden'&&document.getElementById('p-admin')?.classList.contains('on'))window.tuLoadVisits()},60000)}
window.addEventListener('online',function(){track(true)});document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')track(true)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

/* Account switching recovery — keeps developer "login by email" on the target account. */
(function(){
'use strict';
var readyUid='';
function universityForSpec(specId){
 if(!specId)return null;
 var groups=[['taibah',typeof TAIBAH_SPECS!=='undefined'?TAIBAH_SPECS:[]],['imam',typeof IMAM_SPECS!=='undefined'?IMAM_SPECS:[]],['pnu',typeof PNU_SPECS!=='undefined'?PNU_SPECS:[]]];
 for(var i=0;i<groups.length;i++)for(var j=0;j<groups[i][1].length;j++)if((groups[i][1][j].entries||[]).some(function(s){return s.id===specId}))return groups[i][0];
 return null;
}
function restoreState(){
 student=JSON.parse(localStorage.getItem('tu_pro_st'))||{name:'',spec:null,university:null};
 planStore=JSON.parse(localStorage.getItem('tu_pro_plans')||'null')||{};
 planData=JSON.parse(localStorage.getItem('tu_pro_plan'))||null;
 if(planData&&Array.isArray(planData.levels)){
  var sid=planData.specId||student.spec;
  if(sid&&!planStore[sid]){planData.specId=sid;planStore[sid]=planData;}
  if(!student.spec&&sid)student.spec=sid;
 }
 if(!student.university&&student.spec)student.university=universityForSpec(student.spec);
 goalsData=JSON.parse(localStorage.getItem('tu_pro_goals'))||[];
 scheduleData=JSON.parse(localStorage.getItem('tu_pro_sch'))||{};
 genData=JSON.parse(localStorage.getItem('tu_pro_gen'))||{courses:[],opts:{},offday:null};
 pomoStats=JSON.parse(localStorage.getItem('tu_pro_pomo'))||{date:'',count:0,mins:0,total:0};
 currentPlan=null;currentSpec=null;
}
reloadStateFromLS=restoreState;
cloudPull=async function(){
 if(!CURRENT_USER||!sbClient)throw new Error('no_session');
 var uid=CURRENT_USER.id;readyUid='';PULLING=true;
 if(_pushTimer){clearTimeout(_pushTimer);_pushTimer=null;}
 try{
  var sameUser=localStorage.getItem('tu_pro_uid')===uid;
  var res=await withTimeout(sbClient.from('user_data').select('data,updated_at').eq('user_id',uid).maybeSingle(),12000);
  if(res.error)throw res.error;
  if(!CURRENT_USER||CURRENT_USER.id!==uid)throw new Error('account_changed');
  var blob=res.data&&res.data.data;
  var hasCloud=blob&&Object.keys(blob).some(function(k){return USER_DATA_KEYS.indexOf(k)>=0&&blob[k]!=null;});
  var cloudTs=Number(blob&&blob.tu_pro_ts)||0,localTs=Number(localStorage.getItem('tu_pro_ts'))||0;
  if(hasCloud&&(!sameUser||cloudTs>localTs)){
   clearLocalUserData();
   USER_DATA_KEYS.forEach(function(k){if(blob[k]!=null)_origSet(k,typeof blob[k]==='string'?blob[k]:JSON.stringify(blob[k]));});
   _origSet('tu_pro_ts',String(cloudTs||Date.now()));
  }else if(!sameUser){
   // Never carry the developer's local grades into an empty target account.
   clearLocalUserData();
  }
  var pr=await withTimeout(sbClient.from('profiles').select('username,name,avatar,bio,spec,level,available_to_help,visible').eq('user_id',uid).maybeSingle(),12000);
  if(pr.error)throw pr.error;
  if(!CURRENT_USER||CURRENT_USER.id!==uid)throw new Error('account_changed');
  var st=JSON.parse(localStorage.getItem('tu_pro_st')||'null')||{},profile=pr.data;
  if(profile){
   if(!st.name)st.name=profile.name||'';
   if(!st.spec)st.spec=profile.spec||null;
   if(!st.avatar&&profile.avatar)st.avatar=profile.avatar;
   if(!localStorage.getItem('tu_pro_profile'))_origSet('tu_pro_profile',JSON.stringify({username:profile.username||'',bio:profile.bio||'',level:profile.level,help:profile.available_to_help,visible:profile.visible}));
  }
  _origSet('tu_pro_st',JSON.stringify(st));_origSet('tu_pro_uid',uid);
  restoreState();_origSet('tu_pro_st',JSON.stringify(student));
  readyUid=uid;_pushPending=false;
 }finally{PULLING=false;}
};
scheduleCloudPush=function(){
 if(PULLING||!CURRENT_USER||readyUid!==CURRENT_USER.id)return;
 _pushPending=true;if(_pushTimer)clearTimeout(_pushTimer);
 _pushTimer=setTimeout(function(){cloudPush().catch(function(){toast('تعذّر حفظ التغييرات سحابيًا. تحقق من الاتصال وأعد المحاولة.');});},400);
};
cloudPush=async function(){
 if(_pushTimer){clearTimeout(_pushTimer);_pushTimer=null;}
 if(!CURRENT_USER||!sbClient)return;
 var uid=CURRENT_USER.id;
 if(PULLING||readyUid!==uid||localStorage.getItem('tu_pro_uid')!==uid)return;
 var blob={};USER_DATA_KEYS.forEach(function(k){var v=localStorage.getItem(k);if(v!=null)blob[k]=v;});
 blob.tu_pro_ts=localStorage.getItem('tu_pro_ts')||String(Date.now());
 var res=await sbClient.from('user_data').upsert({user_id:uid,data:blob,updated_at:new Date().toISOString()},{onConflict:'user_id'});
 if(res.error){_pushPending=true;throw res.error;}
 if(CURRENT_USER&&CURRENT_USER.id===uid&&localStorage.getItem('tu_pro_ts')===blob.tu_pro_ts)_pushPending=false;
};
flushCloudPushIfPending=function(){if(_pushPending)cloudPush().catch(function(){});};
afterLogin=async function(){
 await cloudPull();
 try{if(!student.name){var md=CURRENT_USER&&CURRENT_USER.user_metadata,nm=md&&(md.full_name||md.name);if(nm){student.name=nm;saveSt();}}}catch(e){}
 injectAccountUI();
 try{syncProfile();}catch(e){}
 try{subscribeInbox();}catch(e){}
 try{checkAdminStatus();}catch(e){}
 routeLocal();
};
})();
