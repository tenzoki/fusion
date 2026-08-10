# coder — `I:260810-0507-plane-doc-key`: the Plane doc stops teaching a key the tool rejects

**Status:** Complete
**Session:** 260810-1402, Turn 1
**Agent:** coder
**Task:** tasklist.md task 27
**Origin:** `shared/issues/260810-0507_o_plane-setup-doc-still-documents-the-marker-bearing-key-so-map-forget-fails-as-written.md`

## What changed

`docs/plane-setup.md` only — the `map --forget` paragraph under `#### The procedure`, step 5
("Clean up"), the paragraph opening "Run it once per stale entry".

It documented a Circle sub-artifact as keyed `<circle-dir>::issues/<file>.md`, where `<file>` read as
the on-disk filename. Since `f320db2` the on-disk filename is not the key: the single-char state
marker is stripped out of it. A user copying the prose spelling into `map --forget` got
`no such key … — map not changed` and exit 1.

The paragraph now says:

- the key shape, marker-free — `<circle-dir>::issues/<stamp>_<slug>.md` and the `decisions/` sibling,
  with `<stamp>` defined as the filename's `YYMMDD-HHMM` (it was used undefined here and again further
  down the file),
- `shared` as the scope for an artifact belonging to no Circle,
- **why** the marker is absent, in one clause: dropped "so that the key survives the state transitions
  this mirror exists to push". That is the whole point of `f320db2` and the thing a user
  hand-composing a key is most likely to get wrong,
- the transform worked on a placeholder name: `<stamp>_o_open-issue.md` →
  `<circle-dir>::issues/<stamp>_open-issue.md`.

The pre-existing advice to read keys off a `map` dump stays, now qualified with "already in that form".

## Verified against the tool, not the record

Per the task, the shape was checked against `bin/fusion-plane` rather than against the defect record.
`natural_key()` builds `<scope>::<subdir>/<stable_basename>`, and `stable_basename()` drops the first
`_<letter>_` after the stamp (`sed -E 's/^([0-9]{6}-[0-9]{4})_[a-z]_/\1_/'`). The tool's own header
block states the same shape with `<circle-dir | "shared">` as the scope. Tool and record agree; nothing
to report on that front.

Acceptance criterion 3 — that a hand-composed key is accepted — holds because `map_forget` tests
membership against `map_json`, which serves the folded (marker-free) view, so the marker-free spelling
resolves against a legacy map as well as a `key_format: 2` one.

`bin/fusion-plane` was read only. Three other open records concern its key derivation and flags; none
is this task.

## One thing worth knowing for the next doc edit

The first draft illustrated the transform with a realistic filename carrying a real-looking timestamp.
`lib/__tests__/reference-resolution-lint.test.ts` reads a stamped, marker-bearing basename in shipped
text as a *record citation* and fails when no workbench record matches it — two violations, one per
spelling. The lint is right and the fix is not an allowlist entry: use the `<stamp>` placeholder, which
is what the rest of this file already does. Recorded here because the trap is invisible until the
suite runs, and the tempting escape (an `e.g.` announcement, or a `RECORD_EXAMPLE_FILES` entry) would
have widened an exemption to buy a cosmetic gain.

## Verification

`cd hooks && npm test` — exit 0, 40 files, 1067 tests.

An intermediate run failed exit 1 on `fusion-commit-lock.test.ts` (the wall-clock poll, known open
defect, task 32). Re-run in isolation: 10 passed, exit 0; the next full run was clean. Not a
regression, and not caused by this change — the change touches no code.

Not committed. The orchestrator stages and commits, and renames the record's `_o_` marker to `_c_`.
