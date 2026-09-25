# CHECK 2 matches the protected list un-canonicalised, so `./agents/coder.md` is not protected at all

---

**Severity:** High
**Domain:** code
**Filed by:** coderev, reviewing Turn 1 of `260801-1244-guard-rules-write` (`c7f117b..HEAD`)
**Affects:** the write-tool path only (`Write` / `Edit` / `MultiEdit` / `NotebookEdit`). The Bash
path is not affected — `resolveTarget` already canonicalises.
**Status at HEAD:** pre-existing, unchanged by this diff. Surfaced by it, and the diff's own
rationale is what makes it load-bearing.
**Cross-references:** `hooks/guard.ts:496` (the un-canonicalised match),
`hooks/guard.ts:123-135` (`normalizeToRelative`, which returns a relative path untouched),
`hooks/lib/rules-write-exemption.ts:37-62` (the docstring asserting these spellings reach CHECK 2),
`hooks/lib/bash-mutation-guard.ts:1059` (the Bash path, which does canonicalise)

---

## What was found

The Step 2 coder canonicalised the **grant** side and left the **protection** side alone.
`hooks/guard.ts:496` is:

```ts
if (matchesAny(filePath, config.guard.protectedPaths)) {
```

`filePath` is `normalizeToRelative(rawFilePath)`, and that function returns a relative input
**unchanged** (`:124-126`). So a non-canonical relative spelling that names a protected file
does not match `agents/**` and never reaches CHECK 2's body at all — it is not exempted, it is
never protected.

## Evidence

Real guard subprocess, harness project, **flag unset**:

```
  Edit agents/coder.md                    DENY
  Edit ./agents/coder.md                  allow
  Edit x/../agents/coder.md               allow
  Edit ./hooks/config.json                allow
  Edit ./skills/demo/SKILL.md             allow
  Edit ./.claude-plugin/plugin.json       allow
  Edit rules/../agents/coder.md           DENY
```

The last two lines are the shape of the defect. `rules/../agents/coder.md` denies — by
accident, because `rules/**` happens to match it textually. `x/../agents/coder.md` writes the
same file and allows, because no protected pattern happens to match its prefix. A leading `./`
is enough on its own.

## Why this is the third member of the spelling space, not a separate concern

The Circle's brief asked for a third escape spelling on the assumption that the pair the
implementer found is not the whole set. This is that member, and it is the **mirror** of the
second one. `rules-write-exemption.ts:51-54` states the premise explicitly:

> A `..` segment. `rules/../agents/coder.md` matches `rules/**` textually, which is why it is
> protected today, but it WRITES `agents/coder.md`. … the write-tool path does not [collapse
> it], because `normalizeToRelative` returns a relative path untouched.

That premise is either true or false, and the diff is built on it being true. If a relative,
`..`-carrying `file_path` reaches CHECK 2 — and Step 2 canonicalised the predicate precisely
because it does — then `x/../agents/coder.md` reaches it too, and that one is a complete
protected-path bypass needing no flag. The fix that closed the grant side left the strictly
worse half of the same input class open.

## Honest bound on reachability

I could not establish whether Claude Code's `Write`/`Edit` tools forward a non-absolute
`file_path` to the PreToolUse hook, or normalise/reject it upstream. Two things say the
question should not be waved off:

- `normalizeToRelative` has an explicit `if (!isAbsolute(filePath)) return filePath;` branch.
  Somebody wrote it for a live input.
- Absolute paths are safe. `resolve()` collapses `..`, so
  `/root/x/../agents/coder.md` normalises to `agents/coder.md` and denies. The exposure is
  exactly the relative case — the same case Step 2's canonicalisation was written for.

So the two findings stand or fall together, which is the argument for fixing them together.

## Recommended fix

Canonicalise once, at `hooks/guard.ts:479`, before either check sees the path:

```ts
const filePath = canonicalise(normalizeToRelative(rawFilePath));
```

`canonicalise` is already written and already exported-adjacent in
`hooks/lib/rules-write-exemption.ts:95-103`; it would move to a shared home (`lib/paths.ts` is
the natural one, alongside `matchesAny`) and be consumed by both sites. `isProjectRulePath`
then stops needing its own call and the two surfaces canonicalise identically — which is the
same "one mechanism, not two" argument the module docstring already makes at `:12-16`.

Note this **widens** the protected set, so it is a behaviour change on the deny side: paths
that silently allowed will start denying. That is the correction, but it should land with the
tests that pin it rather than as a quiet tightening.

## Test coverage this needs

`guard-rules-write-integration.test.ts` has "does not exempt an un-canonical spelling that
names a non-rule path", which covers the grant side. Its sibling is missing: an un-canonical
spelling that names a protected path and is currently **not denied**. Mutation-checked — see
below — the existing suite does not catch this.

## Falsification of the coverage claim

Removing `canonicalise` from `isProjectRulePath` turns 8 cases red across
`rules-write-exemption.test.ts` and `guard-rules-write-integration.test.ts`, so the grant side
is genuinely pinned. Nothing in the suite goes red for `./agents/coder.md`, because no case
asserts it.

## Origin

Found in `260801-1244-guard-rules-write` while hunting the third spelling. The defect
predates the Circle; the Circle is what makes it consequential, because the diff's stated
threat model asserts the input class is real.

---
Resolved: 49bb4da — protection is now matched against the collapsed path. NOT via the proposed one-liner: canonicalise also strips a trailing separator, which widens the set it is matched against, so reusing it here turned Edit agents/ into an allow. paths.ts exports collapseSegments for protection and canonicalise for the grant, and isProjectRulePath keeps its own call because the Bash path hands it operands guard.ts never sees.

One member of this class remains open and is filed separately at 260802-2320_*_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md: case folding on a case-insensitive filesystem.
