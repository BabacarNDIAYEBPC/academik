const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

function decodeKeystore(value) {
  const encoded = (value || "").replace(/\s/g, "");
  if (!encoded || encoded.length > 1024 * 1024 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) {
    throw new Error("Set ACADEMIK_UPLOAD_KEYSTORE_BASE64 to the Base64 of the current JKS, marked Secret.");
  }
  const bytes = Buffer.from(encoded, "base64");
  if (bytes.length < 12 || bytes.readUInt32BE(0) !== 0xfeedfeed ||
      bytes.toString("base64") !== encoded) {
    throw new Error("The decoded file is not a JKS. Encode academik-upload.jks, not the ZIP or PEM.");
  }
  return bytes;
}

function restore(env, run = spawnSync, tempRoot = os.tmpdir()) {
  const bytes = decodeKeystore(env.ACADEMIK_UPLOAD_KEYSTORE_BASE64);
  if (!env.ACADEMIK_UPLOAD_PASSWORD) {
    throw new Error("Missing ACADEMIK_UPLOAD_PASSWORD. Keep the password used to generate this JKS.");
  }
  if (!env.CM_ENV || !fs.statSync(env.CM_ENV).isFile()) {
    throw new Error("CM_ENV must identify the Codemagic environment file.");
  }
  const directory = fs.mkdtempSync(path.join(tempRoot, "academik-signing-"));
  const keystore = path.join(directory, "upload.jks");
  try {
    fs.chmodSync(directory, 0o700);
    fs.writeFileSync(keystore, bytes, { mode: 0o600, flag: "wx" });
    const result = run("keytool", [
      "-list", "-storetype", "JKS", "-keystore", keystore,
      "-alias", "academik-upload", "-storepass:env", "ACADEMIK_UPLOAD_PASSWORD",
    ], { env, stdio: "ignore", timeout: 30000 });
    if (result.error || result.status !== 0) {
      throw new Error("JKS verification failed. Check that the Base64 and generation password belong to the SAME build.");
    }
    // Only non-secret metadata goes to CM_ENV; never serialize the password there.
    fs.appendFileSync(env.CM_ENV, `\nCM_KEYSTORE_PATH=${keystore}\nCM_KEY_ALIAS=academik-upload\n`);
    return keystore;
  } catch (error) {
    fs.rmSync(directory, { recursive: true, force: true });
    throw error;
  } finally {
    bytes.fill(0);
  }
}

if (require.main === module) {
  try {
    restore(process.env);
    console.log("Android upload JKS restored and verified. No signing identity upload is needed.");
  } catch (error) {
    // Do not print subprocess output or environment values containing credentials.
    console.error(error.code ? "Unable to restore the JKS in the Codemagic environment." : error.message);
    process.exitCode = 1;
  }
}

module.exports = { decodeKeystore, restore };
