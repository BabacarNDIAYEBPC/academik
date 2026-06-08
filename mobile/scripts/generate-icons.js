/**
 * Génération des icônes iOS et Android pour Academik
 * Utilise le logo source : ../attached_assets/logo_academik_minimal.png
 *
 * Usage : node scripts/generate-icons.js
 * Prérequis : npm install sharp
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const SOURCE = path.join(__dirname, "../../attached_assets/logo_academik_minimal.png");

const IOS_SIZES = [
  { size: 20, scales: [1, 2, 3] },
  { size: 29, scales: [1, 2, 3] },
  { size: 40, scales: [1, 2, 3] },
  { size: 60, scales: [2, 3] },
  { size: 76, scales: [1, 2] },
  { size: 83.5, scales: [2] },
  { size: 1024, scales: [1] },
];

const ANDROID_SIZES = [
  { density: "mdpi",    size: 48 },
  { density: "hdpi",    size: 72 },
  { density: "xhdpi",   size: 96 },
  { density: "xxhdpi",  size: 144 },
  { density: "xxxhdpi", size: 192 },
];

const SPLASH_SIZES = [
  { density: "mdpi",    w: 480,  h: 800 },
  { density: "hdpi",    w: 720,  h: 1280 },
  { density: "xhdpi",   w: 960,  h: 1600 },
  { density: "xxhdpi",  w: 1440, h: 2560 },
];

async function generateIosIcons() {
  const outDir = path.join(__dirname, "../resources/ios/AppIcon.appiconset");
  fs.mkdirSync(outDir, { recursive: true });

  const contents = { images: [] };

  for (const { size, scales } of IOS_SIZES) {
    for (const scale of scales) {
      const px = Math.round(size * scale);
      const filename = `icon-${size}@${scale}x.png`;
      await sharp(SOURCE)
        .resize(px, px, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .toFile(path.join(outDir, filename));
      contents.images.push({
        idiom: size >= 76 ? "ipad" : "iphone",
        size: `${size}x${size}`,
        scale: `${scale}x`,
        filename,
      });
      console.log(`✓ iOS ${filename} (${px}x${px})`);
    }
  }

  fs.writeFileSync(
    path.join(outDir, "Contents.json"),
    JSON.stringify({ images: contents.images, info: { version: 1, author: "xcode" } }, null, 2)
  );
}

async function generateAndroidIcons() {
  for (const { density, size } of ANDROID_SIZES) {
    const outDir = path.join(__dirname, `../resources/android/mipmap-${density}`);
    fs.mkdirSync(outDir, { recursive: true });
    await sharp(SOURCE)
      .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(path.join(outDir, "ic_launcher.png"));
    await sharp(SOURCE)
      .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(path.join(outDir, "ic_launcher_round.png"));
    console.log(`✓ Android ${density} (${size}x${size})`);
  }
}

async function generateSplash() {
  for (const { density, w, h } of SPLASH_SIZES) {
    const outDir = path.join(__dirname, `../resources/android/drawable-${density}`);
    fs.mkdirSync(outDir, { recursive: true });
    const logoSize = Math.round(Math.min(w, h) * 0.35);
    await sharp({
      create: { width: w, height: h, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
    })
      .composite([{
        input: await sharp(SOURCE).resize(logoSize, logoSize, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } }).toBuffer(),
        gravity: "center",
      }])
      .png()
      .toFile(path.join(outDir, "splash.png"));
    console.log(`✓ Splash Android ${density} (${w}x${h})`);
  }

  const iosOut = path.join(__dirname, "../resources/ios/splash");
  fs.mkdirSync(iosOut, { recursive: true });
  await sharp({
    create: { width: 2732, height: 2732, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite([{
      input: await sharp(SOURCE).resize(600, 600, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } }).toBuffer(),
      gravity: "center",
    }])
    .png()
    .toFile(path.join(iosOut, "Default@2x~universal~anyany.png"));
  console.log("✓ Splash iOS 2732x2732");
}

(async () => {
  console.log("🎨 Génération des icônes Academik...\n");
  await generateIosIcons();
  await generateAndroidIcons();
  await generateSplash();
  console.log("\n✅ Tous les assets générés !");
})();
