# Planner: the implementation plan for the bounded reply

**Status:** Complete
**Agent:** planner
**Circle:** `circles/260821-1042-reply-bounded-whole-question-answered`
**Dispatched by:** the orchestrator, with `**Executors:** coder, ontocoder, analyst` and the Circle named
**HEAD at time of work:** `e764637`

## What was planned

Six steps against the Circle's Directive, with no spec in front of them. The plan is
`circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_*_plan-reply-bounded-whole-question-answered.md`.

The design converges on one idea rather than five clauses: the workbench is where material goes and
the reply is not. Both destinations already exist and are already mandatory, the issue store for a
defect noticed on the way and the history log for a session's detail, so the two rule gaps are
closed by binding the reply to mechanisms the corpus already carries instead of by adding a
mechanism. The three register habits land in the clause that already names their nearest neighbour,
which keeps the count of prohibitions where it is.

## What was measured rather than assumed

**Three routes out of the length cap, not one.** The Circle's Grounding names the Details relocation
at line 117. Reading `rules/user-facing-output.md` line by line found two more of the same kind: the
session-summary entry at line 113 caps a prefix and leaves the tail unbounded, and the sketch
sentence at line 61 exempts a block from the count in words that state no rule. All three are
closed by step 2 and the plan claims the set is complete, having read the four sections that could
carry a fourth.

**Which headings may not move.** `grep -rn "user-facing" --include='*.md' agents rules skills
CLAUDE.md README*.md | grep -o '`## [^`]*`' | sort | uniq -c` returns three headings of that file
cited from shipped text, so `hooks/lib/__tests__/reference-resolution-lint.test.ts` gates those
three. The other five are cited only from workbench records, which the workbench gate does not check
for headings. The plan keeps all eight anyway.

**The cut pool, by block.** Five duplicated blocks in `rules/user-facing-output.md` measured with
`sed -n` and `wc -c`: 639, 585, 948, 760 and 1 420 bytes, 4 352 in total. Step 5 spends them in a
stated order and is expected to spend well under the pool.

**Two budgets rather than one.** `hooks/lib/__tests__/rules-emission-golden.test.ts` excludes the
voice profiles from the always-on growth bound by construction. A single net-zero budget spanning
the rule file and the profiles would therefore be satisfiable by moving text into the unbounded
half, which is the same fault the Circle is repairing. The plan holds one budget per surface and
forbids paying either from the other.

**The profiles exist twice and agents read the workbench copy.** `bin/fusion-rules` emits
`./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`. `diff -q` over all four files confirms the
plugin tree and the workbench copy are byte-identical at HEAD, so step 4 edits both.

## Decidability, and why no gate is planned

The plan head carries it in full. The short of it: whether a block of a draft falls outside the
question asked is decidable while the agent drafts and is decidable nowhere else, because no
artifact this project stores holds both the reply and what the user would have accepted as an
answer. So the mechanism changed is the text the writer reads. That is also what
`shared/decisions/260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
requires until its registered measurement runs, and the plan states that the clauses land unenforced
rather than leaving a reader to infer it.

## Filed

One decision record, open, because the number binds every agent's session report and is not the
planner's to set:
`circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-1801_*_what-total-caps-a-session-summary-now-that-no-reply-has-an-uncapped-tail.md`.
Recommendation is option 1, a total of 25 lines with the ten-line header cap kept.

One defect, in the shared store because it arose beside the Directive rather than from it:
`shared/issues/260821-1810_*_activating-a-circle-turns-the-suite-red-because-its-own-decision-records-cite-the-anticipated-marker.md`.
`npx vitest run lib/__tests__/workbench-citation-lint.test.ts` fails at HEAD with four dangling
citations, all in this Circle's own scoping records, all broken by the activation rename and none
written badly.

## Verification

`plan-stopping-section-lint` and `marker-format-lint` pass, 28 tests. The citation gate reports the
four pre-existing failures named above and nothing from the three files written here.
`bin/fusion-prose-metric` over the plan, the decision record and the defect record: 0 prose
em-dashes over 4 932 prose words.

## Files written

- `circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_o_plan-reply-bounded-whole-question-answered.md`
- `circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-1801_o_what-total-caps-a-session-summary-now-that-no-reply-has-an-uncapped-tail.md`
- `shared/issues/260821-1810_o_activating-a-circle-turns-the-suite-red-because-its-own-decision-records-cite-the-anticipated-marker.md`
- this history file

No shipped file was touched. No agent was dispatched.
