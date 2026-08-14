# Should the orchestrator be able to dispatch the shaper's portfolio-activation mode?

---
**Domain:** code
**Status:** open
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
