import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderBayPage, renderOaklandPage } from './pages.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

export function writeLanders() {
  const bay = renderBayPage();
  const oakland = renderOaklandPage();
  writeFileSync(join(root, 'site/bay-area-mobile-carb.html'), bay);
  writeFileSync(join(root, 'site/oakland-mobile-carb-test.html'), oakland);
  return { bay, oakland };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  writeLanders();
  console.log('Wrote site/bay-area-mobile-carb.html and site/oakland-mobile-carb-test.html');
}
