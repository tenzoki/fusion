The post body's draft dotfile survives Step 3's stop and an interrupted run, and nothing removes it
---
`skills/post/SKILL.md:52` (since `5f544591`, plan step 32) writes the draft with the `Write` tool to `"$WORKBENCH/.post-draft-$CHECKOUT"` in Step 2. The file leaves the workbench root on exactly two paths: Step 5 (`:74`) moves it into the store on yes, and `:76` removes it on change or cancel. Two paths leave it in place:

- Step 3 (`:60`, "**Compose nothing** when … Say that in one line and stop") comes after the write and removes nothing. Before step 32 the draft was a variable (`$DRAFT`) and a stop left nothing behind.
- A run interrupted between Step 2 and Step 5 (the session ends, the user never answers the question).

The body says of the file that "no staging list names" it and `/fusion:cleanup` does not commit it, which is true and is the problem: a leftover sits at the workbench root in none of `rules/workbench-tracking.md`'s four classes, `bin/fusion-staging-drift` reports it `unclassified` on every commit from then on, and the next `/fusion:post` run overwrites it silently. The plan's risk row for the step ("the file is removed on both branches of the gate") covers only the two paths that reach the gate.

Acceptance: Step 3's stop removes the draft file where one was written, and Step 2 removes a leftover `.post-draft-$CHECKOUT` before writing (naming it in one line), so the file exists only between a write and the gate's answer; `grep -c 'post-draft' skills/post/SKILL.md` is at least `5`; `cd hooks && npm test` exits 0 (`skills/` head-room is 72 bytes at `bf515cad`, so the edit names its cut).
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
Executor: `coder`. Found in the closing review `260922-1208-reviewer-closing-pass-over-the-51-issue-package-451bb312-to-bf515cad.md`.
