# Analysis: the consumer citation defect report, measured against fusion's own corpus

**Date:** 2026-08-28 08:59
**Type:** Document Study (with measurement)
**Status:** Complete
**Requested by:** orchestrator (session 260828-0846-orchestrator-session.md, task T1)
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>

## Thesis

Two of the report's four instances hold here, one is refuted for this corpus, and one cannot be measured from this side. What the report gets right is the sharpest part: twelve lines in seven shipped files tell a consuming agent that one of fusion's own decision records sits "in `$SCAN_DECISIONS`" or "under `$SCAN_ISSUES`", every one of those ten records exists only in fusion's own workbench, and the installer copies no workbench. What the report gets wrong is the claim that fusion ships no mechanism that reads a citation: three vitest gates read every citation in the shipped text and in the live record corpus, and all three are green at HEAD. What the report could not see, and what this measurement adds, is that the gates were deliberately made blind to the archive move. A citation naming `shared/issues/X` resolves green when `X` sits under `archive/<sweep>/shared/issues/`, because the resolver strips one sweep level (`unsweep()`); 142 of the 783 path-form citations in the gate's own corpus resolve that way today. And the one mechanism meant to stop an archive move from dangling a shipped citation, filter 3 of `/fusion:archive`, greps for the record's literal basename with `grep -F`, so the marker-wildcarded form the convention mandates never matches it: 75 live records are cited from the shipped text in that form only, and the filter would let every one of them be swept.

## Scope

- Repository: `/Users/k1/Projects/productive/fusion`, branch `main`, HEAD `19b58eef` (2026-08-28 08:54 +0200), `## main...origin/main` in sync, two uncommitted modifications unrelated to this analysis (`.gitignore`, `fusion-workbench/.asset-provenance`).
- Report studied: `260828-0828_*_fusion-citation-bookkeeping-defect-report.md` (verbatim; its consumer-side figures are quoted, not re-derived).
- Shipped text measured: `rules/*.md`, `agents/*.md`, `skills/*/SKILL.md` (45 files, the report's set) plus `CLAUDE.md`, `README.md`, `README-agents.md`, `README-hooks.md` (49 files).
- Workbench measured: `fusion-workbench/` at HEAD, live stores (`shared/`, `circles/*/`) and `archive/` (three sweeps).
- Gates read: `hooks/lib/__tests__/workbench-citation-lint.test.ts`, `reference-resolution-lint.test.ts`, `portfolio-citation-form-lint.test.ts`, and their shared parser `hooks/lib/__tests__/helpers/citation-scan.ts`.
- Scripts: `classify.py` and `dangle.py` in this session's scratchpad; the shell commands are inlined below so each figure reproduces without them.

## Findings

### Instance 1: four citation forms in the shipped text

Classifier: a regex over `YYMMDD-HHMM` tokens, taking a leading `.../` path as form C, a trailing `.md` with no path as form B, a stamp alone as form A, and `stamp_X_slug` without `.md` as form D. A fifth shape, `stamp-slug` with a hyphen and no path (Circle directory names, fictional and real), was counted separately and is not one of the report's four.

| Form | Report (45 files) | Measured here (45 files) | + `CLAUDE.md`, `README*.md` |
|---|---|---|---|
| A bare stamp | 65 | 55 | 32 |
| B storeless basename | 44 | 44 | 9 |
| C store-prefixed path | 42 | 57 | 18 |
| D stamp+slug, no extension | 5 | 5 | 1 |

Verdict: **confirmed**. Four forms are in use; B and D match exactly, A and C differ by matcher (mine counts `circles/<stamp>-<slug>` directory citations as C and stops a stamp at any following digit). Two qualifications the report does not make:

- Of the 44 form-B tokens, 10 are the fictional worked example in `rules/decision-record-examples.md` (`260501-1430_*_vector-store-pick.md`, walked through four states) and 2 are `260510-0930_*_token-format.md` in `agents/playmaker.md`, a fabricated portfolio example. The gates exempt both files by name. So the shipped text carries four forms in *exhibits* as well as in citations, and the report's count does not separate them.
- The convention's stated form (`rules/fusion-workbench-conventions.md` `## Filename Patterns`: "cite a record by its full filename with the state marker wildcarded, `YYMMDD-HHMM_*_<topic>.md`") is satisfied by B and by C alike; C is B with a store in front. The forms that violate it are A (55) and D (5). The report reads the rule as "one form" and counts C against it; the rule's own text does not say whether a store prefix is part of the form, which is question Q3 below.

Per file, the density is in `agents/orchestrator.md` (41 tokens: 25 A, 15 B, 1 C) and `rules/circle-records.md` (15: 5 A, 10 C). Command: `python3 classify.py rules/*.md agents/*.md skills/*/SKILL.md`.

### Instance 2: prompts locate fusion's own records in the consumer's resolver keys

Grep: `grep -nE '\$SCAN_[A-Z]+' rules/*.md agents/*.md skills/*/SKILL.md README*.md CLAUDE.md | grep -E '[0-9]{6}-[0-9]{4}'`, then each hit read for whether the stamp is said to be *in* the key.

| File | Lines | Records cited that way |
|---|---|---|
| `agents/orchestrator.md` | 92, 171, 532, 574, 815 | `260827-1330_*_does-the-session-ask-for-its-directive-first-and-wait-silently.md`, `260809-1731_*_how-should-the-domain-heuristic-count-a-projects-source-files.md`, `260827-1120_*_how-often-does-the-review-pass-run.md`, `260827-1310_*_does-the-coherence-gate-ask-when-its-own-verdict-is-ok.md`, `260817-1613` |
| `skills/archive/SKILL.md` | 142, 290 | `260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md` (twice) |
| `agents/curator.md` | 115 | `260827-0745_*_may-the-curators-evidence-pass-be-bounded-by-its-own-previous-run.md` |
| `agents/planner.md` | 160 | `260817-1613` |
| `skills/next/SKILL.md` | 167 | `260813-0858` |
| `rules/fusion-workbench-conventions.md` | 218 | `260827-1056_*_which-parts-of-the-language-and-backlog-rules-does-every-dispatch-still-carry.md` |
| `rules/review-contract.md` | 45 | `260810-1205` |

Twelve lines, seven files, ten distinct records. All ten exist in fusion's own workbench (nine under `shared/decisions/` or `shared/issues/`, one under `circles/260813-0858-playmaker-maintains-backlog-store/decisions/`; `find fusion-workbench -name '<stamp>_*'`). The plugin ships no workbench: `install.sh:82-83` copies `.claude-plugin agents skills rules hooks bin stilwerk templates docs README.md README-agents.md README-hooks.md LICENSE` and nothing else. `bin/fusion-paths` resolves `$SCAN_DECISIONS` against the consuming project's `fusion-workbench/`, so in every consuming project each of the twelve lines names a location that holds nothing.

Verdict: **confirmed**, and larger than the report's five stamps (it names `260822-1635_*_may-the-orchestrator-have-a-directive-captured-and-by-which-route.md` too, which at `agents/orchestrator.md:318` is cited without a `$SCAN_` key and is a plain provenance citation). The prior analysis `260818-0715-preventing-fusion-internal-identifiers-from-reaching-a-consuming-project.md` already concluded that the shipped text's record stamps are provenance by design and that no static gate can separate a legitimate provenance citation from a harmful one; it did not examine the `$SCAN_*` phrasing, which is not a stamp reaching a consumer but an *instruction* that points a consumer's agent at its own empty store. Filed as an issue (below).

### Instance 3: uniqueness of (stamp, slug)

```
find shared circles -type f -name '[0-9]*-[0-9]*_?_*.md' -not -path '*/archive/*' | wc -l          # 863
... | sed -E 's#.*/([0-9]{6}-[0-9]{4})_._(.*)\.md$#\1 \2#' | sort -u | wc -l                       # 863
find . -type f -name '[0-9]*-[0-9]*_?_*.md' | wc -l                                                # 1249 (incl. archive/)
... | sort -u | wc -l                                                                               # 1249
find . -type f -name '[0-9]*-[0-9]*\[*' | wc -l                                                     # 0 bracket-form names
```

| Corpus | Records | Distinct (stamp, slug) | Collisions |
|---|---|---|---|
| live stores (`shared/`, `circles/*/`) | 863 | 863 | none |
| live + `archive/` (three sweeps) | 1249 | 1249 | none |
| pre-v4 bracket-form names | 0 | n/a | none possible |

Stamps alone: 1502 stamped artifacts (marked and markerless, all stores), 298 stamps carried by more than one file. That is the ambiguity the convention's "a bare stamp is not a citation" sentence names, and it is unchanged in kind.

What the convention's own measurement covered (inference from git, not from the sentence): the "876 records on 260824" line entered at commit `2b055a0f` (2026-08-24 12:14). At that commit the tree held 868 marked records outside `archive/` and 1100 including it; 876 is within uncommitted-file distance of 868 and far from 1100. So fusion's measurement was over the live tree and excluded the archive, which is what the report asks. It does not matter for the claim: measured today including the archive, the claim holds.

Verdict: **refuted for this corpus**: the uniqueness holds here at every scope the report asks about. The report's own collisions came from bracket-form legacy names, of which fusion's tree carries none. The claim in the rule is scoped narrowly (live tree, one date) and should say so, but it does not fail.

### Instance 4: the shipped example fails a consumer-side gate

Verdict: **unmeasurable here**. `make lint-citation-form` and `codebase/python/citation_form.py` are the consumer's, not shipped, and the report does not say which shipped example was placed in the scan root. What can be said from this side: the convention's own example (`YYMMDD-HHMM_*_<topic>.md`) is form B, the storeless form the consumer adopted; the store-prefixed examples elsewhere in the rules (`shared/decisions/...`) are form C. Whichever one the consumer's gate rejects, the rule offers both.

### Item 4 of the task: what the three gates cover

| Gate | Corpus | Forms read | Store move (archive) detected | Marker move detected | Exempt |
|---|---|---|---|---|---|
| `reference-resolution-lint` class (c) | shipped text: `rules/`, `agents/`, `docs/`, `templates/`, `skills/*/SKILL.md`, `README*.md`, `CLAUDE.md`, `bin/*` shebang scripts and `install.sh` (comment lines), `hooks/lib/*.ts` (comment lines) | store-prefixed (`REC_RE`), Circle record (`CIRCLE_REC_RE`), storeless basename with marker (`BARE_RE`), Circle directory (`CIRCLE_RE`), `stamp-name` (`STAMP_RE` dashed). Bare stamp is scanned but **never judged** (`GATE_KINDS` excludes `stamp-bare`) | **No**: `findRecord()` matches through `unsweep()`, one archive level, by user choice on 2026-08-19 (shape 1) | **Yes**: exact marker resolving only under another marker is `stale-marker`, a violation | fenced code, blockquote lines, `e.g.` within the clause, footer-template spans, placeholder syntax, slugs containing `foo`, `rules/decision-record-examples.md` and `skills/migrate/SKILL.md` wholesale |
| `workbench-citation-lint` | live records only: `circles/*/_?_circle.md` (any state), `_o_` issues, `_o_`/`_a_` decisions, `_o_`/`_p_` plans, `portfolio.md`; `archive/`, `stashes/`, `.migration-v2-backup/` excluded at the root | same parser, same kinds | **No** (same resolver) | **Yes**, for citations *in* live records; a record that reaches a terminal marker leaves the corpus with whatever it cites (the file's own header names this hole) | same parser exemptions |
| `portfolio-citation-form-lint` | one file: `agents/playmaker.md` | `stamp_X_` with a literal marker letter | n/a (form, not resolution) | Prevents the generator from teaching a literal marker; resolves nothing | the rest of the shipped text, by design |

Against the report's five failure modes:

| Failure mode | ref-res (shipped) | workbench lint (live records) | portfolio lint |
|---|---|---|---|
| store moved to `archive/` | not caught (tolerated) | not caught (tolerated) | n/a |
| store moved elsewhere (`shared/` → Circle, wrong store) | caught (`wrong-store`) | caught | n/a |
| marker moved | caught (`stale-marker`) | caught, inside the corpus | form only |
| `$SCAN_*` self-citation | not a token the grammar reads; the stamp beside it is `stamp-bare` and unjudged | n/a (no shipped text) | n/a |
| non-`.md` basename | read; `basenameMatcher` treats a citation without `.md` as a **prefix**, so it resolves loosely rather than not at all | same | n/a |
| broken across a line end | scanning is per line; the first-line fragment is read as a truncated prefix citation and resolves loosely, or fails as `dangling` if it stops before the slug | same | n/a |

All three gates are green at HEAD: `cd hooks && npx vitest run lib/__tests__/{workbench-citation-lint,reference-resolution-lint,portfolio-citation-form-lint}.test.ts` → 61 passed. The `reference-resolution` baseline is pinned at `paths: 1514, anchors: 213`, re-approved 2026-08-28.

### Item 5: dangling citations now, by cause

Resolver: my `dangle.py` re-implements the gate's grammar (`REC_RE`, `BARE_RE`, fence and blockquote skips) but resolves **without** `unsweep()`, so an archive move shows up as its own class. "Store moved (other)" means the record exists under a different live store or Circle than cited.

**Shipped text (49 files):** 57 path-form and 57 storeless tokens. 52 + 45 resolve to a live record. The remaining 5 + 12 are all fabricated exhibits (`260501-1430_*_vector-store-pick`, `261107-0915_*_vector-store-revisit`, `260716-1910_*_plan-foo`, `260519-0438-coderev-loader-check`, `260510-0930_*_token-format`), every one in a file or span the gate exempts. **Zero real dangling citations in the shipped text.** No shipped citation points into `archive/`.

**Live workbench, every `.md` outside `archive/` (1796 files):**

| Cause | Path-form (8148 tokens) | Storeless (1231 tokens) |
|---|---|---|
| resolves to a live record | 4962 | 542 |
| store moved: record now under `archive/` | 898 | 57 |
| marker moved (record live) | 1291 | 417 |
| marker moved and archived | 535 | 169 |
| store moved to another live store or Circle | 22 | n/a |
| store and marker both moved | 13 | n/a |
| no match anywhere (never existed, truncated, or renamed) | 81 | 46 |

So across the whole live tree 3186 of 8148 path-form citations (39 %) do not resolve at the path they spell; marker moves account for 1826, archive moves for 898, both for 535. That is the opposite ratio to the consumer's (826 store versus 268 marker), because this tree's session logs and closed records spell markers literally from before the wildcard rule (decision `260806-0015`), and the consumer's corpus was measured after its own marker sweep. Both are inference from the counts, not verified against the consumer's data.

**Gate corpus only (the 88 files `inCorpus()` selects):** 783 path-form tokens, 611 resolve live, **142 resolve only under `archive/`**, 0 marker-moved, 0 unmatched. Those 142 are what the archive tolerance hides; without `unsweep()` the workbench gate would be red on 142 findings, concentrated in closed Circle records (`_c_circle.md` of `260801-1244-curator`, `260813-0858-playmaker-maintains-backlog-store`, `260801-1244-rule-provenance-header`, `260716-1847-workbench-umbau`).

**Blind spots of my matcher, stated as the report states its own:** it does not resolve `$SCAN_*`-relative citations (none of the twelve above carry a path to resolve); it treats a token without `.md` as a prefix, like the gate, so 910 path-form tokens without an extension may resolve to a longer basename than intended; it does not join lines, and a separate probe finds 16 candidate citations broken across a line end in the live tree (`grep` for a line ending inside a stamp_marker_slug- token whose successor begins with slug characters), all in history and closed records; and a `_c_` record cited as `_c_` counts as resolved even where the citing text meant the record when it was open, because the resolver has no notion of time.

### The archive safety filter cannot see the mandated citation form

`skills/archive/SKILL.md:193-201` (filter 3) keeps a candidate out of a sweep when `grep -r -l -F -e "$bn" -e "$rel"` finds its basename or its workbench-relative path in the shipped text and the project's `CLAUDE.md`/`rules/`. `$bn` is the literal basename, marker included (`260811-1534_*_does-...`). A citation in the mandated form spells `260811-1534_*_does-...`, and `grep -F` matches no wildcard. Simulation over the 863 live marked records against the same corpus (`grep`-equivalent string search over `rules/ agents/ skills/ README*.md CLAUDE.md hooks/lib/*.ts hooks/*.ts bin/* docs/`): **1 record is found by its literal basename or path; 75 are cited only in wildcard form and would not be kept.** No archived record is currently cited from the shipped text in wildcard form, so the miss has not yet been realised; the tier-1 sweeps so far took records the shipped text does not cite. Verified by simulation, not by running the skill. Filed as an issue (below).

## Implications

- The report's framing, "fusion ships no mechanism that notices", is false for this repository and true for the consumer: the three gates are `npm test` here, are not shipped as a runnable check to a consuming project, and the consumer's own gate is the first mechanism its corpus ever had. Whether fusion should ship a checker is question Q4.
- The store-move blindness is a recorded choice (2026-08-19, shape 1) made so that an archived record stays citable at its old path. It is exactly the property the consumer's report calls the defect. The two positions are not reconcilable by a matcher; one of them is a decision about what an archive move means for a citation.
- The `$SCAN_*` self-citations are the one finding that harms a consumer today, independently of any decay. The fix is textual and small (twelve lines), but it needs the answer to Q2 first: if the citations are provenance, they should say "fusion's own record" and drop the key; if they are meant to be followed, they cannot be, from any consuming project.
- Filter 3's `grep -F` defeats the convention it was meant to protect. This is the one defect in this analysis with a mechanism behind it, and it is unfiled.

## Recommendations

1. Fix the twelve `$SCAN_*` self-citations after Q2 is answered (coder; single pass, one commit; the reference-resolution baseline will not move because the stamps are `stamp-bare` and unjudged).
2. Fix filter 3 to match the wildcard form (coder): derive the search key from the basename with the marker position replaced by a pattern (`grep -E` with `_[a-z*]_`) or search for `stamp_` and the slug separately. Add a case to the archive skill's own probe that a wildcard-cited record is kept.
3. Put Q1–Q5 to the user as one decision record before the shipped rule is reworded (shaper or analyst); the report asks for exactly this and proposes no wording.
4. Do not restate the uniqueness sentence in the rule until Q3 is answered; add the scope ("live tree, 2026-08-24") if it is touched at all.

## Filed Issues

- `260828-0900_*_twelve-shipped-lines-tell-a-consuming-agent-that-one-of-fusions-own-records-sits-in-its-scan-store.md`
- `260828-0901_*_the-archive-safety-filter-greps-the-literal-basename-and-cannot-match-the-wildcard-citation-form-the-rule-mandates.md`

## Sources

- `260828-0828_*_fusion-citation-bookkeeping-defect-report.md`
- `rules/fusion-workbench-conventions.md` `## Filename Patterns`
- `hooks/lib/__tests__/helpers/citation-scan.ts:85-128` (grammar), `:354-360` (`basenameMatcher`), `:419-427` (`anchoredUnder`, `unsweep`), `:440-462` (`findRecord`), `:596-808` (per-token walk, `scanRecordCitations`)
- `hooks/lib/__tests__/workbench-citation-lint.test.ts:1-170` (corpus predicate and its stated hole)
- `hooks/lib/__tests__/reference-resolution-lint.test.ts:20-130` (surface), `:479` (baseline)
- `hooks/lib/__tests__/portfolio-citation-form-lint.test.ts:1-60`
- `skills/archive/SKILL.md:193-201` (filter 3)
- `install.sh:82-85` (copy loop)
- `260818-0715-preventing-fusion-internal-identifiers-from-reaching-a-consuming-project.md` (prior verdict on shipped stamps)
- `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`, `.../260819-2213_*_the-citation-grammar-cannot-express-a-record-inside-archive-so-a-corrected-archive-path-still-scans-as-wrong-store.md` (shape 1)
- `260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md`, `260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md` (open neighbours)
- `git log -S'876 records' -- rules/fusion-workbench-conventions.md` → `2b055a0f`; `git ls-tree -r --name-only 2b055a0f fusion-workbench`

## Open Questions

For a decision record; none is decided here.

- [ ] **Q1** Is an archived record a citation target at all? Shape 1 (2026-08-19) says a citation of `shared/issues/X` may resolve to `archive/<sweep>/shared/issues/X` and the gate stays green; the consumer's report says that resolution is the defect. 142 citations in fusion's live gate corpus rest on the answer.
- [ ] **Q2** Are the record citations in the shipped prompts provenance for fusion's maintainers, or pointers a consuming agent is meant to follow? Twelve lines currently read as the second and can only be the first.
- [ ] **Q3** Does the mandated citation form include the store segment? The rule's example is storeless (`YYMMDD-HHMM_*_<topic>.md`), its prose says "full filename", and 57 shipped citations carry a store. If the store is dropped, the marker wildcard is the only variable part left, which is the report's question 3.
- [ ] **Q4** Does fusion ship a citation checker a consuming project can run, or does the convention stay checked only in fusion's own `npm test`? The consumer built its own; the report offers it.
- [ ] **Q5** Should the uniqueness sentence in `## Filename Patterns` state its scope (live tree, one date), given that it holds today at every scope but was measured at one?
