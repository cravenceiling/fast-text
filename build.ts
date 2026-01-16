const DIST_DIR = "./dist";
const ICONS_DIR = "./icons";

async function build() {
  console.log("Building fast-text Chrome Extension...");

  if (!Bun.file(DIST_DIR).exists()) {
    await Bun.write(DIST_DIR, "");
  }

  const sourceFiles = [
    "./src/background.ts",
    "./src/content.ts",
    "./src/rsvp.ts"
  ];

  console.log(`Found ${sourceFiles.length} TypeScript files`);

  for (const file of sourceFiles) {
    const relativePath = file.replace("./src/", "");
    const outputPath = `${DIST_DIR}/${relativePath.replace(".ts", ".js")}`;
    const outputDir = outputPath.substring(0, outputPath.lastIndexOf("/"));

    if (!Bun.file(outputDir).exists()) {
      await Bun.write(outputDir, "");
    }

    console.log(`Compiling ${file}...`);

    const result = await Bun.build({
      entrypoints: [file],
      outdir: outputDir,
      minify: false,
      sourcemap: "none",
    });

    if (!result.success) {
      console.error(`Failed to compile ${file}`);
      for (const log of result.logs) {
        console.error(log.message);
      }
    } else {
      console.log(`Compiled ${file}`);
    }
  }

  copyIcons();

  console.log("Build complete!");
}

async function copyIcons() {
  const iconSizes = [16, 48, 128];
  for (const size of iconSizes) {
    const iconPath = `${ICONS_DIR}/icon${size}.png`;
    const iconFile = Bun.file(iconPath);
    if (await iconFile.exists()) {
      const destPath = `${DIST_DIR}/icon${size}.png`;
      await Bun.write(destPath, iconFile);
      console.log(`Copied icon${size}.png`);
    }
  }
}

build().catch(console.error);
