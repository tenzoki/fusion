# The restore writes through a symlinked parent directory, which the final-component check does not cover

---

**Severity:** Critical — the same arbitrary-write primitive as `260809-1104`, through a door that issue's suggested fix leaves open
**Domain:** code (security control)
**Filed by:** planner, while planning the fix for `260809-1104`
**Affects:** `hooks/lib/protected-snapshot.ts` (`restore` at `:367-377`, `fingerprint` at `:269-277`)
**Cross-references:**
`fusion-workbench/shared/issues/260809-1104_o_a-symlink-in-place-of-a-protected-file-writes-through-it-and-removes-the-path-from-the-watched-set.md` (the same primitive through the final path component; its suggested direction does not reach this case),
`fusion-workbench/shared/analyses/260809-1103-guard-enforced-policies.md` §Findings 2c-1,
`fusion-workbench/shared/planning/260809-1229_o_plan-five-severe-guard-defects.md` Step 1 (where the fix is planned)

---

## What is wrong

`260809-1104` establishes that `restore` follows a symbolic link standing at the protected path itself, and proposes closing it with `O_NOFOLLOW` or an `lstat`-and-unlink before the write. Both of those inspect the **final** component of the path. Neither says anything about the components in front of it.

`restore` runs `mkdirSync(dirname(abs), { recursive: true })` and then `writeFileSync(abs, …)` (`:375-376`). `mkdirSync` with `recursive: true` succeeds silently when the directory already exists, and an existing symbolic link to a directory *is* an existing directory as far as that call is concerned. `writeFileSync` then resolves the whole path, link included, and the protected file's previous content lands inside whatever the link points at.

So replacing `hooks/` with a symlink has the same effect as replacing `hooks/config.json` with one: the guard's own remediation becomes the write primitive.

## Why `260809-1104`'s fix does not cover it

`O_NOFOLLOW` is a property of the final component by definition — it makes `open` fail when the named file is a symbolic link, and says nothing about the directories traversed to reach it. An `lstat`-and-unlink form has the same reach. A fix that takes either and stops has closed one of two doors while `rules/protected-path-discipline.md` re-earns a claim of completeness it would not hold.

## Not measured

`inference:`, and the label is deliberate. The reading is from the source (`mkdirSync` recursive is a no-op on an existing directory; `writeFileSync` follows every component) and from the fact that `260809-1104` measured the identical primitive one component further along. It was **not** reproduced through the real hooks, because reproducing it means planting a symlink over a protected directory, and this is a planning pass rather than an implementation one. The fix's own test, described below, is where the measurement belongs.

## Blast radius

Narrower than `260809-1104`'s and still arbitrary. It needs a protected path whose *parent* can be replaced in one tool call. Against the shipped list that is `hooks/` (two entries), `bin/` (one), `.claude-plugin/` (one), and the project root itself for `settings.json` and `fusion-guard.json`. The glob entries `agents/**`, `rules/**` and `skills/**` are already covered by `enumerateProtected`'s skip of symlinked directories, which takes them out of the watched set rather than writing through them, which is `260809-1104`'s third consequence and not this one.

## Suggested direction

The same question `260809-1104` asks of the final component, asked of the whole path: **is the object the guard is about to write the object it measured?**

Before writing, compare `realpathSync(dirname(abs))` against `resolve(realpathSync(root), dirname(rel))`. Both sides resolve the root, because macOS resolves `/tmp` to `/private/tmp` and the suite already carries a case named for that trap. A divergence means some component is a link, so the target is not the measured object: **refuse the restore and report the refusal** through the path `restore` already has — it throws, `restorePath` catches, `describe` tells the model the change is still on disk.

Refusing rather than writing is the direction that cannot open behaviour. It also cannot silently succeed, which is the failure mode `260809-1104` names as the worst of the three.

## Acceptance criteria

- [x] Replacing a protected path's parent directory with a symlink does not write the link's target.
- [x] The model is told the restore failed and the change is still on disk, rather than being told the path was restored.
- [x] The ordinary revert cases are untouched, including on a filesystem whose project root itself resolves through a link (`/tmp` on macOS).
- [x] A test drives the case through the real hooks against a project root outside this repository, and asserts the victim directory's file is unchanged.

---
Resolved: `509e4c6` — folded into step 1 of
`shared/planning/260809-1229_*_plan-five-severe-guard-defects.md` rather than
deferred, because shipping the final-component fix alone would have let
`rules/protected-path-discipline.md` re-earn a claim that was still false.
Before writing, `restore` compares `realpathSync(dirname(abs))` against the
lexical parent resolved under a realpath-resolved root — both sides resolved,
because macOS resolves `/tmp` to `/private/tmp` — and on divergence it throws
instead of writing. The refusal travels the path the module already had:
`restorePath` catches, `describe` tells the model the change is still on disk,
and the halt is raised as for any other measured change. Pinned by "refuses the
restore when the PARENT directory became a link, and says so" in
`hooks/lib/__tests__/protected-snapshot-integration.test.ts`, which asserts the
victim directory's file unchanged, the message text, and `haltActive`, through
the real hooks against a project root outside this repository. The ordinary
revert cases run under the same `/tmp` root and stayed green.
