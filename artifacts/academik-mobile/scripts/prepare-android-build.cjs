const fs = require("node:fs");
const path = require("node:path");

const APP_DIR = path.resolve(__dirname, "..");
const PACKAGE_NAME = "fr.academik.app";
const SIGNING_MARKER = "// Academik Codemagic release signing";

function validateSettings(env, app, exists = fs.existsSync) {
  if (app.expo?.android?.package !== PACKAGE_NAME) {
    throw new Error(`Android package must remain ${PACKAGE_NAME}.`);
  }
  const rawCode = env.ANDROID_VERSION_CODE || "";
  const versionCode = Number(rawCode);
  if (!/^[1-9]\d*$/.test(rawCode) || !Number.isSafeInteger(versionCode) || versionCode > 2100000000) {
    throw new Error(
      "Set ANDROID_VERSION_CODE in the academik_android Codemagic group to an integer " +
      "between 1 and 2100000000, higher than every version already uploaded to Google Play.",
    );
  }
  if (!env.EXPO_PUBLIC_DOMAIN || /[:/\s]/.test(env.EXPO_PUBLIC_DOMAIN)) {
    throw new Error("Set EXPO_PUBLIC_DOMAIN to the production hostname without https:// or a path.");
  }
  if (!/^goog_[A-Za-z0-9]+$/.test(env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || "")) {
    throw new Error(
      "Set EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY to the PUBLIC Google Play SDK key " +
      "from the Academik RevenueCat project (goog_...). Do not use an Apple, test, or secret API key.",
    );
  }
  for (const name of ["CM_KEYSTORE_PATH", "CM_KEYSTORE_PASSWORD", "CM_KEY_ALIAS", "CM_KEY_PASSWORD"]) {
    if (!env[name]) {
      throw new Error(
        `Missing ${name}. Configure the existing Google Play upload keystore in ` +
        "Codemagic Android keystores with reference academik_android_upload.",
      );
    }
  }
  if (!exists(env.CM_KEYSTORE_PATH)) {
    throw new Error("The Android upload keystore file provided by Codemagic does not exist.");
  }
  return versionCode;
}

function addSigningConfig(gradle) {
  if (gradle.includes(SIGNING_MARKER)) return gradle;
  return `${gradle}\n${SIGNING_MARKER}\napply from: "../../scripts/codemagic-android-signing.gradle"\n`;
}

function main(command) {
  const appFile = path.join(APP_DIR, "app.json");
  const app = JSON.parse(fs.readFileSync(appFile, "utf8"));
  const versionCode = validateSettings(process.env, app);
  if (command === "validate") {
    // Only the ephemeral Codemagic checkout is changed, before Expo prebuild.
    app.expo.android.versionCode = versionCode;
    fs.writeFileSync(appFile, `${JSON.stringify(app, null, 2)}\n`);
    console.log(`Android settings validated: ${PACKAGE_NAME}, version code ${versionCode}.`);
  } else if (command === "signing") {
    const gradleFile = path.join(APP_DIR, "android", "app", "build.gradle");
    fs.writeFileSync(gradleFile, addSigningConfig(fs.readFileSync(gradleFile, "utf8")));
    console.log("Release signing configured with the Codemagic upload keystore.");
  } else {
    throw new Error("Usage: node scripts/prepare-android-build.cjs validate|signing");
  }
}

if (require.main === module) {
  try {
    main(process.argv[2]);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { validateSettings, addSigningConfig };
