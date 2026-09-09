# The cut spec's analyst row forbids the project writes its own `CLAUDE.md` gate requires

---
`260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` C7 defines the merged `analyst` as writing
"findings in the workbench; writes nothing in the project", and in the same capability absorbs
`curator`, whose entire purpose is gated writes to `CLAUDE.md` and the project's rule files. C3 keeps
that gate and calls it the one gate that must survive. The three statements cannot all be true.
The same shape recurs for `reconciler`.

---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260909-1628-adversarial-review-of-the-cut-fusion-to-a-working-minimum-spec.md` (findings 5.2, 5.3; MF-2, MF-3); `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` (C3, C7)

## The defect, in two instances

**Curator.** `agents/curator.md:327-329` declares gated writes to `CLAUDE.md` and to the project's
`./rules/` and `.claude/rules/`, deletion included. C7's table row reads "analyst | findings in the
workbench; writes nothing in the project | coderev, ontorev, consultant, curator". C7's own decision
bullet reads "The curator's subject matter survives as an analyst dispatch behind the on-call
`CLAUDE.md` command of C3, and its user gate survives with it." C3 criterion 3 keeps the gate,
"because it is the only place a normative surface is changed on evidence".

A gate on a change no agent may make is not a gate.

**Reconciler.** C7 removes the role, "with the remainder becoming the on-call reconciliation pass of
C3 performed by the analyst". Reconciliation is in-place editing of existing plan, issue and review
files (`agents/reconciler.md:48-50`). `agents/analyst.md:27` forbids editing "any existing document
outside your own write targets". The absorbing role's defining prohibition is the absorbed role's
defining capability.

## What would resolve it

One decision, taken once, settles both: does the merged analyst gain a gated project-write surface?

- If yes, the C7 table row changes, and the merged prompt has to carry curator's write-safety
  discipline (evidence tiers, blast-radius stop, preserve list, wrong-prune detection, revert path,
  `agents/curator.md:64-116,:190-229`). Measured, that alone puts the merged prompt 57 percent over
  C7's stated 22 000-byte target before anything else is absorbed.
- If no, C3's `CLAUDE.md` command is dropped and C3 loses the gate it names as the one that must
  survive, or `curator` survives as a role and the roster is seven rather than six.

The choice is about how much write authority one role may hold, which is a user-level question rather
than a shaping detail.

## State

`_o_` open. Blocks planning of C7 and of C3's `CLAUDE.md` command.
