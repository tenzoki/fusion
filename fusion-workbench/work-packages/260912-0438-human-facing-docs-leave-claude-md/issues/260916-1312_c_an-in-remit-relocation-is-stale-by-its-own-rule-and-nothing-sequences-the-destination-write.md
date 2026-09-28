An in-remit relocation is `stale` by its own rule, and nothing sequences the destination write

---
The motivating case for relocation is a passage leaving `CLAUDE.md` for a project rule file — both
are surfaces the curator edits (`agents/curator.md` `## Scope`, lines 335-341). Call that an
**in-remit** relocation. The prompt's rules for it do not compose.

`agents/curator.md:92` states the staleness rule with no scope on it:

> A relocation removes no constraint — it moves the passage into another file, leaves a pointer where
> the passage stood, and is `stale` unless that other file already carries it.

`### Pass 2 — apply` (lines 210-216) contemplates exactly one write per entry: re-read the
before-text, write, re-read the region. No step writes a destination. So an in-remit relocation
reaches the apply pass with the destination not yet carrying the passage, the sentence above fires,
and the entry is `stale` — permanently, because the only thing that could clear it is a write the
apply pass never makes.

The one place the ordering is stated is `## Reporting work you may not do` (line 238), inside the
bullet whose subject is *"A relocation whose destination is a file **outside** the three surfaces"*:

> The source-side removal is then applied only once the destination already carries the entry's After
> text byte for byte … **It is also where the destination-side byte comparison happens** — a
> precondition read at the start of the apply pass … **since there is no destination write of yours
> to read afterwards.**

That final clause presupposes a case in which there *is* a destination write of the curator's. No
section authorises one, sequences it, or says what the post-write check compares for it.
`rules/context-lean-claude-md.md:201` states the requirement the ordering has to meet — *"a pointer
to a file that does not yet carry the text is worse than the passage it replaced, which is why the
destination is written before the source is cut"* — and the curator prompt has no procedure that
meets it inside its own remit.

**Acceptance test:** `agents/curator.md` states, for a relocation whose destination is one of the
three surfaces, who writes the destination, in what order relative to the source cut, and what the
`stale` precondition reads — or states that no such relocation exists and every destination is
somebody else's work.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
Cross-references: `260916-1006_*_how-does-a-consuming-project-bring-its-claude-md-to-the-lean-convention-when-the-curator-asks-a-different-question.md`.

---
Resolved: `### Pass 2 — apply` now carries the relocation procedure, five numbered steps, and it is
the only place the ordering is stated. The in-remit case is authorised at step 3: where the
destination is one of the three surfaces and does not yet carry the After block, the curator
**writes it first** — the approval that authorised the cut authorised that write, the two being one
entry — creating the file where the destination does not exist yet, then re-reads and compares it
against the After block before touching the source. Only then does step 4 write the pointer at the
source. `## Scope` gains the matching permission on its gated list, so the creation is not a fourth
ungated write.

The unscoped sentence at the old line 92 is the cause and was corrected there rather than qualified:
`### Never permitted` now says the source is never cut before the destination carries the passage and
cites `### Pass 2 — apply` for where that order is performed and when an entry becomes `stale`. That
clause decides only that the move is permitted, never when it lands — which is why an in-remit
relocation is no longer permanently `stale`: the condition it used to read is now a step the apply
pass can satisfy.

The out-of-remit case keeps its `stale` outcome and is step 3's other branch, so one rule covers
both. `## Reporting work you may not do` now cites that step instead of restating the ordering.
The requirement `rules/context-lean-claude-md.md:201` states — the destination is written before the
source is cut — is met by the step order, and the paragraph closing the procedure says why a
half-applied relocation leaves the passage at the source rather than nowhere.
