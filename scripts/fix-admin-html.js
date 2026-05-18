const fs = require('fs');
const p = require('path').join(__dirname, '..', 'frontend', 'dashboard-admin.html');
let c = fs.readFileSync(p, 'utf8');
const t = 'di' + 'v';
c = c.replace(
  '        <motion class="stat-block">-</motion></motion></motion></motion></motion></motion></motion></motion></motion></div>Applications</div></div>',
  '        <' + t + ' class="stat-block"><' + t + ' class="num" id="sApps">-</' + t + '><' + t + ' class="label">Applications</' + t + '></' + t + '></' + t + '>'
);
c = c.replace(
  '        <div class="stat-block">-</div>Applications</div></div>',
  '        <' + t + ' class="stat-block"><' + t + ' class="num" id="sApps">-</' + t + '><' + t + ' class="label">Applications</' + t + '></' + t + '></' + t + '>'
);
c = c.replace(/<\/div><\/motion><\/motion><\/motion><\/motion><\/motion><\/motion><\/motion><\/motion><\/motion><\/motion><\/div>/g, '</div>');
c = c.replace(/<\/div><\/div><\/div>/g, '</div>');
fs.writeFileSync(p, c);
console.log('done');
