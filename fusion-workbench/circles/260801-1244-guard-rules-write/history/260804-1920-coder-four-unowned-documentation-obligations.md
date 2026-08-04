# Four unowned documentation obligations, discharged early

**Date:** 2026-08-04
**Agent:** `coder`
**Circle:** `circles/260801-1244-guard-rules-write`
**Status:** Complete
**Dispatched by:** orchestrator, at the user's explicit request, ahead of the remaining behavioural steps
**Not** plan Step 7. Step 7 still runs and nothing here is marked complete.

---

## What was asked

Discharge the four documentation obligations that describe behaviour **already true at
HEAD** and that no plan step owned: two created by decisions answered an hour earlier
(`260803-1402`, `260804-1815`), two deliberately left by Step 3 (`260804-1346`,
`260804-1348`) whose documentation halves live in Step 7's file while Step 7's `Closes`
line did not name them.

## What I did first, and why it changed the work

I measured everything before writing a sentence. Instrument:
`hooks/lib/__tests__/helpers/guard-harness.ts`, real guard subprocess (`tsx guard.ts`, so
the TypeScript at HEAD rather than the stale `dist/`), **one fresh throwaway project per
case** — the first run put every case in one project and the escalation halt swallowed the
verdicts from the third case on, which is worth recording because a halted run reads as a
long column of plausible denies.

Two dispatch claims did not survive the measurement.

1. The dispatch said `git clean -fdx` at the project root "still deletes untracked files
   under protected directories and allows". It **denies** at HEAD, as do
   `git clean -fdx .`, `git clean -fd` and `git clean -f`. Commit `64e0837` gave `clean` a
   `writesThrough` field, so the project-root exclusion no longer applies to it. The
   dispatch itself flagged this possibility and told me to verify rather than trust the
   issue's original text; that instruction is the reason obligation 3 is written the way it
   is.
2. `260804-1348` calls `checkout`'s second cost "unreachable". It is the record's
   **example** that is unreachable, not the cost. `git checkout rules/a.md rules/b.md` is a
   branch-policy deny because `rules/a.md` is not on disk. With both operands present the
   mutation classifier answers with its own reason:
   `git checkout rules/x.md agents/coder.md` denies on `agents/coder.md`.

A third correction fell out of the same measurement and is the one I would have shipped
wrong if I had trusted a record: `260804-1346`'s in-progress note says
`GIT_WORK_TREE=rules git clean -fdx` "remains a live residual". The residual is live; that
*spelling* is not — it now denies on the root's own write-through, not because the variable
was read. Quoting it as evidence would have been the fifth falsified sentence in this
Circle's residual lists.

## Measured, and what each measurement is behind

Guard verdicts: real subprocess, fresh project per case, shipped `hooks/config.json`, no
environment flag set. Effects: real repositories under `/private/tmp`, git 2.49.0, zsh 5.9.

```
# obligation 1 — the planted alias
allow  ln -s ../agents/coder.md build/alias
allow  ln agents/coder.md build/hardalias
allow  cp -l agents/coder.md build/hardalias
allow  echo pwned > build/alias           → agents/coder.md reads "pwned"   (real shell)
allow  echo pwned2 > build/hardalias      → agents/coder.md reads "pwned2"  (real shell)
allow  Edit build/alias                   (write-tool surface)
BLOCK  rm agents/coder.md                 (control)
BLOCK  Edit agents/coder.md               (control)

# obligation 2 / 4a — the revert spellings
allow  git checkout HEAD -- rules/x.md
allow  git checkout -- rules/x.md
BLOCK  git restore --source=HEAD rules/x.md
BLOCK  git restore --source HEAD rules/x.md
BLOCK  git restore -s HEAD rules/x.md
allow  git restore rules/x.md             (the index — a third operation)

# obligation 3 — git clean
BLOCK  git clean -fdx      "writes THROUGH a directory that holds protected paths"
BLOCK  git clean -fdx .    BLOCK git clean -fd    BLOCK git clean -f
allow  git clean -fdx build   allow  git -C build clean -fdx   allow  cd build && git clean -fdx
allow  git clean -n rules
BLOCK  cd $D && git clean -fdx        fail-closed
BLOCK  cd build; git clean -fdx       fail-closed
BLOCK  GIT_WORK_TREE=rules git clean -fdx   — on the ROOT, not on the variable
allow  cd build && GIT_WORK_TREE=../rules git clean -fdx  → rules/ emptied, tracked file included

# obligation 4b — which policy answers a `--`-less checkout
BLOCK  git checkout rules/x.md agents/coder.md   protected-path reason
BLOCK  git checkout docs rules/x.md              protected-path reason
allow  git checkout notes.txt build/out.js
BLOCK  git checkout rules/a.md rules/b.md        BRANCH reason (rules/a.md not on disk)
BLOCK  git checkout HEAD rules/x.md              BRANCH reason (HEAD is a ref)
BLOCK  git checkout main                         BRANCH reason
```

The last row is why one sentence changed that no obligation named: the rule file's allowed
column listed `git checkout main`, a command the sibling policy denies. That is the same
defect class as `260804-1348` recommendation 2 — the protected-path rule claiming an outcome
another policy owns — so I corrected it in the row I was already rewriting and reported it.

## Files changed

`rules/protected-path-discipline.md` — five edits, all corrections or extensions of existing
sentences rather than new sections (the file is loaded into every agent's context in every
consuming project and has been edited seven times in two days):

1. The git-row table and the prose under it. `restore`'s denied column gains
   `--source=HEAD`; `clean`'s gains the project root; `git checkout main` leaves the allowed
   column. "Now they agree" becomes "they agree for every source except the literal `HEAD`",
   followed by the asymmetry with its three denied spellings, the architectural cause, and
   the named allowed form — `git checkout HEAD -- <paths>`, in as many words, because the
   decision's obligation is to name it rather than describe it. A closing paragraph says
   which of the two policies answers a `--`-less `git checkout` and on what test.
2. The second stated cost, restated with a reachable example.
3. The `git clean` paragraph in the `-C` section: the root denies, why (`clean` writes
   *through* its pathspec), what still allows, and what fails closed.
4. The alias residual, rewritten around a measured block and the reasoning the decision
   asked to be carried here: the write-only invariant was kept on purpose, and an agent that
   has learned reads are always fine and then meets a denied `cp -l` is the failure this file
   exists to prevent.
5. The two git residual entries: the `clean` entry deleted **for the stated right reason**
   with the survivors named, and the `GIT_WORK_TREE` entry restated as a rule with an example
   that still reproduces, plus the warning that the root deny is not coverage of it.

`README-hooks.md` — the same five claims, plus one adjacent correction: line 178 called
`git restore rules/x.md` and `--staged` "fusion's own revert strategy". They restore from the
index; the revert strategy is `git checkout HEAD --`, which line 180 already said. Leaving
both would have been the contradiction Step 7's falsification test looks for.

`planning/260804-1633_o_plan-c5b-remediation-and-ship.md` — Step 7's `Closes` line now names
`260804-1348`'s documentation half, closing the ownership gap the issue flagged. A block
after the thirteen obligations records all four as discharged early, by whom, with what Step 7
still owes each (a re-read after Steps 1, 4, 5 and 6, not a rewrite), and carries forward the
`GIT_WORK_TREE` example correction as something obligation 11 must not lose. The enumeration
is intact — nothing was struck.

`issues/260804-1346_p_…` and `issues/260804-1348_p_…` — a resolution note on each, with the
measured rows, what was written, and where each record's own text needed correcting. Both
markers left at `_p_`; the orchestrator owns the move.

## Verification

`npx vitest run` in `hooks/`: **1448 passed across 25 files**, unchanged. Not `npm test`,
which would rebuild `hooks/dist/` — Step 8's file.

The four rule-file lints (`provenance-header-lint`, `path-literal-lint`,
`marker-format-lint`, `glob-nomatch-lint`) run over `rules/` inside that suite and are green.

Greps after the edits: no surviving "they agree" in either file; no surviving claim that
`git clean -fdx` allows at the project root in either file; `CLAUDE.md` carries neither
claim and was not touched.

## What I did not do

No code. No marker moved. Nothing described that Steps 1, 4, 5 and 6 have not shipped — the
precedence rule for `260803-1314`, the floor's path matching, `guard_error` on the dashboard
and the template's wording are all absent from these edits, and no sentence I wrote needed
one of them to be true.

## Confidence

`verified:` every verdict and every effect quoted above, by the runs described.
`inference:` that the four obligations are now discharged *completely* rests on my reading of
the two decision answers and the two issue records; a reviewer who reads those four records
against the two files is the check I cannot perform on myself.
