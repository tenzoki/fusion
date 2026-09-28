The message step reads `agentstate.yaml` five steps after the pipeline deleted it

---

`skills/post/SKILL.md` `## Step 2: compose the draft` sources the commit range from "`session.git_head_at_start` from `agentstate.yaml`". On the inline path that file is gone: `skills/cleanup/SKILL.md` `## Step 1 — Close the session: file issues for open tasks`, item 4, says "Delete `fusion-workbench/agentstate.yaml` if it exists", and Step 6's message half runs five steps later. The phrase that used to anchor the value survived only in the text this Circle cut — the pre-cut `### The message half` read "the commit range (`session.git_head_at_start` **from Step 1's read**, to `HEAD`)" (commit `b0705cc4`), and the replacement names the file instead of the read.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

The pipeline already knows this hazard and states it once, for the other consumer of the same field: `agents/orchestrator.md` says to run `bin/fusion-review-coverage` "before the Cleanup step deletes `agentstate.yaml` (the helper reads `session.git_head_at_start` from it for the range's start)". Cleanup carries the matching capture for exactly one field and no other — Step 1 item 1 says "**Capture the session's domain here, before anything deletes the file**", holds it as `$DOMAIN`, and names Step 3 as the consumer. Nothing does the same for the two fields the message step needs.

Two fields, not one. The commit range is `session.git_head_at_start`; the pointer block's second element, "the basename of this session's history file", is `session.history_file`, and `skills/post/SKILL.md` names no source for it at all.

Three shapes the defect takes, and they are not the same case:

1. **Full `/fusion:cleanup` run.** Step 1 deletes the file, Step 6 asks for two of its fields. The executor either invents a range or reports it could not be read; neither is written down.
2. **`/fusion:post` invoked by name outside an orchestrator session.** `agentstate.yaml` never existed. `## Step 3: nothing to say is an answer` enumerates two compose-nothing conditions — not a git repository, and nothing to report — and an unreadable session anchor is neither of them.
3. **`--only forum`.** Step 1 does not run, so the file survives and the read succeeds. This is the one shape that works, which is why the defect does not show up in the invocation the body was tested against.

The fix belongs on the cleanup side, not in `post`: `post` is right to name the file it reads, and the pipeline is what destroys it. Either Step 1 captures `git_head_at_start` and `history_file` beside `$DOMAIN` and Step 6 hands them to the body, or Step 1's delete moves after Step 6. `bin/fusion-events turns` reads `session.history_file` out of the same file and is a third consumer worth checking against whichever answer is taken.

**Acceptance test:** a full `/fusion:cleanup` run on a session with commits in its range produces a pointer block carrying a resolved range and a history basename; the standalone shape either resolves both or names an explicit third compose-nothing condition; the source of each field is written down once, in the body that consumes it or in the step that captures it, and not in both.

---
Resolved: the fix went on the cleanup side, as the record asked, and it follows the `$DOMAIN` precedent in the
same step rather than moving the delete. `skills/cleanup/SKILL.md` Step 1 item 1 now captures both fields
beside the domain, before item 4 removes the file, reading them with the `sed` one-liner `agents/orchestrator.md`
already documents so the prompt and the step cannot disagree about what a field says. An unread field is held
as `UNREAD` and handed on as `UNREAD`: the message half is told the anchor could not be read, never handed an
empty string it cannot tell from a hash. `skills/post/SKILL.md` `## Step 2: compose the draft` states the
contract once — the two elements come from the state file, a caller that deletes it hands them in instead, and
an element whose value is unread is left out of the pointer block and named in Step 6's report. No empty
range, no bare `to HEAD`, no invented anchor. Shape 2, the standalone run with no state file at all, resolves
to that same omission rather than to a third compose-nothing condition, and `## Step 3: nothing to say is an
answer` says so: with no range to read, its second condition reads on the records alone. `bin/fusion-events
turns` was checked against the answer and is unaffected — it reads `session.history_file` out of the file
itself and the file is not moved or emptied, only read earlier.
