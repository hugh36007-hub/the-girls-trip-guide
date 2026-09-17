import { readFile, writeFile } from 'node:fs/promises';

async function replaceOnce(file, needle, replacement) {
  const source = await readFile(file, 'utf8');
  if (source.includes(replacement)) return;
  if (!source.includes(needle)) throw new Error(`Expected native configuration anchor missing in ${file}`);
  await writeFile(file, source.replace(needle, replacement), 'utf8');
}

async function configureIosInfoPlist() {
  const file = 'ios/App/App/Info.plist';
  let source = await readFile(file, 'utf8');

  // Remove any prior GTG-injected permission / URL block wherever it was placed.
  // Older builds inserted this block before the first </dict>, which put it inside
  // UIApplicationSceneManifest instead of the root plist dictionary.
  source = source.replace(
    /\s*<key>NSCameraUsageDescription<\/key>\s*<string>[\s\S]*?<\/string>\s*<key>NSMicrophoneUsageDescription<\/key>\s*<string>[\s\S]*?<\/string>\s*<key>NSPhotoLibraryUsageDescription<\/key>\s*<string>[\s\S]*?<\/string>\s*<key>NSPhotoLibraryAddUsageDescription<\/key>\s*<string>[\s\S]*?<\/string>\s*<key>CFBundleURLTypes<\/key>\s*<array>\s*<dict>[\s\S]*?<key>CFBundleURLSchemes<\/key>\s*<array>[\s\S]*?<\/array>\s*<\/dict>\s*<\/array>\s*/g,
    ''
  );

  // Keep exactly one deterministic status-bar configuration at root level.
  source = source.replace(
    /\s*<key>UIViewControllerBasedStatusBarAppearance<\/key>\s*<(?:true|false)\/>\s*/g,
    ''
  );
  source = source.replace(
    /\s*<key>UIStatusBarStyle<\/key>\s*<string>UIStatusBarStyleLightContent<\/string>\s*/g,
    ''
  );
  source = source.replace(
    /\s*<key>ITSAppUsesNonExemptEncryption<\/key>\s*<(?:true|false)\/>\s*/g,
    ''
  );

  const rootClose = source.lastIndexOf('</dict>');
  if (rootClose < 0 || source.indexOf('<plist') < 0) {
    throw new Error(`Expected plist root dictionary missing in ${file}`);
  }

  const nativeRootBlock = `\n\t<key>NSCameraUsageDescription</key>
\t<string>Add photos and videos to your private trip.</string>
\t<key>NSMicrophoneUsageDescription</key>
\t<string>Record sound when adding a video to your private trip.</string>
\t<key>NSPhotoLibraryUsageDescription</key>
\t<string>Select photos and videos to add to your private trip.</string>
\t<key>NSPhotoLibraryAddUsageDescription</key>
\t<string>Save trip photos and videos to your library when you choose.</string>
\t<key>CFBundleURLTypes</key>
\t<array>
\t\t<dict>
\t\t\t<key>CFBundleURLName</key>
\t\t\t<string>com.storystone.thegirlstripguide</string>
\t\t\t<key>CFBundleURLSchemes</key>
\t\t\t<array>
\t\t\t\t<string>thegirlstripguide</string>
\t\t\t</array>
\t\t</dict>
\t</array>
\t<key>UIViewControllerBasedStatusBarAppearance</key>
\t<false/>
\t<key>UIStatusBarStyle</key>
\t<string>UIStatusBarStyleLightContent</string>
\t<key>ITSAppUsesNonExemptEncryption</key>
\t<false/>\n`;

  source = `${source.slice(0, rootClose)}${nativeRootBlock}${source.slice(rootClose)}`;
  await writeFile(file, source, 'utf8');
}

await replaceOnce(
  'android/app/src/main/AndroidManifest.xml',
  '        </activity>',
  `            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="thegirlstripguide.com" />
                <data android:scheme="https" android:host="www.thegirlstripguide.com" />
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="thegirlstripguide" />
            </intent-filter>
        </activity>`
);

await replaceOnce(
  'android/app/src/main/AndroidManifest.xml',
  '<uses-permission android:name="android.permission.INTERNET" />',
  `<uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />`
);

await configureIosInfoPlist();

const entitlements = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.developer.associated-domains</key>
	<array>
		<string>applinks:thegirlstripguide.com</string>
		<string>applinks:www.thegirlstripguide.com</string>
	</array>
</dict>
</plist>
`;
await writeFile('ios/App/App/App.entitlements', entitlements, 'utf8');

const projectFile = 'ios/App/App.xcodeproj/project.pbxproj';
let project = await readFile(projectFile, 'utf8');
project = project.replaceAll('TARGETED_DEVICE_FAMILY = "1,2";', 'TARGETED_DEVICE_FAMILY = 1;');
if (!project.includes('CODE_SIGN_ENTITLEMENTS = App/App.entitlements;')) {
  project = project.replaceAll(
    'CODE_SIGN_STYLE = Automatic;',
    'CODE_SIGN_ENTITLEMENTS = App/App.entitlements;\n\t\t\t\tCODE_SIGN_STYLE = Automatic;'
  );
}
await writeFile(projectFile, project, 'utf8');

console.log('Applied deterministic iOS and Android native configuration.');

// Keep keyboard resizing after regenerating the Android platform.
await replaceOnce(
  'android/app/src/main/AndroidManifest.xml',
  'android:launchMode="singleTask"',
  'android:launchMode="singleTask"\n            android:windowSoftInputMode="adjustResize"'
);
