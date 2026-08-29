# The twenty-four statement-citations are rewritten as addresses

**Status:** Complete
**Agent:** coder
**Circle:** `260819-1645-four-constraints-on-deep-change`
**Step:** 9b — not in the plan; option 4 of the user's answer at the foot of
`260820-0530_*_twenty-six-citations-in-the-corpus-are-statements-rather-than-pointers-and-no-exemption-expresses-that.md`
**HEAD at start:** `b6ed978`

---

## The result

**Zero violations from `scanRecordCitations` over the repair corpus, in both readings.** No
allowlist was touched, no exemption was added, and no hit was left. Nothing is named below as a
residual leave, because there is none.

| | wide (decisions `_o_` or `_a_`) | narrow (decisions `_o_`) |
|---|---|---|
| files | 192 → 192 | 172 → 172 |
| gate-judged tokens | 938 → 921 | 839 → 822 |
| **violations** | **24 → 0** | **24 → 0** |
| of which `stale-marker` | 24 → 0 | 24 → 0 |
| of which `dangling` | 0 → 0 | 0 → 0 |
| of which `wrong-store` | 0 → 0 | 0 → 0 |

The corpus predicate is step 8c's and step 9a's, unchanged: Circle records in every state,
`portfolio.md`, issues carrying `_o_`, decisions carrying `_o_` or `_a_` in the wide reading and
`_o_` alone in the narrow one, `archive/` excluded. The **before** column was re-measured at
`b6ed978` rather than carried over, and it confirms step 9a's figure exactly — 26 minus the two
the fenced-code exemption freed on its own, in the same ten records and at the same line numbers
the defect record tabulated.

The seventeen gate-judged tokens that left the corpus are the reproductions themselves. A
statement that no longer spells an address produces no token, so the token count falls by roughly
what was rewritten; it is not evidence that anything was hidden.

## The form chosen per hit

Fourteen went to prose naming file and line; ten went into a fenced block. The split is not a
preference — prose was the default and the fence was used only where the record's subject **is**
the spelling, so that correcting the citation would destroy the finding rather than move it.

### Prose naming file and line — 14 hits, 8 records

| record | line(s) | what the sentence says now |
|---|---|---|
| `260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md` | 72 | The specimen was decoration on a claim about a class (517 of 1104 stale markers sit in `history/`). It is replaced by a real address, `260810-0819-reconciliation.md:310`, which lists four records by the marker each carried that day and where at least one has since closed. Verified by grep before writing; the sentence's own claim is unchanged. |
| `260816-0119_*_the-lints-newly-widened-surface-still-stops-at-hooks-lib-tests-where-real-citations-have-gone-stale.md` | 29, 31, 54 | All three already carried the address of the *citing* line and reproduced the cited token beside it. The reproduction is dropped and the address kept, with "open the line for the exact citation" said once per bullet. Line 31 had no address at all — it said "Citations of … remain" — so one was measured: `hooks/lib/__tests__/reference-resolution-lint.test.ts:1011` is the only occurrence in the tree. |
| `260815-1913_*_closing-the-plan-dangles-thirty-four-workbench-citations-that-spell-its-open-marker.md` | 12 | The plan is now cited in the resolvable `_*_` form and the rename is stated in words (`_o_` → `_c_`). Nothing is lost: the old filename still stands verbatim two lines below, inside the fenced `grep` it is the argument to, which is one of the two hits the fenced-code exemption already freed. |
| `260811-2105_*_circle-records-carry-the-same-silent-citation-form-and-a-third-of-their-citations-are-stale.md` | 102 (two tokens) | A reconciler note that already named the file and both line numbers, `:7` and `:167`. The two reproductions are replaced by which field carries them and which marker each spells against which current state. |
| `260816-0105_*_a-sub-agents-staged-rename-is-absorbed-by-the-orchestrators-next-commit-and-the-staging-list-cannot-prevent-it.md` | 17, 18 | Both records are now cited in the `_*_` form, which resolves for each (the second through the `260817-1907` archive sweep), with the rename stated in words. The address of the verbatim old and new filenames is named: `git show --stat a19c867`, the commit the finding is about. |
| `260815-1247_*_the-implemented-decision-records-two-cross-references-were-broken-by-the-commit-that-transitioned-it.md` | 65 (two tokens) | Identity kept, spelling moved: the two targets are cited in the `_*_` form and the clause says a literal `_o_` stands in each marker position at the already-named `260811-2009_*_…:7`. |
| `260815-0804_*_a-decision-records-cross-reference-points-at-an-a-circle-md-that-activation-renamed.md` | 5 | The record's `**Affects:**` field ten lines below already carries the exact address, down to `:7`. The opening sentence now points at it and names the stale form as a basename (`_a_circle.md`), which is a marker form and not an address. |
| `260813-0913_*_a-dependency-between-two-circles-can-only-be-recorded-on-one-side-because-nobody-may-write-the-other.md` | 112 | The note said "the closing section says …". That section is in this same file, so the address is `:91`, and it is now named. |
| `260818-0715_*_the-orchestrator-prompt-names-a-fusion-record-inside-the-instruction-for-what-to-report-to-the-user.md` | 75 | The note is about this record's own `**Cross-references:**` line, so the address is `:62`. Identity kept by citing the target in the `_*_` form. |

### A fenced block — 10 hits, 2 records

| record | line(s) | why the bytes, and what the fence covers |
|---|---|---|
| `260814-1419_*_nine-open-marker-citations-were-left-literal-on-lines-where-their-siblings-were-starred.md` | 18, 19, 21, 22, 24, 25, 26 | The right-hand column of a nine-row table is a verbatim transcript of what nine other records spell. The whole record is the report that they spell it that way; a corrected citation would no longer be the thing found, and no address inside those records was recorded when the finding was made. |
| `260812-1720_*_…-where-citations-are-densest.md` | 24, 25, 26 | A bullet enumerating the **forms** stale citations take in the wild, with three spellings and their occurrence counts. There is no single address to name: the three spellings occur nineteen times across the repository, and the spelling is the datum. |

**The fence was cut to the smallest span that carries the transcript, not to the paragraph.** In
the nine-row table the two columns answer different questions, and only the right one is a
transcript. The table therefore keeps its left column as ordinary markdown — nine live citations
of the edited records, still judged by the gate — and its right column becomes `(1)`…`(9)`,
keyed to one fenced block below it. In the bullet list, the prose and the counts stay outside and
only the three spellings go in.

**What that still costs, stated because it is the objection the file allowlist lost on.** Twelve
citations are now unjudged that were judged before: the nine transcribed spellings and the three
specimen spellings. If one of them ever becomes *wrong as a transcript* — mistyped, or edited by
a later hand — no gate will say so. That is a smaller surface than a file allowlist over the same
two records would have been: those two files still carry **24 gate-judged citations between them
after the rewrite** (16 and 8, measured, all resolving), the table's whole left column included,
and an allowlist would have taken every one of them out of the gate as well. The fence is bounded
by construction instead — four to eleven lines long, holding nothing but the transcript.

## Two neighbouring claims were false, and both are now past tense

Rewriting a claim means reading it, and two of the ten had gone false since they were written —
in both cases because an **earlier repair step of this same Circle** had already starred the very
line the note reported as literal.

- `260818-0715_*_…:75` said one citation in its own `**Cross-references:**` "no
  longer resolves", and closed by saying the body was "left unedited on that basis rather than
  silently repaired". Commit `ad7ffed` starred `:62`. Verified with `git log -p --follow`.
- `260813-0913_*_…:112` said one citation "is corrected here rather than in the
  body", and commit `4bf15fa` rewrote `:91` to the wildcard form. Both commits were identified
  with `git log -S` against the exact string, not inferred from the file's log.

Neither is edited away. Each is put in the past tense it was true in, with one clause naming the
later repair, so a reader who opens `:62` or `:91` today is not left thinking the note lied. The
reasoning both notes gave for not repairing the body is left standing word for word — it is the
record of a judgement made then, and this step is not the place to revisit it.

## What was not done

- **No file was added to `RECORD_EXAMPLE_FILES`,** and none was considered. Option 1 was recorded
  in the defect record in error and removed at the user's instruction.
- **No new exemption**, no change under `hooks/`, `agents/`, `rules/` or `skills/`. The
  convention line and the failure message are step 9c's, and are still unwritten.
- **No marker was transitioned** on any of the ten records; every one is still `_o_`.
- **No plan step was marked, no golden regenerated, no constant pinned, nothing committed.**
- The measuring script was a scratch file under `hooks/lib/__tests__/helpers/` and was **deleted
  before the suite ran**, so it cannot reach the hook-test growth bound.

## Verification

`cd hooks && npm test` — **exit 0**, 38 test files and 692 tests passed. Output redirected to a
file rather than piped, so the exit code read is the process's own. One run, green first time:
nothing this step touched is inside a bounded surface or a golden.

## Files changed

Ten workbench records, all of them issues, plus this log. Nothing else in the tree.

```
circles/260801-1244-curator/issues/260814-1419_o_….md
circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-0804_o_….md
circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1247_o_….md
circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1913_o_….md
shared/issues/260811-2105_o_….md
shared/issues/260812-1720_o_….md
shared/issues/260813-0913_o_….md
shared/issues/260816-0105_o_….md
shared/issues/260816-0119_o_….md
shared/issues/260818-0715_o_….md
```
