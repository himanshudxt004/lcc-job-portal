(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();}
  function gid(){return new URLSearchParams(location.search).get('id');}
  ready(async function(){
    if(!LCCAdmin.initAdminPage('admin-job-edit.html'))return;
    const id=gid();
    document.querySelector('h1').textContent=id?'Edit Job':'Add Job';
    document.getElementById('pageSub').textContent=id?'Update job details':'Create a new job listing';
    if(id){
      try{
        const r=await LCCApi.get('/jobs/'+encodeURIComponent(id));
        const j=r.job;
        ['title','company','location','salary','type','industry','experience','description'].forEach(function(f){
          const el=document.querySelector('[name="'+f+'"]');if(el)el.value=j[f]||'';
        });
        document.querySelector('[name="skills"]').value=(j.skills||[]).join(', ');
        document.getElementById('isFeatured').checked=!!j.isFeatured;
        document.getElementById('isActive').checked=!!j.isActive;
      }catch(e){LCCDash.showToast(e.message,'error');}
    }
    document.getElementById('jobForm').addEventListener('submit',async function(e){
      e.preventDefault();
      const fd=Object.fromEntries(new FormData(e.target).entries());
      fd.isFeatured=document.getElementById('isFeatured').checked;
      fd.isActive=document.getElementById('isActive').checked;
      const btn=document.getElementById('submitBtn');btn.disabled=true;
      try{
        if(id)await LCCApi.put('/jobs/'+encodeURIComponent(id),fd);
        else await LCCApi.post('/jobs',fd);
        LCCDash.showToast('Job saved','ok');
        setTimeout(function(){location.href='admin-jobs.html';},600);
      }catch(err){LCCDash.showToast(err.message,'error');btn.disabled=false;}
    });
  });
})();