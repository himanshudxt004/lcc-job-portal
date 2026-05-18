(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();}
  ready(async function(){
    if(!LCCAdmin.initAdminPage('admin-jobs.html'))return;
    document.getElementById('pageSub').textContent='Manage all job listings';
    const wrap=document.getElementById('jobsList');
    try{
      const r=await LCCApi.get('/jobs/admin/all');
      const jobs=r.jobs||[];
      if(!jobs.length){wrap.innerHTML='<h3>No jobs</h3><a href="admin-job-edit.html" class="btn-primary">Add Job</a></div>';return;}
      wrap.innerHTML=jobs.map(function(j){
        return '<div class="row-item"><div><h4>'+LCCDash.escapeHTML(j.title)+(j.isFeatured?' <span class="badge-gold">Featured</span>':'')+'</h4><div class="meta"><span>'+LCCDash.escapeHTML(j.company)+'</span><span>'+LCCDash.escapeHTML(j.location)+'</span><span>'+(j.isActive?'Active':'Paused')+'</span></div></div><div class="actions"><a href="admin-job-edit.html?id='+j._id+'" class="btn-secondary btn-sm">Edit</a><button class="btn-danger" data-del="'+j._id+'">Delete</button></div></div>';
      }).join('');
      wrap.querySelectorAll('[data-del]').forEach(function(b){b.addEventListener('click',async function(){
        if(!confirm('Delete this job and all applications?'))return;
        try{await LCCApi.delete('/jobs/'+b.getAttribute('data-del'));LCCDash.showToast('Deleted','ok');location.reload();}catch(e){LCCDash.showToast(e.message,'error');}
      });});
    }catch(e){wrap.innerHTML='<p>'+LCCDash.escapeHTML(e.message)+'</p>';}
  });
})();