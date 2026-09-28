# The lexical `..` collapse erases the symlink gate 2 was added to resolve, and the write-anywhere primitive is back

---

**Severity:** Critical
**Domain:** code
**Filed by:** coderev, reviewing Turn 2 of `260801-1244-guard-rules-write` (`bf75941..HEAD`)
**Affects:** both guarded write surfaces — `hooks/guard.ts` CHECK 2 and `guardBashCommand` STEP 2
**Reopens:** `260802-2229_*_rules-write-flag-is-a-write-anywhere-primitive-via-a-symlink-planted-in-rules.md`,
closed by `49bb4da`. The fix closed the spelling it was measured against and not the class.
**Cross-references:** `hooks/lib/rules-write-exemption.ts:193-198` (`isProjectRulePath`, the
collapse-then-resolve order), `hooks/lib/paths.ts:89-95` (`canonicalise`),
`hooks/lib/fs-locator.ts:91-122` (`resolveLocation`, which never sees the link),
`hooks/lib/bash-mutation-guard.ts:247-271` (`VerbSpec.exemptible`, the second layer that
also does not hold), `hooks/lib/__tests__/guard-rules-write-integration.test.ts:760-774`
and `:881-887` (the fixtures that already contain the escape)

---

## What was found

`isProjectRulePath` collapses the path **before** it asks the filesystem:

```ts
export function isProjectRulePath(path: string, fs: FsLocator): boolean {
  if (!path) return false;
  const canonical = canonicalise(path);                       // <- `..` gone
  if (!matchesAny(canonical, [...RULE_DIR_PATTERNS])) return false;
  return resolvesInsideRuleDir(canonical, fs);                // <- asks about the wrong path
}
```

`canonicalise` is `posix.normalize`, which resolves `..` **lexically** — it deletes the
preceding component from the string. The kernel does not. `open("rules/link/..")` resolves
`rules/link` to its target first and then takes the parent **of the target**. So for any path
of the form `rules/<symlink>/../<anything>`:

- the string handed to `FsLocator.locate` no longer contains `<symlink>` at all, so gate 2
  resolves a path that does not exist yet, lands it inside the real `rules/`, and grants;
- the write the grant authorises goes somewhere else entirely.

Gate 2 is not bypassed by a cleverer link. It is never consulted about the link, because the
component naming it has already been deleted from the string.

`hasHardLinks` is defeated by the same line, for the same reason: it is asked about
`rules/agents/coder.md`, which does not exist, rather than about the file being written.

## Evidence — measured, not reasoned

Real guard subprocess, throwaway project from `guard-harness.ts`, shipped
`hooks/config.json` protected list, `FUSION_ALLOW_RULES_WRITE=1`.

**Two commands, both allowed by the guard:**

```
  mv stage/link rules/link                               allow   (stage/link -> ../agents)
  cp -P stage/link2 rules/link2                          allow
  ln -s ../agents rules/link3   (control)                DENY    <- `exemptible: false` works
```

**Then every spelling through it:**

```
  Edit  rules/link/../agents/coder.md                    allow
  Write rules/link/../agents/coder.md                    allow
  rm    rules/link/../agents/coder.md                    allow
  echo x > rules/link/../agents/coder.md                 allow
  control, direct spelling: rm rules/link/coder.md       DENY    <- gate 2 works here
  control, flag unset:      rm rules/link/../agents/…    DENY    <- the flag is what opens it
```

**And the write lands where the guard said it would not:**

```
  agents/coder.md before: true
  agents/coder.md after `rm rules/link/../agents/coder.md`: false
```

**The whole protected list, one fresh unhalted project per row, both surfaces:**

```
  hooks/config.json                              Edit allow  rm allow
  hooks/hooks.json                               Edit allow  rm allow
  settings.json                                  Edit allow  rm allow
  .claude-plugin/plugin.json                     Edit allow  rm allow
  skills/demo/SKILL.md                           Edit allow  rm allow
  bin/monitor                                    Edit allow  rm allow
  fusion-workbench/.guard-state/escalation.json  Edit allow  rm allow
```

That is the same set the module docstring at `rules-write-exemption.ts:22-28` enumerates as
*not* exempted, and it is reached by a write as well as a delete — `echo x > …` allows.

## The suite's own fixtures already contain it

This is not an exotic spelling that needed inventing. `plantAliases` and `plantLinks` in
`guard-rules-write-integration.test.ts` plant five symlinks; four of them carry the escape,
and no case spells any of them with a `..`:

```
  rules/b/../agents/coder.md                   Edit allow  rm allow   (plantLinks, rules/b -> ../agents)
  rules/abs/../agents/coder.md                 Edit allow  rm allow   (plantLinks, absolute link)
  rules/a/../agents/coder.md                   Edit allow  rm allow   (plantLinks, link chain)
  rules/gs/../.guard-state/escalation.json     Edit allow  rm allow   (plantAliases, the HALT RECORD)
```

against the tested spellings, one character apart:

```
  rules/b/coder.md                             Edit DENY
  rules/up/agents/coder.md                     Edit DENY
  rules/up/../agents/coder.md                  Edit allow            <- untested
```

`rules/gs` was planted specifically to close the dangling-link route to the halt record.
`rules/gs/../.guard-state/escalation.json` reaches that record through the same link.

## The second layer does not hold either

`VerbSpec.exemptible: false` on `ln` closes the direct spelling and its own docstring
(`bash-mutation-guard.ts:263-271`) says so honestly — "`mv` and `cp -P` can relocate an
existing symlink into the rule directory … What makes the planted alias harmless is the
exemption predicate resolving paths against the real filesystem". Measured above: both
`mv` and `cp -P` plant, and the predicate does not make it harmless. The stated reason the
second layer is allowed to be incomplete is the thing that is broken.

This also falsifies the residual the implementer recorded as "planting an alias via `mv` /
`cp -P` / `install -l h` being allowed while every write through it is denied". The planting
is allowed; the write through it is denied in one spelling and granted in another.

## The advisory records a file that was never touched

The event written for the escape names the collapsed path:

```json
{"event":"guard_advisory","tool":"Bash","file":"rules/agents/coder.md",
 "detail":"Override FUSION_ALLOW_RULES_WRITE allowed a normally-denied write to a protected rule path: rules/agents/coder.md"}
```

`rules/agents/coder.md` does not exist and was never written. A reader of `events.jsonl` or
the monitor sees a routine rule-file edit. The one audit trail the flag has for the case it
was designed around describes the wrong file.

## What is genuinely closed

Stated so the fix is not over-scoped. The halt gate added in this Turn **does** hold: with
`haltActive: true` the planting `mv` and every escape spelling deny with `[HALTED]`, on both
surfaces, measured. So the Directive's "does not lift an active halt" criterion survives.
The escape is an unhalted-guard capability, which is the ordinary state.

## Candidate directions, not decided here

1. **Refuse the grant outright for any spelling containing a `..` segment.** Test the
   spelling *before* `canonicalise` runs; if any segment is `..`, return false. Complete
   against this whole class, three lines, no filesystem work, and it costs nothing real —
   no rule-curation workflow needs `..`, and gate 1 already rejects the `..` spellings that
   escape the rule directory. The narrowing is on the grant side, which is the safe
   direction.
2. **Resolve the path as spelled.** Hand `FsLocator.locate` the path *before* the `..`
   collapse and let `realpathSync.native` apply kernel semantics to the existing prefix.
   More faithful, and it keeps working if a future caller wants `..` to be legal. It needs
   `resolveLocation` audited for its own lexical `resolve()`/`dirname` use on the
   non-existent tail.
3. Both — 1 as the boundary, 2 as the correctness of the resolver.

My reading is that 1 is the fix and 2 is a separate hardening. 1 is provable by inspection;
2 requires reasoning about a resolver that has already been wrong once.

## Test coverage this needs

The suite is green at 973/973 with this open, which is the measure of the gap. What would
have caught it, in the existing style:

- add the `..` spelling of every link `plantAliases` and `plantLinks` already create to the
  `reachable` table at `:777-787` and to the shell list at `:806-814`;
- one case asserting the advisory's `file` field names a path the write actually reaches;
- one case that plants via `mv` and `cp -P` and then attacks, so the `exemptible: false`
  docstring's own stated bound is exercised rather than asserted in prose.

## Reproduction

`probe-a.ts`, `probe-c.ts` and `probe-d.ts` from the review session, each about thirty lines
against `guard-harness.ts`; every measurement above is their verbatim output. `probe-d.ts`
uses `plantAliases` / `plantLinks` copied verbatim from the test file, so it needs no fixture
of its own. One fresh project per case — three denials halt the guard and mask everything
after.

## Origin

Found in `260801-1244-guard-rules-write` while checking the implementer's stated
residual 4. The residual is real; its stated consequence is not.

---
Resolved: Direction 1, implemented as GATE 0 in `hooks/lib/rules-write-exemption.ts` — any
`..` segment in the path AS SPELLED refuses the grant, tested before `canonicalise`.

One correction to the issue's own siting, found by measurement before any code was changed:
the `..` is already gone by the time `isProjectRulePath` is called, on BOTH surfaces
(`guard.ts:566` collapses for the write tools; `resolveTarget`'s `normalizePath` collapses
for Bash; and `normalizeToRelative` collapses an absolute path a step earlier still). The
advisory naming `rules/agents/coder.md` in the issue's own evidence is that collapse. So the
three-line refusal inside the predicate would have been a no-op. The spelling is therefore a
REQUIRED third argument, supplied by each surface from the last place it still exists —
`rawFilePath` on the write tools, the cwd-joined operand before `opts.normalize` on Bash
(`MutationOptions.exempt` now takes `(path, spelled)`).

Every escape in both measured tables now denies, on both surfaces, with the flag set and not
`[HALTED]`; the controls hold (direct spelling denies, flag-unset denies,
`mv rules/x.md rules/retired/` allows). No advisory is written for a refused grant. Suite
973 -> 1009; the 20 new cases were verified to FAIL with gate 0 disabled.

Session: `260803-1251-turn3-t3-1-gate-0-dotdot-spelling-refusal.md`
Residuals filed: `260803-1251_*_fs-locator-collapses-dotdot-lexically-…` (the direction-2
prerequisite, audited and found to sit in `absolute()` rather than `resolveLocation`),
`260803-1252_*_a-gate-0-deny-reads-as-an-ordinary-protected-path-deny-…`
