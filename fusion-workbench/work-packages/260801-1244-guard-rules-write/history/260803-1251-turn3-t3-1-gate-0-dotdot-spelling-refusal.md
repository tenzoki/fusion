# Turn 3, task T3-1 — closing the lexical `..` collapse that erased gate 2

**Status:** Complete
**Agent:** coder
**Circle:** `260801-1244-guard-rules-write`
**Closes:** `260802-2330_*_the-lexical-dotdot-collapse-erases-the-symlink-gate-2-was-added-to-resolve.md` (Critical)
**Scope touched:** `hooks/lib/rules-write-exemption.ts`, `hooks/guard.ts`,
`hooks/lib/bash-mutation-guard.ts`, `hooks/lib/__tests__/{rules-write-exemption,guard-rules-write-integration,guard-bash-wiring}.test.ts`
**Tests:** 1009 passed (baseline 973, +36)
**`hooks/dist/`:** tracked files restored to HEAD with `git checkout -- hooks/dist` after the
final run. The four UNTRACKED `dist/lib/{fs-locator,rules-write-exemption}.{js,d.ts}` were
already present and untracked when this task started (Turn 2's new modules); they are Plan
Step 10's to commit and were left alone. Worth noting for Step 10: the tracked dist at HEAD
was *also* dirty on arrival, so Turn 2's "reverted after each run" did not survive.

## The one correction to the issue, and why it changed the fix

The issue is precise and its measurements reproduce exactly. Its **siting** of the fix is
wrong, and the wrongness is load-bearing, so it was checked before any code was written.

Direction 1 says: refuse the grant for any spelling containing `..`, tested *before*
`canonicalise` runs, inside `isProjectRulePath`. But `canonicalise` is not where the `..`
dies. By the time `isProjectRulePath` is called, on either surface, it is already gone:

- write tools — `guard.ts:566` does `collapseSegments(normalizeToRelative(rawFilePath))`
  above both checks, which is Turn 2's finding-2 fix and is correct where it stands;
- **and one step earlier still** — `normalizeToRelative` resolves an ABSOLUTE path through
  `resolve` + `relative`, which collapses `..` on its own. Claude Code sends absolute paths;
- Bash — `resolveTarget` runs `path.normalize(opts.normalize(joined))` on every operand
  before `opts.exempt` ever sees it.

The issue's own evidence contains the proof and does not read it as one: the advisory it
quotes says `file: "rules/agents/coder.md"`, which is the collapsed spelling. My pre-change
probe reproduced that on all 11 escape rows. So the three-line refusal inside the predicate
would have compiled, passed review, shipped, and changed nothing.

## What was implemented

**Gate 0**, in `rules-write-exemption.ts`, with the spelling supplied by the caller:

```ts
export function spellingWalksUp(spelledAs: string): boolean {
  return spelledAs.split("/").includes("..");
}

export function isProjectRulePath(path, fs, spelledAs): boolean {
  if (!path) return false;
  if (spellingWalksUp(spelledAs)) return false;   // GATE 0
  ...
}
```

`spelledAs` is REQUIRED, not defaulted. A default would let a call site pass the collapsed
path twice, type-check, and lose the gate in silence — which is precisely the failure the
gate exists to prevent, one level up.

Each surface supplies it from the last place it still exists:

| Surface | Spelling handed over | Collapsed path handed over |
|---|---|---|
| write tools (`guard.ts` CHECK 2) | `rawFilePath` — the tool input, untouched | `filePath` |
| Bash (`bash-mutation-guard.ts`) | `joined` — cwd-joined operand, **before** `opts.normalize` | `path` |

`MutationOptions.exempt` therefore becomes `(path, spelled) => boolean`. The seam stays pure
— the classifier still knows nothing about rule files — and an existing one-argument
predicate remains assignable, so `bash-mutation-guard.test.ts` needed no change.

`joined` rather than `opts.normalize(joined)` is deliberate and was got wrong once on the way
through: `opts.normalize` is `normalizeToRelative`, which collapses an absolute operand. Had
the spelling been taken after it, `rm rules/link/../x` would have denied while
`rm /proj/rules/link/../x` allowed.

`normalizeToRelative` itself was NOT touched. Making it spelling-preserving was considered
and rejected: it would change what the protection side matches for a path resolving outside
the project root (`/proj/rules/up/../../etc/passwd` becomes the relative `etc/passwd` instead
of the absolute `/etc/passwd`), and that is a semantic change to a security check for no gain
the two-argument seam does not already give.

One prose correction where my change altered the truth conditions:
`VerbSpec.exemptible`'s docstring said "what makes the planted alias harmless is the
exemption predicate resolving paths against the real filesystem", which the issue measured
as false. It now names both steps and records why it is stated in two.

## Measured, before and after

Real guard subprocess, throwaway project per row, shipped `hooks/config.json` protected
list, `FUSION_ALLOW_RULES_WRITE=1`. Verbatim from `probe-before.ts`, run against the same
code before and after.

**Write-tool surface** — `advisory.file` is what `events.jsonl` recorded:

```
                                                        BEFORE                  AFTER
  rules/up/../agents/coder.md                           allow  rules/agents/…   DENY  (none)
  rules/up/../hooks/config.json                         allow  rules/hooks/…    DENY  (none)
  rules/up/../settings.json                             allow  rules/settings…  DENY  (none)
  rules/up/../.claude-plugin/plugin.json                allow  rules/.claude-…  DENY  (none)
  rules/up/../bin/monitor                               allow  rules/bin/mon…   DENY  (none)
  rules/up/../skills/demo/SKILL.md                      allow  rules/skills/…   DENY  (none)
  rules/up/../fusion-workbench/.guard-state/escal…json  allow  rules/fusion-…   DENY  (none)
  rules/gs/../.guard-state/escalation.json              allow  rules/.guard-…   DENY  (none)
  rules/b/../agents/coder.md                            allow  rules/agents/…   DENY  (none)
  rules/abs/../agents/coder.md                          allow  rules/agents/…   DENY  (none)
  rules/a/../agents/coder.md                            allow  rules/agents/…   DENY  (none)
  rules/b/coder.md            (control, direct)         DENY                    DENY
  rules/x.md                  (control, legitimate)     allow  rules/x.md       allow rules/x.md
  flag UNSET, three escape rows (control)               DENY                    DENY
```

**Bash surface:**

```
  rm rules/up/../agents/coder.md                        allow                   DENY
  echo x > rules/up/../agents/coder.md                  allow                   DENY
  rm rules/up/../hooks/config.json                      allow                   DENY
  rm rules/gs/../.guard-state/escalation.json           allow                   DENY
  rm rules/b/../agents/coder.md                         allow                   DENY
  rm rules/abs/../agents/coder.md                       allow                   DENY
  rm rules/a/../agents/coder.md                         allow                   DENY
  rm rules/up/../settings.json                          allow                   DENY
  mv rules/x.md rules/retired/  (headline use)          allow                   allow
```

**The plant, and the real filesystem effect:**

```
  mv    stage/link rules/link          allow            allow    (stated bound, unchanged)
  cp -P stage/link2 rules/link2        allow            allow    (stated bound, unchanged)
  ln -s ../agents rules/link3          DENY             DENY     (exemptible:false, unchanged)
  rm rules/link/../agents/coder.md     allow            DENY     (agents/coder.md existed)
```

No advisory is written for any refused grant, so `events.jsonl` no longer describes a file
that was never touched.

## The `resolveLocation` audit (direction 2's prerequisite)

Asked for, done, and it does not say what the issue expected. Ground truth is
`realpathSync.native` on paths built by CONCATENATION — `resolve()` appears nowhere in the
truth column, because `resolve` collapses `..` and a truth built on it agrees with the bug.
My first attempt at this probe made exactly that error and had to be thrown away.

- **`resolveLocation` is kernel-faithful.** Handed an already-absolute path carrying a `..`
  through a symlink, it matches the kernel on 11 of 13 rows. Its `dirname` walk-up keeps a
  mid-path `..` intact and re-`realpath`s at each level; the one lexical step
  (`resolve(parentReal, basename)`) operates either on a realpath — whose lexical parent IS
  its kernel parent, a realpath having no symlink components — or on a component proven not
  to exist, which cannot redirect anything. The 2 exceptions are `rules/dangle/../x.md` and
  `rules/loop/../x.md`, paths the kernel refuses outright (ENOENT, ELOOP), where there is no
  kernel answer to be faithful to and the write fails at the syscall regardless.
- **`absolute()` is not.** `resolve(root, path)` at `fs-locator.ts:129-130` collapses `..`
  lexically one call ABOVE the resolver, for every relative path — which is what both
  surfaces hand over. The same 13 rows through `locate(<relative>)`: **9 of 13 disagree with
  the kernel**, every one a `..` row.

So direction 2 is strictly larger than the issue estimated — "hand `locate` the path as
spelled" does not work, because the locator un-spells it — and closing it is not small:
`resolve` is doing three jobs in `absolute()` (`..`, `.`, repeated separators), and changing
it changes what `isStrictlyInside` compares and what `hasHardLinks` lstats for every path, to
fix a class gate 0 already closes. Filed rather than done, per the brief:
`260803-1251_*_fs-locator-collapses-dotdot-lexically-one-call-above-the-resolver-that-was-audited.md`.

## Test coverage

+36 cases, 973 → 1009. All three additions the issue named are present.

1. **The `..` spelling of every planted link**, in both tables. Eight rows added to
   `reachable` (`rules/up` through the whole protected list, `rules/gs` to the halt record),
   five to the `plantLinks` set (`rules/a`, `rules/b`, `rules/abs`, `rules/new`,
   `rules/loop`), nine shell commands including two through the tracked virtual `cd`.
2. **The advisory names a path the write reaches.** Two halves: a refused grant writes NO
   advisory (before: one naming a non-existent file), and every granted write's advisory
   `file` is compared to the spelled path *through the filesystem*, not by string equality —
   `rules/up/rules/x.md` is granted and legitimately names a different string for the same
   file. The comparison helper is deliberately not built on `resolve()`.
3. **Plant via `mv` and `cp -P`, then attack.** The plant is asserted to still ALLOW (that is
   the `exemptible: false` docstring's stated bound and closing it would break the headline
   use), then carried out with the real command via `spawnSync`, then every spelling through
   it is denied on both surfaces. The bound is now exercised instead of asserted in prose.

Two additions beyond the brief, both because a measurement demanded them:

4. **The absolute spelling**, built by concatenation. `normalizeToRelative` collapses `..` a
   step earlier than `collapseSegments` does, so a gate reading anything but the raw tool
   input would have closed the relative spelling and left the one Claude Code actually sends
   open. With a control proving `${root}/rules/x.md` still gets the grant.
5. **The accepted cost**, asserted rather than left to be discovered: `rules/retired/../x.md`
   and `cd rules/retired && rm ../x.md` name genuine rule files and now deny.

Every case uses `denyEach` (one fresh project per subject, reason asserted not to be
`[HALTED]`). **Anti-vacuity checked:** with gate 0 commented out, 20 of the new cases fail;
restored, 1009/1009 pass.

Two existing assertions changed, both correctly:

- `rules-write-exemption.test.ts` "still exempts a rule file reached through a traversal that
  stays inside" asserted `rules/a/../x.md` → `true`. It is now `false`, and that IS the fix:
  `rules/a/..` stays inside only if `rules/a` is a directory, and the collapsed string cannot
  tell. `rules/./x.md` and `rules//x.md` are untouched — they name no component, so lexical
  and kernel resolution cannot disagree about them.
- `guard-bash-wiring.test.ts` pinned the source text `isExemptRulePath(filePath)`. Updated to
  `isExemptRulePath(filePath, rawFilePath)`, plus a new assertion that the two arguments are
  not the same expression — the one edit that would silently reopen this.

## Residuals, measured not assumed

1. **`realFsLocator.absolute()`'s lexical collapse.** Unreachable from the exemption (gate 0
   refuses every `..` before `locate` is called). Filed as `260803-1251_*_…` with both
   mismatch counts.
2. **A gate-0 deny is undiagnosable.** With the flag set, `Edit rules/retired/../x.md` reports
   `Protected path: rules/x.md cannot be modified directly` — naming a file the same flag
   *does* let the agent write, with nothing about the spelling. That is the exact shape the
   protected-path discipline was written to prevent: an agent that cannot explain a deny
   rephrases. Filed as `260803-1252_*_…`, with the smaller sibling (a deny through a planted
   link names the collapsed `rules/agents/coder.md`, also not the file) recorded in the same
   record.
3. **`spellingWalksUp` is `/`-separated only.** Correct for this codebase — `paths.ts` is
   `posix.normalize` throughout and every glob in `protectedPaths` uses `/` — but a Windows
   port would need it. Not filed; it is a property of the whole module, not of this change.
4. Everything Turn 2 left open (case folding on the protection side, the unresolved second
   name for the project root, a symlink into a protected directory) is untouched by this
   task and unchanged by it.

## Not done, deliberately

Direction 2 (see the audit above) and everything in the task's not-yours list:
`escalation.ts` (T3-4), the Bash halt event (T3-5), `bin/monitor` (T3-6), `README-hooks.md`
and `rules/protected-path-discipline.md` (T3-7), and the three prose items in
`rules-write-exemption.ts` that T3-2 owns — the `rulesWriteDetail` plural article, the
subtree-delete paragraph in the `isProjectRulePath` docstring, and the "canonicalise is
shared with the protected-path check" claim at the gate-1 bullet. The new gate-0 section was
added *above* that bullet and its wording is byte-identical to what T3-2 will find.

Not committed — the orchestrator commits after validation.
