# Analysis: the style-rules spec measured against the tree

**Date:** 2026-08-27 18:07
**Type:** Gap
**Status:** Complete
**Requested by:** orchestrator, plan step 6 of `circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/planning/260827-1756_p_repair-the-twenty-open-defect-records.md` (record `shared/issues/260825-1250_p_a-bounded-circle-holds-a-draft-spec-with-49-unreconciled-criteria-that-no-scan-reaches.md`)

## Question

Which of the 49 acceptance criteria in `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2249_o_spec-style-rules-arrive-and-get-measured.md` hold at HEAD, which do not, and which no longer apply. Each row carries a `path:line` or a command with its output. The spec and the issue record are not edited.

## Scope

- Tree: `/Users/k1/Projects/productive/fusion`, HEAD `0fb5085` (2026-08-27 17:31 +0200), branch `main`, `git status -sb` reports `## main...origin/main` with two modified workbench files and nothing staged. Every present-tense claim below is dated by that commit.
- The spec's 49 boxes: `grep -c '^- \[ \]'` over the spec prints `49`; `grep -c '^- \[x\]'` prints `0`. The rows below are numbered `C<capability>.<box>` in file order, C1 lines 128-143 through C10 lines 384-398.
- Two reference points are used, because several criteria were true when the Circle closed and are false now. **Close** is `ff8d15e` (2026-08-21 04:21, the commit that renamed the record to `_b_`). **HEAD** is `0fb5085`. The verdict column is the HEAD verdict; the note says where it differs from close.
- The spec's `## Orchestrator corrections and decisions` (spec:593-650) governs where it disagrees with the body. Correction 5 (spec:633) drops C1's seventh criterion; that row is the one `n/a`.
- Evidence classes: a criterion phrased as a run ("Running Setup on a project … produces") is marked `text` when the only evidence is the skill body and `run` when a recorded run exercised it. The distinction is stated per row rather than hidden in the verdict.

## Findings

### Totals

| Verdict | Count | Rows |
|---|---|---|
| met | 36 | C1.1-C1.6, C2.3, C2.4, C3.2-C3.5, C3.7, C4.1, C4.4, C4.5, C5.1-C5.4, C6.1-C6.4, C6.6, C7.1-C7.4, C8.1-C8.3, C9.1, C9.3, C10.1, C10.6 |
| not met | 12 | C2.1, C2.2, C3.1, C3.6, C4.2, C4.3, C6.5, C9.2, C10.2, C10.3, C10.4, C10.5 |
| not applicable | 1 | C1.7 |

Of the twelve `not met`, seven were met at close and regressed afterwards (C2.1, C2.2, C3.1, C3.6, C4.3, C6.5, and C2.2's named clauses); four are the measurement half of C10 that Bounded Closure deferred by design (C10.2-C10.5); one was never met (C4.2, one sample where two were asked for), and one is a design gap the Circle's own run file reported (C9.2).

### The corpus, at close and at HEAD

The measurement that carries C3.1 and C3.6, so it is shown once here and cited from the rows.

```
bin/fusion-prose-metric rules/agent-setup.md rules/fusion-workbench-conventions.md \
  rules/decision-record-examples.md rules/user-facing-output.md rules/critical-stance.md \
  fusion-workbench/stilwerk/chat-voice-de.yaml
```

| File | Close `ff8d15e` | HEAD `0fb5085` | Permitted at HEAD | HEAD verdict |
|---|---|---|---|---|
| `rules/agent-setup.md` | 0 / 488 | 2 / 560 | 0 | over |
| `rules/fusion-workbench-conventions.md` | 6 / 7738 | 15 / 6776 | 6 | over |
| `rules/decision-record-examples.md` | 0 / 332 | 0 / 332 | 0 | ok |
| `rules/user-facing-output.md` | 1 / 2577 | 15 / 1264 | 1 | over |
| `rules/critical-stance.md` | 1 / 1529 | 1 / 1568 | 1 | ok |
| `fusion-workbench/stilwerk/chat-voice-de.yaml` | 0 / 628 | 5 / 222 | 0 | over |
| total, six files | 8 / 13 292 (0.6) | 38 / 10 722 (3.5) | 10 | over |

The four shipped profiles at HEAD: `bin/fusion-prose-metric stilwerk/*.yaml` prints 5, 5, 2, 2 prose em-dashes over 222, 238, 392, 404 words, total 14 over 1 256 at 11.1 per 1000, every file `over`. At close all four were `ok` (history `260821-0350`, section 1).

Two things changed the set itself since close. `bin/fusion-rules coder` at HEAD emits **four** files, not six: `rules/user-facing-output.md` left the always-on floor for the user-facing agents (gate `260827-0910`, commit `9c056b6`) and `rules/decision-record-examples.md` for the transition agents (gate `260827-0830`, `bin/fusion-rules:476,490` are indented). Over those four the corpus reads 23 over 9 126, permitted 9, `over`.

Where the marks came back, per commit over the six files, counted as `git show <c> -- <six files> | grep '^+' | grep -o '—' | wc -l` against the same over `^-`:

| Commit | Added | Removed | Subject |
|---|---|---|---|
| `6d72981` (2026-08-27 09:36) | 21 | 11 | every style surface goes on a diet |
| `265a86f` | 7 | 0 | the language cascade and the backlog mandate leave the floor |
| `01964e4` | 5 | 3 | twenty-four defects across nine rule files close |
| `9c056b6` | 3 | 0 | the user-facing style contract goes to the agents the user reads |
| `ae00e84` | 3 | 4 | a cardinality is enumerated or derived |
| `43cdde6` | 2 | 0 | the German profiles name the em-dash they count |
| `9aa8ecf` | 2 | 3 | a reply is bounded whole |

Prose sites at HEAD outside fences and code spans, for the two files still on the floor: `rules/fusion-workbench-conventions.md:176,197,199,207,210,211,212,238,246,266,273,274,276,278,400,417,421` and `rules/agent-setup.md:48,56` (the awk in `## Sources`; the metric's own exclusion is finer than that awk, hence 15 rather than 17 for the conventions file).

### C1: Setup notices a copied asset that has gone stale (7 rows)

| Row | Criterion (short) | Verdict | Evidence |
|---|---|---|---|
| C1.1 | stale-and-unedited copy: message names the file, offers replace, replaces only on yes | met (text) | `skills/setup/SKILL.md:193-207` classifies; `:222` case2 "Offer the replace"; `:229-231` one `AskUserQuestion`, options "Replace them" / "Keep mine"; `:237-243` the replace block runs only over `<the files to replace>`. No recorded run reached case 2: `grep -c 'case2' circles/260820-2051-*/history/260821-0120-*.md` prints 0; the only runs on record classified case 0 then case 1. |
| C1.2 | edited copy, plugin unchanged: no message, untouched | met (text) | `skills/setup/SKILL.md:223` case3 "Say nothing about it and do not touch it." Not exercised by a run. |
| C1.3 | both moved: names the conflict, no one-click replace | met (text) | `skills/setup/SKILL.md:224` case4 "offer no one-click replace … neither changed nor stamped". Not exercised by a run. |
| C1.4 | second run, no change: same output, no file changed | met (run) | history `circles/260820-2051-*/history/260821-0120-coder-workbench-copies-refreshed-by-the-mechanism.md:66-68` "Re-running the classification block printed `case1-equal` four times, and the stamp loop …"; the stamp loop skips an equal line, `skills/setup/SKILL.md:251` `grep -q "^$h  $rel$" "$PROV" && continue`. |
| C1.5 | covers every copied asset; `monitor` stays unconditionally re-copied | met | `skills/setup/SKILL.md:121` Step 0b copies `monitor` every run and stamps it in `.asset-provenance`; `fusion-workbench/.asset-provenance` carries five lines, four profiles plus `monitor` (`cat` output in `## Sources`). Step 0e compares the four profiles (`:196`); `monitor` needs no offer because 0b overwrites it. |
| C1.6 | no provenance record: Setup completes, differences named, unclassifiable said plainly | met (run) | `skills/setup/SKILL.md:221` case0 "cannot tell an adaptation from a stale copy"; history `260821-0120…:43-49` four `case0-unclassifiable` on the first run of this repository's own workbench. |
| C1.7 | after the profile revisions, workbench copies match the work tree, produced by the mechanism | n/a | Dropped by orchestrator correction 5, spec:633-636. Measured anyway: `cmp stilwerk/<f>.yaml fusion-workbench/stilwerk/<f>.yaml` silent for all four at HEAD; the match at close was produced by running Step 0e (history `260821-0120…:11-12`). At HEAD the match was re-made by hand in `6d72981` ("Workbench copies and .asset-provenance checksums updated in step"), which is exactly what the dropped criterion forbade. |

### C2: the profiles stop restating what the rule owns (4 rows)

| Row | Criterion | Verdict | Evidence |
|---|---|---|---|
| C2.1 | neither chat profile carries a gate/reply line count; each cites the rule section that owns them | not met | First half holds: `grep -n -i 'line\|Zeile' stilwerk/chat-voice-*.yaml` hits only the header comment and C04, no number. Second half does not: neither file cites `## Length` or `rules/user-facing-output.md` at HEAD (`grep -n Length stilwerk/chat-voice-*.yaml` empty). At close both did: `git show ff8d15e:stilwerk/chat-voice-en.yaml` lines 41-42, `…de.yaml` lines 42-43. The citation left in `6d72981` and `6b26e2c` ("the chat profiles stop naming a rule file by its bare filename"). |
| C2.2 | de and en say the same thing; de regains "or to a file" and "not the opening lines", loses "Klare Formulierungen, kein Jargon" | not met | The two clauses to regain were present at close (`ff8d15e:stilwerk/chat-voice-de.yaml:44-46` "Details ans Ende oder in eine Datei, nicht in die ersten Zeilen") and are absent from both files at HEAD (`grep -n -i 'Datei\|to a file' stilwerk/chat-voice-*.yaml` empty). The dropped clause is gone (`grep Jargon` hits only AI02's example). The two files are parallel at HEAD, 24 lines each with the same ids C01-C06, AI01-AI11, L04; the criterion's purpose holds, its named clauses do not. |
| C2.3 | no line in any of the four profiles ends with whitespace | met | `grep -n ' $' stilwerk/*.yaml \| wc -l` prints `0`. |
| C2.4 | four profiles identical across source, installed copy and workbench; workbench brought into line by C1 | met | `cmp` silent for all four against `fusion-workbench/stilwerk/` and against `$FUSION_PLUGIN_ROOT/stilwerk/` (`/Users/k1/.fusion`); at close the workbench copy was made by Step 0e (history `260821-0120…`), at HEAD by hand in `6d72981` (see C1.7). |

### C3: the always-on corpus meets its own ceiling (7 rows)

| Row | Criterion | Verdict | Evidence |
|---|---|---|---|
| C3.1 | the six emitted files carry at most 13 prose em-dashes, per-file counts reported | not met | Table above: 38 over 10 722 at HEAD, permitted 10, four of six files `over`. At close 8 over 13 292, all `ok` (history `260821-0350`, section 1, reproduced here from `ff8d15e`). |
| C3.2 | no em-dash inside an anti-example, code span, fence or sketch was touched | met | history `260821-0242…:11` six kept marks named; the exhibits still stand at HEAD: `rules/user-facing-output.md:13` (the blacklist listing) and `:84` (the quoted failure), both counted as exhibits by the metric. |
| C3.3 | no word changed; token-stream comparison reported with its tokenisation | met | history `260821-0217…:57-61` (three files, tokenisation stated, 562 / 670 / 1 619 tokens, four case-only positions); `260821-0242…:72` (9 047 tokens before and after, eleven case-only positions). |
| C3.4 | no bare demonstrative/pronoun opener; the three first-pass sites re-marked | met | `shared/issues/260816-1330_c_the-repunctuation-replaced-three-em-dashes-with-three-vague-pronoun-openers-the-same-blacklist-bans.md:68` `Resolved: fixed`. |
| C3.5 | no replacement weakens force; the two sites re-marked as proposed | met | `shared/issues/260816-1330_c_two-of-the-twenty-nine-replacements-chose-a-mark-weaker-than-the-clause-it-replaced.md:43` `Resolved: fixed — a colon … and parentheses …`. |
| C3.6 | no em-dash is restored anywhere | not met | Seven commits after close added 43 em-dashes to the six files against 21 removed (table above); the largest is `6d72981`, 21 added. |
| C3.7 | always-on growth bound green, byte effect reported | met | history `260821-0350…` section 4: repunctuation returned 470 bytes, net Circle +2 138; `npx vitest run surface-growth-bound rules-emission-golden` at HEAD: 2 files, 27 tests passed. |

### C4: the rule states when an opening sentence fails (5 rows)

| Row | Criterion | Verdict | Evidence |
|---|---|---|---|
| C4.1 | one sentence stating the condition: fact available, sentence names significance instead | met | `rules/user-facing-output.md:76` "it states the *fact*, not the significance of a fact you withheld". At close the fuller form stood at `ff8d15e:rules/user-facing-output.md:139` ("An opening sentence fails when the fact it stands in for was available to you and …"); `6d72981` compressed it to one clause carrying both halves. |
| C4.2 | demonstrated with a before and after drawn from the two reported samples, in `Not X, Y` form | not met | One pair at HEAD, `:76` ("Schritt 8 fand neun Prosastellen …", not "Schritt 8 hat etwas gefunden …"); one pair at close, `ff8d15e:…:140`. The second reported sample was never added. |
| C4.3 | states the factual form is usually no longer, so no licence against `## Length` | not met | `grep -n 'no longer than' rules/user-facing-output.md` empty at HEAD; present at close, `ff8d15e:…:139` "The factual form is usually no longer than the form it replaces, so this costs nothing against `## Length`". Removed by `6d72981`. |
| C4.4 | correctio test in one sentence | met | `rules/user-facing-output.md:16` "Correctio earns its place only where the reader would have assumed the rejected term". |
| C4.5 | growth bound green, byte cost reported against head-room | met | history `260821-0350…` section 4, step 13 +1 091 bytes; bound green at HEAD (C3.7 run). |

### C5: the gate clauses state their cost (4 rows)

| Row | Criterion | Verdict | Evidence |
|---|---|---|---|
| C5.1 | whether a foreclosure occupies its own line, one reading | met | `rules/user-facing-output.md:55` "A foreclosure takes its own line, never folded onto the option's line". |
| C5.2 | worst-case arithmetic stated, consistent with `## Length`, no cap relaxed | met | `:56` "stem + three labels + three foreclosures is seven lines against the cap of eight"; `:61` gate cap still 8. |
| C5.3 | `## Length` caps the `description` field | met | `:61` "≤ 2-line description". |
| C5.4 | growth bound green | met | C3.7 run. |

### C6: a live record states the corpus as its derivation (6 rows)

| Row | Criterion | Verdict | Evidence |
|---|---|---|---|
| C6.1 | each live record naming the always-on set states it as the `emit_if_exists` derivation | met | `grep -rl emit_if_exists shared/issues shared/decisions` hits `260816-1345_c_…`, `260816-0740_c_…`, `260816-0740_a_…:140` "The always-on set is a derivation, not a list. It is the unindented `emit_if_exists` calls". |
| C6.2 | the `workbench-tracking` claim corrected where it stands live | met | `shared/decisions/260816-0740_a_…:148-152` correction; `circles/260820-2051-*/_b_circle.md:151-157` "Correction appended 260821-0322". |
| C6.3 | the unreproducible token count corrected; capitalisation stated in the evidenced direction | met | `shared/issues/260816-0740_c_the-always-on-rule-corpus…:232-238` "seven totals … `2733` belongs to none of them … ten tokens gained a capital and none lost one". |
| C6.4 | the 260814 forced-copy claim annotated as expired | met | `shared/issues/260814-1419_c_the-shipped-chat-voice-profiles…:60-63` "One claim … has **expired**. Appended rather than edited". |
| C6.5 | `shared/analyses/260816-0740-rhetorical-register-of-agent-output.md` is not edited | not met | `git log --since=2026-08-20 -- <file>` prints `655d976` (2026-08-22 03:18): 3 lines changed, two `chat-voice-de.yaml:NN` citations repointed (`:31`→`:32`, `:23`→`:24`). No sentence changed; the file was edited. |
| C6.6 | the curator run file not rewritten; the cap correction is an appended note | met | `git show a760849 --stat -- shared/history/260816-1251-curator-run.md`: 26 insertions, 0 deletions; the note at `:441`. |

### C7: the voice-profile fallback becomes visible (4 rows)

| Row | Criterion | Verdict | Evidence |
|---|---|---|---|
| C7.1 | fallback says so on a channel the agent reads, naming both variants | met | `bin/fusion-rules:391-393` `printf 'fusion-rules: voice profile %s: requested variant %s is absent, resolved to en\n' … >&2`. |
| C7.2 | stdout byte-identical in every case | met | same function: stdout carries only the path in both branches (`:384-390`); `hooks/lib/__tests__/rules-voice-profile.test.ts:331-332` asserts stdout is exactly the fallback path plus the writing profile. |
| C7.3 | a project that declared `en` sees no message | met | `bin/fusion-rules:388` the fallback branch runs only when `lang_code != en`; test file `:328-332` and the header at `bin/fusion-rules:369-372` name the `en`-direct case asserting empty stderr. |
| C7.4 | hook-test surface grows by fewer than 40 lines | met | `git show --stat 1c1178d`: `rules-voice-profile.test.ts` 45 changed (+39/−6); history `260821-0350…` section 6 "+39 added, or 33 net". |

### C8: the curator prompt enumerates its long-form outputs (3 rows)

| Row | Criterion | Verdict | Evidence |
|---|---|---|---|
| C8.1 | `agents/curator.md` `## Output Style` carries the enumeration in the shared shape | met | `agents/curator.md:355` "Long-form prose outputs … the run file's prose sections and the decision records you file. Short-form outputs … ". |
| C8.2 | `rules/user-facing-output.md` not weakened to "most" | met | `grep -n most rules/user-facing-output.md` has no such clause. Note: the sentence "Each long-form-prose agent's prompt enumerates …" that stood at close (`ff8d15e:…:11`) is gone entirely at HEAD (`6d72981`); not weakened, removed. |
| C8.3 | `agents/` growth bound green, cost reported | met | history `260821-0350…` section 3, +621 bytes; `surface-growth-bound.test.ts` green at HEAD. |

### C9: the writing profiles carry the handle (3 rows)

| Row | Criterion | Verdict | Evidence |
|---|---|---|---|
| C9.1 | each writing profile names its role so the chat profile's phrase finds it | met | `stilwerk/default-voice-en.yaml:1` "Long-form writing profile"; `stilwerk/chat-voice-en.yaml:2` "the writing profile". `stilwerk/default-voice-de.yaml:1` "Langform-Schreibprofil"; `stilwerk/chat-voice-de.yaml:2` "(Schreibprofil)". |
| C9.2 | what is added is language-neutral | not met | The handle is per language, English in the English file and German in the German one. The step's own run file reports the consequence: `circles/260820-2051-*/history/260821-0100…:64-71` "the German pointer still finds no German handle in the English file … Reported to the user rather than decided here." This repository runs chat `de` with artifacts `en`, the exact pairing left open. |
| C9.3 | the change reaches earlier projects through C1 | met | `skills/setup/SKILL.md:196` Step 0e iterates all four profiles, the two writing profiles included. |

### C10: the measurement runs under a registered protocol (6 rows)

| Row | Criterion | Verdict | Evidence |
|---|---|---|---|
| C10.1 | protocol exists, committed before the C3 repair, naming file set, command, exclusions, both windows, minimum files, threshold | met | `circles/260820-2051-*/analyses/260820-2354-prose-register-measurement-protocol.md`, sections 1, 2, 3, 4, 6, 7; committed `b22525d` 2026-08-20 23:59 +0200, before the first repair commit `b393a45` 2026-08-21 02:24 +0200 (`git log --format='%h %ad'`). |
| C10.2 | measurement runs against both windows, per-file rates | not met | Post-repair window never opened with members: `_b_circle.md:273-279` closure note; the decision's 260824 note, `shared/decisions/260816-0740_a_…:183-184` "fewer than five leaves this marker at `_a_`. The marker stays `_a_`". Deferred by Bounded Closure (spec:617, 621-624). |
| C10.3 | the decision record carries the number and the protocol's path | not met | Path present, `shared/decisions/260816-0740_a_…:175`; number absent, the note carries the pre-repair window only (`:176-178`). |
| C10.4 | the record states the number is an observation, not a controlled test, and names the confounds | not met | `grep -n -i 'confound\|observation' shared/decisions/260816-0740_a_…` returns nothing of that kind; the statement lives in the protocol, section 11 (`…protocol.md:256-271`), not in the record. |
| C10.5 | the marker moves per a scheme fixed in advance covering three outcomes | not met | The scheme is fixed (`…protocol.md:273-290` section 12; `circles/260820-2051-*/decisions/260820-2314_o_what-threshold-does-the-registered-measurement-use-and-which-marker-does-each-outcome-earn.md`); no outcome exists, so no move has happened. Blocked on C10.2. |
| C10.6 | no gate is built | met | `bin/fusion-prose-metric:33-42` "It reports and it never gates"; `hooks/lib/__tests__/fusion-prose-metric.test.ts` drives fixtures only (`grep -n 'rules/\|stilwerk' <test>` empty); no test under `hooks/lib/__tests__/` reads corpus prose for a verdict. |

## Implications

1. **The Circle's second Directive outcome no longer holds at HEAD.** The always-on corpus is back over its ceiling: 38 prose em-dashes in the six files (permit 10), 23 in the four `coder` now loads (permit 9), and all four shipped profiles are `over`. The marks returned mostly in `6d72981`, the style diet of this morning, and in six later rule commits. The metric that would have shown this, `bin/fusion-prose-metric`, reports and never gates, by design (C10.6), so nothing red appeared.
2. **The same diet removed three clauses the spec's C2 and C4 asked for** (the `## Length` citation in both chat profiles, the "no longer than" sentence, the two German clauses). Whether the compression was meant to drop them is not decidable from the tree; the commit message says "same substance at a fraction of the bytes".
3. **C10's four open rows are structural, not omissions.** Bounded Closure deferred the measurement; the protocol, threshold and marker scheme are registered and the post-repair window has still not been measured at HEAD.
4. **The C1 mechanism has been exercised in two of its five cases** (0 and 1). Cases 2, 3 and 4 are met by the skill text only.

## Recommendations

- The spec's disposition (tick in place, or declare a terminal Circle's spec history in `rules/circle-records.md`) is the user's direction under `circles/260824-1853-close-every-open-defect/decisions/260824-2013_*_do-archive-and-terminal-circles-stores-enter-any-scan-set-or-is-the-exclusion-written-down.md`, per plan step 6. This report is the measurement that direction needs; it takes no side.
- The corpus regression is filed below as its own defect; repair is a `coder` repunctuation pass under the same evidence discipline (token stream, per-file report), scoped by whoever decides whether the diet's clauses return.
- The C10 measurement is now runnable in principle: Circles have closed since `ff8d15e` and written history under the repaired corpus, but the corpus was repaired for six days and is unrepaired again since `6d72981`. Which window the protocol's section 4 selects under that history is a question for the analyst who runs it, and it should be asked before any repair of the regression moves the boundary again.

## Filed Issues

- `circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/issues/260827-1807_o_the-always-on-corpus-and-the-four-profiles-are-over-the-em-dash-ceiling-again-six-days-after-they-reached-it.md` — 38 prose em-dashes in the six files at HEAD against 8 at close; 43 added since `ff8d15e`, 21 of them in `6d72981`.

## Sources

- Spec: `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2249_o_spec-style-rules-arrive-and-get-measured.md:128-398` (the 49 boxes), `:593-650` (corrections), `:652-686` (reconciliation log).
- `bin/fusion-prose-metric` over the six files at HEAD and, via `git show ff8d15e:<path>` into the scratchpad, at close; `bin/fusion-prose-metric stilwerk/*.yaml`; `bin/fusion-rules coder`.
- `awk '/^```/{f=!f; next} !f && /—/ && !/^>/' rules/fusion-workbench-conventions.md rules/agent-setup.md` filtered for code spans, for the site list.
- Per-commit em-dash table: `git log --format=%h c226949..HEAD -- <six files>` and `git show <c> -- <six files>` piped through `grep '^+' | grep -o '—' | wc -l` and the `^-` twin.
- `skills/setup/SKILL.md:116-260`; `fusion-workbench/.asset-provenance` (five lines); `cmp` over `stilwerk/`, `fusion-workbench/stilwerk/`, `/Users/k1/.fusion/stilwerk/`.
- `rules/user-facing-output.md:10-20,50-62,76-85` at HEAD and `ff8d15e:rules/user-facing-output.md:11,139-141`.
- `stilwerk/chat-voice-{en,de}.yaml` whole at HEAD; `ff8d15e:stilwerk/chat-voice-{en,de}.yaml:38-46`.
- `bin/fusion-rules:342-396`; `hooks/lib/__tests__/rules-voice-profile.test.ts:120-135,328-332`; `hooks/lib/__tests__/fusion-prose-metric.test.ts`; `npx vitest run surface-growth-bound rules-emission-golden` (27 passed).
- Circle histories `260821-0020`, `260821-0100`, `260821-0120`, `260821-0217`, `260821-0242`, `260821-0350`, `260821-0416`; `_b_circle.md:259-290`; the protocol analysis `260820-2354`.
- Records: `shared/issues/260816-1330_c_*` (three), `260816-0740_c_*`, `260816-1345_c_*`, `260814-1419_c_*` (two), `260807-2154_c_*` (two); `shared/decisions/260816-0740_a_*`; `shared/history/260816-1251-curator-run.md:431-446`; `shared/analyses/260816-0740-*` via `git show 655d976`.
- `agents/curator.md:353-362`.

## Open Questions

- [ ] Did `6d72981` mean to drop the `## Length` citation, the "no longer than" sentence and the two German clauses (C2.1, C2.2, C4.3), or were they lost in compression? Only the author can say.
- [ ] Under the protocol's section 4, which five history files form the post-repair window now that the corpus was at the ceiling from `ff8d15e` to `6d72981` and is over it again?
