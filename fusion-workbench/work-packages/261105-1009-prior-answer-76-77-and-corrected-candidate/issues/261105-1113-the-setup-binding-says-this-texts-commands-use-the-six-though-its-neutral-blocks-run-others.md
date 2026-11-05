The Setup binding says this text's commands use the six, though its neutral blocks run others
---
Every Setup `prior` binding now states "this text's own commands use those alone". For twelve profiles the same rendered text carries neutral commands outside the six, and `skill-cadence` states both in one part. Severity: High, because the sentence is bundle bytes and main takes no shipped commit after C″.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer, before the release commit of 13.4.2
**Cross-references:** 261105-1023-plan-fusion-13-4-2-corrected-candidate.md; 261105-1034-prior-image-command-measurement.md; 261105-1023-neutral-shell-blocks-and-carried-helpers-rely-on-commands-outside-priors-guaranteed-six.md

**Evidence.**

- The sentence is in 25 parts: the nine `03-prior.md`, `orchestrator/parts/07-prior.md`, `policy-curator/parts/05-prior.md` and the fourteen skill `01-prior.md` that `grep -l "this text's own commands use those alone" catalog/profiles/*/parts/*-prior.md` lists.
- "This text" is not limited to the `prior` parts. The same paragraph opens "**Every command this text runs, in Setup and after it, is one `host.exec.v1` call**", and the neutral blocks are among those commands. `skill-cadence/parts/01-prior.md` says "What a neutral block of this text runs is not guaranteed" at line 13.
- The measurement's `### The two inventories`, with no neutral part changed in `9fcfc148..af36d055`, puts outside-the-six commands in shell fences of `orchestrator`, `skill-archive`, `skill-cadence`, `skill-check`, `skill-discuss`, `skill-memo`, `skill-migrate`, `skill-post`, `skill-setup` and `skill-wp`. Read directly: `orchestrator/parts/16-neutral.md` `date -u`, `skill-cadence/parts/10-neutral.md` `find`, `ls`, `grep`, `skill-cadence/parts/12-neutral.md` `python3`.
- Its prose column adds `consultant/parts/12-neutral.md` (`date +%y%m%d-%H%M`, a text and not a rule, so "Where a rule says" does not cover it) and `skill-help/parts/22-neutral.md` (`ls`).
- `catalog/src/__tests__/prior-commands.test.ts` holds the sentence as `BINDING_SENTENCE`, so the test requires the false wording.
- The wording is the plan's own, step 3, and the implementer followed it. The plan's `## Approach` says the opposite: "Measured, that does not make a run six-only."

**Why it matters.** A model that meets a neutral `grep` under this sentence may rewrite the block, or read an exit 127 as its own error. `skill-cadence/parts/01-prior.md` line 13 gives the right instruction and only that part has it. Prior also reads this text beside request 78's inventory.

**Fix direction.** Scope the sentence to what is true: the `prior` parts use the six, a neutral block may run others, and an exit 127 is a host gap to report. Change `BINDING_SENTENCE` with it. Keep the clock clause. `skill-cadence/parts/01-prior.md` line 13 then needs no second statement of the same fact.

**Acceptance.**

- No Setup binding claims that the commands of the whole text use the six.
- `grep -l` over the new sentence lists the same 25 parts, and `BINDING_SENTENCE` is its text.
- `FUSION-CATALOG` and `CLAUDE-RENDER` of the plan exit 0.
