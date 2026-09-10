// One-off: restore framer-motion `motion`/`AnimatePresence` imports in files
// that use them but lost the import to the earlier cleanup script.
const fs = require('fs');
const path = require('path');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : (p.endsWith('.jsx') ? [p] : []);
  });
}

for (const file of walk('src')) {
  const src = fs.readFileSync(file, 'utf8');
  if (/from ['"]framer-motion['"]/.test(src)) continue;
  const usesMotion = /\bmotion\./.test(src);
  const usesAP = /\bAnimatePresence\b/.test(src);
  if (!usesMotion && !usesAP) continue;
  const names = [usesMotion && 'motion', usesAP && 'AnimatePresence'].filter(Boolean).join(', ');
  const lines = src.split('\n');
  // insert after the React import (or at top)
  const idx = lines.findIndex(l => /^import React/.test(l));
  lines.splice(idx + 1, 0, `import { ${names} } from 'framer-motion';`);
  fs.writeFileSync(file, lines.join('\n'));
  console.log('restored in', file);
}
