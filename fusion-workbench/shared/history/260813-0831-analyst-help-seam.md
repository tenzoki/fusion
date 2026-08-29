# Analyst session — the seam between a measured answer and a cited one

**Date:** 2026-08-13 08:31
**Agent:** analyst
**Domain:** code
**Dispatched by:** orchestrator
**Status:** Complete

## Task

Answer the open sub-question in decision `260813-0826_*_should-fusion-help-become-a-self-knowledge-skill-that-answers-from-the-live-installation.md`: where the seam falls between a question answerable by measuring the installation and one answerable only from written prose. Test the split against `rules/critical-stance.md` §4, cost the measured path, check the record's premise, and survey prior art.

## What was done

1. Read the decision record and its companion issue `260813-0825` in full.
2. Derived 47 questions from six documentary sources: the five topics of `skills/help/SKILL.md`, the section headings of the three READMEs and the two conceptual docs, and the 17 rows of `CLAUDE.md` `## Where to look when something breaks`.
3. Classified each question and named the exact mechanism for every measured one.
4. Attacked the classification. At the question level 17 of 47 are mixed, which fails the dispatch's own yardstick; at the assertion level all 17 decompose and the middle is empty.
5. Priced the measured path against three real guarded call sites in `skills/setup/SKILL.md` and `agents/orchestrator.md`.
6. Checked the premise with `git log` timestamps, term counts and a citation-resolution pass.
7. Surveyed prior art: `bin/fusion-turn-budget`, `bin/fusion-churn-rank`, `bin/fusion-count-sources`, `bin/fusion-source-root`, and decisions `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md` and `260810-2145_*_should-a-repeated-skill-body-snippet-become-a-bin-helper-now-that-one-fact-lives-in-four-executable-copies.md`.

## Findings, in brief

- The seam is statable, but only when cut at the assertion rather than the question. A third tier is needed: text quoted from the artifact whose own behaviour it describes, which the record treats as prose.
- Three residuals survive, each with a one-sentence rule. That meets the §4 standard.
- Cost: four new guarded call sites, about 72 lines, taking the help body from 119 to roughly 191.
- Premise check: the help skill is one release behind, verified. The companion issue's `README-hooks.md` claim is a **false positive**; all 13 grep-matched lines are explicitly labelled removed history. A second, unfiled drift was found at `README-agents.md:29`, where the `coderev` row is narrower than the agent's own frontmatter.
- Prior art settles the guarded-call convention (decision `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md` part b, option 3) and already practises the third tier unnamed (`CLAUDE.md`'s entry for `bin/fusion-churn-rank`, issue `260811-1612_*_claude-md-is-the-fifth-surface-of-the-churn-rank-output-contract-and-was-left-on-the-old-one.md`).

## Output

- `260813-0831-the-seam-between-a-measured-answer-and-a-cited-one.md`

## Issues filed

None. Recommendation 2 in the report identifies actionable work but deliberately routes it as a correction to the existing issue `260813-0825` rather than a competing record.

## Notes

Read-only throughout. No code, data, ontology, prompt or configuration file was modified, and the decision record was not edited: the orchestrator performs the `_o_` to `_a_` transition citing the report.
