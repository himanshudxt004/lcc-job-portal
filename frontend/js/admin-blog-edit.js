(function () {
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  function gid() { return new URLSearchParams(location.search).get('id'); }

  ready(async function () {
    if (!LCCAdmin.initAdminPage('admin-blog-edit.html')) return;
    const id = gid();
    const cats = ['Career Tips', 'Hiring Insights', 'Company News', 'Success Stories'];
    document.getElementById('blogCategory').innerHTML = cats.map(function (c) {
      return '<option>' + c + '</option>';
    }).join('');

    if (id) {
      document.querySelector('h1').textContent = 'Edit Blog Post';
      try {
        const r = await LCCApi.get('/blogs/admin/' + encodeURIComponent(id));
        const b = r.blog;
        document.querySelector('[name="title"]').value = b.title;
        document.querySelector('[name="excerpt"]').value = b.excerpt || '';
        document.querySelector('[name="content"]').value = b.content;
        document.getElementById('blogCategory').value = b.category;
        document.getElementById('isPublished').checked = !!b.isPublished;
        document.getElementById('isFeaturedBlog').checked = !!b.isFeatured;
      } catch (e) { LCCDash.showToast(e.message, 'error'); }
    }

    document.getElementById('blogForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      fd.set('isPublished', document.getElementById('isPublished').checked ? 'true' : 'false');
      fd.set('isFeatured', document.getElementById('isFeaturedBlog').checked ? 'true' : 'false');
      const file = fd.get('coverImage');
      const btn = document.getElementById('blogSubmitBtn');
      btn.disabled = true;
      try {
        const data = Object.fromEntries(fd.entries());
        if (id) {
          if (file && file.size > 0) {
            await LCCApi.uploadPut('/blogs/' + encodeURIComponent(id), data, 'coverImage', file);
          } else {
            delete data.coverImage;
            await LCCApi.put('/blogs/' + encodeURIComponent(id), data);
          }
        } else if (file && file.size > 0) {
          await LCCApi.upload('/blogs', data, 'coverImage', file);
        } else {
          delete data.coverImage;
          await LCCApi.post('/blogs', data);
        }
        LCCDash.showToast('Saved', 'ok');
        setTimeout(function () { location.href = 'admin-blogs.html'; }, 600);
      } catch (err) {
        LCCDash.showToast(err.message, 'error');
        btn.disabled = false;
      }
    });
  });
})();
