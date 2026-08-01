# Code review — the cadence skill port and the v5.7.0 release

**Sender:** coderev
**Session:** cadence-skill release session, Turn 1 (incremental)
**Scope reviewed:** `git diff 47c4398..HEAD` — three commits, seven files
**Reference:** `/Users/kai/Projects/productive/F05-flight/codebase/flight/skills/cadence/SKILL.md` (the port's origin, 196 lines)

---

## Summary

The port is faithful and in places better than its original — it fixes two internal
inconsistencies flight still carries, and the four specified adaptations are all executed
correctly against fusion's path-resolution contract. Three defects found, none of them a
release blocker: one silent-failure risk in the source-gathering shell block, one
inherited ambiguity in the churn metric, one frontmatter-hygiene item. The four
documentation surfaces are accurate and mutually consistent, and every version surface —
`plugin.json`, the marketplace clone, the `install.sh` pin example, the `v5.7.0` tag — is
coherent.

**Totals:** Critical 0 · High 0 · Medium 2 · Low 1

---

## Findings by theme

### Shell correctness

**M1 — an unsubstituted `$SCAN_HISTORY` writes a silently empty digest.**
`skills/cadence/SKILL.md:88`, `:91`, `:147`. The resolver keys are interpolated into
executable blocks with nothing exporting them; the Bash tool does not persist environment
between calls. Verified: the gathering loop under empty expansion produces no output and
**exits 0**, and `mkdir -p "$WORKBENCH/$OUT_MEMO"` becomes `mkdir -p "/"`, which succeeds.
This is the house pattern (seven sibling skills do the same), but cadence is the first
consumer where the slip is silent and self-consistent rather than loud. Filed:
`shared/issues/260731-2246_o_cadence-empty-key-expansion-writes-a-silently-empty-digest.md`.

**Checked and correct** — the items the brief asked about specifically:

- `date -v-7d … || date -d '7 days ago' …` (`:56`, `:61`). Sound both ways: BSD takes the
  first, GNU rejects `-v` with a non-zero exit and falls through. `2>/dev/null` hides only
  the BSD-on-GNU usage noise. `date -v-"${back}"d` concatenates to a single `-v-3d` arg
  correctly. Verified on this Darwin host: `back=3` → `2026-07-28`, `week_start` →
  `2026-07-24`.
- `[ "$back" -eq 3 ] && weekend=… || weekend=…` (`:63`). The `&& … || …` trap needs the
  middle command to be able to fail; a variable assignment cannot, so the idiom is safe
  here. Would be wrong with a different payload — but it is not the payload used.
- `for d in $SCAN_HISTORY` unquoted (`:88`). Intentional and correct: the resolver's
  contract makes multi-value keys space-separated
  (`rules/fusion-workbench-conventions.md` `## Path Resolution` → Contract). A path
  containing a space would break it — but it would already have broken the resolver's own
  output format, so the skill is not the place to defend that. Pathname expansion also
  applies to the unquoted value; Circle directory names are `<stamp>-<slug>`, so no glob
  metacharacter can occur. No finding.
- `find … 2>/dev/null` against possibly-absent directories (`:88`). Correct, and the
  comment at `:86-87` gives the real reason (`ls a/*.md b/*.md` aborts under zsh when one
  glob misses). `-maxdepth` placement is portable across BSD and GNU. The mtime fallback
  `date -r <file>` (`:108`) works on both.

### Metric definition

**M2 — "session" is defined two ways for the git source.** `skills/cadence/SKILL.md:103`
says one git *commit* is a log unit; `:136` says a session is one git-commit *day*, while
citing step 4 as its authority. Ten commits in an afternoon score 10 or 1 depending on
which sentence is read last, and git is usually the highest-volume source, so this decides
list 3's ranking. Inherited verbatim from flight (`:91` vs `:126`), not introduced here.
Filed: `shared/issues/260731-2246_o_cadence-churn-session-defined-two-ways-for-git-commits.md`.

### Frontmatter and packaging

**L1 — `Glob` and `Grep` listed but never prescribed; description is 904 chars.**
`skills/cadence/SKILL.md:4` and `:2`. The body uses `find` (arguing for it explicitly) and
Read. The description is 2.5x the next-longest skill's and sits in every session's context,
against fusion's own lean-context convention. Filed:
`shared/issues/260731-2246_o_cadence-frontmatter-unused-tools-and-oversized-description.md`.

**Frontmatter parses.** No `: ` occurs inside the description value, so the unquoted plain
scalar is safe — the `CLAUDE.md`-documented breakage does not apply. Three keys parse
cleanly; `claude plugin validate .` passes (one pre-existing unrelated warning). No tool
is used but unlisted. `install.sh:80` copies `skills` wholesale, so the new skill ships.

---

## Fidelity of the port

Nothing load-bearing was lost. Verified line by line against the flight original:

| Element | Verdict |
|---|---|
| Monday collapse (`dow=1` → `back=3`) | identical, `:60` |
| Churn = distinct sessions, threshold ≥ 2 | preserved, `:136-139` |
| Meta-topic exclusion (four bullets + the "would the user name this" test) | preserved and correctly re-domained from flight/fusion/scout to fusion alone, `:116-123` |
| Empty-window handling | preserved, `:127`, `:170`, `:178` |
| Output template | preserved; the sources line and the Notes line were re-domained | 
| Date-derivation order | preserved, single-convention as specified |

Two improvements over the original, worth keeping: flight's list numbering contradicted its
own intro (its "list 1" meant the 7-day list in step 5 and the yesterday list in the
header, and step 6 called churn "list 2"); the port renames them to "the recent lists" and
"the third list" and is internally consistent. And the mtime fallback now requires
recording the fallback in Notes (`:108`), which flight only implied.

One behavioural narrowing, deliberate and defensible: flight degraded to a git-only run
when no workbench was present; the port halts (`:21`). That matches every other fusion
skill except `/fusion:log-activity`, which is the documented exception because its output
lands in the project root rather than the workbench.

The four specified adaptations were all executed correctly and are not flagged.

---

## Correctness against fusion's conventions

- `$SCAN_HISTORY` use matches the contract, including the invariant-2 citation at `:97`
  and the "iterate every path" instruction — the skill states the under-reporting harm
  rather than just the rule, which is the right emphasis.
- `$OUT_MEMO` is unconditionally `shared/memos`, so the digest can never be Circle-bound.
  Consistent with the Origin Rule. Confirmed live: `bin/fusion-paths cadence` emits
  `WORKBENCH`, `OUT_MEMO`, `SCAN_HISTORY` and nothing else, exit 0.
- The new `Cadence digest` row in `rules/fusion-workbench-conventions.md:242` is accurate,
  as is the added append-vs-overwrite paragraph at `:248` and the state-marker sentence at
  `:268`.
- Exit-code handling at `:33-35` matches the documented meanings exactly, including the
  load-bearing part: exit 4 explicitly does **not** send the user to check `.active-circle`.
- The path-literal lint passes; full hooks suite 316/316, including
  "resolves every skill too, with no stderr", which now covers cadence.

## The documentation surfaces

All four accurate and mutually consistent. `README.md:150`'s claim that cadence
"summarizes the activity log rather than replacing it" is correct — the activity log is
one of three read-only sources (`:81`, `:99`) and the skill writes only
`cadence-$USER.md` (`:211`). `README-agents.md:203` and `CLAUDE.md:14` agree on the path
and the overwrite semantics.

`docs/philosophy.md:15` names `/fusion:memo` and `/fusion:log-activity` as traceability
examples and was left untouched. Agreeing with the implementer's judgement: it is example
prose in a *why* document, not an enumeration, and the pillar reads complete without a
third example.

## Version hygiene

Coherent across all four surfaces. `plugin.json` 5.7.0; the marketplace clone's fusion
entry 5.7.0 (`96d2d65 chore(fusion): bump to 5.7.0`); `install.sh:27` pin example
`tags/v5.7.0`; tag `v5.7.0` present. No stale `5.6.0` / `5.5.1` reference remains outside
the workbench's own historical records. Nothing else in the repo carries a version.

## Release-blocking judgement

**Nothing found would have warranted holding the release.** M1 is the only finding with a
wrong-output consequence, and it is a latent robustness gap in a pattern seven shipped
skills already rely on — it neither regresses anything nor blocks any other surface. M2
affects the ranking of one of three lists in a new advisory digest, and it shipped in
flight for months. L1 is hygiene. The release was correct to go out; all three are
follow-up work.

---

## Reconciliation annotation — 260731-2324 (reconciler, domain `code`)

Findings re-verified against the tree at `17730b8`. All three confirmed; all three remain open in `shared/issues/` with reconciliation evidence appended to each. No finding was resolved between the review and this pass, and none should have been — the release was already out.

| Finding | Status | Issue file |
|---|---|---|
| M1 — empty key expansion writes a silently empty digest | confirmed open | `shared/issues/260731-2246_o_cadence-empty-key-expansion-writes-a-silently-empty-digest.md` |
| M2 — churn "session" defined two ways for git | confirmed open | `shared/issues/260731-2246_o_cadence-churn-session-defined-two-ways-for-git-commits.md` |
| L1 — unused tools in `allowed-tools`, oversized description | confirmed open | `shared/issues/260731-2246_o_cadence-frontmatter-unused-tools-and-oversized-description.md` |

Independently re-checked and agreed, with the evidence:

- **Version hygiene coherent across all four surfaces.** `.claude-plugin/plugin.json` 5.7.0; marketplace clone at `96d2d65 chore(fusion): bump to 5.7.0`; `install.sh:27` pin example `tags/v5.7.0`; git tag `v5.7.0` present.
- **Tests green.** `npm test` from `hooks/` — 316 passed, 12 files (run 260731-2324), matching the review's count.
- **`bin/fusion-paths cadence`** emits `WORKBENCH`, `OUT_MEMO`, `SCAN_HISTORY` and nothing else, exit 0.
- **The three documentation statements in `rules/fusion-workbench-conventions.md` are accurate** against the skill as it stands — the `Cadence digest` row (`$OUT_MEMO`, `cadence-<username>.md`, no state marker) matches `skills/cadence/SKILL.md:144`; the append-vs-overwrite paragraph matches `:150`; the widened no-marker sentence is consistent.

Two corrections, neither affecting a finding:

1. **The description-length table counts the `description:` key.** Re-measured on the value alone: cadence 891 chars, `migrate` 346, `circle-stash` 286, `seed-from-plane` and `cleanup` 264 — each row 13 lower than reported. The 2.6x outlier stands.
2. **"across all 15 skills" is 16** — `skills/` holds 16 entries with cadence included.

One live-environment caveat the review could not have seen: the installed plugin at `$FUSION_PLUGIN_ROOT=/Users/kai/.fusion` is still **5.5.1**, so `"$FUSION_PLUGIN_ROOT/bin/fusion-paths" cadence` exits **2** (`unknown name 'cadence'`). The review's exit-0 verification used the repo-local `./bin/fusion-paths`, which is the right thing to verify. `/fusion:cadence` becomes runnable once the user picks up 5.7.0 locally (release-process step 6). Not a defect.
