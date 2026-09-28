# Shaping session: the cross-checkout message captured as an anticipated Circle

**Status:** Complete
**Filed by:** shaper (anticipated-circle mode), Kai Stalmann <ks@qantr.com>

## What was asked

The user asked for a new Circle to be shaped in advance, with the idea already written up in
`260907-0729-git-versioned-broadcast-slot-between-checkouts.md`. That consultation carries a
settled design in six statements plus a section naming what it deliberately leaves open, so
the shaping work was not to invent a design but to close the forks the consultation named and
to write the result as a Directive.

## Context read

The consultation itself; the blocking decision record
`260907-0733_*_does-the-cross-checkout-message-get-its-own-store-or-two-sections-in-the-session-history.md`,
whose answer the user had already given in favour of a separate store; the Circle records of
`260823-0023-settle-what-travels-between-checkouts` and
`260904-1619-tracked-checkout-registry-names-each-instance`, which supply the class partition
and the checkout naming this store depends on; the workbench inventory of Circles, backlog
entries, shared decisions and shared plans, to confirm no live record already covers the same
capability. Nothing did. The draft came from a consultation file rather than a backlog entry,
so no backlog entry was promoted and none was touched.

## Decisions taken with the user

Two rounds of questions, six decisions.

1. **Retention is by age, thirty days**, through a tier added to the existing archive step,
   over a read-based rule that would have needed every checkout's read mark before an entry
   could move, and over deferring retention to a later Circle.
2. **One entry per session**, not one per push, so the two pushes `/fusion:cleanup` performs
   produce one file rather than two.
3. **The reading skill fetches, renders what arrived, and asks before pulling**, over
   reporting that a fetch is owed and over fetching and pulling in one step.
4. **The write step is reachable alone**, under its own selector, as well as inside the
   pipeline.
5. **Invoked without an argument the reading skill shows only what is new** since this
   checkout's last read, which is what makes the read mark load-bearing.
6. **The person's part is rendered in chat and the pointer block is shown on request.** The
   user asked how the agent receives the pointers at all. The answer that settled the option:
   a skill body is executed by the agent, so what it reads is in the agent's context whether
   or not it is echoed to the person, and the choice is a display choice only.

## What was produced

The anticipated Circle `260907-0829-message-between-checkouts-read-before-pull`, its record
`_a_circle.md` and its six artifact subdirectories. No spec was written: in this mode the
Circle record is the artifact. No decision record was filed, because the user answered every
question in the round rather than deferring one. No existing Circle was modified.

## What is owed and is not this Circle's work

`260907-0733_*_does-the-cross-checkout-message-get-its-own-store-or-two-sections-in-the-session-history.md`
still carries `_o_` while the user has ruled on it. Only an orchestrator session may move it
to `_a_`
(`260905-1042_*_may-a-dispatched-agent-perform-the-open-to-answered-transition-at-all-and-under-which-bound.md`),
so the relay is owed by the next such session and is recorded here rather than performed.

## Verification

`bin/fusion-paths shaper <new-dir>` was re-run immediately after the directory was created and
its values were used for every write of this run. `bin/fusion-prose-metric` was run against the
record and returned 2 em-dashes over 1520 words, above the ceiling of one per thousand; both
were rewritten and the file now carries none.
