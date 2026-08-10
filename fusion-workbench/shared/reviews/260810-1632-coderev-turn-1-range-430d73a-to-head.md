# Code review — `430d73a..HEAD`, Turn 1 (six commits, pre-release)

**Sender:** coderev
**Range:** `430d73a..HEAD`, 6 commits, 36 files changed (+2713 / −50). 22 in-scope files;
the 14 under `fusion-workbench/` skipped as instructed.
**Origin:** No Circle active (`.active-circle` absent) — filed to `shared/`.
**Prior review:** `shared/reviews/260810-1032-coderev-turn-4-range-7f617b1-to-7ddacbc.md`

**Suite state at review time:** green. `cd hooks && npm test` → 40 files, 1072 tests,
82.4 s, exit 0. No re-run needed: the known wall-clock case in `fusion-commit-lock.test.ts`
(record `260810-1135`) passed first time.

**Build state:** `npx tsc --outDir /tmp/fusion-dist-check` from `hooks/`, then
`diff -r /tmp/fusion-dist-check dist` → **identical**. The committed `hooks/dist/` is a
faithful build of the committed sources.

---

## Release question

**Nothing in this range should be held back.** Ship it.

Four findings, none of them a blocker: one Medium (a comment in `hooks/tracker.ts` that the
same commit falsified, with a plugin-repo-only behavioural tail) and three Low (a missing
exit-code line in a prompt, a missing noise filter on the churn ranking, a test that fails
opaquely where a pseudo-terminal is unavailable). All four are cleanup. None of them can
reach a consuming project's data, none changes what the guard protects, and none is on the
path a fresh install takes.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 3 |

## The four questions the dispatch asked, answered

**1. Is `migrateChurnKeys()` safe on live state?** Yes, on all four sub-questions.

*Idempotent* — verified empirically, not read off the comment. Driving the shipped
`hooks/dist/lib/churn.js` against this repository's real 592-entry
`fusion-workbench/.guard-state/churn.json`:

```
before entries 592
after1 entries 415   anchor workbench-root
after2 entries 415   idempotent(deep-equal)= true
after3               idempotent3= true
```

The second and third passes are byte-identical to the first, key set and stats alike. The
`keyAnchor` stamp is a cheap skip, not the thing that makes repetition safe — the rule
itself is a fixed point, because a migrated key resolves under the root, so `reanchor`
(`hooks/lib/churn.ts:293-306`) returns it unchanged and never re-prefixes `fusion-workbench/`
a second time.

*The stated merge rule is the implemented merge rule* — `mergeStats`
(`hooks/lib/churn.ts:331-340`): `totalChanges` and `changesThisSession` summed,
`lastChange` through `laterTimestamp` with an unparseable value losing to a readable one,
`thrashingScore` set to 0 and then **recomputed** by `updateThrashingScore` rather than
combined. That is exactly what the commit message and the docstring claim.

*A second run cannot compound* — the merge is reached only when two distinct keys reanchor
onto one spelling. After a pass every key is root-relative and distinct, and no two of them
can collide again, which is why `after2` equals `after1`.

*The live file is currently unmigrated*, and that is worth saying plainly: it still carries
592 entries, 351 of them absolute, with no `keyAnchor`. Nothing has rewritten it, because
the churn half of the tracker stands down in this repo. The 592→415 rewrite will happen on
the first tracked write from a session whose working directory is not the repo root —
which is the tail of finding 1 below.

**2. Would `bin/fusion-churn-rank` land in a release tarball?** Yes.

- `git ls-files -s bin/fusion-churn-rank` → `100755 ba8d145…` — tracked, executable bit set.
- `git check-ignore -v bin/fusion-churn-rank` → exit 1, no match. The `.gitignore` exception
  at line 30 does its job against the wholesale `bin/*` on line 21.
- `install.sh:81-82` copies `bin` in its asset loop with `cp -R`, which preserves the mode.

**3. `churnKey` at the three boundaries.** Correct, and unit-covered.

| Input | Answer | Where |
|---|---|---|
| outside the root (`/tmp/…`, `../other-clone/…`) | `null` — not tracked | `churn.ts:231`, `churn.test.ts:315-321` |
| the root itself (`/proj` with `root=/proj`) | `null` — empty relative path names no file | `churn.ts:231`, `churn.test.ts:327-329` |
| relative (`tasklist.md` from `fusion-workbench/`) | `fusion-workbench/tasklist.md` | `churn.ts:230`, `churn.test.ts:306-313` |
| no workbench (`root = null`) | `null` | `churn.ts:229`, `churn.test.ts:323-325` |

The null branch is not a silent drop: `hooks/tracker.ts:681-692` emits a `tracker_record`
event saying "outside the workbench root, not tracked", and
`churn-key-anchor.test.ts:116-137` asserts on it.

**4. Does any commit in the range leave a prompt calling something absent?** No, at HEAD.
One transient inside the range, harmless.

At `25c5454`, `skills/setup/SKILL.md:227` was changed to say *"run the
`bin/fusion-churn-rank` block from `agents/orchestrator.md` Setup Step 5"* — and that block
was only added to `agents/orchestrator.md` in the next commit, `26ea3c3`. So `25c5454` alone
carries a dangling cross-reference. It is benign: nothing ships from a mid-range commit,
the release tag lands on HEAD, and `install.sh` fetches `heads/main` or a tag. Worth
knowing only for a bisect.

The direction that matters is the other one, and it is clean: `bin/fusion-churn-rank` was
added in `25c5454`, one commit **before** `26ea3c3` taught the orchestrator prompt to call it.

---

## Findings by theme

### Anchoring and the stand-down question

**Finding 1 — Medium. `hooks/tracker.ts:770-771`: the comment that justifies asking cwd was
falsified by the same commit.**
Record: `shared/issues/260810-1632_o_the-churn-stand-down-still-asks-cwd-and-the-comment-justifying-that-was-falsified-by-the-same-commit.md`

The comment reads *"Churn is keyed on paths relativized against `process.cwd()`, so cwd is
the directory it must ask about."* `hooks/tracker.ts:680` now reads
`churnKey(rawFilePath, process.cwd(), findWorkbenchRoot())`. The premise is gone.

The behavioural tail, measured: `bin/fusion-plugin-cwd` exits 1 from `fusion-workbench/`
and 0 from the repo root, so in this repository a session started at the root records no
churn while a session started in `fusion-workbench/` — which `CLAUDE.md` calls the ordinary
case — records churn and triggers the 592→415 rewrite of the state file. That is the same
shape as the defect `25c5454` closed: what gets counted depends on where the session
started. The protected-path measurement does not have it, because `measurementRoot()`
(`hooks/lib/protected-snapshot.ts:678-683`) asks the root.

Scope: `hooks/tracker.ts`. No consuming project is affected — `isFusionPluginCwd()` is
false everywhere but here.

Fix direction: ask the root (`isFusionPluginRoot(findWorkbenchRoot())`), or keep cwd and
rewrite the comment to a reason that holds. Leaving the comment is the one option to reject.

**Finding 2 — Low. `hooks/lib/churn.ts:529-561`: the ranking has no noise filter, so the
migration promotes dashboard files into Setup's top ten.**
Record: `shared/issues/260810-1632_o_the-churn-ranking-has-no-noise-filter-so-the-migration-promotes-dashboard-files-into-setups-top-ten.md`

`rankThrashing` excludes absent files and nothing else. `TRACKER_NOISE_FILES`
(`hooks/tracker.ts:123-128`) names four surfaces the write path refuses to count. The
migration correctly lifts legacy bare keys into exactly those spellings — which is what
stops the leak — and the read path then shows the accumulated entries. Measured on the
live map after migration:

```
fusion-workbench/orchestrator-live.md   score=15  total=47   → ranks 10th at --limit 10
fusion-workbench/agentstate.yaml        score=2   total=6
```

So the last slot of the ranking `agents/orchestrator.md` Step 5 tells the orchestrator to
report goes to a file the tracker deliberately declines to measure. Fix: a second exclusion
in `rankThrashing`, counted separately from `absent`.

### Prompt-called helpers

**Finding 3 — Low. `agents/orchestrator.md` Setup Step 5 documents exit 2 and not exit 3.**
Record: `shared/issues/260810-1632_o_setup-documents-churn-rank-exit-2-and-not-the-exit-3-that-this-repos-own-build-cycle-produces.md`

`bin/fusion-churn-rank:49-52` exits 3 when `hooks/dist/churn-rank.js` is absent. The `[ -x ]`
guard `26ea3c3` added does not cover it — the wrapper is present and executable; the build
one directory over is not. The condition is on record in this range's own code:
`hooks/lib/__tests__/helpers/guard-harness.ts:120-128` says `npm run build` deletes and
rebuilds `dist/` and that a parallel session has been observed wiping it mid-run. One
sentence in the same paragraph closes it; do not add a cascade branch.

### Test harness

**Finding 4 — Low. The pty case has no path for a machine that cannot allocate one.**
Record: `shared/issues/260810-1632_o_the-pty-case-in-the-monitor-suite-has-no-path-for-a-machine-that-cannot-allocate-one.md`

`os.openpty()` in `PTY_RUNNER` is unguarded and `startMonitor` attaches no `error` listener,
so a container without `/dev/ptmx` produces two 15-second `monitor did not come up`
timeouts for one pty failure, and a missing `python3` produces an unhandled `error` event
rather than a failing assertion.

The two things the dispatch asked about are both **fine**, and I checked them rather than
assuming: the fake-`open` shim cannot leak (its directory reaches only the child, through
`opts.env`; `process.env.PATH` is never mutated), and the process group is cleaned up
(`detached: true` makes the python runner the group leader, so the existing `afterEach`
`kill(-pid)` reaches the runner, the bash wrapper and the python server alike).

---

## What I verified and found clean

Stated because a review that only lists defects hides the shape of the range.

- **`hooks/dist/` was rebuilt from the committed sources**, not hand-edited. A fresh `tsc`
  build diffs identical against the committed tree.
- **`2679589`'s gate is the right discriminator.** `[[ -t 1 && -z "${MONITOR_NO_BROWSER:-}" ]]`
  is an `if` condition, so `set -euo pipefail` (`bin/monitor:7`) does not act on it, and
  the non-interactive path now never calls `open` at all — which incidentally removes the
  larger half of the exposure open record `260810-1558` describes. The three new cases
  assert on a marker file rather than on the script's text, so a decoy `-t 1` in a comment
  would not satisfy them.
- **`7c4dfb2`'s documented Plane key matches the code.** `docs/plane-setup.md:271-278` claims
  `<circle-dir>::issues/<stamp>_<slug>.md` with the marker dropped and `shared` standing in
  for a Circle-less artifact. `bin/fusion-plane:647-658`: `stable_basename` is
  `sed -E 's/^([0-9]{6}-[0-9]{4})_[a-z]_/\1_/'`, `natural_key` is `%s::%s/%s`, and the
  shared call sites pass the literal `shared`. The worked example in the doc
  (`<stamp>_o_open-issue.md` → `<stamp>_open-issue.md`) is what the sed produces.
- **`e0acdb6` cleaned up completely.** `grep -rn '</content>' --include='*.md'` outside the
  workbench now returns nothing. Both occurrences were tail lines, so no content was lost.
- **`4f16c60` is the only place the claim lived.** A repo-wide grep for the durability
  promise finds one hit, the rewritten sentence itself. No sibling skill still promises
  that git holds archived bytes.
- **The four version surfaces are already coherent** at `7.2.0`: `.claude-plugin/plugin.json:3`,
  `install.sh:27`, `README.md:26`. Only `marketplace.json` in the other repo is outstanding,
  which is release step 3.
- **`churnKey` and `narrowingTarget` really do read one path one way** —
  `projectRelative(resolve(process.cwd(), raw), root)` in both
  (`churn.ts:230`, `tracker.ts:299`). The claim in the commit message holds.

---

## Cross-cutting observations

**Two of the four findings are the same shape: a fix landed, and the artefact explaining
the old behaviour stayed.** Finding 1 is a comment that argues from a premise the code
below it now contradicts; finding 2 is a read path that never learned about a constraint
the write path already had. In both cases the executable half moved and the surrounding
statement did not. This is the third consecutive Turn in this session's reviews to name
that class — `260810-1032` found it in `bin/fusion-plane`'s "no second implementation"
comment, and the two open records `260809-2252` and `260809-2258` are the same thing in
`README-hooks.md` and the noise-list comment. It is worth a decision about where the
obligation sits, rather than a fifth issue record.

**The migration is the most carefully built thing in the range and needed the least
review.** Its rule is stated as a rule rather than as a count, `exists` is injected so the
cases state their own tree, and the idempotence claim is asserted at both the unit level
and end-to-end through the tracker. I re-derived it against 592 live entries and found
nothing the docstring had not already said. The two findings that touch churn are both
*around* it — the gate that decides whether it runs, and the read path that consumes its
output — which is where the attention was not.

## Recommended sequencing

**Release blockers:** none. Tag and ship.

**Next Turn, in this order:**

1. Finding 1 (Medium) — decide whether the churn gate asks cwd or the root, then make the
   comment true either way. It is the only finding with a behavioural tail.
2. Finding 2 (Low) — the noise filter in `rankThrashing`. Small, and it improves the first
   thing the orchestrator reads at every Setup.
3. Finding 3 (Low) — one sentence in `agents/orchestrator.md`. Fold it into whatever
   answers the open decision `260810-1544`, which asks the general form of the same question.
4. Finding 4 (Low) — test diagnosability. Do it when someone next runs the suite off this
   machine, not before.
