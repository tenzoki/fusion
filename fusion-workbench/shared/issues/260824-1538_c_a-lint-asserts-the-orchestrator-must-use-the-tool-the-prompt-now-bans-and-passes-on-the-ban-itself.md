A lint asserts the orchestrator must use the tool the prompt now bans, and passes on the ban itself
---
`hooks/lib/__tests__/turn-budget-lint.test.ts:449-453` requires `agents/orchestrator.md` to contain the string "AskUserQuestion", with the message "must put the question through AskUserQuestion, the way every other human gate in this prompt reaches the user." `0db1fbb` banned that tool absolutely at `agents/orchestrator.md:29` and rewrote the gate it guards to ask in chat. The assertion still passes, because the token survives in the ban sentence and in the frontmatter allowlist.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

Found reviewing `e209011..0f5889e`. Filed to `shared/` under the Origin Rule: `0db1fbb` landed at 06:04 on 260824, before this Circle was captured and activated at `4a00f12`, and its subject is not this Circle's Directive.

The prompt now says, at `:29`: "**Every question you put to the user is plain chat text. You never call `AskUserQuestion` — not at any gate, not in any phase, not for a one-option confirmation, a binary choice or a multiple-choice list.**" The gate the lint guards, the unresolved-Turn-budget check-in at `:685`, now reads "emit `gate_hit` with reason `unresolved Turn budget` and ask in chat".

`grep -n AskUserQuestion agents/orchestrator.md` returns exactly two lines: `:4`, the frontmatter `tools:` allowlist, and `:29`, the ban. `text.includes("AskUserQuestion")` is true on either. Verified green: `npx vitest run lib/__tests__/turn-budget-lint.test.ts`, 15 of 15.

**Three things follow, and the third is the one that costs.**

The gate is now vacuous for its stated purpose: it can no longer distinguish a prompt that routes the check-in through a dialog from one that bans dialogs outright, because both contain the token.

Its failure message is now false. Somebody who trips it is told to put the question through a tool the same file forbids in bold on line 29.

And it is a tripwire pointing the wrong way. The two follow-ups `0db1fbb` deliberately left open — removing the allowlist grant, and sweeping the five skill bodies — would each remove one of the two surviving occurrences. Removing the allowlist entry alone leaves one and the suite stays green; rewording the ban to drop the literal token turns the suite red for a change that *strengthens* the policy the lint was written to serve. The next person to touch this reads a red gate demanding the opposite of the shipped rule.

Fix direction: the assertion's real subject is that the check-in reaches the user rather than being asserted and left unbound. Restate it in terms of the gate's own anchor and the chat-asking shape `agents/orchestrator.md` `## How you ask the user anything` now defines, and keep the issue citations (260811-2142) that give it its provenance. Do not delete the case: the surrounding block's other two assertions are live and the third one is what pins the gate's existence.

Adjacent: `shared/issues/260820-1755_*_five-agent-prompts-tell-a-top-level-run-it-holds-askuserquestion-and-a-headless-one-does-not.md` is about what agents *claim* to hold; this is about what a gate asserts of one prompt.

---
**Reconciliation 260824-1637** (reconciler, domain `code`, Phase 3 of session `260824-0539`, HEAD `cf7a5b0`; log `circles/260824-0530-record-attribution-and-circle-claim/history/260824-1637-reconciliation.md`) — **STAYS `_o_`.** Both halves re-read at HEAD. `hooks/lib/__tests__/turn-budget-lint.test.ts:449-455` still asserts that `agents/orchestrator.md` must contain the token `AskUserQuestion`, with the message that the orchestrator "must put the question through AskUserQuestion, the way every other human gate in this prompt reaches the user". `grep -c AskUserQuestion agents/orchestrator.md` returns 2, and both occurrences are what the record names: the frontmatter `tools:` allowlist at `:4` and the ban sentence at `:29`. The assertion therefore passes on the text that forbids the behaviour it asserts.

---
Resolved: fixed — the assertion in `hooks/lib/__tests__/turn-budget-lint.test.ts` now reads the `#### Unresolved-budget check-in` section for "ask in chat" and the prompt for `## How you ask the user anything`, with a message naming the chat shape and not the banned tool; on the pre-ban text (`0db1fbb^`) the gate section carries `AskUserQuestion` and no "ask in chat", so the restated check fails there; `cd hooks && npx vitest run lib/__tests__/turn-budget-lint.test.ts`
