# Both `records=unmeasured` branches discard the one count that needs no git, and a new test pins the discard

---

**Severity:** High — for every project that does not track its workbench, all four record-count cells read `unmeasured` while one of them was always computable
**Domain:** code
**Filed by:** coderev (Turn 3 review, range `7d9efc8..adaa545`)
**Affects:** `agents/orchestrator.md:620-628` (the block), `agents/orchestrator.md:649` (the closing instruction), `hooks/lib/__tests__/record-counts-measurement.test.ts:271`
**Cross-references:**
`shared/issues/260811-1406_c_the-record-counts-block-reports-unmeasured-whenever-the-active-circles-issue-store-was-empty-at-the-session-anchor.md` (the High finding this repair closed — same defect shape);
`shared/issues/260810-1205_*` (the hand-kept tally the block replaced);
`CLAUDE.md` `fusion-workbench/` row (a consuming project decides whether to track its workbench)

---

## What is wrong

Commit `41d8e2b` narrowed *when* `records=unmeasured` fires, correctly. It did not change what
`unmeasured` costs. Both branches print the cause and nothing else:

```bash
if [ -z "$A" ] || [ -z "$T" ]; then
  echo "records=unmeasured why=no-anchor-in-agentstate anchor=${A:-none} start=${T:-none}"
elif ! git -C "$WORKBENCH" cat-file -e "$A:./" 2>/dev/null; then
  echo "records=unmeasured why=workbench-not-in-anchor-commit anchor=$A start=$T"
else
  … the find loop that produces every count …
fi
```

The loop produces two kinds of line. `now_<marker> <kind>` asks git whether a name existed at the
anchor, so it genuinely needs the anchor. **`filed <kind>` does not.** It compares the record's own
filename stamp against `session.started`:

```bash
t=${b%%_*}; [ "${t//-/}" -ge "${T//-/}" ] && echo "filed $kind"
```

Filenames and `T`, no git. The block's own prose says so at `agents/orchestrator.md:648`: *"the stamp
is in the name, so this holds whether or not a commit carries the file yet."*

`agents/orchestrator.md:649` then instructs: *"write `unmeasured` into those four cells verbatim."*
One of those four cells — `Issues created`, which is `filed issue` — was measurable in both branches.

## Measured

Throwaway project, workbench gitignored (`.gitignore` holds `fusion-workbench/`), `agentstate.yaml`
carrying `started: "260811-1000"` and a valid anchor, two records filed after that stamp. The block
extracted verbatim from `agents/orchestrator.md` and run in both shells:

```
--- bash ---
records=unmeasured why=workbench-not-in-anchor-commit anchor=465f0ff… start=260811-1000
--- zsh ---
records=unmeasured why=workbench-not-in-anchor-commit anchor=465f0ff… start=260811-1000
--- on disk, stamp >= 260811-1000 ---
260811-1400_o_filed-today.md
260811-1401_o_also-filed-today.md
```

`2 filed issue` was on the disk and was not printed.

The `no-anchor-in-agentstate` branch has the same hole and a sharper one: it is `[ -z "$A" ] || [ -z
"$T" ]`, so it fires when **only the anchor** is missing while `T` is present and the filed count is
fully computable.

## Why this is the same class as the finding it repairs

`260811-1406` was High because the block declined to compute a number it could compute, and told the
model to name a cause that was not the cause. The repair fixed the probe. It left the coupling: the
git-dependent half of the measurement failing still takes the git-free half down with it, and the
closing instruction still puts the word `unmeasured` in a cell whose value is known. `260811-1406`'s
own closing sentence is the standard this fails: *"A figure that could not be taken is never reported
as a zero"* — and a figure that could be taken is never reported as unmeasurable either.

The reach is wider than the defect it replaced, not narrower. `260811-1406` fired for Circle sessions
in a tracked workbench; this fires for **every session in a project that does not track its
workbench**, which `CLAUDE.md` names as the consuming project's own choice and which was fusion's own
configuration until 260801.

## The gate now pins it

`hooks/lib/__tests__/record-counts-measurement.test.ts:271`:

```ts
expect(v.counts, "counts were printed alongside `unmeasured`").toEqual({});
```

That assertion is correct about today's behaviour and would have to be rewritten with the fix. Naming
it here so the fix is not mistaken for a regression against a green suite.

## Suggested direction

Print what is measurable and name what is not, rather than reporting the whole read as unmeasurable.
One shape that keeps the branches disjoint:

- `T` present, anchor unusable → print the `filed` lines, then `records=partial
  why=workbench-not-in-anchor-commit`, and instruct the model to write the two `filed`-derived cells
  from the read and `unmeasured` into the two `now_`-derived ones.
- `T` absent → nothing is measurable; `records=unmeasured why=no-anchor-in-agentstate` as today.

That splits the condition on what each half actually needs (`T` for `filed`, `A` for `now_`) instead
of on one combined gate, which is `rules/critical-stance.md` §4's ask.

## Acceptance criteria

- [ ] With the workbench untracked and `session.started` present, the block prints the `filed` counts.
- [ ] The prompt's closing paragraph says which cells take a measured value and which take
      `unmeasured`, per cause, rather than "those four cells".
- [ ] A case in `record-counts-measurement.test.ts` asserts the filed counts over an untracked
      workbench in both shells, and the `toEqual({})` assertion at `:271` is replaced rather than
      deleted.
- [ ] `cd hooks && npm test` exits 0.


---

Resolved: The block no longer gates both halves on one test. It computes the cause once —
`WHY=no-anchor-in-agentstate` when `$A` is empty, `WHY=workbench-not-in-anchor-commit` when the
`git cat-file -e "$A:./"` probe fails, empty otherwise — and then splits on `$T`: absent, nothing is
measurable and the header stays `records=unmeasured why=no-anchor-in-agentstate`; present, the find
loop runs and prints its `filed` lines, with the `now_` probe suppressed by `[ -n "$WHY" ] ||` when
the anchor is unusable. The header for that case is `records=partial why=<cause>`, so the two `why=`
values stay reachable and each names the branch that produced it.

The closing prose was rewritten with it: a bullet per header line saying which cells take a measured
value (`records` — all four; `records=partial` — `Issues created` from `filed issue`, the three
`now_` cells `unmeasured`; `records=unmeasured` — all four `unmeasured`), in place of "those four
cells".

Measured, block extracted verbatim and run in `/bin/bash` and `/bin/zsh` over throwaway projects:
untracked workbench with `session.started` present — `records=partial
why=workbench-not-in-anchor-commit` plus `2 filed issue`, and no `now_` line; anchor recorded but
absent from `agentstate.yaml` — `records=partial why=no-anchor-in-agentstate` plus the same
`2 filed issue`; no `agentstate.yaml` at all — `records=unmeasured why=no-anchor-in-agentstate
anchor=none start=none` and no counts; tracked workbench — unchanged from before, all four counts.

The `toEqual({})` assertion at `record-counts-measurement.test.ts:271` was **replaced**, not deleted:
the same case now asserts `toEqual(EXPECTED.filedOnly)` plus a shared `noNowCounts` helper that fails
if any `now_` line appears without a usable anchor. `cd hooks && npm test` — 50 files, 1301 passed,
exit 0.
