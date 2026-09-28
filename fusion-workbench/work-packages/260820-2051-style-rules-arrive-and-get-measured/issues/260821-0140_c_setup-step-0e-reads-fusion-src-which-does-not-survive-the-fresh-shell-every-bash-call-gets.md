Setup Step 0e reads `$FUSION_SRC`, which does not survive the fresh shell every Bash call gets

---

`skills/setup/SKILL.md:186-198` is Step 0e's read-only classification loop. It resolves the shipped copy at `:188` as `g="$FUSION_SRC/$rel"`. `$FUSION_SRC` is assigned nowhere in that block. It is assigned once at `:14-23`, at the top of the file, and this file states four lines later, at `:26`, that the assignment does not carry:

> Hold the printed path and use it wherever a step below writes `$FUSION_SRC/…`. **Each shell call gets a fresh shell**, so the one executable check in this file calls the helper again rather than relying on the variable surviving.

Step 0e's prose does say "Substitute the printed path into the commands below" (`:181`). The block it introduces still contains the literal variable, and an agent that runs the block as written runs it with `FUSION_SRC` unset.

**The prose guard that exists covers the other case.** `:29` says Step 0e "tests the value and skips itself rather than reading through it", and `:181` says "If the root printed `UNRESOLVED`, skip this step". Both are about the root having failed to resolve. Neither reaches the case where the root resolved fine at `:23`, the agent saw a real path, and the variable is simply absent in the shell that runs `:186`. In that case the agent has no `UNRESOLVED` to react to and no reason to skip.

There is also no inline test. Step 0e's block is the only one in this file that reads a root without one: Step 0c's monitor copy at `:124` opens with `[ -n "$FUSION_PLUGIN_ROOT" ] &&`, and Step 0d's loop at `:161-169` reads `$FUSION_PLUGIN_ROOT`, which `hooks/hooks.json` exports at SessionStart and which therefore does survive a fresh shell. Step 0e is the one place a non-exported variable is dereferenced.

**Why it is silent.** With `FUSION_SRC` empty, `g` becomes `/stilwerk/<profile>.yaml`, `[ -f "$g" ]` is false for all four, and every file takes the guard at `:189`:

```bash
{ [ -f "$d" ] && [ -f "$g" ]; } || { echo "$rel absent"; continue; }
```

`absent` is the one outcome the five documented cases at `:200-206` do not cover and the Done-report line at `:233` does not mention. So the step's most likely failure mode is also the one that produces no user-visible signal. That gap is filed separately.

**Verified at HEAD `7832553`** by reading `skills/setup/SKILL.md:14-29`, `:124`, `:161-173` and `:181-233`. Not verified by running Setup: this reviewer does not execute the skill.

---
**Found by:** coderev, review of `7135a19..7832553`, review file `260821-0145-coderev-turn-1-prose-metric-setup-step-0e-and-the-repunctuation.md`.
**Owner:** `coder`.
**Severity:** High. The comparison this Circle built silently classifies nothing, and reports it with the one token nobody handles.
**Direction, not a prescription.** Two shapes, and the choice is the author's: re-call `bin/fusion-source-root` inside the block behind its `[ -x ]` guard, which is the pattern this file has already settled on twice (`:14-23`, and Step 3's domain detection); or keep the substitution instruction and open the block with an `[ -n "$FUSION_SRC" ]` test that fails loudly instead of falling into `absent`.
**Cross-references:** `260821-0141_*_setup-step-0e-has-a-sixth-outcome-absent-that-none-of-its-five-documented-cases-covers.md`; `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention…` part (b), the `[ -x ]` convention a re-call would follow.

---
Resolved: Step 0e no longer reads `$FUSION_SRC` anywhere. All three of its shell blocks — the classification loop, the replace loop and the stamp loop — now open with `SRC="${FUSION_PLUGIN_ROOT:-}"; [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-source-root" ] && SRC="$(…)"`, the guarded-call shape this file had already settled on, and the classification block then refuses to proceed on an empty root: `[ -n "$SRC" ] || { echo "source-root-unresolved"; exit 0; }`. The record filed the classification loop; the replace and stamp loops carried the identical dereference and are fixed with it, the stamp loop being the one that would otherwise have written an empty checksum into `.asset-provenance`.

The fix went past the direction offered here in one respect. Falling back on a *failing* helper was dropped: with the fallback pre-assigned and the helper allowed to overwrite it, a helper that is present but exits non-zero leaves `$SRC` empty and the step skips loudly, rather than silently comparing against the install copy — which in this repository is exactly the copy the work-tree exception exists to avoid. A helper that is merely *absent* still falls back, which is the pre-helper behaviour the `[ -x ]` convention preserves.

Verified by running the block as it stands in the file, with `FUSION_SRC` unset, from the project root: four `case1-equal` where the pre-change block printed four `absent`. The other three branches were exercised too — helper absent (falls back), helper present but failing (skips), `FUSION_PLUGIN_ROOT` unset (skips). `cd hooks && npm test` exit 0, 40 files, 718 tests.
