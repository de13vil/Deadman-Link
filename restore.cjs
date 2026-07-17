const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, 'src');

const EXCLUDED_FILES = [
  'LandingPage.jsx',
  'Home.jsx',
  'RedirectHandler.jsx',
  'SelfDestructHero.jsx'
];

const REPLACEMENTS = [
  { replacement: 'bg-obsidian-950', regex: /bg-\[var\(--color-base\)\]/g },
  { replacement: 'bg-obsidian-900', regex: /bg-\[var\(--color-surface-1\)\]/g },
  { replacement: 'bg-slate-800', regex: /bg-\[var\(--color-surface-2\)\]/g },
  
  { replacement: 'text-slate-400', regex: /text-\[var\(--color-text-secondary\)\]/g },
  { replacement: 'text-slate-500', regex: /text-\[var\(--color-text-muted\)\]/g },
  
  { replacement: 'border-white/10', regex: /border-\[var\(--color-border-default\)\]/g },
  { replacement: 'border-slate-700', regex: /border-\[var\(--color-border-strong\)\]/g },
  
  { replacement: 'text-emerald-500', regex: /text-\[var\(--color-accent-primary\)\]/g },
  { replacement: 'bg-emerald-500/10', regex: /bg-\[var\(--color-accent-tint-dark\)\]/g },
  { replacement: 'bg-emerald-500', regex: /bg-\[var\(--color-accent-primary\)\]/g },
  { replacement: 'border-emerald-500', regex: /border-\[var\(--color-accent-primary\)\]/g }
];

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.jsx') || fullPath.endsWith('.js'))) {
      if (EXCLUDED_FILES.includes(file)) continue;

      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      for (const rule of REPLACEMENTS) {
        content = content.replace(rule.regex, rule.replacement);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log("Reverted:", fullPath);
      }
    }
  }
}

processDirectory(TARGET_DIR);
console.log("Regex reversion completed.");
