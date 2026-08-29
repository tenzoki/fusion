# Turn 3, task T3-7 — two shipped documents described a guard that no longer exists

**Status:** Complete
**Agent:** coder
**Circle:** `260801-1244-guard-rules-write`
**Closes:**
`260802-2331_*_readme-hooks-states-bash-has-no-halt-check-which-this-turn-made-false.md` (High),
`260802-2335_*_the-stated-residual-list-omits-the-alias-an-agent-can-plant-for-itself-in-one-allowed-command.md` (Medium)
**Files:**
`260803-1402_*_should-the-mutation-classifier-inspect-a-read-operand-to-close-the-planted-alias.md` (open, direction 2 of `260802-2335_*_the-stated-residual-list-omits-the-alias-an-agent-can-plant-for-itself-in-one-allowed-command.md`),
`260803-1402_*_step-9-must-also-document-that-a-hard-linked-rule-file-is-not-exempt.md` (Low, the deferred piece)
**Scope touched:** `README-hooks.md`, `rules/protected-path-discipline.md`. Nothing else.
**Tests:** 1080 passed, 23 files — identical to T3-6's closing count, as it must be: no
code changed.
**`hooks/dist/`:** `npm run build` and `npm test` each rewrote eight tracked files.
Restored with `git checkout -- hooks/dist` after the final run; `git status --short
hooks/` then shows only the four untracked `dist/lib/{fs-locator,rules-write-exemption}.
{js,d.ts}` that were already present on arrival. Plan Step 10 owns those. No version bump.
**Not committed.** The orchestrator commits after validation.

## Why this task measured instead of reading the diff

Both issues were written before three of this Turn's four commits existed, and both
describe behaviour rather than code. A documentation task that reads the diff and
paraphrases it produces a document that is true of the diff and not necessarily of the
program. So every claim left in either file about the halt was checked against a running
guard.

The harness: a throwaway consuming project (`fusion-workbench/.fusion-setup`, a `rules/`,
an `agents/`, a `build/`, an unprotected `notes.txt`), the real `hooks/dist/guard.js` as a
subprocess, the shipped `hooks/config.json` protected list (the guard finds it by walking
up from the hook module, so a throwaway cwd gets the real list), `escalation.json` seeded
per row, and `CLAUDE_PLUGIN_ROOT` set so the reason strings render their real path. It had
to be a separate project directory rather than this repo, because in the plugin's own repo
the whole write guard — protected-path check and halt, on both surfaces — stands down.

The guard's own protected-path rule fired on the first attempt to build the harness, which
is worth recording: `rm -rf "$SP/proj"` denied fail-closed. The way through was the one
the deny reason names, writing the path out literally. It cost a minute and it is the
behaviour `rules/protected-path-discipline.md` documents, met from the agent side.

## Finding 1 — the halt sentences

### Measured, at HEAD

```
                                          halt OFF        halt ON
  Bash  rm notes.txt      (unprotected)   allow           [HALTED] shell
  Bash  mv notes.txt other.txt            allow           [HALTED] shell
  Bash  echo hi > out.txt                 allow           [HALTED] shell
  Bash  rm rules/x.md     (protected)     protected-path  [HALTED] shell
  Bash  ls -la                            allow           allow
  Bash  git status                        allow           allow
  Bash  cat rules/x.md                    allow           allow
  Bash  git switch main                   branch policy   branch policy
  Edit  notes.txt         (unprotected)   allow           [HALTED] write
  Edit  rules/x.md        (protected)     protected-path  [HALTED] write
  Write agents/coder.md   (protected)     protected-path  [HALTED] write
```

Four facts came out of that table which neither issue stated and which the corrections
rest on:

1. **The shell halt is broader than the protected-path check it sits above.** It fires on
   `mutation.mutates`, which is true for any recognised write whatever it targets, and is
   computed even when `protectedPaths` is empty (`bash-mutation-guard.ts:1556-1559`). So
   `rm notes.txt` is denied under a halt. Describing the halt as "the protected-path check
   plus the write tools" would have been wrong in the direction that surprises an agent.
2. **The two reason strings differ**, and both are now quoted verbatim in both documents.
   An agent that has read `[HALTED] All write operations blocked.` and then meets
   `[HALTED] All file-mutating shell commands are blocked. … Read-only commands still run.`
   has no reason to believe it is the same control unless something says so.
3. **A branch-policy deny still reports the branch policy under a halt**, because STEP 1
   returns above STEP 2a (`guard.ts:327-346`). Measured, not inferred.
4. **The halt stands down in the plugin's own repo, on both surfaces together** — the Bash
   halt is inside the `isFusionPluginCwd()` gate and the write path returns above CHECK 1.
   This one is verified by an existing test rather than by my harness
   (`guard-rules-write-integration.test.ts`, "stands down in the plugin's own repo, on
   BOTH surfaces together"), which is why the rule file's stand-down bullet now says so.

The three `guard_halt` event details `d77eda8` introduced were read back out of the
throwaway project's `events.jsonl` rather than taken from the source comment:
`Halt active — write tool call blocked`, `Halt active — mutating Bash command blocked:
<segment>`, and `Halt raised by this block — <cause>` (produced by seeding
`consecutiveBlocks: 2` and denying once more).

### What changed

`README-hooks.md:143` was replaced entirely. Every clause of it was false: the halt covers
both surfaces, `Bash` has a halt check, and the final clause inverted the order.

`rules/protected-path-discipline.md`'s halt paragraph was replaced and given its own
heading, `### What a halt costs you`. It was previously four lines at the end of "What to
do instead" with no anchor of its own, which is thin for the one paragraph that tells an
agent what a repeated deny costs it. It now quotes the shell string in full, states that
this is not a new policy and that there is nothing to rephrase, names the write-tool
string beside it, says explicitly that reading still works and why, and closes with both
surfaces as the cost.

### One correction neither issue named

`README-hooks.md:141` opened "**Four** things cause a block, and only these" and listed
four, omitting the git branch/worktree deny. That deny calls `recordBlock` with trigger
`git_branch_switch` exactly as the others do (`guard.ts:327-346`) and counts toward the
same three-block halt; measured above. A sentence asserting completeness, sitting two
lines above the sentence I had to rewrite, could not be left false. Now five.

## Finding 2 — the residual list

### Re-measured rather than trusted

The issue's evidence was gathered in Turn 2, before `3b0f9e7`, `245b8b7` and `d77eda8`.
Re-run at HEAD with `FUSION_ALLOW_RULES_WRITE`, `FUSION_ALLOW_BRANCH_SWITCH` and
`FUSION_ALLOW_WORKTREE` explicitly removed from the environment (`env -u`), then the
allowed commands actually executed:

```
  ln -s ../agents/coder.md build/alias      allow
  cp -l agents/coder.md build/hardalias     allow
  echo pwned > build/alias                  allow
  echo pwned2 > build/hardalias             allow
  Edit build/alias                          allow
  (control) rm agents/coder.md              DENY
  (control) echo x > agents/coder.md        DENY

  agents/coder.md after `echo pwned  > build/alias`     : pwned
  agents/coder.md after `echo pwned2 > build/hardalias` : pwned2
```

Unchanged from the issue, and the `Edit` row is an addition: the write-tool surface
reaches the planted alias too, so the row says "on both surfaces".

### What changed

The row went into `rules/protected-path-discipline.md`'s "Known and accepted" list
**third**, immediately after the two residuals it contrasts with, and opens "Unlike the
two above, the guard sees the whole command and resolves every operand." Framed as the
others are: what is allowed, why, what closing it would cost, and the normative close that
an agent noticing the route has met the same denial it would have got by naming the file.

Two edits fell out of adding it, and both were needed for the file to stay internally
true:

- **The section intro promised the wrong boundary.** It said only that "a shell can
  construct a path at run time, and fail-closed covers the constructible cases the
  classifier can see". Every entry underneath shared that shape, and this one does not.
  One sentence now names the two shapes a gap can have, so the new row is not read as an
  exception to the section it lives in.
- **"Copying *out of* a protected directory is never the problem" was falsified by the
  finding itself.** `cp -l rules/x.md /tmp/y` copies out of a protected directory and is
  exactly the problem. The sentence now separates copying a protected file's CONTENTS
  (fine, and `cp rules/x.md /tmp/backup` stays in "What stays allowed") from giving it a
  second NAME.

`README-hooks.md`'s residual paragraph gained the same admission, placed first and marked
as the largest gap. Leaving it out of one document while adding it to the other would have
put the two shipped lists of "known and accepted" into disagreement about the cheapest
residual.

### Direction 2 — filed, not implemented

`260803-1402_*_should-the-mutation-classifier-inspect-a-read-operand-to-close-the-planted-alias.md`,
per the issue's own instruction that it wants a decision record.

It had to be filed rather than dropped, for a reason the issue does not give: closing
`260802-2335_*_the-stated-residual-list-omits-the-alias-an-agent-can-plant-for-itself-in-one-allowed-command.md` with direction 1 puts direction 2's analysis inside a closed issue, and the
row that just shipped calls the residual **accepted**. That row is wrong the day a deny
lands, so the question needs somewhere to live that is not a closed file.

The recommendation is option 1 (leave it), at low confidence and explicitly deferred to
the user. The reasoning that decides it: on the GRANT side, `exemptible: false` on `ln`
narrows a permission and costs nothing, because no rule-curation workflow creates aliases.
On the PROTECTION side, denying a read operand widens a denial, closes one spelling of the
class rather than the class, and breaks an invariant ("only the operands a verb writes
count") that an agent can hold in memory and that keeps every legitimate read allowed. An
agent that has learned "reads are always fine" and then meets a denied `cp -l` is in the
exact position the rule file exists to prevent — an unexplained deny followed by a
rephrasing that works. Marked `inference:` in the record, because I did not implement
option 2 and have not measured what it would break.

## The undocumented-flag coherence problem, and what I did about it

`FUSION_ALLOW_RULES_WRITE` appears in no shipped document, and both documents assert the
opposite of its existence:

- `rules/protected-path-discipline.md`: "**There is no override for a protected-path shell
  write.** That is deliberate."
- `README-hooks.md`: "There is no env override for a protected-path shell write; the
  answer is a human decision."

Both sentences are false at HEAD and both are plan Step 9's, named in `260802-2331_*_readme-hooks-states-bash-has-no-halt-check-which-this-turn-made-false.md`. Left
alone.

**Findings 1 and 2 turned out not to need the flag at all.** The halt correction is
complete without it: the halt sits ABOVE the exemption on both surfaces, so "every
recognised mutation, whatever it targets" is the whole truth and mentioning a grant the
halt ignores would only invite an agent to try it. The residual row is complete without it
too — the plant needs no permission. I removed the phrase "with no flag set" from both
drafts for that reason: it was accurate, and in a document that says no flag exists it
reads as a hint at one, which is the undefined-referent failure `user-facing-output.md`
names.

**The hard-link piece (direction 3 of `260802-2332_*_the-nlink-heuristic-locks-out-legitimately-hard-linked-rule-files-with-no-diagnosable-reason.md`, deferred to me by T3-2) I did NOT
write, and that is a judgement call.** It cannot be stated without naming the flag, and
naming the flag inside a file that says the flag does not exist ships a self-contradiction
in a security document. Making it coherent means correcting both "no override" sentences
and adding the tuning-table row, which is Step 9's stated scope and most of its substance
— the thing this task was told not to do quietly.

So: deferred, and filed as
`260803-1402_*_step-9-must-also-document-that-a-hard-linked-rule-file-is-not-exempt.md`
so it is not lost. `260802-2332_*_the-nlink-heuristic-locks-out-legitimately-hard-linked-rule-files-with-no-diagnosable-reason.md` is already closed and the only surviving record was a
"Considered and deliberately not done" section in T3-2's history. The issue names all
three things Step 9 must now land together (the table row, the two corrected sentences,
the hard-link non-exemption with its reason), so Step 9 absorbs one coherent edit rather
than three that reference each other.

The reason itself, for whoever writes it: `realpath` can prove where a symlink goes and
can prove nothing about a second name pointing at the same inode, so the exemption cannot
show that writing this name writes only a rule file. Worth naming `rsync --link-dest`,
`cp -al` and `git clone --local`, because none of them is a state a user chooses.

## Considered and deliberately not done

**The `guard.enabled` tuning table's "Advisory-only (warns, never blocks)" row.** It is
imprecise in a way this Turn did not create: an empty `protectedPaths` does not stop the
branch policy blocking, and three branch denies still raise a halt, which then blocks
every mutating shell command regardless of the empty list. The row is self-consistent for
the checks it names (no protected-path blocks means no counter, means no halt), so it is
misleading only for a reader who also switches branches. Pre-existing, out of both issues'
scope, and correcting it properly means describing the branch policy inside a
protected-path table. Left alone; recorded here so it is a decision.

**Saying in the rule file that a halt reports the halt while a branch deny reports the
branch policy.** True and measured, but it is an ordering detail about a policy the
sibling rule owns, and the paragraph is already the longest in the file. It went into
`README-hooks.md`, where the reader is a human tuning the guard, and not into the file
every agent loads on every dispatch.

**Any code.** Both issues are documentation. Every behaviour these documents now describe
was already committed in `49bb4da`, `3b0f9e7`, `245b8b7` and `d77eda8`.
