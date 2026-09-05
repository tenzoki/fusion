# `## History Logging` gets a header template, so the filed-by field is copyable rather than remembered

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Task:** first branch of `260828-0044_*_thirty-four-of-sixty-two-records-filed-on-260827-carry-no-person-half-after-the-reach-was-settled.md`

## What was asked

Give `## History Logging` in `rules/fusion-workbench-conventions.md` a header template block, in the
shape the defect and decision formats already use in the same file, so an agent writing a session
history has something to copy instead of a sentence to remember. Scope was that one file. The
record's second branch — a bounded close of the multi-user spec — is the user's and was not touched.

## Root cause carried in from the analysis

`260905-2158-the-nine-open-defects-after-loop-1-and-what-loop-2-should-do.md`, entry 4: the rule
mandated `**Filed by:**` for session histories in one sentence and prescribed no template, while the
defect and decision kinds each get one. `grep -ln "Filed by" agents/*.md` names one prompt of
fifteen, `agents/shaper.md`, and `agents/coder.md` prescribes no history header at all. Every one of
the six missing September entries carries `**Agent:**` and `**Date:**` in the field's place.

## What was done

One edit, `rules/fusion-workbench-conventions.md` `## History Logging`. The prose sentence "Its
header carries `**Filed by:**` in the form `### Who filed it` defines" was replaced by a fenced
`markdown` block carrying the title line, `**Status:**` and `**Filed by:**`, followed by one line
citing `### Who filed it` for the field's rules and naming the observed substitution (`**Agent:**` in
its place) as not satisfying it. No field was invented: the two the block carries are the two the
section already mandates, and the `### Who filed it` rules are cited rather than restated.

Net cost 343 bytes on the always-on set: 57 611 → 57 954. The universal core's floor is 65 498
(`RULE_BASELINE` summed over `agent-setup.md`, `fusion-workbench-conventions.md`,
`critical-stance.md`), the core now emits 72 509, so growth is 7 011 against 12 000 of head-room and
4 989 remains. That matches the 5 332 the analysis read after loop 1, less this edit.

## Verification

`cd hooks && npx vitest run lib/__tests__/rules-emission-golden.test.ts` — exit 1, 11 of 12 passing.
The one failure is the golden fixture mismatch the dispatch predicted and told me to leave alone
(`fusion-workbench-conventions.md 57611` → `57954` for every agent); the hard growth-bound assertion
passed. The fixture is the orchestrator's to regenerate once for the whole batch. No baseline number
was edited. Nothing was staged or committed and `npm run build` was not run.

## Judgement reported rather than decided

The template makes the field copyable and removes the "remembered obligation" half of the cause, but
`inference:` it will not close the gap on its own — the analysis's coupling argument applies to this
branch as much as to `260830-2235_*`. Recommendations passed up: a two-line history header in
`agents/coder.md` and `agents/bugfixer.md` (an `agents/` growth-bound decision, not mine to take),
and the write-time detection mechanism as the answer that closes both records.
