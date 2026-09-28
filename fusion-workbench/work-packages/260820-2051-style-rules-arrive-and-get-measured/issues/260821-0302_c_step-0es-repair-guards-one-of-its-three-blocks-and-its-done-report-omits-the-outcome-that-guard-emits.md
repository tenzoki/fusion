Step 0e's repair guards one of its three blocks, and its Done-report contract omits the outcome that guard emits

---

`3464575` closed both Turn-1 defects in `/fusion:setup` Step 0e. `$FUSION_SRC` is gone from the step
(`260821-0140_*_setup-step-0e-reads-fusion-src-which-does-not-survive-the-fresh-shell-every-bash-call-gets.md`), and `absent` became `case5-missing-local` and `case6-missing-shipped`, both named in
the enumeration and both routed into the Done report (`260821-0141_*_setup-step-0e-has-a-sixth-outcome-absent-that-none-of-its-five-documented-cases-covers.md`). Read as a reader who pastes the
three blocks, two things did not come across with the repair.

## Part 1 — the skip is not in the Done-report contract

`skills/setup/SKILL.md:188` emits an eighth token the seven-case enumeration does not contain:

```
[ -n "$SRC" ] || { echo "source-root-unresolved"; exit 0; }
```

It is not silent: `:181` says "**A root that resolves to nothing skips the step**: ask nothing,
change nothing, and say in the Done report that the assets were not compared." So this is not a
recurrence of `260821-0141_*_setup-step-0e-has-a-sixth-outcome-absent-that-none-of-its-five-documented-cases-covers.md`, where nothing anywhere covered the sixth token.

What is missing is the other end. `:240` is the step's Done-report contract and it enumerates four
outcome classes:

> Report in the Done report: which files were replaced, which were kept, which were named as
> conflicts, and which were missing on either side (cases 5 and 6).

The skip is not among them. The obligation to report it sits 59 lines earlier, inside the paragraph
that explains why the blocks resolve their own root. An agent that runs the block, reads
`source-root-unresolved`, and then follows the sentence that says what to put in the Done report
puts nothing there — and this is the outcome where every other outcome is unknown, so the step's
whole result goes unreported. `:203` also still opens "**The seven cases**", while the block emits
eight tokens.

## Part 2 — one of three blocks checks the root it resolves

`:181` states the property at step scope: "**Every block below resolves the shipped root itself**".
All three do. Only the first checks the result.

| Block | Line | Resolves `$SRC` | Checks it |
|---|---|---|---|
| classification | `:187-188` | yes | yes, `[ -n "$SRC" ]` |
| replace | `:222-223` | yes | no |
| stamp | `:227-233` | yes | no |

The stamp block is the one with a durable consequence. With `SRC` empty, `shasum -a 256
"$SRC/$rel"` reads `/stilwerk/…`, fails, and `h` is the empty string; `grep -q "^$h  $rel$"` does not
match, and the block appends a line whose checksum field is empty. On the next run
`R="$(grep "  $rel$" "$PROV" | tail -1 | cut -c1-64)"` reads that line back as a non-empty string
that is not a checksum, so the file classifies `case4-conflict` — which `:207` says is "named again
on every run until a human resolves it by hand", on a surface whose only reader and writer is Setup
itself. That is the identical end state as part 2 of the open `260821-0148_*_step-0e-stamps-a-replace-that-may-have-failed-and-a-declined-offer-becomes-a-permanent-conflict.md`, reached by a different
door.

**Reachability, honestly.** Following the prose, an agent that saw `source-root-unresolved` skips the
step and never reaches the stamp block, so this is not a live path today. It is a guard asymmetry on
a step whose Turn-1 defect was a guard asymmetry, in a file where each block is pasted into its own
shell and cannot see what the previous one decided. `:26` states that property of this file in its
own words.

---
**Found by:** coderev, review gate R1 of `260820-2051-style-rules-arrive-and-get-measured`,
review file `260821-0257-coderev-turn-2-the-repunctuation-and-the-repaired-step-0e.md`.
**Owner:** `coder`.
**Severity:** Medium for part 1, Low for part 2.
**Filed in the Circle store** per the Origin Rule.
**Cross-references:**
`260821-0141_*_setup-step-0e-has-a-sixth-outcome-absent-that-none-of-its-five-documented-cases-covers.md`
(closed by the commit this reviews; part 1 is the same shape at the reporting end rather than the
classification end);
`260821-0148_*_step-0e-stamps-a-replace-that-may-have-failed-and-a-declined-offer-becomes-a-permanent-conflict.md`
(same end state, still open, and the unguarded `cp` at `:223` it names is unchanged at HEAD).

**Verified at HEAD `c226949`** by reading `skills/setup/SKILL.md:177-240` and by tracing the empty-`h`
path through `:227-233` and back into `:194` on a following run.

**The fix.** Part 1: add the skip to `:240` as a fifth reported outcome, and make `:203` say eight
rather than seven, or move the guard's token into the enumeration as a case of its own. Part 2:
give the replace and stamp blocks the same `[ -n "$SRC" ] || { echo …; exit 0; }` line the
classification block carries. Both are additive and neither changes the step's behaviour on a
resolving root.

**What is right in the repair, and it is the substance of it.** The pre-assigned fallback rather than
a chained one does hold: when `bin/fusion-source-root` is present but exits non-zero, `[ -x … ]` is
true, the command substitution runs and yields the empty string, `SRC` is overwritten with it, and
`:188` skips the step. A present-but-failing helper therefore cannot silently leave `SRC` pointing at
`$FUSION_PLUGIN_ROOT` and compare against the wrong copy. That was the reason given for the shape and
the shape delivers it.

---

**Sequencing constraint, measured, and it applies to the fix rather than to the defect.**
`skills/` stands at 240 409 bytes against a budget of 240 439 (`SKILL_BASELINE` sums to 220 439 in
`hooks/lib/__tests__/surface-growth-bound.test.ts:286-299`, plus `SKILL_HEAD_ROOM = 20_000` at
`:354`). That leaves **30 bytes**. Both parts of the fix add text to `skills/setup/SKILL.md`: two
guard lines are roughly 100 bytes and the Done-report clause roughly 60. Applying either reddens
`npm test` on the growth bound.

The way out is stated once, in `hooks/lib/__tests__/helpers/growth-bound.ts`, and it is a cut rather
than an edit to the baseline. So this fix is blocked behind a `skills/` reduction, and that ordering
should be decided rather than discovered when the executor's first write turns the suite red. The
session record for this Circle already names the 30 bytes
(`260820-2103-orchestrator-session.md`, Turn 2).

---
Resolved: both parts applied to `skills/setup/SKILL.md` Step 0e at step 5 of the C0 plan
(`260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`).

Part 1, the reporting end. The Done-report contract now names the skip as a fifth reported outcome:
"…and, when the block printed `source-root-unresolved`, that the assets were not compared at all."
The obligation no longer sits only in the paragraph 59 lines above it. The enumeration's head reads
"**The eight tokens**" rather than "The seven cases", and names `source-root-unresolved` as the first
of them — the skip is reported rather than enumerated, so it is not given a case number beside the
seven the loop assigns. That is the second of the two remedies the record offered; the first, adding
it to the numbered list as a case of its own, was not taken, because it is not a classification of a
file and the list's items each classify one.

Part 2, the guard asymmetry. The replace block and the stamp block now carry the same
`[ -n "$SRC" ] || { echo "source-root-unresolved"; exit 0; }` line the classification block carries,
immediately after their own `SRC` assignment. All three blocks now check the root they resolve.

One thing beyond what the record prescribed, and it costs no bytes: in the stamp block the `SRC`
assignment and its new guard were moved **ahead** of the `PROV=…; [ -f "$PROV" ] || : > "$PROV"` line.
On a resolving root the two orderings are identical. On a non-resolving one the original order would
have created an empty `.asset-provenance` and then exited, leaving a file behind on a run that did
nothing else — a smaller version of the durable consequence this record's part 2 is about.

Sequencing: the 30-byte constraint the record measured was cleared first. Step 4 of the same plan cut
`skills/*/SKILL.md`; this fix added 372 bytes to `setup/SKILL.md` and the surface held 4 016 bytes of
head-room after step 6 landed alongside it. `SKILL_BASELINE` did not move.

Verified: `cd hooks && npm test` — exit 0, 41 files, 724 tests.
