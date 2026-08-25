import sharp from "sharp";
import fs from "fs";
import path from "path";

const SRC = path.resolve("public/brand/logo-full.png");
const OUT_DIR = path.resolve("public/icons");

const flatIcons = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "favicon.png", size: 32 },
];

async function run() {
  if (!fs.existsSync(SRC)) {
    console.error("Missing public/brand/logo-full.png — add the logo first.");
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Remove excess whitespace border around the lockup
  const trimmed = await sharp(SRC).trim({ threshold: 10 }).toBuffer();

  for (const { name, size } of flatIcons) {
    await sharp(trimmed)
      .resize(size, size, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toFile(path.join(OUT_DIR, name));
  }

  // Maskable icon: safe-zone padding + solid brand background
  // (Android crops maskable icons into a circle/squircle, so content
  // must sit within ~70% of the canvas)
  const canvas = 512;
  const safeZone = Math.round(canvas * 0.7);

  const mark = await sharp(trimmed)
    .resize(safeZone, safeZone, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: { r: 255, g: 247, b: 237, alpha: 1 }, // brand-50
    },
  })
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toFile(path.join(OUT_DIR, "maskable-512.png"));

  console.log("✔ Icons generated in public/icons/");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
