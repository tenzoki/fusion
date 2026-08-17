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
