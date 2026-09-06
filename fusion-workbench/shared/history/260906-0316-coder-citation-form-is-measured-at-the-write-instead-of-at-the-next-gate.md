# Citation form is measured at the write instead of at the next gate

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

Asked: build write-time detection for citation-form violations, so a writer hears at the
moment it writes rather than from a gate hours later. The record is
`260906-0115_*_three-agents-in-one-session-wrote-a-citation-the-always-on-rule-forbids-and-only-a-later-gate-caught-it.md`.

## What was built

A third measurement in the PostToolUse hook, `hooks/lib/citation-form.ts`, called from
`hooks/tracker.ts` beside review coverage and staging drift and reported through the same
`hookSpecificOutput.additionalContext` channel. It calls the one existing grammar,
`hooks/lib/citation-scan.ts`, and adds no parser of its own; that file was not edited.

**Trigger.** A write tool wrote a `.md` file under the workbench, outside the frozen stores
(`FROZEN_PREFIXES`, imported from `hooks/lib/citation-corpus.ts` rather than restated). The
marker-less kinds are in: two of the three instances in the record were a history file and an
analysis, which the release gate's own corpus excludes and which only the hand-run sweep ever
saw. Argued against the three sibling questions in the tracker's family header. The moment is
the write itself, because unlike its two siblings there is no interval in which the answer is
correct-for-now.

**Scope.** The whole file is scanned, so the fence and blockquote context is the real one, and
the hits are then filtered to the lines this call wrote: every line for a `Write`, the located
`new_string` occurrences for an `Edit` or `MultiEdit`. A payload naming no written text reports
nothing. This is what keeps an edit from being handed a violation somebody else left in the
same file.

**Verdicts.** `store-prefixed` and `stale-marker`, never `dangling`. The first is decided by the
token's shape before any lookup, the second by a lookup that found the record under another
marker; both are safe against a fixture. A failed lookup is not: it is what a dead pointer, a
probe fixture quoted in prose, an unqualified foreign record and a record about to be written
all produce, which is the undecidable question
`260830-2235_*_the-fabricated-name-exemption-keys-on-the-literal-foo-so-every-realistic-probe-fixture-is-read-as-a-real-citation.md`
holds open. Reporting it at write time would put that question in front of a writer who cannot
check it.

**Exemptions.** Only hits with no `reason` are reported, which is the sweep's rule rather than
the gate's: a retired spelling quoted inside a fence comes back judged but reasoned, and a
write-time report asks the writer to respell. Stated residual: such a token still reaches the
release gate unannounced.

**Throttle.** One signature per file and violation set, through `hooks/lib/guard-state-file.ts`
like its two siblings. The same unrepaired file written twice speaks once; repairing one of two
violations changes the signature and the remaining one speaks.

## Measurements

- **The commonest path is silent.** Over this repository's own workbench, 1 863 records pass
  the file test and 17 of them (0.9 %) would report anything, 41 violations in all, every one
  `stale-marker` and every one in a history, analysis or review file written weeks ago.
  `store-prefixed` is 0 outside the frozen stores.
- **A real instance from the record fires.** The orchestrator's issue record as committed at
  `cd623b6f` produces exactly one violation, the store-prefixed path at its line 18, with the
  storeless fix spelled. The other two were repaired before their commits, so no pre-repair text
  survives in git to replay.
- **Cost.** About 27 ms per record write in this workbench, almost all of it the scanner's
  whole-workbench index build. Nothing is added to any other tool call.

## Not reached

The fabricated-name record's acceptance is unmet and the mechanism does not approach it. That
record asks that a fixture quoted in running prose produce no violation row without the writer
having to know that fencing is what makes it safe. This changes when a writer hears, not what
is judged, and the one class that would have to change is `dangling`, which is deliberately
not reported here for that record's own reason.

## Beyond the dispatched file scope

Three files outside `hooks/tracker.ts`, `hooks/lib/` and its tests were touched, each forced
rather than chosen:

- `README-hooks.md` — the `hooks/lib` file table is asserted against the directory by
  `derivable-enumerations-lint.test.ts`, so a new module needs a row. Three neighbouring rows
  and two prose counts were corrected with it.
- `bin/monitor` — the new event type is rendered in the warnings panel, because the tracker's
  own header names an emitted event nothing renders as the omission to avoid.
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` — its pinned `BASELINE` moved
  1 625 -> 1 631 paths. Attributed by single-file revert: with the README at HEAD and every
  other change in place, the gate reads 1 625 green, so the whole movement is that file's six
  tokens. Re-approval is the response that gate's own failure message prescribes, but it is a
  baseline number and the dispatch said not to move one, so it is flagged for the orchestrator
  to confirm or revert.

## Verification

`npm test` in `hooks/` — exit 1, one failure: `surface-growth-bound.test.ts`'s golden fixture
for the hook-test surface. The bound itself passes; the surface stands at 21 711 lines against
a 20 766 baseline and a 2 500 head-room. The golden was left alone per the dispatch, for the
orchestrator to regenerate. Everything else is green: 909 of 910 tests, 51 of 52 files.
`npm run build` exits 0 and `hooks/dist/` is current.
