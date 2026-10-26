import { spawnSync } from "node:child_process";

// Deploy dependencies before publishing the main site. Stop on the first failure.
for (const config of [
  "cloudflare/word-audio.jsonc",
  "cloudflare/example-audio.jsonc",
  "wrangler.jsonc",
]) {
  const env = { ...process.env };
  if (config !== "wrangler.jsonc") {
    // Workers Builds sets these for the main Worker only.
    delete env.WRANGLER_CI_OVERRIDE_NAME;
    delete env.WRANGLER_CI_MATCH_TAG;
    delete env.WRANGLER_CI_GENERATE_PREVIEW_ALIAS;
  }
  const result = spawnSync("npx", ["wrangler", "deploy", "--config", config], {
    stdio: "inherit",
    env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
