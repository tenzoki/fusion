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
