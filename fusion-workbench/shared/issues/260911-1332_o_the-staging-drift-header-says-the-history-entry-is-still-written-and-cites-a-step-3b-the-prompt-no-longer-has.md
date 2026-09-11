The staging-drift header says the history entry is still written and cites a Step 3b the prompt no longer has

---

`hooks/lib/staging-drift.ts`'s file header makes two claims about HEAD that are false. It says a session history entry "is still written, still dispatched for outside the Turn loop, and still a `record` here" (`:18-19`), and it attributes the staging shape to `agents/orchestrator.md` "Step 3b step 4" in three places (`:24`, `:47`, `:75`). The history store is closed to writes, the Turn loop is gone, and the orchestrator prompt has no Step 3b.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260910-1809_*_the-turn-and-phase-vocabulary-survives-in-132-places-across-the-shipped-text.md` (closed; this is a survivor of that sweep, filed new because a terminal record is not reopened); `260910-2146_*_five-deleted-agents-are-still-named-as-live-in-twelve-shipped-files.md` (the neighbouring sweep, which found it and correctly left it as a different subject)

**Claim 1, the history entry.** `rules/fusion-workbench-conventions.md` `## Session history` states that the history store is closed to writes, that no agent writes a session log, and that there is no `$OUT_HISTORY` key to write one with. The header's sentence has no true half left: the entry is not written, nothing is dispatched for it, and the Turn loop it is measured against went at v11.

**Claim 2, the step citation.** `agents/orchestrator.md` carries `### Step 4 — commit`, whose item 4 installs the staging shape the header describes. There is no Step 3b anywhere in the prompt. The shape itself is correctly described; only its address is dead, in three places.

**Why this is a new record and not a reopening.** `260910-1809_*_the-turn-and-phase-vocabulary-survives-in-132-places-across-the-shipped-text.md` is `_c_`, and `rules/fusion-workbench-conventions.md` `## Terminal states are history` disallows an edit back to a live state. It is also the right call on its own terms: that record's closing note lists what it swept, and this passage is not in it.

**Why it was not swept with the retired-agent pass.** That pass was scoped to five agent names and this passage carries none. Its own record states the principle it was left under, which holds here in the other direction: doing half of one subject inside another sweep is how a repair becomes unattributable.

**Evidence:** `hooks/lib/staging-drift.ts:18-19`, `:24`, `:47`, `:75`, read at `10e7cc15` plus the working-tree change of this session's second repair pass, which rewrapped the paragraph and left both claims standing; `rules/fusion-workbench-conventions.md` `## Session history`; `grep -c 'Step 3b' agents/orchestrator.md` returning 0.

**Acceptance test:** `grep -n 'Turn loop\|Step 3b' hooks/lib/staging-drift.ts` returns only sentences true at HEAD. The header describes what a history entry actually is now, or drops the sentence. The staging shape is attributed to the step that carries it. `hooks/dist/` is rebuilt in the same commit, because `committed-dist.test.ts` compares the two.
