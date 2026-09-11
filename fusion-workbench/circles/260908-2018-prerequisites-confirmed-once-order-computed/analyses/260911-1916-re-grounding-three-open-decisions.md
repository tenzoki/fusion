# Analysis: re-grounding three open decisions against the tree at HEAD

**Date:** 2026-09-11 19:16
**Type:** Document Study
**Status:** Complete
**Requested by:** orchestrator (step A1 of `260911-1833_*_implementation-prerequisites-confirmed-once-order-computed.md`)

## Question

Three decision records filed on 2026-09-08 in this work item's decision store argue over surfaces that v11 removed on 2026-09-10. For each one: which of its options can still be written against the tree as it stands, which cannot and why, and what the live question is in the vocabulary the tree now uses. The report is the input a user gate reads. It transitions nothing and edits none of the three records.

## Scope

**The three records**, read in full:

- `260908-2018_*_does-the-new-field-name-only-the-ordering-edge-or-the-four-relation-types-beside-it.md` (below: the **relation-type** record)
- `260908-2018_*_does-the-record-template-mandate-the-prerequisite-field-or-merely-permit-it.md` (the **template** record)
- `260908-2018_*_is-a-closed-prerequisite-a-satisfied-edge-or-no-edge-and-what-is-an-archived-one.md` (the **closed-prerequisite** record)

**Also read:** `rules/fusion-workbench-conventions.md` `## Backlog entries — work items`, `## Terminal states are history`, `## Origin Rule (Herkunftsregel)`, `## Decision Record Template`; `skills/archive/SKILL.md` safety filters and the candidate walk; `skills/migrate/SKILL.md` record conversion; `skills/memo/SKILL.md` filing template; `docs/working-model.md`; `hooks/lib/citation-corpus.ts`; the two work-item records under `circles/`; `260911-1528_*_spec-prerequisites-confirmed-once-order-computed.md`; `260911-1833_*_implementation-prerequisites-confirmed-once-order-computed.md`; `260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md`; `260911-1747_*_may-a-done-work-items-head-field-be-edited-at-all-and-under-what-bound.md`; the deleted `rules/circle-records.md` at `76d833be^`.

**Tree.** HEAD `a3977760`, committed 2026-09-11 18:45 +0200, branch `main`, tracking `origin/main` and three commits ahead of it. `git status -sb` reports two modified files, the plan under this item's planning store and `orchestrator-events.jsonl`; neither bears on any figure below. Every present-tense claim in this report is dated by that commit.

**Out of scope.** The four answers the dispatch names as settled: the mechanism is time-free, the curator performs the edge proposal, the hook-test cut is separate work, and the one inherited edge is clarified before any figure is computed.

## Findings

### F0. What removed each surface, and when

| Surface a record argues over | Removed by | Date |
|---|---|---|
| `rules/circle-records.md` `## Circle record template`, and the `## Dependencies` section it specified | `76d833be` "the work item replaces the Circle, and the always-on floor falls 4 090 bytes" | 2026-09-10 |
| `agents/playmaker.md`, lines 130 and 138 with it | `2a785ba2` "one merge lands, three stop on budget, and agents/ falls 18 per cent" | 2026-09-10 |
| The six-marker Circle state vocabulary, and the two node kinds the template record partitions on | `76d833be` | 2026-09-10 |

`**Depends-on:**` entered `rules/fusion-workbench-conventions.md` in that same commit `76d833be`, so the field that replaced the section is exactly as old as the section's removal. Every `**Cross-references:**` pointer in the three records that names `rules/circle-records.md` or `agents/playmaker.md` is now dangling.

### F1. The node set and the one edge that exists

`ITEM_RECORD_RE` in `hooks/lib/citation-corpus.ts:133` is `/^circles\/([^/]+)\/\1\.md$/`: a work-item record is recognised by structural equality between a container's name and the record inside it. Counted at HEAD, `circles/` holds 26 containers, of which 2 carry a record in that form and 24 carry a terminal `_<m>_circle.md`. The 24 are outside the node set by construction, and no answer below changes that.

The two nodes:

| Item | `**Status:**` | `**Depends-on:**` |
|---|---|---|
| `260908-2018-prerequisites-confirmed-once-order-computed.md` | `claimed` | absent |
| `260909-1700-cut-fusion-to-working-minimum.md` | `done` | `260908-2018-prerequisites-confirmed-once-order-computed.md` |

So the whole store holds one edge, it runs from a terminal item to a live one, and the carrying record's own prose calls the relation "Conflicting, and the conflict is substantive rather than an ordering nicety" while refusing to rank the two items. `/fusion:migrate` lifted the name into the field on resolvability alone (`skills/migrate/SKILL.md:157`), and the field's own rule says it carries only edges the user has confirmed. That defect is filed at `260911-1747_*_the-migration-wrote-a-conflict-relation-into-depends-on-and-nobody-confirmed-it.md`.

**Nothing executes over the field.** Grepped over `hooks/lib/` and `hooks/lib/__tests__/`: no module and no test reads `**Depends-on:**`. Its only reader at HEAD is `skills/archive/SKILL.md`, twice, and both readings are prose instructions to a model rather than code.

### F2. The relation-type record

**The finding the plan asked me to test holds.** Its option 2 proposes two verbs, `requires` and `informs`, with "every citation in the section" carrying one of the two. There is no section, and the field that replaced it has no verb slot. `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` specifies the head line as `**Depends-on:** <basename>, <basename>` and states in prose that the field "is a comma-separated list of item basenames (`YYMMDD-HHMM-<slug>.md`, the same form a citation of the item takes)". The carrier option 2 was written for, read at `76d833be^`, was free prose: "List of other Circle directory names this Circle depends on. Playmaker flags cycles here. Also the place to cite artifacts from other Circles that bind this one." A second, independent foreclosure sits in `skills/migrate/SKILL.md:157`, whose conversion rule is "Drop `(none)`, drop prose": a verb written by hand into a converted record would be discarded at conversion.

Option 3 fails on the same carrier, and worse. Of its five names, two already have homes the record's own constraints forbid duplicating (`supersedes` is a decision marker move, `derives-from` is `**Cross-references:**` on a decision record), and its motivating case, `competes-with`, is the live defect in F1 rather than a relation waiting for a name.

Option 1 survives, and only its half about the named verb needs re-grounding: the field's name is the verb, and what has to move is where that is *stated*. `rules/fusion-workbench-conventions.md` already carries half of the record's ask, "It carries only edges the user has confirmed", which is a confirmation constraint and not a relation type. The corpus is the proof that a field name is not a rule: one value exists in the store and it asserts a conflict.

**A related gap the answer will meet.** The work-item template names exactly five head fields (`**Domain:**`, `**Status:**`, `**Claim:**`, `**Depends-on:**`, `**Filed by:**`), and `**Cross-references:**` is not among them, while the Origin Rule's second corollary in the same file tells a writer that "the later item references it by basename in its `**Depends-on:**` or `**Cross-references:**` header". Under the narrow reading that sentence is about decision records and is merely loose; under the plain reading a work item has a field its own template does not define. Either way there is no established head-field home on a work item for a citation that is not an ordering edge, which is the thing option 2's `informs` half was for. Filed as an issue (see `## Filed Issues`).

**The live question.** *What does an entry in `**Depends-on:**` assert, and where is that stated?*

| Option | Writable today | Cost |
|---|---|---|
| **1a. One relation, fixed by rule at the field's definition.** An entry names an item that must reach a finished state before this item may start. Everything else stays body prose and is read by nothing. | Yes | One sentence in `rules/fusion-workbench-conventions.md`, on the tightest dispatch path. This is the plan's step B1 as written. |
| **1b. One relation, plus a second head field for the non-blocking citation.** `**Cross-references:**` becomes a defined work-item field; `informs` is expressed by which field the basename sits in, not by a verb. | Yes, as a grammar change | The template, `/fusion:memo`'s filing block and `/fusion:migrate`'s conversion rule each gain the field. Resolves the F2 gap above as a side effect. |
| **1c. A verb token inside the field value** (`requires <basename>`, `informs <basename>`). | Yes, as a grammar change | The field's grammar, both parse sites in `skills/archive/SKILL.md` (the walk at line 146 and the clause at 143), and `/fusion:migrate`'s conversion. Nothing would read the second verb, which is the objection option 3 already carries. |
| **1d. Nothing is stated; the field's name is taken as sufficient.** | Yes, by doing nothing | The status quo, and its cost is measured rather than hypothetical: the one value in the store is a relation the field's own rule excludes. |

Options 2 and 3 as filed are not writable against any carrier the tree has.

### F3. The template record

**What the work-item grammar has already foreclosed.** Two of the three options, and most of the third.

Option 2 partitions on two node kinds, "mandated on Circle records, permitted on backlog entries". One node kind exists. `rules/circle-records.md` went at `76d833be` and nothing replaced the coarse kind, so option 2 has no subject.

Option 3 requires `(none)` as "the required empty case", and `(none)` is unwritable on three shipped surfaces at once:

- `rules/fusion-workbench-conventions.md` `## Backlog entries — work items`: "`**Claim:**` and `**Depends-on:**` are **absent** when there is nothing to say, never present and empty."
- `skills/memo/SKILL.md:127`: "**absent** at filing, never present and empty."
- `skills/migrate/SKILL.md:157`: "Drop `(none)` ... The field is **absent** when nothing survives, never present and empty."

The record's own constraint says any answer names one literal and one only. The tree's one literal is absence, and absence is not a literal a presence lint can read, which is what option 3's "checkable by one lint" turned on.

Option 1 is not a choice the user still has to make. It is what the tree does: the field is optional and absent means nothing stated, landed at `76d833be` and never recorded. The record's stated con stands with it, that an absent field and a genuinely prerequisite-free item are indistinguishable, so the readiness figure is optimistic by construction and no reader can tell by how much. The record's other constraint is also satisfiable only in one direction now: "a mandate is worth nothing without something that executes it at the moment of the act", and F1 established that nothing executes over the field at all.

**The live question.** *The field has been permitted and absent-when-empty since `76d833be`. Is that ratified, and if so does the filing act ask?*

| Option | Writable today | Cost |
|---|---|---|
| **2a. Ratify as it stands.** Absent means no stated prerequisite; the helper's report says on its own output that absence is not a claim of independence. | Yes | No shipped surface changes. The record's con stands: readiness cannot distinguish "no prerequisites" from "nobody looked". |
| **2b. Ratify the field, mandate the act.** The field stays optional; `/fusion:memo` asks once, at filing, whether the item has a prerequisite, and writes the field only on a yes. | Yes | Bytes on the `skills/` surface, and one more question at filing, against that store's own stated bound that an item more expensive to write than a note is an item nobody writes. This is the record's constraint about the moment of the act, satisfied at the one place the act happens. |
| **2c. Overturn absent-never-empty and mandate the field with a written empty literal.** | Yes, as a three-surface change | The conventions, `/fusion:memo` and `/fusion:migrate` all change; every consuming project pays on the next release; and the mandate has no enforcer until a lint is written, which no hook test does today. |

### F4. The closed-prerequisite record

Both `**Cross-references:**` pointers that carry its argument, `agents/playmaker.md:130` and `:138`, name a file deleted at `2a785ba2`, and its third pointer names `rules/circle-records.md` `### Worked transitions`, deleted at `76d833be`. Nothing in the tree now holds the two conflicting readings the record was filed to reconcile.

**The three target states, restated.** The record distinguishes live, terminal in place, and terminal under `archive/`. In the current vocabulary an entry's target falls in exactly one of five places:

| | Target | Present in the corpus |
|---|---|---|
| T1 | A container under `circles/` whose record carries `open` or `claimed` | Yes: the one edge points here |
| T2 | A container under `circles/` whose record carries `done` or `dropped` | No |
| T3 | A container moved to `archive/<sweep>/circles/<container>/` | No work item; the layout is verified at `archive/260817-1907-safe-cleanup-scoped/circles` and `archive/260828-0043-safe-cleanup-tier-1/circles` |
| T4 | A container under `circles/` holding a terminal `_<m>_circle.md` and no item record | 24 such containers exist; no entry names one |
| T5 | Nothing that exists anywhere | No |

T4 is the fifth place and the record does not have it, because it predates the node-set definition. `ITEM_RECORD_RE` does not match `_<m>_circle.md`, so an entry naming one of those 24 containers resolves to a directory that exists and to no node.

**A consequence that changes what the record's option 1 means.** Under the resolution rule the plan adopts, an entry resolves by lookup in the node map built from `circles/`, deliberately not through `createScanner()`. T3, T4 and T5 then receive the same treatment, the already-ruled one: report the entry by name, keep the node, drop the edge. So option 1's clause "archived is satisfied" is not implementable alongside that resolution rule. Making it true requires the node map to read `archive/**/circles/` as a second root, which is a separate choice the record does not surface. Option 1 as filed is internally inconsistent against the tree, and separating its two halves is what makes it choosable again.

**The record's case split is incomplete for the corpus it now faces.** All three options speak about the *target* of an edge. None says whether a `done` or `dropped` item is a node at all, with its outgoing edges. The store's only edge runs from a `done` dependent to a `claimed` target, so none of the three options decides the one edge that exists. The plan's gate question (c) asks the dependent-side question; the record does not carry it, and answering the record as filed would leave the live case undecided.

**The argument that killed option 3 no longer holds in the form it was made.** The record reads "22 of 23 records are terminal, so a graph that drops them is the empty graph". Terminal Circle records are now outside the node set by construction, so that count is about T4 and not about the option. Re-taken at HEAD, the node set is 2 items of which 1 is `done`: option 3 leaves 1 node and 0 edges. The conclusion survives in weakened form and on different evidence.

**The archive asymmetry, and whether it bears.** Verified. `skills/archive/SKILL.md` safety filter 2 excludes "any item another live item names in its `**Depends-on:**` field", and the walk that collects those names at line 146 filters `case "$st" in open|claimed)`. A `done` item's entries are never collected, so a `done` item's prerequisite is archivable and a live item's is not.

It bears, and it bears on the dependent side rather than the target side. If a terminal dependent's edges stay inside the graph, archiving such an edge's target converts a readable edge into a permanent reported dangle that nobody may repair, because the carrying record is terminal and `## Terminal states are history` forbids the header edit unless `260911-1747_*_may-a-done-work-items-head-field-be-edited-at-all-and-under-what-bound.md` rules otherwise; the repair would be one added clause in filter 2, and it is not written. If a terminal dependent's edges are outside the graph, nothing reads those entries and the asymmetry is correct exactly as it stands. So the asymmetry is not independent evidence about T2 or T3. It is evidence that the dependent-side question has to be answered first, and it prices one of that question's two answers.

**The live question, split into the three it actually contains.** The split is disjoint and complete over the five target places above, and (c) is asked first because it bounds the other two.

**(c) The dependent side.** *Does an item whose `**Status:**` is `done` or `dropped` enter the node set, carrying its outgoing edges?*

| Option | Consequence |
|---|---|
| **3c-i. Yes.** Terminal items are nodes; their edges are read. | The store's one edge is in the graph, so `260911-1747_*_may-a-done-work-items-head-field-be-edited-at-all-and-under-what-bound.md` must be answered in the same pass or the helper reports an unasserted prerequisite on every run. `skills/archive/SKILL.md` filter 2 needs the clause that protects a terminal dependent's target. |
| **3c-ii. No.** Only `open` and `claimed` items are nodes. | The store's one edge leaves the graph and the migration defect leaves with it; the archive asymmetry is correct as written and needs no clause. Depth and blocking counts then measure unfinished work only, which is the blindness-to-history objection the record raised against its own option 3. |

**(a) The target side, asked under 3c-i.** *An entry resolving to a node whose status is `done` or `dropped`: satisfied edge, or node out of the graph?*

| Option | Consequence |
|---|---|
| **3a-i. Satisfied.** Closure is closure; readiness reads the edge as met, and depth and blocking count include it. | Record 3's option 1, target half, and it needs no other change. A node whose whole chain is finished then scores differently from one that never had a chain. |
| **3a-ii. Out of the graph.** Only a live target is an edge. | Record 3's option 3, target half. At HEAD it leaves 0 edges either way, so the choice is about future corpora rather than this one. |

**(b) The resolution side.** *Does the node map read `archive/**/circles/`?*

| Option | Consequence |
|---|---|
| **3b-i. No.** An archived target is a dangle: reported by name, node kept, edge dropped, identically to T4 and T5. | What the plan's step C1 already specifies; costs nothing. Record 3's option 1 is then implemented only in its T2 half. |
| **3b-ii. Yes, read-only.** An archived container is a node carrying its recorded status, so an archived `done` target reads as satisfied under 3a-i. | Implements option 1 in full. Costs a second scan root and raises a question the record does not ask: whether archived items appear in the topological order and in the counts, or only as edge targets. |

Record 3's option 2, "archived is reported and neither satisfied nor blocking", has no distinct case left. Its subject was the archived target, which is now T3 and is decided by (b); its cost, a node permanently neither ready nor blocked, is what 3b-i produces as a dangle report rather than as a third readiness state.

## Implications

The four questions the plan's gate puts together are not four independent questions, and the coupling is tighter than the plan's ordering shows. Question (c) above, the dependent side, decides whether the store holds any edge at all for the other questions to be about. Under 3c-ii the migration defect record becomes moot rather than answered, the terminal-header question loses its subject, and the archive asymmetry needs no repair. Under 3c-i all three become live at once and two of them require changes the plan does not carry: a clause in `skills/archive/SKILL.md` filter 2, and an answer to the terminal-header question before any figure is computed.

The template record is ratification rather than choice. Its option 1 landed in the tree on 2026-09-10 without a record, so the user's act is to confirm or reverse an implemented state, and the honest framing at the gate says so rather than presenting three fresh options.

The relation-type record is the only one of the three whose recommended option survives re-grounding. Its recommendation was option 2, and option 2 is the one with no carrier; the option it argued down, option 1, is the only one that needs no grammar change. The re-grounded choice is therefore between the plan's step B1 as written (1a) and a grammar change the plan does not budget for (1b or 1c).

Across all three, the pattern is the same: the removal did not answer these questions, it removed the carriers the answers were shaped for. Two of the three records would, if put to the user as written, ask him to choose between options whose subjects no longer exist, and the third would ask him to decide something the tree decided for him a day later.

## Recommendations

1. **Put the three restated questions to the user in the order (c), then (a) and (b), then the relation-type question, then the template question.** Question (c) bounds the other four, and the plan's own stopping clause turns on the pair (c) and the terminal-header question colliding.
2. **Present the template record as ratify-or-reverse**, naming the commit that implemented option 1 and the con that comes with it, rather than as three open options.
3. **Present the relation-type question with 1a marked as the option the plan is costed against**, and 1b or 1c named as grammar changes that would move steps B1 and B3 and add a surface to each.
4. **Do not answer record 3 as filed.** Its option 1 cannot be implemented as one answer, and none of its three options reaches the only edge in the store. The three-part split above is what a user can answer.
5. **Whoever holds the transition writes it**, per `## Inline State Tracking`. This report transitions nothing.

Routing: the gate is the orchestrator's to proxy; steps B1, B3 and C1 of the plan are `coder`'s and B2 is `ontocoder`'s, unchanged.

## Filed Issues

- `260911-1916_o_the-origin-rule-names-a-work-item-cross-references-header-the-item-template-does-not-define.md` — the Origin Rule's second corollary tells a writer to cite a binding record in a work item's `**Depends-on:**` or `**Cross-references:**` header, and the work-item template in the same file defines five fields, none of them `**Cross-references:**`. It bears on option 1b above, which would give the non-blocking citation a home.

## Sources

- `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` (the template block, the four-value status table, the comma-separated-basenames sentence, the absent-never-empty sentence), `## Terminal states are history`, `## Origin Rule (Herkunftsregel)` corollary 2, `## Decision Record Template`, `## Record filing`
- `skills/archive/SKILL.md`, safety filter 2 last clause (line 78), the dependency walk (lines 143 and 146)
- `skills/migrate/SKILL.md`, the `**Depends-on:**` conversion bullet (line 157)
- `skills/memo/SKILL.md` line 127
- `docs/working-model.md`, the item head-field example and the `**Depends-on:**` paragraph
- `hooks/lib/citation-corpus.ts:133` (`ITEM_RECORD_RE`)
- `260908-2018-prerequisites-confirmed-once-order-computed.md` and `260909-1700-cut-fusion-to-working-minimum.md`, the two work-item records
- `260911-1528_*_spec-prerequisites-confirmed-once-order-computed.md` finding 6, carried forward here
- `260911-1833_*_implementation-prerequisites-confirmed-once-order-computed.md`, step A1 and `## Where this work stops`
- `260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md` (answered option 3, with its 260910-2020 reconciliation note)
- `260911-1747_*_may-a-done-work-items-head-field-be-edited-at-all-and-under-what-bound.md`
- `260911-1747_*_the-migration-wrote-a-conflict-relation-into-depends-on-and-nobody-confirmed-it.md`
- `git show 76d833be^:rules/circle-records.md` (the deleted `## Dependencies` specification and terminal-states statement)
- Commits `76d833be` and `2a785ba2`, both 2026-09-10

## Open Questions

- [ ] Whether the Origin Rule sentence naming a work item's `**Cross-references:**` header is loose wording or a missing field. Filed as the issue above; the user's answer to option 1b settles it either way.
- [ ] Under 3b-ii only: whether an archived item appears in the topological order and the counts, or only as an edge target. Not filed, because the question arises only if that option is chosen.
