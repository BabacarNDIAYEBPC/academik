# Academik Android — signed AAB on Codemagic

This workflow builds a downloadable AAB; it does not submit or release it to Google Play.
The Android package stays `fr.academik.app`. The iOS workflow is unchanged.

## Required one-time Codemagic settings

### 1. Supply the upload keystore as a Secret

The AAB workflow deliberately does **not** use `android_signing` identities:
Codemagic's keystore upload form failed for the owner. Instead it restores the
existing JKS from a Base64 Secret. This does not generate or replace a key.

On Windows, open PowerShell in the folder containing the current
`academik-upload.jks`, then run:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path (Get-Location) 'academik-upload.jks'))) | Set-Clipboard
```

This copies the encoded JKS directly to the clipboard, not to console output.
In Academik's Codemagic **Environment variables**, add:

- Name: `ACADEMIK_UPLOAD_KEYSTORE_BASE64`
- Value: paste from the clipboard.
- Group: `Acadamik_Android` (case-sensitive; use the existing group, including its spelling).
- **Secret: checked**.

Keep `ACADEMIK_UPLOAD_PASSWORD` in group `academik_key_recovery` unchanged:
it must be the password used to generate this exact JKS. Both groups are loaded
by the AAB workflow. For the generated replacement, alias is `academik-upload`
and key password equals store password. Never paste the Base64 into chat, Git,
an online converter, or a public variable. Base64 is NOT encryption. Clear the
clipboard and any clipboard history entry afterwards.

Before dependencies are installed, the workflow checks Base64/JKS format and
uses Java keytool to verify the password and alias. The JKS is restored outside
the checkout with owner-only permissions and is not an artifact. Only its
temporary path and alias are exported via `CM_ENV`; passwords stay in Secrets.

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
6. Supply the matching JKS through the Base64 Secret above. You can compile
   the AAB before Google activates the replacement, but Google will not accept
   uploads with the new key until approval **and the stated activation time**.
7. Resume the normal signed AAB workflow below. Do not regenerate the key.

Each run generates a DIFFERENT key and certificate. Run once and keep those
matching files together. Do not rerun after submitting a certificate to Google.
This replaces the **upload key**, not Google's app signing key.

### 2. Use the existing variable group `Acadamik_Android`

Add:

| Name | Value |
| --- | --- |
| `ANDROID_VERSION_CODE` | A positive integer **higher than every version code previously uploaded** to this Play listing, including rejected/test releases. Increment it for each new upload. |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | The **public Google Play SDK key** (`goog_…`) for Academik in RevenueCat. Not the iOS key, Test Store key, or secret API key. |

The build embeds the public SDK key in the app, as required by the RevenueCat SDK.
The Google Play app and its products must also be configured in the same Academik
RevenueCat project for purchases to work; successful compilation does not verify purchases.

The restoration step provides `CM_KEYSTORE_PATH` and `CM_KEY_ALIAS`.
Release signing reads the generation password directly from
`ACADEMIK_UPLOAD_PASSWORD`. Do not put signing credentials in Git.
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
node --test artifacts/academik-mobile/scripts/restore-android-keystore.test.cjs
```

A successful configuration test is not a native build or proof of Google Play acceptance.
The signed AAB exists only after the Codemagic build has succeeded.
