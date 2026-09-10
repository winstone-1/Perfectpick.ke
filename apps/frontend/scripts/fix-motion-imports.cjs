// One-off: fix broken framer-motion imports after the earlier cleanup script.
// For each src/**/*.jsx: if the file uses `motion.` but its framer-motion
// import lacks `motion`, add it; same for AnimatePresence.
const fs = require('fs');
const path = require('path');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : (p.endsWith('.jsx') ? [p] : []);
  });
}

for (const file of walk('src')) {
  let src = fs.readFileSync(file, 'utf8');
  const importRe = /import\s*\{([^}]*)\}\s*from\s*['"]framer-motion['"];?/;
  const m = src.match(importRe);
  if (!m) continue;
  const usesMotion = /\bmotion\./.test(src) || /<motion\b/.test(src);
  const usesAP = /\bAnimatePresence\b/.test(src.replace(importRe, ''));
  const names = m[1].split(',').map(s => s.trim()).filter(Boolean);
  const set = new Set(names);
  let changed = false;
  if (usesMotion && !set.has('motion')) { set.add('motion'); changed = true; }
  if (usesAP && !set.has('AnimatePresence')) { set.add('AnimatePresence'); changed = true; }
  if (!changed) continue;
  const ordered = [...set].sort(a => (a === 'motion' ? -1 : 1));
  src = src.replace(importRe, `import { ${ordered.join(', ')} } from 'framer-motion';`);
  fs.writeFileSync(file, src);
  console.log('fixed', file, '->', ordered.join(', '));
}
