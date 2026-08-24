# How does an agent obtain a record filename that is guaranteed unique?

---
**Domain:** knowledge
**Status:** answered
**Filed by:** consultant, from a report by the consuming project `unite-co-creator`, session 260806-1242
**Cross-references:** `fusion-workbench/archive/260817-1907-safe-cleanup-scoped/shared/issues/260807-0158_*_record-filenames-collide-on-the-minute-and-nothing-prevents-it.md` (the measured defect; marker wildcarded by the reconciler at 260807-1941, because the same session moved it `_o_` → `_c_` and the exact-marker form no longer resolved); `rules/fusion-workbench-conventions.md` `## Filename Patterns` (lines 185-208) and `## Timestamps` (lines 172-174); `bin/fusion-commit-lock` (the precedent)

---

## Question

Record filenames are *constructed* by each agent from `date +%y%m%d-%H%M` plus a slug.
Two records minted in the same minute produce the same identifier, and 43 percent of this
workbench's 556 record files already carry a shared one. The defect record measures it.

The choice is what replaces construction. It has to be made now because the answer decides
whether a new `bin/` helper exists, whether every prompt that names a filename pattern
changes, and whether every identifier in the corpus gets longer.

## Options

1. **A minting helper — `bin/fusion-newname <kind> <slug>`.** The helper creates the file
   atomically (`O_EXCL`, or the `mkdir` idiom `bin/fusion-commit-lock` already uses at
   lines 14-15 and 179), prints the path, and becomes the single place any agent obtains a
   record filename. `## Filename Patterns` is rewritten to say a filename is *obtained*,
   not constructed.
   - Pros: closes both causes, batch filing and concurrency, by construction rather than by
     obligation. Matches the shape fusion already chose for the staging race. Leaves the
     identifier length untouched. Sits in `bin/` beside the resolver and the lock, so
     agents acquire it through the Setup step they already run.
   - Cons: a new helper to write, test and document. Every prompt and skill body that
     currently names a filename pattern has to route through it, which is a wide edit.
     A second mandatory helper call at filing time is a second thing that can be skipped
     unless the convention makes construction plainly wrong.
2. **Second resolution — `YYMMDD-HHMMSS`.** No helper; change the pattern.
   - Pros: cheap. Removes most batch collisions and many concurrent ones. One edit to the
     conventions plus a slug-pattern change wherever the shape is written out.
   - Cons: removes neither class. An agent writing several files inside one second is
     ordinary, and two agents can still land on the same second. Lengthens every identifier
     in every citation permanently, and the corpus becomes mixed-width.
3. **Ordinal suffix on collision — `YYMMDD-HHMM-2`.** Keep the identifier length for the
   common case, append an ordinal when the name is taken.
   - Pros: shortest identifiers, no change to existing citations.
   - Cons: race-free only with an atomic mint, at which point it is option 1 with a
     different name shape. Without one it is the check-then-write instruction the defect
     record already rejects.

## Constraints

- **The mechanism must not be an obligation.** An instruction to check before writing
  carries a miss rate, records a time that is not the time when it bumps, and still loses
  the check-then-write race. This is the constraint that rules out prose-only answers.
- **It must close batch filing, not only concurrency.** The dominant cause is one agent
  filing a dozen records in one pass.
- **Existing files are not renamed.** 238 files carry a shared identifier; renaming them
  breaks every citation pointing at them. Whatever is chosen applies going forward.
- **The convention states the fallback for the existing corpus regardless of this answer:**
  cite by full filename when an identifier is known to be shared.

## Recommendation

Option 1, with two qualifications.

The reporting project recommends option 1 and the reasoning holds: it is the only option
that closes both causes, and it reuses a mechanism fusion has already chosen for the same
class of problem rather than inventing a second one. Option 2 changes every identifier in
the corpus and still leaves the failure reachable, which is the worst trade of the three.

First qualification. The helper's cost is not the helper, it is the prompt edits, and that
edit is the same shape as the v4.0.0 path-literal migration: prompts stopped naming store
directories and started resolving them. That migration held because a lint test
(`hooks/lib/__tests__/path-literal-lint.test.ts`) fails the build when a literal reappears,
and the resolver exits 4 rather than emitting an empty value. A minting helper without an
equivalent gate would decay the same way construction did. **inference:** the same lint
harness can be extended to catch a hand-built `date +%y%m%d-%H%M` filename in an
`agents/*.md` or `skills/*/SKILL.md`; I have read that test's role in the conventions
(`rules/fusion-workbench-conventions.md:18`) but not its implementation, so treat the
extension as plausible rather than verified.

Second qualification. Whether the helper should *create* the file or only *reserve* the
name needs deciding when this record is answered. Creating it is what makes the mint
atomic; it also means an agent that mints and then fails leaves an empty record behind.
`bin/fusion-commit-lock` faced the same question and answered it with a stale detector
(lines 176-189). That is a design detail, not a fourth option.

## Answer (user, 260807-1925)

**None of the three options. The existing pattern stands: `YYMMDD-HHMM` plus a topic slug.** No
minting helper, no second resolution, no ordinal suffix.

The question was posed on a premise that does not hold. It asks how an agent obtains a filename
"guaranteed unique", on the stated basis that "two records minted in the same minute produce the
same identifier". Two records minted in the same minute produce the same *timestamp*; they produce
the same *filename* only if their topic slugs also match, and none ever have. Measured across this
workbench at 260807-1925, over the 579 record files outside `archive/`, `stashes/` and
`.migration-v2-backup/`:

| Check | Result |
|---|---|
| Files sharing a full basename, state marker normalised | 0 |
| Files sharing a full basename within one directory | 0 |
| `YYMMDD-HHMM` stamps carried by two or more files | 84 |

The defect record this decision was filed alongside says the same thing in its own body: "Nothing
is overwritten. The topic slug differs, so the files coexist." Its title and its measurement table
name the wrong quantity, and this decision inherited the framing. That defect is corrected and
closed in the same session.

**What survives is a citation rule, not a naming mechanism.** The real cost the defect measured is
that a citation written as a bare `YYMMDD-HHMM` is ambiguous wherever a stamp is multiply occupied,
which is 84 stamps here. All five bare-stamp citations that exist in this repository were checked
by the filing agent and each still resolves to exactly one file, so nothing is currently broken.
The standing rule is the fallback the defect already proposed: **cite a record by its full
filename, never by the timestamp alone.** The marker may be wildcarded, which is the form
`CLAUDE.md` already uses.

**The rule-text change this implies was deliberately not made in this session.** The user chose to
record the answer only. `rules/fusion-workbench-conventions.md` `## Filename Patterns` still says
nothing about how a record is cited; adding the cite-by-full-filename rule there is what closes
this out.

## Reconciliation 260807-1941 (reconciler, domain `code`) — stays `_a_`, and the measurement reproduces exactly

The three rows of the answer's table were re-derived independently from the tree at `1d6c8b3`,
without reading the session's commands, and all three match to the digit:

| Check | Answer says | Re-measured 260807-1941 |
|---|---|---|
| Record files with a `YYMMDD-HHMM` basename under `circles/` plus `shared/` | 579 | 579 |
| Files sharing a full basename, marker normalised | 0 | 0 |
| Files sharing a full basename within one directory | 0 | 0 |
| `YYMMDD-HHMM` stamps carried by two or more files | 84 | 84 |

One clarification the answer did not need but a later reader will: normalising the marker across
*all* `.md` files under `circles/` and `shared/` produces one apparent duplicate, `_X_circle.md`.
That is the twelve Circle records, which carry no timestamp at all and are disambiguated by their
stable directory name (`rules/fusion-workbench-conventions.md` `## Filename Patterns`, the Circle
record row). They are not records of the `YYMMDD-HHMM_S_<topic>.md` shape this decision is about, and
excluding them is what the 579 figure already does.

Stays `_a_` rather than moving to `_i_`: the answer's operative half is a citation rule, and that
rule is not yet written into `rules/fusion-workbench-conventions.md` `## Filename Patterns`. The
user deliberately deferred that edit in the answering session ("nur festschreiben"). This record
moves to `_i_` when the rule text lands.

The cross-reference above was repaired in this pass: it named the defect by its pre-transition
`_o_` marker, which the same session invalidated. Rewritten to the ratified wildcard form
(`circles/260805-2005-textschicht-gegen-code-nachziehen/decisions/260806-0015_*_zitierform-fuer-workbench-records.md`).

---
Answered: shared/history/260807-1917-orchestrator-session.md `## Decisions answered` — premise falsified by measurement; the pattern stands and the answer is a citation rule.
Implemented: <set when status moves to _i_>
Deferred: <set when status moves to _d_>
Superseded by: <set when status moves to _s_>

---

## Reconciliation 260808-0030 (reconciler, domain `code`) — stays `_a_`; the condition is unmet, and this record's own citation went stale

`grep` over `rules/fusion-workbench-conventions.md` `## Filename Patterns` at `c54ead9`: the
section still carries the artifact-kind table, the `<sender>` rule and the `$OUT_MEMO`
write-semantics note, and **no citation rule**. The condition this record set for itself — "moves
to `_i_` when the rule text lands" — is unmet. It was explicitly scoped out of the language-split
Directive (`archive/260817-1907-safe-cleanup-scoped/shared/planning/260807-2024_*_two-language-declarations.md` `## Out of Scope`) and
remains open work from session 260807-1917.

**This record's own cross-reference is now stale, and session 260807-2020 is what staled it.** The
header at line 7 cites `## Filename Patterns` at **lines 185-208**; the section now begins at
**line 221** and runs to **245**. Step S1 of the language-split plan grew `## Project language` by
roughly 36 lines, and every section below it moved. The `## Timestamps` citation in the same line
(172-174) is unaffected and still correct.

Not rewritten here, because the general case is the point rather than this one number: nothing in
the suite reads a line citation. Filed as
`shared/issues/260808-0030_o_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md`,
which names this record as its first measured instance.

---
**Reconciliation 260819-1400 (reconciler, domain `code`, HEAD `e435f03` / `v10.3.0`) — marker
unchanged at `_a_`; the condition this record set for itself is still unmet, twelve days on.**

`rules/fusion-workbench-conventions.md` `## Filename Patterns` at HEAD carries the artifact-kind
table, the `<sender>` rule and the `$OUT_MEMO` write-semantics note, and **no citation rule**.
`grep -rn 'full filename\|cite a record' rules/ CLAUDE.md agents/ skills/` returns only
`rules/rule-file-provenance.md`'s three citation forms for the `**Provenance:**` header, which is a
different subject. The one-line rule the answer left standing — cite a record by its full filename,
marker wildcarded, never by the timestamp alone — is followed in practice throughout the corpus and
is written down nowhere it can be read as normative.

**What binds a deep change.** The `YYMMDD-HHMM_S_<topic>.md` pattern stands and no minting helper is
authorised: the premise that it collides was measured false. A change that introduces a second
resolution, an ordinal suffix or a `bin/fusion-newname` would be re-deciding a settled question, and
it would lengthen or mix the width of every identifier in a corpus of roughly 1000 records. What is
open is only the rule text.

---
Implemented: 2b055a0 — the cite-by-full-filename rule landed in `rules/fusion-workbench-conventions.md` `## Filename Patterns`, which is the condition this record set for itself and restated in three reconciliations.

## The condition, and how it was established (260824)

This record's answer left exactly one act outstanding, and four passages of this file name it: the answer's own closing paragraph, and the reconciliations of 260807-1941, 260808-0030 and 260819-1400. All four say the same thing. The record moves to `_i_` when the cite-by-full-filename rule lands in `rules/fusion-workbench-conventions.md` `## Filename Patterns`.

It landed in `2b055a0`, in that file and in that section, as one added paragraph under the `<sender>` rule:

> **Cite a record by its full filename with the state marker wildcarded**, `YYMMDD-HHMM_*_<topic>.md`, so the citation survives every marker move. **A bare stamp is not a citation**: 111 of the 545 stamps in fusion's own corpus are carried by more than one file, measured 260824 over 876 records. No two records share a full basename once the marker is normalised, so the naming convention holds and only the citation form was ever at fault. **No pattern above changes.**

Three checks, each run against the tree rather than inferred from a commit subject.

1. **It is in the named section of the named file at HEAD**, not in a neighbour and not in a second file. Read directly out of `rules/fusion-workbench-conventions.md` `## Filename Patterns`, and confirmed as the whole of that commit's change to the section by `git show 2b055a0 -- rules/fusion-workbench-conventions.md`.
2. **It reads as normative rather than as practice**, which is the precise gap the 260819-1400 reconciliation recorded when it wrote that the rule was followed throughout the corpus and "written down nowhere it can be read as normative". It sits in an always-on rule file every agent loads, it is in the imperative, and it states the negative case as well as the positive one.
3. **Nothing this record forbade was done.** `git diff e209011..HEAD -- rules/fusion-workbench-conventions.md`, over the whole Circle range, is additions with a single exception, the `**Filed by:**` template line gaining a person half. The artifact-kind table is unchanged. No second resolution appeared, no ordinal suffix, no `bin/fusion-newname`, and no existing file was renamed for its name. One helper was added in the same Circle, `bin/fusion-identity`, and it mints a checkout identifier rather than a filename.

**The measurement this record's answer rests on was re-taken and reproduces where it matters.** The corpus has grown from 579 record files to 876, and the count of stamps carried by more than one file rose from 84 to 111 of 545 distinct stamps. The row that decides this record is unchanged at zero: no two records share a full basename once the marker is normalised. That re-measurement, and the answer that authorised the rule text, are in `shared/decisions/260822-1556_*_does-the-record-filename-convention-hold-when-several-checkouts-file-into-one-store.md`.

**One thing left exactly as it stands.** The header of this record still cites `## Filename Patterns` at lines 185-208, and the section has moved twice since. It is the first measured instance of `shared/issues/260808-0030_*_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md`, and repairing it here would remove the evidence that issue rests on.
