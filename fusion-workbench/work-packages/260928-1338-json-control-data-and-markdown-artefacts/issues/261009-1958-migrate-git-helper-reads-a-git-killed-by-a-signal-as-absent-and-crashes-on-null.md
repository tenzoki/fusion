fusion-migrate's git helper reads a git killed by a signal as "absent", and a null dereference reports it as a fusion bug
---
The `git` helper in `hooks/migrate.ts` defaults `absent` to `null`, and `spawnSync` reports a process killed by a signal with `status: null`. So that kill returns `null` ("absent") instead of a fault. The four callers assert non-null (`!`), and the run dies with a `TypeError` and the "internal fault, a fusion bug" message instead of naming the git call.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Review domain:** code
**Cross-references:** `261009-1958-reviewer-git-exit-sets-26ada996.md`

**Evidence.** `hooks/migrate.ts:141-144` at `26ada996`:

```ts
function git(cwd: string, args: string[], absent: number | null = null): string | null {
  const r = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf-8", timeout: 600_000, maxBuffer: 1 << 30 });
  if (r.error === undefined && r.status === 0) return r.stdout;
  if (r.error === undefined && r.status === absent) return null;
```

A signal without `r.error` (an external `kill`, the OOM killer) gives `status === null === absent`. A timeout and a full buffer set `r.error` and are not affected. The callers that pass no `absent` dereference the result: `:155` (`ls-files`), `:168` (`--is-shallow-repository`), `:170` (`log`), `:188` (`diff --cached`). The `killed by ${r.signal}` branch of `why` (`:145`) is unreachable for them. Reproduced: a `git` stub first on `PATH` that runs `kill -9 $$` on `ls-files` and otherwise execs the real git. `survey` on `26ada996` prints `an internal fault stopped the migration entry, a fusion bug or an incomplete install` and `TypeError: Cannot read properties of null (reading 'split') at ls`. The exit code is 3 either way, so only the reason is wrong. The header (`hooks/migrate.ts:26-29`) promises that a signal "stops the run as a fault", naming the call.

**Fix direction.** Return `null` only when a caller named an `absent` status (`absent !== null && r.status === absent`). Better: split the helper so that a caller without an absent case gets `string`, and drop the four `!`.

**Acceptance.** A case in `hooks/lib/__tests__/migrate.test.ts` with such a stub: exit 3, stderr names `git ls-files` and `killed by SIGKILL`, and it contains no `TypeError`. The case fails on `26ada996`.

---
Resolved: the `git` helper in `hooks/migrate.ts` now has two overloads. Called without a "no" status, it returns `string` and treats every outcome other than exit 0 as a fault, so the four `!` assertions are gone. Called with one, it returns null only when `no !== undefined && r.status === no`, and since a status is never null there, a signal or a spawn error is always a fault naming the call (`killed by SIGKILL`). The only caller that names a "no" is the new `rev-parse --verify -q HEAD`, with 1. The case in `hooks/lib/__tests__/migrate.test.ts` puts a `git` stub on PATH that runs `kill -9 $$` on `ls-files`. On `26ada996` it printed the "fusion bug" text and a `TypeError`. It now prints exactly `fusion-migrate: git ls-files … failed: killed by SIGKILL` with exit 3.
