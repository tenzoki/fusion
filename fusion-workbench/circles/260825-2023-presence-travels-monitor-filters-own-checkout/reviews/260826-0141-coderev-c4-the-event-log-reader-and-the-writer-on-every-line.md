# Code review — C4 Turn 1: the event-log reader, and the writer named on every line

**Reviewed-range:** `8119fc2..8655ec2`
**Not-opened:** `hooks/dist/events-query.d.ts`, `hooks/dist/events-query.js`, `hooks/dist/lib/events-query.d.ts`, `hooks/dist/lib/events-query.js`, `260825-2023-presence-travels-monitor-filters-own-checkout`, `260825-2214-can-a-hook-obtain-the-session-identifier.md`, `260825-2140_*_where-do-c4s-hook-test-lines-come-from-when-the-cut-only-circles-room-is-spent.md`, `260825-2023-shaper-presence-travels-monitor-filters-own-checkout.md`, `260825-2123-orchestrator-session.md`, `260825-2140-planner-c4-presence.md`, `260825-2214-coder-every-emitted-event-line-names-its-writer.md`, `260825-2231-coder-bin-fusion-events.md`, `260825-2237-coder-reference-baseline-and-entry-point-row.md`, `260825-2140_*_the-turn-count-defect-names-three-sites-and-a-fourth-carries-the-identical-whole-file-count.md`, `260825-2140_*_the-two-session-start-emit-sites-disagree-on-the-detail-field-and-the-vocabulary-names-one.md`, `260825-1820-orchestrator-session.md`, `260825-1844-playmaker-user-fusion-next.md`, `260825-2051-playmaker-direct-dispatch.md`

The four compiled artifacts were executed and verified through committed-dist.test.ts
rather than read as text. The fourteen workbench records are the record-layer pass, which
the dispatch declared out of scope for this one; the plan and the event log itself were
opened in full.

**Reviewer:** coderev, Kai Stalmann <ks@qantr.com>
**Reviewed:** 2026-08-26
**Plan:** `260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`, steps 2 and 3

## Summary

Steps 2 and 3 landed as the plan specifies them, and the central design property holds under
measurement: `hooks/lib/events-query.ts` is a pure function of the log text, the reading identity
and the current time, with no import of any kind, and both subcommands parse `ts` through the one
helper that appends the missing `Z` designator. The case split is reachable, disjoint and complete
in every clause the plan enumerates, and `countTurns` is order-independent under every permutation
tested, which is the property the union merge driver makes load-bearing.

Ten findings, one of them High. The High one is a single case that escapes the program's own
governing principle: when the checkout does not resolve, `turns` widens its scope to the whole
file, prints a count and exits 0, and stdout carries no marker of the widening — while `presence`
carries a permanent `scope=pulled` disclaimer for a weaker caveat. The rest are documentation that
falls short of the code in the one place each helper declares to be authoritative, plus three small
correctness gaps in the module.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 5 |
| Low | 4 |

## Findings by theme

### Theme 1 — a figure that was taken under a different scope than the key implies

**H-1. `turns` returns exit 0 and an unscoped whole-file count when the checkout is unresolved, and stdout says nothing.** `hooks/lib/events-query.ts:146-149` makes `isOurs` true for every line when the reading checkout is `null`, so `countTurns` filters nothing; `hooks/events-query.ts:195-206` names the widening on stderr and falls through to the ordinary success path at `:247-248`.

```
$ FUSION_EVENTS_PERSON='' FUSION_EVENTS_CHECKOUT='' FUSION_EVENTS_IDENTITY_EXIT=5 node hooks/dist/events-query.js turns
fusion-events: this checkout could not be identified, so every line is counted, as before C4.
turns=1
EXIT=0
```

The program states its own principle twice — `bin/fusion-events:126-127` ("the defect being repaired is exactly a count that looked like an answer") and `hooks/events-query.ts:27-34` ("stdout carries only figures that were taken") — and this is the case that escapes it. Plan step 5 instructs the four Turn-count sites to "never fall back to the whole-file count"; with exit 0 and no `scope=` key, a prompt cannot detect that the helper just did. `presence` already carries the analogous disclaimer on stdout as a constant. Record: `260826-0131_*_turns-returns-exit-0-and-a-whole-file-count-when-the-checkout-is-unresolved-and-stdout-says-nothing.md`. **Severity: High.**

**M-2. A `turn_start` line with no readable `ts` is dropped from the count and reported nowhere.** `hooks/lib/events-query.ts:363-367` skips it; it is well-formed JSON so it never reaches `malformed`. A fixture holding one `session_start` and two unstamped `turn_start` lines returns `{"ok":true,"turns":0,"malformed":0}`. `parseLog`'s own comment at `:77-82` states the principle this breaks, and `measurePresence` obeys it explicitly for its own drop at `:220-222`. Record: `260826-0133_*_a-turn-start-line-with-no-readable-timestamp-is-dropped-from-the-count-and-reported-nowhere.md`. **Severity: Medium.**

### Theme 2 — the authoritative header falls short of the code

Each `bin/` helper declares its own header to be the authoritative documentation, and `CLAUDE.md` and `README-hooks.md` both defer to it. Three findings are the header saying less than, or something other than, what the program does.

**M-1. `turns` exit 4 has two causes and the header names one.** `hooks/lib/events-query.ts:315` declares `"no-session-start" | "anchor-without-timestamp"`; `hooks/events-query.ts:238-243` maps both to 4; `bin/fusion-events:71-72` documents only the first. The plan's own `## API Changes` table has the same omission, so the two agree with each other and both are short of the code. Record: `260826-0132_*_the-turns-exit-4-has-two-causes-and-the-authoritative-header-names-one.md`. **Severity: Medium.**

**M-3. `other_checkouts` counts two different sets depending on the exit code, and its interface comment describes only one.** `hooks/lib/events-query.ts:188-190` calls it "Distinct other checkouts, whoever they turn out to belong to"; `:271-282` puts only `checkout` and `unknown` parties into that set. Measured over one fixture: `other_checkouts=1` when the reading person is known and `=4` when it is not. The code matches the plan; the comment does not match the code, and neither states that the key widens at exit 4. Record: `260826-0134_*_other-checkouts-counts-two-different-sets-depending-on-the-exit-code-and-its-comment-describes-one.md`. **Severity: Medium.**

**L-1. The party sort is not total, and the comment at `hooks/lib/events-query.ts:264-269` claims it is.** Parties are keyed by the pair of person and checkout (`:244`) but the tie-break reads `checkout` alone, so two parties sharing a checkout and a timestamp order by file position. Measured: reversing the input reverses the output. Unreachable in a real log, and directly consequential for plan step 10, which will assert order against that comment. One clause fixes it. Record: `260826-0137_*_the-party-sort-is-not-total-and-the-comment-beside-it-claims-it-is.md`. **Severity: Low.**

### Theme 3 — an identity half that is *not owed* read as one that *could not be read*

**M-4. A non-git tree gets a permanent presence caveat under two contradicting stderr lines.** `bin/fusion-identity` exit 4 means no identity is owed; `hooks/events-query.ts:178-186` keys only on `identity.person === null` and folds it in with exits 3 and 5. Measured in a fresh non-git workbench, the helper prints "no git identity is owed here (not a git work tree)" and then "the reading person could not be read", and exits 4 over an empty log.

`bin/fusion-identity`'s header devotes a section to why 1 and 4 must stay different codes, and `CLAUDE.md`'s row for it calls the non-git case "what keeps single-user non-git operation working". Plan step 6 renders exit 4 as a caveat line, so in a non-git project that line is permanent while step 6 also asks the surface to print nothing when the counts are zero. The *classification* is genuinely undecidable without the reading person and is right; the wording and the code are what do not follow. Record: `260826-0135_*_a-tree-that-owes-no-git-identity-is-read-as-one-whose-identity-could-not-be-read.md`. **Severity: Medium.**

**L-4. The new Setup step 2 call moves a halt from first filing to Setup, and nothing states it.** `agents/orchestrator.md:130-136` cites `rules/fusion-workbench-conventions.md` `### Who filed it` "including the exit that halts you"; that rule's exit 1 obliges a halt. The orchestrator now stops at Setup step 2 in a git tree with no configured identity. Defensible, and unstated — and it sits beside the opposite reading of the same exit code in the same range: `hooks/events-query.ts:84` and `bin/fusion-events:99-103` treat exit 1 as a degradation, not a halt. Record: `260826-0140_*_the-new-setup-step-2-identity-call-moves-a-halt-from-first-filing-to-setup-and-nothing-says-so.md`. **Severity: Low.**

### Theme 4 — the contract states a shape the producer cannot express

**M-5. The "absent rather than empty" rule has no expression in any of the three emit templates.** `agents/orchestrator.md:1274` states the rule once and correctly. The three templates that must obey it — `:231` (the executable `session_start` line), `:1317` (the `**Emitting events:**` form) and `:949` (the `session_end` prose) — each carry both fields unconditionally with a placeholder inside the quotes, and none carries a branch. An unresolved half yields `"person":""`.

The readers built in this same range tolerate it (`hooks/lib/events-query.ts:102-104` drops an empty-string field), so the effect is benign today. `bin/monitor` at plan step 7 is specified to "drop the lines whose `checkout` is present and differs", and a reader written to that sentence would be right by accident. The unresolved half is the ordinary state of an install one release behind, which `260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md` measures. Record: `260826-0136_*_the-absent-rather-than-empty-rule-has-no-expression-in-any-of-the-three-emit-templates.md`. **Severity: Medium.**

**L-2. The `party=` line is unescaped tab-separated output.** `hooks/lib/events-query.ts:296-300` joins five fields with a TAB and escapes nothing; a TAB in `person` shifts every later field and a newline splits the record. The module chose NUL for its internal key at `:205-210` on exactly this reasoning and did not carry it to the output format, which is the surface a consumer parses. `person` originates in `git config`, so it is user-controlled and not attacker-controlled. Record: `260826-0138_*_the-party-line-is-unescaped-tab-separated-and-a-tab-or-newline-in-a-person-value-breaks-it.md`. **Severity: Low.**

### Theme 5 — citation form

**L-3. Three citations added in this range name a record by its bare stamp.** `CLAUDE.md:43` twice (`260823-1302`, `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`) and `README-hooks.md:192` once (`260823-1302`). `rules/fusion-workbench-conventions.md` `## Filename Patterns` retired that form on 2026-08-24 (`git:2b055a0`), the day before these were written, on the measurement that 111 of 545 stamps are carried by more than one file. `bin/fusion-events` gets it right in the same step (`:106`, `:119`). The surrounding rows carry the same old form, so these follow a house style rather than diverging from one, and no gate resolves a bare stamp. Record: `260826-0139_*_three-citations-added-in-this-range-name-a-record-by-its-bare-stamp-a-day-after-the-rule-forbade-it.md`. **Severity: Low.**

## What was verified and holds

Stated so the next pass does not re-derive it.

- **Purity (plan `## Approach`, `## Testing Strategy`).** `hooks/lib/events-query.ts` carries no `import` at all and touches only `Date.parse`. Every case below was exercised against the compiled module from a scratch directory with no git tree and no workbench.
- **`ts` parsing.** Both subcommands go through `parseTs` (`:119-124`); no other `Date.parse` or `new Date` exists in either file. The zone test at `:121` correctly leaves an already-zoned stamp alone: `…T12:00:00` and `…T12:00:00Z` resolve to the same instant, `…+02:00` to a different one. A line with no `ts` returns `null` rather than raising, in both readings.
- **`countTurns` order-independence.** Four permutations of a five-line fixture, including full reversal, return the identical result. A tie in `ts` between two `session_start` lines for different history files also survives reversal. No step of the count depends on file position beyond a documented stable tie-break within one checkout's own append order.
- **The claimed `turns` gap.** Against the live log: `turns=1`, `history_file=circles/260825-2023-…`, and there is exactly one `session_start` naming that file with exactly one `turn_start` at or after its stamp. The whole-file event count is **147**; `grep -c turn_start` returns **154**, over-counting by seven lines that carry the token inside a `detail` field. The claimed cause holds, and the four sites plan step 5 replaces are wrong by more than the record says.
- **Exit codes against the header.** Measured in a scratch workbench: no argument → 1, unknown subcommand → 1, `--days` without a value → 1, `--days 0` → 1, `--days` on `turns` → 1, no log → 3 (`presence`) and 3 (`turns`), no `agentstate.yaml` → 3, empty log → real zeros on `presence`, no matching `session_start` → 4, no workbench → 2. Exit 5 is guarded at `bin/fusion-events:139-142`. Every code the header claims is the code the program returns; the only gap is the undocumented second cause of 4 (M-1).
- **The case split (plan `## Data Structures`).** All eight clauses reachable, disjoint and complete: no-checkout counted as ours; another person; a further checkout of the same person; past the window; empty log; missing `agentstate.yaml`; a history file with no `session_start`; and `turns=0` reaching the ok branch as a real figure. The code adds a fourth class, `unknown`, which the plan's three-row table does not carry and the `bin/fusion-events` header does (`:52-53`).
- **The absence rule in `agents/orchestrator.md`.** Stated once, at `:1274`, unambiguously, and consistent with `isOurs` at `hooks/lib/events-query.ts:146-149`. The six other mentions (`:130`, `:228`, `:231`, `:949`, `:1263-1264`, `:1317`) restate the obligation without competing with it. What is missing is the producer's expression of it, which is M-5 and not a contradiction.
- **The compiled half.** `committed-dist.test.ts` passes: `hooks/dist/events-query.js` and `hooks/dist/lib/events-query.js` are the compilation of the committed source under the pinned TypeScript.
- **The gates.** `cd hooks && npm test` is 42 files passed, 1 failed. The one failure is `workbench-citation-lint.test.ts` on a **stale-marker citation in the plan file** caused by an uncommitted rename in the working tree, not by anything in the range: at the range's own HEAD the corpus is clean. The growth golden was regenerated correctly and the three baseline maps in `surface-growth-bound.test.ts` were **not** touched, which is the rule `growth-bound.ts` states. `agents/*.md` spent 1 412 bytes of its 3 007 and 1 595 remain, against plan step 3's estimate of 1 100 to 1 400.
- **Packaging.** `bin/fusion-events` is committed `100755`, `.gitignore` carries its `!bin/` exception, and `install.sh`'s copy loop already names `bin`, so no installer change is owed. `README-hooks.md` gained rows in both the entry-point table and the `hooks/lib` table, the second of which `derivable-enumerations-lint` holds in set equality.

## Cross-cutting observations

**The same defect class appears three times: the program is more careful than its documentation.** M-1, M-3 and L-1 are each a case the code handles correctly and the authoritative text describes wrongly or not at all. That matters more in this repository than it would elsewhere, because `CLAUDE.md` and `README-hooks.md` both explicitly defer to the `bin/` header and summarise rather than restate it, so a wrong header is the only copy a reader gets. All three are one or two sentences to fix and none needs a code change except L-1's single tie-break clause.

**The stdout self-disclaimer is used once and owed twice.** `presence` prints `scope=pulled` unconditionally so no consumer can mistake a partial view for a total one. `turns` has the stronger version of the same need — a scope that silently widens rather than one that is permanently partial — and carries no such key (H-1). One key, in the shape the program already uses, closes it.

**`bin/fusion-identity`'s exit vocabulary is read three different ways inside this one range.** `### Who filed it` says exit 1 halts (cited at `agents/orchestrator.md:136`), `hooks/events-query.ts:84` treats exit 1 as a degradation, and `hooks/events-query.ts:178-186` treats exit 4 as if it were exit 3. The helper's own header devotes a section to why those codes must stay distinguishable. M-4 and L-4 are the two visible ends of it; whoever takes either should read them together.

**Nothing found in the range contradicts the plan's `## Approach` or `## API Changes`.** Every divergence above is between the code and its own documentation, or between the code and a rule the project carries elsewhere. The design the plan set out is what got built.

## Recommended sequencing

1. **Before plan step 5 writes the four call sites:** H-1. Step 5's instruction to those sites is unimplementable until `turns` gives them something to branch on.
2. **Before plan step 6 writes the two presence renderers:** M-4 and M-3. Both change what the renderer has to say and which branches it needs.
3. **Before plan step 7 writes the monitor filter:** M-5. The monitor is the first reader specified to test `checkout` presence directly.
4. **Before plan step 10 writes the tests:** L-1, since a test would otherwise pin the non-total order as the contract.
5. **Cleanup, any time:** M-1, M-2, L-2, L-3 and L-4.

None of the ten is a release blocker on its own. H-1 is a blocker on plan step 5.

---

**Reconciliation annotation — 2026-08-26, reconciler, HEAD `7774d56`.** Every finding of this review
reached a record and every one of those records is closed. The ten `260826-013x` defects plus
`260825-2140_*_the-two-session-start-emit-sites-disagree-…` all carry `_c_`, and fourteen of the
sixteen closures in this Circle were re-checked against the tree rather than against their own prose;
the ones belonging to this review verify at `hooks/lib/events-query.ts:283` (total party sort),
`:327-335` (`flattenField` on all five fields), `:420-434` (`unstamped`), `hooks/events-query.ts:102-160`
(`resolveIdentity`, one exit table), `:352`/`:368` (the `scope=` key), and `CLAUDE.md:43` /
`README-hooks.md:199` (the three bare-stamp citations, now full wildcarded paths).

One closure of this review's findings was overtaken and now carries a `Revised by:` line rather than
a marker move: `260826-0136_*_the-absent-rather-than-empty-rule-has-no-expression-in-any-of-the-three-emit-templates.md`
was closed on "all three emit sites carry `<ID>`" while a fourth existed at
`skills/setup/SKILL.md:483`. The Turn 2 review caught it; `6deeb33` converted it. The finding was
right and its closure was one site short.
