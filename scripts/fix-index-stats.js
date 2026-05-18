const fs = require('fs');
const p = require('path').join(__dirname, '..', 'frontend', 'index.html');
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/\s+2500\+<\/motion><\/motion><\/motion><\/motion><\/motion><\/motion><\/motion><\/motion><\/motion><\/motion><\/motion><\/div>\s*\n/g, '\n');
c = c.replace(/\s+2500\+<\/div>\s*\n/g, '\n');
c = c.replace(
  /<div class="stats-band-num" data-counter data-target="24" data-suffix="\/7">24\/7<\/div>\s*Support<\/div>/,
  '<motion class="stats-band-num" data-counter data-target="24" data-suffix="/7">24/7</div>\n        <div class="stats-band-label">Support</div>'
);
const t = 'di' + 'v';
c = c.replace(/<motion class="stats-band-num"/g, '<' + t + ' class="stats-band-num"');
c = c.replace(/<motion class="stats-band-label"/g, '<' + t + ' class="stats-band-label"');
fs.writeFileSync(p, c);
console.log('fixed stats');
