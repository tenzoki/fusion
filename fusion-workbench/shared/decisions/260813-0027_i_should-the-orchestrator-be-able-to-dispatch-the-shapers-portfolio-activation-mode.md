# Should the orchestrator be able to dispatch the shaper's portfolio-activation mode?

---
**Domain:** code
**Status:** implemented
**Filed by:** orchestrator
**Cross-references:** circles/260805-2005-textschicht-gegen-code-nachziehen/decisions/260806-0015_*_wem-gehoert-die-circle-aktivierung.md (the binding decision that made the mode user-direct-only); circles/260801-1244-guard-rules-write/issues/260805-1839_*_der-shaper-portfolio-activation-modus-hat-keinen-erreichbaren-dispatcher-mehr.md (closed by removing the dispatcher claims); agents/shaper.md mode 3; circles/260801-1244-curator (the Circle that surfaced this)

---

## Question

The shaper's portfolio-activation mode refines an anticipated Circle's Directive and Grounding
snapshot in place before activation. It is the only sanctioned writer of those two sections, and
`agents/shaper.md` states twice — in the frontmatter description and in mode 3 — that no skill and
no agent may dispatch it: the user runs shaper directly, or the mode does not run.

That wording is deliberate. Decision `260806-0015` chose option (b) at a user gate: name the real
writer set for the activation writes, and either give the mode a real caller or delete it. What
landed was the honest description, with the user as the only caller.

The case it did not consider is the one measured today. Running `/fusion:next` against
`260801-1244-curator`, the playmaker reported that the Circle must be re-sharpened before
activation: five Grounding measurements falsified, and the Circle's closing capability C9 already
carried out by hand in another Circle. The user, reading that briefing inside an orchestrator
session, chose "re-sharpen first". The orchestrator cannot carry that out. The only sanctioned
path is for the user to leave the session and invoke shaper top-level with the mode contract.

So the prohibition, chosen to stop an *automated* path from reaching the mode, also blocks a
*user-initiated* one that happens to travel through the orchestrator. Whether that was intended is
the question.

## Options

1. **Leave it as is; the user invokes shaper directly.**
   - Pros: No change. The contract stays true as written and needs no exception clause. The
     activation writes stay where `260806-0015` put them.
   - Cons: The user's intent reaches the orchestrator and stops there. The friction is paid every
     time an anticipated Circle needs re-sharpening, which the curator case suggests is the normal
     state of an older `_a_` Circle rather than a rare one. A user who does not know the contract
     reads the refusal as a defect.

2. **Permit the orchestrator to dispatch the mode when the user has explicitly chosen it.**
   - Pros: Matches what the user asked for, through the surface they were already using. The
     orchestrator is not `/fusion:next`: it has no restricted tool list, it already dispatches
     shaper in Phase 0b, and it is the party that would activate the Circle afterwards.
   - Cons: Widens a contract that two prompts state absolutely, so both statements have to be
     rewritten with a condition ("only the user, or the orchestrator on the user's explicit
     instruction") — and a conditional prohibition is weaker evidence than an absolute one when the
     next audit reads it. Needs a rule that distinguishes "the user chose this" from "the
     orchestrator decided to".

3. **Move Directive and Grounding refinement out of shaper into `/fusion:next` itself.**
   - Pros: One surface owns the whole activation path, which is what `260806-0015` option (a) was
     reaching for. No cross-agent dispatch question remains.
   - Cons: `/fusion:next` would have to run a clarification-with-user flow it currently has no
     machinery for, duplicating the shaper's core competence in a skill body. The decision already
     rejected the neighbouring version of this as the wrong shape.

## Constraints

- Whatever is chosen must keep the `_a_→_t_` rename and the `.active-circle` write where
  `260806-0015` put them: with `/fusion:next` and the orchestrator, never with the shaper.
- Two prompt surfaces state the prohibition (`agents/shaper.md` frontmatter and mode 3). Any
  answer that changes it must change both, or the next reader gets the version that suits them.
- The answer must not reintroduce a dispatcher claim that no caller can reach — that is precisely
  the defect `260805-1839` was filed for.

## Recommendation

Option 2, narrowly: permit it only when the user's answer at a gate named the mode, and record the
user's choice in the dispatch prompt so the audit trail shows who initiated it. The prohibition's
stated rationale is about reachability by automation, and a user choosing an option in an
AskUserQuestion is not automation. Option 1 is defensible and costs nothing to keep; it is the
right answer if re-sharpening an anticipated Circle turns out to be rare, which the single
measured instance here cannot settle.

## Field note — 260813-0027

Asked at the gate that surfaced this, the user chose to invoke shaper directly rather than have
the orchestrator dispatch it. That settles today's path and does not answer the question: the
choice was operational, made with the contract in front of them, and is consistent with option 1
without being stated as a general rule. The record stays open. What it now carries that it did not
before is one measured instance of the friction, and the user's willingness to absorb it once.

---
**Reconciliation evidence, 2026-08-14 (reconciler, verified at HEAD `18173e1`). Still open, and the
prohibited path was taken while it was open.**

Session `shared/history/260813-2345-orchestrator-session.md` `## User decisions recorded this
session` records: "The user directed a shaper run in portfolio-activation mode from inside this
session. The shaper returned two clarification rounds; the orchestrator relayed both, since a
**dispatched sub-agent** cannot reach the user." The result landed as commit `f273b9a`, which
rewrote `circles/260801-1244-curator/_t_circle.md`'s `## Directive` and `## Grounding snapshot` —
exactly the two sections mode 3 is the sanctioned writer of.

That is the path `agents/shaper.md` forbids in two places: the frontmatter description
(`agents/shaper.md:3`, "reachable only by the user running shaper directly with the mode contract —
no skill or agent dispatches it") and mode 3 itself (`agents/shaper.md:47`, "user-invoked directly,
and only directly … No skill or agent dispatches this mode"). `agents/orchestrator.md` contains no
occurrence of `portfolio-activation` at all, so the orchestrator was not authorised by its own
prompt either.

**What this adds to the record.** It is a second measured instance of the case the question was
filed from, and this time the path was not merely blocked — it was taken, by the user's direction,
through the orchestrator, and it worked. The outcome is on disk and was reviewed: the re-sharpened
Grounding is the one the whole Circle then ran against, and the playmaker run at 260814-0823
recommended activation on the strength of it. So the empirical answer to "is the user-initiated
path travelling through the orchestrator harmful" is, on one instance, no.

**Nothing here answers the record**, and the reconciler does not. Whether the prohibition should be
narrowed to automated dispatch, whether the orchestrator needs an explicit relay contract, and what
`agents/shaper.md`'s two absolute sentences become are the choice this record exists to put to the
user. What is established is that the corpus now contains one execution of the disallowed path,
so the question is no longer hypothetical and the two prompts and the practice disagree.

---
Answered: shared/history/260813-2345-orchestrator-session.md `## Coherence` → Rebalance gate,
2026-08-14 — **option 2, narrowly.** The orchestrator may dispatch the shaper's
portfolio-activation mode, but only when the user's answer at a gate named the mode, and the
dispatch prompt records that the user initiated it. The user chose this at the Rebalance gate that
followed the reconciler's `review-needed` verdict, with the record's three options and its
recommendation in front of them, and with the second measured instance — this session's own
`f273b9a` — already annotated above.

**What realising this answer requires**, none of it done here:

1. `agents/shaper.md:3` (frontmatter description) and `agents/shaper.md:47` (mode 3) both state the
   prohibition absolutely. Both become conditional, in the same commit, or the next reader gets the
   version that suits them. The constraint above says this in the record's own words.
2. `agents/orchestrator.md` contains no occurrence of `portfolio-activation` at all, so permitting
   the dispatch is not enough: the orchestrator needs the contract that says when it may, what it
   must carry in the dispatch prompt, and that it relays the shaper's clarification rounds because
   a dispatched sub-agent cannot reach the user. That relay is what this session did by hand.
3. The distinguishing rule the record's option 2 names — "the user chose this" against "the
   orchestrator decided to" — has to be written down, not left to judgement. The gate answer is the
   evidence, and the dispatch prompt is where it is recorded.

The `_a_→_i_` transition belongs to the commit that lands all three. Until then the two prompts
still forbid what this record now permits.

---
Implemented: bf9553f — both absolute statements in `agents/shaper.md` (frontmatter description and
mode 3) became conditional, and `agents/orchestrator.md` gained
`## Re-sharpening an anticipated Circle (shaper portfolio-activation)`, the contract it had no
occurrence of before. All three realisation items above are met and they landed in one commit,
which is what constraint 2 required and what keeps constraint 3 from being violated in the gap
between two commits.

The distinguishing rule (item 3) lives inside the orchestrator's contract rather than in a home of
its own, and it is a test about evidence rather than intent: can you quote the user's own words
choosing it? A stale Grounding snapshot, a playmaker recommendation or a reconciler verdict are
inputs to the question you ask, never substitutes for its answer. It has one addressee, because the
orchestrator is the only agent that dispatches, and the shaper cannot apply it — the shaper sees
what the prompt says, not who chose. So the two prompts hold disjoint halves: the orchestrator holds
the rule that makes `**Initiated by:**` true, the shaper holds the check that the line is there and
halts without it.

Constraint 1 is untouched: the `_a_`→`_t_` rename and the `.active-circle` write stay with
`/fusion:next` and the orchestrator. Constraint 3 is met from both ends in the same commit — the
permitted dispatcher now exists and carries a written contract, so no unreachable dispatcher claim
was reintroduced. Verified `cd hooks && npm test` exit 0, 1030 tests; the always-on growth bound did
not move, since neither prompt is in that corpus.

---
**Reconciliation, 2026-08-14 (reconciler, verified at HEAD `41c224c`).** The `**Status:**` header
read `open` while the filename marker and both footers said implemented; corrected to
`implemented` by this pass. The marker was right and the header was the lag, so nothing about the
record's state changed — only the header caught up.

The `Implemented:` footer was re-derived from the tree rather than taken on report.
`agents/shaper.md:55` and `:57` carry the conditional form and the `**Initiated by:**` halt;
`agents/orchestrator.md:333-339` carries the dispatch contract with the three parameter lines;
`README-agents.md:66-68` carries the roster rows that permit the dispatch, which is the surface the
Turn-4 review found still forbidding it and Turn 5 corrected in `9f4cdac`. All three surfaces agree
at HEAD.
