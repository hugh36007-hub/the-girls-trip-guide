import { readFile, writeFile } from 'node:fs/promises';

async function replaceOnce(file, needle, replacement) {
  const source = await readFile(file, 'utf8');
  if (source.includes(replacement)) return;
  if (!source.includes(needle)) throw new Error(`Expected native configuration anchor missing in ${file}`);
  await writeFile(file, source.replace(needle, replacement), 'utf8');
}

async function insertBeforeLastClosingDict(file, sentinel, block) {
  const source = await readFile(file, 'utf8');
  if (source.includes(sentinel)) return;
  const index = source.lastIndexOf('</dict>');
  if (index < 0) throw new Error(`Expected plist closing dictionary missing in ${file}`);
  await writeFile(file, `${source.slice(0, index)}${block}${source.slice(index)}`, 'utf8');
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

await insertBeforeLastClosingDict(
  'ios/App/App/Info.plist',
  '<key>UIStatusBarStyle</key>',
  `\t<key>UIViewControllerBasedStatusBarAppearance</key>
\t<false/>
\t<key>UIStatusBarStyle</key>
\t<string>UIStatusBarStyleLightContent</string>
`
);

await replaceOnce(
  'android/app/src/main/AndroidManifest.xml',
  '<uses-permission android:name="android.permission.INTERNET" />',
  `<uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />`
);

await replaceOnce(
  'ios/App/App/Info.plist',
  '</dict>',
  `	<key>NSCameraUsageDescription</key>
	<string>Add photos and videos to your private trip.</string>
	<key>NSMicrophoneUsageDescription</key>
	<string>Record sound when adding a video to your private trip.</string>
	<key>NSPhotoLibraryUsageDescription</key>
	<string>Select photos and videos to add to your private trip.</string>
	<key>NSPhotoLibraryAddUsageDescription</key>
	<string>Save trip photos and videos to your library when you choose.</string>
	<key>CFBundleURLTypes</key>
	<array>
		<dict>
			<key>CFBundleURLName</key>
			<string>com.storystone.thegirlstripguide</string>
			<key>CFBundleURLSchemes</key>
			<array><string>thegirlstripguide</string></array>
		</dict>
	</array>
</dict>`
);

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
