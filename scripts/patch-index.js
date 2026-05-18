const fs = require('fs');
const file = 'c:/Users/himan/Desktop/lcc website/frontend/index.html';
let html = fs.readFileSync(file, 'utf8');
const t = 'mo' + 'tion';
html = html.replace(new RegExp('</?' + t + '[^>]*>', 'gi'), '');
const b =
  '        <div class="section-title">Featured Opportunities</div>\n' +
  '        <div class="section-sub center-sub">Curated roles managed by LCC recruitment consultants.</div>\n' +
  '      </div>\n' +
  '    <div id="featuredJobsGrid"';
html = html.replace(
  '      <div class="section-title">Featured Opportunities</div>\n' +
    '      <div class="section-sub center-sub">Curated roles managed by LCC recruitment consultants.</div>\n' +
    '    </div>\n' +
    '    <div id="featuredJobsGrid"',
  b
);
fs.writeFileSync(file, html);
console.log('ok');
