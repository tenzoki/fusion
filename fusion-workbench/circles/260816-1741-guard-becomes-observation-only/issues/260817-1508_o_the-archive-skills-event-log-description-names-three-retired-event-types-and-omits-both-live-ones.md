The archive skill's event-log description names three retired event types and omits both live ones

---

`skills/archive/SKILL.md:130` describes the file it is responsible for preserving:

> `$WORKBENCH/.guard-state/events.jsonl` is the guard's append-only record: **every block, halt,
> cleared halt, advisory override and fail-open** the hooks have emitted, across every session, in
> every Circle.

The vocabulary at HEAD is three types, and the sentence names none of them correctly
(`hooks/lib/events.ts:53-56`):

| In the sentence | At HEAD |
|---|---|
| block | `guard_block` — retired 2026-08-16, historical rows only |
| halt | `guard_halt` — retired 2026-08-16, historical rows only |
| cleared halt | `halt_cleared` — retired 2026-08-16, historical rows only |
| advisory override | never an event type; `guard_advisory` is the configuration diagnostic, not an override |
| fail-open | `guard_error` — live |
| *(absent)* | **`guard_allow`** — live, and at v10 the dominant row by volume |

`guard_allow` is the write trace, which `hooks/guard.ts:7-10`, `README-hooks.md:9` and `CLAUDE.md`
each call one of the guard's two products and "the only record of what the write surface did". The
skill that owns that record's preservation does not name it.

**The Circle edited this file and stopped 36 lines short.** `1fb3f32` changed
`skills/archive/SKILL.md:94`, the reserved-paths line, correcting `escalation.json` to an inert
leftover. Line 130 sits in the next section of the same file and was not read.

**What is *not* broken.** The roll itself is unaffected: it fires whenever the live log is non-empty
and selects nothing (`:132-134`, `:210`). And the no-ceiling argument at `:132` and `:274` — that
any line or byte ceiling evicts the oldest rows, which are the block, halt and clear events — is
still sound, and `rules/fusion-workbench-conventions.md:79` was updated in this range to say exactly
why it stays sound now that no new row of those kinds can arrive. That rule file got the correction;
the skill body did not.

**Severity:** Low. No behaviour changes. What it costs is an agent reading the skill and forming a
wrong picture of what a v10 log contains — historical enforcement rows and no allow rows, when the
truth is the reverse.

**Suggested fix.** One sentence: the log holds one `guard_allow` row per write-tool call, one
`guard_advisory` per configuration problem, one `guard_error` per fail-open, and — in a log written
before 2026-08-16 — the `guard_block`, `guard_halt` and `halt_cleared` rows that nothing writes any
more. Drop "advisory override", which was never a type. Leave `:132` and `:274` alone; their
argument still holds and `rules/fusion-workbench-conventions.md:79` is the model for the one clause
that could be added to it.

**Cross-references:**
- `skills/archive/SKILL.md:130`, `:132`, `:274`
- `hooks/lib/events.ts:53-56`, `hooks/guard.ts:7-14`
- `rules/fusion-workbench-conventions.md:79` (the same correction, made)
- `README-hooks.md:296` (the retired types written up correctly)

---
Reconciliation 2026-08-17, second Phase-3 pass. **Left OPEN by explicit user decision. Re-measured
at HEAD `d0f13fa`:** `skills/archive/SKILL.md:130` still enumerates "every block, halt, cleared
halt, advisory override and fail-open", and `:132` still names `guard_block`, `guard_halt` and
`halt_cleared` as the lines a ceiling would discard. Neither `guard_allow` nor `guard_advisory`
appears anywhere in the file, and those two are the only kinds the hook can emit now. The
present-perfect tense at `:130` keeps the sentence historically true, which is why this reads as an
omission rather than a false claim — the roll it argues for is still correct, and the reason it
gives no longer describes what the log receives.

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass, third pass) — STAYS `_o_`, and this is now the second miss on the same file.**

```
skills/archive/SKILL.md:136
  `$WORKBENCH/.guard-state/events.jsonl` is the guard's append-only record: every block,
  halt, cleared halt, advisory override and fail-open the hooks have emitted, …

skills/archive/SKILL.md:138
  … the oldest lines are the `guard_block`, `guard_halt` and `halt_cleared` events …

grep -c 'guard_allow\|guard_advisory' skills/archive/SKILL.md   → 0
```

Unchanged from the second pass but for a six-line drift (`:130` → `:136`). Neither of the two event types the hook can actually emit appears anywhere in the file.

**`skills/archive/SKILL.md` was edited since the closure and this line was not read.** `06ab15b` ("the archive skill actually reads the rule it was the named consumer of") opened the file two days after the Circle closed and worked in it. That is the second time this Circle's own removal has been carried past this sentence — `1fb3f32` corrected `:94` in the original range and stopped 36 lines short, and `06ab15b` reached the file again from a different direction and stopped short of the same line.

**Live obligation, and it is one sentence.** The remedy the record specifies is unchanged and needs no judgement: the log holds one `guard_allow` per write-tool call, one `guard_advisory` per configuration problem, one `guard_error` per fail-open, and — in a log written before 2026-08-16 — the `guard_block`, `guard_halt` and `halt_cleared` rows nothing writes any more. Drop "advisory override", which was never a type. Leave `:138` and the no-ceiling argument alone; that argument is still sound and `rules/fusion-workbench-conventions.md` already carries the clause that keeps it sound.

The severity reading holds at Low and the cost is unchanged: an agent reading this skill forms the picture backwards — historical enforcement rows and no allow rows, where the truth is the reverse and has been for three releases.
