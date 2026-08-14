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
