The "measure it yourself" instruction names the emit_if_exists list, which is 30 588 bytes larger than the always-on set

---
The rewritten byte-budget sentence at `CLAUDE.md:64` tells a reader to measure the current floor "with `wc -c` over the always-on set — the `emit_if_exists` list in `bin/fusion-rules` plus the project's chat voice profile". `bin/fusion-rules` carries eight `emit_if_exists "$PLUGIN_RULES_DIR/…"` lines, not five: three of them are conditional emissions sitting indented inside `if` blocks. A reader following the instruction literally over-measures by 30 588 bytes, about 33 %.
---

## Both sides read

**Documentation side**, `CLAUDE.md:64`:

> **The floor as it stands today is deliberately not stated here.** It moves with every rule edit … Measure it when you need it, with `wc -c` over the always-on set — the `emit_if_exists` list in `bin/fusion-rules` plus the project's chat voice profile.

**Artifact side**, `bin/fusion-rules`. Unindented (always-on), five, at `:391-395`:

```
emit_if_exists "$PLUGIN_RULES_DIR/agent-setup.md"
emit_if_exists "$PLUGIN_RULES_DIR/fusion-workbench-conventions.md"
emit_if_exists "$PLUGIN_RULES_DIR/decision-record-examples.md"
emit_if_exists "$PLUGIN_RULES_DIR/user-facing-output.md"
emit_if_exists "$PLUGIN_RULES_DIR/critical-stance.md"
```

Indented (conditional), three: `circle-records.md`, `design-diagrams.md`, `workbench-stash-and-lock.md`. `wc -c` over those three is **30 588** bytes. The correct measurement is 93 819; following the instruction as written gives up to 117 054 (the `wc -c` on the wrong side of a claim the whole sentence exists to keep honest).

The indentation is exactly what the enumeration lint keys on, and it says so at `hooks/lib/__tests__/derivable-enumerations-lint.test.ts:176-178`:

```
/** The always-on emissions: UNINDENTED emit_if_exists lines, in order. The
 *  conditional emissions are indented inside their if-blocks, which is what
 *  makes the always-on set parseable without a shell interpreter. */
```

The plan carried the word (`260813-1820_*_…:116`, "the five files that `bin/fusion-rules` emits unindented") and the step-2 history carried it (`260813-1915-coder-…:84`, "the six paths `bin/fusion-rules coder` emits"). It was lost only in the shipped sentence.

## Scope

`CLAUDE.md` only. It matters more than a wording nit because this sentence is the *replacement* for the deleted numbers: reproducibility is the whole of what the edit substituted for a stated figure.

## Recommended fix direction

Say "the **unindented** `emit_if_exists` lines in `bin/fusion-rules`", or name the alternative that needs no reading of the script at all: `bin/fusion-rules <any-agent>` prints the emitted set for that agent, one path per line, and `wc -c` over its output is the measurement — which is what the step-2 history actually ran.

Filed by: coderev (review of Circle Turn 1, range `6590cd5..79ec7bb`, commit `0b20859`).

---
Resolved: The instruction now names the set that produces the figure. `CLAUDE.md` reads "with `wc -c` over the always-on set — the **unindented** `emit_if_exists` lines in `bin/fusion-rules`, plus the project's chat voice profile", says the indented ones are conditional and add 30 588 bytes, and offers `bin/fusion-rules coder | xargs wc -c` as the same measurement in one command. All three figures were measured here, not carried over: `grep -n 'emit_if_exists' bin/fusion-rules` gives five unindented lines (`:391-395`) and three indented (`:421`, `:439`, `:454`); `wc -c` over those three is 30 588; `bin/fusion-rules coder | xargs wc -c` and `wc -c` over the five plus `fusion-workbench/stilwerk/chat-voice-de.yaml` both total 93 819, so the one-command form is exact for `coder` in this repository today.
