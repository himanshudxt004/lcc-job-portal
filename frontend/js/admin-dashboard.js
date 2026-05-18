(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();}
  ready(async function(){
    if(!LCCAdmin.initAdminPage('dashboard-admin.html'))return;
    document.getElementById('pageSub').textContent='Platform overview and quick actions';
    try{
      const r=await LCCApi.get('/admin/stats');
      const s=r.stats||{};
      document.getElementById('sJobs').textContent=s.activeJobs+' / '+s.jobs;
      document.getElementById('sApps').textContent=s.applications;
      document.getElementById('sBlogs').textContent=s.publishedBlogs+' / '+s.blogs;
      document.getElementById('sHire').textContent=s.newHiringRequests+' new / '+s.hiringRequests;
    }catch(e){LCCDash.showToast(e.message,'error');}
  });
})();