(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();}
  ready(async function(){
    if(!LCCAdmin.initAdminPage('admin-blogs.html'))return;
    document.getElementById('pageSub').textContent='Publish and manage blog posts';
    const wrap=document.getElementById('blogsList');
    const origin=LCCAdmin.apiOrigin();
    try{
      const r=await LCCApi.get('/blogs/admin/all');
      const blogs=r.blogs||[];
      if(!blogs.length){wrap.innerHTML='<div class="empty-state"><h3>No posts</h3></div>';return;}
      wrap.innerHTML=blogs.map(function(b){
        return '<div class="row-item"><h4>'+LCCDash.escapeHTML(b.title)+'</h4><div class="meta"><span>'+LCCDash.escapeHTML(b.category)+'</span><span>'+(b.isPublished?'Published':'Draft')+'</span></div></div><div class="actions"><a href="admin-blog-edit.html?id='+b._id+'" class="btn-secondary btn-sm">Edit</a><button data-del="'+b._id+'" class="btn-danger">Delete</button></div></div>';
      }).join('');
      wrap.querySelectorAll('[data-del]').forEach(function(b){b.addEventListener('click',async function(){
        if(!confirm('Delete post?'))return;
        try{await LCCApi.delete('/blogs/'+b.getAttribute('data-del'));location.reload();}catch(e){LCCDash.showToast(e.message,'error');}
      });});
    }catch(e){wrap.innerHTML='<p>'+LCCDash.escapeHTML(e.message)+'</p>';}
  });
})();