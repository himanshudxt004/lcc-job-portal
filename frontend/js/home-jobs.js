(function(){
  document.addEventListener('DOMContentLoaded',async function(){
    const grid=document.getElementById('featuredJobsGrid');
    if(!grid)return;
    function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
    try{
      const r=await LCCApi.get('/jobs?featured=true&limit=6');
      const jobs=r.jobs||[];
      if(!jobs.length){grid.innerHTML='<p style="text-align:center;color:var(--gray);">New opportunities coming soon. <a href="jobs.html">Browse all jobs</a>.</p>';return;}
      grid.innerHTML=jobs.map(j=>'<a href="job-details.html?id='+encodeURIComponent(j._id)+'" class="job-card-home reveal"><span class="job-card-tag">'+esc(j.type)+'</span><h3>'+esc(j.title)+'</h3><p class="job-card-co">'+esc(j.company)+'</p><p class="job-card-meta">'+esc(j.location)+' &middot; '+esc(j.salary||'Not disclosed')+'</p></a>').join('');
    }catch(e){grid.innerHTML='<p style="color:var(--gray);">'+esc(e.message)+'</p>';}
  });
})();