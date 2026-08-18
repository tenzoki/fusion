The cleanup skill's consolidation measurement carries a flag name where a shell variable belongs

---

**Severity:** Low
**Domain:** code
**Filed by:** orchestrator, met while running `/fusion:cleanup --only claude-md`
**Affects:** `skills/cleanup/SKILL.md` `## Step 8 — Report`, the `LAST_RUN` block

---

## The defect

Step 8's measurement block finds the most recent curator run file and sorts on the filename
rather than the whole path. The `awk` that pairs the basename with the path reads:

```
| awk -F/ '{ print $NF "\t" --only }'
```

`--only` is the name of one of this skill's own command-line flags. In `awk` it parses as two
unary minus operators applied to an uninitialised variable named `only`, which evaluates to `0`,
so every line's second field is the literal `0` and the `cut -f2` that follows returns `0` for
every run file. `$LAST_RUN` is then `0` rather than a path.

The correct token is `$0`, the whole input line.

## How it presents

`$LAST_RUN` holds `0`, which is neither empty nor a path. The step's own instruction says to read
the date out of `$LAST_RUN`'s filename, and there is no filename to read. Worse, the branch that
exists for the honest case — "when `$LAST_RUN` is empty, say that no consolidation has run on this
project" — does not fire, because `0` is not empty. A project that has never consolidated and a
project whose measurement broke both report something, and neither reports the truth.

## Evidence

Run today against this repository, which holds three curator run files
(`260816-1251`, `260817-1925`, `260818-2050`). The block as written returns `0`. The same block
with `$0` in place of `--only` returns
`fusion-workbench/shared/history/260818-2050-curator-run.md`, the correct answer.

## Why it survived

Nothing executes a skill body, so no test runs this block. The surrounding prose is careful and
correct — the comment above the `awk` explains exactly why the sort must key on the basename, and
that reasoning is right. Only the token is wrong, and it is wrong in a way that produces a value
rather than an error.

## Fix direction

Replace `--only` with `$0`. Then consider whether the branch below it should distinguish a
measurement that returned nothing from one that could not be taken, the way this project's other
measurement sites do — an absent run and a broken read are different facts, and the step's own
text already insists on that distinction for the first pair.

---
Resolved: not reproducible. The token this record is about is not in the file, is not in any copy
of the file on this machine, and has never been in this repository's history of it. Closed on a
measurement rather than on a fix, because there is nothing to fix.

**Measured 2026-08-18 at HEAD `53b6862`, by the orchestrator session
`shared/history/260818-2124-orchestrator-session.md`.**

- `git log -p --follow -- skills/cleanup/SKILL.md`, filtered to the `awk -F/` line, yields exactly
  one line across the whole history: a single `+` introducing `{ print $NF "\t" $0 }`, and no `-`
  line at all. The line entered already correct and was never edited. The pickaxe
  `git log -S'print $NF "\t" --only'` over the same path returns nothing.
- The file's last commit is `381f6d8` (260816-0040), two days before this record was filed at
  260818-2104. Nothing touched it between the filing and this measurement, so the state read here
  is the state the filing session read.
- Every copy that could have been loaded carries `$0`: the work tree, the installed plugin at
  `~/.fusion` (both at version 10.2.0), and no other copy exists under `~/.claude` or `~/.fusion`.
  The marketplace cache clone is absent on this machine.
- The block, executed as written against this workbench, returns
  `fusion-workbench/shared/history/260818-2050-curator-run.md`. That is precisely the value this
  record names as "the correct answer" obtainable only after substituting `$0`. The block already
  is the substituted form.
- The string `--only` occurs in this repository at exactly one position: line 18 of this record,
  inside its own quoted evidence.

**What survives and what does not.** The `awk` reasoning is correct in the abstract: `--only` would
parse as two unary minus operators on an uninitialised variable, evaluate to `0`, and defeat the
empty-check below it. That analysis is sound and is worth keeping. Its premise is not: the file does
not contain the token, so the reported symptom never occurred, `$LAST_RUN` has never held `0`, and
the honest branch has never been bypassed. The "Evidence" section describes a run that no copy of
this block can produce.

The second half of the record's `## Fix direction` is untouched by this and stays a live question:
whether the branch below should distinguish a measurement that returned nothing from one that could
not be taken. It is not filed here, because it is not this defect. Whoever picks it up files it
against `skills/cleanup/SKILL.md` `## Step 8` on its own evidence.

The filing itself is the defect that remains, and it is filed separately as
`shared/issues/260818-2210_o_a-defect-record-cites-a-verification-run-that-no-copy-of-the-code-it-names-can-produce.md`.
