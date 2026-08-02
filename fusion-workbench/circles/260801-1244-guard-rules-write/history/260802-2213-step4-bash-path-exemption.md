# Step 4 — C5a on the Bash path

**Status:** Complete
**Agent:** coder
**Circle:** `circles/260801-1244-guard-rules-write`
**Plan:** `circles/260801-1244-guard-rules-write/planning/260802-1856_o_plan-guard-rules-write.md` `### Step 4`

## What was implemented

Four files, all named by the step. The seam the predecessor Circle left
(`MutationOptions.exempt`) was wired; no parallel mechanism was built.

`hooks/lib/bash-mutation-guard.ts` — `MutationVerdict` gains `exempted?: string[]`.
`classifyBashMutation` owns an accumulator, threads it into `classifyWords` as a sixth
parameter, and the two existing `opts.exempt?.(...)` call sites (pass 1, the protected
match, and pass 2, the ancestor) now push the path they skip instead of only `continue`.
Pass 3 is untouched: an operand that does not resolve names no path a predicate could
accept. The allowing return stays byte-identical to `{ deny: false }` unless something was
actually exempted, and duplicates are removed at that one point, first occurrence winning.

A deny verdict carries no `exempted` field. A deny means the whole tool call was blocked
and nothing was let through, so an exemption note written for it would claim a write that
never happened — the same reasoning that puts the git override note after the mutation
check rather than before it.

`hooks/guard.ts` — the classifier call inside `if (!isFusionPluginCwd())` now passes
`exempt: rulesWriteExemptionActive(process.env) ? isProjectRulePath : undefined`. With the
flag unset the classifier is called exactly as it was before this existed, so the deny side
cannot drift. Immediately before STEP 3, a new STEP 2b records the note when the verdict
allowed and carries exempted paths: one `clear`-level entry (trigger
`rules_write_exemption`, message from `rulesWriteDetail`, `toolName: "Bash"`) and one
`guard_advisory` with the same detail string.

Two deliberate differences from the write-tool note at CHECK 2, both commented at the site:

- **It saves.** CHECK 2 pushes into an escalation object that a later branch always
  persists; on the Bash path there is no later save. Loading, pushing, saving and emitting
  in one place is also what lets this note and the git override note both survive one tool
  call — the second load reads what the first wrote. Verified end to end, not assumed:
  `git switch main && mv rules/x.md rules/retired/` with both variables set produces two
  `guard_advisory` events and two escalation entries, exemption first.
- **The `file` field carries the exempted path only when there is exactly one.** A shell
  command can write several, and a field typed as one path must not carry a list. The
  detail string names all of them either way.

`hooks/lib/__tests__/bash-mutation-guard.test.ts` — ten pure classifier cases on what the
verdict reports back: reported, ordered, deduplicated within a segment and across segments,
resolved rather than as spelled, reported out of the ancestor pass, and absent in all three
negative cases (predicate accepted nothing, deny, fail-closed deny).

`hooks/lib/__tests__/guard-rules-write-integration.test.ts` — ten end-to-end cases in a new
`describe`, listed with their measured results below.

`hooks/lib/__tests__/guard-bash-wiring.test.ts` — **not touched.** All 26 of its cases pass
against the edited source. The new branch trips none of them: it emits `guard_advisory`
rather than `guard_allow`, calls no `resetBlockCounter`, sits above `verdict.overrideUsed`
so the no-`return`-in-the-override-tail assertion is unaffected, and leaves `allow();` as
the function's last statement.

## Measured results

Raw guard output, one throwaway project root per case (`runBash`, real subprocess, state
read back from `escalation.json` and `events.jsonl`):

| Command | Flag | Verdict | Events | Escalation |
|---|---|---|---|---|
| `mv rules/x.md rules/retired/` | unset | block, reason names `rules/x.md` | `guard_block` | `consecutiveBlocks=1`, `block/protected_path` |
| `mv rules/x.md rules/retired/` | set | allow | one `guard_advisory`, `file=-`, detail names the variable and **both** operands | `consecutiveBlocks=0`, `clear/rules_write_exemption` |
| `rm -rf rules` | set | block | `guard_block` | `consecutiveBlocks=1` |
| `rm -rf rules/` | set | block | `guard_block` | `consecutiveBlocks=1` |
| `mv agents/coder.md /tmp/` | set | block | `guard_block` | `consecutiveBlocks=1` |
| `printf '' > rules/new.md` | set | allow | one `guard_advisory`, `file=rules/new.md` | `clear/rules_write_exemption` |
| `printf '' > .claude/rules/local.md` | set | allow | none | file never written |
| `ls -la` | set | allow | none | file never written |

The advisory detail for the move, verbatim:

```
Override FUSION_ALLOW_RULES_WRITE allowed a normally-denied write to a protected rule paths: rules/x.md, rules/retired/
```

(The `a protected rule paths` grammar error is a real defect in Step 2's `rulesWriteDetail`,
surfaced by the first caller that can pass more than one path. Filed, not fixed — see
`## Findings`.)

The deferred criterion at
`shared/planning/260801-1122_o_spec-normative-consolidation.md:316` is closed by the first
two rows: a shell move of a rule file into `retired/` is blocked with the flag unset and
allowed with it set, emitting exactly one `guard_advisory`.

## Falsification

Reverting was run, not reasoned about. Both source files put back to `HEAD` with
`git show`, tests unchanged:

- **Both files at HEAD** — 11 cases fail, all of them allow-side or wiring-dependent: the
  seven classifier cases that assert `exempted` is reported, and four integration cases
  (the flag-set move, the flag-set redirection, the both-permissions case, and the
  deny-after-exemption case, which at HEAD denies on the first segment instead of the
  second). Every deny-side case stays green — flag-unset move, `rm -rf rules` in both
  spellings, `mv agents/coder.md`, the `.claude/rules/` allow, the innocuous call, and the
  branch policy — because none of them is behaviour this step introduces. The three
  `exempted`-is-ABSENT classifier cases also stay green, correctly: at HEAD the field never
  exists.
- **`guard.ts` alone at HEAD, classifier kept** — the ten classifier cases pass and exactly
  the four integration cases fail. So the reporting and the wiring are separately
  load-bearing, and the wiring is what makes the flag a control.

Both files restored; `npm test` re-run green afterwards.

## Verification

- `cd hooks && npm test` → **871 passed**, 19 files (baseline 851 + 10 classifier + 10
  integration). Includes `tsc`, so the whole hook tree type-checks.
- `npx vitest run lib/__tests__/guard-bash-wiring.test.ts` → 26 passed, file unedited.
- `git status --porcelain` outside `fusion-workbench/` → the four in-scope files only.

`hooks/dist/` was left at `HEAD`. `npm test` is `tsc && vitest run`, so running the suite
rebuilds `dist` as a side effect; the rebuilt artifacts were reverted with
`git checkout -- hooks/dist` and the two newly-generated `dist/lib/rules-write-exemption.*`
files deleted. Step 10 owns that rebuild.

`hooks/lib/config.ts` and `hooks/lib/rules-write-exemption.ts` were read and not modified.

## Findings

Three, none of which changed the implementation. Full text in the report to the user; the
first is filed as an issue.

1. **`rulesWriteDetail` produces `a protected rule paths` for a multi-path list**
   (`hooks/lib/rules-write-exemption.ts:140-145`). The plural label is substituted into a
   singular article. The Bash path is the first caller that can pass more than one path, so
   the write-tool path never showed it. Filed as
   `circles/260801-1244-guard-rules-write/issues/260802-2213_o_rules-write-detail-says-a-protected-rule-paths-for-a-multi-path-list.md`.
2. **The plan's claim about which pass denies `rm -rf rules` is wrong** (plan line 222:
   "through the ancestor pass at `bash-mutation-guard.ts:1252`"). It denies in **pass 1**:
   `isProtected` (`hooks/lib/bash-mutation-guard.ts:897-906`) retries a non-slash operand
   with a trailing separator, so `rules` matches `rules/**` as `rules/`. The behaviour the
   plan wanted is exactly what happens — the deny is real, and the asymmetry that produces
   it is the load-bearing part: `isProtected` adds the separator, `isProjectRulePath`
   canonicalises it away, so neither `rules` nor `rules/` is ever a rule *file* and neither
   is exempt. Recorded in the test's comment at the case rather than filed, because nothing
   is broken; only a line of plan prose is inaccurate.
3. **`guardBashCommand` has no halt check** — `isHalted` is consulted only on the
   write-tool path (`hooks/guard.ts:427`). So with a halt active, a Bash mutation of a rule
   file with the flag set is still allowed and still notes. This is unchanged HEAD
   behaviour and out of this step's scope (criterion `:326` is a write-tool property, pinned
   by Step 3), but it means "the flag does not lift a halt" holds on one surface and is
   vacuous on the other. Raised for the reviewer rather than filed, since deciding whether
   the Bash path should honour halt at all is a design question, not a defect report.

## Not committed

Per the task. Four modified files, listed above.
