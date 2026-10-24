
**Make each operation's call in the turn of the act that moves it**, never as a step of its own. A maintenance step beside an action is what this project measured being skipped, six times in six sessions (issue `260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md`).

## Closing a work package

Run this when the item this session claimed is being finished in this session. With no claimed item, or when the user's Rebalance answer continues the work, skip it cleanly. The user says when an item is done; you do not decide it from an empty record store.

1. **Detect the transition.** The item is the container name you have held since Setup step 5. `show` its `package.json`: a `status` already `done` or `dropped` is terminal and this section does nothing. **Revise Brief**, **Revise Evidence base** and **Revise Artefact** at the Rebalance approval all continue the work: touch no field and skip the rest of this section.

   The closing value is `done`, or `dropped` when the user chose **Accept Bounded Closure** at the Rebalance approval or Bounded Closure was forced by **Rebalance bounding** — in that case the body says what was learned and why the job is no longer live. Under `mode` `autonomous` you may hold the closure only when the work is visibly not done on disk (a test the plan's acceptance names fails, a file it says exists is missing): emit `gate_hit` naming what; the item stays `claimed`. Otherwise the closure runs as written.

2. **The review — the one pass this work gets** (decision `260827-1120_*_how-often-does-the-review-pass-run.md`). Closure paths only; continued work waits. Take the coverage read once more (**Review coverage**) with `--since` the commit that filed the item, its narrative's first (`git -C "$WORKBENCH" log --follow --diff-filter=A --format=%h -- <step 1's narrative.path> | tail -n 1`; a migration adds `package.json`), then route by what the uncovered commits changed, scoped to their files **plus the carried `**Not-opened:**` list**:
   - Code files → emit `review_start`, invoke `reviewer` with `**Review domain:** code`, emit `review_done`.
   - Ontology/data files (`.yaml`, `.json`, `.toml`, `.csv` in `ontology/` or `manifests/`) → the same with `**Review domain:** ontology`. Both kinds in one uncovered range are **one** dispatch carrying `**Review domain:** both`, not two.

   - `uncovered 0` with no carried file named, or no code or data file in range → skip cleanly; the finish then carries no `--evidence`.

   Findings land as issues (the reviewer files them) for the follow-on work; the closure note at step 3 names them and any remaining gap — coverage is advisory and never blocks the closure. A bounded reviewer return is continued here, before step 3; on the stall, closure proceeds and the gap goes into that note like any uncovered range.

3. **Read the plan's stop conditions back to the user, before the status write.** Resolve the plan in scope from the `show` at step 1: **its `active_documents` entry in role `plan` first**, the record whose `id` is the entry's `ref.record_id` in the `list`; read its narrative, and say so when it no longer matches the bound `revision`. Only with **no plan bound** fall back to the plan path this session happens to be holding, which nothing persists. **Say which of the two you used** — and where there is nothing to read, say which of the three it was: no plan bound or held, a plan that carried no such section, and a section left with no clause are different facts, and a closure reporting them as one tells the user nothing. Read that plan's `## Where this work stops` section. Skip any clause that sits wholly inside angle brackets — that is the template's placeholder, whether it stands alone or beside a real clause. In any of those three cases go to step 4 and put no question. Otherwise put **all** remaining clauses to the user as **one** question: a numbered list, multi-select for the clauses that do **not** hold (unmarked = holds). One stop, never one per clause.

   **It is a question, not a check.** You do not parse the clauses, judge them, or decide from their wording whether a condition is met; you put them in front of the user at the one moment they are actionable — same shape as the plan head's `**Decidability:**` line. Under `mode` `autonomous` the clauses are not put: `gate_hit` keeps `Circle stop conditions`, one `gate_response` per clause reads `clause N: not put — answered by **Mode:** autonomous on <container>`, and every clause goes into the closure note verbatim. Emit `gate_hit` once with reason `Circle stop conditions` — that exact string — and one `gate_response` per clause (`holds`/`does not hold`), from the one answer; this step has no event type of its own. The two strings are fixed because `260817-1613_*_does-a-plan-stated-precondition-get-any-mechanism-or-is-it-read-by-a-human-or-not-at-all.md` reserves option 3 for the case where this approval is *measured* and misses, and both halves of that measurement are then a `grep` over `orchestrator-events.jsonl`, which is append-only across sessions. **Do not modernise either string to match the section's new name** — the log is the measurement's corpus, and a renamed string splits it in two. Carry any clause the user says does not hold into the closure note, so the gap outlives the chat.

   **What it does not cover.** A release tagged mid-work has already gone out by the time this step runs, and that is the measured case: a plan made its own review pass a precondition of the tag, v10.0.0 was tagged and pushed without the pass, and a post-release reconciliation was what noticed. The step records such a gap; it cannot prevent it.

4. **Write the status, then the closure note.** Send the **Finish** or **Drop** call of **Work packages** (`bounded` on a Bounded Closure); a **Finish** carries `--evidence <reviews store>/<review stem>.evidence.json` when step 2's review wrote one, whatever its verdict. Then, in the same turn, append a closure note to the narrative, citing the session's commit range and the closing value: the evidence binds the brief's bytes, so a note written first refuses the finish. With no review, or a verdict other than `accept`, a `succeeded` edge on this item stays unmet. Pass no `--claim`: the claim stays to name who did the work.

5. **Tell the user the item closed**, naming its container name and the closing value. Emit `portfolio_refresh` carrying the item's container name — the row is what a reader tiles closures from, and it keeps the name the log already carries (the portfolio regeneration it was named for went at v11).

## Ending the session

The session ends when the user says so. Then:

- **Give the user the session summary**, in the report and nowhere else. No file is written: the commits are the record of the work, and the summary is what tells the user what those commits mean. It carries, in this order:
  - **Brief** — the user's original request, and the outcome: complete, bounded closure with its reason, or stopped by the user.
  - **What was done** — one line per commit: short hash, summary, source record.
  - **Coherence** — the state-auditor's audit result when a reconciliation ran this session, and the words "no reconciliation was run" when none was.
  - **Review coverage** — the range `<session-start>..<HEAD>` with its commit count, one line per review file with its `**Reviewed-range:**`, the commits no review opened (`none` when the range is tiled), and the last review's `**Not-opened:**` list.
  - **Records this session touched** — one line per record, by path and by what moved: filed, closed, answered, implemented.
  - **Still open** — what the user is left with, named by path.

