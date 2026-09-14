/* Root academic catalogue bridge.
 * Loads the four large university catalogues already used by the Root iOS app.
 * Existing Taibah, IMAMU and PNU website catalogues keep their original IDs.
 */
(function(){
'use strict';
var ROOT_DB_TO_SITE={imamu:'imam'};
var ROOT_SITE_TO_DB={imam:'imamu'};
var ROOT_REMOTE_UNIVERSITIES={
  uqu:{name:'جامعة أم القرى',short:'أم القرى',en:'Umm Al-Qura University',mark:'أق',meta:'129 خطة'},
  kau:{name:'جامعة الملك عبدالعزيز',short:'الملك عبدالعزيز',en:'King Abdulaziz University',mark:'كع',meta:'107 خطط'},
  iau:{name:'جامعة الإمام عبدالرحمن بن فيصل',short:'الإمام عبدالرحمن',en:'Imam Abdulrahman Bin Faisal University',mark:'ع',meta:'25 خطة'},
  uoh:{name:'جامعة حائل',short:'حائل',en:'University of Hail',mark:'ح',meta:'9 خطط'}
};
var ROOT_CATALOGS={};
var ROOT_LOADING={};
var ROOT_CLIENT=null;
var originalApply=applyUniversitySpecs;
var originalSelect=selectUniversity;
var originalChange=changeUniversity;
var originalOnload=window.onload;

Object.keys(ROOT_REMOTE_UNIVERSITIES).forEach(function(id){
  var m=ROOT_REMOTE_UNIVERSITIES[id];
  UNIVERSITY_META[id]={name:m.name,short:m.short,en:m.en};
});

function clone(value){return JSON.parse(JSON.stringify(value));}
function message(text){
  try{if(typeof toast==='function')toast(text);}catch(_){}
}
function client(){
  if(ROOT_CLIENT)return ROOT_CLIENT;
  if(!window.supabase||!window.supabase.createClient)throw new Error('تعذر تشغيل اتصال دليل الخطط');
  ROOT_CLIENT=window.supabase.createClient(SB_URL,SB_KEY,{
    auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
  });
  return ROOT_CLIENT;
}
async function allRows(table,fields,filter){
  var rows=[],from=0,size=1000;
  while(true){
    var query=client().from(table).select(fields).range(from,from+size-1);
    if(filter)query=filter(query);
    var result=await query;
    if(result.error)throw result.error;
    var page=result.data||[];
    rows=rows.concat(page);
    if(page.length<size)break;
    from+=size;
    if(from>50000)throw new Error('تجاوز دليل الخطط الحد المتوقع');
  }
  return rows;
}
async function coursesForMajorIDs(ids){
  var out=[];
  for(var offset=0;offset<ids.length;offset+=25){
    var batch=ids.slice(offset,offset+25),from=0,size=1000;
    while(true){
      var result=await client().from('root_plan_courses')
        .select('id,major_id,level_number,course_code,course_name_ar,credits,prerequisites,corequisites,sort_order')
        .in('major_id',batch).order('sort_order',{ascending:true}).range(from,from+size-1);
      if(result.error)throw result.error;
      var page=result.data||[];
      out=out.concat(page);
      if(page.length<size)break;
      from+=size;
    }
  }
  return out;
}
function electiveCourse(group){
  var count=Number(group.requiredCount||0),credits=Number(group.requiredCredits||0);
  var label=String(group.title||'متطلب اختياري');
  if(count>0)label+=' — اختر '+count;
  return {
    id:String(group.id||('elective-'+Math.random())),
    code:'اختياري',
    name:label,
    hrs:credits,
    requirement:'اختياري',
    electiveOptions:Array.isArray(group.courses)?clone(group.courses):[],
    source:group.sourceUrl||null
  };
}
function buildCatalogue(siteID,colleges,majors,courses){
  var byMajor={};
  courses.forEach(function(course){
    (byMajor[course.major_id]||(byMajor[course.major_id]=[])).push(course);
  });
  var byCollege={};
  majors.forEach(function(major){
    var levels={},majorCourses=byMajor[major.id]||[];
    majorCourses.sort(function(a,b){
      return (Number(a.level_number)-Number(b.level_number))||(Number(a.sort_order)-Number(b.sort_order));
    }).forEach(function(course){
      var level=Number(course.level_number)||1;
      (levels[level]||(levels[level]=[])).push({
        id:course.id,code:course.course_code,name:course.course_name_ar,
        hrs:Number(course.credits)||0,
        prereq:Array.isArray(course.prerequisites)?course.prerequisites:[],
        coreq:Array.isArray(course.corequisites)?course.corequisites:[]
      });
    });
    var groups=Array.isArray(major.requirement_groups)?major.requirement_groups:[];
    groups.forEach(function(group){
      var level=Number(group.recommendedLevel)||Math.max.apply(null,[1].concat(Object.keys(levels).map(Number)));
      (levels[level]||(levels[level]=[])).push(electiveCourse(group));
    });
    var entry={
      id:major.id,name:major.name_ar,code:major.id,icon:'◆',university:siteID,
      degree:major.degree||'بكالوريوس',college:'',
      totalHours:Number(major.total_credits)||0,
      planHours:Number(major.total_credits)||0,
      source:major.source_url||null,
      audit:major.source_notes||'من دليل الخطط الأكاديمية لتطبيق روت',
      sourceStatus:major.source_status||null,
      levels:Object.keys(levels).map(Number).sort(function(a,b){return a-b;}).map(function(level){
        return {level:level,courses:levels[level]};
      })
    };
    (byCollege[major.college_id]||(byCollege[major.college_id]=[])).push(entry);
  });
  return colleges.map(function(college){
    var entries=byCollege[college.id]||[];
    entries.forEach(function(entry){entry.college=college.name_ar;});
    entries.sort(function(a,b){return a.name.localeCompare(b.name,'ar');});
    return {college:college.name_ar,entries:entries};
  }).filter(function(college){return college.entries.length;})
    .sort(function(a,b){return a.college.localeCompare(b.college,'ar');});
}
async function loadUniversity(siteID){
  if(ROOT_CATALOGS[siteID])return ROOT_CATALOGS[siteID];
  if(ROOT_LOADING[siteID])return ROOT_LOADING[siteID];
  ROOT_LOADING[siteID]=(async function(){
    var dbID=ROOT_SITE_TO_DB[siteID]||siteID;
    var colleges=await allRows('root_colleges','id,university_id,name_ar',function(q){return q.eq('university_id',dbID);});
    var collegeIDs=colleges.map(function(x){return x.id;});
    if(!collegeIDs.length)throw new Error('لا توجد كليات منشورة لهذه الجامعة');
    var majors=await allRows('root_majors','id,college_id,name_ar,degree,total_credits,source_url,requirement_groups,source_status,source_notes',function(q){
      return q.in('college_id',collegeIDs);
    });
    majors=majors.filter(function(x){return x.source_status!=='reference_only';});
    var courses=await coursesForMajorIDs(majors.map(function(x){return x.id;}));
    var catalogue=buildCatalogue(siteID,colleges,majors,courses);
    if(!catalogue.length)throw new Error('لا توجد خطط مكتملة لهذه الجامعة');
    ROOT_CATALOGS[siteID]=catalogue;
    delete ROOT_LOADING[siteID];
    return catalogue;
  })().catch(function(error){delete ROOT_LOADING[siteID];throw error;});
  return ROOT_LOADING[siteID];
}
function useCatalogue(siteID){
  var catalogue=ROOT_CATALOGS[siteID];
  if(!catalogue)return false;
  SPECS.length=0;
  catalogue.forEach(function(college){SPECS.push(clone(college));});
  try{applyUniversityUI();}catch(_){}
  return true;
}
applyUniversitySpecs=function(){
  var siteID=currentUniversity();
  if(ROOT_REMOTE_UNIVERSITIES[siteID]&&useCatalogue(siteID))return;
  return originalApply();
};
selectUniversity=function(siteID){
  if(!ROOT_REMOTE_UNIVERSITIES[siteID])return originalSelect(siteID);
  message('جارٍ تحميل كليات وخطط '+ROOT_REMOTE_UNIVERSITIES[siteID].short+'…');
  return loadUniversity(siteID).then(function(){
    originalSelect(siteID);
    message('تم تحميل '+ROOT_REMOTE_UNIVERSITIES[siteID].meta);
  }).catch(function(error){
    console.error('Root catalogue:',error);
    message('تعذر تحميل الخطط. تحقق من الاتصال وحاول مرة أخرى.');
  });
};
function addUniversityCards(){
  var grid=document.querySelector('#s-university .uni-grid');
  if(!grid)return;
  Object.keys(ROOT_REMOTE_UNIVERSITIES).forEach(function(id){
    if(document.getElementById('uni-card-'+id))return;
    var m=ROOT_REMOTE_UNIVERSITIES[id],button=document.createElement('button');
    button.className='uni-card root-remote-university';
    button.id='uni-card-'+id;
    button.type='button';
    button.onclick=function(){selectUniversity(id);};
    button.innerHTML='<span class="uni-current" style="display:none">اختيارك الحالي</span>'+
      '<div class="uni-emblem" aria-hidden="true"><b>'+m.mark+'</b></div>'+
      '<div class="uni-name">'+m.name+'</div>'+
      '<div class="uni-en">'+m.en+'</div>'+
      '<div class="uni-meta">'+m.meta+' كاملة <span class="uni-arrow">‹</span></div>';
    grid.appendChild(button);
  });
  try{applyUniversityUI();}catch(_){}
}
changeUniversity=function(){originalChange();addUniversityCards();};
window.onload=async function(event){
  addUniversityCards();
  var selected;
  try{selected=currentUniversity();}catch(_){selected=null;}
  if(ROOT_REMOTE_UNIVERSITIES[selected]){
    try{await loadUniversity(selected);}catch(error){console.error('Root catalogue boot:',error);}
  }
  return originalOnload&&originalOnload.call(window,event);
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addUniversityCards);
else addUniversityCards();

window.RootAcademicCatalog={
  load:loadUniversity,
  supported:Object.keys(ROOT_REMOTE_UNIVERSITIES),
  counts:{uqu:129,kau:107,iau:25,uoh:9}
};
})();