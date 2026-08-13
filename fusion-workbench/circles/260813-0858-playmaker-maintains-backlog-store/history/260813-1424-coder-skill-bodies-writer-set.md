# Coder — step 5: the two skill bodies that stated the old backlog writer set

**Status:** Complete
**Circle:** `circles/260813-0858-playmaker-maintains-backlog-store`
**Plan:** `planning/260813-1306_p_the-playmaker-maintains-the-backlog-store.md`, step 5
**Executor:** `fusion:coder`

## What changed

Two sentences, each true this morning and false once step 2 gave the playmaker a write key
into the backlog store.

**`skills/memo/SKILL.md:152`** — the guardrail enumerated who moves a backlog marker and named
only two movers. It now names three and points at the marker-writer table rather than
reproducing it, so the gate on each marker has one home.

Before:

> A marker moves when the user moves it by hand, or when the shaper closes an entry a Circle
> took whole.

After:

> Markers move elsewhere: the playmaker maintains the store, the shaper closes an entry a
> Circle took whole, and the user can move one by hand. Which of the three writes which
> marker, and under what gate, is the table in `rules/fusion-workbench-conventions.md`
> `## Backlog entries`.

The neighbouring guardrail at `:153` ("never file an entry on an agent's behalf") is
untouched, and the change strengthens it: the playmaker is now named as a maintainer of the
store in the line above it, which makes the filing prohibition read as the boundary it is
rather than as the whole of the rule.

**`skills/direct/SKILL.md:77`** — the clause argued that a missing key is what keeps every
consumer of the backlog inside its scope. The playmaker is now the one consumer that argument
does not cover.

Before:

> This skill resolves no key into that store, so it cannot read or write an entry at all — the
> same omission that keeps every other consumer of the backlog inside its scope
> (`rules/fusion-workbench-conventions.md` `## Backlog entries`).

After:

> This skill resolves no key into that store, so it cannot read or write an entry at all: a
> mechanical bound rather than a stated one. That bound holds for every consumer of the
> backlog except the playmaker, which does hold the write key and is kept inside its scope
> instead by the filing-versus-maintenance line in `rules/fusion-workbench-conventions.md`
> `## Backlog entries`.

## The judgement the step asked for: narrow the argument, do not drop it

The sentence was making an argument, not stating a fact, and the argument survives in a
narrower form. It is load-bearing here: it is the reason the surrounding instruction ("copy
the entry path into `**Draft:**` verbatim, do not open the file") is safe to state as an
absolute. Dropping the generalisation would have left that instruction resting on nothing a
reader can check. What the correction changes is the *claim's reach*, not its shape — it names
the contrast that used to be implicit, a bound that follows from the key set versus a bound
that follows from stated prose, and then names the single consumer that sits on the second
kind. The plan's own step 4 anticipates exactly this wording when it says the relay "keeps the
skill's scope where `skills/direct/SKILL.md:77` says every non-playmaker consumer's scope is".

Neither edit restates the rule. Both cite `rules/fusion-workbench-conventions.md`
`## Backlog entries`, which step 1 made the single authoring home for the filing-versus-
maintenance line and the marker-writer table.

## The key-set hazard

`bin/fusion-paths` derives a consumer's key set by grepping that consumer's own prompt, so
neither edit may introduce a `$OUT_BACKLOG` or `$SCAN_BACKLOG` token. Both new sentences say
"the write key" in prose and name no token. Verified after the edit:

- `bin/fusion-paths direct` emits neither backlog key.
- `bin/fusion-paths memo` emits `OUT_BACKLOG=shared/backlog` and no `SCAN_BACKLOG`, the shape
  `fusion-paths.test.ts` pins for the filing surface.
- `bin/fusion-paths playmaker` emits `OUT_BACKLOG=shared/backlog` alongside `SCAN_BACKLOG`,
  which is step 2's key and the precondition this step's prose describes.

## Verification

`cd hooks && npx vitest run` — exit 1. 2 failed, 1012 passed (1014 tests, 48 files).

Both failures are predicted by the plan and neither is this step's:

- `rules-emission-golden.test.ts` — `fusion-workbench-conventions.md` grew 49 992 → 51 925
  bytes from steps 1 and 3. Step 8 regenerates the golden deliberately; it was left red here.
- `fusion-paths.test.ts` → *gives playmaker the read key and withholds the write key* — the
  assertion step 2 exists to invalidate. Step 6 inverts it.

No third failure. Nothing in `skills/next/SKILL.md` or `agents/playmaker.md`, both of which the
parallel step-4 run holds, appeared in the failure set.

## Not done here

No commit. The plan step is marked `[DONE]` in the planning file; the orchestrator commits.
