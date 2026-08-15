# Coder — the Plane mirror leaves the shipped plugin: code, prompts and prose

**Date:** 2026-08-15
**Agent:** coder
**Status:** Complete
**Circle:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth`
**Plan step:** 2 of `planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md`
**Dispatched by:** orchestrator

---

## What was asked

Remove the Plane mirror's code, prompts and prose, leaving its structured data files and test
fixtures for step 3 and its `CLAUDE.md` narrative rows for gate G1. The ordering rule the step
runs under is that a citation is removed before its target file, never after, because
`hooks/lib/__tests__/reference-resolution-lint.test.ts` resolves every cited plugin path against
the tree and fails on a dangling one.

## What the mirror was

The bridge was built in one Circle, `circles/260719-1536-plane-mirror-integration`, closed
**coherent** on 2026-07-20 with no Rebalance. Its closure note records the artifact as six commits
on `main` (`eb9cf59`..`aefbf39`, all six on 2026-07-19): `bin/fusion-plane` with the
`push` / `plan` / `states` / `doctor` / `map` / `seed` subcommands over an idempotent
`reconcile(circle)` core, the `/fusion:seed-from-plane` bounded read, orchestrator wiring at three
transition points, the install surface and `docs/plane-setup.md`, and an offline vitest suite with
lint guards against a hardcoded state UUID and against an API key in the config file.

It was a **bounded bridge**, variant b, not a pure mirror: push-only in the continuous direction,
with exactly one read path that materialised a Plane story into a new Circle's Grounding once and
then never consulted Plane about that Circle again. The design decisions behind that shape — D1
(Plane's role is a mirror, files and git stay the source of truth), D3 (fusion keeps working when
Plane is unreachable, and never fails silently) and the D1-refinement that admitted the seeding
read — are in `shared/decisions/` and are untouched by this step.

## What its runtime state says it achieved, measured here

The record asks that a removal record what was built. What makes this removal defensible rather
than merely tidy is that this project's own runtime state can be read, and it reports zero
successful pushes over the mirror's entire life.

| Surface | Reading, 2026-08-15 |
|---|---|
| `fusion-workbench/.plane-map.json` | `{}` — the file↔Plane-id map is empty. No push ever produced an id to record. |
| `fusion-workbench/.plane-outbox.jsonl` | 50 entries, every one deferred. |
| Outbox reasons | `PLANE_API_KEY absent` × 33, `Plane unreachable (states/ — curl rc 7 / HTTP none)` × 17. |
| Outbox span | 2026-08-01T10:47:24Z to 2026-08-14T22:16:58Z, naming 5 distinct Circles. |

Both figures point the same way and neither is an inference: the id map is written only on a
successful push and it is empty, and every one of the 50 outbox lines carries a deferral reason.
The C4 doctrine worked exactly as designed — nothing failed silently, and every transition that
could not reach Plane was written down with a manual hint. What never happened is a push.

## What changed

**Deleted.**

- `bin/fusion-plane` — 2 598 lines, 134 796 bytes, the largest single file in `bin/`.
- `hooks/lib/__tests__/fusion-plane.test.ts` — 3 020 lines, 127 tests.
- `skills/seed-from-plane/SKILL.md` — 149 lines, and its directory with it.
- `docs/plane-setup.md` — 466 lines.

**`agents/orchestrator.md`.** The whole `## Plane mirror (push-only, optional side-effect)` section,
its three call points and the `plane_push` event-table row, for 4 021 bytes. At the Phase-4 call
point the push preceded a `.active-circle` clear; the clear stays and the step now reads
`4. **Clear `.active-circle`.**`, with its queue-retirement note beneath it untouched. The
activation call point at the Write Points list and the end-of-Turn call point in Step 3e each lose
their trailing Plane clause and keep the act they were attached to.

**`skills/setup/SKILL.md`.** `## Step 0e — Ensure the Plane config template is present locally`
removed in full. The lettering now runs 0d, 0f: nothing anywhere cites either label, and step 12 of
the plan names Step 0f as the place its new permission step goes, so re-lettering would have
invalidated a plan reference to save nothing.

**`skills/cleanup/SKILL.md`.** Two prose lists of the skills that take the same domain-reading
route drop `/fusion:seed-from-plane`.

**`rules/fusion-workbench-conventions.md`.** `plane.config.yaml`, `.plane-map.json` and
`.plane-outbox.jsonl` leave the root-anchored layout tree, and `.session-marker` becomes its last
entry. See `## What the plan did not predict` below for the sentence the step expected to delete
with them.

**`rules/circle-records.md`.** The marker-on-the-record design had two justifications; the second,
"an immutable natural key: the later Plane mirror needs a per-Circle identifier that does not
mutate", loses its subject. Path stability is now stated as the reason on its own.

**`hooks/lib/staging-drift.ts`.** `.plane-map.json` and `.plane-outbox.jsonl` leave `LIVE_STATE`.
Two counts in the surrounding documentation moved with them: the trailing tracked-but-machine-written
group is now two entries (`orchestrator-events.jsonl`, `.fusion-setup`) rather than three, and the
leading do-not-track group reads five rather than six, which is what the array has held all along.
`plane.config.yaml` also leaves the `unclassified` class's worked example, where it stood beside
`stilwerk/`.

**Five test files.** Four fixtures used a Plane path as an arbitrary operand and now use
`bin/fusion-paths`: `churn.test.ts`, `churn-key-anchor.test.ts` and two assertions in
`review-coverage.test.ts`. `domain-cascade.test.ts`'s failure message drops
`/fusion:seed-from-plane` from the list of skills that read the domain rather than deciding it.
`monitor-warnings-panel.test.ts` cited `fusion-plane.test.ts` as the precedent for driving a real
`bin/` script through `child_process`; `fusion-paths.test.ts` carries that precedent alone now.

**Documentation.** `README.md`'s account of what Setup copies; `README-agents.md`'s three
`shaper` dispatch-parameter rows and its `/fusion:seed-from-plane` skill-table row;
`docs/working-model.md`'s third Circle-creation route and the anticipated-circle paragraph;
`.claude-plugin/plugin.json`'s description clause. No version bump — step 15 owns that.

**`CLAUDE.md`, enumeration half.** `/fusion:seed-from-plane` leaves the skill listing, and the
`bin/fusion-plane` Layout row leaves the table. The second of those was not in the plan's
enumeration half; see below.

**`hooks/lib/__tests__/fixtures/rules-emission.golden`** regenerated, and
**`hooks/dist/lib/staging-drift.{js,d.ts}`** rebuilt by `npm test`'s own build step.

## What the plan did not predict

**1. The `bin/fusion-plane` Layout row in `CLAUDE.md` is gate-forced, not narrative.** The plan
assigns it to gate G1 and states, at step 4, that `derivable-enumerations-lint` "does not read that
table". It does: the gate re-derives the `bin/` helper roster from the tree and diffs it against the
`| \`bin/…\` |` rows, and `reference-resolution-lint` separately resolves the row's
`bin/fusion-plane` and `docs/plane-setup.md` tokens. Both failed on the first full run and both are
satisfied by deleting the row. By the plan's own criterion in `## Approach` — *does `npm test`
assert it?* — the row belongs in this commit. **Step 4 inherits the correction**: its
`bin/fusion-churn-rank` row is in the same asserted roster and cannot wait for G1 either. The two
remaining Plane mentions in `CLAUDE.md` (the `templates/` row and the `docs/` row) are asserted by
nothing and are left for the curator, though the `docs/` row's claim that `ls docs/` is the
authoritative set is false from this commit until G1 applies the ledger.

**2. The sentence the step expected to delete beneath the layout tree does not exist.** The step
asks for "the sentence beneath it that counts them" alongside the three tree rows. No sentence below
the tree accounts for the Plane entries — and that absence is itself a filed defect,
`circles/260801-1244-curator/issues/260814-1419_o_three-plane-files-entered-the-layout-tree-and-neither-of-the-two-per-surface-arguments-below-it-was-extended.md`,
which records that the three rows entered the tree while neither of the two paragraphs ranging over
the root-anchored surfaces was extended to cover them. Removing the rows closes that gap rather than
requiring a further deletion. Two open issues are retired by this step and neither transition is in
this step's file list: `260814-1419_o_…` above, and
`shared/issues/260810-0410_*_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md`,
whose subject is gone.

**3. `staging-drift.test.ts` names no Plane path.** It is in the step's file list among "the eight
test files that name a Plane path in a fixture list or an exclusion set"; it does not, and it needed
no edit. Five of the eight did.

**4. `hooks/dist/` is not in the step's file list and must ship.** The compiled hooks are committed
(`.gitignore` carries the `!hooks/dist/` exception) so that an HTTPS install is runnable with no
`npm`. `npm test` runs `rm -rf dist && tsc` first, so the two `staging-drift` outputs regenerated as
a side effect of verification. Every later step touching a `hooks/lib/*.ts` file inherits this.

**5. `skills/cadence/SKILL.md` keeps its Plane mention, deliberately.** Line 15 offers "Plane bridge
seeding" as an example of a human-readable topic label a cadence digest might assign. It cites no
path, the gates do not read it, and the file is not in this step's list. It is a stale example
rather than a false statement, and it is worth an edit at step 7, which already opens that file for
its `conceptrev` example.

**6. Two historical statements in test comments keep the word Plane and should not be edited.**
`state-drift-detection-lint.test.ts`'s `PRE_FIX` fixture is `git show 9bad4d6^:agents/orchestrator.md`
verbatim, and its provenance note explains that the one elision is a Plane-push clause — a statement
about a past commit, which stays true. `derivable-enumerations-lint.test.ts`'s header records that
the review which motivated the gate measured a skill list missing `seed-from-plane` — a statement
about a past measurement, likewise. Both files are in the step's list; editing either would falsify
history to tidy a word.

## Verification

`cd hooks && npm test` — **exit 0**, 48 test files, 903 tests, all passing.

**The suite duration is the visible half of this removal**, and it landed where step 1 predicted.

| | before (step 1) | after |
|---|---|---|
| Test files | 49 | 48 |
| Tests | 1 030 | 903 |
| Vitest duration | 76.57 s | 30.75 s / 37.19 s (two runs) |
| Wall clock, including `tsc` | 79 s | 33 s / 39 s |

Step 1 measured `fusion-plane.test.ts` at 75.587 s of a 76.57 s suite — 98.7 percent of it, and the
critical path almost exactly — and predicted that deleting it would drop the suite to roughly the
length of its next-slowest file, `fusion-paths.test.ts` at 32.9 s. It did. **Roughly 40 s of every
suite run, and 127 of its 1 030 tests, were the offline dry-run harness for a bridge that never
pushed anything.** The 127 tests are the largest single test file in the plan's deletion list and
this is the whole of that saving; the two runs differ by 6 s because `fusion-paths.test.ts` now sets
the critical path and it spawns real `bin/` processes.

The golden fixture moved by exactly the two rule-file deletions and nothing else:
`fusion-workbench-conventions.md` 53 124 → 52 756 bytes (−368),
`circle-records.md` 11 949 → 11 754 (−195). `RULE_BASELINE` was not re-cut — a deletion records
shrinkage and the two re-baselining events are elsewhere. Per-dispatch rule bytes for the leanest
agent fall 95 023 → 94 655 including this project's chat voice profile; the orchestrator's fall
130 440 → 129 877.

## Files written

Deletions marked as such; all paths absolute.

- `/Users/k1/Projects/productive/fusion/bin/fusion-plane` — **deleted**
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fusion-plane.test.ts` — **deleted**
- `/Users/k1/Projects/productive/fusion/skills/seed-from-plane/SKILL.md` — **deleted** (directory removed)
- `/Users/k1/Projects/productive/fusion/docs/plane-setup.md` — **deleted**
- `/Users/k1/Projects/productive/fusion/agents/orchestrator.md`
- `/Users/k1/Projects/productive/fusion/skills/setup/SKILL.md`
- `/Users/k1/Projects/productive/fusion/skills/cleanup/SKILL.md`
- `/Users/k1/Projects/productive/fusion/rules/fusion-workbench-conventions.md`
- `/Users/k1/Projects/productive/fusion/rules/circle-records.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/staging-drift.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/churn.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/churn-key-anchor.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/review-coverage.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/domain-cascade.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/monitor-warnings-panel.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/rules-emission.golden`
- `/Users/k1/Projects/productive/fusion/hooks/dist/lib/staging-drift.js`
- `/Users/k1/Projects/productive/fusion/hooks/dist/lib/staging-drift.d.ts`
- `/Users/k1/Projects/productive/fusion/README.md`
- `/Users/k1/Projects/productive/fusion/README-agents.md`
- `/Users/k1/Projects/productive/fusion/docs/working-model.md`
- `/Users/k1/Projects/productive/fusion/CLAUDE.md`
- `/Users/k1/Projects/productive/fusion/.claude-plugin/plugin.json`
- `/Users/k1/Projects/productive/fusion/fusion-workbench/circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-0742-coder-remove-plane-mirror-code-and-prose.md` (this entry)

Not touched, and deliberately: `templates/plane.config.yaml`, `fusion-workbench/plane.config.yaml`,
`fusion-workbench/.plane-map.json`, `fusion-workbench/.plane-outbox.jsonl` and
`hooks/lib/__tests__/fixtures/plane/` are step 3's, an `ontocoder` dispatch. The outbox and the id
map are the evidence quoted above; the workbench is git-tracked here, so deleting them at step 3
leaves that evidence in history and in this entry.
