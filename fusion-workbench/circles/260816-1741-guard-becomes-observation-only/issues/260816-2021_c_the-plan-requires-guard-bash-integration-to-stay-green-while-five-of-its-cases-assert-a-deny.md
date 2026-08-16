The plan requires guard-bash-integration.test.ts to stay green while five of its cases assert a deny

---

The plan's `## Testing Strategy` names `guard-bash-integration.test.ts` first among the files
that "must stay green throughout" and adds that "any of them going red is evidence that a step
reached further than it was meant to". Step 9's file list, which owns every test edit in this
Circle, does not name the file at all — neither among the four deletions nor among the nine
edits.

Both statements are wrong about the file's contents. Five of its fifteen cases assert a CHECK 3
deny or the fusion-repository stand-down, and step 2 removes the subject of all five. Measured
after step 2 landed:

- `integration harness — preconditions > runs the guard against a root the write guard does NOT
  stand down in` (`:89`) — the precondition case, which asserts a block on the write surface.
- `the Edit write path still denies a governed path > blocks an absolute file_path under the
  project root` (`:107`).
- `ordinary work is allowed and writes nothing > innocuous Bash after a block neither resets the
  counter nor appends an event` (`:201`) — its opening block is a write-tool deny, and the case's
  own comment records that the opening block has already been re-pointed twice for exactly this
  reason.
- `self-detect stand-down: the write guard yields > stands the Edit write path down` (`:258`).
- `self-detect stand-down: the write guard yields > denies the same write as soon as the plugin
  manifest is not at cwd` (`:278`).

The two properties the Testing Strategy actually names are green and were verified case by case:
`a fresh project running innocuous Bash writes no counter and no event` passes, and
`allows an unguarded file_path, and records the allow` passes, so the Bash zero-side-effect
property (issue `260707-0751`) and the `guard_allow` write trace both survive step 2 intact.

The file also carries a `describe` block whose whole subject is the stand-down, and header prose
describing the stand-down and a protected-path fingerprint that left on 2026-08-12.

---

Context: found while implementing plan step 2
(`circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_p_the-compliance-guard-becomes-observation-only.md`).
The dispatch asked for the list of failing test files rather than a fix, so nothing was changed
in the test file.

What it costs if it stands: step 9 works from a file list that omits this file, so the five cases
stay red through the rest of the Circle and `npm test` cannot be the gate step 9's own
verification claims it is. The Testing Strategy's falsifier is also inverted — a reader told that
this file going red means a step overreached will read a correct step 2 as an overreach.

Proposed shape of the fix, for step 9 to decide: add the file to step 9's list; delete the
`self-detect stand-down` describe block with its subject; re-point the precondition case and the
deny case onto the surviving allow-and-trace property; and re-point the opening block of the
`innocuous Bash after a block` case a third time, or retire the case, since no deny of any kind
remains to open it with. Correct the Testing Strategy's claim in the same pass, so the file is
named as one that follows the removal rather than as one that must not move.

---
Resolved: step 9, 2026-08-16. The file was added to step 9's list and the five
cases were dealt with as this record proposed, with one departure it did not
anticipate.

The `self-detect stand-down` describe went with its subject, and so did the
`macOS realpath trap` case — not named here, and it had to go for the same
reason one step further on: its subject was a deny arriving as a SILENT ALLOW
through an unresolved path, which is indistinguishable from correct behaviour now
that every path allows. The trap itself is not gone and `makeProject` still
resolves its root; what moved is which side of it bites, and the harness header
now states the current one (a case reads `events.jsonl` back through the root
string it was handed, while the child anchors `.guard-state/` on its own resolved
cwd).

The precondition case was re-pointed rather than retired: it asserts that the
hook was reached at all and answered with the shape Claude Code is promised. The
`innocuous Bash after a block` case was re-pointed a third time as this record
offered, by dropping the opening block entirely — the eight commands and the
silence after them were all it was ever about.

The two properties the Testing Strategy names are green, and both are now
asserted through `guardStateWritten`, which is stronger than the two-file
spelling they had: it needs no list of files, so a writer added to the Bash path
fails them without anyone remembering to name it. That helper was deleted in 2026
when the protected-path measurement made it undiscriminating and is restored with
the measurement gone.

The Testing Strategy's own claim was NOT corrected — it still names this file
among those that must stay green throughout, which is the half of this record
that belongs to whoever next edits the plan's prose rather than its steps.

History: `circles/260816-1741-guard-becomes-observation-only/history/260816-2250-step-9-test-surface-follows-the-removal.md`.
