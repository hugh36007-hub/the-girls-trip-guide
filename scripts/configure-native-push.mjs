import { readFile, writeFile } from 'node:fs/promises';

async function ensureText(file, token, insertBefore, addition) {
  let source = await readFile(file, 'utf8');
  if (source.includes(token)) return;
  if (!source.includes(insertBefore)) throw new Error(`Expected native push anchor missing in ${file}`);
  source = source.replace(insertBefore, `${addition}${insertBefore}`);
  await writeFile(file, source, 'utf8');
}

const entitlementsPath = 'ios/App/App/App.entitlements';
let entitlements = await readFile(entitlementsPath, 'utf8');
entitlements = entitlements.replace(/\s*<key>aps-environment<\/key>\s*<string>(?:development|production)<\/string>\s*/g, '\n');
const dictOpen = '<dict>';
if (!entitlements.includes(dictOpen)) throw new Error('iOS entitlements dictionary is missing.');
entitlements = entitlements.replace(
  dictOpen,
  `${dictOpen}\n\t<key>aps-environment</key>\n\t<string>development</string>`
);
await writeFile(entitlementsPath, entitlements, 'utf8');

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

console.log('Applied deterministic native push configuration.');
