A survey that proposes nothing leaves the message draft with no question to ride on, and the body forbids asking

---

`skills/cleanup/SKILL.md` `### The message half` says "**The draft rides as a second question in the same `AskUserQuestion` call** as the gate above". `skills/curate/SKILL.md` `## Step 3 — Read what the survey returned` states the case where that call is never made: "**A survey that proposes nothing is a complete result.** When every group count is zero, say so in one line, name the run file, and stop — no gate, no second dispatch. That is the ordinary outcome on a project whose surfaces are current." `skills/post/SKILL.md` `## Step 4: the two invocation shapes` then closes the escape: on the inline path "This body asks nothing of its own on that path." So on the ordinary full run the draft is composed, printed, and never confirmed or written.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

The vehicle is missing in more than one branch of `skills/curate/SKILL.md`, and each is a different reason:

| Branch | Where it is written | Is there an `AskUserQuestion`? |
|---|---|---|
| survey proposes nothing | `skills/curate/SKILL.md` `## Step 3 — Read what the survey returned` | no |
| either run-file halt condition | same section, "Two conditions halt here" | no |
| blast-radius stop, user declines the ledger | `skills/curate/SKILL.md` `## Step 4 — The scale confirmation, only when the blast-radius stop fired` | yes, but it ends before the gate |
| `--skip claude-md` | `skills/cleanup/SKILL.md` `### The message half`, second bullet | no, and the message is deliberately dropped |

Only the last is decided. The first three drop the message by accident, and the first one is named in `skills/curate/SKILL.md` as "the ordinary outcome on a project whose surfaces are current" — so the healthier the project, the more reliably its messages are lost.

This is adjacent to the open record `260908-0850_*_two-selector-names-share-one-step-and-the-coupling-runs-in-only-one-direction.md` and is not the same defect. That record enumerates `--only` / `--skip` combinations and lists the full run as a defined row; this says the full-run row is itself incomplete, and its sub-cases are decided inside a third body neither of the other two mentions.

The coupling is stated cheaply if it is stated at all: whoever holds the gate knows whether it fired, and the fallback for "no gate fired" is one `AskUserQuestion` of the shape `skills/post/SKILL.md` already defines for the standalone path. What must not stand is the current text, where the inline path names a call that may not exist and the body is told not to make one.

**Acceptance test:** every path through `skills/curate/SKILL.md` that ends without putting the gate has a stated behaviour for the message draft, written in one place; a full `/fusion:cleanup` run whose curator proposes nothing either writes the message or says in the Step 8 report that it did not and why.
