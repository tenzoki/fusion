# A symlink in place of a protected file writes through it and removes the path from the watched set

---

**Severity:** Critical — arbitrary file write outside the project, plus permanent silent loss of protection for the path
**Domain:** code (security control)
**Filed by:** analyst, during the guard-enforced-policies analysis
**Affects:** `hooks/lib/protected-snapshot.ts` (`enumerateProtected`, `fingerprint`, `restore`), `hooks/tracker.ts` (`measureProtectedPaths`)
**Cross-references:**
`260809-1103-guard-enforced-policies.md` §Findings 2c-1 (the measurement),
`rules/protected-path-discipline.md` `## The route to the file does not matter` (the claim this falsifies),
`hooks/lib/protected-snapshot.ts:182-197` (the symlink boundary the module does state, which covers enumeration and not the restore)

---

## What is wrong

Replacing a glob-protected file with a symbolic link, in a single tool call, does three things at once. The guard reports the first as a success and never sees the other two.

1. The restore writes the protected file's previous content **through** the link, into whatever the link points at. The target may be anywhere the hook process can write, inside or outside the project.
2. The protected path is left as a symlink. The guard's message says it "has been restored"; it has not.
3. From the next tool call onward the path is **absent from the watched set entirely**, so its content can be changed freely and the measurement reports nothing.

The third consequence is the one that matters most. A protection list that a single `ln -s` removes a path from is not a protection list for that path.

## Measured

Real hooks as subprocesses (`hooks/dist/guard.js`, `hooks/dist/tracker.js`), a scratch consuming project with `fusion-guard.json` declaring `"protectedPaths": ["rules/**"]`, node 24.2.0, macOS. Every step below is a recorded run, not a reading of the source.

Setup: `rules/x.md` holds `PROTECTED CONTENT`. An unrelated file `victim/target.txt` holds `IMPORTANT UNRELATED FILE`.

```
call 1  PreToolUse                       snapshot taken; rules/x.md fingerprinted
        the tool call runs:
          rm rules/x.md
          ln -s <project>/victim/target.txt rules/x.md
        PostToolUse                      "rules/x.md was deleted and has been
                                          restored to its content from before
                                          this tool call." Halt raised.

        rules/x.md is                    still a symlink
        victim/target.txt now holds      PROTECTED CONTENT     <-- overwritten

call 2  PreToolUse                       snapshot keys: fusion-guard.json only
                                          (rules/x.md is gone from the set)
        the tool call runs:
          printf 'ATTACKER CONTENT VIA THE SYMLINK' > victim/target.txt
        PostToolUse                      {}   nothing measured, no halt

        cat rules/x.md gives             ATTACKER CONTENT VIA THE SYMLINK
```

## Root cause

Three lines, each defensible alone, and the combination is the defect.

- `enumerateProtected` skips every symbolic-link entry (`hooks/lib/protected-snapshot.ts:218`). A glob-covered path that becomes a symlink therefore leaves the enumeration, and leaves it *silently*, since enumeration produces no record of what it declined to walk.
- `fingerprint` uses `statSync` and `readFileSync` (`hooks/lib/protected-snapshot.ts:272-273`), both of which follow links. So the path's fingerprint, while it is still enumerated, is the *target's* content.
- `restore` uses `writeFileSync` with no `O_NOFOLLOW` (`hooks/lib/protected-snapshot.ts:376`), which follows the link and writes the target.

The first line takes the path out of the set. The third turns the guard's own remediation into the write primitive on the way out.

## Blast radius, and the one part of the list that survives

Patterns carrying no wildcard are watched through `literalPaths` (`hooks/lib/protected-snapshot.ts:247-249`) whether or not enumeration finds them, so a literal entry does not disappear from the set. Measured: `fusion-guard.json`, the self-protection floor, was still the snapshot's key after `rules/x.md` had dropped out. Those entries still suffer consequence 1, because `fingerprint` and `restore` both follow the link.

Against the shipped list that splits as follows. `agents/**`, `rules/**`, `skills/**` lose protection permanently. `hooks/config.json`, `hooks/hooks.json`, `settings.json`, `bin/monitor`, `.claude-plugin/plugin.json` keep it, and can still be used to write one file elsewhere.

## Why the existing documentation does not cover it

`hooks/lib/protected-snapshot.ts:182-197` states a symlink boundary, and states it accurately for what it describes: enumeration does not follow a symlinked directory, and a link planted to reach outside the tree is not watched at the far end. It is silent on the restore, which is the direction that writes.

`rules/protected-path-discipline.md:19` says the route to the file does not matter, and `:21` says the rule "carries no catalogue of holes" because the measurement asks a decided question. Both sentences are false while this defect stands, and the second is the more expensive one: an agent that reads it has been told there is nothing to look for.

## Suggested direction

Not a symlink allow-list, and not "follow the link and watch the target" — the second re-opens the undecidable question at the far end of the link.

The integral shape is to make the fingerprint carry the path's **kind**, not only its content, and to make the restore refuse to follow:

- `fingerprint` uses `lstatSync`. A symlink gets a fingerprint of its own kind (its target string), distinct from `ABSENT` and from any base64 content, so a regular file turning into a link reads as `modified` rather than as `deleted`.
- `enumerateProtected` stops skipping symbolic-link *files*; it keeps skipping symbolic-link *directories*, where the cycle argument at `:186-197` still holds.
- `restore` opens with `O_NOFOLLOW` (or `lstat`s and unlinks a link before writing), so the write lands on the protected path and never on a target.

That set is one question asked consistently in three places, rather than three special cases.

## Acceptance criteria

- [x] Replacing a glob-protected file with a symlink is reported as a change, reverted to a regular file with the previous content, and halts.
- [x] The symlink's target is not written.
- [x] The path is still in the watched set on the following tool call, measured through the real hooks.
- [x] The same three hold for a literal (wildcard-free) protected entry.
- [x] A symlinked *directory* inside a protected tree is still not descended into, and the test says why.
- [x] `rules/protected-path-discipline.md` no longer claims there is no catalogue of holes while one is open, or the claim is re-earned by this fix.

---
Resolved: `509e4c6` — `fingerprint` uses `lstatSync` and gives a symbolic link a
fingerprint value of its own kind, so a protected file replaced by a link reads
as `modified` rather than as deleted or as unchanged; `enumerateProtected` keeps
symlinked *files* in the watched set and still skips symlinked *directories*
(the cycle argument, restated in the module header); `restore` unlinks a link at
the final component and opens with `O_NOFOLLOW`, and refuses outright when any
parent component resolves elsewhere (`260809-1231_*_the-restore-writes-through-a-symlinked-parent-directory-which-the-final-component-check-does-not-cover.md`). Pinned by the symlink cases
in `hooks/lib/__tests__/protected-snapshot-integration.test.ts`, all driven
through the real hooks against a project root outside this repository, with the
victim file's content asserted unchanged so none can pass vacuously. The last
criterion is discharged by step 6 of
`260809-1229_*_plan-five-severe-guard-defects.md`, which rewrote
`rules/protected-path-discipline.md` from conceding this open gap to stating
what the measurement compares and why — without re-claiming that no gaps exist.

**Reconciliation 260809-1651-reconciliation.md (reconciler, domain `code`) — closure confirmed against the tree, not against the note above.**
All six acceptance criteria verified at HEAD `fb262d8`. Criteria 1-5: `fingerprint` calls `lstatSync` and returns `LINK_PREFIX + readlinkSync(abs)` for a link (`hooks/lib/protected-snapshot.ts:396-398`); `restore` recreates a link with `symlinkSync` (`:546-548`), unlinks a link at the final component and opens with `constants.O_NOFOLLOW ?? 0` (`:600`, `:620`), and refuses when `realpathSync(dirname(abs))` diverges from the lexical parent under a realpath-resolved root (`:579-580`). Six cases in `hooks/lib/__tests__/protected-snapshot-integration.test.ts` under "a symbolic link does not carry a protected path out of the set" all pass, including the following-tool-call watched-set case and the literal-entry pair. Criterion 6: `rules/protected-path-discipline.md` no longer claims an absence of holes; it states what the measurement compares and adds "Read that as a claim about the question being asked, not as a promise about the machinery asking it." Suite at this HEAD: 33 files, 1078 tests, exit 0.
