# Native Store Submission Checklist

## Technical gate

- [x] Native web payload builds with locally bundled Supabase/TUS runtime.
- [x] Native payload contains no service worker.
- [x] Native contract tests pass.
- [x] Android debug APK compiles in the isolated build workflow.
- [x] Android unsigned release AAB compiles in the isolated build workflow.
- [x] iOS simulator build compiles without signing in the isolated build workflow.
- [x] iOS simulator installs and launches in the automated smoke test.
- [ ] Universal Links and Android App Links verified after owner identifiers exist.
- [ ] OTP, session restoration, multi-trip selection and sign-out tested on real devices.
- [ ] Photo/video picker, large upload interruption and resume tested on real devices.
- [ ] Evidence and Hidden Gallery tested in portrait and landscape.
- [x] Existing Girls release and product-isolation tests pass in the native build gate.

## Apple owner actions

- [ ] Enrol Storystone Ltd in Apple Developer Program and pay the annual membership.
- [ ] Complete organization/D-U-N-S verification if requested.
- [ ] Accept current agreements and provide required 2FA.
- [ ] Create the App Store Connect app for `com.storystone.thegirlstripguide`.
- [ ] Provide Apple Team ID for `apple-app-site-association`.
- [ ] Authorise distribution certificate/profile or App Store Connect API key.
- [ ] Approve TestFlight external testing and final submission.

## Google owner actions

- [ ] Create and pay for the Google Play Console account.
- [ ] Complete personal/organization identity verification.
- [ ] Create the Play app for `com.storystone.thegirlstripguide`.
- [ ] Enrol in Play App Signing and provide the release certificate SHA-256 fingerprint.
- [ ] Accept current agreements and complete required tester declaration.
- [ ] Approve closed testing and final publication.

## Store material

- [ ] App Store listing copy reviewed.
- [ ] Google Play listing copy reviewed.
- [ ] Real product screenshots captured at current required sizes.
- [ ] App Privacy answers checked against production data handling.
- [ ] Play Data Safety answers checked against production data handling.
- [x] In-app account deletion request implemented and contract-tested.
- [ ] Publish `delete-account.html` at `https://thegirlstripguide.com/delete-account` after approval to update production.
- [x] UGC reporting/blocking implemented for native group chat, direct messages, media threads and media uploads.
- [ ] Review account and reviewer instructions verified.

## Publication rule

Do not submit or expose a native purchase CTA until the current store-policy implementation has been reviewed against the final account region, distribution terms and product classification.
