The contamination command reads a scratch directory it never clears

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing `084c626..dbf259a`
**Affects:** `260822-0035-three-before-figures-and-the-after-measurement-defined.md` section 4, the `PRIMED` pipeline

---

## What is wrong

Section 4 builds its narrowed surface into a scratch directory and then globs that directory:

```sh
mkdir -p "$T/conv"
for f in "$DIR"/*.jsonl; do
  jq -r '...' "$f" > "$T/conv/$(basename "$f" .jsonl).txt"
done

LC_ALL=C grep -LE "$PRIMED" "$T"/conv/*.txt | sed ... > "$T/unprimed.list"
```

The loop writes one file per transcript **present now**. The `grep` reads **every** `.txt` in that
directory. Those two sets are equal only on a first run into an empty directory.

Two ways they diverge, and the report's own text raises both.

- **A pruned transcript.** The report states that the corpus "is outside version control" and that
  "Claude Code may prune" it. A transcript that disappears between two runs leaves its `.txt`
  behind, and it keeps voting: it stays in the denominator and, if it does not match `PRIMED`, it
  adds a path to `unprimed.list` that no longer exists. The next `jq` stage then fails on a missing
  file rather than skipping it.
- **A different corpus in the same shell.** `$T` is `$TMPDIR`, which is stable across runs on this
  machine. Nothing in the command scopes the directory to the corpus it was built from.

I reproduced section 4 into a clean directory and got the report's figures exactly, 19 primed and
53 unprimed of 72, so **the published numbers are not affected**. The hazard is entirely in front
of the after-run, which by construction executes this pipeline later, against a grown corpus, and
plausibly on a machine where an earlier run left files.

## Why a stale cache is worse here than usual

Section 4 sets out the error asymmetry it wants: "A false 'primed' costs one session of
after-corpus; a false 'unprimed' puts contaminated prose into the measurement and cannot be
detected afterwards." A stale `.txt` produces exactly the undetectable error, because a file whose
transcript is gone cannot be inspected to find out what it was.

## What to do

One line, before the loop:

```sh
rm -rf "$T/conv"; mkdir -p "$T/conv"
```

Or build into a per-run directory (`T=$(mktemp -d)`). Either removes the divergence. The first is
smaller and keeps the rest of the command as written, including the `"$T/unprimed.list"` path that
section 6 step 2 names.

**Verified at HEAD `dbf259a`** by reading the pipeline and by running it into a clean `$T/conv`,
which returned `unprimed=53 primed=19` over 72 conversation files, matching the report.

---
Resolved: The record's first option, taken as written. Section 4's `mkdir -p "$T/conv"` is now `rm -rf "$T/conv"; mkdir -p "$T/conv"`, carrying a two-line comment saying why the directory is cleared rather than reused. Nothing else in the pipeline moved: `$T` is still `${TMPDIR:-/tmp}`, and section 6 step 2's `"$T/unprimed.list"` path is untouched. No figure changes, and none was re-measured: the defect was in front of the after-run, not behind the published numbers, which the record itself established.
