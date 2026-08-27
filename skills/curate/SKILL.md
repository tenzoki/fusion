---
description: The CLAUDE.md step of /fusion:cleanup (reachable alone as `/fusion:cleanup --only claude-md`), kept as its own body rather than a command. Reconciles the project's three normative surfaces — its decision records, its own rule files, and CLAUDE.md — against its recorded history: dispatches the curator to survey, puts the change ledger to the user at a gate, then dispatches it again to apply only what was approved.
allowed-tools: [Bash, Read, AskUserQuestion, Agent(fusion:curator)]
---

# Fusion — curate (reconcile the normative surfaces)

This is the `CLAUDE.md` step of `/fusion:cleanup` (its Step 6, the pipeline's last before housekeeping), and the procedure below is what that step reads and performs inline. It is not one of fusion's three commands; the caller that runs it holds the gate. Whatever runs it, this body is the user-facing surface for the `curator` agent. It dispatches the agent to **survey**, reads the run file the agent wrote, holds the **gate** itself, and dispatches the agent a second time to **apply** only the entries the user approved.

**This skill writes nothing.** The two dispatches are the only writes in the whole operation, and only the second one reaches a normative surface. Rejecting everything at the gate leaves all three surfaces byte-identical and still leaves the run file on disk.

**The gate lives here because `AskUserQuestion` does.** The grant in this file's frontmatter belongs to the skill body running in the main session; it does not travel to a dispatched sub-agent. So the agent surveys, returns the gate question, and this skill puts it to the user. `agents/curator.md` `## Tool Discipline` defines all three invocation shapes and states that they differ in exactly one thing, who holds the prompt — the two passes and the run file are identical on each. Do not restate that section here, and do not re-decide any part of it.

**The skill re-derives nothing.** It does not read the three surfaces, does not judge a proposal, does not edit the ledger, and does not compose an entry the agent did not write. Its whole job is to carry a file path, three counts and an approval set between two dispatches.

## Step 1 — Pre-flight: resolve paths

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" curate
```

Hold the emitted values (`WORKBENCH`, `OUT_HISTORY`). `$WORKBENCH` is absolute; every other value is workbench-relative. Never guess a path when the resolver fails — read the exit code, it says whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes):

- **Exit 1** — no workbench above `pwd`. Halt: `/fusion:setup` must run once at the project root. Do NOT bootstrap a workbench from here — setup is the single point of workbench creation.

`CIRCLE` is emitted only when a Circle is active. Nothing in this skill branches on it: the curator resolves its own write targets at its own Setup, and the run file lands in the Circle's store or in the shared one exactly as that resolution decides. Both cases are ordinary.

## Step 2 — Dispatch the curator to survey

Use the `Agent` tool with target `fusion:curator`. The dispatch prompt's first non-empty content line MUST be the mode parameter.

Prompt body:

```
**Mode:** survey
```

Add `**Scope:** full` on its own line only when the caller passed `--full` — the unbounded evidence pass (decision `260827-0745`). `survey` is the agent's default; passing it anyway is deliberate — the dispatch says which pass it wants. The agent resolves its own paths at its Setup, reads its evidence sources bounded by its anchor, and writes the run file. It writes to no normative surface in this pass. Wait for it.

## Step 3 — Read what the survey returned

The agent's report carries three things this skill needs, and they are the gate question it could not put itself:

1. **The run file's path**, workbench-relative.
2. **The count per consequence group** — constraint removals, tier-3, tier-2, tier-1, consolidations — plus the number of candidates, which are never offered for approval.
3. **The blast-radius verdict** — whether proposed deletions exceed 20 percent of any single surface's bytes.

Then read the run file itself with the `Read` tool, at `$WORKBENCH/<run-file path>`. It carries the entry ids, which per-entry approval needs, and the outcomes section this skill reports from in Step 7.

**Two conditions halt here, and neither is repaired from this skill.** Report what was found, name the run file path as the agent gave it, and dispatch nothing further:

- The reported path does not start with the `$OUT_HISTORY` value from Step 1. A ledger this skill would relay into an apply dispatch has to be a run file in the history store; a path pointing anywhere else is not one, and guessing which file was meant would hand the apply pass a document nobody wrote.
- The file is not there, or cannot be read.

**A survey that proposes nothing is a complete result.** When every group count is zero, say so in one line, name the run file, and stop — no gate, no second dispatch. That is the ordinary outcome on a project whose surfaces are current.

## Step 4 — The scale confirmation, only when the blast-radius stop fired

This is a **separate prompt, asked before the ledger counts are shown**. Its whole content is the scale: which surface, how many bytes of it the run proposes to delete, and the 20 percent threshold it crossed. One `AskUserQuestion` with two options — go on to the ledger, or stop here without seeing it.

A run that wants to delete a fifth of a project's binding rules is either right about something large or wrong about something large, and both deserve a pause before the counts start reading like a summary. If the user stops, report the run file path so the proposal survives, and dispatch nothing.

When the verdict is that no surface crossed the threshold, skip this step entirely and ask nothing.

## Step 5 — The gate

One `AskUserQuestion`. Keep it inside the eight-line cap in `rules/user-facing-output.md`, including the option list.

**The prompt never contains the ledger.** It names the run file's path, the count per consequence group with the groups in most-consequential-first order (constraint removals, tier-3, tier-2, tier-1, consolidations), the count of candidates as text that says they are not on offer, and the blast-radius verdict in one clause. Constraint removals appear first in what the user sees, never last.

Three options:

1. **Apply everything.** Every entry in the ledger.
2. **Choose which groups.** A follow-up `AskUserQuestion` with `multiSelect`, one option per non-empty group, in the same order. What comes back marked is the approved set; everything unmarked is declined, and neither needs a third question.
3. **Apply nothing.** The default-safe answer, and an ordinary one — record it in a line and stop.

Below the options, one line invites per-entry approval by id: the user may instead reply with the ids the ledger carries, comma-separated (`L01,L04`), to approve exactly those. Ids run `L01` upward and the survey pass wrote them into the file, which is what lets per-entry granularity survive a prompt that never shows a single entry.

**Two questions at most, the second strictly narrowing the first.** Do not re-put an entry the user declined, do not ask them to confirm a set they have just marked, and do not open a question about anything other than what is in the ledger.

## Step 6 — Dispatch the curator to apply

Only when at least one entry was approved. On a rejection, or on an empty follow-up selection, **dispatch nothing at all** — an empty approval set is a rejection, not an omission to be interpreted.

Use the `Agent` tool with target `fusion:curator`. The first three non-empty content lines MUST be the three parameters, in this order:

```
**Mode:** apply
**Ledger:** <the run file path, workbench-relative, exactly as the survey run reported it>
**Approved:** <all, or the approved entry ids comma-separated>
```

`**Approved:**` carries either the word `all` or an explicit id list, and nothing else. Do not paraphrase an approval into a sentence, do not write "everything except", and do not translate a group selection into prose — resolve the chosen groups to the ids those groups hold and pass the ids. `agents/curator.md` `## Dispatch parameters` defines the refusals on the agent's side: a ledger path that does not resolve is a halt, and an id the ledger does not carry is a halt naming that id.

The apply pass re-reads each approved entry's before-text from disk before touching it, so an entry whose file moved under the gate is marked stale rather than applied. That check is what makes this two-dispatch path as safe as a run the agent holds end to end, and it is the agent's, not this skill's — do not attempt a verification of your own here.

## Step 7 — Report what happened

Read the run file again with the `Read` tool. The apply pass appended one outcome line per entry: `applied`, `skipped`, `stale`, or `failed` with a reason.

Report, in this order:

1. **What changed** — the count applied, per surface.
2. **What did not, and why** — every `stale` and every `failed` entry by id and file, with the reason as the agent wrote it. A write that did not land is a **failed** entry carrying whatever reason it had, never an applied one. Do not summarise these away: a partial apply reported as a completion is the failure this whole shape exists to avoid.
3. **How to undo it** — the revert paths, which each entry carries. For a git-tracked surface that is `git checkout -- <path>`; an entry whose file is not under version control says in those words that no revert path exists.
4. **The run file's path**, in the trailing details block, as the durable record of the run.

If an approved entry has no outcome line at all, say which one plainly. That, and not a silent run file, is how a broken relay announces itself.

## Boundaries

- The skill performs **no write**. Not to a normative surface, not to the run file, not to the workbench. Both writes in the operation are the agent's.
- The skill **judges nothing**. It does not open a rule file, a decision record or `CLAUDE.md` to check a proposal, and it forms no view about whether an entry is right. The evidence the user judges is in the ledger, and the agent put it there.
- The skill **dispatches only `fusion:curator`**, twice at most.
- The skill **commits nothing**, and neither does the agent. The working-tree edits are left for the user or the orchestrator to commit.
- Safe to invoke during an active orchestrator session in the sense that it starts nothing: it runs no Turn, activates no Circle and touches no session state. The apply pass does edit files an active session may also be editing, so it is worth running at a quiet point rather than mid-Turn.
- The caller holds the gate, and there is no path where nothing does. `/fusion:cleanup` Step 6 runs this procedure and puts the ledger to the user itself; an orchestrator that dispatches the curator mid-session proxies the same question (`agents/orchestrator.md`). A caller that cannot ask the user runs the survey pass and stops.

## Tone

User-facing output follows `rules/user-facing-output.md` (loaded into every agent via `bin/fusion-rules`) plus the chat profile for the project's chat language, resolved per `rules/fusion-workbench-conventions.md` `## Project language` — the `**Language:**` line in `CLAUDE.md`, with the profile at `./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`. Write every prompt and every report in that language. This file is English; what it tells you to render is not.

For this skill specifically:

- **The gate leads with the decision**, not with a description of what the curator does. The user invoked this and knows.
- **Groups are named in words**, not by tier number alone: "changes that remove a rule" reads, "tier 3" does not, and the tier can follow in parentheses.
- **Never print entry ids without the count they belong to.** `L01,L04` on its own is unreadable; "two entries, `L01` and `L04`" is not.
- **A run that proposes nothing gets one line.** No summary of the evidence sources, no restatement of what was checked — the agent's run file holds all of it for a reader who wants it.
