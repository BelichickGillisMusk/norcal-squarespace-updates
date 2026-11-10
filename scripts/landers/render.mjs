import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderOaklandPage } from './pages.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

export function writeLanders() {
  // Bay long-form copy lives on the committed HTML from PR 158 (plus Oakland
  // hub links added on this stack). Regenerating it here would wipe that paste.
  const oakland = renderOaklandPage();
  writeFileSync(join(root, 'site/oakland-mobile-carb-test.html'), oakland);
  return { oakland };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  writeLanders();
  console.log('Wrote site/oakland-mobile-carb-test.html');
}
