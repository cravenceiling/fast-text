import { $ } from "bun";


// Clean previous build
console.log("Cleaning previous build...");
await $`rm -rf ./dist`;

console.log("Building fast-text Chrome Extension...");

await $`mkdir -p ./dist/icons`;

const sourceFiles = [
  "./src/background.ts",
  "./src/content.ts",
  "./src/rsvp.ts"
];

console.log(`Found ${sourceFiles.length} TypeScript files`);

for (const file of sourceFiles) {
  const outputPath = './dist/${relativePath.replace(".ts", ".js")}';
  const outputDir = outputPath.substring(0, outputPath.lastIndexOf("/"));

  console.log(`Compiling ${file}...`);

  const result = await Bun.build({
    entrypoints: [file],
    outdir: outputDir,
    target: "browser",
    minify: true,
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


// Copy static files
console.log("Copying static files...");
await $`cp ./manifest.json ./dist/`;
await $`cp ./icons/*.png dist/icons/`;

console.log("Build complete!");
