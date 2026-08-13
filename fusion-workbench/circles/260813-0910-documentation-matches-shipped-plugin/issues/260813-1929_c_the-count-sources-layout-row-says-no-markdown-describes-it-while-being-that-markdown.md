The fusion-count-sources Layout row says no markdown describes the helper, and is itself that markdown

---
`CLAUDE.md:43` states "**Its own header is the only documentation of it** — no markdown file in this repository describes it". The row containing that sentence is a markdown description of the helper: it states what it counts and for whom, its `KEY=value` output shape, its one-mechanism-no-fallback rule and its absent-count semantics. The claim was true when written into the plan and was falsified by the edit that carried it.
---

## Both sides read

**Documentation side**, `CLAUDE.md:43`:

> | `bin/fusion-count-sources` | Counts a project's source files and structured-data files for the workbench-domain heuristic in `agents/orchestrator.md` Setup Step 5 (`code_files`, `data_files`). Prints `code_files=`, `data_files=` and `counted_by=` … **Its own header is the only documentation of it** — no markdown file in this repository describes it — and that header is authoritative: …

**Artifact side.** `grep -rn 'fusion-count-sources' --include='*.md' CLAUDE.md README*.md docs agents skills rules templates` returns exactly one line: `CLAUDE.md:43`. Before commit `0b20859` it returned none, so the step-2 history note ("`fusion-count-sources` confirmed undocumented") was correct at the moment it was written and stopped being correct in the same commit.

The four sibling rows added in the same edit use a form that does not have this problem, e.g. `CLAUDE.md:41`: "**The protocol is authored in `rules/workbench-stash-and-lock.md`** … and this row deliberately does not restate them."

## Scope

`CLAUDE.md` only. Cosmetic in effect, but it is a self-falsifying claim in the one file whose accuracy this Circle exists to establish, and a later reader checking the claim will find the counter-example without leaving the line.

## Recommended fix direction

Reword to the sibling form: the script's header is the authoritative documentation and no other file describes the helper, so this row summarises it rather than restating it. Keep the substance; drop the absolute.

Filed by: coderev (review of Circle Turn 1, range `6590cd5..79ec7bb`, commit `0b20859`).

---
Resolved: The absolute is gone. The `bin/fusion-count-sources` row in `CLAUDE.md`'s Layout table now reads "**Its own header is the authoritative documentation**, and this row summarises it rather than restating it", the sibling form the four rows added in the same edit already use. The substance is unchanged: the one counting mechanism with no fallback, the exit-code table, the `unavailable`-never-`0` rule and the two decisions. Checked against the row as it stood and against `grep -rn 'fusion-count-sources' --include='*.md'`, which now returns the `CLAUDE.md` row plus five call-site lines in `agents/orchestrator.md` (`:158`, `:159`, `:162`, `:175`, `:196`) — a second reason the absolute could not stand.
