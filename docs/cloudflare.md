# Cloudflare deployment for word.chiyy.com

This fork is deployed at https://word.chiyy.com. The upstream code, dataset,
illustrations, audio, author credits, and licenses are preserved.

## Automatic deployment

Cloudflare Workers Builds watches `kamtingtsai/word-atlas`, branch `main`.
Every push runs the upstream unit tests and dataset checks, builds the site,
validates Worker types, and deploys the audio services before the main Worker.
Deployment credentials stay in Cloudflare Builds; no token is stored in Git.

The complete site contains more than 20,000 assets, so it is divided into three
Workers to fit the Workers Free per-version file limit without dropping media:

| Worker | Content |
| --- | --- |
| `word-atlas` | App, dataset, illustrations, thumbnails, interface sounds |
| `word-atlas-word-audio` | UK and US word pronunciation |
| `word-atlas-example-audio` | Both kinds of example-sentence audio |

All files remain accessible at their original paths on `word.chiyy.com`.
The audio Workers are called through service bindings and have no public
`workers.dev` hostname. Static assets are served directly where possible;
audio requests pass through the main Worker and remain subject to the account's
Workers request quota. This configuration does not change the account's plan.

## Local checks and manual deployment

Requires Node.js 22+ and a Cloudflare login authorized for these Workers and the
`chiyy.com` zone:

```sh
npm ci
npm test
npm run check:atlas
npm run build:cloudflare
npm run check:cloudflare
npm run deploy:cloudflare
```

`npm run build` still creates the original portable static site in `dist/`.
Cloudflare-specific build files are generated under ignored `.cloudflare/`.
The preparation script verifies asset counts and Cloudflare file-size limits.

## Synchronizing upstream

The fork keeps its relationship to `designfuchen/word-atlas`. Use GitHub's
**Sync fork** action or merge upstream locally:

```sh
git remote add upstream https://github.com/designfuchen/word-atlas.git
git fetch upstream
git merge upstream/main
git push origin main
```

Keep this fork's `cloudflare/`, `scripts/cloudflare/`, Wrangler configuration,
and deployment npm scripts when resolving conflicts. A successful sync pushed
to `main` triggers deployment automatically. Upstream synchronization itself
is manual; no recurring sync job is enabled.

## Rollback

Use Cloudflare's deployment history to roll `word-atlas` back to a known-good
version. If an update also changed audio content, roll the two audio Workers
back to versions from the same build. Reverting a Git commit and pushing `main`
also rebuilds and republishes that version. Learning progress is stored in each
browser; users should export it before changing browsers or domains.
