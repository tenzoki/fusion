# How does an answer filed at the steering session name the peer question it answers, and how does the peer remember what it set aside?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** spec `261119-1102-spec-campaign-peers-follow-the-steering-session-and-report-back.md` (C2, C3, C4, `## Open for Planner`); decision `261119-0851-how-does-a-campaign-steer-its-peers-and-get-their-results-and-questions-back.md`; analysis `261119-0737-campaign-steering-binding-handover-and-the-route-back.md`; plan `261119-1248-plan-campaign-peers-follow-the-steering-session-and-report-back.md`; open decision `261111-1200-what-does-the-user-word-source-hash-bind-when-every-closure-note-changes-the-narrative.md`

---

## Question

The spec puts a peer's question in a decision record inside the peer's own package container. It puts the user's answer in a new decision record in the shared decisions store, which cites the question. Two machine reads depend on how that citation is spelled. The steering session has to tell an answered question from an open one at the ref it fetched, so it does not put a question to the user twice. The peer has to find the answer to its own question at the ref it fetched. A third read depends on the question record: once the answer arrives, the peer has to know which step it set aside, including in a later session. The spec leaves the spelling to the planner (`## Open for Planner`, bullet 3). The spelling binds every checkout that runs 13.6.0 and any later host that reads these records, not just this plan, so it is recorded here. No codec or schema change is admitted (spec `## Out of Scope`).

## Options

1. **Fixed head lines in the two narratives, read by `bin/fusion-campaign` at the fetched ref.**
   - The answer record carries `**Answers:** <question basename>` as a head line, exactly once. Answer means: a decision record in the shared decisions store at the ref whose narrative has that line naming the question's basename.
   - The question record carries `**Asked by:** checkout <hex>, package <container>` and `**Set aside:** <what>`, where `<what>` is `<plan basename> step <n>`, `claim of <container>` or `approval: <row name>`.
   - Pros: decidable by an exact line match over files the helper already extracts from the ref, so no judgement is involved. It survives sessions because it is in records that travel by git. It needs no codec field. It reuses the `**Cross-references:**` habit, and it is the one head-label pattern the template already has.
   - Cons: these are three new head labels in narrative text, and nothing schema-checks a narrative line. A hand-edited typo makes the answer invisible to the helper. The steering session would then show the question as still open, which fails safe.
2. **Match on `**Cross-references:**` alone.** An answer is any shared decision whose cross-references name the question.
   - Pros: no new label.
   - Cons: a cross-reference does not assert an answer. Any later record that cites the question would read as its answer, so the two cases overlap and the test is not disjoint (`rules/critical-stance.md` §4).
3. **A structured reference in the record's control file.**
   - Pros: the codec could check it.
   - Cons: this is a codec or schema change, which the spec excludes. It would also need a Prior request.

## Constraints

- No agent answers a peer's question. An answer record exists only after the user chose an option in the steering session (spec C3, ruling 1(a) of `261119-0851`).
- The steering session writes nothing into a package another checkout holds (spec `## Constraints`).
- No codec or schema change (spec `## Out of Scope`).
- The test that decides "answered" is one exact equality, so it is decidable from the extracted ref.

## Recommendation

Option 1. It is the only option whose "is this question answered?" test is both disjoint and free of a schema change. Option 2 fails disjointness, and option 3 is excluded by the spec. The labels stay English in every project because they are defined in a shipped template (the campaign skill's answer step and the orchestrator's question step), as `**Decidability:**` is.

---
Answered: this record, option 1 — fixed head lines: the answer carries `**Answers:** <question basename>` exactly once; the question carries `**Asked by:**` and `**Set aside:**`; read by `bin/fusion-campaign` at the fetched ref; the user answered "2a" in chat on 2026-11-20 at plan approval; ruled by user, Kai Stalmann <ks@qantr.com>
