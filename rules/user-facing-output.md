# User-Facing Output

Every piece of output the user reads — status reports, gate prompts, `AskUserQuestion` text, session summaries, error messages, skill confirmations, activation banners — must be **self-contained, plain-English, and action-first**. The user should never have to decode jargon, hunt for what they need to do, or scroll back to understand a question.

This rule is loaded for every agent. If you find yourself writing output that violates it, rewrite before sending. The user reads everything you produce — make it worth reading.

## Information architecture (in this order)

1. **Action first.** If the user needs to decide, type, click, approve, or wait, that comes at the very top — before any explanation. The first line answers "what does the user do now?" If there's nothing for the user to do, lead with that explicitly: *"Session complete — nothing for you to do."*
2. **Reason second.** One or two sentences on *why* this action matters or what just happened. Not a paragraph.
3. **Status / results.** What's currently true. Counts, verdicts, outcomes.
4. **Details / references.** Commit hashes, file paths, agent names, history-file paths, internal IDs, marker syntax — these go in a clearly separated trailing section called "Details" or "References", **not** in the opening lines.

**No section called "Metadata" at the top.** Move that content to the bottom.

## Vocabulary

- **Spell out fusion-internal terms on first use** in any given output. Examples:
  - Not "Turn loop" → "the work cycle (one Turn = one batch of tasks + a review)."
  - Not "Directive" alone → "the session Directive (your stated goal)."
  - Not "[t] marker" → "the active Circle (`[t]` in the filename)."
  - Once spelled out within an output, the short form is fine for the rest of that same output.

- **Never use workbench-internal IDs without their human-readable summary.**
  - Bad: `T2 P:02 Extended-BMC manifest re-edit (10×18)`
  - Good: `Re-edit the Extended BMC manifest (Task 2, 10 entries × 18 fields).`

- **Never use abbreviations the user didn't define.** Project-specific abbreviations (R14, MC-11, Q7.3, BMC, Bundle A/B/C) need at least one expansion on first use, or a pointer to where they're defined. Standard tech abbreviations (CLI, API, YAML, JSON, HTML) are fine.

- **Conventional Commits types are commit-message language, not user-facing prose.** Don't write "T1 chore: bumped version" in a status report. Write "Task 1 bumped the version."

- **No marker syntax in body prose unless explained.** `[o]`, `[a]`, `[t]`, `[c]`, `[b]`, `[s]`, `[d]`, `[p]`, `[i]` are filename markers. In body text prefer the word: *open / anticipated / active / closed / bounded / superseded / deferred / in-progress / implemented*. Use the bracket form in parentheses if helpful — *"the active Circle (`[t]` in the filename)."*

## Questions and gates

- **Every `AskUserQuestion` question must be self-contained.** The user is reading chat scrollback. They should not have to scroll up to understand the question. Include the relevant Circle name, file path, task title, or context inside the question text itself.
- **Options must be plain English, not internal verbs.**
  - Not "Revise Artifact" → "Try again with a refined task list."
  - Not "Bounded Closure" → "Accept what's been learned and end the session."
  - Internal verbs may follow in parentheses for traceability: *"Try again with a refined task list (Revise Artifact)."*
- **Default options should be the most-likely choice.** Don't make the user pick between four equal-weight options if 90% of the time it's option A. Mark the recommended default explicitly.

## Length

- **Status reports: ~5–15 lines for normal cases.** A successful session report doesn't need a wall of facts. Lead with the verdict and what (if anything) the user needs to do, then trailing details.
- **Wide tables and long lists belong in "Details," not the opening summary.**

## Examples

### Example 1 — session report

**Before** (cryptic, jargon-heavy, no clear user action):

> Verdict: coherent (Phase 3 reconciler) Commits: 6 (4 task + 1 reconciliation + 1 session-close) - 60e009b T1 CLAUDE.md Framework Topics bullet + Bundle C validator-status - 17cf23d T2 3 Bundle-C coderev Notes closed (loader/validator topics) - 4414f18 T3 typical_engine_types → typical_shapes (R14 ratified) - d1d59e7 T4 Q7.x [a]→[i] walk × 5 + plan 260510-2151 [o]→[c]

**After** (action-first, plain-English, details at the bottom):

> **Session complete — nothing for you to do.**
>
> The reviewer confirmed the work is consistent with your original goal. 6 commits landed across 4 tasks + 1 reconciliation pass + 1 session-close.
>
> **Optional next steps** (if you want to keep going):
> - Pick up the ontology-coverage plan (Bundle A: ~6 steps, 5 hours)
> - Or draft the Stefan consult in parallel (1 step)
>
> **Details:**
>
> | Commit  | What it did |
> |---------|-------------|
> | 60e009b | Updated CLAUDE.md framework topics bullet (Task 1) |
> | 17cf23d | Closed 3 reviewer notes about the loader and validator (Task 2) |
> | 4414f18 | Renamed `typical_engine_types` → `typical_shapes` per ratified decision R14 (Task 3) |
> | d1d59e7 | Walked 5 decision records from anticipated to implemented + closed plan 260510-2151 (Task 4) |
>
> Full log: `fusion-workbench/history/260511-2129-orchestrator-session.md`

### Example 2 — activation confirmation

**Before** (one sentence packs five unrelated ideas, all jargon):

> The next orchestrator session will pick up the Turn loop against this Circle's Directive — close the 7 Stefan-blocked open issues by source-querying normative/extracts/, landing changes with pending-stefan provenance markers, escaping to decisions/[o] on ambiguity, and consolidating per-issue close-notes + dossier under consult/.

**After** (clear action, brief reason, no jargon dump):

> **Circle activated. To start the work, just say "go" or "run the active Circle."**
>
> The session will work through 7 open issues that are blocked on input from Stefan. For anything ambiguous, it'll file a new question (decision record) rather than guess.
