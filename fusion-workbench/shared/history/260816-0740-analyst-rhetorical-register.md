# Analyst — the rhetorical register of agent output, and the missing decision in gate prompts

**Status:** Complete
**Agent:** analyst
**Date:** 2026-08-16 07:40
**Requested by:** user (top-level, interactive)

## What was asked

Name the rhetorical figures in a 231-word sample of German orchestrator chat output,
extending a short list the user had made, and answer the operative question: how does the
output become more concise and more factual. The user added a third question mid-run, and it
turned out to be the one that blocks him: the agents' queries to the user are florid and
cryptic at once, and the decisive information is absent. His phrasing, *"was ist grau und was
verschwindet"*.

## What was done

Read-only throughout. No code, data, prompt or rule file was modified.

Measured, rather than asserted, at HEAD `787010f`: em-dash density across the twelve most
recent history files, four review files, four analysis reports, the four shipped prompt and
rule surfaces, `CLAUDE.md`, and the hook test suite. Counted correctio surface forms across
the same corpus. Checked the shipped-versus-loaded stylometric profiles for divergence.
Verified that no test under `hooks/lib/__tests__/` measures a prose property.

Thirteen figures inventoried with their linguistic names, each quoted from the sample.
Rewrote the sample twice: once as a status report, once as a gate prompt carrying the decision
the original omits.

## What was found

**One paste observation.** The block the user labelled as the existing analysis is the same
text as the input block. No prior analysis text was recoverable, so the inventory was supplied
in full rather than extended. Noted as an assumption in the report.

**Two independent faults, two different fixes.**

The register is transferred by imitation, not chosen. The always-on context every agent reads
at dispatch runs at 16.3 em-dashes per 1000 words against a stated ceiling of 1, and
`rules/user-facing-output.md`, which states that ceiling at line 128, runs at 14.8 and opens
at line 5 with the banned figure. The register has reached surfaces no profile governs: 8.4
percent of 661 defect filenames carry an anaphoric "still", and the hook test suite carries
769 em-dashes.

The gate prompts omit the decision. The sample is *narratio* without *propositio*: it recounts
what happened and never states what is at stake. Two decisions are latent in it and neither is
surfaced as a choice. `rules/user-facing-output.md` `## Questions and gates` requires the
question to be self-contained, the options plain, the default marked, and never requires an
option to state what it forecloses. The `AskUserQuestion` option `description` field is
specified to carry exactly that and is not referenced by the rule.

The two are independent: removing every em-dash from the sample leaves it exactly as
undecidable.

**Enforcement gap.** 41 test files, all structural, none measuring prose. The style rules are
the only ungated normative surface in a project that gates almost everything else.

**Demonstration.** The sample rewritten holds every fact at 150 words against 231, zero
em-dashes against five, six rendered lines against about twenty.

## Artifacts written

- `260816-0740-rhetorical-register-of-agent-output.md`
- `260816-0740_*_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md`
- `260816-0740_*_the-gate-contract-never-requires-an-option-to-state-what-it-forecloses.md`
- `260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`

## Calibration

The measurements are verified and each is given with the command that produced it. The causal
claim, that the corpus transmits the register by imitation, is an **inference** from three
consistent observations and is labelled as such in the report. The falsifying test is named in
recommendation 4 and cannot run until the corpus is repunctuated.

## Cross-references, not duplicated

`260706-1902-user-facing-agents-garbled-language-rootcause.md` found a
different cause for the same complaint, a routing fault since fixed. This analysis finds
correct routing to a profile whose surrounding corpus contradicts it. The two do not overlap.
`shared/issues/260814-1419_o_*`, the stale loaded chat profile, was verified still divergent
and shown not to be the cause of the sample's faults.
