import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('native push dependency is isolated from the locked app dependency graph', async () => {
  const pkg = JSON.parse(await read('package.json'));
  const pushPkg = JSON.parse(await read('.native-push-package/package.json'));
  assert.equal(pushPkg.dependencies['@capacitor/push-notifications'], '8.1.2');
  assert.match(pkg.scripts['native:push:install'], /--prefix \.native-push-package/);
  assert.match(pkg.scripts['native:push:install'], /--package-lock=false/);
  assert.equal(pkg.dependencies['@capacitor/push-notifications'], undefined);
});

test('native push defaults on, preserves explicit opt-out and securely registers the signed-in device', async () => {
  const source = await read('native-push.js');
  assert.match(source, /localStorage\.getItem\(prefKey\) === null/);
  assert.match(source, /localStorage\.setItem\(prefKey, '1'\)/);
  assert.match(source, /localStorage\.setItem\(prefKey, '0'\)/);
  assert.match(source, /ensureDefaultEnabled/);
  assert.match(source, /requestPermissions/);
  assert.match(source, /PushNotifications\.register/);
  assert.match(source, /functions\/v1\/push-register/);
  assert.match(source, /platform === 'ios' \? 'apns'/);
  assert.match(source, /platform === 'android' \? 'fcm'/);
  assert.match(source, /Authorization: `Bearer \$\{token\}`/);
  assert.match(source, /SIGNED_OUT/);
  assert.match(source, /unregisterStored/);
  assert.match(source, /pushNotificationActionPerformed/);
});

test('native payload pins the organiser-cost web release and replaces Web Push with the native bridge', async () => {
  const build = await read('scripts/build-mobile-web.mjs');
  assert.match(build, /13337e72a9762700486c241af181e37170a3c991/);
  assert.match(build, /native-push\.js/);
  assert.match(build, /girls-push-notifications\.js/);
  assert.match(build, /Native payload must not contain/);
});

test('iOS shell forwards APNs registration to Capacitor and declares push entitlement', async () => {
  const delegate = await read('ios/App/App/AppDelegate.swift');
  const entitlements = await read('ios/App/App/App.entitlements');
  const swiftPackage = await read('ios/App/CapApp-SPM/Package.swift');
  assert.match(delegate, /capacitorDidRegisterForRemoteNotifications/);
  assert.match(delegate, /capacitorDidFailToRegisterForRemoteNotifications/);
  assert.match(entitlements, /<key>aps-environment<\/key>/);
  assert.match(swiftPackage, /CapacitorPushNotifications/);
  assert.match(swiftPackage, /\.native-push-package\/node_modules\/@capacitor\/push-notifications/);
});

test('Android shell links isolated Capacitor push and keeps Firebase configuration outside source control', async () => {
  const settings = await read('android/capacitor.settings.gradle');
  const appGradle = await read('android/app/capacitor.build.gradle');
  const buildGradle = await read('android/app/build.gradle');
  assert.match(settings, /\.native-push-package\/node_modules\/@capacitor\/push-notifications\/android/);
  assert.match(appGradle, /capacitor-push-notifications/);
  assert.match(buildGradle, /google-services\.json/);
  await assert.rejects(access(new URL('../../android/app/google-services.json', import.meta.url)));
});

test('native push configuration restores generated plugin references after Capacitor sync', async () => {
  const source = await read('scripts/configure-native-push.mjs');
  assert.match(source, /android\/capacitor\.settings\.gradle/);
  assert.match(source, /android\/app\/capacitor\.build\.gradle/);
  assert.match(source, /ios\/App\/CapApp-SPM\/Package\.swift/);
  assert.match(source, /\.native-push-package/);
});

test('foreground notification presentation is enabled for the native shell', async () => {
  const config = JSON.parse(await read('capacitor.config.json'));
  assert.deepEqual(config.plugins.PushNotifications.presentationOptions, ['badge', 'sound', 'alert']);
});
