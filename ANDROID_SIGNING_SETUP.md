# Girls Trip Guide Android upload signing

This signing path is isolated to `native-app-isolated` and does not require any keystore or password to be committed to Git.

## Package identity

- App: `The Girls Trip Guide`
- Android package: `com.storystone.thegirlstripguide`
- First release version: `versionCode 1`, `versionName 1.0`

## Required GitHub Actions secrets

Create these repository Actions secrets before running the `Android signed release` workflow:

- `GTG_ANDROID_UPLOAD_KEYSTORE_BASE64`
- `GTG_ANDROID_UPLOAD_KEYSTORE_PASSWORD`
- `GTG_ANDROID_UPLOAD_KEY_ALIAS`
- `GTG_ANDROID_UPLOAD_KEY_PASSWORD`

Never commit the `.jks`/`.keystore` file or passwords. Both extensions are blocked by `.gitignore`.

## Generate the upload key on Windows

Use Java `keytool` locally. Keep the generated file in a secure offline location and back it up separately.

```powershell
keytool -genkeypair -v -keystore girls-trip-guide-upload.jks -keyalg RSA -keysize 4096 -validity 10000 -alias girls-trip-guide-upload
```

Record the keystore password and key password in the organisation password manager. The alias from the example command is `girls-trip-guide-upload`.

## Convert the keystore to base64 for GitHub Actions

From PowerShell in the folder containing the keystore:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("$PWD\girls-trip-guide-upload.jks")) | Set-Clipboard
```

Paste the clipboard value into `GTG_ANDROID_UPLOAD_KEYSTORE_BASE64`.

## Build the signed AAB

In GitHub Actions, manually run the workflow named `Android signed release` on `native-app-isolated`.

The workflow:

1. Materializes the upload keystore only on the temporary GitHub runner.
2. Validates the keystore and alias.
3. Rebuilds the native payload and Android project.
4. Runs the native and release guard tests.
5. Verifies the package identity.
6. Builds `app-release.aab` using the upload key.
7. Verifies the AAB signature with `jarsigner`.
8. Uploads the artifact as `girls-trip-guide-android-release-signed`.
9. Deletes the temporary keystore from the runner.

Google Play App Signing should hold the final app-signing key. This local key is the upload key used to authenticate releases submitted by Storystone.
