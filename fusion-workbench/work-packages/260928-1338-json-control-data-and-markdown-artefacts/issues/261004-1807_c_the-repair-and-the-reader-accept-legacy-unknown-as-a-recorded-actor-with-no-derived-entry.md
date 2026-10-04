The repair and the reader accept legacy-unknown as a recorded actor with no derived entry
---
`ACTOR` (`hooks/lib/legacy-import.ts`, `/^[a-z][a-z0-9-]*$/`) admits the reserved token. A repair answer `--value actor=legacy-unknown` passes the check in `applyRepair` (`hooks/lib/legacy-repair.ts`, `q.form === "actor" ? ACTOR.test(v)`), and the composer's `filedBy` reads a Markdown `**Filed by:** legacy-unknown` as a recorded actor. Either way the control carries `filed_by.actor: "legacy-unknown"` with no `derived["/filed_by/actor"]`, while `common.schema.json` and `REQUESTS.md` line 2082 say the value "is always paired with" that entry.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261003-1746_*_how-does-an-imported-record-carry-a-filer-its-legacy-workbench-never-recorded.md, 261004-1807_*_the-reserved-actor-legacy-unknown-passes-every-nested-actor-position-so-a-live-write-produces-it.md, 261004-1807-reviewer-fj04-closing-pass-over-the-legacy-migration.md

**Evidence.** Read at `9232314a`: `ACTOR` in `legacy-import.ts`; its use in `legacy-repair.ts`; `filedBy` in `legacy-import.ts`, whose actor group `[a-z][a-z0-9-]*` matches the token; the `actor` closure of `composeProposal`, which returns a parsed actor without a `derived` entry. Not reproduced by a run.

**Acceptance.** A repair answer naming `legacy-unknown` as an actor is refused as unanswered, with nothing written. A legacy `**Filed by:**` line naming it is treated as unreadable (`filed-by-unreadable`, so the derived pair is written) rather than as a recorded value. One `legacy-repair.test.ts` case and one `legacy-import.test.ts` row show each.

**Resolved (2026-10-04).** The reader treats a `legacy-unknown` filer line as unreadable (derived pair written) and the repair refuses it as an answer (`e437d6a8`, `788f4acf`). Resolved by the commits named, closed by the commit that renames this record to `_c_`.
