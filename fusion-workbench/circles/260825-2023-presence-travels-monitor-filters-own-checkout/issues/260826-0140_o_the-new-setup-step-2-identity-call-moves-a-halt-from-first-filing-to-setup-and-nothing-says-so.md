The new Setup step 2 identity call moves a halt from first filing to Setup, and nothing states the consequence

---

Setup step 2 now calls `bin/fusion-identity` and cites `rules/fusion-workbench-conventions.md` `### Who filed it` "including the exit that halts you". That rule's exit 1 obliges the caller to halt and file nothing. In a git work tree with `user.name` or `user.email` unset, the orchestrator therefore stops at Setup step 2, where before this range it would have run until its first record.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Low

**Evidence.** `agents/orchestrator.md:130-136`:

> - **Who and which checkout.** Every event line you emit names both (**Structured Event Log**). Resolve the pair once, here, and hold it for the session: [...] `rules/fusion-workbench-conventions.md` `### Who filed it` governs the call, including the exit that halts you.

`### Who filed it` on exit 1: "**halt, report the reason, file nothing, and substitute no value.**"

The plan's step 3 asks for the call and cites the same rule, so the citation is deliberate. What neither the plan nor the prompt states is the *timing* change: the halt now precedes the whole session rather than the first filing.

**Why this is worth a record rather than nothing.** The change is defensible and arguably an improvement, since failing at Setup is cheaper than failing mid-Turn. It is also a behaviour change to the orchestrator's entry path that no line in the range names, and `### Who filed it` is written about **filing** a record, not about emitting an event line, so a reader has to infer that the halt transfers.

**Fix direction.** Either state the consequence in one clause at `agents/orchestrator.md:136` — that a git tree with no configured identity stops the session here — or, if the halt is not wanted for event emission, say which exits are fatal to this call and stop citing the filing rule wholesale. The second reading is the one `bin/fusion-events` itself takes: it treats exit 1 as a degradation and not a halt (`hooks/events-query.ts:84`, `bin/fusion-events:99-103`), so the tree currently holds two readings of the same helper's exit 1.

**Scope.** `agents/orchestrator.md`; the reading it conflicts with is in `hooks/events-query.ts` and `bin/fusion-events`.
