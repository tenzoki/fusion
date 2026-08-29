# Two register habits in the four chat voice profiles

**Reviewed-range:** `e764637..de0c6f6`
**Not-opened:** `260821-2020-reply-length-baseline.md`, `260821-1042-reply-bounded-whole-question-answered`, `260821-1108_*_is-claude-mds-register-repair-inside-this-circle.md`, `260821-1108_*_may-an-agent-read-the-session-transcripts-as-a-source-of-evidence.md`, `260821-1108_*_what-may-the-circles-own-new-clauses-cost.md`, `260821-1108_*_which-surfaces-may-this-circle-change.md`, `260821-1801_*_what-total-caps-a-session-summary-now-that-no-reply-has-an-uncapped-tail.md`, `260821-2004_*_what-happens-to-the-directive-when-the-plan-a-circle-runs-on-deliberately-does-not-state-one.md`, `260821-1642-orchestrator-session.md`, `260821-1812-planner-the-plan-for-the-bounded-reply.md`, `260821-2010-coder-repair-four-citations-broken-by-activation.md`, `260821-2020-analyst-the-reply-length-baseline-is-frozen.md`, `260821-2035-coder-close-the-three-routes-out-of-the-length-cap.md`, `260821-2108-coder-regenerate-two-golden-fixtures-after-step-2.md`, `260821-2120-coder-the-reply-answers-the-question-that-was-put.md`, `260821-2145-coder-the-cut-that-pays-for-steps-2-and-3.md`, `260821-2147-coder-the-corpus-is-measured.md`, `fusion-workbench/orchestrator-events.jsonl`, `fusion-workbench/portfolio.md`, `260821-1536-playmaker-direct-dispatch.md`, `260821-1810_*_activating-a-circle-turns-the-suite-red-because-its-own-decision-records-cite-the-anticipated-marker.md`, `hooks/lib/__tests__/fixtures/rules-emission.golden`

**Sender:** ontorev
**Date:** 2026-08-21
**Scope as dispatched:** step 4 of `260821-1805_*_plan-reply-bounded-whole-question-answered.md` — the four chat voice profiles. The `Not-opened:` list is everything else the range touched; the dispatch narrowed the scope and no earlier review carried anything in.

**Partly opened, and named here rather than in the list above:** `260821-1805_*_plan-reply-bounded-whole-question-answered.md` (its step-4 acceptance, `## Current State` budget and risk table, not the whole plan) and `hooks/lib/__tests__/reference-resolution-lint.test.ts` (`surface()`, `PLUGIN_PATH_BODY`, the `BASELINE` and its re-approval notes, not the whole file). Opened in full: the four profiles, `rules/user-facing-output.md`, `hooks/lib/__tests__/fixtures/surface-growth.golden`, the step's own log at `.../260821-2132-ontocoder-two-register-habits-in-four-profile-files.md`, and the corpus notes in `hooks/lib/__tests__/workbench-citation-lint.test.ts`, which the range did not touch.

## Summary

Every mechanical claim the step made is true, verified independently: both pairs are
byte-identical, all four files parse, the entry shape is intact, and the deltas are exactly
the reported −12 and −42. The C05 cut was the right call and removed a sentence that step 2
had made false. What does not hold is the substance of the two extensions: AI04's new clause
collides with the remedy the old one already carried, C06's new clause is the only copy of a
rule and sits on the half of the profile no fallback covers, and both entries kept a `name:`
that no longer describes what is under it. Seven records filed, five in the Circle and two in
`shared/`.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 4 |
| Low | 3 |

## Verified, and reported correctly by the step

| Claim | How checked | Result |
|---|---|---|
| Both pairs byte-identical | `md5` and `diff` per pair | `chat-voice-en.yaml` 6864 bytes, md5 `4d06ddcb…`, both copies. `chat-voice-de.yaml` 7438 bytes, md5 `49017439…`, both copies. `diff` silent on both pairs. |
| All four parse as YAML | `ruby -ryaml` `safe_load` | All four load. Top keys `name, description, scope, whitelist, blacklist, examples, settings` in all four. |
| Entry shape intact | per-entry key check | Whitelist `C01 C02 C03 C04 C05 C06`, blacklist `AI02 AI01 AI05 AI06 AI04 AI07 AI08 L04 AI11`, identical in all four. Every entry has `id`, `name`, `instruction`; no entry carries a key outside `{id, name, instruction, examples}`. |
| Deltas −12 / −42 | `git show e764637:<f> \| wc -c` against `wc -c` | English 6876 → 6864 = −12. German 7480 → 7438 = −42. Both trees. Each file net negative, so the profiles' budget is met without borrowing. |
| Pointer direction not inverted | read `rules/user-facing-output.md` in full | Confirmed. The rule names the profile path and summarises its two lists, but states every anti-pattern itself and carries an explicit absent-profile fallback at `:32`. No statement in the rule is delegated to a profile. The one clause that looks like delegation, "One `—` per ~1000 words is the ceiling, matching the stylometric profiles" (`:132`), asserts the ceiling in the rule; the two long-form profiles do carry it (`stilwerk/default-voice-en.yaml:146`, `default-voice-de.yaml:145`) and the chat profiles state no rate, which is a coverage gap rather than an inversion. |
| C05's pointer resolves | `grep '^## '` on the rule | Both anchors exist: `## Sketch structure instead of narrating it` at `rules/user-facing-output.md:34`, and C04's pre-existing `## Length` at `:97`. Two caveats are findings below. |
| Prose voice clean | `bin/fusion-prose-metric` (work tree copy; the installed copy at `$FUSION_PLUGIN_ROOT/bin/` does not carry the helper) | `chat-voice-en.yaml` 0 em-dashes / 665 prose words. `chat-voice-de.yaml` 0 / 605. `rules/user-facing-output.md` 1 / 2634, permit 2. All `ok`. |

## Findings by theme

### A. The two new clauses (Medium ×3)

**A1 — AI04's old remedy does not answer its new fault.** `circles/…/260821-2203_*_ai04s-remedy-change-the-item-count-does-not-answer-its-new-fault-using-a-list-at-all.md`

`stilwerk/chat-voice-en.yaml:122-124`, `chat-voice-de.yaml:124-126`. The dispatch asked whether
the instruction says what it means to say or reads as the old rule with words added. It reads as
the old rule with words added, and the join is where it shows. Sentence 2 licenses an enumeration
outright provided it has two or four items: its remedy is to keep the list and change its length.
Sentence 3 then says the list is not the default shape. An agent with four points is told by one
sentence that four items are fine and by the next that it should have written sentences. Two
further gaps: the clause prohibits a disposition ("default shape") that no single reply can be
checked against, unlike every other blacklist entry in the file, which names an observable token;
and the gloss plus the one example cover only the one-item case, leaving the three-findings case
the entry exists for unstated.

**A2 — C06's new clause is the only copy of a rule, on the half no fallback covers.** `circles/…/260821-2201_*_the-new-c06-clause-lives-only-in-a-profile-a-project-may-not-have.md`

`stilwerk/chat-voice-en.yaml:65-66`, `chat-voice-de.yaml:66-67`. The step's own log states the
premise: "the profile can be absent from a workbench entirely". `rules/user-facing-output.md:32`
carries a fallback for exactly that case, and it covers "the anti-patterns", the blacklist. AI04's
clause is on the blacklist and survives a missing profile. C06's is on the whitelist and does not,
and the rule's whitelist summary at `:19` names C01 through C04 only. The rule's own `## Vocabulary`
bullet at `:80` carries C06's first half and nothing about restating a claim; a grep for
`twice|restate|repeat|redundan` across the rule returns one hit, `:93`, about a different subject.
So for a project with no `stilwerk/`, "one formulation per claim" reaches no reader.

**A3 — Two entry names no longer cover their instructions.** `circles/…/260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md`

The dispatch asked whether a second rule has been smuggled into C06. Partly. The two halves are
adjacent but fail differently: *one name per thing* fails by variation, making the reader prove
three names are one object; *one formulation per claim* fails by repetition. The entry name states
the first only. AI04 has the sharper version of the same problem: the entry named "Mechanical
triads" now carries, as its single exhibit (`chat-voice-en.yaml:126`), a one-item enumeration.
These are lookup surfaces — an agent scans `name:` to decide which entries bear on a draft — so
both new clauses are reachable only by reading every instruction body in full. Byte-neutral or
near-neutral renames are proposed in the record.

### B. What the C05 cut created (Medium ×1)

**B1 — the cut traded self-contained text for citations nothing resolves.** `circles/…/260821-2204_*_the-c05-cut-traded-self-contained-text-for-citations-on-a-surface-no-gate-reads.md`

The cut itself is right, and the record says so: the old instruction restated the rule at length
and, after step 2, contradicted it, claiming a sketch does not count against the line cap while
the rule now says it counts like every other line. What remains stands alone and its example
still carries the language-specific half. Two problems attach to what it now leans on.

First, `stilwerk/` is outside both citation gates. `hooks/lib/__tests__/reference-resolution-lint.test.ts:143-190`
walks `rules/`, `agents/`, `docs/`, `templates/`, `skills/*/SKILL.md`, the READMEs, `CLAUDE.md`,
`bin/` shell scripts, `install.sh` and the `hooks` TypeScript, and no `stilwerk/`; its
`PLUGIN_PATH_BODY` at `:274` does list `stilwerk` as a directory a token may point *into*, so the
omission is of the surface and not of the vocabulary. `hooks/lib/__tests__/workbench-citation-lint.test.ts:111-115`
excludes `stilwerk/` on a ground that reasons about paths *under* it, not about citations *inside*
it. The gate is green at `BASELINE = { paths: 1258, anchors: 163, records: 116 }`, re-approved in
this range for steps 2 and 3 only; step 4 added a path and a heading anchor to each profile and
moved no counter, because nothing saw them. The heading anchor is the new exposure — step 2 rewrote
the body under that heading and left the title alone, and a rename would silently break four files.

Second, the pointer is spelled `rules/user-facing-output.md`, which is plugin-relative in a file
that gets copied into a consuming project's `fusion-workbench/stilwerk/`, where no such path exists.
C04 carries the same spelling at `chat-voice-en.yaml:41`, so a fix should take both.

### C. The German register (Low ×1)

**C1 — one of the two German clauses is a calque.** `circles/…/260821-2205_*_the-german-ai04-clause-reads-as-a-calque-of-the-english-one.md`

Judged as a German reader would, the two clauses came out differently. **C06 is good**
(`chat-voice-de.yaml:66-67`): "Ebenso eine Formulierung pro Aussage: zweimal gesagt wird sie nicht
wahrer" — the headline fragment parallels the entry's own name and the participial opening is
idiomatic. **AI04 is not** (`:125-126`): "Auch eine Antwort hat nicht die Aufzählung als
Default-Form: eine Sache, ein Satz." Negating with `nicht` before a definite-article noun phrase
inside an `als`-predicative is English clause order carried across word for word; `eine Sache`
drops the "to say" the English gloss carries, so it reads as one topic rather than one thing to
report; and `Default-Form` sits one sentence after `Default-Rhythmus`, which is repetition in an
entry about not repeating. A one-byte-shorter rewrite is proposed. This is the profile every agent
in this project loads, since `CLAUDE.md` declares `**Language:** de`.

### D. Nearby, not caused by this step (Low ×2, filed in `shared/`)

**D1 — the German profiles name the wrong dash.** `260821-2206_*_the-german-voice-profiles-name-en-dash-as-the-character-to-avoid-while-every-other-surface-counts-em-dash.md`

`chat-voice-de.yaml:82` and `default-voice-de.yaml:143` both instruct "Gedankenstriche (–)", and
that character is U+2013 EN DASH. `bin/fusion-prose-metric` counts U+2014 only,
`rules/user-facing-output.md:132` says "Scan for `—`" (U+2014), and `default-voice-en.yaml:145`
writes `(—)`. The German file also disagrees with itself: AI02's first example (`:88`) carries two
U+2014 and its second (`:89`) two U+2013. Nothing is red today — both German profiles measure zero
em-dashes — so this is a wrong instruction rather than a failing measurement. Pre-existing; AI02 is
not part of step 4.

**D2 — the rule's inventory of the profile is short by three entries.** `260821-2207_*_the-rules-inventory-of-the-chat-profile-names-eight-of-nine-blacklist-entries-and-four-of-six-whitelist-entries.md`

`rules/user-facing-output.md:18` names eight of the nine blacklist entries; AI08 "Announcing
structure" is absent and appears in no revision of the file. `:19` names four of the six whitelist
entries; C05 and C06 are absent. Both bullets read as complete. This is the mechanism behind A2,
and it is filed separately because its fix is a different edit with its own cost.

## Recommended sequencing

1. **A1** first. It is the entry that carries the Circle's new register habit into every agent's
   chat output, and as written an agent can satisfy it while still opening every reply with a
   numbered list. Fixing it changes the text A3 and C1 then rename and translate.
2. **A2** next, and take it to the user rather than fixing it. Both routes add to
   `rules/user-facing-output.md`, and the plan's `## Current State` holds that file to its own
   budget of net zero or less; step 5 already spends against it. **D2** is the same edit region
   and should be decided in the same pass.
3. **A3** and **C1** together, inside the profiles' own budget. Both are text-local and neither
   needs a decision.
4. **B1** last, because its three routes are mutually exclusive and route 2 (extend `surface()`)
   is a code change with a baseline re-approval attached. It is not urgent: both anchors resolve
   today.
5. **D1** whenever a German profile is next opened. One character in each of four files.

## What no gate covers, stated rather than left to be found

Per `260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`,
no gate or test enforces any of this, and none was proposed here. Every finding above was
established by reading, by a one-off measurement, or by running an existing gate that is green.
The one gate change any record proposes — B1 route 2 — extends an existing citation lint's corpus
and asserts nothing about register.

---
**Reconciliation 260821-2349** (reconciler, HEAD `9a68760`). Confirming against the tree what this
review's seven records did after Turn 3, without rewriting any finding.

- A1, AI04's colliding remedies: **closed.** The entry now carries one test, "Use an enumeration
  only when the items are parallel and the reader needs to count them", in all four copies.
- A2, C06's clause on the uncovered half: **closed by route 1.** `rules/user-facing-output.md:81`
  carries "One formulation per claim" as its own bullet and the profile entry stayed.
- A3, the two entry names: **still open for C06.** AI04 was renamed to "Mechanical enumeration";
  C06 still reads "One name per thing". The reason its record gave for deferring the C06 rename was
  that A2 might move the clause out of the profile. A2 kept it there, so that reason has expired.
- B1, the C05 pointers: **still open, unchanged**, and all three routes still available.
- C1, the German calque: **closed.** The German AI04 is now infinitive imperative throughout and
  carries no `Default-` compound.
- D1, the wrong dash in the German profiles: **still open, untouched.**
- D2, the rule's short inventory: **still open**, though the "three-part lists" wording it did not
  raise was corrected for a different reason.

The review's `**Reviewed-range:**` is `e764637..de0c6f6`, and its `**Not-opened:**` list was picked
up by no later pass.
