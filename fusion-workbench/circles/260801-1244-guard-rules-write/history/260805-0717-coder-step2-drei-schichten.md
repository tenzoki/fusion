# Session: Step 2 — protected-path-discipline.md cut into three layers by addressee

**Date:** 2026-08-05
**Agent:** coder
**Status:** Complete
**Circle:** `circles/260801-1244-guard-rules-write`
**Plan:** `planning/260804-2356_o_plan-ausstieg-kontextsteuer-und-auslieferung.md`, Step 2
**Decision executed:** `decisions/260805-0709_i_wohin-gehoert-die-forensik-aus-protected-path-discipline.md`
**Baseline:** `658653a`. Not committed — the orchestrator commits after validation.

**Voice profiles:** `bin/fusion-rules coder`, run from the project root, emitted
`./fusion-workbench/stilwerk/chat-voice-en.yaml`. The dispatch asked for a German report, so
I read `chat-voice-de.yaml` directly and applied it to the chat report. `CLAUDE.md` carries no
`**Language:**` line, so the helper's documented default (`en`) is what it resolved — the same
observation `history/260805-0645-coder-step1-emission-golden.md` records.

---

## The three sentences

`rules/protected-path-discipline.md` went from **50 559 bytes loaded by all sixteen agents** to
a **16 346-byte core loaded by all sixteen**, a **20 754-byte reference loaded by three**, and a
**19 090-byte forensics analysis loaded by none**; per agent the always-on total went
145 144 → **110 931** for the seven plain agents, 150 817 → **116 604** for the six
design-diagram agents, and 145 144 → **131 685** for `coder`, `coderev` and `bugfixer`, who
carry both rule layers. The reference **does** reach exactly those three and no fourth agent,
measured by running the real script for every agent name. **No agent is under the 105 354-byte
release cap after this step**, and the three coding agents are 26 331 bytes over it — the
finding the decision record pre-authorised, not a reason to cut further.

## What was decided differently from the plan, and why

The plan wanted two layers and predicted 104 600 bytes for every agent after this step. Three
things were wrong with that arithmetic, and only the first was known before this session:

1. **Two layers do not cut anything for the three agents that keep the reference.** That is the
   contradiction the step-1 golden found and the decision record answered: a third layer, the
   forensics, leaves `rules/` entirely.
2. **The plan's projection never covered the six design-diagram agents.** They carry
   `design-diagrams.md` (5 673) on top of the always-on set. At the plan's own projected core
   size of 10 015 they would have stood at 110 273 — over the release cap before a byte of this
   step was written.
3. **The core does not fit in 8 900 bytes** — not at my cut, and not at the user's own section
   list either. Taking the sections the gate assigned to the core and measuring them gives
   11 126, not 8 900. My core is 16 346. The gap is accounted for below.

## The cut line: addressee, not heading

The user's binding criterion was the addressee, and the gate's section rows were explicitly an
estimate read off the headings. Measuring the sections showed the headings do not describe the
contents in two places, so the cut follows the criterion and departs from the rows twice.

| Section | Bytes | Gate row | Where it went | Why |
|---|---|---|---|---|
| lede, `## The rule`, `### The match is textual…` | 3 011 | core | core | as assigned |
| `### An ancestor directory is covered, in both directions` | 710 | reference | **core** | without it the core's central sentence is false for `rm -rf hooks` and `cp /tmp/x hooks/`, and an agent meets an unexplained deny — the failure this file exists to prevent |
| `### A \`cd\` is tracked` | 1 342 | reference | **core** | it carries "**Write `&&`, not `;`**", the most actionable instruction in the file, and it is the premise the prediction rule reads from |
| `### The rule, so you can predict…` | 3 172 | core | core | as assigned |
| `### The overrides…`, `## What stays allowed`, `## What to do instead`, `### What a halt costs you` | 4 943 | core | core | as assigned |
| `### The verb families`, `### git carries its own working directory`, `### Clustered short flags…`, `### The command word is resolved…`, `### Fail-closed, and its bound` | 13 842 | reference | reference | as assigned |
| `### Illustrations, not a list` | 10 678 | forensics | **split** | see below |
| `## Where this check does not reach` | 12 845 | forensics | **split** | see below |

**The two sections the headings mis-describe.** `### Illustrations, not a list` is only about
one third illustrations. Its measured DENY/allow list, its "an earlier version said five
shapes" correction and its "one honest edge, still open" pair are evidence (→ forensics), but
5 130 bytes of it are the working-directory model in detail — the `cd -P`/`CDPATH`/`pushd -n`/
wrapper table and the three paragraphs that read it — which tells whoever changes the
classifier how it works (→ reference); and 1 250 bytes are pure instruction — the two ways
through a denial, the newline-after-`&&` rule, "if you meet a deny whose remedy you have
already applied, report it", and the scope note (→ core). `## Where this check does not reach`
opens and closes with two behavioural paragraphs — the *it does not make it impossible*
qualification and *none of these is an invitation* — which stayed in the core; the twenty
catalogued residuals between them went to the forensics.

## The three commitments from the decision record

**1. The forensics stays citable.** The core's `## Where this check does not reach` names it by
full path, and so do the reference's lede and `bin/fusion-rules`'s header comment. The
forensics file names both rule files back and states which paragraphs stayed where, so a reader
arriving from either direction can complete the thought.

**2. No measurement was devalued.** Checked rather than assumed. Every closed issue whose
closure ran through one of the two moved sections carries its own `## Measured` or
`## Evidence — measured` block, so no issue's evidence lives only in the rule file. The two
closest calls were both closed by prose in *three* places, not one:
`260802-2335` (the planted alias) put its row in the rule file **and** in `README-hooks.md`,
and `260803-2040` (ambient `CDPATH`) put its statement in `ambientCdpathIsSet`'s docstring, in
`README-hooks.md` **and** in the rule file. Nothing had to stay in the reference on this
ground. What did change is the *reach* of those closures: the residual catalogue is no longer
loaded by any agent, which is exactly the loss the user accepted at the gate.

**3. Nothing was cut toward the cap.** Verified mechanically rather than claimed. The
concatenation of the three layers was compared with the original at word-token level: of 8 559
tokens, exactly four changed, and each is a documented cross-reference repoint (three
occurrences of "above" and one "list", where a directional reference now crosses a file
boundary). Ten such repoints were applied, each asserted to match exactly once so a missed one
fails loudly rather than silently. No sentence was shortened to make a number.

## Why the reference is emitted by an agent flag and not by the `coding` pattern

The plan left this open and the briefing pointed at the `case "$AGENT"` pattern table. I probed
it instead of assuming: a plugin rule named `*-coding.md` was placed in a throwaway plugin root
and `bin/fusion-rules` run for every agent. It reached `coder`, `coderev`, `bugfixer` **and
`planner`**, which also carries `PATTERNS="coding ontology"` — a fourth agent the decision
record's audience row does not include. So the reference is emitted through a third
`case "$AGENT"` flag block (`IS_GUARD_INTERNALS_AGENT`) plus one `emit_if_exists`, the idiom
`design-diagrams.md` already uses for a targeted plugin rule. The file is named
`protected-path-internals.md` with no pattern word in it, because an audience that depends on a
filename is an audience nobody can read off the script.

The briefing's other measured fact holds: the plugin-side pattern tables still emit nothing.
`emit_pattern_in_dir "$PLUGIN_RULES_DIR"` remains dead code on the plugin path after this step,
because the new file does not carry a pattern word either.

## Files

| File | Change |
|---|---|
| `rules/protected-path-discipline.md` | 50 559 → 16 346. Core layer. |
| `rules/protected-path-internals.md` | new, 20 754. Reference layer. Provenance header cites the gate decision. |
| `circles/260801-1244-guard-rules-write/analyses/260805-0717-protected-path-forensics.md` | new, 19 090. Forensics layer, in the workbench, reachable by no emission path. |
| `bin/fusion-rules` | third agent-flag block + `emit_if_exists`; header comment rewritten for the three layers. |
| `hooks/lib/__tests__/fixtures/rules-emission.golden` | regenerated. |
| `hooks/lib/__tests__/rules-emission-golden.test.ts` | `CEILING` 150 817 → 131 685, with the history line the ratchet requires. |
| `planning/260804-2356_o_…ausstieg…md` | Step 2 marked `[DONE]` with the deviation noted. |

The three layers total 56 190 against the original 50 559. The 5 631-byte difference is new
connective text and nothing else: three ledes, the core's pointer paragraphs, the one-paragraph
fail-closed summary the core needs so a fail-closed deny is not unexplained there, and the
forensics' framing section with its layer table.

## Verification

- `npx vitest run` — **1 543 tests in 27 files, all green**, the expected baseline. Not
  `npm test`, which rebuilds `hooks/dist` (step 5 owns that).
- The golden was regenerated deliberately
  (`UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts`), the diff
  read, then re-run clean. The diff contains exactly two kinds of line: one file's size falling
  in all sixteen blocks, and a second file appearing in three of them. No other line moved.
- The provenance-header lint passes on the new rule file (header at line 3).
- `bin/fusion-rules <agent>` run for all sixteen names: the reference appears for `coder`,
  `coderev`, `bugfixer` and no other.

## Findings for other steps

- **Out of scope but now false, in `README-hooks.md`** (step 3 owns that file):
  `:205` says the ambient-`CDPATH` bound is documented "in `ambientCdpathIsSet` and in
  `rules/protected-path-discipline.md`" — that residual is now in the forensics analysis.
  `:217` says "the agent-facing statement of all of this is
  `rules/protected-path-discipline.md`, loaded into every agent at Setup" — it is now three
  layers, only one of which every agent loads. `:182` says the rule file carries the sanctioned
  revert spelling; the emphatic sentence moved to the reference, though `## What stays allowed`
  still states the same fact in the core, so this one is soft.
- **`CLAUDE.md:48`** describes the protected-path rule as stating the verb families, the
  wrappers, the fail-closed bound *and* the residuals honestly. After this cut the core states
  the rule and the residual qualification; the verb families and fail-closed detail are in the
  reference and the residual catalogue is in the workbench. CLAUDE.md was not in this step's
  scope.
- **Two source comments** now cite the rule file for a residual that moved:
  `hooks/lib/bash-mutation-guard.ts:546` ("documented … in
  `rules/protected-path-discipline.md`", the symlink residual) and `:2523` (the ambient-`CDPATH`
  bound). Both should point at the forensics analysis.
- **`issues/260804-1220_o_…`** (the illustration block still says "three questions" where the
  procedure has four) travelled with its section into the forensics analysis. Its `Affects:`
  line names `rules/protected-path-discipline.md:218`, which no longer holds. Step 3 owns it.
- **The guard did not protect `rules/` during this session**, which is
  `issues/260804-2100_o_from-a-subdirectory-cwd-the-protected-list-matches-nothing-while-fail-closed-still-denies`
  observed live: a `cp` into `rules/` with literal operands was allowed, while an earlier
  command with a `$`-built operand outside any protected path was denied fail-closed. The
  session's cwd is `fusion-workbench/`, one level below the project root. Filed already; noted
  here as a second sighting.
