The cleanup domain capture cites "step 4" for a deletion that happens in Step 1 item 4

---

`skills/cleanup/SKILL.md:63` reads:

> **Capture the session's domain here, before anything deletes the file** — step 4 below removes
> `agentstate.yaml`, and Step 3 needs the value it holds.

The deletion is at `:90`, inside **Step 1**'s numbered item 4. The document also has a top-level
`## Step 4 — Archive with safe defaults` at `:132`, which deletes nothing. In the same sentence,
"Step 3" *does* mean the top-level `## Step 3 — Reconcile`.

---

**The behaviour is correct; only the pointer is wrong.** The capture sits at Step 1 item 1 and the
deletion at Step 1 item 4, so a reader executing the items in order captures before deleting. The
question the review dispatch asked — does the capture run before the deletion? — answers yes.

**Why it is still worth filing.** Commit `b3cc034`'s own message gets it right: *"its Step 1.4 deletes
`agentstate.yaml`, so the capture sits in Step 1 item 1 where the file is read anyway."* The shipped
text is the one a future editor reads, and it sends them to the archive step. An editor who moves the
capture "somewhere before Step 4" on the strength of that sentence can legally place it in Step 2 or
Step 3 and break it.

The mixed referents in one sentence — one bare "step 4" meaning an item, one "Step 3" meaning a
heading — are the whole defect. `rules/user-facing-output.md` `## Vocabulary` → *One name per thing*
is the governing convention.

**Fix.** Rewrite as: *"item 4 of this step removes `agentstate.yaml`, and Step 3 (Reconcile) needs
the value it holds."*

**Cross-references.** `skills/cleanup/SKILL.md:61-72, 88-93, 121-130`.

**Filed by:** coderev, review of session `260810-1646` Turn 2, range `da8c9db..b3cc034`.

---

Resolved — the sentence now names an item as an item and a heading as a heading.

`skills/cleanup/SKILL.md` Step 1 item 1 reads: *"item 4 of this step removes `agentstate.yaml`, and
Step 3 (Reconcile) needs the value it holds."* Checked against the file rather than the record: the
deletion is still Step 1's item 4 (`- Delete fusion-workbench/agentstate.yaml if it exists`), and
`## Step 3 — Reconcile` is still the heading the second half means, so both referents in the repaired
sentence resolve to what the behaviour actually does. Naming Reconcile in the sentence removes the
last way to read "Step 3" as an item number.

**Resolved by:** coder, session `260810-1646`, Turn 3.
