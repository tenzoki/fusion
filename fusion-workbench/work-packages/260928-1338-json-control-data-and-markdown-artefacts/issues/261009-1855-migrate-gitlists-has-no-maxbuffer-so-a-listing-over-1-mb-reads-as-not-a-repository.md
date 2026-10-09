fusion-migrate's untracked and ignored listing has no maxBuffer, so a listing over 1 MB reads as "not a repository"
---
`hooks/migrate.ts` `gitLists` spawns `git ls-files --others` without `maxBuffer` and reads every non-zero or null status as no repository. This is the sibling of the defect `78680a11` fixed in the sweep, in the file that commit cites as its precedent.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence.** `hooks/migrate.ts:140` has `spawnSync("git", ["-C", wb, "ls-files", "-z", "--others", "--exclude-standard", ...flags, "--", "."], { encoding: "utf-8", timeout: 30_000 })` with no `maxBuffer`. `:141` maps any status other than 0 to `null`, and `:144` maps a `null` untracked list to `{ untracked: [], ignored: [], git: false }`. An ignored list over 1 MB becomes `[]` through `?? []`. The effect: `status` prints `reported=git\tnot a repository` (`:330`) for a repository, and `composeProposal` drops every `untracked-record` and `ignored-record` finding (`hooks/lib/legacy-import.ts:703-704`). A gitignored workbench the size of the axibra one (8 151 files, 1.1 MB of paths) reaches that size. The other four git spawns in the file carry `maxBuffer: 1 << 30` (`:154`, `:159`, `:178`). The `78680a11` commit message says the sweep's buffer is set "as hooks/migrate.ts does", which holds for those four and not for this one. Verified by reading, not run.

**Acceptance.** `gitLists` carries `maxBuffer: 1 << 30`. A spawn error, signal or timeout is reported as a git failure, not as "not a repository". A test or a recorded run with an ignored listing over 1 MB shows the `ignored=` lines.

---
Resolved: `hooks/migrate.ts` `## The git pass` now runs every git call through one helper with `maxBuffer: 1 << 30` and a 600 s timeout. "No repository" is read from `rev-parse --show-toplevel` exiting 128 alone, and every other call that does not exit 0 (spawn error, signal, timeout, full buffer, fatal status) stops the run as a fault, exit 3, naming the call and the reason. `gitLists` and `firstAdds` (whose `--is-shallow-repository` read had the same gap) both use it. The case in `hooks/lib/__tests__/migrate.test.ts` adds 1 400 ignored files, about 1.13 MB of listing: the old build printed none of the `ignored=` lines, the new one prints all 1 400.
