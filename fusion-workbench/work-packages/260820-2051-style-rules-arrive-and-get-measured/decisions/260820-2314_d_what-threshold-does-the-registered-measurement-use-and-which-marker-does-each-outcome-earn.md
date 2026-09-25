# What threshold does the registered measurement use, and which marker does each outcome earn?

---
**Domain:** code
**Filed by:** orchestrator
**Cross-references:** `260820-2249_*_spec-style-rules-arrive-and-get-measured.md`, `260820-2308-assessment-of-the-style-rules-spec.md`

---

## Question

The Circle registers a measurement protocol before the corpus repair lands, so the threshold and the
consequences must be fixed in advance. The spec's phrasing, that the post-repair rate should sit
"below the spread already present among the pre-repair files", admits four different tests: below the
minimum, below the range, below the interquartile band, below one standard deviation.

## Options

1. The spec's phrasing as written.
2. An exact restatement: below the lowest per-file rate observed in the pre-repair window, with a
   stated minimum window size.

## Answer: option 2, with a minimum of five usable files per window.

A protocol registered in advance exists to defeat a post-hoc choice of baseline. A sentence admitting
four tests does not do that, whatever its author intended.

**The marker scheme is amended too, and this is the substantive half.** The two branches are not
symmetric. A rate that does **not** fall licenses building a prose gate, and that inference is safe
whatever the confounds, because imitation did not deliver. A rate that **does** fall licenses nothing,
because every named confound pushes toward a fall. So:

- Prediction met on a usable sample: the record moves to implemented, **and its text carries the
  confounds that were not removed and the condition under which it would be superseded**. Without that
  sentence the terminal marker claims more than the observation supports.
- Prediction not met on a usable sample: the record is superseded by a new open decision carrying the
  gate question, with the number in it.
- Sample not usable: the record stays answered, gains the number and the reason, and the protocol
  states what a usable window needs.

## What this forecloses

An exact threshold cannot be renegotiated after the numbers are in. That is the point of it.

## Who answered this, and under what authority

Answered by the orchestrator during an unattended run, with the user away and no channel to ask them.
This is not the user's answer. The record stays open (`_o_`) so the user meets it as a live question.

---
Deferred: the next style-rules Circle — user 2026-08-29, triage of open decisions left in terminal Circles; no scan reaches this store any more, so the deferral is recorded by hand.
