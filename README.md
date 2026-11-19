[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/lycann666/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/lycann666/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Legend — GTA VI Trophy Guide & Tracker

The complete offline guide and tracker for all **55 PlayStation 5 trophies** of
Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver and 46 bronze.

## What it is

- **Every trophy, exactly as PlayStation publishes it** — official name,
  description and grade for all 55, cross-checked against the Exophase and
  PSNProfiles GTA VI trophy listings, which agree on every name, description
  and grade.
- **A guide in our own words for every trophy** — what to do, where and how,
  and when it can be missed. Each guide names its sources beside it, with
  links to the official PlayStation list, Exophase and PSNProfiles.
- **A roadmap to the platinum** — six ordered stages: story, strangers and
  contacts, collectibles and exploration, activities, cleanup, then platinum.
- **Missable trophies flagged** — 7 trophies are flagged from their official
  descriptions, with a dedicated missable view so you do them before the
  finale closes the window.
- **A tracker** — tick trophies off as you earn them; progress saves in the
  browser (localStorage), with a progress bar, per-grade counts and estimated
  points. Export your progress to a JSON file and import it back.
- **Filters and search** — filter by kind (story, missable, collectibles,
  activities, online), by grade, by earned-only, or search by name,
  description or guide text.
- **Spoiler setting** — hides the names and descriptions of story trophies
  until you have earned them.
- **Honest about launch** — GTA VI is not released yet, so where a step cannot
  be verified before launch the guide says so plainly instead of inventing a
  location or a step as fact.

## Run it

```sh
node serve.ts
```

Then open <http://localhost:8080>. The app is plain static files under `app/`
with no build step, and it works with the network off: it loads nothing from
outside `app/`. (The source links beside each guide open only when you follow
them; the app itself fetches nothing.)

Deep links for screenshots and sharing:

- `/?view=roadmap` — the roadmap to the platinum
- `/?filter=missable` — the missable trophies
- `/?grade=silver` — silver trophies only
- `/?trophy=17` — one trophy's full guide (The Shootist)

## Files

- `app/index.html`, `app/app.js`, `app/style.css` — the guide and tracker.
- `app/data/trophies.json` — the 55 trophies with official names, descriptions
  and grades, guides, sources, kinds, missable flags and the roadmap.
- `main.ts` — the hand-in program: copies `app/` and `screenshots/` to
  `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `dossier.json`.
- `screenshots/` — 4 real renders of this app.

## License

MIT — see [LICENSE](LICENSE).
