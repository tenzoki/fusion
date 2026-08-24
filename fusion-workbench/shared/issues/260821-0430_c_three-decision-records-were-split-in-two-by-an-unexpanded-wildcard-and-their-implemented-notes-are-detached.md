Three decision records were split in two by an unexpanded wildcard, and their Implemented notes are detached from the records they belong to

---
Commit `30d6f0a` set out to realise the last three open decisions in the live stores: append an
`Implemented:` note to each and rename `_a_` to `_i_`. What landed instead is three **new** files whose
names carry a literal asterisk where the topic slug belongs, each containing only the note, while the
three originals keep their `_a_` marker and their full body. The decisions therefore still read as
answered-but-unrealised, and the evidence that they were realised sits in a file that is not the record.

---

**Domain:** code
**Filed by:** orchestrator
**Found by:** playmaker, during the Phase 4 portfolio refresh of 260821, unprompted

## The six files

| Record, still `_a_` | Phantom |
|---|---|
| `circles/260801-1244-curator/decisions/260814-1915_a_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md` | `260814-1915_i_*.md` |
| `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-1845_a_does-analyst-get-a-project-local-rule-pattern-now-that-the-investigator-fold-orphaned-one.md` | `260815-1845_i_*.md` |
| `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-2056_a_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md` | `260815-2056_i_*.md` |

## The likely mechanism, stated as an inference

A rename written with the wildcard citation form, `<stamp>_*_<slug>.md`, passed to a command that did
not expand it. The wildcard form is correct for a **citation** and is mandated for one; it is never a
filename. The shell wrote the literal. Not verified against the session transcript, so treat the
mechanism as unconfirmed and the six files as the fact.

## Why no gate saw it

Three were run against it during the refresh. `marker-format-lint` and `workbench-citation-lint` both
pass. The citation gate resolves paths that are cited and these files are cited by nothing; the marker
lint reads the marker position, and `_i_` is a valid marker. Nothing reads the **slug**, and nothing
asks whether two records share a stamp inside one store.

## Three consequences, in increasing order of cost

1. A filename carries a glob metacharacter. Any unquoted expansion over that directory now behaves
   unpredictably, which is the trap `rules/fusion-workbench-conventions.md` `## Marker globs` exists to
   prevent, arriving from the filename side rather than the pattern side.
2. Three decisions read as unrealised. A reconciliation pass that filters on `_a_` will keep proposing
   work that is already done.
3. The `Implemented:` citations are detached from the records they attest to. That is the traceability
   the decision vocabulary exists for, and it is exactly what
   `rules/decision-record-examples.md` `## Anti-patterns` names as the thing not to omit.

## Acceptance

- Each of the three notes is appended to the record it belongs to, and each record carries `_i_`.
- No filename in any store contains a glob metacharacter.
- Whatever repairs this leaves the phantom's text in the record rather than discarding it: it names
  commits, byte figures and a residual, and none of that is recoverable from the record alone.

## Not repaired here, deliberately

This changes three decision markers, which is Grounding, and it was found after the Circle that could
have carried it had closed. It is the user's to approve.

---
Resolved: fixed — each phantom's Implemented note (with commit 30d6f0a named) is appended to its record, the three records are renamed _a_ to _i_ and the three *-named files are deleted, so `find fusion-workbench -name '*\**'` returns nothing; cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts
