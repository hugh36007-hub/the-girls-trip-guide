import { readFile, writeFile } from 'node:fs/promises';

const privacyManifest = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>NSPrivacyTracking</key>
	<false/>
	<key>NSPrivacyTrackingDomains</key>
	<array/>
	<key>NSPrivacyCollectedDataTypes</key>
	<array>
		<dict>
			<key>NSPrivacyCollectedDataType</key>
			<string>NSPrivacyCollectedDataTypeName</string>
			<key>NSPrivacyCollectedDataTypeLinked</key>
			<true/>
			<key>NSPrivacyCollectedDataTypeTracking</key>
			<false/>
			<key>NSPrivacyCollectedDataTypePurposes</key>
			<array><string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string></array>
		</dict>
		<dict>
			<key>NSPrivacyCollectedDataType</key>
			<string>NSPrivacyCollectedDataTypeEmailAddress</string>
			<key>NSPrivacyCollectedDataTypeLinked</key>
			<true/>
			<key>NSPrivacyCollectedDataTypeTracking</key>
			<false/>
			<key>NSPrivacyCollectedDataTypePurposes</key>
			<array><string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string></array>
		</dict>
		<dict>
			<key>NSPrivacyCollectedDataType</key>
			<string>NSPrivacyCollectedDataTypePhoneNumber</string>
			<key>NSPrivacyCollectedDataTypeLinked</key>
			<true/>
			<key>NSPrivacyCollectedDataTypeTracking</key>
			<false/>
			<key>NSPrivacyCollectedDataTypePurposes</key>
			<array><string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string></array>
		</dict>
		<dict>
			<key>NSPrivacyCollectedDataType</key>
			<string>NSPrivacyCollectedDataTypePhysicalAddress</string>
			<key>NSPrivacyCollectedDataTypeLinked</key>
			<true/>
			<key>NSPrivacyCollectedDataTypeTracking</key>
			<false/>
			<key>NSPrivacyCollectedDataTypePurposes</key>
			<array><string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string></array>
		</dict>
		<dict>
			<key>NSPrivacyCollectedDataType</key>
			<string>NSPrivacyCollectedDataTypeUserID</string>
			<key>NSPrivacyCollectedDataTypeLinked</key>
			<true/>
			<key>NSPrivacyCollectedDataTypeTracking</key>
			<false/>
			<key>NSPrivacyCollectedDataTypePurposes</key>
			<array><string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string></array>
		</dict>
		<dict>
			<key>NSPrivacyCollectedDataType</key>
			<string>NSPrivacyCollectedDataTypePurchaseHistory</string>
			<key>NSPrivacyCollectedDataTypeLinked</key>
			<true/>
			<key>NSPrivacyCollectedDataTypeTracking</key>
			<false/>
			<key>NSPrivacyCollectedDataTypePurposes</key>
			<array><string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string></array>
		</dict>
		<dict>
			<key>NSPrivacyCollectedDataType</key>
			<string>NSPrivacyCollectedDataTypePhotosorVideos</string>
			<key>NSPrivacyCollectedDataTypeLinked</key>
			<true/>
			<key>NSPrivacyCollectedDataTypeTracking</key>
			<false/>
			<key>NSPrivacyCollectedDataTypePurposes</key>
			<array><string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string></array>
		</dict>
		<dict>
			<key>NSPrivacyCollectedDataType</key>
			<string>NSPrivacyCollectedDataTypeOtherUserContent</string>
			<key>NSPrivacyCollectedDataTypeLinked</key>
			<true/>
			<key>NSPrivacyCollectedDataTypeTracking</key>
			<false/>
			<key>NSPrivacyCollectedDataTypePurposes</key>
			<array><string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string></array>
		</dict>
	</array>
	<key>NSPrivacyAccessedAPITypes</key>
	<array/>
</dict>
</plist>
`;

await writeFile('ios/App/App/PrivacyInfo.xcprivacy', privacyManifest, 'utf8');

const projectFile = 'ios/App/App.xcodeproj/project.pbxproj';
let project = await readFile(projectFile, 'utf8');
if (!project.includes('B7A100000000000000000001 /* PrivacyInfo.xcprivacy in Resources */')) {
  project = project.replace(
    '/* Begin PBXBuildFile section */',
    '/* Begin PBXBuildFile section */\n\t\tB7A100000000000000000001 /* PrivacyInfo.xcprivacy in Resources */ = {isa = PBXBuildFile; fileRef = B7A100000000000000000000 /* PrivacyInfo.xcprivacy */; };'
  );
  project = project.replace(
    '/* Begin PBXFileReference section */',
    '/* Begin PBXFileReference section */\n\t\tB7A100000000000000000000 /* PrivacyInfo.xcprivacy */ = {isa = PBXFileReference; lastKnownFileType = text.xml; path = PrivacyInfo.xcprivacy; sourceTree = "<group>"; };'
  );
  project = project.replace(
    '\t\t\tchildren = (\n\t\t\t\t9582B6822FE993A50072D4E8 /* SceneDelegate.swift */,',
    '\t\t\tchildren = (\n\t\t\t\tB7A100000000000000000000 /* PrivacyInfo.xcprivacy */,\n\t\t\t\t9582B6822FE993A50072D4E8 /* SceneDelegate.swift */,'
  );
  project = project.replace(
    '\t\t\tfiles = (\n\t\t\t\t504EC3121FED79650016851F /* LaunchScreen.storyboard in Resources */,',
    '\t\t\tfiles = (\n\t\t\t\tB7A100000000000000000001 /* PrivacyInfo.xcprivacy in Resources */,\n\t\t\t\t504EC3121FED79650016851F /* LaunchScreen.storyboard in Resources */,'
  );
}
if (!project.includes('PrivacyInfo.xcprivacy in Resources')) {
  throw new Error('Privacy manifest was not attached to the iOS app target.');
}
await writeFile(projectFile, project, 'utf8');

console.log('Girls iOS privacy manifest is packaged in the app target.');
