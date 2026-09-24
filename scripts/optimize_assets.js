const fs = require('fs');
const zlib = require('zlib');

function rdpSimplify(line, epsilon = 18) {
  if (line.length <= 6) return line;
  const n = line.length / 3;
  const keep = new Uint8Array(n);
  keep[0] = 1; keep[n - 1] = 1;
  function simplify(start, end) {
    if (end <= start + 1) return;
    const x1 = line[start*3], y1 = line[start*3+1];
    const x2 = line[end*3], y2 = line[end*3+1];
    const dx = x2 - x1, dy = y2 - y1;
    const lenSq = dx * dx + dy * dy || 1;
    let maxDistSq = 0, maxIdx = start;
    for (let i = start + 1; i < end; i++) {
      const px = line[i*3], py = line[i*3+1];
      const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
      const projX = x1 + t * dx, projY = y1 + t * dy;
      const distSq = (px - projX) * (px - projX) + (py - projY) * (py - projY);
      if (distSq > maxDistSq) {
        maxDistSq = distSq; maxIdx = i;
      }
    }
    if (maxDistSq > epsilon * epsilon) {
      keep[maxIdx] = 1;
      simplify(start, maxIdx);
      simplify(maxIdx, end);
    }
  }
  simplify(0, n - 1);
  const out = [];
  for (let i = 0; i < n; i++) {
    if (keep[i]) out.push(line[i*3], line[i*3+1], line[i*3+2]);
  }
  return out;
}

// 1. Optimize trails.json
const trails = JSON.parse(fs.readFileSync('work/dist/data/trails.json', 'utf8'));
console.log('Optimizing trails.json, count:', trails.length);
for (const t of trails) {
  t.lines = t.lines.map(l => rdpSimplify(l, 18)).filter(l => l.length >= 6);
}
fs.writeFileSync('work/dist/data/trails.json', JSON.stringify(trails));
const trailsStat = fs.statSync('work/dist/data/trails.json');
console.log('Optimized trails.json size:', (trailsStat.size / 1024 / 1024).toFixed(2), 'MB');

// 2. Optimize future.json
const future = JSON.parse(fs.readFileSync('work/dist/data/future.json', 'utf8'));
for (const p of future.plans) {
  p.lines = p.lines.map(l => rdpSimplify(l, 20)).filter(l => l.length >= 6);
}
fs.writeFileSync('work/dist/data/future.json', JSON.stringify(future));
const futureStat = fs.statSync('work/dist/data/future.json');
console.log('Optimized future.json size:', (futureStat.size / 1024).toFixed(1), 'KB');

// 3. Remove mask.bin from work/dist/data if present (we only use mask.png)
if (fs.existsSync('work/dist/data/mask.bin')) {
  fs.unlinkSync('work/dist/data/mask.bin');
  console.log('Deleted unnecessary mask.bin');
}

// 4. Bump HTML version
const v = Date.now();
let html = fs.readFileSync('work/dist/index.html', 'utf8');
html = html.replace(/index\.js\?v=\d+/, `index.js?v=${v}`);
html = html.replace(/index\.css\?v=\d+/, `index.css?v=${v}`);
fs.writeFileSync('work/dist/index.html', html);
console.log('Bumped index.html to version:', v);
