import { readFile, writeFile } from 'node:fs/promises';

const file = 'ios/App/App.xcodeproj/project.pbxproj';
let source = await readFile(file, 'utf8');
source = source.replaceAll(/CURRENT_PROJECT_VERSION = \d+;/g, 'CURRENT_PROJECT_VERSION = 4;');
source = source.replaceAll(/MARKETING_VERSION = [^;]+;/g, 'MARKETING_VERSION = 1.0.3;');
if (!source.includes('PRODUCT_BUNDLE_IDENTIFIER = com.storystone.thegirlstripguide;')) {
  throw new Error('Unexpected Girls iOS bundle identifier.');
}
await writeFile(file, source, 'utf8');
console.log('Girls iOS App Store version pinned to 1.0.3 (4).');
