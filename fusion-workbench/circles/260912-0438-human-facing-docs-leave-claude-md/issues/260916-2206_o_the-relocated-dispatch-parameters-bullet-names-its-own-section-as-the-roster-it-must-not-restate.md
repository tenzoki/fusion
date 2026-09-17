The relocated dispatch-parameters bullet names its own section as the roster it must not restate

---

`L11` moved the dispatch-parameters convention into `README-agents.md` `## Dispatch parameters`. Its first clause sends the reader to `README-agents.md` `## Dispatch parameters` and forbids restating it "here" — and "here" is now that section. The passage is a pointer to the place it sits.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence.** At `7ea6e40b`, `README-agents.md:79`, inside `## Dispatch parameters` (heading at `:51`):

> **The roster is authored once, in `README-agents.md` `## Dispatch parameters`** — that table carries the agent, the line, its values, what happens when it is absent, and who passes it … Do not restate it here; a second copy is how the planner came to be listed as domain-parameterised in four places … **Two facts belong in this file** because they shape dispatch decisions rather than describe one agent.

The roster table it names is 28 lines above, at `README-agents.md:56`. "Do not restate it here" and "two facts belong in this file" were an argument for what `CLAUDE.md` keeps when the roster lives elsewhere; at this address they argue nothing.

Nothing in the passage is false in the way `260916-2205_*` is false — the roster really is authored at that address. What is lost is the sentence's work: a reader in `## Dispatch parameters` is told to go to `## Dispatch parameters`.

**Why no gate sees it.** The path token `README-agents.md` and its anchor `## Dispatch parameters` both resolve, so `reference-resolution-lint` passes. Nothing checks whether a citation names the file it is written in.

**Scope.** `README-agents.md:79`. Same class as `260916-2205_*`, different file and different repair.

**Acceptance test.** The passage at `README-agents.md:79` no longer cites `README-agents.md` `## Dispatch parameters` and no longer says "here" or "this file" of the section it sits in — either by being folded into the table's own preamble, or by the two facts being stated without the do-not-restate argument that only made sense from `CLAUDE.md`.

**Cross-references:** 260916-1612-curator-run.md, 260916-1126_*_implementation-human-facing-docs-leave-claude-md.md
