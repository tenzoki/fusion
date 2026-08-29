A nonexistent extra `<path>` under `--write` is an uncaught ENOENT stack trace from `refusal()`, not the usage line
---
`hooks/citation-sweep.ts` `main()` calls `refusal(root, extra)` before it checks that each extra path exists (`if (!existsSync(abs)) usage(...)` comes after, in the file-collection loop). `refusal()` runs `realpathSync(resolve(p))` on every extra path for guard (a)'s outside-the-work-tree check, and `realpathSync` throws on a missing path. Reproduced on a clean scratch repo: `fusion-citation-sweep --write --yes /nonexistent/file.md` prints a Node stack trace (`Error: ENOENT ... at refusal (hooks/dist/citation-sweep.js:217)`) and exits 1; the same path under `--dry-run` prints `fusion-citation-sweep: /nonexistent/file.md does not exist` and the usage line. The exit code is 1 both ways by accident (Node's uncaught-exception code), so the exit table is not wrong, but the stderr contract (`one line naming the condition`) is.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Affects:** `hooks/citation-sweep.ts` (`refusal()`, `main()`), `hooks/dist/citation-sweep.js`

## Acceptance

- The existence check on extra paths runs before `refusal()` (in `parse()` is the natural place), so a missing path is the usage error in every mode.
- One test case in `citation-sweep.test.ts`: `--write --yes <missing path>` exits 1 with the `does not exist` line and no stack trace.
