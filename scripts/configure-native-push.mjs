import { readFile, writeFile } from 'node:fs/promises';

async function ensureText(file, token, insertBefore, addition) {
  let source = await readFile(file, 'utf8');
  if (source.includes(token)) return;
  if (!source.includes(insertBefore)) throw new Error(`Expected native push anchor missing in ${file}`);
  source = source.replace(insertBefore, `${addition}${insertBefore}`);
  await writeFile(file, source, 'utf8');
}

const apnsEnvironment = process.env.NATIVE_PUSH_APNS_ENVIRONMENT || 'development';
if (!['development', 'production'].includes(apnsEnvironment)) {
  throw new Error(`Unsupported NATIVE_PUSH_APNS_ENVIRONMENT: ${apnsEnvironment}`);
}

const entitlementsPath = 'ios/App/App/App.entitlements';
let entitlements = await readFile(entitlementsPath, 'utf8');
entitlements = entitlements.replace(/\s*<key>aps-environment<\/key>\s*<string>(?:development|production)<\/string>\s*/g, '\n');
const dictOpen = '<dict>';
if (!entitlements.includes(dictOpen)) throw new Error('iOS entitlements dictionary is missing.');
entitlements = entitlements.replace(
  dictOpen,
  `${dictOpen}\n\t<key>aps-environment</key>\n\t<string>${apnsEnvironment}</string>`
);
await writeFile(entitlementsPath, entitlements, 'utf8');

const projectPath = 'ios/App/App.xcodeproj/project.pbxproj';
let project = await readFile(projectPath, 'utf8');
if (!project.includes('CODE_SIGN_ENTITLEMENTS = App/App.entitlements;')) {
  throw new Error('iOS target is not configured to sign App.entitlements.');
}
if (!project.includes('com.apple.Push = {')) {
  const targetAnchor = '\t\t\t\t\t\tProvisioningStyle = Automatic;\n\t\t\t\t\t};';
  if (!project.includes(targetAnchor)) throw new Error('iOS target capability anchor is missing.');
  project = project.replace(
    targetAnchor,
    `\t\t\t\t\t\tProvisioningStyle = Automatic;\n\t\t\t\t\t\tSystemCapabilities = {\n\t\t\t\t\t\t\tcom.apple.AssociatedDomains = {\n\t\t\t\t\t\t\t\tenabled = 1;\n\t\t\t\t\t\t\t};\n\t\t\t\t\t\t\tcom.apple.Push = {\n\t\t\t\t\t\t\t\tenabled = 1;\n\t\t\t\t\t\t\t};\n\t\t\t\t\t\t};\n\t\t\t\t\t};`
  );
  await writeFile(projectPath, project, 'utf8');
}

const delegate = await readFile('ios/App/App/AppDelegate.swift', 'utf8');
for (const token of [
  'capacitorDidRegisterForRemoteNotifications',
  'capacitorDidFailToRegisterForRemoteNotifications'
]) {
  if (!delegate.includes(token)) throw new Error(`Missing iOS native push bridge: ${token}`);
}

const androidBuild = await readFile('android/app/build.gradle', 'utf8');
if (!androidBuild.includes('com.google.gms.google-services')) {
  throw new Error('Android Google Services hook is missing.');
}

await ensureText(
  'android/capacitor.settings.gradle',
  "include ':capacitor-push-notifications'",
  "include ':capacitor-splash-screen'",
  "include ':capacitor-push-notifications'\nproject(':capacitor-push-notifications').projectDir = new File('../.native-push-package/node_modules/@capacitor/push-notifications/android')\n\n"
);
await ensureText(
  'android/app/capacitor.build.gradle',
  "implementation project(':capacitor-push-notifications')",
  "    implementation project(':capacitor-splash-screen')",
  "    implementation project(':capacitor-push-notifications')\n"
);
await ensureText(
  'ios/App/CapApp-SPM/Package.swift',
  '.package(name: "CapacitorPushNotifications"',
  '        .package(name: "CapacitorSplashScreen"',
  '        .package(name: "CapacitorPushNotifications", path: "../../../.native-push-package/node_modules/@capacitor/push-notifications"),\n'
);
await ensureText(
  'ios/App/CapApp-SPM/Package.swift',
  '.product(name: "CapacitorPushNotifications"',
  '                .product(name: "CapacitorSplashScreen"',
  '                .product(name: "CapacitorPushNotifications", package: "CapacitorPushNotifications"),\n'
);

const androidSettings = await readFile('android/capacitor.settings.gradle', 'utf8');
if (!androidSettings.includes('../.native-push-package/node_modules/@capacitor/push-notifications/android')) {
  throw new Error('Android Capacitor push module path is wrong.');
}
const swiftPackage = await readFile('ios/App/CapApp-SPM/Package.swift', 'utf8');
if (!swiftPackage.includes('../../../.native-push-package/node_modules/@capacitor/push-notifications')) {
  throw new Error('iOS Capacitor push package path is wrong.');
}

console.log(`Applied deterministic native push configuration (${apnsEnvironment} APNs).`);
