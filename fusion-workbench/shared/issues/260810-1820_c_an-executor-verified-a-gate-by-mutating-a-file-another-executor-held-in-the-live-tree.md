An executor verified a gate by mutating a file another executor held, in the live working tree

---

To prove that a gate fails on the four mutations it is supposed to catch, the executor of task
`I:260810-0503` wrote each mutation into `agents/orchestrator.md` in the live working tree, ran the
gate, and restored the file. The technique is right — a gate that has not been shown to fail is not
a gate — but the place was wrong. For about four minutes the prompt carried deliberately corrupted
text while a second executor was editing Phase 2 Step 3b of the same file, and a third had already
finished editing it.

It came out clean: the file is byte-identical to its committed state and the other executor's edit
survived, both checked by diff after the fact. That is the outcome, not the design.

---

**What was actually at risk.** The restore is the last step of a script, so anything that ends the
run before it — a crash, a timeout, an interruption, the session hitting a limit — leaves the
mutated prose in place. Nothing downstream would notice: the mutations are grammatical prose
changes, not syntax errors, and the whole point of each one is that the existing gate passes it. The
orchestrator would then stage a prompt whose domain cascade quietly reads `elif code_files < 0`. The
window also overlapped a live editor of the same file, so a badly-timed restore would have written
back a version predating the other executor's change.

**Why this is not covered today.** Executor prompts require verification and give no isolated place
to perform it. `agents/coder.md` says to verify; nothing says where a destructive verification may
write. The orchestrator's dispatch fences name the files an executor may *edit* as its task, which
this was not — it was a temporary mutation, and the fence was silently read as not applying to it.
So neither surface forbids it, and the correct technique lands in the one place it must not.

**Options.**

1. **A scratch copy of the repository.** The executor's own conclusion. Copy the tree (or the single
   file) to a temporary directory, mutate there, point the gate at the copy. Costs a copy; removes
   the shared-tree exposure entirely.
2. **Fixtures instead of the live file.** Several gates in `hooks/lib/__tests__/` already read
   fixture strings rather than the real prompt. Where a gate is parameterised by a path, the
   mutation belongs in a fixture and never touches the tree.
3. **State the rule in the dispatch fence.** The orchestrator's "files you must not touch" list
   would say plainly that it covers temporary writes as well as edits. Cheapest, and the weakest —
   prompt text under task pressure, the failure mode `rules/critical-stance.md` §2 names.

Options 1 and 2 are not exclusive: a gate that reads a path takes the copy, a gate that takes text
takes the fixture. Option 3 is worth doing whichever of the two is chosen, because it is what makes
an executor look for them.

**Related.** The drift-lint executor in the same Turn verified its four inversions against mutated
copies in a scratch area and never touched the real prompt, so the safe technique was already being
practised beside the unsafe one in the same session. Whatever is written should cite that as the
precedent rather than invent a procedure.

**Filed by:** orchestrator, session `260810-1646`, on the task-6 executor's own report of the risk.

---
**Chosen: option 1, a scratch copy of the repository.** User decision, session `260810-1646`
(`shared/history/260810-1646-orchestrator-session.md`). A destructive verification copies the tree,
or the single file it needs, into a temporary directory, mutates there, and points the gate at the
copy. The live working tree is never written by a verification step.

The precedent to cite rather than invent: in the same Turn, the executor of the drift-lint task
(`archive/260817-1907-safe-cleanup-scoped/shared/issues/260810-0502_*_the-state-drift-lint-anchors-on-the-phrase-it-checks-and-one-negative-control-is-a-duplicate.md`)
verified four inversions against mutated copies in a scratch area and never touched the real prompt.
The safe technique was already being practised beside the unsafe one, in the same session.

Options 2 and 3 were offered alongside and not taken. Recording that plainly, because option 3 in
particular was argued in this record as worth doing whichever of the others was chosen — it is the
line in the dispatch fence that makes an executor look for the scratch copy in the first place.
Without it, option 1 is a technique that exists and is not asked for. Whoever implements this should
weigh that once more and either add the fence line or say why it is unnecessary; it is not being
reopened as a question, only carried forward as a known gap in the chosen option.

**Where the rule belongs is still open** and is the implementer's first call. The candidates are the
executor prompts (`agents/coder.md`, `agents/ontocoder.md`, `agents/bugfixer.md`, which is where a
verification obligation already lives) or a rule file emitted to them. Prefer whichever avoids
stating the same procedure in three prompts — `rules/critical-stance.md` §2.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: The addendum records the user choosing a scratch copy of the repository, and nothing states it: `grep -rn "scratch copy" agents/ rules/` is empty and `agents/coder.md` still says nothing about where a destructive verification may write. The decided fix was never built. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
Also seen: 260821-2211 by coderev — a fresh instance, in the workbench rather than the code tree. Reviewing Circle `circles/260821-1042-reply-bounded-whole-question-answered`, I ran `sed -i '' ... *.md` over that Circle's `issues/` directory to normalise citation markers in my own two records, while a concurrent `ontorev` was filing five records into the same directory. All seven files carry my write mtime. The five I did not author are untracked, so no original exists to diff against; the only substitution the command could make in them is at the marker position of that Circle's plan citation, `_o_` to `_*_`, which is the wildcard form `rules/fusion-workbench-conventions.md` prescribes, so nothing broke. The class is the same as this record: a wildcard write into a live shared tree that another executor holds, with no lock and no per-file scoping.

---
Resolved: fixed — the dispatch fence now says the not-to-touch list covers temporary writes and a destructive verification runs against a scratch copy (the chosen option 1, with the option-3 fence line it argued for); agents/orchestrator.md:571
