# The Girls Trip Guide - Native App Handover

## Status

Active development branch: `native-app-isolated`.

Production branch and Cloudflare Worker are not changed by native builds.

## Architecture

- One authoritative Girls HTML/CSS/JavaScript core.
- Capacitor 8 provides thin iOS and Android shells.
- Native-only behaviour lives in `native-app.js`, `native-url.js` and `native-app.css`.
- `scripts/build-mobile-web.mjs` creates a native payload without a service worker.
- Supabase JS and TUS are bundled locally in the native payload; the web deployment remains unchanged.

## Identifiers

- App name: `The Girls Trip Guide`
- Bundle/application ID: `com.storystone.thegirlstripguide`
- Custom URL scheme: `thegirlstripguide://`
- Universal/App Link domains: `thegirlstripguide.com`, `www.thegirlstripguide.com`

## Commands

```bash
npm ci
npm run mobile:prepare
npm run mobile:sync
npm run test:native
```

Android debug build:

```bash
cd android
./gradlew assembleDebug
```

Android release bundle awaiting the owner's Play signing identity:

```bash
cd android
./gradlew bundleRelease
```

iOS simulator build:

```bash
xcodebuild -project ios/App/App.xcodeproj -scheme App -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
```

## Native plugins

- App: lifecycle, cold-start URL, open-app URL and Android Back.
- Browser: secure external destinations.
- Keyboard: resize and keyboard-safe navigation.
- Network: clear connection/reconnect state.
- Splash Screen and Status Bar: native launch presentation.

## Authentication and security boundary

The existing Supabase email OTP flow, persistent session, token refresh and RLS remain authoritative. The native shell does not contain a service-role key or Stripe secret. Native lifecycle events request reconciliation through app events; they do not bypass Supabase or cache private API responses in a service worker.

## Deep links

Only HTTPS links on the production Girls domains and the approved app, invitation and trip paths are admitted. Existing query parameters and fragments are passed to the shared runtime unchanged. Android intent filters and iOS associated domains are generated in the native projects.

The production association files still require the final Apple Team ID and release certificate SHA-256 fingerprint. Do not publish guessed values.

## Full Trip / Stripe boundary

- Existing Full Trip entitlements continue to come from Supabase.
- Existing purchases are recognised after sign-in.
- No Stripe secret or embedded Stripe SDK exists in the native shell.
- Native checkout actions are blocked until the current Apple/Google policy route is finalised.
- The web checkout and £24.99 one-off product remain unchanged.

## Safety and account controls

- Native group chat, direct messages, media conversations and media uploads expose Report and Block controls.
- Blocking immediately hides that member's messages on the device.
- Reports are sent through the Girls support intake from a verified signed-in app session with trip/content IDs and the selected reason.
- My details includes a confirmed in-app account deletion request.
- Organiser accounts are manually transferred or closed before deletion because active shared trips must not be orphaned.
- `delete-account.html` is the store-facing deletion resource; it must be published at the canonical production URL before Play submission.

## Owner-only blockers

- Apple Developer enrolment, legal agreements, team selection and 2FA.
- App Store Connect access, distribution signing and final submission approval.
- Google Play Console enrolment, verification, Play App Signing and final publication approval.
- Final Apple Team ID and Android release certificate fingerprint for verified association files.

See `STORE_SUBMISSION_CHECKLIST.md` for the exact submission sequence.
