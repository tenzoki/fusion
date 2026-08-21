# Briefing: does the rule change shorten a reply?

**Date:** 2026-08-22
**For:** a fresh session, started against this briefing
**Status:** ready to dispatch

---

## What this is for

Circle `260821-1042-reply-bounded-whole-question-answered` rewrote the style rules every agent
reads. Nothing enforces them, and nobody has measured whether a reply changed. This briefing
defines that measurement so a later session can run it without re-deciding anything.

**Read this before starting anywhere else**, because the largest part of the before-state is
already measured and must not be commissioned again.

## What already exists — do not redo it

`analyses/260821-2020-reply-length-baseline.md` in this Circle holds the frozen before-state,
with the command that produced every figure. It carries:

- The definition of a user-facing reply: an `assistant` record, not a sidechain, carrying a `text`
  content block; its length is the newline count of that block.
- The runnable `jq | awk` pipeline, with three load-bearing details explained (`LC_ALL=C`, the
  string timestamp comparison, the `?` on the content array).
- **2 236 blocks, 400 over the twelve-line cap, 17.9 per cent; 856 multiline blocks with the same
  400, so 46.7 per cent.**
- The full frequency table, mean 5.9, median 1, p75 9, p90 18, p95 23, p99 35, maximum 154.
- The corpus split: 1 380 blocks are exactly one line, none is exactly two. One-line narration
  between tool calls and paragraph prose, with no intermediate form.
- What each figure licenses and what it does not, calibrated per figure.

**That report is the before-state.** Extend it; do not re-measure it.

## The contamination rule, stated once

The measurement protocol at
`circles/260820-2051-style-rules-arrive-and-get-measured/analyses/260820-2354-prose-register-measurement-protocol.md`
excludes any session primed on the subject being measured. Every session in the Circle above was
primed, including the one that wrote this briefing.

**It cuts one way only.** A session that measures a historical corpus is not in that corpus, so a
primed session may run every before-measurement below today. What a primed session may not do is
contribute its own replies to the after-state.

**How to tell an unprimed session mechanically.** Its transcript mentions neither the Circle
directory name, nor `user-facing-output`, nor `chat-voice`, nor the words for reply length in
either project language. A `grep -l` over the transcript files is the test; write the exact
pattern into the report so the next run uses the same one.

## The cut-off

The rules reached their final state in three commits on 2026-08-21:

| Commit | Time | What landed |
|---|---|---|
| `9aa8ecf` | 21:53:42+02:00 | the rule file, first pass |
| `a5e2cc5` | 23:11:27+02:00 | the fourth route and the two reach clauses |
| `1daf063` | 23:11:46+02:00 | AI04 in the four profiles |

**Use `2026-08-21T21:11:46Z` as the after-boundary** — the last of the three, in UTC, matching the
timestamp format the transcripts carry. A reply written before it was produced under the old rules
even if its session continued afterwards.

## What to measure now, on the existing corpus

Three before-measurements the baseline does not carry. Each is runnable today by a primed session.

### 1. Filed records per session

**The strongest evidence available, because it lives outside the transcripts.** The new clause says
what an agent noticed on the way is filed and named in one line, rather than carried in the reply.
If it works, records per session rises while reply length falls. If records stay flat and replies
shorten, material is being dropped rather than filed, which is a different outcome and worth
knowing.

Count records filed per session from the workbench stores, keyed by the filename stamp, against
sessions identified from `orchestrator-events.jsonl`. Both stores, Circle and shared.

### 2. Enumeration density

AI04's subject, and the entry was rewritten twice in one day, so it deserves its own figure. Count
list blocks per reply block over the same corpus the baseline defines. State plainly what this
measures: the presence of a list, not whether the list was earned. A reply may satisfy any count
and still enumerate for rhythm.

### 3. Em-dash rate over the transcripts

`bin/fusion-prose-metric` exists and has never been run over a transcript, only over shipped files.
It counts prose em-dashes against a rate per 1000 words and excludes fenced blocks, code spans and
block quotes. Adapt it or state why the transcript form defeats it.

**Note before you rely on it: it is missing from the installed plugin copy** at
`$FUSION_PLUGIN_ROOT/bin/`. A reviewer hit this on 2026-08-21 and used the work-tree copy. In a
consuming project the tool is simply absent, which is worth a defect record if none exists.

## What cannot be measured, and say so rather than approximating

**Whether the reply answered the question that was asked** is the second half of the Circle's
Directive and is not mechanically decidable. The judgement needs the user's message and the reply
together, and the workbench stores no chat reply at all. A sampled human or rubric judgement is
possible and is a different instrument with a different cost; propose it if you think it is worth
running, but do not substitute a proxy and call it the answer.

## The after-measurement

**Do not run it yet.** Define it fully, so that running it later is mechanical:

- The same pipeline as the baseline, with the cut-off above as a lower bound instead of an upper.
- Restricted to sessions the contamination grep marks as unprimed.
- Reported against the same figures the baseline carries, so the two are comparable line by line.
- **State how many unprimed sessions the comparison needs** before its difference means anything
  rather than noise. That number is a judgement about the spread in the before-distribution, and
  making it now is the point of defining this in advance.

## Constraints

- **Build no gate and add no test.** `shared/decisions/260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
  authorises none until its own measurement runs. This briefing commissions measurement, not
  enforcement.
- **Add nothing to `bin/`.** Commands go in the report, as the baseline did.
- **Four growth bounds are tight**: `skills/` 30 bytes, `agents/` 1 638 bytes, the always-on rule
  set about 2 500, the hook test suite 15 lines. Measurement writes to the workbench, which is in
  none of them, so this should cost nothing. If a step would write to a bounded surface, stop.
- **Change no rule and no profile.** If a measurement suggests a rule is wrong, that is a filed
  record, not an edit.

## What a good outcome looks like

A report that a later session can act on without re-reading this one: the three new before-figures
with their commands, the after-measurement defined precisely enough to run unattended, the
unprimed-session count stated, and an honest line on what none of it can show.

**A null result is a result.** If replies did not shorten, that is the finding the Circle could not
produce, and it is more valuable than a favourable number nobody can reproduce.
