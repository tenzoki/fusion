# coderev: Turn 1 — the prose metric, Setup Step 0e, and the repunctuation

**Reviewed-range:** `7135a19..7832553`
**Not-opened:** none

**Date:** 2026-08-21
**Agent:** coderev
**Circle:** `260820-2051-style-rules-arrive-and-get-measured`
**Dispatched by:** user, for Turn 1 of the active Circle
**Coverage before this pass:** `bin/fusion-review-coverage --since 7135a19` reported `commits=13 reviews=0 uncovered=13 verdict=uncovered carried=(not recorded)`. Nothing was inherited.

## Summary

`bin/fusion-prose-metric` is correct. Every claim its header makes about itself reproduces, its four exclusion regions behave as specified at their boundaries and in combination, and the pre-repair window frozen in the measurement protocol re-measures to the file. The two defects worth acting on before this Circle closes are both in `/fusion:setup` Step 0e: its classification block dereferences a variable that does not survive the shell it runs in, and the resulting failure lands in `absent`, the one outcome its five-case classification does not cover. Beyond that, three commits state evidence stronger than what they establish, and the hook-test growth bound has 43 of 2500 lines left, which is why the Circle's most consequential new program shipped with no test.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 2 |
| Medium | 4 |
| Low | 2 |

Ten issue files were filed in this Circle's issue store; two of the ten carry two parts each.

## Findings by theme

### A. The measurement program — verified, and it holds

Nothing was filed against `bin/fusion-prose-metric`'s counting. Recorded here because the Circle's later work depends on it and a reviewer's silence is not evidence.

**Every self-claim in the header reproduces.** Run over the six files `bin/fusion-rules coder` emits at `fac97f4`, the program returns 171 em-dashes over 13 018 prose words at 13.1 per 1000, which is what the header and the commit message state; `chat-voice-de.yaml` returns 617 prose words where the spec's table read 882, and `wc -w` on that file returns exactly 882, which confirms the correction's diagnosis rather than merely its number. The five frozen pre-repair window files re-measure to `54 / 5219 / 10.3` with the lowest per-file rate at 5.0, matching `260820-2354-prose-register-measurement-protocol.md` §8 cell for cell. The header's worked example table is arithmetically self-consistent (`15×1000/502 = 29.9`, `permit = int(2750/1000) = 2`).

**The claim made in the analysis and not in the header holds too.** `260820-2354…` §2 states "A standalone em-dash is itself counted as a word token". Measured: a file containing `a — b` reports 3 words.

**The four regions behave at their boundaries.** Constructed cases confirm each independently and in combination: a fence opened at 0 to 3 spaces of indent and closed by a same-character run of at least the same length; a four-space-indented block quote *not* excluded, which is the stated limit and not an accident; equal-length backtick-run matching left to right with an unpartnered run left literal; a YAML `examples:` subtree terminated by the first non-blank line at or below the key's indent, with the terminating line itself counted.

**One structural property is worth naming because it was not claimed and is load-bearing.** The fence region and the YAML subtree region can never both be active: setting `yaml_skip` requires passing `if (in_fence) next` at `bin/fusion-prose-metric:209`, and setting `in_fence` requires passing the `yaml_skip` continuation check at `:193-197`, which clears it. So the two exclusions cannot deadlock a file into permanent skipping. That is a real property of the branch order, and the header does not mention it.

**Degenerate inputs.** Empty file prints a `0 0` row and exits 0. No trailing newline counts the last line. CRLF is stripped at `:190`. All files unreadable prints `no file measured` and exits 2. `-h`/`--help` exits 1, which the header's exit table does not list.

**Three residuals, none filed.** An unterminated fence silently swallows the rest of the file, and the header's "Two limits, stated rather than discovered" paragraph at `:69-73` does not name it. A path containing runs of whitespace is normalised in the name column, because stage 2 rejoins `$3`-onward with single spaces (`:257-259`); a corpus produced by `fusion-rules` cannot contain one. And `permit = int(words/1000)` makes the verdict discontinuous against the `/1000` column beside it: 1 mark in 999 words is `over` at rate 1.0, 1 mark in 1000 words is `ok` at the same rate. All three are cosmetic against how the program is actually used.

### B. Setup Step 0e — the two defects

**`260821-0140_*_setup-step-0e-reads-fusion-src-which-does-not-survive-the-fresh-shell-every-bash-call-gets.md` (High) — the classification block reads `$FUSION_SRC`, which does not survive the fresh shell.** `skills/setup/SKILL.md:188` resolves `g="$FUSION_SRC/$rel"`. The variable is assigned once at `:14-23`, and `:26` states in this same file that each shell call gets a fresh shell and the value does not carry. The prose guard that exists (`:29`, `:181`) covers the case where the root printed `UNRESOLVED`; it does not reach the case where the root resolved fine and the variable is simply absent at execution time, which is the ordinary case. Step 0e is the only block in the file that dereferences a root without an inline test: `:124` opens with `[ -n "$FUSION_PLUGIN_ROOT" ]`, and `:161-169` uses the variable the SessionStart hook exports.

**`260821-0141_*_setup-step-0e-has-a-sixth-outcome-absent-that-none-of-its-five-documented-cases-covers.md` (High) — `absent` is a sixth outcome none of the five cases covers.** `:200` announces five cases and `:202-206` list them; `:189` emits a sixth token. The `if`/`elif` chain at `:191-196` is genuinely disjoint and the precedence claim about case 1 and case 4 is correct — that half of `rules/critical-stance.md` §4 was done carefully. Completeness fails one line earlier, at the guard the prose never reaches. Nothing downstream handles `absent`: not the offer at `:208`, not the stamp at `:222-230`, not the Done-report list at `:233`.

The two compound. The most likely trigger of `absent` is the first defect, so Step 0e's most likely failure mode is also its silent one, and the case it hides is the one a user would most want named: a workbench with no voice profile at all, which `bin/fusion-rules` then reports by emitting nothing.

**`260821-0148_*_step-0e-stamps-a-replace-that-may-have-failed-and-a-declined-offer-becomes-a-permanent-conflict.md` (Medium / Low-Medium) — the two end states.** A failed `cp` in the replace loop at `:217` is not guarded and the stamp block at `:222-230` hashes the *source*, so a replace that did not happen is recorded as one and reclassifies to `case3-adapted` — silent — forever. Step 0d's loop 50 lines above does both things correctly (`cp … || continue`, stamp the destination), so the pattern was available. Separately, the decline path at `:214` is correct as far as it claims: declining stamps `S`, the next run reads `case3-adapted`, the question does not repeat. Traced one step further, when the plugin next moves the file lands in `case4-conflict`, which `:206` says is "named again on every run until a human resolves it by hand" — and the only surface that could resolve it is `.asset-provenance`, whose sole reader and writer is Setup itself. A user who declines once gets a permanent per-run warning with no documented exit, on a step whose stated design is to ask at most once.

**What is right in the same step, and it is most of it.** The precedence argument is sound. The case-1 stamp is the correct move and the reason given for it — keeping a workbench that matches today out of case 0 on the day the profile improves — is exactly right. The decline-stamps-shipped end state does stop the question repeating. Case 3's "say nothing and do not touch it" is the correct default. And the work-tree exception for the comparison is argued from the right fact: the install copy is where a shipped file cannot have moved, because `install.sh` reads a tarball.

### C. Three claims stronger than their evidence

**`260821-0142_*_the-voice-profile-fallback-commit-cites-a-golden-that-cannot-observe-the-code-it-changed.md` (Medium) — the golden that cannot see the code.** Commit `1c1178d` and `bin/fusion-rules:327-329` both state that stdout byte-identity is established by `rules-emission.golden` staying untouched, and that a regenerated golden would have meant the change was wrong. Measured: that test runs the script in a fresh empty temp directory (`rules-emission-golden.test.ts:700`), by design and stated at `:39-47`; `emit_voice_profile` resolves `./fusion-workbench/stilwerk/…`, finds nothing, and emits nothing on either stream. Run from an empty cwd, `bin/fusion-rules orchestrator` produces zero `stilwerk` lines and empty stderr, and the fixture carries no profile row. The golden cannot move whatever that function does, so the falsifier offered is unreachable.

The change itself is right, and the evidence that actually establishes it was written in the same commit: `rules-voice-profile.test.ts:331-348` asserts stdout is exactly `[CHAT_EN, WRITE_DE]` and stderr is exactly the notice on the fallback path, and asserts stderr empty when `en` resolved directly. The defect is that the record names the wrong artefact, and it names it inside the source of the script every agent's Setup runs, where it will be read again.

**`260821-0143_*_the-provenance-record-is-verified-with-a-command-whose-answer-depends-on-the-cwd-nobody-states.md` (Medium) — the one-command re-check.** `skills/setup/SKILL.md:173` says `.asset-provenance` "reads and re-checks with one command", and `rules/fusion-workbench-conventions.md:84` and `rules/workbench-tracking.md:11` repeat the shape. The command is `shasum -c`, whose paths resolve against the caller's working directory. The record stores workbench-relative paths, so the sentence holds from `fusion-workbench/` and nowhere else, and no surface says so. In *this* repository the wrong directory gives a confident wrong answer rather than an error, because a `stilwerk/` also sits at the project root: run from there today it prints four `OK` lines about four files it never opened. Reproduced on a scratch tree with a deliberately stale workbench copy: `FAILED` from the project root, `OK` from inside the workbench, same file, same checksums. Step 0e's own code is unaffected — it uses explicit paths and never calls `shasum -c`.

**`260821-0149_*_the-repunctuation-records-evidence-paragraph-carries-a-count-that-does-not-reconcile-with-its-own-table.md` (Low) — the repunctuation's arithmetic.** The history record and commit `02ea2bd` both say "five of the six English replacements are the appositive case that record prescribes a colon for" and then "the three on line 86 are commas". The record's own table gives three colons and three commas. Five plus three is not six, and five cannot be the colon case when three are. The record also states "A pronoun opener can only be created by splitting a sentence", which is false as a universal — a colon creates no sentence and can be followed by a bare demonstrative — and the record's own next sentence gives the argument that does work. Same class as `260816-1330_*_the-repunctuations-evidence-paragraph-carries-a-token-count-nobody-can-reproduce…`, still open from the previous pass.

### D. The repunctuation, judged independently

Judged against the two open precedent records rather than against the executor's report.

**Criterion (a), vague pronoun openers: passes, and the argument offered for it does not.** Each of the eight replacement sites was checked for the word following the mark in both the before and the after text. Four of the eight are now followed by `that`, `they`, `dafür` and `sie`. All four were present before the change, none begins a sentence, and each has a concrete noun-phrase antecedent within the same sentence. No new opener was created. The reasoning in the record reaches the right verdict through a premise that does not hold; that is filed as `260821-0149_*_the-repunctuation-records-evidence-paragraph-carries-a-count-that-does-not-reconcile-with-its-own-table.md`.

**Criterion (b), mark strength: seven of eight pass, one costs.** `chat-voice-en.yaml:4`, `:11`, `:21` and `chat-voice-de.yaml:4`, `:11` are all explanatory or appositive breaks taking a colon, which is precisely what `260816-1330_*_two-of-the-twenty-nine-replacements…` prescribes at its `:112` finding, and none took the comma that record names as the defect.

**`260821-0147_*_the-english-em-dash-entry-lost-its-inline-demonstration-and-the-german-one-still-breaks-its-own-rule.md` (Low-Medium) — the eighth.** The three commas at `chat-voice-en.yaml:86` replaced marks that were not carrying subordination: they were the demonstrandum. `(clause, jargon aside, clause, compressed reason)` is a four-item list that demonstrates nothing about the pattern the entry names. The executor logged the cost honestly and justified it by citing `rules/user-facing-output.md:132`, which does read the same way — but that is the weaker of the two forms the same file carries. `:29` states the identical pattern with the schema intact by *naming* the mark: "a clause, an em-dash, a parenthetical jargon aside, another em-dash, a compressed reason crammed into one breath." Zero em-dashes, full demonstration, four lines below the blacklist entry the whole programme is anchored on. The profile was aligned with the degraded sibling; the intact one is cited nowhere in the step's record.

The same issue carries the German half: `chat-voice-de.yaml:85` forbids `–` U+2013 and `:87` then uses it three times in the same entry's prose. `bin/fusion-prose-metric` does not count `–` by design, so the file reports `0 … ok` while breaking its own rule. The executor found it and left it "reported to the user unfiled"; it is filed now.

### E. Coverage and budget

**`260821-0146_*_the-four-voice-profiles-are-shipped-text-every-agent-loads-and-no-lint-gate-reads-them.md` (Medium) — nothing lints the four voice profiles.** `reference-resolution-lint.test.ts:143-190` enumerates its own corpus and `stilwerk/*.yaml` is on none of the roots, while `:274` does list `stilwerk` as a legal citation *destination*, which is what makes the omission easy to miss. Step 5 made the gap live: commit `5ed284d` correctly replaced a duplicated line cap with a citation of `rules/user-facing-output.md` `## Length` in both chat profiles, moving those files out of a class of defect caught twice before and into a class nothing checks. The target exists at HEAD. If it is renamed, four files loaded by every agent on every dispatch in every consuming project point at nothing. The commit carries no count-pin re-approval, correctly: the count did not move because the gate never looked.

**`260821-0144_*_the-authoritative-prose-metric-has-no-test-and-the-hook-test-surface-has-43-of-2500-lines-left.md` (Medium, sequencing) — the metric has no test and the surface has 43 lines left.** `bin/fusion-prose-metric` is authoritative for a comparison a later Circle will run (`260820-2354…` §2, §7) and nothing in `hooks/` executes it. Commit `fac97f4` records why: "No hook test file was added; the surface has 108 lines left." Measured at HEAD against `TEST_LINE_BASELINE`, the hook-test surface stands at 2457 of 2500, leaving 43. Of the 73 lines this Turn added to it, 40 are the three count-pin re-approval comments above `const BASELINE` and 33 are the two real test cases. So the tightest bounded surface spent 55 per cent of this Turn's allocation on prose about a constant, on a budget derived from what test code costs to maintain and to run.

Two other surfaces for context, both measured: `skills/` stands at 18 405 of 20 000, leaving 1595 — Step 0e alone spent 6952 of it. `agents/` stands at 15 741 of 18 000. `npm test` is green at HEAD: 40 files, 718 tests.

## Cross-cutting observations

**1. A gate cited is not a gate that ran.** Two findings share one shape. `1c1178d` names a golden that structurally cannot observe the code it changed, and `5ed284d` adds a citation to a file no gate reads. In both cases the text reads as though something checked, and nothing did. The project already has the instrument for the second half of this — `reference-resolution-lint`'s corpus is enumerated in one function — and `stilwerk/` is simply not in it.

**2. The exhaustiveness half of `critical-stance.md` §4 is the one that slips.** Step 0e reasoned explicitly and correctly about disjointness, wrote the precedence down, and named the pair that would otherwise overlap. The gap sits one line above the branch chain, in a guard that was written as an error path and never joined the classification it feeds. Same shape as the shell classifier §4 was written from: the careful part was careful, and the case that fell through fell through somewhere nobody was looking.

**3. Both of the Turn's silent failures are silent in the same direction.** A missing `$FUSION_SRC` produces `absent`, which nothing reports. A failed `cp` produces a stamp, which converts to `case3-adapted`, which `:205` says to say nothing about. Every unhandled path in Step 0e resolves to silence, and the step's Done-report contract at `:233` lists only the three outcomes that went right.

**4. Evidence discipline is high and the failures are all in the same layer.** Every number this Turn produced that could be re-measured, re-measured: the corpus, the frozen window, the token streams, the budget arithmetic, the suite. The three claim defects are all one level up — about *which artefact* establishes a fact, not about the fact.

## Recommended sequencing

**Before this Circle closes.** `260821-0140_*_setup-step-0e-reads-fusion-src-which-does-not-survive-the-fresh-shell-every-bash-call-gets.md` and `260821-0141_*_setup-step-0e-has-a-sixth-outcome-absent-that-none-of-its-five-documented-cases-covers.md`, together. Step 0e is one of the Circle's four Directive outcomes and it does not work in an ordinary session; the two fixes are small and touch one file.

**Before the next release.** `260821-0148_*_step-0e-stamps-a-replace-that-may-have-failed-and-a-declined-offer-becomes-a-permanent-conflict.md` part 1 (the unguarded `cp`), because it silently records a user-requested change as done. `260821-0142_*_the-voice-profile-fallback-commit-cites-a-golden-that-cannot-observe-the-code-it-changed.md`, because the false falsifier sits in `bin/fusion-rules`'s own source where the next author will read it.

**Before the post-repair window is measured.** `260821-0144_*_the-authoritative-prose-metric-has-no-test-and-the-hook-test-surface-has-43-of-2500-lines-left.md`. The window will be compared against 5.0 with a program no gate protects, and the surface that would hold that gate cannot currently accept one. The budget question and the test question are separable and only the second blocks the measurement.

**Cleanup, unsequenced.** `260821-0143_*_the-provenance-record-is-verified-with-a-command-whose-answer-depends-on-the-cwd-nobody-states.md`, `260821-0146_*_the-four-voice-profiles-are-shipped-text-every-agent-loads-and-no-lint-gate-reads-them.md`, `260821-0147_*_the-english-em-dash-entry-lost-its-inline-demonstration-and-the-german-one-still-breaks-its-own-rule.md`, `260821-0148_*_step-0e-stamps-a-replace-that-may-have-failed-and-a-declined-offer-becomes-a-permanent-conflict.md` part 2, `260821-0149_*_the-repunctuation-records-evidence-paragraph-carries-a-count-that-does-not-reconcile-with-its-own-table.md`.

## References

- Range reviewed: `7135a19..7832553`, 13 commits, `bin/fusion-review-coverage --since 7135a19` verdict `uncovered` before this pass.
- Issues filed: `260821-0140_*_setup-step-0e-reads-fusion-src-which-does-not-survive-the-fresh-shell-every-bash-call-gets.md`, `0141`, `0142`, `0143`, `0144`, `0146`, `0147`, `0148`, `0149`, all under this Circle's issue store.
- Pre-existing open records this pass judged against: `260816-1330_*_the-repunctuation-replaced-three-em-dashes-with-three-vague-pronoun-openers-the-same-blacklist-bans.md`, `260816-1330_*_two-of-the-twenty-nine-replacements-chose-a-mark-weaker-than-the-clause-it-replaced.md`, `260816-1330_*_the-repunctuations-evidence-paragraph-carries-a-token-count-nobody-can-reproduce-and-an-inverted-capitalisation-claim.md`.
- Workbench records read as context and not reviewed: the Circle record, the spec, the plan, the eight decisions, the assessment, the measurement protocol, and the eight history files of this Turn.

---
**Reconciliation annotation 260821-0414_*_does-a-corpus-repair-circle-carry-a-budget-for-what-its-own-new-clauses-may-spend.md** (reconciler, domain `code`, HEAD `247abfe`). Findings are not
rewritten; only their disposition is recorded. Log: `260821-0416-reconciliation.md`.

**Both High findings are closed and the fixes were read rather than taken on report.** Commit
`3464575`. `$FUSION_SRC` appears nowhere in Step 0e's shell blocks: each of the three now carries
its own `SRC="${FUSION_PLUGIN_ROOT:-}"; [ -x … ] && SRC="$(…)"`, and the step's prose at
`skills/setup/SKILL.md:181` states the rule. The sixth outcome became two named ones,
`case5-missing-local` and `case6-missing-shipped`, emitted at `:191-192`, enumerated at
`:210-211` and named in the Done report at `:240`. The two records are
`260821-0140_*_…` and `260821-0141_*_…`.

**Seven of the nine findings are still reproducible at HEAD** and remain `_o_` in this Circle's
issue store, each re-checked by running the command it cites rather than by reading it: `260821-0142_*_the-voice-profile-fallback-commit-cites-a-golden-that-cannot-observe-the-code-it-changed.md`,
`260821-0143_*_the-provenance-record-is-verified-with-a-command-whose-answer-depends-on-the-cwd-nobody-states.md`, `260821-0144_*_the-authoritative-prose-metric-has-no-test-and-the-hook-test-surface-has-43-of-2500-lines-left.md`, `260821-0146_*_the-four-voice-profiles-are-shipped-text-every-agent-loads-and-no-lint-gate-reads-them.md`, `260821-0147_*_the-english-em-dash-entry-lost-its-inline-demonstration-and-the-german-one-still-breaks-its-own-rule.md`, `260821-0148_*_step-0e-stamps-a-replace-that-may-have-failed-and-a-declined-offer-becomes-a-permanent-conflict.md`, `260821-0149_*_the-repunctuation-records-evidence-paragraph-carries-a-count-that-does-not-reconcile-with-its-own-table.md`.

**One correction to a number this review supplied.** `260821-0144_*_the-authoritative-prose-metric-has-no-test-and-the-hook-test-surface-has-43-of-2500-lines-left.md` recorded 43 lines of hook-test
head-room. It is **32** at HEAD: `acef2ad` spent seven more on a second baseline re-approval
comment. The finding is unaffected and its sequencing argument is stronger, not weaker.

**The declared range is honoured and does not reach the Circle's end.**
`**Reviewed-range:** 7135a19..7832553` is accurate and `**Not-opened:** none` holds.
`bin/fusion-review-coverage --since 7135a19` reports `commits=24 reviews=2 uncovered=7`; the seven
are everything after `c226949`, which is outside both reviews' declared ranges and not this file's
omission.
