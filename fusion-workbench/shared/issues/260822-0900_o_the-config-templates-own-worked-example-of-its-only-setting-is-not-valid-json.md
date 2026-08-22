The config template's worked example of its only setting is not valid JSON, and copying it is how you configure the file

---

**Severity:** High for a new consumer. The trap is on the documented path, the failure is silent as to its cause, and the setting the user believed they had made is not in force.
**Domain:** code
**Filed by:** orchestrator, from a user report on a consuming project
**Affects:** `templates/fusion.json` and the root `fusion.json`, the `_turnBudget` and `_retired` notes
**Cross-references:** `shared/issues/260822-0849_*_the-dashboard-poll-swallows-every-failure-so-a-dead-page-keeps-showing-its-last-warnings-forever.md`, met in the same report; `hooks/lib/config.ts` `readLayer`, which produces the advisory

---

## What happened

A user set the Turn budget on a consuming project and got, on every guarded tool call for days:

```
fusion configuration at <path>/fusion.json is not valid JSON ... Unexpected token 'N'
```

The `N` is fusion's own placeholder, copied out of the file being edited.

## The template documents one setting in three spellings, and two of them do not parse

`templates/fusion.json` is a self-documenting file: the notes a user reads live in the same file the user edits, which is the design and is good. It carried three worked shapes of the single setting it configures.

| Note | Shape as shipped | Copy-pasteable |
|---|---|---|
| `_override` | `{"orchestrator": {"maxTurns": 12}}` | yes |
| `_turnBudget` | `"orchestrator": {"maxTurns": N}` | **no** — `N` is a bare token |
| `_retired` | `{"orchestrator": {"maxTurns": <n>}}` | **no** — `<n>` is not a JSON value |

`_turnBudget` is the note *about the Turn budget*, so it is the one a person setting the Turn budget reads, and it carried the placeholder that fails. `JSON.parse` reports it as `Unexpected token 'N'`, which names the symptom and not the cause: nothing in the message says the token came from fusion's own documentation.

The seeded template itself is fine — it declares no real key and inherits everything, verified by parsing both the work-tree and installed copies. The defect is only reachable by doing what the file tells you to do.

## Why it went unnoticed here

The plugin's own root `fusion.json` carries the same three notes and a real `orchestrator` key that was written by hand as `12`, so this repository never copied the broken shape and never saw the advisory. `hooks/lib/__tests__/config.test.ts` pins the two files byte-for-byte outside `PROJECT_SET_KEYS`, which keeps them consistent with each other and says nothing about whether the prose inside them parses.

## What was done

All three shapes now read `{"orchestrator": {"maxTurns": 12}}`, in both copies, so every documented form is valid JSON and identical to the others. `npm test` exits 0, 40 files and 718 tests.

## What is not done, and is the reason this record stays open

**Nothing stops the next placeholder.** The fix is three literals corrected by hand. No gate reads the JSON fragments inside these notes, and the pinning test compares the two files to each other rather than checking either against a parser. A check that extracted every `{...}` fragment from the underscore notes and asserted it parses would have caught this on the commit that introduced it, and would catch the next one. Whether that check is worth its lines against the hook-test growth bound, which has 15 lines of head-room, is the open question.

**And the advisory could name the cause.** `readLayer` has the file, the path and the parser error. When the parse fails on a bare token that matches a placeholder this project ships, the message could say so. That is a second, independent improvement and belongs to whoever takes this record.
