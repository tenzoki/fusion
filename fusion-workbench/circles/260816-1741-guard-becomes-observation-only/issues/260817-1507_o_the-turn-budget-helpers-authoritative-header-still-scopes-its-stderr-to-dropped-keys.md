The Turn-budget helper's authoritative header still scopes its stderr to dropped keys

---

`CLAUDE.md` designates `bin/fusion-turn-budget`'s own header as the authoritative usage block —
"the `KEY=value` line it prints and the exit-code table are spelled there, and this row deliberately
does not restate them". That header says:

> `bin/fusion-turn-budget:14-16` — Anything the configuration loader had to drop goes to stderr, one
> line each, **naming the key and why** — the loader's standing drop-and-advise behaviour, at the
> one call that reads this value.

This is the exact scoping `01932d6` identified as the defect in `agents/orchestrator.md` and fixed
there. It survives one surface over, in the surface a reader is sent to as authoritative.

**Measured, not inferred.** In a scratch project carrying only a leftover `fusion-guard.json`, the
helper put this on stderr:

```
fusion-turn-budget: fusion configuration: <root>/fusion-guard.json is no longer read — …
```

No key was dropped and none is named: the file was never read. The header's own description does
not cover the line its own program prints, and it is the costliest line the program prints.

**The same shape one level down.** `hooks/turn-budget.ts:52-57`:

> Diagnostics, if any, go to stderr, one per line, and do not change the exit code: the budget is
> still resolved, **from the layer the dropped key would have overridden**.

For a retired file there is no such layer. And `hooks/turn-budget.ts:31-38` tells the reader that a
project upgrading over the release "hears about it from the loader, **on every guarded tool call**",
without saying that this very program prints it too.

**Why it matters more than an ordinary stale comment.** The loop in `turn-budget.ts:92-94` writes
`config.diagnostics` verbatim — every entry, whatever its class. Nothing constrains it to drops, and
nothing should. But a maintainer reading either doc surface would be entitled to conclude the
contract is drops-only, and a future narrowing of that loop would look like it was honouring the
documented contract. That is the same mechanism-versus-record gap that produced `260816-2318`.

**Severity:** Medium. Scope: `bin/fusion-turn-budget` (shipped executable header, designated
authoritative by `CLAUDE.md`) and `hooks/turn-budget.ts` (the module docstring behind it). No
behaviour is wrong; three surfaces describe one contract and two of them describe the old one.

**Suggested fix.** Widen both to the antecedent-and-examples shape `agents/orchestrator.md:132` now
uses: everything the loader returned goes to stderr, one line each, and drops are one of several
classes rather than the class. Name the retired file explicitly as the one that is not a drop.

**Cross-references:**
- `bin/fusion-turn-budget:14-16`, `hooks/turn-budget.ts:31-38`, `:52-57`, `:92-94`
- `hooks/lib/config.ts:230-258` (readLayer), `:391-427` (validateLayer), `:463-475` (retired files)
- `agents/orchestrator.md:132` (the widened wording to reuse)
- `circles/260816-1741-guard-becomes-observation-only/issues/260816-2318_c_the-retired-file-diagnostics-one-chat-visible-channel-is-a-repeat-mandate-scoped-to-dropped-keys.md`
- `circles/260816-1741-guard-becomes-observation-only/issues/260816-2124_c_bin-fusion-turn-budgets-header-documents-the-configuration-file-7a-renames-and-no-step-owns-it.md`
  (the same header, lines 39-41; its fix did not reach lines 14-16)

---
Reconciliation 2026-08-17, second Phase-3 pass. **Left OPEN by explicit user decision. Re-measured
at HEAD `d0f13fa`:** `bin/fusion-turn-budget:14` still reads "Anything the configuration loader had
to drop goes to stderr, one line each", which is narrower than what the loader now returns. The two
surfaces that were widened in the same class both did move — `agents/orchestrator.md:132` and
`skills/setup/SKILL.md:292` now say "every diagnostic the configuration loader returned" (`01932d6`)
— so this header is the one member of that set left behind. Its own row in `CLAUDE.md` names it as
the authoritative usage block, which is what makes the narrow scope load-bearing rather than
cosmetic.

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass, third pass) — STAYS `_o_`. Re-measured at HEAD `e435f03`; the header is byte-for-byte as filed.**

```
bin/fusion-turn-budget:13-15
  # Anything the configuration loader had to drop goes to stderr, one line each,
  # naming the key and why — the loader's standing drop-and-advise behaviour, at
  # the one call that reads this value.
```

Still narrower than what the loader returns, and still the surface `CLAUDE.md` designates as authoritative: *"Its own header carries the authoritative usage block — the `KEY=value` line it prints and the exit-code table are spelled there, and this row deliberately does not restate them."*

The two siblings widened by `01932d6` — `agents/orchestrator.md:132` and `skills/setup/SKILL.md:292`, both now reading "every diagnostic the configuration loader returned" — have since been rewritten again in other respects and both kept the widened wording. This header is the one member of the set still describing the old contract, and it is the only one a reader is *sent to*.

**Live obligation, low cost, and the cost of leaving it is asymmetric.** The loop at `hooks/turn-budget.ts:92-94` writes `config.diagnostics` verbatim, every entry whatever its class, and nothing constrains it to drops. A maintainer reading the authoritative header would be entitled to conclude the contract is drops-only; a future narrowing of that loop would then look like it was honouring a documented contract while silencing the retired-file advisory, which is the costliest line the program prints. That is the same mechanism-versus-record gap `260816-2318` recorded and had fixed.

The remedy named in the record is unchanged and is one paragraph: widen `bin/fusion-turn-budget:13-15` and `hooks/turn-budget.ts:52-57` to the antecedent-and-examples shape `agents/orchestrator.md:132` already uses, and name the retired file explicitly as the diagnostic that is not a drop.
