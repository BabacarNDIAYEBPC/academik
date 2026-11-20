#!/usr/bin/env bash
# Run manually in the dedicated Codemagic recovery workflow, never on every build.
set +x
set -euo pipefail
umask 077

if [ -z "${ACADEMIK_UPLOAD_PASSWORD:-}" ]; then
  echo "Add ACADEMIK_UPLOAD_PASSWORD as a Secret in the academik_key_recovery Codemagic group." >&2
  exit 1
fi
if [ "${#ACADEMIK_UPLOAD_PASSWORD}" -lt 12 ]; then
  echo "Choose an upload-key password of at least 12 characters in Codemagic." >&2
  exit 1
fi
command -v keytool >/dev/null || { echo "Java keytool is unavailable. Use the workflow with Java 17." >&2; exit 1; }
: "${CM_BUILD_DIR:?Run this script in a Codemagic build checkout.}"
OUTPUT="$CM_BUILD_DIR/generated-artifacts/academik-upload-key"
if [ -e "$OUTPUT" ]; then
  echo "Output directory already exists. Refusing to overwrite previously generated key material." >&2
  exit 1
fi
mkdir -p "$OUTPUT"
SUCCESS=false
cleanup() {
  if [ "$SUCCESS" != true ]; then
    rm -f "$OUTPUT/academik-upload.jks" "$OUTPUT/upload_certificate.pem" "$OUTPUT/certificate-fingerprints.txt"
  fi
}
trap cleanup EXIT

# The password is read from the environment by keytool, not placed in argv/logs.
# Store and private-key passwords are the SAME. Alias: academik-upload.
keytool -genkeypair -noprompt \
  -keystore "$OUTPUT/academik-upload.jks" \
  -storetype JKS -alias academik-upload \
  -keyalg RSA -keysize 3072 -validity 10000 \
  -dname "CN=Academik Upload" \
  -storepass:env ACADEMIK_UPLOAD_PASSWORD \
  -keypass:env ACADEMIK_UPLOAD_PASSWORD

keytool -exportcert -rfc \
  -keystore "$OUTPUT/academik-upload.jks" \
  -alias academik-upload \
  -storepass:env ACADEMIK_UPLOAD_PASSWORD \
  -file "$OUTPUT/upload_certificate.pem"

keytool -list -keystore "$OUTPUT/academik-upload.jks" \
  -alias academik-upload -storepass:env ACADEMIK_UPLOAD_PASSWORD >/dev/null

keytool -J-Duser.language=en -J-Duser.country=US -printcert \
  -file "$OUTPUT/upload_certificate.pem" > "$OUTPUT/certificate-fingerprints.txt"

test -s "$OUTPUT/academik-upload.jks"
test -s "$OUTPUT/upload_certificate.pem"
test -s "$OUTPUT/certificate-fingerprints.txt"
SUCCESS=true
echo "Created one upload key and its public certificate. Alias: academik-upload."
echo "Download and securely back up academik-upload.jks. Both passwords are the Codemagic Secret you supplied."
echo "Upload ONLY upload_certificate.pem to the Google Play upload-key reset request."
echo "Do not generate another key after submitting that certificate. Wait for Google's activation before using it for updates."
