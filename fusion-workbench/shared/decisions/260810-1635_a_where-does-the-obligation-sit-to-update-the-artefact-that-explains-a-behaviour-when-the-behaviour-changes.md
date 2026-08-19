# Where does the obligation sit to update the artefact that explains a behaviour, when the behaviour changes?

---
**Domain:** code
**Status:** open
**Filed by:** orchestrator (session `260810-1402`), on the reviewer's recommendation
**Cross-references:** `shared/reviews/260810-1632-coderev-turn-1-range-430d73a-to-head.md` (the pass that named the pattern); `shared/issues/260809-2252_*_the-tracker-noise-list-still-says-it-excludes-two-metrics-when-only-churn-reads-it.md`; `shared/issues/260809-2258_o_readme-hooks-says-fourteen-ordering-sites-and-the-commit-that-wrote-it-converted-fifteen.md`; `shared/issues/260810-1632_o_the-churn-stand-down-still-asks-cwd-and-the-comment-justifying-that-was-falsified-by-the-same-commit.md`; `shared/issues/260810-0502_*_the-state-drift-lint-anchors-on-the-phrase-it-checks-and-one-negative-control-is-a-duplicate.md`

---

## Question

A commit changes a behaviour and leaves standing the comment, README line, count or header claim that explained the old one. The explanation is now false, and it is false in the most expensive way: it reads as authoritative, it sits next to the code, and the next reader believes it over the code.

The `coderev` pass on `430d73a..HEAD` found two instances in one six-commit range and observed that this is **the third consecutive Turn in this session's project history to name the class**. It recommended a decision about where the obligation sits rather than a fifth defect record, and that recommendation is why this record exists: filing instance five would be the growing rim of special cases `rules/critical-stance.md` §2 names, arriving one instance at a time.

The instances are not one kind of artefact, which is what makes this a design question rather than a lint:

- **A comment justifying a mechanism.** `hooks/tracker.ts:770-771` states that churn is keyed on paths relativised against `process.cwd()`, which was true until line 680 of the same file stopped doing that in the same commit. The sentence carries the three-gate cwd split, so its falsity has a behavioural tail: a session started in `fusion-workbench/` records churn where one started at the repository root does not — the very "depends on where the session started" shape the commit set out to end.
- **A count in shipped documentation.** `README-hooks.md` says fourteen ordering sites; the commit that wrote the sentence converted fifteen.
- **A list that outlived one of its readers.** The tracker's noise list still claims to exclude two metrics when only churn reads it.
- **A test file's own header claim.** The state-drift lint states a design rule its four anchors do not implement.

## Options

1. **A reviewer obligation.** `coderev` and `ontorev` already read the diff; require the pass to check, for every changed behaviour, whether an artefact explaining it changed with it. Pros: it is where the two instances were actually caught, and it needs no new machinery. Cons: it catches nothing the reviewer does not reach, and this session shipped a release before its review returned — an obligation on a pass that can be outrun is worth what the pass is worth. See `shared/issues/260810-1618`.
2. **An executor obligation, stated in the agent prompts.** Every `coder` and `ontocoder` dispatch already names files; add that a behaviour change carries its explanation with it. Pros: it sits with whoever has the context. Cons: it is prompt text, and `260801-2038` measured a prompt-only fix having zero effect on the session that installed it.
3. **A gate that fails when a changed symbol's neighbouring prose is untouched.** Pros: it is mechanical, and it fires whether or not anyone looks. Cons: undecidable in the general case — "the artefact that explains this behaviour" cannot be derived from a diff, and three of this queue's open records are lint gates that match on token presence and are defeated by a decoy. Building a fourth of that shape to fix this class would be the failure `rules/critical-stance.md` §4 describes.
4. **Accept the class and pay it in review.** Keep filing instances, fix them cheaply, and treat the count as a maintenance cost rather than a defect to design out. Pros: honest about what is decidable. Cons: five instances in three Turns is a rate, not a tail.

## Constraints

- Any gate must assert on behaviour rather than on the presence of a token in prose, or it inherits the weakness already recorded against three existing lints.
- Whatever lands must not depend on a review pass that a release can outrun, unless the ordering defect in `260810-1618` is fixed first.
- The four instances are four artefact kinds. A solution covering only source comments covers one of them.

## Recommendation

None. The honest observation is that options 1 and 2 are both instructions that lose to task pressure, option 3 asks a question a diff cannot answer, and option 4 concedes. That combination is itself the signal `rules/critical-stance.md` §4 describes: when no cut is clean, the question is probably posed wrong, and the useful move is to ask which *different* question is answerable from inputs a mechanism actually has. One candidate worth exploring before choosing: rather than detecting stale prose, reduce the surface — a claim stated once and cited from the other sites cannot go stale in four places at once, which is the partition `rules/fusion-workbench-conventions.md` already applied to four of its own topics.

---
Answered: user, session 260811-0752 (chat) — **none of the four options; the question is re-cut, as
the record's own Recommendation proposes.** The obligation is not placed on a reviewer, an executor
or a gate. Instead the surface is reduced: a claim is stated once and cited from every other site,
so it cannot go stale in four places at once. This is the partition
`rules/fusion-workbench-conventions.md` already applied to four of its own topics, and it answers a
question a mechanism can actually act on (is this claim stated twice?) in place of one a diff
cannot (which artefact explains this behaviour?). `rules/critical-stance.md` §4 is the governing
rule: where no cut is clean, the mechanism changes rather than the approximation.

Consequences to realise, none of which is an instruction to be more careful: identify the claims
currently stated in more than one shipped surface, pick the authoring home for each, replace the
rest with citations, and let the existing duplication gates carry what remains. The five instances
this record counted are the working list to start from. Options 1 and 2 remain available as
supplements later, but they are not the answer and must not be recorded as one.

---
**Reconciliation evidence, 2026-08-14 21:53, at HEAD `d90b794` (reconciler, Circle
`260801-1244-curator`). A sixth instance, and one the answer would have caught. Marker unchanged at
`_a_`: the answer is recorded and not yet realised.**

`f0d9d60` changed how `fusion-guard.json` is pinned against its template and committed a key into
the repository's copy. `CLAUDE.md:30` went on describing the mechanism that commit replaced,
word for word — "the root copy here is byte-identical to the template (pinned by
`config.test.ts`)" — in a Circle whose Directive is that a project's normative surfaces match its
recorded history. It was caught by the Turn-6 `coderev` pass and repaired by `d90b794`
(`circles/260801-1244-curator/issues/260814-2128_c_claude-md-still-calls-the-root-guard-config-byte-identical-to-the-template-after-the-same-turn-made-it-false.md`).

Two things this instance adds to the five already counted, neither of which changes the answer:

1. **It is the one artefact kind option 1 was weakest on, caught by option 1 anyway.** The reviewer
   found it, on the axis "which shipped text describes the mechanism this commit changed", which
   none of the three preceding passes had asked. That does not promote option 1 — the record's own
   objection stands, that a review can be outrun — but it is worth recording that the class is
   findable when the question is asked at the commit rather than at the finding.
2. **The recorded answer would have prevented it.** The claim "the root guard config equals the
   template" was stated in `CLAUDE.md` and enforced in `hooks/lib/__tests__/config.test.ts`, which
   is a claim in two places with no citation between them. Under the answer's rule the test is the
   authoring home and `CLAUDE.md` cites it. The repair as landed does roughly that: the corrected
   row names `PROJECT_SET_KEYS` as the one constant where the exemption is declared, instead of
   restating the rule.

**Note on this record's own header.** `**Status:**` still reads `open` while the filename marker is
`_a_`. Not corrected here: it is one member of the population measured in
`shared/issues/260812-1232_o_thirty-four-of-seventy-four-decision-records-carry-a-status-header-that-contradicts-their-filename-marker.md`,
re-measured at 35 of 86 on 2026-08-14, and repairing members one at a time moves that measurement
without closing the record.

---
**Reconciliation 260819-1400 (reconciler, domain `code`, HEAD `e435f03` / `v10.3.0`) — marker
unchanged at `_a_`. This is the most-cited unrealised answer in the store, and the one whose
non-realisation costs the most.**

The answer is a programme — identify the claims stated in more than one shipped surface, pick an
authoring home for each, replace the rest with citations — and no pass has ever executed it as a
programme. What exists is the same move applied ad hoc, each time by a different session for its own
reason: `rules/fusion-workbench-conventions.md`'s header table naming the four topics partitioned
out of it; `README-agents.md` `## Dispatch parameters` as the single roster;
`rules/commit-lock.md`, `rules/circle-records.md`, `rules/rule-file-provenance.md` and
`rules/workbench-path-resolution.md` as single authoring homes; `CLAUDE.md` rows that deliberately
refuse to restate a helper's header. That is the answer working, one surface at a time, with nothing
tracking which surfaces are left.

The answer is also being *cited as settled* by later records while it is unrealised — this pass
found `260811-1522_a` resting its own choice on "the general rule adopted there", and the
`260814-2128` instance recorded above was repaired by applying it. So the rule is in force in
practice and unrealised on the books, which is the worst of the two states to plan against.

Two things this pass measured that the record should carry. `CLAUDE.md` itself now warns, in the
`templates/` and `docs/` rows, that an inventory it once held went stale twice in one day
*invisibly to both lint gates*, and instructs a reader not to restore one — that is the answer
adopted as a standing instruction on the project's largest prose surface, arrived at by the same
class of failure this record counts. And `260810-1635`'s own note above still reads
`**Status:** open` against an `_a_` filename; that is deliberate, per
`260818-2212_i_should-the-decision-records-status-field-exist-at-all-...`, which says a record
written before the field left the template keeps it.

**What binds a deep change.** Any change that states a fact on a second shipped surface is adding to
the class this record was opened on. The answer's rule — one authoring home, citations elsewhere —
is the standing rule and has no gate behind it, so it holds only for as long as each author applies
it. A deep change that touches many surfaces at once is the exact shape this record predicts will
leave stale explanations behind, and it is the single most likely way a future change breaks fusion's
documentation without breaking its tests.
