The orchestrator.maxTurns row says no hook reads the key, and then describes the advisory a hook emits about it

---
`README.md:112` states that `orchestrator.maxTurns` "is not a guard setting and no hook reads it". The PreToolUse guard hook reads it: it loads the whole merged configuration on every guarded tool call, validates that leaf against its rule, and emits the advisory the same table cell goes on to describe. The claim is false as written, and it is false in the one direction that misdirects a reader hunting for where the advisory came from.
---

## Both sides read

**Documentation side**, `README.md:112`, the tuning table's new `orchestrator.maxTurns` row:

> This one is not a guard setting and **no hook reads it**: `bin/fusion-turn-budget` resolves it once at the orchestrator's Setup … A value that is not a whole number of 1 or more is dropped, **named in an advisory**, and inherits as if absent

**Artifact side**, three files.

`hooks/guard.ts:204` — the PreToolUse hook loads the merged configuration for every `Write`, `Edit`, `MultiEdit`, `NotebookEdit` and `Bash` call:

```ts
const config = loadConfig();
```

`hooks/lib/config.ts:490-495` — `orchestrator.maxTurns` is a leaf in `CONTAINER_LEAF_RULES`, so `loadConfig()` validates it like every other leaf:

```ts
  orchestrator: {
    maxTurns: {
      check: isPositiveInteger,
      expected: "a whole number of 1 or more",
    },
  },
```

`hooks/guard.ts:238-241` — every diagnostic the loader produced becomes a `guard_advisory` event, on that same guarded call:

```ts
  for (const diagnostic of config.diagnostics) {
    bestEffort("guard", () =>
      emitEvent("guard_advisory", input.tool_name, undefined, diagnostic),
    );
  }
```

## Verified by running it, not inferred

A scratch project root carrying only `fusion-workbench/.fusion-setup` and `fusion-guard.json` with `{"orchestrator":{"maxTurns":0}}`, then `loadConfig({projectRoot})` from `hooks/dist/lib/config.js`:

```
maxTurns= 5
diagnostics= [
 "Guard configuration at <root>/fusion-guard.json: \"orchestrator.maxTurns\" must be a whole number of 1 or more, got number. The key was ignored and inherits as if it were absent."
]
```

That string is what `hooks/guard.ts:240` emits, on every guarded tool call, until the value is fixed. The row's own comment block at `hooks/guard.ts:216-218` states the cost in those words: "a project left with a broken `fusion-guard.json` gets one advisory per guarded tool call, Bash included".

## Why it matters

The two halves of the cell contradict each other for a reader who follows them. Told that no hook reads the key, and then that a bad value is "named in an advisory", the reader has nowhere left to look — the guard advisory is the surface they will actually meet, repeating on every write, and the sentence has just ruled it out. `bin/fusion-turn-budget` also prints the same diagnostic on stderr (`hooks/turn-budget.ts:81-83`), so there are two surfaces and the row names neither.

What the sentence was reaching for is true and is worth keeping: no hook *acts on* the value. The budget changes nothing about what the guard allows or blocks.

## Scope

`README.md` only (shipped doc). No code behaviour is affected.

## Recommended fix direction

Say what holds: no hook uses the value — the guard reads and validates it with the rest of the file, and the advisory a bad value produces is the guard's, on every guarded tool call, plus one line on `bin/fusion-turn-budget`'s stderr. That keeps the row's real point (the budget is not a guard setting) and stops sending the reader away from the surface they will see.

Filed by: coderev (review of Circle Turn 2, range `28f3029..5d51abd`, commit `5d51abd`).
