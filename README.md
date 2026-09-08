# Ulam Roulette

A dinner randomiser for Singapore, built for two people with one seafood allergy
between them. It picks a dish, tells you whether either of you can actually eat it,
gives you the words to say at the stall, and points you at places nearby that serve it.

166 dishes across 25 cuisines. No build step, no framework, no server.

---

## Why it is shaped this way

**The allergy lives in the dish, not the address.** The obvious way to build this is
a restaurant finder with filters bolted on. That fails, because knowing there's a
stall 200m away tells you nothing about whether its char kway teow has cockles in it.
So the app randomises the *dish* first, screens it, and only then asks where to get it.

**Three seafood tiers, not two.** The interesting category is the middle one.

| Tier | Meaning | Behaviour |
|---|---|---|
| `clear` | No seafood in the standard build | Order as it comes |
| `hidden_risk` | Belacan, oyster sauce, dashi, fish sauce, dried shrimp | Surfaces **with** the exact phrase to say at the counter |
| `avoid` | Seafood is structural | Never surfaces when Mike is eating |

55 of the 166 dishes are `hidden_risk`, and that is the point of the whole app.
The dangerous dishes are not the ones with "prawn" in the name — they are chicken rice
greens finished with oyster sauce, nasi lemak sambal made with shrimp paste, gyudon
simmered in bonito dashi, and free banchan kimchi fermented with jeotgal.

Hidden-risk dishes are deliberately **not** filtered out. That judgement belongs to
the person standing at the stall, not to the app. What the app owes them is the
information and the words.

**The condiment rule is narrow on purpose.** It screens for mayonnaise or ketchup
*spread on* an item — burgers, sandwiches, omurice, tartar sauce. Cooked-in soy,
vinegar, curry, gochujang and chilli all pass. Only 8 of 166 dishes are excluded.

**Venues are infrastructure, never stalls.** The 22 zones list hawker centres, malls
and interchanges, because those don't close. Individual stalls do. Live opening hours
are delegated to a Google Maps deep link built at click time, so nothing in this repo
can go stale about what's open.

---

## Where the data lives, and why it is split

| What | Where | Why |
|---|---|---|
| 166 dishes | `data/dishes.json` (git) | The asset. Static. Git outlives any vendor's free tier. |
| 22 zones | `data/zones.json` (git) | Static infrastructure. |
| Portable dump | `data/dishes.sql` (git) | Redundancy. Rebuild on Postgres without parsing JS. |
| Shared meal log | Firestore `meals` | Actually changes. Both phones must agree. |
| Your own dishes | Firestore `customDishes` | Actually changes. |

The catalogue is **not** in Firestore. If Firebase vanished tomorrow you would lose a
meal log nobody will miss, not the seafood research.

---

## Running it locally

The app fetches `data/*.json`, so `file://` will not work — you need any static server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Without `firebase-config.js` present it still runs: the meal log falls back to that
browser's storage and the add-a-dish button hides itself. That is a valid state.

## Connecting Firebase

```bash
cp firebase-config.example.js firebase-config.js
# paste your values from Firebase Console -> Project settings -> Your apps
git add firebase-config.js && git commit -m "Add Firebase config" && git push
```

`firebase-config.js` is committed, not gitignored — GitHub Pages serves exactly the
committed tree, so the config has to be in git for the shared meal log to work across
both phones. That's fine: see the note below on why these values aren't secret.

Create a Firestore database in the console (production mode), then push the rules:

```bash
npm install -g firebase-tools
firebase login
firebase use --add          # pick your project
firebase deploy --only firestore:rules
```

**The web config values are not secret.** Firebase web config is public by design in
every client-side app. `firestore.rules` is the security boundary, not key secrecy.

## Deploying

Hosting is GitHub Pages, not Firebase Hosting — the repo is public, served straight off
`main`. Pushing to `main` is the deploy step:

```bash
git push
```

Firebase is used only for Firestore (the meal log and custom dishes), deployed
separately:

```bash
firebase deploy --only firestore:rules
```

## Installing to a phone

Open the hosted URL, then **Share → Add to Home Screen** (iOS) or Chrome's install
prompt (Android). It opens fullscreen, portrait, with the receipt icon.

---

## Editing the catalogue

`data/dishes.json` is a plain array. Every entry:

```jsonc
{
  "name": "Char Siew Rice",
  "cuisine": "Cantonese",
  "blurb": "Barbecued pork over rice with blanched greens.",
  "seafood": "hidden_risk",                       // clear | hidden_risk | avoid
  "seafoodNote": "The greens are usually dressed with oyster sauce.",
  "askFor": "Plain greens, no oyster sauce — shellfish allergy.",
  "condiment": "side_or_cooked",                  // clean | side_or_cooked | spread_on
  "condimentNote": "Glaze is on the meat, cooked in.",
  "takeaway": "travels_well",                     // eat_in_only | travels_ok | travels_well
  "priceBand": 1,                                 // 1 = under $8, 2 = $8-16, 3 = $16+
  "venues": ["hawker", "foodcourt"],
  "tags": ["quick", "comfort"]
}
```

**The one rule that matters:** if `seafood` is not `clear`, `seafoodNote` is required.
If it is `hidden_risk`, `askFor` is required too, and it must be words you can say out
loud at a counter. This is enforced in the form and again in `firestore.rules`.

---

## Known limits

- Dish data is researched judgement, not a per-stall audit. A kitchen that does things
  unusually will beat it. The warnings are prompts to ask, never clearance.
- 22 zones cover the north, east and central well. "Near me" snaps to the closest
  curated zone; elsewhere the Maps link still works.
- Firestore has no auth. Anyone with the URL can write to the two collections.
  See the note at the top of `firestore.rules`.

## Sources

- [Spence, *On the psychological impact of food colour*, Flavour](https://link.springer.com/content/pdf/10.1186/s13411-015-0031-3.pdf)
- [Effect of Shape, Size, and Color of the Food Plate on Consumer Perception, *Foods* 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11241694/)
- [NEA list of hawker centres](https://www.nea.gov.sg/docs/default-source/hawker-centres-documents/list-of-hcs_-25-july-2025.pdf)
