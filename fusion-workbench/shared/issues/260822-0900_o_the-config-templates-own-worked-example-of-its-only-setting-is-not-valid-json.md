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

---
**Progress 260822, and the first fix was incomplete.** The user's guard log settled where the `N`
came from and how far it reached.

**It is not the seeded template.** The consuming project's `fusion.json` carries no underscore notes
at all, so it was never the template; it holds the one key alone. The `N` was copied from prose
somewhere else, and the fix that only touched `templates/fusion.json` therefore repaired the file
least likely to have caused it.

**Three spellings across eight shipped locations, measured after the first fix:**

| Spelling | Where | Copying it gives |
|---|---|---|
| `<n>` | `agents/orchestrator.md`, `hooks/lib/config.ts`, `CLAUDE.md:138`, `README-hooks.md`, `README.md` | invalid JSON, but visibly a placeholder |
| `N` | `CLAUDE.md:38`, `README-agents.md:170` | `Unexpected token 'N'`, and it reads like a literal |
| `12` | `templates/fusion.json`, root `fusion.json` | valid |

The two bare `N` occurrences are now `<n>`. Prose is uniform on the visible-placeholder form, and the
two files a user actually edits carry a real number. `npm test` exits 0.

**What the user's log showed about the failure itself**, which is a second fault and not the
placeholder:

```
SyntaxError: Unexpected token 'N', ..."axTurns": N}}{"orche"... is not valid JSON
```

`}}{"orche` is **two JSON objects concatenated**. The file at that moment held
`{"orchestrator": {"maxTurns": N}}` followed by another object opening. Something appended where it
should have replaced. That write is not diagnosable from the record available here, and it is worth
its own investigation if it recurs: a config file that gains a second root object silently is a
worse failure than a placeholder, because no amount of correcting the documented shape prevents it.

**The advisories are dated 2026-08-17T12:10 and the project's file was last written 2026-08-21.**
So the cause was fixed four days before the user asked, and what they were looking at was the
append-only log doing its job. That part is
`shared/issues/260822-0849_*_the-dashboard-poll-swallows-every-failure-so-a-dead-page-keeps-showing-its-last-warnings-forever.md`
and the standing dismissal defect, not this record.
