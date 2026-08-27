An executor reached for `git stash` while two were dispatched in parallel

---

Task T3 of session `260818-2301` used `git stash` and `git stash pop` to measure a byte delta against
HEAD while a second `coder` was dispatched concurrently against a disjoint file set. The agent
reported it itself, unprompted, and named the correct alternative it should have used first
(`git show HEAD:<path>`).

For the duration of the stash, every tracked file in the working tree was reverted to HEAD, including
the other task's in-flight edits to `rules/fusion-workbench-conventions.md`, `skills/archive/SKILL.md`,
`hooks/lib/staging-drift.ts` and `CLAUDE.md`. Had the concurrent agent written during that window, its
read-modify-write would have been based on HEAD content and the pop would have collided or silently
lost the edit.

Verified after the fact at HEAD `52b1d95`: `git stash list` is empty and the working tree carries both
tasks' changes, so nothing was lost on this run. The hazard is that nothing detected it either — the
loss would have been silent.

---

No shipped text forbids it. `agents/coder.md` has no instruction about `git stash`, `git checkout` or
any other command that rewrites files the agent does not own, and the orchestrator's dispatch prompt
named a file scope without saying that whole-tree commands are outside it. A file scope reads as a
statement about which files to *edit*; `git stash` edits none of them by name and all of them in fact.

Two candidate fixes, not chosen here:

1. State it in `agents/coder.md` (and the other executors): a whole-tree git command — `stash`,
   `checkout .`, `reset`, `clean` — is never an executor's tool, and a measurement against HEAD uses
   `git show HEAD:<path>`. Cheap, and it is where the agent looks.
2. State it in the orchestrator's dispatch obligations for parallel dispatch, since the hazard exists
   only when more than one executor is in flight. Narrower, but the executor cannot know from its own
   prompt whether it is alone.

The measured case argues for the first: the agent that did it was the one holding the information that
it was unsafe, and it acted correctly the moment it reconsidered.

---

Filed by the orchestrator of session `260818-2301` after reading the executor's own report. No Circle
active, so it goes to the shared store under the Origin Rule.

---
Resolved: the prohibition is stated at the dispatch, which is the placement the user chose over the executor prompts. `agents/orchestrator.md` Step 3a item 4 gained a bullet naming the five whole-tree forms (`git stash`, `git checkout .`, `git reset`, `git clean`, `git restore .`), saying why they are never an executor's tool — they rewrite files outside the named scope, a sibling's in-flight edits included — and giving `git show HEAD:<path>` as the measurement against HEAD. Step 3b item 2b points the bugfixer dispatch at the same bullet rather than restating it, because the bugfixer writes to the live tree on the same terms and is dispatched from elsewhere. 395 bytes of the 600 the plan allowed.

The residual the user accepted is written into the bullet rather than left implicit: an executor cannot tell from its own prompt whether it runs alone, so the sentence binds a solitary executor where the command would have been harmless. Nothing enforces it — whether a command was run is answerable only from its text, which is the undecidable question this repository deleted a classifier over, and the plan claims no enforcement.
