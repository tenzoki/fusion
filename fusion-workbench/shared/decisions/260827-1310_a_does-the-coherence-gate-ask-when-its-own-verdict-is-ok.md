# Does the Coherence gate ask when its own verdict is ok?

---
**Domain:** code
**Filed by:** claude-code (UX round, finding 1 of the 260827 UX review), Kai Stalmann <ks@qantr.com>
**Cross-references:** `agents/orchestrator.md` Step 3c-bis (the gate) · `rules/orchestrator-rebalance.md` (the escalation the drift case keeps) · `260827-1120_*_how-often-does-the-review-pass-run.md` (the same speak-on-the-uncommon-path criterion, one gate earlier)

---

## Question

The per-Turn Coherence gate put its three-edge summary to the user on every Turn with commits — 75 `coherence_review` events, and the design's own sentence ("users in flow answer in one word and move on") describes a question whose answer is foreknown. The hooks' trigger doctrine names the failure: a check that speaks on its commonest path is one its reader learns to read past. Does the gate ask when nothing is drifting?

## Answer (260827, user: "beginnen mit 1 und 2")

**No.** The orchestrator classifies the three edges itself: `ok` (reviews none-yet-or-clean, commits toward or partially toward the Directive, no conflicting answered decision) shows the three lines as a status line, emits the event, and proceeds — no question. Anything else is drift and gets the one binary question exactly as before, **and in doubt it is drift**: one question costs a word, a Turn on wrong ground costs the Turn. A user may say "ask every Turn" once per session and is then asked. The event vocabulary is unchanged: the model now sets `ok` where the user's Continue used to, and a drift the user waves through is `ok` with the edge fields carrying what was shown.

What moves to the user's judgement is only *whether a question appears*, never what any answer does — the Rebalance path, its bounding and every verdict semantics are untouched.
