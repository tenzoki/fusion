A guardrail citation is truncated, so no gate reads it and no reader resolves it

---
`skills/archive/SKILL.md`'s event-log guardrail cites `260811-1534_*_does-the-guard-event-log-get-an-upper-bound…` with an ellipsis and no `.md`. Without the extension the token is not a citation by the grammar's own shape test, so every citation gate skips it, and a reader has nothing to open.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence.** Present already at the commit before the 260916 correction pass, so it predates that work and was not introduced by it. `bin/fusion-citation-sweep --dry-run` reports `rewrites=0` over the tree with the token in place, which is the point: the gates cannot see it. The same shape as `260916-0736_*_the-resolver-rule-still-teaches-a-consumer-name-that-exits-2.md` — a statement no gate reads because it does not carry the form a gate keys on.

**Why it was not fixed in that pass.** It sits outside the seven findings that pass was dispatched on, and restoring the full basename costs bytes on the `skills/` surface, which stood at 576 bytes of margin when the observation was made.

**Acceptance test.** The bullet carries the record's full storeless basename with the marker wildcarded and the `.md` extension, and a workbench-wide lookup on that basename resolves to exactly one file.
