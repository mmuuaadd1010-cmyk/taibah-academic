/* Daily analytics. All day boundaries and account IDs are assigned by the server. */
(function(){
'use strict';
var report=null,loading=null,inflight=false,lastKey='',memoryVisitor=null,memorySession=null;
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
function number(n){return Number(n||0).toLocaleString('ar-SA')}
function escapeText(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function dashboard(){
 var host=document.getElementById('tu-visits-total-card');if(!host)return;
 if(!document.getElementById('tu-analytics-daily'))host.insertAdjacentHTML('afterend','<section id="tu-analytics-daily" style="margin:12px 0;padding:14px;background:var(--s2);border:1px solid var(--bor);border-radius:14px"><h3>الزوار يوم بيوم — آخر ٣٠ يوم</h3><p style="font-size:.78rem;color:var(--t2);line-height:1.8">بتوقيت السعودية. الحساب يُحسب مرة في اليوم عبر أجهزته. الزائر بدون حساب يُميّز حسب المتصفح؛ تسجيل دخوله في نفس اليوم يدمج الزيارة مع حسابه. الزيارة جلسة تنتهي بعد ٣٠ دقيقة دون نشاط. البيانات القديمة لم تكن تسجل هويات، لذلك لا يمكن تصحيحها بأثر رجعي.</p><div id="tu-analytics-status" role="status"></div><div style="overflow:auto"><table style="width:100%;text-align:right;border-collapse:collapse"><thead><tr><th>اليوم</th><th>الزوار المميزون*</th><th>حسابات</th><th>بدون حساب</th><th>جلسات زيارة</th></tr></thead><tbody id="tu-analytics-rows"></tbody></table></div><small>* مجموع الحسابات والمتصفحات غير المرتبطة بحساب؛ ليس قياسًا مؤكدًا لعدد الأشخاص.</small></section>');
}
function render(){
 if(!report)return;dashboard();var today=report.days[0]||{};
 text('tu-vis-today',number(today.visits));text('tu-vis-uniq',number(Number(today.accounts)+Number(today.anonymous)));text('tu-logins-today',number(today.accounts));
 text('tu-vis-total',number(report.total_visits));text('tu-vis-total-uniq',number(Number(report.total_accounts)+Number(report.total_anonymous)));text('tu-vis-since',report.since?new Intl.DateTimeFormat('ar-SA',{timeZone:'Asia/Riyadh',dateStyle:'medium'}).format(new Date(report.since)):'يبدأ من أول زيارة');
 text('tu-analytics-status','آخر تحديث: '+new Intl.DateTimeFormat('ar-SA',{timeZone:'Asia/Riyadh',timeStyle:'short'}).format(new Date()));
 var rows=document.getElementById('tu-analytics-rows');if(rows)rows.innerHTML=report.days.map(function(d){return '<tr>'+[d.day,number(Number(d.accounts)+Number(d.anonymous)),number(d.accounts),number(d.anonymous),number(d.visits)].map(function(v){return '<td style="padding:9px;border-top:1px solid var(--bor)">'+escapeText(v)+'</td>'}).join('')+'</tr>'}).join('');
 var people=report.people||[],box=document.getElementById('tu-logins-list');text('tu-logins-meta','حسابات نشطة اليوم: '+number(today.accounts)+(Number(today.accounts)>200?' — أحدث ٢٠٠ حساب':''));
 if(box)box.innerHTML=people.map(function(p){return '<div style="padding:9px;border-bottom:1px solid var(--bor)">'+escapeText(p.name||p.username||'طالب')+' <small>'+escapeText(new Intl.DateTimeFormat('ar-SA',{timeZone:'Asia/Riyadh',timeStyle:'short'}).format(new Date(p.last_seen)))+'</small></div>'}).join('')||'لا توجد حسابات نشطة مسجلة اليوم.';
 window.admRenderAttendance();
}
window.tuLoadVisits=function(){
 if(loading)return loading;
 if(typeof sbClient==='undefined'||!sbClient||typeof IS_ADMIN==='undefined'||!IS_ADMIN)return Promise.resolve();
 dashboard();text('tu-analytics-status','جارٍ تحميل الإحصائيات...');
 loading=(async function(){try{var r=await sbClient.rpc('tu_visit_report');if(r.error)throw r.error;report=r.data;render();}catch(e){text('tu-analytics-status','تعذّر تحميل الإحصائيات. اضغط تحديث للمحاولة مجددًا.');['tu-vis-today','tu-vis-uniq','tu-logins-today','tu-vis-total','tu-vis-total-uniq'].forEach(function(id){text(id,'—')})}finally{loading=null}})();return loading;
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
function boot(){track(false);setInterval(function(){track(false)},15000);setInterval(function(){track(true);if(document.visibilityState!=='hidden'&&document.getElementById('p-admin')?.classList.contains('on'))window.tuLoadVisits()},60000)}
window.addEventListener('online',function(){track(true)});document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')track(true)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
