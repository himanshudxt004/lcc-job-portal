(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();}
  const STATUSES=['pending','reviewing','shortlisted','rejected','hired'];
  ready(async function(){
    if(!LCCAdmin.initAdminPage('admin-applications.html'))return;
    document.getElementById('pageSub').textContent='Review candidates and download resumes';
    const origin=LCCAdmin.apiOrigin();
    let jobs=[];
    try{const jr=await LCCApi.get('/jobs/admin/all');jobs=jr.jobs||[];
      document.getElementById('filterJob').innerHTML='<option value="">All jobs</option>'+jobs.map(function(j){return '<option value="'+j._id+'">'+LCCDash.escapeHTML(j.title)+'</option>';}).join('');
    }catch(e){}
    async function load(){
      const wrap=document.getElementById('appsList');
      wrap.innerHTML='<div class="loader">Loading...</div>';
      const jid=document.getElementById('filterJob').value;
      try{
        const path='/applications/admin'+(jid?'?jobId='+encodeURIComponent(jid):'');
        const r=await LCCApi.get(path);
        const apps=r.applications||[];
        if(!apps.length){wrap.innerHTML='<div class="empty-state"><h3>No applications</h3></div>';return;}
        wrap.innerHTML=apps.map(function(a){
          const u=a.userId||{};const j=a.jobId||{};
          const resume=u.resume||a.resume;
          const resumeUrl=resume?origin+resume:'';
          return '<div class="row-item"><div><h4>'+LCCDash.escapeHTML(u.name||'Candidate')+'</h4><div class="meta"><span>'+LCCDash.escapeHTML(u.email||'')+'</span><span>Job: '+LCCDash.escapeHTML(j.title||'')+'</span><span>'+LCCDash.escapeHTML(a.status)+'</span></div></div><div class="actions"><select data-st="'+a._id+'">'+STATUSES.map(function(s){return '<option value="'+s+'"'+(s===a.status?' selected':'')+'>'+s+'</option>';}).join('')+'</select>'+(resumeUrl?'<a href="'+resumeUrl+'" target="_blank" class="btn-secondary btn-sm">Resume</a>':'')+'</div></div>';
        }).join('');
        wrap.querySelectorAll('select[data-st]').forEach(function(sel){sel.addEventListener('change',async function(){
          try{await LCCApi.patch('/applications/'+sel.getAttribute('data-st')+'/status',{status:sel.value});LCCDash.showToast('Updated','ok');}catch(e){LCCDash.showToast(e.message,'error');}
        });});
      }catch(e){wrap.innerHTML='<p>'+LCCDash.escapeHTML(e.message)+'</p>';}
    }
    document.getElementById('filterJob').addEventListener('change',load);
    document.getElementById('refreshApps').addEventListener('click',load);
    load();
  });
})();