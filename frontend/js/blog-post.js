(function(){
  function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  document.addEventListener('DOMContentLoaded',async function(){
    const slug=new URLSearchParams(location.search).get('slug');
    const el=document.getElementById('postContent');
    if(!slug){el.innerHTML='<p>Post not found.</p>';return;}
    try{
      const r=await LCCApi.get('/blogs/'+encodeURIComponent(slug));
      const b=r.blog;
      document.title=b.title+' | LCC Blog';
      const API_ORIGIN=(LCCApi.base||'').replace(/\/api$/,'');
      const cover=b.coverImage?(b.coverImage.startsWith('http')?b.coverImage:API_ORIGIN+b.coverImage):'';
      el.innerHTML='<span class="section-tag">'+esc(b.category)+'</span><h1 style="font-family:var(--font-display);font-size:clamp(28px,4vw,42px);color:var(--navy);margin:12px 0;">'+esc(b.title)+'</h1><p style="color:var(--gray);margin-bottom:24px;">'+new Date(b.publishedAt||b.createdAt).toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'})+'</p>'+(cover?'<div class="blog-post-cover" style="background-image:url('+esc(cover)+')"></div>':'')+'<div class="blog-post-content">'+b.content+'</div>';
    }catch(e){el.innerHTML='<p>'+esc(e.message)+'</p>';}
  });
})();