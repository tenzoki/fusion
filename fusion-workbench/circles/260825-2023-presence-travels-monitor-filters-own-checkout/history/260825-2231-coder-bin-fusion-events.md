# C4 step 2 — `bin/fusion-events`, the identity-scoped reader of the event log

**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Plan:** `260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`, step 2

## What was implemented

The three-part helper shape `bin/fusion-turn-budget`, `bin/fusion-review-coverage` and `bin/fusion-staging-drift` already use: a thin bash wrapper resolved relative to itself, over a compiled entry point, over the logic in `hooks/lib/`.

1. **`hooks/lib/events-query.ts`** (new, 14 239 bytes) — the computation, and a pure function of the log text, the reading identity and the current time. It opens no file, runs no subprocess and asks nothing about git. `measurePresence` classifies the `session_start` lines in the window by the pair of `person` and `checkout`; `countTurns` scopes to this checkout, sorts by `ts`, finds the **first** `session_start` naming the session's history file and counts `turn_start` from that stamp on. `parseTs` appends the `Z` designator the emit convention omits, which is the standing trap in `CLAUDE.md`'s symptom table; nothing in the module calls `Date.parse` directly. `parseLog` counts a line that is not a JSON object rather than dropping it silently.
2. **`hooks/events-query.ts`** (new, 10 835 bytes) — the entry point, and the only place a file is opened. It reuses `findWorkbenchRoot` from `lib/workbench-root.ts` and the `session.history_file` read from `lib/state-file.ts`; no second reader of either was added. Values go to stdout, reasons to stderr, and the exit code says which figure could not be taken.
3. **`bin/fusion-events`** (new, +x, 8 418 bytes) — the wrapper, carrying the authoritative header: usage, output shape, the three-class split and the exit table. It runs its sibling `bin/fusion-identity` behind an `[ -x ]` guard and passes `PERSON`, `CHECKOUT` and **that helper's exit code** into the node program as `FUSION_EVENTS_PERSON`, `FUSION_EVENTS_CHECKOUT` and `FUSION_EVENTS_IDENTITY_EXIT`, with a `127` sentinel for the missing-helper branch. `fusion-identity`'s stderr passes through untouched.
4. **`hooks/dist/events-query.js`** and **`hooks/dist/lib/events-query.js`** built with `npm run build` in `hooks/` and left in the tree for the commit, with their `.d.ts` siblings.
5. **`README-hooks.md`** — one row in the `## Files` table for `lib/events-query.ts`, which is the row `derivable-enumerations-lint.test.ts` holds in set equality with `hooks/lib/*.ts`.
6. **`CLAUDE.md`** — one row in the Layout table for `bin/fusion-events`, which is the row the same gate holds in set equality with `bin/*`.
7. **`.gitignore`** — `!bin/fusion-events`. Not in the step's file list, and unavoidable: `bin/*` is excluded and each helper is re-included by name, so without the line the tarball ships no helper and `committed-dist.test.ts` fails on it. `bin/fusion-identity`'s own addition needed the same line.

## Three contract questions the plan left to the implementation

Each is answered in the wrapper's header, and each is recorded here because a later reader will meet the answer before the reasoning.

**A broken install is exit 5 here and exit 3 in the three sibling helpers.** Their 3 is free; this helper's 3 is already an answer about the project (`presence`: no line can be classified; `turns`: there is no session to scope to). Their headers give the principle — "there is nothing to check" is an answer about the project and a broken install must never be reported as one — so the principle stayed and the number moved.

**A log that could not be read is exit 3, not a zero.** The plan's table names one cause for each subcommand's 3. A missing or unreadable log is a second cause with the identical consequence, so it reaches the same code with the cause on stderr, the way `bin/fusion-identity`'s header states its own 3 "names an outcome, never a cause". An **empty** log is a different fact and stays a real zero at exit 0. This is what stopping clause 3 asks for: a read that failed says so and never reports a count of zero.

**An unresolved reading checkout is fatal to `presence` and not to `turns`.** Without an identifier every line carrying one looks like somebody else's, so `presence` can classify nothing and exits 3. `turns` keeps every line and says so on stderr, which is the exact pre-C4 behaviour and the degradation the plan's `## Approach` states, rather than a fallback.

## Verification

`cd hooks && npm test` — **exit 1**. Two failures, both named below, neither in this step's own code, and both closed by the commit that lands it.

- `committed-dist.test.ts` `git ls-files bin/ equals the directory listing` — `bin/fusion-events` is untracked. The `.gitignore` exception is in place and `git check-ignore` confirms the file is re-included; the check reads the git index, so it goes green when the orchestrator commits. Structural for any new `bin/` helper.
- `reference-resolution-lint.test.ts` `resolved exactly the pinned number` — `BASELINE` needs re-approval to `{ paths: 1402, anchors: 193 }` from `{ paths: 1380, anchors: 193 }`. **Not applied here:** the dispatch put `hooks/lib/__tests__/**` out of scope, and the same file was carrying a concurrent step's uncommitted edit at the time. The numbers and their attribution are handed over below so it can be applied in the same commit that tracks the helper, which is when both failures close together.

The **dangling-reference half of that gate passes**, which is the half that judges correctness rather than the pin.

Three further failures appeared in the first full run — `review-coverage.test.ts` once, `staging-drift.test.ts` twice — and all three pass on `npx vitest run` of those two files alone. They spawn git repositories and were run against a machine carrying three concurrent tasks; they are load flakes and not this step's.

### The reference-count move, measured in isolation and fully attributed

Measured against a clean `git archive HEAD` tree with this step's files overlaid one at a time, so the figure is this step's own and carries none of the concurrent step 3's:

| Added to the HEAD tree | paths | anchors |
|---|---|---|
| (HEAD alone) | 1376 | 192 |
| the three new `.ts` files and their `dist/` output | 1376 | 192 |
| `+ bin/fusion-events` | 1389 | 192 |
| `+ CLAUDE.md`'s Layout row | 1394 | 192 |
| `+ README-hooks.md`'s lib row | 1398 | 192 |

**+22 paths, anchors unmoved**, split +13 / +5 / +4. The `.ts` sources move nothing: this gate's surface is the shipped `.md` files and `bin/`, and `hooks/**/*.ts` is not on it. On the live tree the received figure is `{ paths: 1402, anchors: 193 }`, which is exactly step 3's re-approved 1380 plus this step's 22, so the two steps' shares are disjoint and no interaction has to be assumed.

One dangling citation was found by that isolation run and fixed rather than accepted: the `turns` example in the wrapper's usage block named this session's own history file, which resolves today and would dangle the moment that record is archived. It is now `circles/<stamp>-<slug>/history/<stamp>-orchestrator-session.md`, an illustration rather than a citation.

### Smoke tests, run from the work tree

The helper is unreachable from this session's own call sites — every one is written `"$FUSION_PLUGIN_ROOT/bin/…"`, which is the installed copy and pinned for the session — so it was run directly:

- `./bin/fusion-events turns` → `turns=1`, scoped to this session's history file. The whole-file `grep -c '"turn_start"'` this replaces returns **147** over the same file. That difference is the defect step 5 discharges.
- `./bin/fusion-events presence` → `other_people=0`, `other_checkouts=0`, exit 0, which is correct: no line in the 2 339-line log carries a `checkout` yet, so every line is this checkout's own.
- Exit 2 from a directory with no workbench above it; exit 1 on a bad subcommand and on `--days x`; exit 3 and exit 4 driven by setting the identity environment variables directly against `hooks/dist/events-query.js`.
- The classification table exercised against fixture text through the compiled module: an absent `checkout` counted as ours, another person kept, a further checkout of the same person classed separately, a line past the window dropped, a malformed line counted, and `countTurns` excluding another checkout's `turn_start` inside the same window.

**The proof run through a real call site belongs to the next session**, after `fusion --update` and a restart. That is the two-session shape `260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md` measured, and steps 5 and 6 are written against the `[ -x ]` miss branch for exactly this reason.

## Surfaces

No bounded surface was touched. `bin/`, `hooks/lib/*.ts` and `README-hooks.md` fall outside all four bounds, and `CLAUDE.md` is not a bounded surface either. `surface-growth-bound.test.ts` passes and **no growth-bound baseline map was edited**, so the plan's stopping clause 8 holds on that half. The hook test suite gained zero lines: no file under `hooks/lib/__tests__/` was opened for writing.

## Not done here, by scope

- **The tests.** `hooks/lib/__tests__/fusion-events.test.ts` is step 10 and is blocked on the open question about where its lines come from. The module was written to make that step cheap: every case in the plan's `## Data Structures` is a fixture string and an assertion, with no git tree, no temporary workbench and no subprocess.
- **The call sites.** Steps 5 and 6 wire `turns` and `presence` into the orchestrator and the two skill bodies.
- **`README-hooks.md`'s entry-point rows.** The `## Files` table lists all four existing `hooks/*.ts` entry points and now omits `events-query.ts`. Only the `lib/` half of that table is held in set equality by a gate, so nothing catches it, and the dispatch scoped this step to one row. The row to add is one line beside `review-coverage.ts`.
