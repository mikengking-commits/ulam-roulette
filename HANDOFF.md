# Ulam Roulette — handoff notes

Status as of 2026-09-09: pushed to its own GitHub repo, `mikengking-commits/ulam-roulette`
— separate repo, separate Firebase project, no shared history or config with
`smart-couple-finance`. Same pattern as the SCF handoff, deliberately kept apart from it.

## What this is

A migration off Floot. The app was built on Floot as a React + Postgres full-stack app;
Floot's free tier unpublishes after ~14 days, so it has been rebuilt as a single-file
static app with Firebase for the two things that genuinely need a backend.

The live Floot version is at `ulam-roulette.floot.app` until it lapses. Nothing here
depends on it — the catalogue was exported before the rebuild.

## Migration decisions worth knowing

**Hosting is GitHub Pages, not Firebase Hosting.** The repo is public (same pattern as
the SCF repo), so Pages serves it for free directly off the `main` branch. Firebase is
used only for Firestore — the meal log and custom dishes — not for hosting. One
consequence: because Pages serves exactly what's committed, `firebase-config.js` is
committed too rather than gitignored (its values aren't secret — see the comment in
`firebase-config.example.js`). If it were left out, the app wouldn't 404, it would just
silently run in local-storage-only fallback mode and the two phones would never
actually share a log.

**The catalogue moved OUT of the database.** On Floot the 166 dishes lived in Postgres,
argued for on single-source-of-truth grounds. That call is reversed here. The database
was guaranteed to exist on Floot; Firebase's free tier is not guaranteed to exist
forever, and the catalogue is the asset. It now lives in `data/dishes.json` under
version control, with `data/dishes.sql` as a redundant portable dump. Firestore holds
only the meal log and custom dishes — the things that actually change.

**React was dropped.** It only existed because Floot required it. A single HTML file
matches the SCF pattern already in use and is far easier to edit a year from now.

**One data bug was fixed in transit.** A bulk re-tag regex run during the Floot build
matched across a dish boundary and overwrote Thai Grilled Chicken (Gai Yang)'s condiment
note with Green Curry's. Corrected at source in `data/dishes.json`. The older standalone
`ulam-roulette.html` carried the wrong line — it has been deleted now that `index.html`
is the verified, shipped version.

## Files

```
index.html                   the whole app — no build step
manifest.json                PWA, standalone + portrait
icon-180/192/512.png         receipt mark, ember on warm near-black
data/dishes.json             166 dishes  <- the asset
data/zones.json              22 Singapore zones
data/dishes.sql              redundant Postgres dump of the same catalogue
firebase.json                firestore rules + indexes config (no hosting block — GitHub Pages hosts)
firestore.rules              shape validation; read the note at the top
firestore.indexes.json       empty, present so the CLI is happy
firebase-config.example.js   template; firebase-config.js (committed) is the real one
.gitignore                   ignores .firebaserc, Firebase CLI cache, OS/AppleDouble noise
README.md                    setup, deploy, data schema, known limits
```

## Remaining steps

1. ~~`git init`, commit, create the GitHub repo, push, enable Pages.~~ Done —
   `mikengking-commits/ulam-roulette`, public, served from `main` at
   `https://mikengking-commits.github.io/ulam-roulette/`.
2. Create a Firebase project (id `ulam-roulette`) + Firestore database (production mode).
3. `cp firebase-config.example.js firebase-config.js`, fill in the web config, commit + push it.
4. Optional: `firebase deploy --only firestore:rules` once `firebase-tools` is installed and
   you've run `firebase login`.
5. Open the Pages URL on both phones, Add to Home Screen.

Steps 2–4 need a browser and your Firebase account, so they're yours to do.

## Verification already done

On the Floot build, the full loop was exercised in the live app: six spins produced six
distinct dishes, logging a meal persisted and came back on the API, the match counter
decremented 136 → 135, and 25 further spins never re-offered the logged dish. The
filter logic in `index.html` is a direct port of that same logic.

Catalogue integrity re-checked at export: 166 dishes, 25 cuisines, 89 clear / 55
hidden-risk / 22 avoid, 8 blocked by the condiment rule, 12 eat-in-only, and zero rows
where a seafood warning is missing its reason or its counter phrase.

Not yet verified: the Firebase paths (`meals` and `customDishes` reads/writes) have
never run against a real project, because no Firebase project exists yet. Expect to
shake out one or two things on first connect — the likeliest is forgetting to create the
Firestore database itself in the console, which surfaces as the log staying on
"local only".
