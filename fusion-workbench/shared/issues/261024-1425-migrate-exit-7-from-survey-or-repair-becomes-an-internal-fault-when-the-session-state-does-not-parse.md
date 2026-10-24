migrate: an exit 7 from `survey` or `repair` becomes exit 3 "a fusion bug or an incomplete install" when the session's `state.json` does not parse
---
The exit-7 handler in `main` evaluates `readState(session)` for every subcommand, but only `retry`'s `run` branch uses it. `survey` and `repair` never read the session record otherwise. So when their `migration survey` request goes unanswered and `state.json` does not parse, the `JSON.parse` error escapes the handler. The top-level catch then reports an internal fault (exit 3, "a fusion bug or an incomplete install", with a stack). The unknown-outcome message and its retry command are lost.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261024-1222-reviewer-post-release-pass-over-v13-3-6.md (noted there, not filed); 261024-1425-reviewer-post-release-pass-over-v13-3-7.md; commit 046980a2

**Evidence.**

- `hooks/migrate.ts` `function main`: `if (e instanceof Stop && e.code === EXIT.unknown) throw new Stop(EXIT.unknown, `${e.message}; ${command(wb, session, retry(sub, rest, readState(session)))} sends the same request again.`);`. `retry` reads `s` only when `sub === "run"`.
- `readState` is `JSON.parse(readFileSync(...))` with no guard. `run`, `resume`, `rollback`, `set-aside` and `status` read it before any codec call, so for them the handler adds no new failure. `survey` (`surveyOut` → `survey` → `send(... phase: "survey")`) and `repair` do not read it.
- Reproduced in a scratch worktree at dfcc9fc5, using the suite's `killPlugin` with `{phase: "survey"}`, `--session <home>/own` and `state.json` set to `{ not json`:
  - `survey`: exit 3, "an internal fault stopped the migration entry, a fusion bug or an incomplete install ... SyntaxError: ... at readState".
  - `repair --list`: the same exit 3.
  - The same `survey` without the kill: exit 0. The command works until a codec answer is lost.

The trigger needs a damaged `state.json` (`writeState` writes through a temp file and `rename`) and a lost codec answer at the same time, so it is rare. When it happens, the message blames fusion or the install for a user-side file, and drops the retry that exit 7 promises in the `bin/fusion-migrate` header.

**Fix direction.** Read the record only where `retry` needs it: pass `sub === "run" ? readState(session) : null`, or let `retry` read it lazily in its `run` branch.

**Acceptance.**
- A test kills `phase: "survey"` with an unparsable `state.json` in the session. It asserts exit 7 and that stderr names `bin/fusion-migrate survey --session …`. Red on dfcc9fc5.
- `cd hooks && npm test` exits 0.
