# Does the pipeline's one stop permit a second question in the same `AskUserQuestion` call?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`260907-0902_*_where-does-the-message-approval-sit-now-that-the-cleanup-pipeline-has-exactly-one-stop.md`, the ruling this record refines rather than reopens;
`260827-1311_*_where-in-the-cleanup-pipeline-does-the-one-gate-stand.md`, the record that put the one stop last;
`skills/curate/SKILL.md` `## Step 5 — The gate`, the question the message would ride;
`rules/user-facing-output.md` `## Questions and gates` and `## Length`, the two caps that make the question unanswerable as posed;
the Circle record `260907-0829-message-between-checkouts-read-before-pull`

---

## Question

The user ruled that the message approval is "folded into the existing Step 6 question", and the
option they chose carries the words "no second `AskUserQuestion`" in its own Pros. Read as one call
carrying one question, that ruling is not buildable at the caps the same rule set imposes.

The gate is capped at eight lines including its options, and an option list is capped at three. The
message draft is capped at twenty lines. So the draft cannot appear inside the question, and the
message approval cannot become a fourth option. What is left is a choice the ruling did not have in
front of it, because the collision was found while planning against the two caps rather than while
the ruling was taken.

It must be answered before the write step is built, because it decides what the user sees at the one
moment the pipeline stops, and because the answer is a convention: any later step wanting to ride
the one stop meets exactly this question again.

## Options

1. **One call, two questions.** `AskUserQuestion` carries a `questions` array; the call holds the
   `CLAUDE.md` ledger question and the message question side by side, and the user answers both in
   one pass. The draft is printed as ordinary output immediately before the call.
   - Pros: exactly one stop, so the walk-away property from
     `260827-1311_*_where-in-the-cleanup-pipeline-does-the-one-gate-stand.md` is untouched. Each
     question keeps its own three options and its own line budget, so neither cap is strained. The
     two decisions stay independent: applying every normative change and declining the message is
     expressible, and so is the reverse. `skills/curate/SKILL.md` is not edited, so a
     `--only claude-md` run is unchanged.
   - Cons: "no second `AskUserQuestion`" is read as "no second call" rather than "no second
     question", which is a reading and not the words. One screen now carries two subjects, which
     `rules/user-facing-output.md` `## Questions and gates` does not forbid and does not bless.
2. **One call, one question, three coupled options.** The three existing options are re-labelled so
   each decides both subjects: apply everything and leave the message; choose which normative
   changes and leave the message; apply nothing and leave no message.
   - Pros: the most literal reading of the ruling, being one call, one question, three options and
     eight lines. Nothing about the gate's mechanism changes.
   - Cons: the two decisions become a cross product truncated to three cells, so declining the
     message while applying every normative change is not on offer and has to be typed as free text.
     A user who wants that is being asked to work around the gate rather than answer it, and the
     option labels stop naming one thing each.
3. **Print the draft and write it unless the user objects.** The draft is shown before the gate; the
   gate carries the ledger alone; the message is written unless the user says otherwise in the same
   reply.
   - Pros: no change to the gate at all, and the walk-away run leaves a message rather than none.
   - Cons: a write on silence, which is the one shape the Directive's own reason for a gate rules
     out: a store that fills whether or not anything happened stops being read. It also makes the
     message survive a run in which the user declined everything else.

## Constraints

- The pipeline may not gain a stop a walked-away run hits after the ledger has been answered.
- The gate's option text stays inside `rules/user-facing-output.md` `## Questions and gates` (at
  most three options) and `## Length` (at most eight lines), per question.
- Whatever is chosen must leave `skills/curate/SKILL.md` able to run alone under
  `--only claude-md`, where there is no draft to put.
- The answer is a convention, not a one-off: it is what any later step riding the one stop inherits.

## Recommendation

Option 1. It is the only one of the three that keeps both decisions independent while keeping the
count of stops at one, and the count of stops is what the binding record protects. Option 2 buys
literal compliance with a truncated cross product, which is a worse gate rather than a smaller one;
option 3 buys silence-as-consent, which the Directive already rejected on its own grounds.

If the user rules for option 2 instead, one sentence of the plan changes: the message half of Step 6
stops composing a second question and instead re-labels the ledger question's three options, and the
plan's note that the two decisions are independent is struck.

---
Answered: `260907-1659-orchestrator-session.md` `## Rulings given in this session` — option 1, the message question rides the existing call as a second question, each keeping its own three options and its own eight-line cap; the pipeline keeps one place where it waits, and "one stop" stops implying "one question"; ruled by user, Kai Stalmann <ks@qantr.com>

---
Implemented: 4c421f29 — the message half of Step 6 puts its approval as a second question inside the existing call; the draft prints as ordinary output before the gate, so the pipeline still holds the user exactly once.
