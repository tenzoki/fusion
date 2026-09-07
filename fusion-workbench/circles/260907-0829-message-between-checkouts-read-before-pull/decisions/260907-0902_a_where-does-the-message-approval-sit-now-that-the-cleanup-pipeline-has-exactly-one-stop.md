# Where does the message approval sit, now that the cleanup pipeline has exactly one stop?

---
**Domain:** code
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`260907-0840-spec-review-message-between-checkouts.md` `### 2. The write step collides with the pipeline's one-gate property`, the analysis this record was filed from;
`260827-1311_*_where-in-the-cleanup-pipeline-does-the-one-gate-stand.md`, the record that put the one stop last;
`skills/cleanup/SKILL.md` `## Autonomy and safety` and `## Step 6`, the pipeline half;
the Circle record `260907-0829-message-between-checkouts-read-before-pull`, whose Directive says only "at the gate"

---

## Question

The Directive says nothing is written unless the user approves the draft "at the gate". The
pipeline it writes into holds the user exactly once, at Step 6, and holds them there last on
purpose: `skills/cleanup/SKILL.md` `## Autonomy and safety` promises that a run typed and
walked away from completes everything but that one answer. The Directive's phrasing reads as
though the gate were already decided. It is not, and the three readings differ in what a user
sees and in what two documented flags do to the message.

It must be answered before planning, because it decides where the write step sits in the
pipeline, whether the message survives `--skip claude-md`, and what `--dry-run` produces.

## Options

1. **Folded into the existing Step 6 question.** The message draft is put to the user in the
   same stop that carries the `CLAUDE.md` ledger.
   - Pros: the pipeline keeps exactly one stop and the walk-away property from
     `260827-1311_*_where-in-the-cleanup-pipeline-does-the-one-gate-stand.md` survives intact.
     No new gate mechanism, no second `AskUserQuestion`.
   - Cons: `--skip claude-md`, documented as running gateless end to end, takes the message
     with it, so a run that skips the ledger silently leaves no message. `--dry-run` stops
     after the curator's survey, so the draft is never put. The stop now carries two unrelated
     subjects, against `rules/user-facing-output.md` `## Questions and gates`, whose cap is
     three options.
2. **A second stop of its own, immediately before Step 7.** The message draft gets its own
   question after the ledger is answered.
   - Pros: the message is independent of the `CLAUDE.md` flags, so `--skip claude-md` and
     `--dry-run` behave for it as they would for any other step. One subject per question.
   - Cons: the user answers twice, which is precisely the property
     `260827-1311_*_where-in-the-cleanup-pipeline-does-the-one-gate-stand.md` was filed to
     remove. A run left alone now stalls at a second question nobody is there to answer.
3. **No approval: the entry is written whenever the run has something to say.**
   - Pros: nothing stalls, and the pipeline stays as unattended as it is today.
   - Cons: contradicts the Directive's own reason for the gate, that a store filling on every
     run regardless of whether anything happened trains both people to stop reading it.

## Constraints

- The pipeline may not gain a stop that a walked-away run hits after the ledger has been
  answered. That is what the binding record above forbids.
- Whatever is chosen must state what `--skip claude-md` and `--dry-run` do to the message, in
  the skill body rather than being left to be discovered.
- The stop's option text is bound by `rules/user-facing-output.md` `## Questions and gates` and
  `## Length`: at most three options, at most eight lines total.

## Recommendation

Option 1. The walk-away property is the stronger commitment, and it is the one with a record
under it; the two flag consequences are statable in a sentence each, where a second stop is
not repairable by documentation.

---
**Ruled by the user on 2026-09-07, in chat: option 1, folded into the existing Step 6
question.** The marker stays `_o_` because only an orchestrator session may move it to `_a_`
(`260905-1042_*_may-a-dispatched-agent-perform-the-open-to-answered-transition-at-all-and-under-which-bound.md`),
and the analyst filing this record is not one. The relay is owed to the next such session.

**Two consequences the ruling accepts, and the skill body must say both aloud.** A run with
`--skip claude-md` writes no message at all, silently, unless the body carries a line telling
the user so. Under `--dry-run` the draft is never put and no entry is written, which is the
same shape every other step takes under that flag.

---
Answered: `260907-0902_*_where-does-the-message-approval-sit-now-that-the-cleanup-pipeline-has-exactly-one-stop.md` — option 1, the approval folds into the pipeline single existing stop, accepting that a run skipping the CLAUDE.md step leaves no message and that a dry run puts no draft; ruled by user, Kai Stalmann <ks@qantr.com>
