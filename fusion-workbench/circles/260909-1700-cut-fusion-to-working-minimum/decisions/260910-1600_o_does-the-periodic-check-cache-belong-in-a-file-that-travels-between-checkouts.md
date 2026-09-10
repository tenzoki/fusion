# Does the periodic-check cache belong in a file that travels between checkouts?

---
**Domain:** code
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md` step C3 (which specified the location); `rules/workbench-tracking.md` `## The four classes` (the R3 row and the class L reasoning this question sits between)

---

## Question

Step C3 put the periodic-check cache in `fusion-workbench/.fusion-setup`, as a `checks` object recording per selector the date the check ran and the plugin version it ran against. That file is **class R3 — it travels**, and the cache is the first thing in it that is a statement about the checkout that wrote it rather than about the project.

The ten selectors are mostly per-checkout questions. Whether this workbench's `monitor` copy matches the installed plugin, whether another session is running here, whether this checkout is registered, how far this checkout is behind its remote, whether `.claude/settings.local.json` exists — none of those is answered by what another clone did last week. A pulled `checks` object therefore suppresses checks this checkout has never run, which is the exact failure `rules/workbench-tracking.md` gives as the reason `.cadence-anchors` is class L: *a pulled mark would claim coverage this checkout never performed*.

It also makes a tracked file change on a rolling schedule per checkout, so two clones produce a diff on it whenever their 30-day windows drift apart. That is milder — the file is small and the merge is trivial — but it is the second half of why the R3 row's old wording said the marker carries no timestamp of its own.

The question must be settled before a consuming project runs two checkouts against one workbench, which is what the surrounding Circle is building towards.

## Options

1. **Leave it in `.fusion-setup`, as C3 specified.**
   - Pros: one file, no new root-anchored surface, and the marker's version field is already the thing the cache is keyed against, so the read is one parse.
   - Cons: a pulled cache silently suppresses checks in a checkout that never ran them, which is the failure the partition names elsewhere as a reason to keep a file local; the R3 row's "no timestamp of its own" property is gone.
2. **Split the cache into a class L file** (`fusion-workbench/.checks`, one line per selector), leaving `.fusion-setup` exactly as it was.
   - Pros: each checkout's coverage is its own, matching `.cadence-anchors`, whose reasoning is identical; the tracked marker goes back to carrying nothing that reads as "now"; no cross-checkout diff.
   - Cons: one more root-anchored surface and one more entry in the four-class table; the setup body reads two files where it read one.
3. **Key the `checks` object by checkout identifier** — `checks: { "<8hex>": { monitor: … } }` — keeping one travelling file.
   - Pros: the file still travels, and a checkout reads only its own subtree, so nothing is suppressed wrongly.
   - Cons: the marker grows without bound as checkouts come and go, with no writer that ever prunes it; it turns a two-key marker into a structure, and the identifier is exactly what class L says a travelling file should not carry per checkout.

## Constraints

- Whatever holds the cache must be readable in one shell block at the top of `/fusion:setup`, because the whole point of C3 is that a warm session performs two steps and no more.
- The four-class partition tiles every root entry: an answer that adds a file adds a row to `rules/workbench-tracking.md` `## The four classes` in the same commit.
- No answer may make a check *run* on every session again. The cache exists to stop that.

## Recommendation

Option 2. The question the cache answers is "has **this checkout** performed this check", and `.cadence-anchors` already establishes that such an answer stays local; option 1 leaves a suppression path that is invisible when it fires, and option 3 pays the same cost as option 2 while keeping a growing per-checkout structure inside a shared file. The cost of option 2 is one table row and one extra read, both of which are visible and neither of which can fail silently.
