# Reconciliation — applying `260814-1332` to the record population it governs

**Date:** 2026-08-15 20:56
**Agent:** reconciler, domain `code`
**HEAD:** `bd07ee7`
**Scope:** decision records only. No code, no data, no commit, no rename.
**Dispatch:** follow-up to the Rebalance gate of Circle `260815-0007-remove-eight-mechanisms-and-cap-growth`, recommended by this reconciler's own Phase-3 verdict at `260815-1913`.

---

## 1. What was applied

`260814-1332_*_what-marks-an-implemented-decision-whose-implementation-was-later-deleted.md`
was answered by the user at the Rebalance gate: **option 3**. An implemented decision whose
implementation was later deleted gains a `Retired:` annotation citing the plan, commit or gate that
removed it; the marker stays `_i_`; nothing is renamed.

The annotation's definition landed in `rules/fusion-workbench-conventions.md` by a parallel dispatch
and was read before writing anything — the `_i_` row at `:328`, the annotation form and its
no-rename clause at `:431-436`, and the template line at `:520`. Every annotation this pass wrote
uses that form verbatim: a `---` rule, then `Retired: <citation> — <one-line reason>`, appended at
the foot of the record.

**Nothing was renamed.** The marker distribution across the corpus is unchanged by any transition:
14 `_a_`, 4 `_d_`, 63 `_i_`, 1 `_s_` before and after. The corpus grew from 91 records to 92 and the
`_o_` count from 9 to 10, both accounted for by the one record §3 files.

---

## 2. The population, measured

**25 records**, all `_i_`, all with an implementation that this project has since deleted.

The measurement was taken record by record, not by keyword: all 63 `_i_` records were enumerated
across the whole workbench (not only `$SCAN_DECISIONS` — 16 of the 25 sit in Circles no scan
key reaches from here), each one's `Implemented:` citation was read, and the artifact it names was
looked for in the tree at `bd07ee7`. 38 were found present and are not in the population; §4 names
the ones where that call was not obvious.

| Removal | What removed it | When | Records |
|---|---|---|---|
| Plane mirror | `d0ddabb` + `7c12d6a`, plan steps 2–3 | 2026-08-15 | 7 |
| Churn heatmap + cross-file counters | `a69d56e` + `04ea182`, plan steps 4–5 | 2026-08-15 | 2 |
| Persisted queue + queue-ground | `dd312eb`, plan step 10 | 2026-08-15 | 1 |
| Protected-path half of the guard | `60c9cd8` + `fa2f00b`, plan `260812-1232_*_…` | 2026-08-12 | 7 |
| Write/mutation classifier | `ba7ccda`, plan `260807-0931_*_…` | 2026-08-07 | 8 |

### The records

**Plane mirror** — `d0ddabb` (code and prose) and `7c12d6a` (data files and fixtures), steps 2 and 3
of `260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md`.
Two of the seven also cite `1e29572` (step 12), which removed `/fusion:seed-from-plane`.

1. `260719-2223_*_plane-datamodel-subissue-vs-flat-links.md`
2. `260719-2223_*_seeded-circle-anticipated-vs-active.md`
3. `260719-2313_*_round-trip-write-overwrites-origin-story-description.md`
4. `260716-1847_*_offline-verhalten-bei-plane-ausfall.md`
5. `260716-1847_*_plane-rolle-source-of-truth.md`
6. `260719-2141_*_plane-rolle-push-only-vs-bounded-readback-martin.md`
7. `260722-2230_*_thin-mirror-vs-comment-borne-full-spec.md`

**Churn** — `a69d56e` (heatmap) and `04ea182` (configuration leaves), steps 4 and 5.

8. `260809-2004_*_should-the-latching-churn-and-cross-file-criticals-be-bounded-or-dropped.md`
9. `260810-0920_*_what-should-a-churn-key-be-anchored-to-and-what-happens-to-the-535-entries-already-recorded.md`

**The queue** — `dd312eb`, step 10.

10. `260810-1822_*_should-the-queue-ground-procedure-become-a-rule-file-when-one-of-its-three-consumers-cannot-be-emitted-to.md`

**Protected-path half** — `60c9cd8` (the mechanism) and `fa2f00b` (the always-on rule),
`260812-1232_*_remove-the-protected-path-half-of-the-compliance-guard.md`.

11. `260801-1020_*_may-any-fusion-writer-touch-rules.md`
12. `260809-1527_*_should-the-revert-narrow-to-the-payload-path-for-the-four-write-tools.md`
13. `260802-1912_*_does-the-self-protection-floor-apply-before-the-config-file-exists.md`
14. `260803-1314_*_may-a-project-protect-a-path-inside-its-own-rule-directory-against-the-rules-write-flag.md`
15. `260803-1419_*_how-should-the-protected-path-check-treat-the-case-of-a-path.md`
16. `260805-0709_*_wohin-gehoert-die-forensik-aus-protected-path-discipline.md`
17. `260807-0825_*_should-the-guard-predict-shell-writes-or-enforce-them.md`

**Write/mutation classifier** — `ba7ccda`,
`260807-0931_*_plan-guard-misst-statt-orakelt.md`.
Two of the eight also cite `fa2f00b`, because their answers were documentation-only and the document
they landed in was the always-on rule.

18. `260803-1402_*_should-the-mutation-classifier-inspect-a-read-operand-to-close-the-planted-alias.md`
19. `260803-1803_*_should-the-guard-degrade-its-working-directory-model-when-cdpath-is-set-in-the-ambient-environment.md`
20. `260803-2338_*_should-the-guard-degrade-its-directory-model-after-a-cd-it-cannot-prove-succeeded.md`
21. `260804-0106_*_should-the-fail-closed-bound-be-drawn-around-the-program-or-around-the-cause.md`
22. `260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md`
23. `260804-1323_*_should-the-guard-model-gits-own-working-directory-or-give-up-on-it.md`
24. `260804-1815_*_should-git-restore-source-head-become-inert-the-way-git-checkout-head-already-is.md`
25. `260807-0250_*_does-a-pipelines-subshell-fact-reach-every-segment-of-a-compound-element.md`

### How the tree was read

Not from commit messages. `hooks/lib/paths.ts:9-31` is the single best witness for the guard cluster:
its own header states that both matched sets are gone and names the helpers that went with them
(`matchesAnyFolded`, `canonicalise`), leaving one set, `guard.categoryPaths`. `README-hooks.md:286`
enumerates the four deleted `hooks/lib` modules, CHECK 2, tracker job 1, the `guard.protectedPaths`
leaf, the self-protection floor and the `FUSION_ALLOW_RULES_WRITE` flag, and closes "Nothing replaced
any of it". `hooks/lib/config.ts:127` carries the floor's own epitaph in the source. Every remaining
grep hit for a removed token across `agents/ rules/ skills/ hooks/*.ts hooks/lib/*.ts bin/ docs/
README*.md CLAUDE.md install.sh` was opened and is a historical comment, not a live reference.

---

## 3. The two `_a_` records — a different question, filed

`260806-1152_*_stash-manifest-dirname-and-pointer-content-duplicate.md` and
`260810-2032_*_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md`
were annotated by the `260815-1913` pass and named in its Coherence verdict as the two records that
flag the `Grounding↔Directive` edge. **They did not get a `Retired:` line, and the judgement is that
they should not.**

`Retired:` as landed is defined against a removed **implementation** — `rules/fusion-workbench-conventions.md:520`
says "set when the implementation is removed; the marker stays `_i_`", and `:431` asks the citation
to name what removed the implementation. These two records have no implementation. Their
`Implemented:` line is empty, which is exactly what `_a_` asserts. An annotation naming the removal
of a thing that was never built is a citation a reader cannot resolve — the failure the dispatch
called worse than no annotation at all. And an annotation that has to be read against the marker to
know which of two things it means is the property option 2 of `260814-1332` was declined over.

The two also mislead differently, which is why this is a separate question rather than a wording fix.
An `_i_` record with a deleted implementation claims a mechanism ships. An `_a_` record whose answer
is unrealisable claims *pending work* — and `_a_` is Grounding-Stand, so anyone reading the `_a_` set
as a backlog finds two entries that can never be discharged.

Filed as
`260815-2056_*_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md`
(this Circle's store, per the Origin Rule: both became unrealisable through steps 6 and 11 of this
Circle's Directive). Four options, recommendation option 2 — a distinct `Unrealisable:` annotation —
at low-to-moderate confidence, with the honest note that two instances may be the whole class and
that option 4, leave them alone, becomes the right answer if no third appears. Both records carry a
note pointing at it.

---

## 4. Considered and excluded, with the reason

Thirteen `_i_` records were close enough to need a decision. None is in the population.

| Record | Why not |
|---|---|
| `260809-2310_*_should-the-branch-policy-fall-the-way-the-write-classifier-fell.md` | Its answer *was* the deletion. `7598073` removed `hooks/lib/git-branch-guard.ts`, `shell-parse.ts` and `command-word.ts`, and that state is in force at HEAD. An implementation that is itself a removal is not retired by the removal persisting. |
| `260807-1026_*_verlust-des-bash-halts-auf-der-shell.md` | Same shape. Option 1 struck the `mutation.mutates` branch; the guard still inspects `Bash` for nothing. One of its `Randbedingungen` — that protected paths are measured and restored after every tool call — became false on 2026-08-12, but a falsified constraint is not a deleted implementation. Worth a note if the class recurs. |
| `260806-0015_*_wem-gehoert-die-circle-aktivierung.md` | Rebuilt, not deleted. `rules/workbench-stash-and-lock.md` was renamed `rules/commit-lock.md` by `5d29b6d` with its stash half cut; the `bin/fusion-commit-lock` acquisition by `/fusion:commit` and `/fusion:cleanup` and the `.active-circle` writer sentence both stand. Two of the five named files changed shape; none of the answer is gone. |
| `260716-1847_*_zuschnitt-umbau-und-plane-ein-oder-zwei-circles.md` | The judgement call. Its `Implemented:` line cites two Circle directories, and both exist at HEAD. What the Plane removal deleted is the *product* of one of them, which this record does not cite. Excluded on the strict reading of what the citation names; a reader who disagrees has a case. |
| `260718-2150_*_reviewers-history-log-step.md` | Reduced, not removed. The "document the exception" sentence landed in three reviewers; `a17cc8c` deleted one of them. It still stands in `coderev` and `ontorev`. |
| `260814-0845_*_are-the-sixteen-agent-claims-corrected-or-derived-away.md` | The mechanism is alive and did its job. The five digit claims are asserted against the tree by `derivable-enumerations-lint.test.ts`; they read fifteen today because agents left and the lint forced the update. A record whose implementation self-maintains is the opposite of retired. |
| `260804-1630_*_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md` | Live. The per-leaf merge is in `hooks/lib/config.ts` and survived the protected-path removal. |
| `260804-1631_*_may-a-project-file-set-guard-enabled-and-switch-the-whole-guard-off.md` | Live. `guard.enabled` is still resolved from plugin layer and DEFAULTS only, with the diagnostic. |
| `260805-1559_*_der-regeltext-ratchet-laesst-keine-erweiterung-zu-und-heute-war-die-erste-noetige.md` | Live and extended. `GROWTH_BUDGET = 12_000` over `RULE_BASELINE` is at `hooks/lib/__tests__/rules-emission-golden.test.ts:251`, and step 13 widened the same instrument to `agents/`, `skills/` and the hook test lines. |
| `260811-1146_*_does-the-measurement-family-get-a-shared-chassis-before-the-fourth-module.md` | Live. `hooks/lib/git.ts` and `hooks/lib/guard-state-file.ts` exist and are imported by the two surviving measurement modules; `git.ts`'s header records the third one's removal and states the argument is unchanged. Its `Implemented:` line cites `hooks/tracker.ts:776-857`, which no longer exists at that range — citation drift, not retirement. |
| `260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md` | Live. `skills/archive/SKILL.md:128-246` still carries `### Rolling the guard event log` and the safety-filter narrowing. |
| `260811-2009_*_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md` | Live. `hooks/scripts/build.mjs` still compiles to `.build-staging/` and replaces `dist/` by `rename(2)`. |
| `260801-1020_*_where-does-normative-consistency-live.md` | Live. `agents/curator.md` is the answer and it shipped. `/fusion:revise-claude-md`, deleted at step 12, appears only inside its *rejected* options. |

---

## 5. What this pass did not do, and one thing it noticed

**`260814-1332`'s own `_a_` → `_i_` transition was not taken.** Both halves of option 3 are on disk —
the conventions definition by a parallel dispatch, the 25 annotations here — so the record is
implemented on the evidence. The dispatch instructed this pass to rename nothing, so the evidence was
recorded on the record instead and the transition is left for whoever takes it next. Doing it
correctly means moving the marker *and* filling `Implemented:` in one step; filling the line without
the rename would create a 35th instance of
`260812-1232_*_thirty-four-of-seventy-four-decision-records-carry-a-status-header-that-contradicts-their-filename-marker.md`.

**Sixteen of the twenty-five sit in Circles no scan key reaches from here.** `bin/fusion-paths` resolves
`$SCAN_DECISIONS` to this Circle plus `shared/`, and the annotations landed in
`260801-1244-guard-rules-write`, `260804-1205-shell-reachability-model` and
`260719-1536-plane-mirror-integration` as well. That was correct for this dispatch, which
named the population rather than a scan scope, and it is the constraint `260814-1332` itself
predicted ("a single pass cannot repair the corpus"). A curator run, whose editable surface *is*
`$SCAN_DECISIONS`, would have reached nine of the twenty-five, all of them in `shared/`.

**No issue was filed.** Everything this pass found that needed a record either already has one or
became the decision in §3.

---

## 6. Files written

25 decision records annotated (§2), 2 decision records annotated without transition (§3), 1 decision
record created (§3), 1 decision record annotated with the applied-answer note
(`260814-1332`), 1 orchestrator session history file appended
(`260814-2306-orchestrator-session.md`, `## Coherence — Grounding revision applied`),
and this file.
