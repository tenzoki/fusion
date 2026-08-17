# `/fusion:circle-stash` does not *handle* an absent `max_turns` — it renders an empty right-hand side, and the prompt says otherwise

---

**Severity:** Low — the degradation is harmless, but the claim that justifies omitting the key is stronger than what the consumer does
**Domain:** code
**Filed by:** coderev (Turn 4 review, range `b261d83..951c809`)
**Affects:** `agents/orchestrator.md:125`, `agents/orchestrator.md:1013`, `hooks/lib/__tests__/turn-budget-lint.test.ts:193-199`, `skills/circle-stash/SKILL.md:126-133`, `skills/circle-stash/SKILL.md:172`
**Cross-references:**
`shared/issues/260811-1712_c_max-turns-is-hardcoded-in-eight-places-and-cannot-be-set-per-project.md`

---

## What is wrong

The unresolved-budget branch instructs the orchestrator to omit the key, and justifies it:

> **Omit `progress.max_turns` from `agentstate.yaml` entirely.** Do not write a placeholder there: `/fusion:circle-stash` reads that key as a number, and **an absent key is a case it already handles** while a word is not. (`agents/orchestrator.md:125`)

The decision is right; the reason overstates the consumer. `skills/circle-stash/SKILL.md:126-133` reads:

```bash
if [ "$HAS_AGENTSTATE" = true ]; then
  TURN_N="$(grep -E '^[[:space:]]+turn:' … )"
  TURN_MAX="$(grep -E '^[[:space:]]+max_turns:' "$WORKBENCH/agentstate.yaml" | head -1 | sed -E 's/.*max_turns:[[:space:]]*([0-9]+).*/\1/')"
fi
```

and the manifest renders `**Turn:** <TURN_N>/<TURN_MAX>` (`:172`). With the key absent, `grep` matches nothing, `TURN_MAX` is the empty string, and the manifest line reads `**Turn:** 3/` — a trailing slash with nothing after it. The skill's only explicit branch is `HAS_AGENTSTATE=false`, which prints "keine Sitzung im Flug" and does not apply here.

So the case is **survived**, not handled: no crash, no garbling, and a manifest field that reads as truncated rather than as "no budget".

The comparison with a placeholder word still holds and is the load-bearing half — a `max_turns: unresolved` line makes `grep` match while the `sed` substitution does not, so `TURN_MAX` becomes the whole matched line, `  max_turns: unresolved`, spliced into the manifest. Omitting the key is strictly better. `turn-budget-lint.test.ts:193-199` pins the instruction with the same reasoning and inherits the same overstatement in its message.

## Fix direction

Two small edits, both cheap:

1. **Give `circle-stash` the branch it is credited with.** After the reads, `[ -z "$TURN_MAX" ] && TURN_MAX="--"`, so the manifest reads `**Turn:** 3/--` — the same spelling the dashboard uses for an unresolved budget, which makes the stash manifest and the live dashboard say the same thing about the same session.
2. **Correct the sentence** at `agents/orchestrator.md:125` and the message at `turn-budget-lint.test.ts:196` to say what is true: an absent key degrades to an empty field, a word is spliced into the manifest verbatim, and that is why the key is omitted.

Doing (1) makes (2) true rather than needing it, which is the better order.

## Acceptance criteria

- A stash manifest taken over an `agentstate.yaml` with no `progress.max_turns` renders a field that reads as "no budget", not as a truncated one.
- No shipped surface claims a consumer handles a case it merely survives.

---
Resolved: moot, not fixed. Both halves of the record's subject are gone: `skills/circle-stash/SKILL.md` was deleted in `5d29b6d` (step 6), and `progress.max_turns` was removed from `agentstate.yaml` in `f45f76a` (step 11), so the overstated justification at `agents/orchestrator.md:125` has no key to justify omitting. Verified at HEAD `9306f0a` by the reconciliation pass of 260815-1913: `grep -n max_turns agents/orchestrator.md` returns nothing. `hooks/lib/__tests__/turn-budget-lint.test.ts` survives and is unaffected — it names the retired key only in comments recording that the copy went on 2026-08-15.
