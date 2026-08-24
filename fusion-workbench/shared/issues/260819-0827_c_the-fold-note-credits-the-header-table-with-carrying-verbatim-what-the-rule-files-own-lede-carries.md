The fold note credits the header table with carrying "verbatim" what the rule file's own lede carries

---

`260819-0042`'s `Resolved:` note justifies its first fold as:

> the emission-audience paragraph under the pointer, **which the header table already carried
> verbatim**

The header table carries the same *facts* in a compressed cell. The verbatim carrier is a different
file. Nothing normative was lost, so this is an attribution error in a closure note rather than a
missing statement — but a fold justified by "X already carries it verbatim" is exactly the claim a
later reader will trust without rechecking.

---

**What was folded out** (`rules/fusion-workbench-conventions.md`, removed at `06ab15b`):

> `bin/fusion-rules` emits that file to **no agent**, because no executor agent applies the split.
> Its two consumers are a human writing a project's `.gitignore`, who reads a file rather than
> receiving an emission, and the archive step of `/fusion:cleanup`, which cites it in its own body.

**The header table row** (`rules/fusion-workbench-conventions.md:16`):

> \| Which of a tracked workbench's root entries git holds \| `rules/workbench-tracking.md` \|
> no agent — read when writing a project's `.gitignore`, and cited by the archive step of
> `/fusion:cleanup` \|

Same three facts, none of the words, and the *reason* — "because no executor agent applies the
split" — is not in the row at all.

**Where it is verbatim.** `rules/workbench-tracking.md:7`, the file's own lede:

> `bin/fusion-rules` emits it to **no agent**, because no executor agent applies it. Its two
> consumers are a human writing a consuming project's `.gitignore`, who reads a file rather than
> receiving an emission, and the archive step of `/fusion:cleanup`, which cites this file in its own
> body (`skills/archive/SKILL.md`).

That is the sentence, with the reason clause intact and one citation more. So the fold is sound and
the reasoning behind it names the wrong carrier.

**A second, smaller inaccuracy in the same note.** The surviving conventions sentence still states
the audience — "which `bin/fusion-rules` emits to **no agent**: its two readers are a human writing a
project's `.gitignore` and the archive step of `/fusion:cleanup`" — so the paragraph was *merged*
into the sentence above it rather than folded out to another file. Only the reason clause left the
file.

Verified at HEAD `83488e9` by `git show 06ab15b -- rules/fusion-workbench-conventions.md` and by
reading `rules/workbench-tracking.md:7` and `rules/fusion-workbench-conventions.md:11-18, 76`.

**Fix direction.** Correct the `Resolved:` note to name `rules/workbench-tracking.md:7` as the
verbatim carrier and to say the paragraph was merged rather than removed. Text only, in a closed
record.

Found in the coderev pass over `5ec26b2..83488e9`, session `260818-2301`, Turn 2. No Circle active,
so it is filed in the shared store under the Origin Rule.

---
Resolved: fixed — a `Revised by:` line on the closed record names `rules/workbench-tracking.md` as the verbatim carrier and says the paragraph was merged; shared/issues/260819-0042_*_the-move-turned-an-adjacent-duplicate-enumeration-of-the-root-entries-into-a-cross-file-one.md:67
