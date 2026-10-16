The stale-record refusal drops the session flag, and set-aside names resume for a rolled-back record
---
Two messages in `hooks/migrate.ts` name the wrong next command in a cell the tests do not cover.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261016-1052-reviewer-closing-pass-over-the-migrate-step-7-stale-session-package.md`

## Evidence

1. **The refusal drops the session flag.** `current()` always names "`bin/fusion-migrate set-aside --consent`", even when the caller passed `--session <dir>`. Run as written, that command acts on the default session, not the one that was refused. Reproduced on 2026-10-16: `rollback --session <dir>.stale-…` printed the bare command. It also printed "renames that directory to `<dir>.stale-….stale-<UTC stamp>`". The skill always uses the default session, so Step 7 is not affected. Direct helper use is.
2. **set-aside names the wrong commands for a rolled-back record.** `setAside()` refuses a record that `stale()` reads as current with "`resume` or `rollback` acts on it". A rolled-back record is never stale (`stale()` returns null on `s.rolled_back`), so it lands in this branch (read from the code, not run). For that record `resume` refuses ("is being or was rolled back") and `rollback` no-ops. The command that acts is `run`, which starts fresh over a rolled-back record.

## Fix direction

- In `current()`, add `--session <dir>` to the named command whenever the session is not the default.
- In `setAside()`, word the current-record refusal by state: "`run` starts a new migration" for a rolled-back record, and `resume` or `rollback` otherwise.

## Acceptance

A test in `hooks/lib/__tests__/migrate.test.ts` covers both cases:

- A stale refusal under an explicit `--session` names that `--session`.
- `set-aside --consent` over a rolled-back record exits 5 and names `run`.
