mergeSettingsFile replaces a symlinked settings.local.json with a regular file and drops its mode
---
`hooks/lib/temp-paths.ts:171-173` writes a sibling `<path>.fusion-tmp-<pid>` with default mode and `renameSync`s it over `path`. When `path` is a symlink (dotfile-managed settings), the link is replaced by a regular file and the target no longer receives updates; a file kept at mode 600 becomes 644 under the usual umask. No entry is lost, but the user's file arrangement is changed by a write that promises only to add.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

Acceptance: the merge stages beside `realpath(path)`, renames onto the real path and copies the original mode; `fusion-tmp.test.ts` covers a symlinked settings file (link kept, target merged) and a 600 file (mode kept).
