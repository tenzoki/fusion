# Coder: presence counts one person as one person, and the empty registry runs the same code

**Date:** 2026-09-04 20:29
**Status:** Complete
**Trigger:** Dispatch — step 4 of `260904-1651_o_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md`
**Filed by:** coder, Kai Stalmann <ks@qantr.com>, checkout 5e8248d7

## Task

Step 4 only: canonicalise the git identity before `presence` counts persons, render the registry's alias as a sixth `party=` field, and pass the roster in from the wrapper so `hooks/lib/events-query.ts` keeps opening no file. `bin/fusion-checkout-name`'s header was read first for the `roster` output shape.

## What changed

- `hooks/lib/events-query.ts`. `PresenceOptions` gains `identityMap: Record<string, string>`, required rather than optional so the one production caller cannot omit it. `measurePresence` builds `canon(g) = identityMap[g] ?? g` once and applies it in exactly two places: the party's `kind` (both sides of the comparison, through a hoisted `me = canon(identity.person)`) and the `people` set. The party key, the sort and the `checkouts` set are untouched and still run on raw values. Membership is asked with `Object.hasOwn`, because the map is a plain object built from parsed input and a git identity spelled `__proto__` must not resolve through the prototype. `renderParty` gains a second parameter `aliasOf: (hex) => string | null` and appends the alias or `-` as a sixth field. The module header gains a section stating the two things the step named — that the map is a table a human wrote, so a registration changes what `other_people` counted yesterday over the same window, and that a git identity claimed by two entries resolves first-by-filename-order with the conflict on stderr — plus why the join column is the git identity and not the hex.
- `hooks/events-query.ts`. New `readRoster()` parses `FUSION_EVENTS_ROSTER` into the two maps and is the only place the conflict is resolved and said. An unset variable, an empty one and `entries=0` are one state: two empty maps. `presence()` passes `identityMap` into `measurePresence` and `aliasOf` into `renderParty`.
- `bin/fusion-events`. One `[ -x ]`-guarded `fusion-checkout-name roster` call, exported as `FUSION_EVENTS_ROSTER` **above** the SessionStart-export `exec`, so both paths out of the script carry the map. Header: the `party=` example lines and the field count move from five to six, the sixth field is documented as appended and as a rendering that reaches no record, and a new section says why the roster is passed in and why an empty one is not a fallback.
- `hooks/lib/__tests__/fusion-events.test.ts`. Four unit cases on the canonicalisation, two on `renderParty`, one entry-point case that drives the real roster string through the environment.
- `hooks/dist/` rebuilt with `npm run build`; not hand-edited.

## The regression the join column exists to prevent, pinned

`still reads a foreign line carrying the reader's own raw identity as a further checkout` is the case. Reader is `KAI`, the registry claims `KAI` and `KAI2` for `Kai`, and a line from an **unregistered** checkout carries `KAI`. `canon(KAI) === canon(KAI) === "Kai"`, so it stays `kind=checkout` and `other_people=0`. Joining on the hex would have made that line another person, because the unregistered hex is in no entry. Two further cases hold the pair the step named: `CLAIMED` gives `other_people=0, other_checkouts=1` over two identities on one checkout, and the same log with an empty map gives `other_people=1`, which is HEAD.

## The acceptance criteria, measured

- **`presence` in this tree prints what it prints at HEAD.** Checked by extracting HEAD's `bin/fusion-events`, `bin/fusion-identity`, `bin/fusion-workbench-root` and the whole of `hooks/dist/` into a scratch layout with `git show HEAD:<path>` and running both against this project root. `diff` of the two stdouts is empty; both exit 0. Both print `window_days=7 / scope=pulled / other_people=0 / other_checkouts=0`. The tree carries no registry entries, so the sixth field appears on no line.
- **No new file read in the pure module.** `git diff hooks/lib/events-query.ts | grep '^+'` matches none of `readFile`, `require`, `import`, `node:`, `spawn`, `exec`.
- **The hook-test surface bound holds.** `hooks/lib/__tests__/**.ts` 20 044 → 20 115 lines, **+71** against the step's cap of 90 and the surface's 448 free. `surface-growth-bound.test.ts`'s `holds hook-tests inside its own head-room of 2500 lines` passes; only the golden fixture is stale.
- **End-to-end through the wrapper**, in a scratch workbench with one entry and one foreign `session_start`: the `party=` line renders `…\tshared\tamber-harbor`. Run outside a git work tree, so it exits 4 with `kind=unknown`, which is the expected shape there.

## Two gates left red, and why they were not touched

Both are mechanical re-approvals caused by this diff. The dispatch was explicit that regenerating them is a separate dispatch.

- `reference-resolution-lint.test.ts`: `paths` reads 1 567 against a pin of 1 566. The one new token is the single `bin/fusion-checkout-name` mention in `bin/fusion-events`'s new header section, counted with `git diff -U0 -- bin/fusion-events | grep '^+' | grep -oE '(bin|hooks)/[A-Za-z0-9_./-]+'`. It resolves; only the pin moved.
- `fixtures/surface-growth.golden`: `fusion-events.test.ts` reads 322 lines against 251. The remedy is `cd hooks && UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts` and a read of the diff. Regenerating does not move the baseline, and the baseline was not touched.

## Verification

`cd hooks && npm test` — exit 1. 45 of 48 files pass, 818 of 821 tests. Three failures: the two re-approvals above, and `citation-sweep.test.ts`, which was red at this session's start commit and is filed as `260904-1839_*_citation-sweep-test-is-red-at-head-and-was-already-red-before-this-session-started.md`. It fails on this repository's committed workbench, which this step did not touch — the diff is four code files plus the rebuilt `hooks/dist/`.
