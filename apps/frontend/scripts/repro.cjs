// Repro: does plain no-unused-vars flag `motion` used via JSX <motion.div />?
const { Linter } = require('eslint');
const l = new Linter();
const opts = { rules: { 'no-unused-vars': 'error' }, languageOptions: { ecmaVersion: 'latest', parserOptions: { ecmaFeatures: { jsx: true } }, sourceType: 'module' } };
// Case 1: JSXIdentifier usage
const code1 = "import { motion } from 'framer-motion';\nconst Icon = () => null;\nconst A = () => (<div><Icon size={2} /></div>);\nexport default A;";
console.log('JSXIdentifier:', JSON.stringify(l.verify(code1, opts).map(m => m.message)));
// Case 2: JSXMemberExpression root usage
const code2 = "import { motion } from 'framer-motion';\nconst A = () => (<div><motion.div x /></div>);\nexport default A;";
console.log('JSXMember:', JSON.stringify(l.verify(code2, opts).map(m => m.message)));
