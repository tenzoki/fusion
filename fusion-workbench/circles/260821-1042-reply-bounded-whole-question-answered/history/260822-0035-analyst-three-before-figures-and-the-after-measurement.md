# Analyst: three before-figures, the after-measurement defined, and the count it needs

**Status:** Complete
**Agent:** analyst (domain `code`)
**Circle:** `circles/260821-1042-reply-bounded-whole-question-answered`
**Dispatched by:** orchestrator, against `circles/260821-1042-reply-bounded-whole-question-answered/analyses/260822-0010-measurement-briefing-does-the-rule-change-shorten-a-reply.md`
**HEAD at time of work:** `084c626`

## What this run produced

One analysis report,
`circles/260821-1042-reply-bounded-whole-question-answered/analyses/260822-0035-three-before-figures-and-the-after-measurement-defined.md`,
and two defect records.

Nothing under `rules/`, `agents/`, `skills/`, `hooks/`, `stilwerk/` or `bin/` was touched, so none
of the four growth budgets moved. No gate was built, no test was added, no rule and no profile was
changed, and nothing was added to `bin/`. No whole-tree git command was run; the only git commands
were `log`, `merge-base` and `tag`.

## The three before-figures

**Filed records per session.** 52 orchestrator sessions in the baseline window filed 854 defect and
decision records, mean 16.4, median 11, five sessions filing none. Sessions come from
`orchestrator-events.jsonl` shifted from UTC onto the local clock the filename stamps use; records
come from every `issues/` and `decisions/` directory in the workbench, the archive store included.

**Enumeration density.** 233 list blocks over 2 236 reply blocks, 0.104 per block. 22.2 per cent of
multi-line blocks carry at least one list. 77 of the 233 lists have exactly three items, 33.0 per
cent, which is the closest any figure here comes to AI04's subject without reaching it.

**Em-dash rate.** 2 029 prose em-dashes over 202 832 prose words, 10.0 per 1000, against a stated
ceiling of 1. 42.1 per cent of reply blocks carry at least one. Measured with the work-tree copy of
`bin/fusion-prose-metric` over the extracted reply corpus.

## What was found that was not asked for

**The briefing's contamination test does not work.** Applied literally, `grep -lF user-facing-output`
over the transcripts matches 49 of 72, because the `/fusion:setup` skill body names the profiles and
the rule in the prose of its Step 0d and is injected into every transcript. The sessions it leaves
unmatched are largely those that never ran an agent Setup. Section 4 of the report narrows the
surface to human prompts and agent replies, and the corrected test marks 19 of 72 primed.

**Two figures are weaker than the briefing expected.** Records per session is called the strongest
evidence there; it is the most independent and the least sensitive, with a standard deviation of
17.6 against a mean of 16.4. The em-dash rate is sharp pooled and hopeless per session, running from
0.0 to 33.3 per 1000 across sessions.

## The judgement the briefing asked to be made in advance

**Twenty unprimed sessions.** Set by reading B, the share of multi-line blocks over the cap, whose
unprimed before-value is 42.8 per cent over 428 blocks with a measured design effect of 1.56. Twenty
sessions is what a 15-point absolute fall needs at 5 per cent two-sided and 80 per cent power. A
10-point fall would need about 110 sessions, which is six weeks during which the tasks and models
change underneath the measurement. The report states what twenty sessions does not buy, per figure.

## Records filed

- `shared/issues/260822-0035_o_two-installed-copies-report-the-same-version-and-differ-in-which-bin-helpers-they-carry.md`
  — filed shared rather than in the Circle, per the Origin Rule: it was found nearby, not caused by
  this Circle's Directive.
- `circles/260821-1042-reply-bounded-whole-question-answered/issues/260822-0035_o_the-briefings-contamination-grep-marks-49-of-72-transcripts-primed-because-the-setup-skill-body-names-the-files-it-greps-for.md`
  — filed in the Circle, because the briefing is this Circle's own artifact.

## Checks run on the output

`bin/fusion-prose-metric` over the three new files returns `3 5487 0.5 5 ok`, so the report and both
records are under the em-dash ceiling they are partly about.
`npx vitest run lib/__tests__/workbench-citation-lint.test.ts` is green with the new records in the
corpus.
