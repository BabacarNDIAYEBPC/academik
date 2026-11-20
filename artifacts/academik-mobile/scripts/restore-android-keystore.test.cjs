const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { decodeKeystore, restore } = require("./restore-android-keystore.cjs");

// Synthetic header only: no real private key or password.
const fixture = Buffer.from("feedfeed0000000200000000", "hex");
test("accepts wrapped Base64 and rejects empty, malformed or non-JKS input", () => {
  assert.deepEqual(decodeKeystore(`\n${fixture.toString("base64")}\r\n`), fixture);
  for (const value of ["", "bad!", "UEsDBAo=", "-----BEGIN CERTIFICATE-----"]) {
    assert.throws(() => decodeKeystore(value));
  }
});

test("restores privately, validates before exporting, and never exports passwords", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "academik-restore-test-"));
  try {
    const envFile = path.join(root, "environment");
    fs.writeFileSync(envFile, "");
    const env = {
      CM_ENV: envFile,
      ACADEMIK_UPLOAD_KEYSTORE_BASE64: fixture.toString("base64"),
      ACADEMIK_UPLOAD_PASSWORD: "synthetic-test-password",
    };
    const file = restore(env, (command, args, options) => {
      assert.equal(command, "keytool");
      assert.ok(!args.includes(env.ACADEMIK_UPLOAD_PASSWORD));
      assert.equal(options.stdio, "ignore");
      assert.deepEqual(fs.readFileSync(args[args.indexOf("-keystore") + 1]), fixture);
      return { status: 0 };
    }, root);
    assert.equal(fs.statSync(file).mode & 0o777, 0o600);
    assert.equal(fs.statSync(path.dirname(file)).mode & 0o777, 0o700);
    const exported = fs.readFileSync(envFile, "utf8");
    assert.ok(exported.includes(`CM_KEYSTORE_PATH=${file}`));
    assert.ok(exported.includes("CM_KEY_ALIAS=academik-upload"));
    assert.ok(!exported.includes(env.ACADEMIK_UPLOAD_PASSWORD));
    fs.writeFileSync(envFile, "");
    assert.throws(() => restore(env, () => ({ status: 1 }), root), /SAME build/);
    assert.equal(fs.readFileSync(envFile, "utf8"), "");
    assert.equal(fs.readdirSync(root).filter(name => name.startsWith("academik-signing-")).length, 1);
    assert.throws(() => restore({ ...env, ACADEMIK_UPLOAD_PASSWORD: "" }, undefined, root), /Missing/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
