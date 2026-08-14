# Are the "sixteen agents" claims corrected to seventeen, or restructured so the count is not written down?

---
**Domain:** code
**Status:** implemented
**Filed by:** planner
**Cross-references:** `circles/260801-1244-curator/planning/260814-0845_*_plan-curator.md` step 2 and `## Open Questions`; `circles/260801-1244-curator/planning/260814-0738_*_spec-curator.md` C2 (the derive-over-correct rule); `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`

---

## Question

Adding the `curator` agent makes the fleet seventeen prompts, which falsifies thirty-two sentences across nine files. Five of them are digit claims that `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` re-derives from the tree and asserts, so those have to match the tree whatever else is decided: "N specialized agents" in `CLAUDE.md` and `README.md`, "The N agent prompts" and "the other N-1 inherit" in `CLAUDE.md`, and "of the N prompts" in `README-agents.md`.

The remaining twenty-seven are prose that no parser reads. Seventeen sit in `hooks/lib/__tests__/rules-emission-golden.test.ts`, almost all in its doctrine comments and its cut log. The other ten are spread over `hooks/lib/__tests__/context-manifest.test.ts` (two, a comment and a test title, beside a separate `expect(AGENTS.length).toBe(16)` literal that step 2 has to change regardless), `hooks/lib/__tests__/fusion-paths.test.ts` (a test title), `rules/rule-file-provenance.md`, `rules/fusion-workbench-conventions.md`, `CLAUDE.md` (one beyond its three asserted claims), `README-agents.md` (three beyond its one), and the description field of `.claude-plugin/plugin.json`, which reads "16 project-agnostic specialized agents" in a spelling the lint's patterns do not match. In nearly all of them "sixteen" is a synonym for "every agent": "text all sixteen agents apply", "loading it into all sixteen", "emitted to the audience that actually applies it rather than to all sixteen agents".

The question must be answered before step 2 of the plan lands, because the two options produce different edits to the same lines, and re-doing one as the other is a second pass over nine files.

It is worth answering rather than settling by habit, because the project's own doctrine speaks to it. `CLAUDE.md`'s always-on-floor paragraph deliberately refuses to state a number that moves and names the command that produces it instead. The workbench row records that a hand-written tracked-file count was deleted rather than re-measured. The spec's C2 makes the same preference a rule the curator will apply to everyone else. Correcting a count by hand, in the same commit that ships an agent whose purpose is to catch hand-written counts going stale, deserves to be a decision rather than a reflex.

## Options

1. **Correct every occurrence in place: sixteen becomes seventeen.**
   - Pros: smallest diff, no rewording, no risk of changing a sentence's meaning while editing its number. Every claim stays checkable by eye against the agent directory. The five lint-derived claims need this anyway, so one option covers all thirty-two.
   - Cons: pays the same cost at every future agent addition, and the twenty-seven unparsed occurrences are exactly the class that goes stale without anything noticing, since only five of the thirty-two are asserted. This is the option whose failure mode the curator exists to detect.

2. **Correct the five lint-derived claims, and remove the figure from the twenty-seven where the sentence does not need it.** "Text all sixteen agents apply" becomes "text every agent applies"; "loading it into all sixteen" becomes "loading it into every agent".
   - Pros: retires twenty-seven stale-able claims permanently rather than refreshing them. The sentences read no worse, because the figure was carrying no information the phrase "every agent" does not. It is the project's stated preference applied to the project's own text, in the Circle that makes that preference a rule.
   - Cons: a larger diff over doctrine prose, including a test file whose comments are load-bearing history, and each rewrite is a small editorial judgement rather than a mechanical substitution. A few occurrences genuinely need a number, for instance "THIRTEEN of sixteen agents are now under RELEASE_CAP" in the cut log, which is a historical measurement of a past fleet and must not be touched at all.

3. **Correct the five, extend the lint to parse the twenty-seven, and correct those too.**
   - Pros: every claim becomes asserted, so none can go stale again while still being written down.
   - Cons: the enumeration lint's own header rules this out by name. It excludes spelled-out word numbers in code comments because pairing each word-number with the set it derives from needs context a regex does not have, and it excludes prose lists with no parseable shape. Building that parser is unscoped work sitting on this Circle's critical path, and the lint's authors already judged the trade against it.

## Constraints

- The five lint-derived digit claims must equal the tree under every option. They are not in question; only the twenty-seven are.
- Historical measurements must not be edited under any option. The cut log in `hooks/lib/__tests__/rules-emission-golden.test.ts` records what past fleets weighed, and "THIRTEEN of sixteen agents" is a fact about 2026-08-05, not a claim about today.
- Two of the affected files, `rules/fusion-workbench-conventions.md` and `CLAUDE.md`, are read on every dispatch or every session. Either option changes their byte size, which moves the arming baseline for the growth bound. Plan step 5 already runs last for this reason, so the answer here does not constrain the ordering.
- Whatever is chosen has to be a single pass. Landing option 1 and later re-doing it as option 2 is the two-pass outcome this record exists to prevent.

## Recommendation

Option 2.

The argument is not that the diff is nicer. It is that twenty-seven of these thirty-two claims are unasserted, so they are the ones that will be wrong the next time an agent is added, and the project has twice concluded in writing that a figure nothing checks should not be written down. Removing the number is the cheaper answer over the life of the file, and it is the answer the curator will propose the first time it reads these same sentences.

The residual is small and bounded: a handful of occurrences carry a real measurement rather than a synonym for "every agent", and those stay exactly as they are. Distinguishing the two takes reading each line, which is the editorial cost the option's Cons name honestly.

Confidence, labelled per `rules/critical-stance.md`: the counts are verified, obtained by `grep` over the nine files on 2026-08-14. The claim that the five lint-derived sites are the only asserted ones is verified against the `CLAIMS` array in `derivable-enumerations-lint.test.ts`. The judgement that removing the figure reads no worse is the filing agent's editorial opinion and is not measured.

---
Answered: shared/history/260813-2345-orchestrator-session.md § User decisions recorded this session, item 6 — option 2. The five lint-derived digit claims are corrected to the tree; in the twenty-seven unasserted occurrences the figure is removed where the sentence does not need it, so "all sixteen agents" becomes "every agent". Historical measurements in the cut log are not touched. Answered by the user on 2026-08-14 at the plan gate.
Implemented: 6ba9d77 — the five lint-derived digit claims now equal the tree at seventeen; in the twenty-seven no parser reads, the figure is removed where the sentence carried it as a synonym for "every agent". Historical measurements in the cut log of rules-emission-golden.test.ts are untouched, as the record's constraints require.
Deferred:
Superseded by:
