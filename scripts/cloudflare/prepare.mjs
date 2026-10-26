import { cp, mkdir, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const out = path.join(root, ".cloudflare");
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(path.join(root, "dist"), path.join(out, "app"), { recursive: true });
for (const [group, folders] of Object.entries({
  "word-audio": ["uk", "us"],
  "example-audio": ["ex", "ex2"],
})) {
  const target = path.join(out, group, "atlas/audio");
  await mkdir(target, { recursive: true });
  for (const folder of folders) {
    await rename(path.join(out, "app/atlas/audio", folder), path.join(target, folder));
  }
}
await rm(path.join(out, "app/atlas/audio"), { recursive: true });

let total = 0;
for (const group of ["app", "word-audio", "example-audio"]) {
  const dir = path.join(out, group);
  const files = await readdir(dir, { recursive: true, withFileTypes: true });
  const assets = files.filter((file) => file.isFile());
  if (assets.length > 19990) throw new Error(`${group} exceeds the free-plan file limit`);
  for (const file of assets) {
    const info = await stat(path.join(file.parentPath, file.name));
    if (info.size > 25 * 1024 * 1024) throw new Error(`${file.name} exceeds 25 MiB`);
  }
  total += assets.length;
  await writeFile(path.join(dir, "_headers"), "/*\n  X-Content-Type-Options: nosniff\n");
  console.log(`${group}: ${assets.length} files`);
}
const sourceFiles = (await readdir(path.join(root, "dist"), { recursive: true, withFileTypes: true }))
  .filter((file) => file.isFile()).length;
if (total !== sourceFiles) throw new Error(`Lost assets: ${total} != ${sourceFiles}`);
console.log(`All ${total} build files preserved across three Workers.`);
