# The project config layer is not type-validated, so a wrong-typed value fails the guard open on every call — or degrades it silently

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** analyst, independent assessment A1 of C5b
**Affects:** `hooks/lib/config.ts:240` (`return { raw: parsed as RawConfig, ... }` — a cast, not a check), `:286-292` (the floor, which calls `.includes` and spreads the value), `hooks/lib/paths.ts:89-91` (`foldCase` calls `.toLowerCase` on each pattern)
**Cross-references:**
`260804-1600-c5b-independent-assessment.md` `### What a consuming project can now do to itself`,
`260802-2334_*_a-shape-valid-escalation-json-makes-the-whole-guard-fail-open-on-both-surfaces.md` — **the same finding, on the same code path, closed in this Circle, not carried across to the new file**

---

## What is wrong

`readLayer` checks that the parsed value is a non-null, non-array object and then casts it to
`RawConfig`. Nothing checks the type of anything inside it. `guard.protectedPaths` is
consumed by `declaredPaths.includes(...)`, by `[...declaredPaths]`, and then by
`matchesAnyFolded`, which maps `foldCase` over every element.

Issue `260802-2334_*_a-shape-valid-escalation-json-makes-the-whole-guard-fail-open-on-both-surfaces.md` found exactly this class for `escalation.json` and closed it. Its own
summary line reads: *"Every row that fails open is well-formed JSON."* C5b then created a
second file on the same code path — larger, project-writable, git-tracked, and actively
seeded into every project by `/fusion:setup` — with no validation at all.

## Measured

Same harness, throwaway consuming project, shipped plugin config, no environment flag. The
runner used here does **not** treat the guard's fail-open stderr line as a harness failure,
so the fail-open is visible rather than masked.

| `fusion-guard.json` | `Edit agents/coder.md` | `rm agents/coder.md` | `Edit fusion-guard.json` | stderr / events |
|---|---|---|---|---|
| `{"guard":{"protectedPaths":123}}` | allow | allow | **allow** | `TypeError: declaredPaths.includes is not a function`, `guard_error` |
| `{"guard":{"protectedPaths":{"a":"rules/**"}}}` | allow | allow | **allow** | same |
| `{"guard":{"protectedPaths":[42]}}` | allow | allow | **allow** | `TypeError: path.toLowerCase is not a function`, `guard_error` |
| `{"guard":{"protectedPaths":"rules/**"}}` | allow | allow | DENY | **no error at all**, `guard_allow` |

Baseline, no project file: `Edit agents/coder.md` denies.

Two distinct failures in that table.

**The crash rows.** `guard.ts` catches, prints `[guard] Error:` on stderr, emits
`guard_error`, and **allows**. Every tool call, for as long as the file stays that way. The
floor goes with it: `Edit fusion-guard.json` allows too, so the guard cannot defend the file
that is crashing it, and the state is only recoverable by hand.

**The quiet row.** `"rules/**"` as a bare string never crashes. `.includes("fusion-guard.json")`
on a string is a substring test and returns `false`, so the floor is appended and survives by
luck. `[...declaredPaths]` then spreads the string into eight single characters, and the
effective protected list becomes `["r","u","l","e","s","/","*","*"]`, which matches nothing.
Everything allows, `guard_allow` is emitted, no diagnostic, no stderr. This is the most likely
typo of the four and it is the one with no signal.

`guard_error` at least reaches `events.jsonl`. It is not in `bin/monitor`'s
`WARNING_EVENT_TYPES`, so a permanently fail-open guard shows nothing on the dashboard —
filed separately as `260804-1607_*_guard-error-is-not-rendered-by-the-monitor-so-a-fail-open-guard-is-invisible.md`.

## For completeness, the values that behave

Checked and harmless, recorded so the fix is not scoped wider than it needs to be:
`protectedPaths: null` (nullish, falls back to `DEFAULTS`), `enabled: "false"` (truthy, so the
guard stays on — though the surrounding `guard` object still empties the list, which is
`260804-1601_*_a-partial-guard-object-silently-removes-every-protected-path.md`), `blocksBeforeHalt: "3"` (JS coerces in the `>=` comparison, halt fires at
three), and `decisions: "nope"` (iterated as characters, no category matches).

## Suggested direction

Validate the two layers in `readLayer`, at the point where the cast is today. The minimum
that closes every row above:

- `guard.protectedPaths` must be an array of strings, or the key is dropped with a
  diagnostic;
- the same shape check for `guard.categoryPaths` values and for `decisions`.

A dropped key with a diagnostic is the behaviour the loader already has for an unparseable
file, so the channel exists and `guard.ts` already emits one `guard_advisory` per diagnostic.
The fix is a validation function and a handful of unit cases in `config.test.ts`, plus one
integration case per row above.

The plugin layer should get the same treatment. It is protected, so it is a smaller risk, but
`260802-2334_*_a-shape-valid-escalation-json-makes-the-whole-guard-fail-open-on-both-surfaces.md` is the standing proof that "this file is protected" has not been enough.
