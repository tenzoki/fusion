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
