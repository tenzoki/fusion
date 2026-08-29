# Code review: the storeless citation form at Circle closure

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `66b486e0..e9f2ed0b`
**Not-opened:** none
**Circle:** `260828-2342-citation-form-drops-store-segment`
**Dispatched by:** orchestrator, Phase 4 step 2a
**Previous review's Not-opened:** not recorded

Opened in full: `hooks/lib/citation-scan.ts`, `hooks/scripts/citation-sweep.mjs`, `hooks/citation-check.ts`, `bin/fusion-citation-check`, the four new or changed tests (`citation-sweep`, `fusion-citation-check`, `archive-filter-key`, the diffs of `reference-resolution-lint` and `workbench-citation-lint`), the shim, the diffs of `skills/archive/SKILL.md`, `skills/cleanup/SKILL.md`, `rules/fusion-workbench-conventions.md`, `rules/circle-records.md`, `agents/orchestrator.md`, the other prompt and skill edits, `README-hooks.md`, `CLAUDE.md`, `docs/upgrading-to-v10-20.md`. `hooks/dist/` was not read line by line; `committed-dist.test.ts` holds it equal to the source and the suite is green (`npm test`, 2026-08-29 13:42, exit 0). The workbench sweep was sampled, not re-reviewed: 24 archived and 24 live diff lines by stride, every `**Date:**` line the sweep touched, both head fields, and a second `--dry-run` of the script over the swept tree.

## Summary

The grammar, the checker and the gates are sound: one tokeniser, store-prefixed shapes detected and never resolved, the archive index kept for a bare name, the verdict on stdout and never in the exit code, tests that read the skill's own text. The defect is in the sweep's fourth rewrite rule. `stamp-bare` rewrites a bare stamp into a filename on a match count of one, which the scanner's own `partition()` header calls an accident, and that rule rewrote 29 `**Date:**` head fields into self-citations, chained six legacy `_coder_` filenames, and left 175 truncated citations with a dead tail after `.md`, all committed in `f1099c5f`. The filed idempotency issue names the truncated shape; the date fields and the legacy marker shape are new, and its `rewrites=0` acceptance is unreachable while the terminal-record rule lives only in the hand pass.

## Totals

Critical 0 / High 1 / Medium 1 / Low 3 (one filed, two noted). Issues filed: 3.

## Findings by theme

### 1. The sweep changed meaning in three token classes (High)

Filed: `260829-1346_*_the-committed-sweep-rewrote-29-date-head-fields-into-filenames-and-left-181-chained-tails-in-the-tree.md`.

- `hooks/scripts/citation-sweep.mjs:125-129` rewrites any `stamp-bare` hit with `matches.length === 1`. `STAMP_RE` (`hooks/lib/citation-scan.ts:145`) bounds the stamp only by `(?![0-9])`, so `**Date:** 260801-1355`, `260809-1224_d`, `260826-0136_*_` and `260731-2235_coder_…md` all tokenise as a bare stamp.
- Measured at `e9f2ed0b`: 29 `**Date:**` lines changed by the sweep (`git diff 66b486e0..e9f2ed0b -- fusion-workbench | grep -E '^\+\*\*Date:\*\*'`), 175 `.md_<marker>` tails in 69 files, 6 `.md_coder_…` doubled tails. A second `--dry-run` offers 208 more (`stamp-bare=208`, 136 plain, 45 marker-tailed, 27 bracket-tailed).
- Fix direction: repair from the diff pair by script, not by hand; remove the `stamp-bare` rewrite from the script or give `STAMP_RE` a trailing boundary. Scope: the workbench at HEAD plus the script.
- Filed concurrently by the reconciler while this pass ran: `260829-1343_*_fifty-nine-marker-tails-the-sweep-produced-still-stand-in-terminal-records.md`, the letter-tailed subset (59) measured by a narrower grep; the two issues cross-reference each other and are one repair.
- Live at the time of writing, uncommitted: the active Circle record's line 66 (Turn log) cites its session history with the store segment, and `workbench-citation-lint` is red on it in the working tree. The orchestrator wrote that line this session; it is one storeless rewrite, not a code finding.

### 2. The marker slot is one letter and the index is not (Medium)

Filed: `260829-1347_*_the-grammars-marker-slot-is-one-letter-while-24-indexed-artifacts-carry-a-word-there-and-the-stamp-bare-rewrite-checks-no-boundary.md`.

- `BARE_RE` (line 134), `basenameMatcher` (line 295), `storelessBase` (line 311) and the uniqueness test's `STAMPED_RE` all read `_[a-z]_`; `workbenchIndex()` (line 430) holds 24 files with `_coder_`, `_ontocoder_`, `_planner_` in that slot. A citation of one is neither bare-record nor exempt, so it falls through to `stamp-bare` and the sweep chains it. The uniqueness measurement the rule text cites (2 235 basenames, 0 collisions) skips those 24 while the `stamp-name` prefix lookup at line 617 reaches them.
- Whether the slot widens or the 24 are migrated is a decision; the issue does not pre-empt it.

### 3. A rule names a consumer that does not read the field (Low)

Filed: `260829-1348_*_circle-records-names-playmaker-as-a-resolver-of-the-head-field-and-the-playmaker-prompt-never-reads-it.md`. `rules/circle-records.md:240` says playmaker resolves `**Active spec/plan:**` by `find`; `agents/playmaker.md` never mentions the field. The orchestrator half is real (`rules/orchestrator-resume.md:34`).

### 4. Noted, not filed (Low)

- **Exemption keyed on cwd-relative path.** `citation-sweep.mjs:142` passes `relative(cwd, abs)` as `rel`, and `RECORD_EXAMPLE_FILES` (`citation-scan.ts:148`) is keyed `rules/decision-record-examples.md`. Run from any directory but the plugin root with those files named, the two fabricated-corpus files lose their exemption and are rewritten. The header does not say the script must run from the plugin root. Harmless for a consuming project (it has neither file); one sentence in the header closes it.
- **`stamp-name` prefix resolution is asymmetric.** A truncated record basename resolves by prefix over files (line 617) but a truncated Circle name does not (line 618-620 skips `circleDirs()` for a dashed token, and line 612 asks for an exact key). Defensible, since the rule mandates the bare directory name exactly, but undocumented in the grammar header.

## What was checked and holds

- `citation-scan.ts`: the five gate kinds are unchanged (`GATE_KINDS`, line 354) and the reference-resolution lint's literal copy is compared against it; store-prefixed detection covers all three shapes, with the `fusion-workbench/` prefix on `REC_RE` and `CIRCLE_REC_RE` and reached for `CIRCLE_RE` through the covered-span check at line 498; `scanRecordCitations` (line 655) reports `store-prefixed` as a violation; `partition()` puts it under `dangling` with the reason stated at line 765. Fence handling unchanged from the 2026-08-20 audit.
- `hooks/citation-check.ts`: corpus matches its header (`FROZEN_PREFIXES` line 66, `projectFiles` line 69); `verdict` = dangling + stale-marker + store-prefixed (line 126); exit 0 on a verdict, 1 usage, 2 no workbench; `exitZeroOnStdoutEpipe()` first. `bin/fusion-citation-check` is the `fusion-staging-drift` shape, exit 3 on a missing build, resolved relative to itself. The installed copy at `~/.fusion/bin/` lacks it, as the plan said it would; the `[ -x ]` branch in `skills/cleanup/SKILL.md:221` prints `helper-missing` this session.
- `skills/archive/SKILL.md:198`: the `key=` derivation escapes ERE metacharacters and widens the slot to `[a-z*]`; `archive-filter-key.test.ts` runs the skill's own text through bash. The truncated form `…upper-bound…` at `skills/archive/SKILL.md:290` is not matched by the key, which was equally true of the `-F` form it replaced.
- The 20 `$SCAN_*` rewrites: each names the record in the storeless form and says "fusion's own"; the lint at `reference-resolution-lint.test.ts:541-558` keeps a stamp and `$SCAN_` off one line outside a fence.
- The rule text: `rules/fusion-workbench-conventions.md:242` states the form, the violation, the three shapes, the uniqueness scope and the commit; `rules/circle-records.md` head-field paragraph and template agree with `agents/orchestrator.md:383` and `agents/shaper.md:57`.
- Sampled sweep lines (48 by stride across archive and live, both head fields): every sampled rewrite outside the three classes above dropped a store segment or starred a marker and changed nothing else.

## Cross-cutting observations

- One design line runs through findings 1 and 2 and the filed idempotency issue: the scanner refuses to judge a bare stamp (`partition()`, line 750: "no mechanism reading that token can answer it") and the rewriter judges it anyway. Every corrupted token in the tree came through that one rule.
- The plan's risk table (`260829-1226_*_citation-form-drops-store-segment.md`, "it is idempotent") was the unverified premise; the step-10 log measured it false and the issue was filed, but the committed tree kept 181 tokens the hand pass missed.

## Recommended sequencing

1. Finding 1 before the next archive sweep or `--write`: the 29 `**Date:**` lines chain on every further run.
2. Finding 2 as the mechanism fix in the same change (remove or bound the `stamp-bare` rewrite; settle the marker-slot grammar by decision).
3. Finding 3 and the two notes at any cleanup.

Release note: none of the three blocks `v10.20.0` as tagged; the checker and the gates are correct. The damage is in workbench records, not shipped code.
