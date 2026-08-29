# coder — `/fusion:next`: the short-circuit's silent skip and the Status guard's split predicate

**Status:** Complete
**Agent:** coder
**Task:** Two defects sharing `skills/next/SKILL.md`, fixed in one pass.

## Source records

- `260813-1545_*_the-explicit-form-of-fusion-next-skips-the-confirmation-relay-and-no-step-says-so.md`
- `260811-2148_*_the-next-skills-status-guard-and-its-sed-action-ask-different-questions-so-a-valueless-field-is-skipped-silently.md`

Both renamed `_o_` → `_c_` with a `Resolved:` note appended.

## What changed

**Defect one — Step 3, the explicit-form short-circuit.** The paragraph said the run may skip
the Step 5 briefing and go straight to Step 6, and named only Step 5. Step 5b, the backlog
confirmation relay, is reachable from exactly one place: the closing line of Step 5. So the
explicit form skipped the relay too, silently. The paragraph now says the short-circuit skips
Step 5b as well, gives the reason (5b is reachable only from the end of Step 5), and states the
consequence: backlog operations the run's playmaker dispatch proposed are never put to the user
and stay in the portfolio until the next default-form `/fusion:next` asks about them.

**Defect two — Step 6.2, the `**Status:**` write.** A `grep -qE '^\*\*Status:\*\*'` pre-guard
tested for the field's presence; the `sed` behind it matched `^\*\*Status:\*\*[[:space:]].*$`,
one mandatory character more. A line reading exactly `**Status:**` passed the guard, was copied
through unchanged, and the `else` branch that would have said so never ran. Two predicates, one
gap, exactly where the reporting was meant to be.

The block now runs one test, not two:

```bash
sed -E 's|^\*\*Status:\*\*.*$|**Status:** active|' "$REC" > "$REC.tmp" \
  && mv "$REC.tmp" "$REC" || rm -f "$REC.tmp"
grep -qE '^\*\*Status:\*\* active$' "$REC" \
  || echo "note: $REC carries no **Status:** field, so none was set; the marker on the filename is the state" >&2
```

The `grep` pre-guard is gone, `[[:space:]]` is out of the `sed` pattern so a valueless line is
covered, and the note is decided from the *result* of the write rather than from a separate test
of the input — which makes it fire for every reason the write can miss, not only the enumerated
ones. `|| rm -f "$REC.tmp"` clears the temporary file on the failure path, so no `.tmp` survives
in the Circle directory.

The prose beside the block gained one sentence naming the single-predicate shape and warning
against reinstating a `grep` guard in front of the `sed`. The head-field bullet, which claimed
"a rename cannot land without it", now says the write rides the rename in the same call, that
`mv` and the rewrite are two commands rather than one atomic act, and that what the shape
guarantees is that a write which does not land is reported.

## Verification

Shell snippet measured against the three fixtures the source record names, in a scratch directory:

| fixture | line | result | note printed | `.tmp` left |
|---|---|---|---|---|
| a.md | `**Status:**` | `**Status:** active` | no | no |
| b.md | `**Status:** anticipated` | `**Status:** active` | no | no |
| c.md | no field | unchanged | yes | no |

The `sed`-failure path (missing input file) was measured separately: the `rm -f` runs and the
scratch directory is left empty.

Test suite run in a detached worktree at HEAD carrying only this patch, so concurrent edits to
other bounded surfaces could not confuse the signal:

`cd hooks && npm test` — exit 1, 750 of 751 passing. The one failure is
`surface-growth-bound.test.ts > matches the checked-in golden`, the per-file byte inventory,
which the dispatch names as expected and out of scope: `next/SKILL.md` 26821 → 27593 in that
worktree. The byte-budget assertion for the `skills` surface itself passed (11 of 12 assertions
in that file green). Re-run alone for a clean exit code: `npx vitest run
lib/__tests__/surface-growth-bound.test.ts` — exit 1, same single golden failure.

## Size

`skills/next/SKILL.md` 26821 → 27593 bytes in the isolated worktree, +772 against HEAD.
Against the working tree as this task found it the delta is the same +772. Above the ~250 the
dispatch anticipated, well inside the ~17 400 bytes of head-room it named. The overage is prose:
the short-circuit needed the reason and the consequence spelled out, not just the second step
name, and the head-field bullet had to state what the shape does guarantee after losing the
claim that was false.

## Not done

Nothing committed — the orchestrator stages and commits. The two issue renames were made with
`git mv` and then unstaged under `bin/fusion-commit-lock`, so the index is as clean as the
dispatch expects.
