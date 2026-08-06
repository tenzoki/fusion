# Incremental review — Turns 3–4 of the Textschicht Circle, commits `81d4154..HEAD`

**Reviewer:** coderev
**Scope:** the six commits `36d9a30`, `9a96466`, `fae818b`, `a1b7872`, `843239c`, `b37f13e` — concentrated per the dispatch on (1) the holder-less stale-lock aging in `bin/fusion-commit-lock` + its new test file, (2) the two new lints, (3) the `/fusion:commit` restructure, (4) the hooks/lib comment-only changes + dist rebuild, (5) five behavioral doc-correction spot-checks.
**Plan context:** `planning/260805-2353_c_plan-textschicht-gegen-code.md`
**Verdict:** sound. The dist is byte-identical to a fresh build, the four lib changes are comment-only citation rewrites whose cited records all resolve, all 1608 hooks tests pass, and every behavioral doc claim spot-checked (six, not five) matches the code. Four issues filed, all Low: one real (demonstrated) race residual in the new holder-less reap, one doc drift the fixing commit itself created, and two honesty gaps in the lints' own exemption machinery.

---

## 1. `bin/fusion-commit-lock` holder-less aging (`b37f13e`) — fix correct, one demonstrated race residual filed

- **The fix is real and tested.** A holder-less `.commit-lock/` used to block acquire forever (issue `260805-1839…`, closed); it is now aged on the directory's own mtime against the same 60 s threshold (`is_stale_lock:124-138`), release refuses it with an honest message (`do_release:219-225`), and the first-fail wait message names the state and the way out (`do_acquire:202`). The 9-test file (`fusion-commit-lock.test.ts`) pins the fix and both behaviours around it (young holder-less blocks; normal cycle untouched; the pre-existing dead-PID reap), driving the real script against a throwaway workbench with backdated mtimes instead of wall-clock waits — robust against timing flake.
- **Portability verified on macOS:** `date -u -d …` fails hard on BSD date (`illegal option`, measured) so the GNU-first `ts_to_epoch` falls through cleanly; `stat -f %m` returns the epoch (measured). On GNU, `stat -f %m target` treats `%m` as a nonexistent FILE operand, exits non-zero, and falls through to `stat -c %Y` — inference from GNU stat's operand semantics, not measured on Linux, but the fallback direction is safe either way.
- **Filed Low (`260806-1030`, holderloser-reap…):** the reap is not exclusive against a *live but suspended* creator. Demonstrated with the real script: creator stalled between `mkdir` and the holder write, directory backdated past 60 s → waiter reaps and acquires (rc=0, `tag: waiter`), creator resumes and its plain `> holder` redirect (`try_acquire:179`) silently overwrites the waiter's holder → both hold, `check` says `held by H`, and the waiter's release is refused while the creator lives. Cheap mitigation named in the issue: noclobber (`set -C`) holder write, treating write failure as a lost acquisition.
- **Filed Low (`260806-1030`, lock-regel-mechanism…):** `rules/workbench-stash-and-lock.md` `### Mechanism` (line 111) and `### Failure modes` still describe only the PID-dead reap and the single `not currently held by anyone` refusal — the same commit that added the holder-less branch left the protocol's own authoring home behind. Textschicht drift created by the Textschicht Circle itself.
- Not filed: the garbled pre-existing comment at `do_release:239-241` ("rmdir first removes holder file too because rmdir on a non-empty dir fails" — it does not; the fallback does). Cosmetic, pre-dates this diff.

## 2. The two new lints (`a1b7872`) — well-guarded overall, two exemption honesty gaps filed

- **The honesty guards mostly bind.** `EXAMPLE_PATHS` is double-guarded (no entry may exist in the tree, every entry must still be cited — both asserted). `RECORD_EXAMPLE_FILES` is load-bearing-checked in both directions (would fire without the exemption, silenced with it). Non-vacuity floors (paths > 50, anchors > 20, records > 10) catch scanner death. Workbench absence degrades loudly, not silently. The `recordsOnly` bound for hooks/lib is well-argued and correct: class (c) is the class that measurably rots in module docstrings, and class (a) there would breed exactly the ever-growing allowlist the header warns against.
- **Filed Low (`260806-1031`, referenz-lint-eg-ausnahme…):** the `e.g.` exemption is implemented as "anywhere earlier on the line" (`/\be\.g\./.test(text.slice(0, idx))`, line 432) while its own header promises "preceded by `e.g.` on its own line" (line 57). Any later record citation on a line that happens to contain an unrelated `e.g.` is silently unresolved — the swallow-a-real-defect shape the file's design note warns about.
- **Filed Low (`260806-1031`, enumerations-lint-unparsbare…):** `conditionalEmissions()` drops an emission whose `if`-condition it cannot classify (`if (!agents) continue;`, line 244) with no accounting; the header's "the non-vacuity assertion fails loudly" holds only for total parser loss (threshold > 2), not for one new block in an unrecognized condition form. Same silence for a reshaped single line in `alwaysOnList()`. Verified that today all four conditional emissions (lines 395/414/432/447 of `bin/fusion-rules`) parse; the hole opens with the next form variant. Fix direction: completeness assertion over all indented `emit_if_exists` lines.
- Acknowledged, not filed (documented scope bounds): class (b) parses only the file-then-heading adjacent form; blockquoted class-(c) lines are skipped wholesale; the conditional co-mention check is one-directional (extra agents on a doc line pass) — each is stated in the file's own boundary notes.

## 3. `/fusion:commit` restructure (`b37f13e`) — flow walks clean end-to-end

Steps 1→7 are consistent: nothing stages before step 6; step 3's analysis sources (`--cached` for pre-staged, `git diff -- <selected>` + untracked content for the rest) cover exactly what step 6 commits; the locked pair `with commit -- bash -c 'git add … && git commit -F …'` holds stage+commit together; the bare form is correctly restricted to the nothing-to-stage case; the `--all` bullet repeats the staged-inside-the-lock rule. This closes the Turn-2 Medium (`260806-0852`, marked `_c_`) as specified. One residual, noted not filed: content **already staged when the skill starts** (step 2: "part of the commit; note it") still sits exposed across the confirmation window — a parallel locked committer can absorb it, and step 6 would then commit less than the user confirmed. The skill cannot protect what was exposed before it ran; a cheap in-lock `git diff --cached --stat` sanity check before the commit would at least detect the absorption. Enhancement, not a defect of this restructure.

## 4. hooks/lib comment-only changes + dist — verified

- All four source diffs (`bash-mutation-guard.ts`, `config.ts`, `paths.ts`, `shell-parse.ts`) are docstring-only: wildcard-form citation rewrites (`_a_`/`_o_` → `_*_`) plus the `paths.ts` deferral-status text. All five cited decision records resolve in the workbench, and `260804-1632` is indeed `_d_` — matching the new "raised and DEFERRED by the user" wording exactly.
- **Dist byte-identical: verified**, not taken on faith — ran `npm run build` (tsc) and `diff -r` against the committed `dist/`; zero differences.
- Full suite: **1608 tests, 30 files, all pass** (run this session, 116 s).

## 5. Doc-correction spot-checks — 6 of 6 accurate

| Claim (corrected text) | Verified against |
|---|---|
| `WRAPPER_PROGRAMS` exported from `lib/command-word.ts`, verbs/git tables in `bash-mutation-guard.ts` (CLAUDE.md, 2 sites) | `command-word.ts:141`, `bash-mutation-guard.ts:743,990` |
| Concurrent-session check is setup **Step 0c**, not 0d (CLAUDE.md, 2 sites) | `skills/setup/SKILL.md:106` (0d is the stylometric-profiles step) |
| Monitor `-n` default is 100 (README-agents) | `bin/monitor:16` usage text |
| README-hooks' "effective hook configuration" — guarded `CLAUDE_ENV_FILE` echo + `printf` systemMessage, two SessionStart hooks | `hooks/hooks.json` — matches verbatim |
| Setup seeds `fusion-guard.json` at the project root (git-tracked) and `plane.config.yaml` into the workbench, both idempotent (README.md) | `skills/setup/SKILL.md:150,171` |
| Orchestrator body's sub-agent list now includes `conceptrev` + `editor` (orchestrator.md:165) | frontmatter `tools:` allowlist — the 13 dispatches match |

## Totals

Critical 0 / High 0 / Medium 0 / Low 4 — all filed under this Circle's `issues/`. Not re-reported: the open findings in the guard-rules-write Circle's `issues/`, the shared-store `_o_` corpus, anything already `_c_` (including the four Turn-2 filings this diff closes), and the deliberately-open `260806-0022` setup-probe/migrate scope issue.
