The playmaker spells a store-prefixed path inline when reporting a measurement about store-prefixed paths
---
`portfolio.md` line 107 spelled a store-prefixed Circle path inline while *reporting* where the sixteen store-prefixed hits live, so the token was the datum. This record's own first version spelled it a second time, quoting that line inline, and tripped the same gate on itself; both now name file and line instead. Written inline such a token is indistinguishable from a citation, and `hooks/lib/__tests__/workbench-citation-lint.test.ts` fails the whole suite on it. The gate carries no baseline and nothing to re-approve, by its own design.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**This record replaces its own first version, which had the diagnosis wrong.** It was filed claiming the playmaker had introduced sixteen store-prefixed citations, on a reading of the run's own report that the report itself contradicts. The playmaker states that all sixteen are `not-edited` and pre-date the citation-form Circle, in files from 260814, 260819, 260820 and 260824, and `bin/fusion-citation-sweep --dry-run` confirms it: every one of them sits in `archive/`, in three terminal Circles, in a shared decision and in a shared history file, none written today. The playmaker introduced the **seventeenth**, and only that one, and only by spelling the form while reporting on it.

**Evidence.** `bin/fusion-citation-check` at HEAD reports `store-prefixed=17`; the run's own warning line reports 16 and names the corpus it measured. The single finding the citation lint raises is `portfolio.md:107`. The run also left rewrites the sweep would make in its own history file and in the Circle record it appended to, so the habit is not confined to one line.

**The rule already covers this exact case, and names the two ways out.** `rules/fusion-workbench-conventions.md` `## Marker globs`, closing paragraph: a record that states something *about* a citation names file and line, or fences the verbatim form, because "a pointer and a statement about one are the same characters, and no reader (human or gate) can tell them apart". The lint's own failure message says the same and adds what is not the answer, namely an exemption file. Binding: `260820-0530_*_twenty-six-citations-in-the-corpus-are-statements-rather-than-pointers-and-no-exemption-expresses-that.md`.

**What the fix must not lose.** `rules/circle-records.md` `### Citation form in the portfolio` keeps a second distinction the naive repair destroys: a pointer to a file takes `_*_` at the marker position, and a marker named as the subject of a statement keeps its letter. `agents/playmaker.md` already carries that paragraph. What it does not carry is the statement-versus-pointer rule for a **path**, which is the case here.

**Acceptance.** A playmaker run over this workbench produces a `portfolio.md` on which `hooks/lib/__tests__/workbench-citation-lint.test.ts` passes, with its measurement warnings still naming which files carry the hits. `bin/fusion-citation-sweep --dry-run` reports `rewrites=0` for `portfolio.md` and for the run's own history file. The `## Recently closed (_c_ / _b_)` heading and any warning whose subject is a transition still carry their marker letters.

**Note on proving it.** A session's agent roster is read at start from the installed copy, so an edit to `agents/playmaker.md` does not reach a dispatch in the session that makes it. The proof run belongs to the next session, after `fusion --update` (`260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md` states the same shape one level down).

**Repair applied 260904 (coder).** `agents/playmaker.md` `## Output — the portfolio`: the citation paragraph is rewritten to carry the statement-versus-pointer rule for a **path** as well as for a marker, bound to the measurement warnings where it fires (`citation-check-verdict` and any warning naming which files carry a finding), with the two sanctioned forms and their source. `portfolio.md` line 107 is corrected in place to the storeless Circle name, keeping which files carry the hits and the un-investigated count discrepancy. `hooks/lib/__tests__/workbench-citation-lint.test.ts` passes.

**The marker stays `_o_`.** The Acceptance above is a property of a playmaker *run*, and a session reads its agent roster from the installed copy at start, so the run that proves the prompt edit belongs to the next session (the note on proving it above). Close it there.

---
Resolved: the proof run the record reserved for the next session has happened. `portfolio.md` was
regenerated in full on 260905-1018 (history entry `260905-1018-playmaker-direct-dispatch.md`), a
session later than the 260904 prompt repair, so the edited `agents/playmaker.md` was the roster this
run read.

Verified at HEAD `5b84b13a`, against the record's four acceptance clauses:

- `hooks/lib/__tests__/workbench-citation-lint.test.ts` passes; `cd hooks && npm test` is 50 files,
  864 tests, green.
- `node hooks/dist/citation-sweep.js --dry-run` reports `files=0 rewrites=0` over the whole corpus,
  so zero for `portfolio.md` and zero for the run's own history file; both files' only residual rows
  are their own stamps, status `resolved`.
- Every Circle in the regenerated briefing is named by its storeless directory name and every backlog
  entry by its storeless basename. No line carries a store segment.
- The `## Recently closed (_c_ / _b_)` heading and every transition warning keep their marker letters,
  which is the distinction the naive repair destroys.

One clause is **unexercised rather than proven**: "with its measurement warnings still naming which
files carry the hits". This run's Warnings section reads `(none)`, because it had nothing to warn
about. The behaviour is unrefuted and untested; the next run that does carry a finding is what
exercises it.
