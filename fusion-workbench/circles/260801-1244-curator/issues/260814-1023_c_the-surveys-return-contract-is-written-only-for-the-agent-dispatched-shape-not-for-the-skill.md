The survey pass's return contract is written only for the agent-dispatched shape, not for the skill

---
`skills/curate/SKILL.md` Step 3 requires three things from the survey dispatch's report: the run
file's path, the count per consequence group plus the candidate count, and the blast-radius verdict.
`agents/curator.md` `## Tool Discipline` obliges the agent to return exactly those — but only in its
third bullet, "Dispatched by another agent". The bullet that governs the skill path says only "Each
dispatch does its own pass and nothing else."

---
**The two texts, side by side.** `agents/curator.md` `## Tool Discipline`, bullet 2: "**Dispatched
by `/fusion:curate`.** The skill body holds `AskUserQuestion`. You are dispatched twice: once with
`**Mode:** survey`, and once with `**Mode:** apply` plus the ledger path and the approved ids the
skill collected. Each dispatch does its own pass and nothing else." Bullet 3, for a dispatching
agent: "Complete the survey pass, then **return the gate question to the dispatcher** — the run
file's path, the per-group counts and the blast-radius verdict — and stop."

`skills/curate/SKILL.md` Step 3: "The agent's report carries three things this skill needs, and they
are the gate question it could not put itself," then enumerates the path, the per-group counts *plus
the candidate count*, and the blast-radius verdict.

**Why it is not merely stylistic.** The section's own opening claims the three shapes differ in one
thing only: "the gate in `## The two passes and the gate` is the one thing that depends on how you
were invoked. The two passes and the run file are identical on all three paths; only who holds
`AskUserQuestion` changes." The return contract is a second thing that differs across the bullets,
which contradicts that sentence. And the skill has no recovery for a report that omits the path: its
two stated halts cover a path outside `$OUT_HISTORY` and a file it cannot read, not a path that was
never given.

**Note also that the candidate count is asked for on one side only.** The skill's Step 5 renders
"the count of candidates as text that says they are not on offer"; no bullet of `## Tool Discipline`
asks the agent to return it, and `## Output Style` requires only that the gate prompt "names the run
file and the counts".

**Fix direction.** State the return contract once, above the three bullets, as a property of the
survey pass rather than of an invocation shape, and include the candidate count in it. Then bullet 3
keeps only what is actually specific to it, that the dispatcher proxies the question onward.

**Filed by:** coderev, reviewing `d7786eb..5b81f5a`. Circle store per the Origin Rule.

---
Resolved: Took the fix direction as filed. `agents/curator.md` `## Tool Discipline` now states the return contract once, in a paragraph directly under the section's opening sentence and above the three bullets, as a property of the survey pass: every survey report carries the run file's path, the count per consequence group, the count of candidates named as not on offer, and the blast-radius verdict, whether the agent holds the gate itself or hands the question on. Bullet 3 keeps only what is specific to it and now cites those four things instead of re-listing three of them. The candidate count, previously asked for on the skill's side alone, is in the shared contract and was also added to `## The gate`, so all three invocation shapes render the same question rather than the top-level path showing one item fewer than `/fusion:curate` does; the `## Output Style` gate-prompt bullet points at the same four. The section's opening claim that the three shapes differ in one thing only is now true. `skills/curate/SKILL.md` was not edited — its Step 3 already asked for exactly this set.
