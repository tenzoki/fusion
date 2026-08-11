# The record-counts block: the probe, the values, and the shell claim

**Status:** Complete
**Agent:** coder
**Directive:** Fix the three review findings against `### The record counts are computed, not tallied` in `agents/orchestrator.md` as one unit — `shared/issues/260811-1406` (High), `260811-1407` (Medium), `260811-1412` (Low), all three against the twenty lines commit `7749845` added as task 28.
**Files changed:** `/Users/k1/Projects/productive/fusion/agents/orchestrator.md`; `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/record-counts-measurement.test.ts` (new); the three source records.
**Verification:** `cd hooks && npm test` — 49 files, 1270 tests, exit 0.

---

## 1406 — the probe asked the wrong question, not just of the wrong store

The block guarded against an untracked workbench with `git cat-file -e "$A:./${SCAN_ISSUES%% *}"`,
which is the **first** store, which `bin/fusion-paths` makes the active Circle's. Git tracks no empty
directory, so every Circle that had filed no committed record by the session anchor read as an
untracked workbench.

Neither fix direction in the record was taken as written. Probing `shared/issues` has the same
weakness one step further out (a workbench whose shared store holds no committed record yet), and
probing every store spends one `cat-file` per store to answer the same proxy. The bound the probe
exists for is *"the project does not track its workbench"*, and git answers that directly: the probe
is now `git -C "$WORKBENCH" cat-file -e "$A:./"` — the workbench **tree** at the anchor. A store that
is empty at the anchor is no longer evidence of anything, which is correct: it says nothing about
whether the counts can be taken, and they can, because they are on the disk.

`records=unmeasured` stays reachable and now names its cause in a `why=` field, reusing the shape
`bin/fusion-review-coverage` already reports in the section below:

- `why=no-anchor-in-agentstate` — `agentstate.yaml` missing, or holding no `git_head_at_start` and
  `started`.
- `why=workbench-not-in-anchor-commit` — the anchor resolves to no workbench tree. Three concrete
  reasons fall in here: an untracked workbench, a project outside git, and an anchor that has left
  this repository's history.

The closing instruction was rewritten to match: copy the reported cause through, never one you
inferred.

## 1407 — the block resolves its own keys now

`$WORKBENCH`, `$SCAN_ISSUES` and `$SCAN_DECISIONS` were read as live shell variables that nothing
sets, and their absence was called a fusion bug. The block now resolves them itself through
`bin/fusion-paths`, the way the Phase 4 queue retirement resolves `OUT_PLAN` — chosen over the
sibling block's substitution sentence for the reason the record gives, that a block this long gets
pasted rather than retyped. `agentstate.yaml` is read through `$WORKBENCH` too, so the block no
longer assumes the working directory is the project root.

The empty-key assertion stays (`rules/fusion-workbench-conventions.md` `## Path Resolution` →
*Where the call belongs*) and now has real values to assert on. Its message no longer says "fusion
bug": it prints the resolver's exit code, and the prose points at the exit-code table, where 3 is the
user's `.active-circle` and 4 is a fusion bug. The third possibility the record named — a value never
substituted into this shell — is gone by construction, because nothing is substituted any more.

## 1412 — the justification, not the code

*"The Bash tool runs zsh"* is a property of one machine. Replaced by the property an agent can
actually reuse: the loop splits under bash and does not under zsh, so it is one shell's correct code
and the other's silent single-path `find`; lines read the same in both. The implementation is
untouched, as the record asked.

## The gate

`hooks/lib/__tests__/record-counts-measurement.test.ts` (22 tests) extracts the block through the
existing `helpers/prompt-blocks.ts` extractor — no second extractor — and **runs** it in `/bin/bash`
and `/bin/zsh` over throwaway projects whose stores it builds, with `WORKBENCH`, `SCAN_ISSUES` and
`SCAN_DECISIONS` deleted from the environment on every run. It asserts the counts against the disk,
that an empty Circle store at the anchor produces the same counts as a populated one, that
`unmeasured` fires for exactly the two causes and carries the right `why=`, that the empty-key
message names the resolver's exit code rather than blaming fusion, and that the section's prose
claims no shell for the Bash tool.

Its three controls run the block **as it shipped**, read out of commit `7749845` rather than
transcribed, over the same fixtures: it reports `unmeasured` where the fix measures, it exits 1 with
`fusion bug` where the fix exits 0, and its prose carries the zsh claim the new gate rejects. A
control against invented text would prove nothing about what shipped.

What this gate is not: proof that a session runs the block. Nothing in it executes at session time.

## Measured

Block extracted verbatim, run in both shells, five workbench shapes. Circle active with its issue
store empty at the anchor and one record filed into it this session: `2 filed issue`, `1 now_c issue`,
`2 now_o issue`, `1 now_a decision` — byte-identical under bash and zsh, and identical to the same
tree with the Circle store populated at the anchor. No active Circle: `1 filed issue`, `1 now_c issue`,
`1 now_o issue`, `1 now_a decision`. Untracked workbench: `records=unmeasured
why=workbench-not-in-anchor-commit`. No `agentstate.yaml`: `records=unmeasured
why=no-anchor-in-agentstate anchor=none start=none`. Run from `fusion-workbench/shared/` instead of
the project root: unchanged, which the pre-fix block could not do.

The same three cases run against the **shipped** block reproduce all three findings first:
`records=unmeasured` over the tracked workbench with the empty Circle store, and `fusion bug: a
resolver key is empty` with exit 1 in a shell that was given nothing.

## Carried, not fixed

`hooks/lib/__tests__/glob-nomatch-lint.test.ts:9` repeats the same generalisation in a source comment
("The Bash tool runs zsh 5.9 with `nomatch` on by default"). It does not ship to consuming projects,
which is the harm record 1412 is about, so it was left; it is noted in that record's `Resolved:` note.

One prose edit was forced by `path-literal-lint.test.ts`: a sentence naming a type folder as a
literal was rewritten to name the issue store instead.

## Out of scope

The other five findings from the same review, and the deferred decision
`shared/decisions/260811-1146_*_does-the-measurement-family-get-a-shared-chassis-before-the-fourth-module.md`
about a shared chassis for the measurement modules. No fourth module was built here either; the
block is still one shell block over data already on disk.
