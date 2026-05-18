const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'frontend', 'js');

const files = {
  'admin-dashboard.js': `(function(){
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
})();`,

  'admin-jobs.js': `(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();}
  ready(async function(){
    if(!LCCAdmin.initAdminPage('admin-jobs.html'))return;
    document.getElementById('pageSub').textContent='Manage all job listings';
    const wrap=document.getElementById('jobsList');
    try{
      const r=await LCCApi.get('/jobs/admin/all');
      const jobs=r.jobs||[];
      if(!jobs.length){wrap.innerHTML='<motion class="empty-state"><h3>No jobs</h3><a href="admin-job-edit.html" class="btn-primary">Add Job</a></div>';return;}
      wrap.innerHTML=jobs.map(function(j){
        return '<div class="row-item"><div><h4>'+LCCDash.escapeHTML(j.title)+(j.isFeatured?' <span class="badge-gold">Featured</span>':'')+'</h4><div class="meta"><span>'+LCCDash.escapeHTML(j.company)+'</span><span>'+LCCDash.escapeHTML(j.location)+'</span><span>'+(j.isActive?'Active':'Paused')+'</span></div></div><div class="actions"><a href="admin-job-edit.html?id='+j._id+'" class="btn-secondary btn-sm">Edit</a><button class="btn-danger" data-del="'+j._id+'">Delete</button></div></motion></div>';
      }).join('');
      wrap.querySelectorAll('[data-del]').forEach(function(b){b.addEventListener('click',async function(){
        if(!confirm('Delete this job and all applications?'))return;
        try{await LCCApi.delete('/jobs/'+b.getAttribute('data-del'));LCCDash.showToast('Deleted','ok');location.reload();}catch(e){LCCDash.showToast(e.message,'error');}
      });});
    }catch(e){wrap.innerHTML='<p>'+LCCDash.escapeHTML(e.message)+'</p>';}
  });
})();`,

  'admin-job-edit.js': `(function(){
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
})();`,

  'admin-applications.js': `(function(){
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
})();`,

  'admin-blogs.js': `(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();}
  ready(async function(){
    if(!LCCAdmin.initAdminPage('admin-blogs.html'))return;
    document.getElementById('pageSub').textContent='Publish and manage blog posts';
    const wrap=document.getElementById('blogsList');
    const origin=LCCAdmin.apiOrigin();
    try{
      const r=await LCCApi.get('/blogs/admin/all');
      const blogs=r.blogs||[];
      if(!blogs.length){wrap.innerHTML='<div class="empty-state"><h3>No posts</h3></motion></div>';return;}
      wrap.innerHTML=blogs.map(function(b){
        return '<div class="row-item"><motion><h4>'+LCCDash.escapeHTML(b.title)+'</h4><div class="meta"><span>'+LCCDash.escapeHTML(b.category)+'</span><span>'+(b.isPublished?'Published':'Draft')+'</span></div></div><div class="actions"><a href="admin-blog-edit.html?id='+b._id+'" class="btn-secondary btn-sm">Edit</a><button data-del="'+b._id+'" class="btn-danger">Delete</button></div></div>';
      }).join('');
      wrap.querySelectorAll('[data-del]').forEach(function(b){b.addEventListener('click',async function(){
        if(!confirm('Delete post?'))return;
        try{await LCCApi.delete('/blogs/'+b.getAttribute('data-del'));location.reload();}catch(e){LCCDash.showToast(e.message,'error');}
      });});
    }catch(e){wrap.innerHTML='<p>'+LCCDash.escapeHTML(e.message)+'</p>';}
  });
})();`,

  'admin-blog-edit.js': `(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();}
  function gid(){return new URLSearchParams(location.search).get('id');}
  ready(async function(){
    if(!LCCAdmin.initAdminPage('admin-blog-edit.html'))return;
    const id=gid();
    const cats=['Career Tips','Hiring Insights','Company News','Success Stories'];
    document.getElementById('blogCategory').innerHTML=cats.map(function(c){return '<option>'+c+'</option>';}).join('');
    if(id){
      document.querySelector('h1').textContent='Edit Blog Post';
      try{
        const r=await LCCApi.get('/blogs/admin/'+encodeURIComponent(id));
        const b=r.blog;
        document.querySelector('[name="title"]').value=b.title;
        document.querySelector('[name="excerpt"]').value=b.excerpt||'';
        document.querySelector('[name="content"]').value=b.content;
        document.getElementById('blogCategory').value=b.category;
        document.getElementById('isPublished').checked=!!b.isPublished;
        document.getElementById('isFeaturedBlog').checked=!!b.isFeatured;
      }catch(e){LCCDash.showToast(e.message,'error');}
    }
    document.getElementById('blogForm').addEventListener('submit',async function(e){
      e.preventDefault();
      const fd=new FormData(e.target);
      fd.set('isPublished',document.getElementById('isPublished').checked);
      fd.set('isFeatured',document.getElementById('isFeaturedBlog').checked);
      const btn=document.getElementById('blogSubmitBtn');btn.disabled=true;
      try{
        if(id) await LCCApi.uploadPut('/blogs/'+encodeURIComponent(id),Object.fromEntries(fd.entries()),'coverImage',fd.get('coverImage').size?fd.get('coverImage'):null);
        else await LCCApi.upload('/blogs',Object.fromEntries(fd.entries()),'coverImage',fd.get('coverImage').size?fd.get('coverImage'):null);
        LCCDash.showToast('Saved','ok');
        setTimeout(function(){location.href='admin-blogs.html';},600);
      }catch(err){LCCDash.showToast(err.message,'error');btn.disabled=false;}
    });
  });
})();`,

  'admin-hiring.js': `(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();}
  const LABELS={new:'New',contacted:'Contacted',in_progress:'In Progress',closed:'Closed'};
  ready(async function(){
    if(!LCCAdmin.initAdminPage('admin-hiring-requests.html'))return;
    document.getElementById('pageSub').textContent='Company inquiries and consultation requests';
    const wrap=document.getElementById('hireList');
    try{
      const r=await LCCApi.get('/hiring-requests');
      const list=r.requests||[];
      if(!list.length){wrap.innerHTML='<div class="empty-state"><h3>No requests yet</h3></div>';return;}
      wrap.innerHTML=list.map(function(h){
        return '<div class="row-item"><div><h4>'+LCCDash.escapeHTML(h.companyName)+' — '+LCCDash.escapeHTML(h.contactName)+'</h4><motion class="meta"><span>'+LCCDash.escapeHTML(h.email)+'</span><span>'+LCCDash.escapeHTML(h.rolesNeeded||h.type)+'</span><span>'+LCCDash.escapeHTML(h.message||'').slice(0,80)+'</span></div></div><div class="actions"><select data-h="'+h._id+'">'+Object.keys(LABELS).map(function(k){return '<option value="'+k+'"'+(k===h.status?' selected':'')+'>'+LABELS[k]+'</option>';}).join('')+'</select></div></div>';
      }).join('');
      wrap.querySelectorAll('select[data-h]').forEach(function(sel){sel.addEventListener('change',async function(){
        try{await LCCApi.patch('/hiring-requests/'+sel.getAttribute('data-h')+'/status',{status:sel.value});LCCDash.showToast('Updated','ok');}catch(e){LCCDash.showToast(e.message,'error');}
      });});
    }catch(e){wrap.innerHTML='<p>'+LCCDash.escapeHTML(e.message)+'</p>';}
  });
})();`
};

Object.entries(files).forEach(([name, code]) => {
  const clean = code.replace(/<motion[^>]*>/g, '').replace(/<\/motion>/g, '');
  fs.writeFileSync(path.join(dir, name), clean);
  console.log('Wrote', name);
});
