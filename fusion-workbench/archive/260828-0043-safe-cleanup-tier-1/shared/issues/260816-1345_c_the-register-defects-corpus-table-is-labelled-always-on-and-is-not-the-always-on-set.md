The register defect's corpus table is labelled "always-on context" and is not the always-on set, in both directions

---
The measurement that motivates the whole register repair,
`260816-0740-rhetorical-register-of-agent-output.md` finding 10 and the table copied
into `260816-0740_*_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md`,
totals seven files under the label "total always-on context". Two of the seven memberships are wrong.

`rules/design-diagrams.md` is not always-on. `bin/fusion-rules:412-414` guards it with
`if [ "$IS_DIAGRAM_AGENT" -eq 1 ]`, so it reaches the five diagram producers and nobody else. It is
the second-worst offender in the table, at 794 words and 20 em-dashes for 25.1 per 1000, so it
raises the total it is not part of.

`fusion-workbench/stilwerk/chat-voice-<lang>.yaml` is always-on and is absent. `bin/fusion-rules:396`
calls `emit_voice_profile "chat-voice" "$CHAT_LANG"` outside every conditional, and `CLAUDE.md`
`## Conventions` states the same thing: the chat profile is emitted "for **every** agent". For this
project that file is `chat-voice-de.yaml`, 882 words and 6 em-dashes for 6.8 per 1000, and it is
also the one file in the always-on set that already sits near the ceiling.

## What the corrected set measures

Measured at HEAD `dd560ab` with the record's own command:

```
                                          words    em-dash    /1000
as tabled (7 files)                       22871      340       14.8
always-on in fact (5 rules + chat         22959      326       14.1
  profile + CLAUDE.md)
```

The direction of the finding is unaffected. Both numbers are more than fourteen times the stated
ceiling of 1 per 1000. What is affected is the baseline a later pass compares against, and there is
a later pass by construction: `260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
was answered option 4, whose whole content is a falsification measurement run against a corpus
number. Its `Answered:` note already reasons from "a 2563-word repair inside a 22 763-word corpus",
so the wrong denominator is carried into the decision that will be re-opened with it.

## Why this is worth a record and not a footnote

Option 1 of that decision, the fallback if the falsification measurement comes back null, is a test
over a named file set. A file set that is stated wrong in the motivating measurement is the set
somebody will reach for when writing the test, and `rules/design-diagrams.md` in it means the gate
measures a file five agents read while the file every agent reads goes unmeasured.

## Fix direction

Correct the membership where it is still correctable. The analysis is a completed report and is not
retro-edited (`rules/fusion-workbench-conventions.md` `## Project language` settles the analogous
case); the open defect record's table and the decision record's denominator are both live and are
the copies a later pass acts on. State the set as the unindented `emit_if_exists` lines of
`bin/fusion-rules` plus the unconditional `emit_voice_profile` call plus `CLAUDE.md`, which is how
`CLAUDE.md` `## Conventions` already tells a reader to derive it, rather than as a list that goes
stale on the next emission change.

---
**Found by:** reconciler, third-pass verification of `433e206..dd560ab` on 2026-08-16.
**Owner:** `coder` for the two record edits. No shipped file is wrong; the defect is in the
measurement's stated scope.
**Severity:** Low-Medium. Nothing is broken today. The cost is that the number the falsification
measurement will be judged against is measured over the wrong files, on a decision whose recommendation
turns on whether that number moves.
**Filed in the shared store** per the Origin Rule: no Circle is active.
**Cross-references:** `260816-0740_*_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md`
(carries the table); `260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
(carries the denominator into the answer); `260816-0740-rhetorical-register-of-agent-output.md`
finding 10 (the original measurement); `bin/fusion-rules:383-414`.

**Verified at HEAD `dd560ab`:**

```
$ grep -n '^emit_if_exists' bin/fusion-rules
383 agent-setup.md   384 fusion-workbench-conventions.md   385 decision-record-examples.md
386 user-facing-output.md   387 critical-stance.md
$ sed -n '396p;412,414p' bin/fusion-rules
emit_voice_profile "chat-voice" "$CHAT_LANG"
if [ "$IS_DIAGRAM_AGENT" -eq 1 ]; then
  emit_if_exists "$PLUGIN_RULES_DIR/design-diagrams.md"
fi
```

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: The mislabelled table still stands inside `260816-0740_*_…em-dash-ceiling…md`, still listing `design-diagrams.md` (conditional, guarded at `bin/fusion-rules:412-414`) and still omitting the chat voice profile (unconditional, `:397`). Marker stays open. Log: `260817-1836-reconciliation.md`.

---
**Correction appended 260821-0322-coder-records-state-the-always-on-set-as-a-derivation.md** (coder, plan step 15 of
`260820-2324_*_plan-style-rules-arrive-and-get-measured.md`).
Appended beneath the fix direction rather than replacing it, because the sentence that was
imprecise is the evidence that it was imprecise.

**The set is stated as its derivation, and the derivation has exactly two parts.** The always-on
set is the unindented `emit_if_exists` calls in `bin/fusion-rules` plus the unconditional
`emit_voice_profile "chat-voice" "$CHAT_LANG"` call, resolved against the project's chat
language. Read at HEAD `86edaac` that is `bin/fusion-rules:418-422` and `:431`, six files for
every agent. No record in this project keeps a hand-written copy of that list any more, this one
included: every hand-written copy went stale, which is the root cause this Circle was opened on,
and a freshly counted list would go stale the same way.

**`CLAUDE.md` is a third part of the always-on *prose* and is not part of the derivation.** The
fix direction above folds it into the derivation ("plus `CLAUDE.md`"), and the derivation does
not produce it: no helper emits `CLAUDE.md`, Claude Code loads it as project instructions. It is
therefore named separately, as always-on prose an agent holds that no helper emits. Its prose was
not repaired in this Circle, by
`260820-2314_*_is-claude-md-inside-the-corpus-this-circle-repairs.md`
option 3, which is the record that reconciled this issue's demand with the repair's scope.

**What the corrected set measures now.** Measured at HEAD `86edaac` with `bin/fusion-prose-metric`,
the authoritative counter since plan step 1 of the Circle above, which excludes fenced code, inline
code spans, block quotes and YAML example values from both counts:

```
                                          words    em-dash    /1000
the six emitted files                     13292        8       0.6
CLAUDE.md                                  8892      126      14.2
always-on prose an agent holds            22184      134       6.0
```

`CLAUDE.md` is 40 per cent of that prose by word count and carries 94 per cent of its em-dashes.
The `125 em-dash / 9155 words` in the decision record cited above is a raw `wc -w` and `grep -o`
count taken at `a5b73da`; two commits have since grown the file, and the two programs count
different regions, so the figures differ for two independent reasons and neither is wrong.

---
Resolved: the fix direction this record states, "state the set as the derivation rather than as a
list that goes stale on the next emission change", landed on all four live carriers in commit
`b8b8f42` (plan step 15 of `260820-2051-style-rules-arrive-and-get-measured`). Each
carries a dated correction appended beneath the claim it corrects, so the mislabelled table survives
as the evidence that the set was never derived and no reader can now take it as current:
`260816-0740_*_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md:140`,
`260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md:140`,
`260820-2051-style-rules-arrive-and-get-measured:117`, and this record itself
at its `Correction appended 260821-0322-coder-records-state-the-always-on-set-as-a-derivation.md` block.

Re-verified at HEAD `247abfe`: the derivation is stated as the unindented `emit_if_exists` calls
in `bin/fusion-rules` plus the unconditional `emit_voice_profile "chat-voice"` call; both halves
of the membership error this record found are named, `rules/design-diagrams.md` as conditional and
the chat voice profile as the omitted unconditional one; and `CLAUDE.md` is named separately as
always-on prose an agent holds that no helper emits, which is the distinction the fix direction
itself blurred. `npx vitest run lib/__tests__/workbench-citation-lint.test.ts` is green inside the
full suite, so no correction introduced a dangling citation.

**One thing the correction did not settle, recorded here rather than left to be rediscovered.** The
final-measurement note of this Circle uses "always-on" for two different sets in two sections, five
rule files in one and the six files `bin/fusion-rules coder` emits in the other, without saying so.
That is this record's own fault class recurring inside the Circle that repaired it, and it is filed
separately.

Closed by reconciler 260821-0410; log
`260821-0416-reconciliation.md`.
