const { test } = require("node:test");
const assert = require("node:assert/strict");
const { validateSettings, addSigningConfig } = require("./prepare-android-build.cjs");

// Fixtures only. These are not credentials or real RevenueCat keys.
const settings = {
  ANDROID_VERSION_CODE: "42",
  EXPO_PUBLIC_DOMAIN: "example.invalid",
  EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: "goog_ExamplePublicKey",
  CM_KEYSTORE_PATH: "/fixture/upload.jks",
  CM_KEYSTORE_PASSWORD: "fixture",
  CM_KEY_ALIAS: "fixture",
  CM_KEY_PASSWORD: "fixture",
};
const app = { expo: { android: { package: "fr.academik.app" } } };

test("accepts complete settings without mutating the app config", () => {
  assert.equal(validateSettings(settings, app, () => true), 42);
  assert.equal(app.expo.android.versionCode, undefined);
});

test("preserves the existing Google Play package", () => {
  assert.throws(() => validateSettings(settings, {
    expo: { android: { package: "some.other.app" } },
  }, () => true), /package must remain/);
});

test("rejects missing, invalid and out-of-range version codes", () => {
  for (const value of ["", "0", "-1", "1.5", "1e2", "0042", "2100000001", "NaN"]) {
    assert.throws(() => validateSettings({
      ...settings, ANDROID_VERSION_CODE: value,
    }, app, () => true), /ANDROID_VERSION_CODE/);
  }
  assert.equal(validateSettings({
    ...settings, ANDROID_VERSION_CODE: "2100000000",
  }, app, () => true), 2100000000);
});

test("rejects non-Android RevenueCat keys", () => {
  for (const value of ["", "appl_example", "test_example", "sk_example"]) {
    assert.throws(() => validateSettings({
      ...settings, EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: value,
    }, app, () => true), /PUBLIC Google Play SDK key/);
  }
});

test("rejects malformed production hostnames", () => {
  for (const value of ["", "https://example.invalid", "example.invalid/api", "bad host"]) {
    assert.throws(() => validateSettings({
      ...settings, EXPO_PUBLIC_DOMAIN: value,
    }, app, () => true), /production hostname/);
  }
});

test("requires all signing settings and the existing keystore file", () => {
  for (const name of ["CM_KEYSTORE_PATH", "CM_KEYSTORE_PASSWORD", "CM_KEY_ALIAS", "CM_KEY_PASSWORD"]) {
    assert.throws(() => validateSettings({
      ...settings, [name]: "",
    }, app, () => true), new RegExp(`Missing ${name}`));
  }
  assert.throws(() => validateSettings(settings, app, () => false), /does not exist/);
});

test("applies release signing once and does not write credential values", () => {
  const original = "android { buildTypes { release {} } }\n";
  const configured = addSigningConfig(original);
  assert.equal(addSigningConfig(configured), configured);
  assert.ok(configured.startsWith(original));
  assert.match(configured, /apply from: "\.\.\/\.\.\/scripts\/codemagic-android-signing.gradle"/);
  assert.ok(!configured.includes("CM_KEYSTORE_PASSWORD"));
});
