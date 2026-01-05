import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const TARGET_WIDTH = 1414;
const TARGET_HEIGHT = 2000;

const files = [
  "public/gallery/1930sNoir.png",
  "public/gallery/NoirOutlaws.png",
  "public/gallery/VintageGetaway.png",
];

async function verifyPngDimensions(absPath) {
  const meta = await sharp(absPath).metadata();
  if (meta.width !== TARGET_WIDTH || meta.height !== TARGET_HEIGHT) {
    throw new Error(
      `Unexpected output size for ${absPath}: ${meta.width}x${meta.height} (expected ${TARGET_WIDTH}x${TARGET_HEIGHT})`,
    );
  }
}

async function main() {
  const repoRoot = process.cwd();

  for (const rel of files) {
    const abs = path.join(repoRoot, rel);

    try {
      await fs.access(abs);
    } catch {
      throw new Error(`Missing file: ${rel}`);
    }

    const input = await fs.readFile(abs);

    const out = await sharp(input)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png({ compressionLevel: 9 })
      .toBuffer();

    await fs.writeFile(abs, out);
    await verifyPngDimensions(abs);

    console.log(`Resized: ${rel} -> ${TARGET_WIDTH}x${TARGET_HEIGHT}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
