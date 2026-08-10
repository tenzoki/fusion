# Setup documents churn-rank exit 2 and not the exit 3 that this repo's own build cycle produces

---

`agents/orchestrator.md` Setup Step 5 wraps `bin/fusion-churn-rank` in an `[ -x ]` guard and
explains exit 2. It never mentions exit 3, which the wrapper raises when
`hooks/dist/churn-rank.js` is absent — a state this repository's own test cycle is on record
as producing. The `[ -x ]` guard does not cover it: the wrapper is present and executable,
and the thing that is missing sits one directory over.

---

## Evidence

`bin/fusion-churn-rank:49-52` — the wrapper's own exit code:

```bash
if [ ! -f "$entry" ]; then
  echo "fusion-churn-rank: $entry is missing — the plugin's compiled hooks are not installed." >&2
  exit 3
fi
```

`agents/orchestrator.md:116-124` guards the call and then documents the output:

> The `[ -x ]` guard is the same one the source count below carries, for the same reason […]
> Churn is advisory and has no substitute value to print, so the absent branch says so on
> stderr […] Exit 2 is the same silence for a different reason — the project has no churn
> state yet.

Nothing in the prompt or in `skills/setup/SKILL.md:227` says what exit 3 means or what the
orchestrator should do with it.

## Why it is reachable rather than theoretical

`hooks/lib/__tests__/helpers/guard-harness.ts:120-128`, added in the same commit range,
records the condition first-hand:

> Spawning the SOURCE by default also keeps the suite independent of whether `dist/` happens
> to exist at that instant, which `npm run build` deletes and rebuilds — a second session
> running the suite in the same checkout has been observed wiping it mid-run.

`bin/fusion-churn-rank` resolves its program relative to itself (`$here/../hooks/dist/churn-rank.js`),
so in the fusion work tree during a build, or in any checkout where `hooks/dist/` was never
built, the helper exists, is executable, passes `[ -x ]`, and exits 3.

The `bin/fusion-count-sources` sibling has no equivalent gap: it is self-contained bash,
so "the wrapper exists" and "the wrapper can run" are the same question there. For
`fusion-churn-rank` they are two questions, and Step 5 answers only the first.

## Severity

Low. Churn is advisory, the failure is loud on stderr, and nothing downstream reads the
ranking. What it costs is one non-zero exit at the orchestrator's own Setup in vocabulary
the prompt has not taught the cascade to read — the same complaint decision `260810-0921`
filed against the bare exit 127, arriving one step later.

## Scope

`agents/orchestrator.md` Setup Step 5; `skills/setup/SKILL.md` Step 3 inherits it by
pointing at that block.

## Recommendation

Add one sentence to the same paragraph that covers exit 2: exit 3 means the plugin's
compiled hooks are missing, the remedy is `fusion --update` (installed copy) or
`cd hooks && npm run build` (work tree), and the ranking is skipped exactly as in the
absent-helper branch. Do not add a cascade branch — the outcome is identical to the two
branches already there, and decision `260810-0921` settles that the reason is reported
rather than branched on.

## Cross-references

- `fusion-workbench/shared/decisions/260810-0921_i_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`
- `fusion-workbench/shared/decisions/260810-1544_o_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md` — the open general form of this question
- Filed by `coderev`, review `shared/reviews/260810-1632-coderev-turn-1-range-430d73a-to-head.md`
