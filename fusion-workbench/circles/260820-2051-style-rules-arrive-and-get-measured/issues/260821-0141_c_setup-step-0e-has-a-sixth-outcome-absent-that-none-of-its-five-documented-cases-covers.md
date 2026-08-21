Setup Step 0e has a sixth outcome, `absent`, that none of its five documented cases covers

---

`skills/setup/SKILL.md:200` opens with "**The five cases, and the precedence is the branch order above rather than a preference.**" and `:202-206` list `case1-equal`, `case0-unclassifiable`, `case2-stale`, `case3-adapted`, `case4-conflict`. The loop emits a sixth token that appears in none of them, at `:189`:

```bash
{ [ -f "$d" ] && [ -f "$g" ]; } || { echo "$rel absent"; continue; }
```

**The five are disjoint; the six are not complete.** The `if`/`elif` chain at `:191-196` is disjoint by construction, and the precedence claim is correct: case 1 and case 4 would both match when both copies moved to the same content, and the branch order settles it. That is the exclusivity half, and it is right. Exhaustiveness fails one line earlier, at the guard the prose never reaches.

Nothing downstream handles `absent`. It is not in the offer set (`:208`, "cases 0 and 2 together"), it is not stamped by the block at `:222-230`, it is not silent-by-design like case 3, and it is not in the Done-report list at `:233` ("which files were replaced, which were kept, and which were named as conflicts").

Two reachable triggers, neither exotic:

1. **`$d` absent** — the workbench has no profile at all, because Step 0d's copy failed or was skipped. Step 0d explicitly permits this at `skills/setup/SKILL.md:175`: "If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, note it in the history file later but do not block Setup." This is the case a user would most want named: with no profile in the workbench, `bin/fusion-rules` emits no profile path at all (`bin/fusion-rules:335-346`) and every agent runs the session with no chat voice.
2. **`$g` absent** — the resolved shipped root does not carry the file. An empty `$FUSION_SRC` puts all four files here, which is filed separately as `260821-0140_*_setup-step-0e-reads-fusion-src-…`.

`rules/critical-stance.md` §4 is the standard: "Every input falls in exactly one branch: no two branches overlap, and no input falls through. An overlap and a gap are **defects**, of the same kind as a wrong result." The step reasoned carefully about the overlap and left the gap.

**Verified at HEAD `7832553`** by reading `skills/setup/SKILL.md:186-233` and `:161-175`.

---
**Found by:** coderev, review of `7135a19..7832553`, review file `circles/260820-2051-style-rules-arrive-and-get-measured/reviews/260821-0145-coderev-turn-1-prose-metric-setup-step-0e-and-the-repunctuation.md`.
**Owner:** `coder`.
**Severity:** High. A missing profile is the loudest thing this step can detect and the one thing it says nothing about.
**Direction, not a prescription.** The cheapest cut that restores completeness is to name `absent` as a sixth case with its own report line, since the step already computes it. Whether it should also *act* — re-copy a missing `$d` from Step 0d's source, or refuse the whole step when `$g` is missing — is a separate question the author should answer rather than inherit from this record.
**Cross-references:** `circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0140_*_setup-step-0e-reads-fusion-src-which-does-not-survive-the-fresh-shell-every-bash-call-gets.md`.

---
Resolved: `absent` is gone, and the two triggers this record separated are now two cases rather than one token. The guard is split in the branch order:

```bash
  [ -f "$d" ] || { echo "$rel case5-missing-local"; continue; }
  [ -f "$g" ] || { echo "$rel case6-missing-shipped"; continue; }
```

Both are named in the numbered list, which now says seven, and both are named in the Done-report line. `case5-missing-local` carries the consequence this record asked for — until the file exists `bin/fusion-rules` emits no path for that profile and every agent runs the session without it. `case6-missing-shipped` is named as a broken install or an unexpected root rather than as anything about the project.

The separate question this record left to the author — whether the step should also *act* — is answered no, and the answer is written into case 5: presence is Step 0d's job, and a second copier is a second place to keep right. The step's own heading is "Read-only classification" and it stays that.

Two consequences worth naming. Neither new case joins the offer set, so the one-question rule is untouched: cases 0 and 2 are still the whole question and there is still no question when that set is empty. And cases 5 and 6 can both hold at once, so their precedence is stated where case 1 and case 4's already was — reported in branch order, the local one first, because that is the copy the session needs.

Verified by constructing each cause deliberately in a scratch project and classifying beside a live case: a workbench missing `chat-voice-de.yaml` reports `case5-missing-local`, a root missing `default-voice-de.yaml` reports `case6-missing-shipped`, and `default-voice-en.yaml`/`chat-voice-en.yaml` still classify `case1-equal`/`case2-stale` in the same run. Two consecutive runs with nothing changed between them produce identical output and change no file in the workbench (mtime, size and name compared over the whole tree). `cd hooks && npm test` exit 0.
