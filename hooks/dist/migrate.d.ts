/**
 * The host migration entry: a v12 Markdown workbench to JSON control, for
 * `bin/fusion-migrate` and nothing else (step 9 of
 * `261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md`).
 *
 *   migrate.js <sub> <workbench> [--session <dir>] [flags]
 *
 * The host reads and the codec writes. This entry reads the v12 Markdown
 * (`lib/legacy-import.ts`), applies the consented repairs an owner chooses
 * (`lib/legacy-repair.ts`; optional, the migration requires none), composes
 * the proposal into `.json-state/migration/`, and drives the codec's
 * `migration` phases through `lib/record-client.ts`, one request per process.
 * It writes no control file, no plan file and no stored answer; the codec
 * alone writes those. It needs the plugin and Node and nothing else.
 *
 * ## The git pass
 *
 * A filer the Markdown never recorded is carried as `legacy-unknown`, its
 * person the author git names for the file's first add (`firstAdds`): one
 * `git log --reverse -M --diff-filter=AR --name-status` over the workbench,
 * each path followed back through the renames git reports, so a marker move
 * and the v11-to-v12 store rename both lead to the original add, as does a
 * rename staged in the index and not yet committed. The person
 * is `%an <%ae>` as written, with no mailmap. A file git does not track (every
 * file, before the first commit), a workbench in no repository and a shallow
 * history each give no person, with that reason as evidence. The run's own
 * identity is never read. Whether a repository exists is the filesystem's
 * answer, not git's: a `.git` entry (a directory, or a worktree's or
 * submodule's file) at or above the workbench. Without one git is never run
 * and need not be installed. Inside one, every git call that does not answer
 * (missing git, a refused repository such as dubious ownership, a signal, a
 * timeout, a full buffer, a fatal status) stops the run as a fault naming the
 * call, never as an empty answer or as "no repository".
 *
 * ## The session
 *
 * `<dir>` (default `$HOME/.fusion-migrate/<12 hex of the workbench path>`)
 * lies outside the workbench and holds what the host keeps: the verified
 * backup and its tree hash, the repair log, and `state.json`, which records
 * the canonical workbench path, the migration id, the proposal's path and
 * hash, every operation id chosen before the first request (the codec's
 * schedule, the `maintenance end` and a rollback's `begin` and `end`), and
 * `.fusion-setup` as it stood before setup metadata. `resume` and `rollback`
 * read it and send the next request whose answer is not stored, under its
 * recorded id; an unknown outcome is answered by the same id, never a fresh
 * one. Every request names the workbench by its `realpath`, because the codec
 * rebuilds the exempt `maintenance` requests from that spelling (W5).
 *
 * ## Setup metadata
 *
 * After `verify` and before `maintenance end`, `.fusion-setup` gains
 * `migration: {id, receipt, migrated_at}` and the plugin version. It is the
 * one file setup metadata writes, and it is on the codec's exclusion
 * allowlist, so neither a later chunk check nor the first rollback after
 * activation sees it. Rollback puts the recorded bytes back.
 *
 * Output: `KEY=value` lines on stdout, reasons on stderr prefixed
 * `fusion-migrate:`; the exit table is the wrapper's header.
 */
export {};
