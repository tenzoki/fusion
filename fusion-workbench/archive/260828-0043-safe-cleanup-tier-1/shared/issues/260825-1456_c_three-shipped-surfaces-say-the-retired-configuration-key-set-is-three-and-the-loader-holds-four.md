Three shipped surfaces say the retired configuration key set is three and the loader holds four

---
`hooks/lib/config.ts` `RETIRED_TOP_LEVEL_KEYS` has carried **four** members since 260824:
`guard`, `decisions`, `escalation` and `churn`. Three shipped surfaces still name three.
A project that meets the fourth advisory is told about a key that none of the three texts
it would consult admits exists, and the one text that is correct, `CLAUDE.md`, is not the
one the advisory sends anybody to.
---
**Filed by:** curator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `hooks/lib/config.ts:349-361` (the loader's four); `260815-1247_*_the-churn-leaves-were-removed-without-a-retirement-entry-and-the-retirement-table-could-not-have-held-one.md` (the record the fourth member's own code comment cites); `260825-1453-curator-run.md` `## 9` (the survey that found it)

## What was measured

At HEAD `3d4b181`. `hooks/lib/config.ts:349-361` defines:

```
const RETIRED_TOP_LEVEL_KEYS: Record<string, string> = {
  guard: …, decisions: …, escalation: …,
  // Retired on 2026-08-24, nine days after the heatmap it configured left …
  churn: …,
};
```

Four members. Each earns one `guard_advisory` per guarded tool call until the key is
deleted from the project's `fusion.json`.

Three shipped surfaces still say three:

| Site | What it says |
|---|---|
| `fusion.json` `_retired` | "the three top-level keys that held it — guard, decisions, escalation — are each reported here as retired if they turn up in this file" |
| `templates/fusion.json` `_retired` | the same sentence, byte-identical |
| `agents/orchestrator.md:140` | "The others name a retired top-level key inside `fusion.json` (`guard`, `decisions`, `escalation`)" |

`CLAUDE.md` is **correct** and says four in both places it mentions the set, so nothing
about this reaches the curator's own ledger. `skills/help/SKILL.md:101` and `README.md:28`
are correct too: both name `churn` as the fourth in their v10.7 notes.

## Why the two JSON files agree, and why that is not luck

`hooks/lib/__tests__/config.test.ts` cuts the keys named in its `PROJECT_SET_KEYS` out of
both the root `fusion.json` and `templates/fusion.json` and holds every remaining byte
identical. `PROJECT_SET_KEYS` is `["orchestrator"]`, so `_retired` is inside the compared
region. The two files cannot disagree with each other and are pinned to each other rather
than to the loader. Nothing pins either to `RETIRED_TOP_LEVEL_KEYS`, which is how both
went stale in one step and stayed green.

## Why it matters more than a stale count usually does

The advisory exists because a retired key is inert and silent, and a project that believes
a setting is in force when the mechanism behind it is gone is the failure it prevents. A
user who meets the `churn` advisory and opens `fusion.json` to understand it reads, in that
same file, a sentence saying the retired set is three and naming three others. The text
that would resolve their confusion is the one they are least likely to open.

`agents/orchestrator.md:140` has the same shape one level up: the orchestrator is told to
repeat every loader diagnostic to the user in the Setup summary, and the parenthesis
listing what those diagnostics can be omits one of the four.

## Owners, and why this is filed rather than fixed

Filed by the curator, whose three surfaces are the decision records, the project's rule
files and `CLAUDE.md`. All three sites are outside that remit:

- `fusion.json` and `templates/fusion.json` are structured data → **`ontocoder`**
- `agents/orchestrator.md` is an agent prompt → **`coder`**

Both edits are small and neither needs a decision: the loader is the source of truth, its
fourth member landed with a dated comment and a cited record, and the correction is to name
it. The `templates/` edit and the root edit must land together or `config.test.ts` goes red,
which is the one sequencing constraint here.

Worth considering with the fix rather than instead of it: nothing asserts that the prose in
either JSON file matches `RETIRED_TOP_LEVEL_KEYS`, and a fifth retirement would go stale the
same way. `260811-1522_*_should-the-readme-hooks-lib-table-pin-its-prose-to-the-modules-it-describes.md`
is the same question about a different table and is answered but not implemented.

**Severity:** Low in consequence, medium in reach. Nothing malfunctions; a user reading the
file fusion tells them to edit is told something false about the file they are editing.

---
Resolved: 260827. `agents/orchestrator.md:114`'s parenthesis now names four keys, `churn` last; the two `_retired` strings in `fusion.json` and `templates/fusion.json` were corrected by the ontocoder in the same commit (plan `260827-1756_*_repair-the-twenty-open-defect-records.md`, steps 13a and 13b). The "worth considering" pin between the JSON prose and `RETIRED_TOP_LEVEL_KEYS` is declined: the hook-test growth bound has one line free, and `260811-1522_*_should-the-readme-hooks-lib-table-pin-its-prose-to-the-modules-it-describes.md` is the same question, answered and unrealised; a pin here would realise it piecemeal on a different table.
