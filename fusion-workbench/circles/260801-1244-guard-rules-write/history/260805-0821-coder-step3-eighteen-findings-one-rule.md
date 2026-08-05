# Session: Step 3 — the eighteen open findings closed by one rule

**Date:** 2026-08-05
**Agent:** coder
**Status:** Complete
**Circle:** `circles/260801-1244-guard-rules-write`
**Plan:** `planning/260804-2356_o_plan-ausstieg-kontextsteuer-und-auslieferung.md`, Step 3
**Predecessor:** `history/260805-0717-coder-step2-drei-schichten.md` (the three-layer cut this step writes into)
**Baseline:** `b67a386` (steps 1 and 2 committed). Not committed — the orchestrator commits.

**Voice profiles:** `bin/fusion-rules coder` emitted `./fusion-workbench/stilwerk/chat-voice-en.yaml`.
The dispatch asked for a German report, so `chat-voice-de.yaml` was read directly and applied to
the chat report. `CLAUDE.md` carries no `**Language:**` line, so the helper resolved its documented
`en` default — the same observation the two preceding session files record.

---

## The three sentences

**Not every finding fitted a branch.** Twelve of the eighteen took one branch cleanly; six did
not, and the reason is one distinction the rule does not draw — **who owns the file the false
sentence lives in**. Five findings were closed by correcting text, two were written into the
residual catalogue and stayed open, two needed *both* branches at once, six are branch-A defects
whose sentence is a source comment, a test docstring or a seeded JSON template that this step does
not own, and three are neither A nor B. **Branch C is empty**: under the Origin Rule not one of
the eighteen belongs anywhere but this Circle, and the plan's three named examples all arose from
this Circle's own Directive.

**No sentence in either rule layer still claims a coverage `GIT_WORK_TREE` refutes.** One did, and
it was the load-bearing one: `rules/protected-path-internals.md` said an operand is checked
"against **every** directory the guard can attribute to the invocation". It now says "each
directory a global option **on the command line** redirects git to", and the paragraph after it
draws the boundary with a measured three-row control. Hunted for rather than assumed, over both
files.

**Bytes per agent group, after this step:** seven plain agents **114 545** (was 110 931), six
design-diagram agents **120 218** (was 116 604), and `coder` / `coderev` / `bugfixer`, who carry
both rule layers, **136 442** (was 131 685). **The CEILING ratchet is breached by 4 757 bytes and
was NOT raised** — see `## The ceiling, and why it is left red` below.

---

## The rule, and where it did not reach

The plan's rule is three branches: **A** a delivered sentence is false, correct it and close;
**B** the classifier would have to be more capable, do not fix it, write the gap into the residual
catalogue and leave the finding open; **C** it is not this Circle's Directive, move it to the
shared store.

A and B are cut by the **kind** of defect. C is cut by the **subject matter**. Each branch also
prescribes a **remedy** and a **marker**, and the remedy silently assumes the false sentence lives
in a file the step owns. Those three axes come apart, and that is the whole of what went wrong:

| Shape | Count | What the rule does not supply |
|---|---|---|
| A, sentence in a file this step owns | 5 | — |
| B, capability gap | 2 | — |
| **A and B at once** | 2 | one branch says close, the other says stay open |
| **A-shaped, foreign file** | 6 | A's remedy is unavailable, so the marker cannot go `_c_` |
| Neither A nor B, arose here | 3 | C's move is wrong; only C's "neither" half applies |
| C, move to shared | **0** | — |

**Branch C is empty and its criterion is false for all three of its own examples.** The plan sends
`260803-1352`, `260804-1605` and `260804-1606` to the shared store "because they do not belong to
this Circle's Directive". All three do. The Directive says each exempted write "emits a
`guard_advisory` event … so the user reads the exempted writes in `.guard-state/events.jsonl` and
on the monitor dashboard" — which is `260803-1352`'s subject; it says "`/fusion:setup` seeds a
template that declares inheritance and lists no paths" — `260804-1605`; and C5b is what made
`escalation.blocksBeforeHalt` settable from a project file at all — `260804-1606`. The Origin Rule
is origin, not durability, and it warns in so many words that a rule built on a prognosis produces
a different answer from every agent that applies it. None of the three was moved.

**The two-branch cases are the first falsification, taken at its word.** `260804-2100` and
`260804-1427` are each a delivered sentence that is false *because* the guard has a reach nothing
recorded. Correcting the sentence and writing the residual are one act, and the markers the two
branches prescribe contradict each other. Both stay `_o_`, because in both the behavioural half is
a decision nobody has taken.

---

## The assignment

| Finding | Sev | Branch | Target | The sentence that was false |
|---|---|---|---|---|
| `260803-1402` | Low | **A** → `_c_` | core + `README-hooks.md` | "**There is no override for a protected-path shell write.** That is deliberate." — and the same in `README-hooks.md`. `FUSION_ALLOW_RULES_WRITE` is exactly such an override, and the same file had named it 370 lines earlier. |
| `260804-1025` | High | **A** → `_c_` | core | question 3: "Yes → **the model stays exact** and this rule denies nothing." |
| `260804-1223` | High (inh.) | **A** → `_c_` | core | the evidence for the row above; closed with it, as the record asks |
| `260804-1220` | Low | **A** → `_c_` | forensics + core | "if you can answer **the three questions**" in a procedure that has four; and question 2's parenthetical restating a safe-list as the closed pair "`||` or `|`" |
| `260804-1349` | Med | **A** → `_c_` | core | question 1: "**Does it contain a directory builtin at all?** No → this rule cannot touch it" — falsified by `git -C $D` and `--work-tree=$W` |
| `260804-1332` | **High** | **B** → `_o_` | reference + forensics | (branch B, but the hunt it triggered found one: "against **every** directory the guard can attribute to the invocation") |
| `260804-0839` | Med | **B** → `_o_` | forensics + core | — |
| `260804-2100` | Low | **A+B** → `_o_` | core + forensics | "The patterns are **project-relative**: in a consuming project `rules/**` means that project's own `rules/` directory" |
| `260804-1427` | Med | **A+B** → `_o_` | core + forensics | "It lives in the plugin's own `hooks/config.json` … so **every project on this plugin gets the same list**" |
| `260804-1027` | Low | A-foreign → `_o_` | `bash-mutation-guard.ts` docstring | (real, unreachable from here) |
| `260804-1221` | Med | A-foreign → `_o_` | `shell-parse.ts` + source test | ditto |
| `260804-1222` | Low | A-foreign → `_o_` | `shell-parse.ts` docstring | ditto |
| `260804-1350` | Low | A-foreign → `_o_` | `DirStack` docstring | ditto |
| `260804-1351` | Low | A-foreign → `_o_` | `DIR_BUILTINS` comment | ditto |
| `260804-1605` | Med | A-foreign → `_o_` | `templates/fusion-guard.json` | **three** sentences, not the two filed — see below |
| `260803-1352` | Low | neither → `_o_` | `hooks/guard.ts` | — |
| `260804-0842` | Low | neither → `_o_` | git gold fixture | — |
| `260804-1606` | Low | neither → `_o_` | `hooks/lib/config.ts` | — |

Every one carries a `**Step 3 disposition**` block naming its branch, its target and, where it
stays open, what closes it. Five renamed `_o_` → `_c_`; thirteen still open, which is 18 − 5.

**`260804-0839` is counted once.** It stays in this Circle's issue store and cites
`circles/260804-1205-shell-reachability-model`, where `decisions/260804-0947_i_…` already located
its fix. Reach is cited, never placed.

---

## What was written, by file

### `rules/protected-path-discipline.md` — the core, 16 346 → 19 960

Six edits, five of them a correction a finding demanded and one a count.

- **The protected list** now says the plugin's list is the default and not the answer: a project's
  `fusion-guard.json` overrides it, a declared empty list really is empty, and the guard's own
  state directory goes with the rest. (`260804-1427`)
- **The coordinate space** now says the patterns are matched against the session's working
  directory, with the measured pair and the sentence that discharges the agent-facing half — an
  allow there is not a permission. (`260804-2100`)
- **`### The overrides waive only what they name`** names the one override, scopes it, and adds
  the two things that still deny with the flag set: case is not folded, and a hard-linked rule
  file is refused. (`260803-1402`)
- **Questions 1, 2 and 3** of the decision procedure. (`260804-1349`, `260804-1220`,
  `260804-1025`/`260804-1223`)
- **`## What to do instead` step 1** no longer says flatly that "a differently-worded command is
  the same command"; it says every rephrasing *of that kind* is, and that reaching for one that
  does escape is the act the rule forbids. (`260804-1332`, indirectly — it was the one remaining
  coverage claim in the core.)
- **The residual pointer** was "Twenty residuals"; the catalogue holds 19 and now 21. Corrected
  to 21, and it names the two an agent can meet on ordinary work.

### `rules/protected-path-internals.md` — the reference, 20 754 → 21 897

One correction and one new paragraph, both `260804-1332`. The "every directory the guard can
attribute" claim is narrowed to the command line, and the paragraph after it states the
environment boundary with the control that separates the two spellings:

```
cd build && GIT_WORK_TREE=../rules git clean -fdx        allow   → rules/ emptied
cd build && env GIT_WORK_TREE=../rules git clean -fdx    allow
cd build && git --work-tree=../rules clean -fdx          DENY    → rules
```

The wrapper-hopped row was argued from the mechanism when `260804-1332` was filed and is now
measured. The paragraph also says the one thing a reader would otherwise get wrong: a plain
`GIT_WORK_TREE=rules git clean -fdx` **does** deny at the project root, on the root's own
write-through rule and not because the variable was read.

### The forensics analysis — 19 090 → 23 949

Two new residuals, which are the first two in the catalogue and are a **third shape** the framing
paragraph did not have: writes the classifier sees in full and allows because the *list* it
matches them against is not the list the reader assumed. Plus the "three questions" correction,
the routing line on the `260804-0839` edge, and the wrapper-hopped `GIT_WORK_TREE` row.

### `README-hooks.md` — 42 709 → 45 498

The two "no override" halves this step owns, a `FUSION_ALLOW_RULES_WRITE` row in the tuning table,
the hard-link paragraph — and the three mislocations step 2 reported: `:205` (the ambient-`CDPATH`
bound, which moved to the forensics), `:217` (which said the agent-facing statement is one file
loaded into every agent; it is now a three-layer table), and `:182` (the sanctioned revert
spelling, now cited to the layer that carries each half).

---

## The ceiling, and why it is left red

`npx vitest run` finishes at **1 541 of 1 543 passing, 26 of 27 files**. The two failures are both
in `rules-emission-golden.test.ts`, and they are the ratchet doing its job rather than a defect:

```
CEILING (131685) no longer equals the highest per-agent total (136442).
```

**CEILING was not raised.** Its own docstring is unambiguous — *"It may only ever be LOWERED"*,
*"History (lower it, never raise it)"* — and the assertion message repeats it. That is an
invariant step 1 of this plan established precisely so this question gets asked out loud, and it
is not this step's to answer. Two further reasons agree with the first: `rules-emission-golden.test.ts`
is a `.ts` source file, which this step's scope excludes, and the fixture regeneration the dispatch
sanctioned explicitly *cannot* clear a ceiling breach by design.

**The breach is self-closing at the next step.** Step 4 removes `## Stashes` (5 745) and
`## Commit lock` (2 739) from `fusion-workbench-conventions.md` for fifteen of sixteen agents,
`coder` / `coderev` / `bugfixer` among them: 136 442 − 8 484 = **127 958**, which is below the
131 685 ceiling standing today. So after step 4 the ceiling is not merely satisfied, it is due to
be *lowered* again, which is the direction the ratchet permits.

**Where the growth went, honestly.** +3 614 bytes to the file all sixteen agents load and +1 143
to the one three of them load. That is a real increase in the context tax inside the Circle whose
parent goal is to reduce it, and the plan's own risk table anticipated it. The offsetting fact,
and it is not a small one: every byte of it corrects a statement that was **false** in a file
loaded on every dispatch in every consuming project, and two of those statements were actively
misleading about what the guard protects. About 1 250 bytes of a first draft were compressed out
before this measurement; what remains did not compress without dropping a correction.

**Golden diff, read rather than accepted.** Exactly two kinds of line move: one file's size in all
sixteen blocks, and a second file's in three of them, with the totals following. No path appeared,
none disappeared, no other file's size changed.

---

## Two things found on the way that are not among the eighteen

**1. `hooks/dist` is stale IN THE INDEX, not only in the working tree, and it silently reverses
measurements.** The first measurement of `260804-2100` was taken against `hooks/dist` and every
row *allowed*, including the controls — `git --work-tree=rules clean -fdx`,
`cd -P build && rm out.js` and `git -C rules clean -fdx` all came back allow. Compiling `hooks/`
to a scratch directory and re-measuring gave the true answers.

The provenance, checked rather than inferred: `git diff hooks/dist` is **empty**, so the working
copy is exactly what is committed — and `git log -1 -- hooks/dist/lib/bash-mutation-guard.js`
names `9ab5a2a` (2026-08-01) while `git log -1 -- hooks/lib/bash-mutation-guard.ts` names
`ac20f7d` (2026-08-04). The compiled guard at HEAD predates the git-directory work, the modifier
give-up and the case fold. The plan's `## Ausgangslage` recorded a stale `dist` in the working
tree; it is stale in the **committed tree**, which is what a consuming project would install.

Two consequences. Anyone measuring the classifier before step 5 lands must build first. And step 5
is not housekeeping: it is the difference between shipping the rule text corrected here and
shipping a hook that does not implement it.

**2. `templates/fusion-guard.json` is now wrong in a third way, and it is the worst of the
three.** `260804-1605` filed two false sentences and asked for a missing clause on `_override`.
Measured against `hooks/lib/config.ts:628-631` —
`project.raw.guard?.[key] ?? plugin.raw.guard?.[key] ?? DEFAULTS.guard[key]` — the whole
`_override` key is now backwards:

| `_override` ships | Actually |
|---|---|
| "The merge is per top-level key" | per **leaf** |
| "the object you write REPLACES the plugin's object of that name whole — it is not merged field by field" | it **is** merged field by field |
| "any field you leave out … falls back to fusion's built-in default, not to the plugin's file" | an omitted leaf falls back to **the plugin's file** |

All three were true when Step 7 wrote them and were falsified by Step 2 of the C5b remediation
plan, which changed the merge to close `260804-1601`. The template is copied verbatim into every
consuming project. Recorded on `260804-1605`, which stays `_o_` for `ontocoder`.

**This one also caught an error of my own.** My first draft of the core's protected-list paragraph
repeated the Directive's wording, "overrides per top-level key". That is what the Circle record
says and it is no longer what the code does. Corrected in the core and in the forensics entry
before the measurement above was taken.

---

## Out of scope, reported rather than fixed

- **`CLAUDE.md`** carries the third copy of the "no env override" sentence, at the line the
  260804-1021 reconciliation named. The correction of `260803-1402` is therefore complete in two
  files of three. Named on the issue.
- **Two source comments** in `hooks/lib/bash-mutation-guard.ts` cite `rules/protected-path-discipline.md`
  for residuals that moved to the forensics analysis (the symlink residual and the ambient-`CDPATH`
  bound). Reported by step 2; still true; not this step's files.
- **`260804-1601`, `260804-1602` and `260804-1603` carry `_c_` with no closure note in their
  bodies.** They were genuinely closed —
  `history/260804-1725-coder-step2-project-layer-boundary.md` is the work — but a reader checking
  `260804-1605`'s sequencing condition has to reconstruct that from a history file. A reconciler
  question, recorded because this step depended on the answer.

---

## Verification

- `npx vitest run` — **1 541 / 1 543 passing, 26 / 27 files**. The two failures are the ceiling
  assertions above and nothing else; the golden's own path-set and per-file assertions pass.
  Not `npm test`, which rebuilds `hooks/dist` (step 5 owns it).
- **Every command asserted in the edited text was measured**, against `hooks/` compiled fresh to a
  scratch directory rather than against `hooks/dist`: the three give-up rows in question 3, the two
  git-directory rows and two controls in question 1, the three-row `GIT_WORK_TREE` control block,
  and the five-row subdirectory-cwd block on `260804-2100`.
- `260804-2100` was **re-verified independently** before being classified, as the dispatch
  required, and is confirmed as filed — including the asymmetry, which is what makes it two
  branches rather than one.
- The residual count in the core was checked against the catalogue rather than carried: 19 before
  this step (the core said twenty), 21 after.
- Issue markers: 13 `_o_`, 51 `_c_` in this Circle's store, from 18 and 46.
