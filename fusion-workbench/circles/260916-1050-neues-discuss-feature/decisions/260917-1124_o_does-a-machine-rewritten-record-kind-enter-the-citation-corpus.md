# Does a machine-rewritten record kind enter the citation corpus?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260917-1119_*_spec-fusion-discuss-a-two-agent-discussion-loop.md`, `260917-1124_*_implementation-fusion-discuss-a-two-agent-discussion-loop.md`, `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`, `260820-0805_*_the-citation-gates-corpus-excludes-only-archive-so-a-frozen-copy-tree-would-enter-a-blocking-gate.md`, `260830-2225_*_should-an-archived-violation-move-the-checkers-verdict-line.md`

---

## Question

The `/fusion:discuss` work introduces the discussion record, and `hooks/lib/citation-corpus.ts` has to be told whether one is a live record. The answer decides whether `hooks/lib/__tests__/workbench-citation-lint.test.ts` fails the suite over a dangling citation inside one, and whether `bin/fusion-citation-check` lets such a row move its verdict.

The question has to be asked now rather than inherited, because the discussion record breaks the pattern every earlier answer rested on. `isLiveRecord` is a marker predicate. It admits `_o_` issues, `_o_` and `_a_` decisions, `_o_` and `_p_` plans, and both container-record forms; it excludes the markerless kinds by falling through, on the stated judgement that nobody edits a review, an analysis or a consultation after writing it. Every kind that carries a state marker is in the corpus, and every kind that does not is out. A later reader will take that as the rule, because so far it has been one.

The discussion record carries a marker and is not like the kinds that do. It is the first record kind that lies on disk unfinished: `--begin` writes it before the first round's result reaches the chat, every round rewrites the whole file, and `--close` finalises it. Its evidence citations are written mid-loop by a sub-agent and are on disk before any human has read them. So the property that put every other marked kind into the corpus, that a person authored the file and stopped, does not hold here, and taking the marker as the criterion would admit the kind for a reason that is not true of it.

## Options

1. **Admit the open state, exclude the closed one** — one clause for `_o_` discussions, matching what `LIVE_PLAN_RE` and `OPEN_ISSUE_RE` do for their kinds.
   - Pros: the marker rule stays uniform, so nothing has to be explained. An `_o_` discussion is a document somebody is currently acting on, which is the corpus's own stated criterion.
   - Cons: it arms a blocking gate over a file that is unfinished by construction. A consultant's imprecise evidence citation in round three turns `npm test` red for everyone in the checkout, and the remedy is to hand-repair a file that round four overwrites. The gate would be firing on a state the design requires the file to pass through, rather than on a defect somebody left behind.
2. **Keep the kind out of the corpus entirely** — no clause; `isLiveRecord` returns false for both states by falling through, with a comment naming the reason and the condition that would revisit it.
   - Pros: no blocking gate over a machine-rewritten file. The `_c_` half needs no argument at all, since a closed discussion is terminal and nobody repairs it, exactly as a `_c_` plan and a `_c_` issue are out. The `_o_` half is the mirror of the judgement the corpus file already makes about the markerless kinds: they are out because repairing them falsifies the record, and this one is out because repairing it is futile. The reporter still prints every row it finds in a discussion record, so the cost is visible to whoever runs the checker and is simply not blocking, which is the reporter-versus-verdict split `260830-2225` already established.
   - Cons: it breaks the inference that a marker means corpus membership, and nothing in the predicate's shape announces the break; a reader learns it from a comment. The dangling citations inside discussion records accumulate unchecked by any gate.
3. **Admit it and weaken the gate for this kind** — in the corpus, but reported without failing.
   - Pros: keeps the marker rule and the visibility.
   - Cons: it is option 2 with more machinery. A corpus membership that does not move the gate is not a membership; it is the reporter's scope, which every file already has. It would add a second severity axis to a predicate whose whole value is that it is one boolean over a path.

## Constraints

- The predicate is pure and takes a workbench-relative path. Any answer that needs to open the file is out.
- Whatever is chosen, it is written where the corpus's other judgements are written, in `hooks/lib/citation-corpus.ts`'s header, with the condition that would revisit it. That file is the authoring home for this predicate and its reasoning, and a second account elsewhere is the drift it exists to prevent.
- The choice binds the next record kind somebody adds, so it is stated as a criterion rather than as a fact about discussions.
- `hooks/lib/citation-scan.ts` is a separate surface and is not decided here: `discussions` joins its store alternation whatever this record answers, because that alternation governs citations *of* a discussion record written in live records, not citations inside one.

## Recommendation

Option 2, and the criterion to state is **not** "discussions are out". It is: **a record kind enters the citation corpus when a person writes it and stops. A kind that a mechanism rewrites is out, whatever marker it carries.** That reading keeps every existing clause exactly as it stands, explains the markerless exclusions the header already argues for on the same ground, and gives the next kind a test that does not require re-deriving this reasoning.

The cost worth naming plainly: dangling citations inside discussion records go uncaught by any gate, and only `bin/fusion-citation-check`'s printed rows show them. That is the same hole the corpus header already records for records that walk out of scope at a terminal transition. It is a cost of a recomputed corpus and not a defect in this answer.
