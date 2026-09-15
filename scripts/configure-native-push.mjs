import { readFile, writeFile } from 'node:fs/promises';

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

const androidSettings = await readFile('android/capacitor.settings.gradle', 'utf8');
if (!androidSettings.includes("include ':capacitor-push-notifications'")) {
  throw new Error('Android Capacitor push module is missing.');
}

const swiftPackage = await readFile('ios/App/CapApp-SPM/Package.swift', 'utf8');
if (!swiftPackage.includes('CapacitorPushNotifications')) {
  throw new Error('iOS Capacitor push package is missing.');
}

console.log('Applied deterministic native push configuration.');
