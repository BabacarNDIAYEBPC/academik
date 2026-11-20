# Academik Android — signed AAB on Codemagic

This workflow builds a downloadable AAB; it does not submit or release it to Google Play.
The Android package stays `fr.academik.app`. The iOS workflow is unchanged.

## Required one-time Codemagic settings

### 1. Reuse the original upload keystore

In Team settings → Code signing identities → Android keystores, find or import
the **same upload keystore used for the previous Academik Google Play upload**.
Use the reference name `academik_android_upload`, or update the workflow's
`android_signing` reference to its existing name. Enter passwords only in Codemagic.

Do not create a different keystore just because the previous app was rejected.
Compare the upload certificate SHA-256 with the upload certificate shown under
Google Play Console → App integrity. The Google-managed app signing certificate
and the upload certificate may differ: compare the **upload** certificate.
If the original upload key is lost, resolve the upload-key recovery/reset with
Google Play before expecting an update with another key to be accepted.

### Lost key: generate a replacement without Android Studio

The separate workflow **Academik - Create Android upload key** only generates
key material. It does not compile the app, submit a reset request, or change
Google Play's app signing key.

1. In Codemagic Environment variables, create the group `academik_key_recovery`.
2. Add `ACADEMIK_UPLOAD_PASSWORD`, choose a strong password of at least 12
   characters, and check **Secret**. Save it in your password manager as well.
3. On the branch containing this configuration, manually run
   **Academik - Create Android upload key**. No Android signing identity or
   RevenueCat variable is needed for this workflow.
4. Download the three files from Artifacts. The JKS is private: only authorized
   team members should have access to these build artifacts. Keep a durable,
   secure backup of the JKS and the password; do not rely on artifact retention.
5. In Google Play's **upload-key reset** dialog, choose the lost-key reason and
   upload only `upload_certificate.pem`. The `.pem` is a public certificate,
   not the private signing key. Never upload the JKS in this dialog.
6. After Google's approval **and stated activation time**, import the
   matching `academik-upload.jks` under Codemagic Android keystores:
   - Reference: `academik_android_upload`
   - Key alias: `academik-upload`
   - Keystore password and key password: the SAME `ACADEMIK_UPLOAD_PASSWORD`
     chosen in step 2; enter it directly in Codemagic.
7. Resume the normal signed AAB workflow below.

Each run generates a DIFFERENT key and certificate. Run once and keep those
matching files together. Do not rerun after submitting a certificate to Google.
This replaces the **upload key**, not Google's app signing key.

### 2. Create the variable group `academik_android`

Add:

| Name | Value |
| --- | --- |
| `ANDROID_VERSION_CODE` | A positive integer **higher than every version code previously uploaded** to this Play listing, including rejected/test releases. Increment it for each new upload. |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | The **public Google Play SDK key** (`goog_…`) for Academik in RevenueCat. Not the iOS key, Test Store key, or secret API key. |

The build embeds the public SDK key in the app, as required by the RevenueCat SDK.
The Google Play app and its products must also be configured in the same Academik
RevenueCat project for purchases to work; successful compilation does not verify purchases.

Codemagic provides `CM_KEYSTORE_PATH`, `CM_KEYSTORE_PASSWORD`, `CM_KEY_ALIAS`
and `CM_KEY_PASSWORD` from the uploaded keystore. Do not put these values in Git.
The production hostname is configured as `academik.fr`.

## Run and download

1. Select the branch containing this `codemagic.yaml`.
2. Start new build → **Academik Android signed AAB**.
3. After a successful build, open **Artifacts**.
4. Download `academik-<versionCode>.aab`.

The workflow checks settings before installing dependencies, uses pinned pnpm
without the builder's parent Corepack/Yarn configuration, generates Android
from the existing Expo config, applies release signing, builds the release bundle
and verifies its JAR signature.

## Local configuration checks

```sh
node --test artifacts/academik-mobile/scripts/prepare-android-build.test.cjs
```

A successful configuration test is not a native build or proof of Google Play acceptance.
The signed AAB exists only after the Codemagic build has succeeded.
