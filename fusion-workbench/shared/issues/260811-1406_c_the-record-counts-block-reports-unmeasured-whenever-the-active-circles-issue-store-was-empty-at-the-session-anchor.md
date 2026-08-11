# The record-counts block reports `unmeasured` whenever the active Circle's issue store was empty at the session anchor

---
**Severity:** High — the mechanism that replaced the hand tally does not run for the common Circle session, and the prompt then directs the model to state a cause that is false
**Domain:** code
**Filed by:** coderev, reviewing Turn 2 range `270c566..1d5eed6` (commit `7749845`, task 28)
**Affects:** `agents/orchestrator.md:621` — the `git cat-file -e` probe in `### The record counts are computed, not tallied`
**Cross-references:** `shared/issues/260810-1205_c_the-session-closure-and-filing-counts-are-hand-maintained-and-both-drifted-by-two-against-the-disk.md` (the record this block closes); `bin/fusion-paths:266-270` (`scan_value`); `shared/history/260811-1247-three-orchestrator-prompt-corrections.md`

---

## The defect

The block's guard against an untracked workbench is

```sh
if [ -z "$A" ] || [ -z "$T" ] || ! git -C "$WORKBENCH" cat-file -e "$A:./${SCAN_ISSUES%% *}" 2>/dev/null; then
  echo "records=unmeasured anchor=${A:-none} start=${T:-none}"
```

`${SCAN_ISSUES%% *}` takes the **first** store in the resolver's list. `bin/fusion-paths`
`scan_value()` emits the Circle store first and the shared store second:

```sh
printf '%s %s' "$CIRCLE/$1" "shared/$1"
```

So whenever a Circle is active, the probe asks git whether `circles/<dir>/issues` existed as a
tree at `session.git_head_at_start`. Git does not track empty directories, so the probe fails for
every Circle that had filed no committed issue at the moment the session began — including every
Circle created or activated during the session.

The block then prints `records=unmeasured` and the prompt (`:644`) instructs: *"When it fires,
write `unmeasured` into those four cells verbatim and say which of the two causes applies."* The
two causes it names are a missing anchor and an untracked workbench. Neither applies here. The
workbench is fully tracked and both counts are perfectly measurable from `shared/`.

## Measured

Scratch project, workbench fully committed, both shells, block extracted verbatim from
`agents/orchestrator.md:618-636`:

- **Circle active, `circles/260810-0900-demo/issues/` holds no file at the anchor** —
  `records=unmeasured anchor=0791c17 start=260811-1000` under zsh and under bash, although
  `shared/issues/` at the anchor carries the records the count needs.
- **Same tree, `SCAN_ISSUES=shared/issues` only** — `1 filed issue`, `1 now_c issue`,
  `1 now_o issue`. Correct.
- **Circle active, Circle store present at the anchor** — `1 filed issue`, `1 filed decision`,
  `2 now_c issue`, `1 now_a decision`, identical under both shells. Correct.

Frequency in this repository's own workbench: 4 of 12 Circle directories hold no git-tracked file
under `issues/` at all (`git ls-files circles/*/issues`), so a session against any of those four
would print `unmeasured` for its whole life; the remaining eight were in that state for the early
part of theirs.

## Why the two-shell verification did not catch it

The executor's history reports the block run "in bash and zsh, single-store and two-store". The
two-store case exercised the *splitting* — the reason the store list is turned into lines rather
than iterated — not the probe. The probe's failure mode is not about splitting and is invisible
unless the first store is one git has never seen.

## Fix direction

The probe asks "does the anchor commit contain any of this workbench's stores?" but reads only
the first one. Two shapes are available:

1. **Probe the shared store rather than the first.** `shared/issues` is the one store every
   workbench has and every session's `git_head_at_start` predates. It is also the store the
   untracked-workbench case is genuinely about.
2. **Probe every store and treat "none of them exists at the anchor" as the untracked case.**
   Strictly correct, one `cat-file -e` per store, and it degrades to (1) in practice.

Either way the `unmeasured` sentence at `:644` should name the cause it actually detects, so a
model does not report a tracked workbench as untracked.

---
Resolved: The probe no longer asks about a store. `agents/orchestrator.md` now runs
`git -C "$WORKBENCH" cat-file -e "$A:./"` — the **workbench tree** at the anchor — which is the
condition the bound was written for ("the project does not track its workbench") rather than a proxy
that git answers `false` for every empty directory. Neither of the two fix directions in this record
was taken as written: probing `shared/issues` (option 1) still misses a workbench whose shared store
holds no committed record yet, and probing every store (option 2) answers the same question one
`cat-file` per store more expensively while inheriting the same weakness. The tree probe is the
decided form of the question the block was already trying to ask.

`records=unmeasured` stays reachable and now carries the cause in a `why=` field, the way
`bin/fusion-review-coverage` reports its own: `why=no-anchor-in-agentstate` when `agentstate.yaml` is
missing or holds no `git_head_at_start`/`started`, `why=workbench-not-in-anchor-commit` when the
anchor resolves to no workbench tree (untracked workbench, project outside git, or an anchor that has
left the repository's history). The sentence at the end of `## Two bounds` was rewritten to name
those two causes and to instruct that the reported cause is copied through rather than inferred.

Measured, block extracted verbatim and run in `/bin/bash` and `/bin/zsh` over throwaway projects:
Circle active with its issue store empty at the anchor and a record filed into it this session —
`2 filed issue`, `1 now_c issue`, `2 now_o issue`, `1 now_a decision`, identical in both shells and
identical to the same tree with the Circle store populated at the anchor. Untracked workbench —
`records=unmeasured why=workbench-not-in-anchor-commit`. No `agentstate.yaml` —
`records=unmeasured why=no-anchor-in-agentstate anchor=none start=none`.

Gated by `hooks/lib/__tests__/record-counts-measurement.test.ts`, which extracts the block through
the shared `helpers/prompt-blocks.ts` extractor and runs it in both shells over fixtures it builds;
its control runs the block **as it shipped** (read out of commit `7749845`, never transcribed) over
the same fixture and asserts it reports `unmeasured` there. `cd hooks && npm test` — 1270 passed,
exit 0.
