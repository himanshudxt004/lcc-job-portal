(function(){
  const API_ORIGIN = (LCCApi.base||'').replace(/\/api$/,'');
  const CATS = ['All','Career Tips','Hiring Insights','Company News','Success Stories'];
  let activeCat = 'All';
  function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function fmtDate(d){return d?new Date(d).toLocaleDateString('en-IN',{year:'numeric',month:'short',day:'numeric'}):'';}
  function coverUrl(img){return img?(img.startsWith('http')?img:API_ORIGIN+img):'images/hero-banner.png';}
  async function load(){
    const grid=document.getElementById('blogGrid');
    try{
      const q=activeCat==='All'?'':'?category='+encodeURIComponent(activeCat);
      const r=await LCCApi.get('/blogs'+q);
      const blogs=r.blogs||[];
      const feat=document.getElementById('featuredBlog');
      const featured=blogs.find(b=>b.isFeatured)||blogs[0];
      if(featured&&activeCat==='All'){
        feat.style.display='block';
        feat.innerHTML='<div class="featured-blog-inner"><div class="featured-blog-text"><span class="section-tag">Featured</span><h2>'+esc(featured.title)+'</h2><p>'+esc(featured.excerpt)+'</p><a href="blog-post.html?slug='+encodeURIComponent(featured.slug)+'" class="btn-primary">Read Article</a></div><div class="featured-blog-img" style="background-image:url('+esc(coverUrl(featured.coverImage))+')"></div></div>';
      } else feat.style.display='none';
      const list=activeCat==='All'?blogs.filter(b=>!featured||b._id!==featured._id):blogs;
      if(!list.length){grid.innerHTML='<div class="empty-state"><h3>No posts in this category</h3></div>';return;}
      grid.innerHTML=list.map(b=>'<article class="blog-card reveal"><div class="blog-card-img" style="background-image:url('+esc(coverUrl(b.coverImage))+')"></div><span class="blog-cat">'+esc(b.category)+'</span><h3>'+esc(b.title)+'</h3><p>'+esc(b.excerpt)+'</p><div class="blog-card-meta">'+fmtDate(b.publishedAt||b.createdAt)+'</div><a href="blog-post.html?slug='+encodeURIComponent(b.slug)+'" class="btn-secondary btn-sm">Read More</a></div></article>').join('');
    }catch(e){grid.innerHTML='<p>'+esc(e.message)+'</p>';}
  }
  document.addEventListener('DOMContentLoaded',function(){
    const catEl=document.getElementById('blogCategories');
    catEl.innerHTML=CATS.map(c=>'<button type="button" class="blog-cat-btn'+(c===activeCat?' active':'')+'" data-cat="'+esc(c)+'">'+esc(c)+'</button>').join('');
    catEl.querySelectorAll('.blog-cat-btn').forEach(btn=>btn.addEventListener('click',function(){activeCat=btn.getAttribute('data-cat');catEl.querySelectorAll('.blog-cat-btn').forEach(b=>b.classList.toggle('active',b===btn));load();}));
    load();
  });
})();