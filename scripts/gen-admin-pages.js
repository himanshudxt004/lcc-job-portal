const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..', 'frontend');

function layout(title, content, scriptFile) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} | LCC Admin</title>
  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="css/dashboard.css" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&amp;family=DM+Sans:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet" />
</head>
<body data-page="dashboard" class="admin-body">
  <div data-include="header"></motion></div>
  <section class="app-shell admin-shell">
    <aside id="adminSidebar" class="admin-sidebar"></aside>
    <div class="admin-main">
      <div class="app-head">
        <div><h1>${title}</h1><div class="sub" id="pageSub"></div></div>
        <div id="authStrip"></div>
      </div>
      ${content}
    </div>
  </section>
  <div data-include="footer"></div>
  <motion id="toast" class="toast"></div>
  <script src="js/api.js"></script>
  <script src="js/include.js"></script>
  <script src="js/main.js"></script>
  <script src="js/dashboard-common.js"></script>
  <script src="js/admin-common.js"></script>
  <script src="js/${scriptFile}"></script>
</body>
</html>`.replace(/<motion[^>]*>/g, '').replace(/<\/motion>/g, '');
}

const pages = {
  'dashboard-admin.html': layout('Admin Dashboard', `
      <div class="stats-grid" id="adminStats">
        <div class="stat-block"><div class="num" id="sJobs">-</div><div class="label">Jobs</div></div>
        <div class="stat-block"><motion class="num" id="sApps">-</div><motion class="label">Applications</div></div>
        <div class="stat-block"><div class="num" id="sBlogs">-</div><div class="label">Blog Posts</div></div>
        <motion class="stat-block"><div class="num" id="sHire">-</div><div class="label">Hiring Requests</div></div>
      </div>
      <div class="admin-quick-links" style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px;">
        <a href="admin-jobs.html" class="btn-primary">Manage Jobs</a>
        <a href="admin-applications.html" class="btn-secondary">Applications</a>
        <a href="admin-blogs.html" class="btn-secondary">Blog</a>
        <a href="admin-hiring-requests.html" class="btn-secondary">Hiring Requests</a>
      </div>`, 'admin-dashboard.js'),

  'admin-jobs.html': layout('Job Management', `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
        <p class="card-sub" style="margin:0;">Add, edit and feature jobs published by LCC.</p>
        <a href="admin-job-edit.html" class="btn-primary">+ Add Job</a>
      </div>
      <div id="jobsList" class="row-list"><div class="loader">Loading jobs...</div></div>`, 'admin-jobs.js'),

  'admin-job-edit.html': layout('Edit Job', `
      <div style="margin-bottom:16px;"><a href="admin-jobs.html" class="btn-secondary btn-sm">Back to Jobs</a></div>
      <div class="card-block">
        <form id="jobForm">
          <div class="form-row">
            <div class="form-group"><label>Title *</label><input name="title" required /></div>
            <div class="form-group"><label>Company *</label><input name="company" required /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Location *</label><input name="location" required /></div>
            <div class="form-group"><label>Salary</label><input name="salary" placeholder="5-8 LPA" /></div>
          </div>
          <motion class="form-row">
          <motion class="form-row">
          <div class="form-row">
            <div class="form-group"><label>Type</label><select name="type"><option>Full-Time</option><option>Part-Time</option><option>Contract</option><option>Temporary</option><option>Internship</option></select></div>
            <div class="form-group"><label>Industry</label><input name="industry" /></div>
          </div>
          <div class="form-row">
            <motion class="form-group"><label>Experience</label><input name="experience" /></div>
            <div class="form-group"><label>Skills (comma separated)</label><input name="skills" /></div>
          </div>
          <div class="form-group"><label>Description *</label><textarea name="description" required style="min-height:180px;"></textarea></div>
          <div class="form-row">
            <label><input type="checkbox" name="isFeatured" id="isFeatured" /> Featured job</label>
            <label><input type="checkbox" name="isActive" id="isActive" checked /> Active / accepting applications</label>
          </div>
          <button type="submit" class="btn-primary" id="submitBtn">Save Job</button>
        </form>
      </div>`, 'admin-job-edit.js'),

  'admin-applications.html': layout('Applicant Management', `
      <div class="card-block" style="margin-bottom:16px;">
        <label>Filter by job</label>
        <select id="filterJob"><option value="">All jobs</option></select>
        <button id="refreshApps" class="btn-secondary btn-sm" style="margin-left:8px;">Refresh</button>
      </div>
      <div id="appsList" class="row-list"><div class="loader">Loading...</div></div>`, 'admin-applications.js'),

  'admin-blogs.html': layout('Blog Management', `
      <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
        <p class="card-sub" style="margin:0;">Publish insights, success stories and career tips.</p>
        <a href="admin-blog-edit.html" class="btn-primary">+ New Post</a>
      </div>
      <div id="blogsList" class="row-list"><div class="loader">Loading...</div></div>`, 'admin-blogs.js'),

  'admin-blog-edit.html': layout('Edit Blog Post', `
      <div style="margin-bottom:16px;"><a href="admin-blogs.html" class="btn-secondary btn-sm">Back</a></div>
      <div class="card-block">
        <form id="blogForm" enctype="multipart/form-data">
          <div class="form-group"><label>Title *</label><input name="title" required /></div>
          <div class="form-row">
            <div class="form-group"><label>Category</label><select name="category" id="blogCategory"></select></motion></div>
            <div class="form-group"><label>Cover Image</label><input type="file" name="coverImage" accept="image/*" /></div>
          </div>
          <div class="form-group"><label>Excerpt</label><textarea name="excerpt" rows="2"></textarea></div>
          <div class="form-group"><label>Content (HTML) *</label><textarea name="content" required style="min-height:220px;"></textarea></div>
          <div class="form-row">
            <label><input type="checkbox" name="isPublished" id="isPublished" /> Published</label>
            <label><input type="checkbox" name="isFeatured" id="isFeaturedBlog" /> Featured</label>
          </div>
          <button type="submit" class="btn-primary" id="blogSubmitBtn">Save Post</button>
        </form>
      </div>`, 'admin-blog-edit.js'),

  'admin-hiring-requests.html': layout('Hiring Requests', `
      <div id="hireList" class="row-list"><div class="loader">Loading...</div></div>`, 'admin-hiring.js')
};

Object.entries(pages).forEach(([file, html]) => {
  const clean = html.replace(/<motion[^>]*>/g, '').replace(/<\/motion>/g, '');
  fs.writeFileSync(path.join(base, file), clean);
  console.log('Wrote', file);
});
