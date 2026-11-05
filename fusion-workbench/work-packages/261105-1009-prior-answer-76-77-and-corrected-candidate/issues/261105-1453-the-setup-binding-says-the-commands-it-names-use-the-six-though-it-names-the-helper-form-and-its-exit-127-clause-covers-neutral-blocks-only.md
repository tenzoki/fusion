The Setup binding says the commands it names use the six, though it names the helper form, and its exit 127 clause covers neutral blocks only
---
The sentence that replaced "this text's own commands use those alone" is still false for the helper calls the same paragraph names. Severity: Medium; bundle bytes in all 25 parts, so a fix means 13.4.3 and no fix can reach the 13.4.2 digest.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer, in the next candidate that changes `prior` part bytes
**Cross-references:** 261105-1113-the-setup-binding-says-this-texts-commands-use-the-six-though-its-neutral-blocks-run-others.md; 261105-1023-neutral-shell-blocks-and-carried-helpers-rely-on-commands-outside-priors-guaranteed-six.md; 261105-1023-plan-fusion-13-4-2-corrected-candidate.md

**Bundle bytes:** yes. `BINDING_SENTENCE` in `catalog/src/__tests__/prior-commands.test.ts` also pins the wording, and that file is not in the payload.

**Evidence.**

- The 25 parts read "the commands this binding names use those alone. A neutral block may run others, and one that ends with exit 127 has met a host gap". Command: `grep -l "the commands this binding names use those alone" catalog/profiles/*/parts/*-prior.md`.
- 11 of them name the helper form earlier in the same paragraph: `so a helper runs as ["bash", "-c", "\"$FUSION_PLUGIN_ROOT/bin/<helper>\" <arguments>"]` (`analyst/parts/03-prior.md:3` and the same line in the other agent parts). The other 14 open "Every shell block and every helper call this text runs" (`skill-wp/parts/01-prior.md:5`).
- Helpers do not use the six alone. Request 78's own table says 27 of 31 call `dirname`, and its question 2 says every agent's Setup goes through `bin/fusion-rules`, using `awk`, `basename`, `cat`, `dirname`, `grep`, `mktemp`, `rm` and `tr`. The inventory re-ran at C″: 26 rows, 0 differences.
- The instruction names a neutral block and no helper. Run in a scratch copy on macOS with `PATH` holding only the six, a missing `dirname` gives three different exits: `bin/fusion-paths reviewer` 127; `bin/fusion-rules reviewer` 0, with `dirname: command not found` on stderr; `bin/fusion-identity` 3. Only the first meets the sentence's trigger. This is a simulation, not Prior's container.
- The earlier issue's acceptance holds, since no binding now claims the whole text. Its fix direction said "the `prior` parts use the six", and the shipped wording chose "this binding", which takes in the helper form.

**Run-time effect today.** None measured. The pinned image carried each of these commands in `261105-1034-prior-image-command-measurement.md`, with `rm` not measured. The cost is a false sentence beside request 78's table, and a model told how to read only one failure form.

**Fix direction.** Name what uses the six: the `prior` parts' own commands. State that a helper, like a neutral block, may run others, and report a `command not found` from either as a host gap, whatever the exit. Change `BINDING_SENTENCE` with it. Word it after Prior answers request 78 question 2, which may settle the guarantee.

**Acceptance.**

- No binding says that a form it names, helper calls included, uses the six alone.
- The binding's host-gap instruction covers helpers and is not limited to exit 127.
- `grep -l` over the new sentence lists the same 25 parts, `BINDING_SENTENCE` is its text, and `FUSION-CATALOG` and `CLAUDE-RENDER` of the plan exit 0.
