import { readFile, writeFile } from 'node:fs/promises';

const file = 'ios/App/App.xcodeproj/project.pbxproj';
let source = await readFile(file, 'utf8');
source = source.replaceAll(/CURRENT_PROJECT_VERSION = \d+;/g, 'CURRENT_PROJECT_VERSION = 6;');
source = source.replaceAll(/MARKETING_VERSION = [^;]+;/g, 'MARKETING_VERSION = 1.0.3;');
source = source.replaceAll(/^\s*CODE_SIGN_IDENTITY = "iPhone Developer";\s*$/gm, '');

if (process.env.GITHUB_ACTIONS === 'true') {
  source = source.replaceAll(
    'CODE_SIGN_STYLE = Automatic;',
    'CODE_SIGNING_ALLOWED = NO;\n\t\t\t\tCODE_SIGNING_REQUIRED = NO;\n\t\t\t\tCODE_SIGN_STYLE = Automatic;'
  );
}

if (!source.includes('PRODUCT_BUNDLE_IDENTIFIER = com.storystone.thegirlstripguide;')) {
  throw new Error('Unexpected Girls iOS bundle identifier.');
}
await writeFile(file, source, 'utf8');
console.log('Girls iOS App Store version pinned to 1.0.3 (6); CI archive signing deferred to export.');
