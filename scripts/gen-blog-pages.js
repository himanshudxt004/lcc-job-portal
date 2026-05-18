const fs = require('fs');
const path = require('path');
const base = path.join(__dirname, '..', 'frontend');

const blogHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blog | LCC Career Insights</title>
  <meta name="description" content="Career tips, hiring insights, success stories and recruitment news from Lead Connects Career." />
  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="css/dashboard.css" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&amp;family=DM+Sans:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet" />
</head>
<body data-page="blog">
  <div data-include="header"></div>
  <section class="page-header blog-hero">
    <div class="page-header-inner">
      <div class="breadcrumb"><a href="index.html">Home</a> / Blog</div>
      <h1>Insights, Success Stories &amp; <span>Career Growth</span></h1>
      <p>Expert guidance, placement stories and hiring insights from LCC recruitment consultants.</p>
    </div>
  </section>
  <section class="block">
    <div id="featuredBlog" class="featured-blog-card reveal" style="display:none;"></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></div>
    <div class="blog-categories" id="blogCategories"></div>
    <motion id="blogGrid" class="blog-grid">
    <div id="blogGrid" class="blog-grid">
      <div class="loader">Loading articles...</div>
    </div>
  </section>
  <section class="cta-section">
    <h2>Ready for Your <span>Next Step?</span></h2>
    <p>Connect with our recruiters, explore open roles, or request hiring support for your organisation.</p>
    <div class="cta-buttons">
      <a href="contact.html" class="btn-primary">Contact Recruiters</a>
      <a href="jobs.html" class="btn-outline">Apply for Jobs</a>
      <a href="request-hiring.html" class="btn-secondary">Request Hiring Support</a>
    </div>
  </section>
  <div data-include="footer"></div>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
  <script src="js/api.js"></script>
  <script src="js/include.js"></script>
  <script src="js/main.js"></script>
  <script src="js/blog.js"></script>
  <script src="js/gsap-animations.js"></script>
</body>
</html>`.replace(/<motion[^>]*>/g, '').replace(/<\/motion>/g, '');

const postHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blog Post | LCC</title>
  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="css/dashboard.css" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&amp;family=DM+Sans:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet" />
</head>
<body data-page="blog">
  <div data-include="header"></div>
  <article class="block blog-article-wrap">
    <div class="app-container" style="max-width:800px;margin:0 auto;">
      <a href="blog.html" class="btn-secondary btn-sm" style="margin-bottom:20px;">Back to Blog</a>
      <div id="postContent"><div class="loader">Loading...</div></div>
    </div>
  </article>
  <div data-include="footer"></div>
  <script src="js/api.js"></script>
  <script src="js/include.js"></script>
  <script src="js/main.js"></script>
  <script src="js/blog-post.js"></script>
</body>
</html>`;

fs.writeFileSync(path.join(base, 'blog.html'), blogHtml);
fs.writeFileSync(path.join(base, 'blog-post.html'), postHtml);

const blogJs = `(function(){
  const API_ORIGIN = (LCCApi.base||'').replace(/\\/api$/,'');
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
      grid.innerHTML=list.map(b=>'<article class="blog-card reveal"><div class="blog-card-img" style="background-image:url('+esc(coverUrl(b.coverImage))+')"></div><motion class="blog-card-body"><span class="blog-cat">'+esc(b.category)+'</span><h3>'+esc(b.title)+'</h3><p>'+esc(b.excerpt)+'</p><div class="blog-card-meta">'+fmtDate(b.publishedAt||b.createdAt)+'</div><a href="blog-post.html?slug='+encodeURIComponent(b.slug)+'" class="btn-secondary btn-sm">Read More</a></div></article>').join('');
    }catch(e){grid.innerHTML='<p>'+esc(e.message)+'</p>';}
  }
  document.addEventListener('DOMContentLoaded',function(){
    const catEl=document.getElementById('blogCategories');
    catEl.innerHTML=CATS.map(c=>'<button type="button" class="blog-cat-btn'+(c===activeCat?' active':'')+'" data-cat="'+esc(c)+'">'+esc(c)+'</button>').join('');
    catEl.querySelectorAll('.blog-cat-btn').forEach(btn=>btn.addEventListener('click',function(){activeCat=btn.getAttribute('data-cat');catEl.querySelectorAll('.blog-cat-btn').forEach(b=>b.classList.toggle('active',b===btn));load();}));
    load();
  });
})();`.replace(/<motion[^>]*>/g,'').replace(/<\/motion>/g,'');

const postJs = `(function(){
  function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  document.addEventListener('DOMContentLoaded',async function(){
    const slug=new URLSearchParams(location.search).get('slug');
    const el=document.getElementById('postContent');
    if(!slug){el.innerHTML='<p>Post not found.</p>';return;}
    try{
      const r=await LCCApi.get('/blogs/'+encodeURIComponent(slug));
      const b=r.blog;
      document.title=b.title+' | LCC Blog';
      const API_ORIGIN=(LCCApi.base||'').replace(/\\/api$/,'');
      const cover=b.coverImage?(b.coverImage.startsWith('http')?b.coverImage:API_ORIGIN+b.coverImage):'';
      el.innerHTML='<span class="section-tag">'+esc(b.category)+'</span><h1 style="font-family:var(--font-display);font-size:clamp(28px,4vw,42px);color:var(--navy);margin:12px 0;">'+esc(b.title)+'</h1><p style="color:var(--gray);margin-bottom:24px;">'+new Date(b.publishedAt||b.createdAt).toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'})+'</p>'+(cover?'<div class="blog-post-cover" style="background-image:url('+esc(cover)+')"></div>':'')+'<div class="blog-post-content">'+b.content+'</motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></div>';
    }catch(e){el.innerHTML='<p>'+esc(e.message)+'</p>';}
  });
})();`.replace(/<motion[^>]*>/g,'').replace(/<\/motion>/g,'');

fs.writeFileSync(path.join(base, 'js', 'blog.js'), blogJs);
fs.writeFileSync(path.join(base, 'js', 'blog-post.js'), postJs);

const homeJobs = `(function(){
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
})();`;

fs.writeFileSync(path.join(base, 'js', 'home-jobs.js'), homeJobs);
console.log('blog + home-jobs done');
