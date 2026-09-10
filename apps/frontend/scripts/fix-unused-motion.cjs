// One-off lint cleanup: removes unused `motion` imports flagged by eslint (lint.json).
const fs = require('fs');
const results = JSON.parse(fs.readFileSync('lint.json', 'utf8'));
let fixed = 0;
for (const file of results) {
  let src = fs.readFileSync(file.filePath, 'utf8');
  let changed = false;
  for (const m of file.messages) {
    if (m.ruleId === 'no-unused-vars' && /motion' is defined but never used/.test(m.message)) {
      const re1 = /import \{ motion, ([^}]*)\} from (['"])framer-motion\2;?/;
      const re2 = /import \{ ([^}]*), motion \} from (['"])framer-motion\2;?/;
      const re3 = /import \{ motion \} from (['"])framer-motion\2;?\r?\n?/;
      if (re1.test(src)) { src = src.replace(re1, 'import { $1 } from $2framer-motion$2;'); changed = true; }
      else if (re2.test(src)) { src = src.replace(re2, 'import { $1 } from $2framer-motion$2;'); changed = true; }
      else if (re3.test(src)) { src = src.replace(re3, ''); changed = true; }
    }
  }
  if (changed) { fs.writeFileSync(file.filePath, src); fixed++; }
}
console.log('fixed files:', fixed);
