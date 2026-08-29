# `FUSION_ALLOW_RULES_WRITE` is a write-anywhere primitive: a symlink planted in `rules/` is itself an exempted write

---

**Severity:** High
**Domain:** code
**Filed by:** coderev, reviewing Turn 1 of `260801-1244-guard-rules-write` (`c7f117b..HEAD`)
**Affects:** both guarded write surfaces — `hooks/guard.ts` CHECK 2 and `guardBashCommand` STEP 2
**Cross-references:** `hooks/lib/rules-write-exemption.ts:88-103` (`canonicalise`, purely lexical),
`hooks/lib/bash-mutation-guard.ts:417-440` (`MUTATION_VERBS`, the `ln` row),
`hooks/guard.ts:495-524` (CHECK 2), `hooks/guard.ts:264-285` (the Bash `exempt` wiring),
`260801-1244-guard-rules-write` (criterion: the flag must not lift an active halt),
`260801-1122_*_spec-normative-consolidation.md:275` (C5a)

---

## What was found

The exemption decides membership **lexically**. Both `isProjectRulePath` and, before it,
`isProtected` on the Bash path, compare a string against `rules/**`; neither consults the
filesystem. `ln` is a row in `MUTATION_VERBS` (`bash-mutation-guard.ts:421`) with
`written: "last"`, so **creating a symlink whose name is inside `rules/` is itself an exempted
write**. Once that link exists, every path spelled through it still matches `rules/**` and is
still exempt — while the write lands wherever the link points.

The flag therefore does not grant "write to the rule directories". It grants "write anywhere,
in two commands".

## Evidence — measured, not reasoned

Run against the real guard as a subprocess through the Step 1 harness
(`hooks/lib/__tests__/helpers/guard-harness.ts`), on a throwaway project root carrying the
shipped `hooks/config.json` `protectedPaths`:

```
=== flag SET ===
  Bash `ln -s ../ rules/up`                allow
  Write rules/up/agents/coder.md           allow
  Bash `cp /dev/null rules/up/agents/coder.md`  allow
  Bash `rm rules/up/hooks/config.json`     allow

=== flag UNSET (control) ===
  Bash `ln -s ../ rules/up`                DENY
  Write rules/up/agents/coder.md           DENY
```

`agents/**`, `hooks/config.json`, `hooks/hooks.json`, `settings.json`, `bin/monitor`,
`skills/**`, `.claude-plugin/plugin.json` and `fusion-workbench/.guard-state/**` are all
reachable this way. That is the whole protected list — precisely the set the module docstring
(`rules-write-exemption.ts:18-28`) enumerates as *not* exempted.

## It also clears an active halt

The Directive's criterion "setting the flag does not reset or clear an active halt" is
satisfied on the write-tool path (CHECK 1 is above CHECK 2, verified). It is **falsified in
practice**, because the halt lives in a file the symlink route reaches. Measured end to end,
with the commands actually executed after the guard allowed them:

```
halt at start:                                                  true
guard verdict on `ln -s ../fusion-workbench/.guard-state rules/gs`:  allow
guard verdict on `rm rules/gs/escalation.json`:                      allow
halt after:                                          (escalation.json gone)
```

Two Bash calls, both allowed, and the halt record no longer exists — `loadEscalation()`
returns the empty state on the next call, so `haltActive` is false.

Without the flag this route is closed: `rm fusion-workbench/.guard-state/escalation.json`
denies on `fusion-workbench/.guard-state/**`, and `ln -s … rules/gs` denies on `rules/**`.
**The flag is what opens it.** This interacts with
`260802-2220_*_guard-bash-command-has-no-halt-check-so-the-halt-is-write-tool-only.md` but is
not the same defect: even with a halt check added to `guardBashCommand`, the unhalted case
(reaching `agents/**` and `hooks/config.json`) stands.

## Why the module's own reasoning does not cover it

`rules-write-exemption.ts:92-94` says canonicalisation is "purely textual — no filesystem, so
a symlink is not followed here any more than it is anywhere else in the guard." That is true
and it is the wrong comparison. Everywhere else in the guard a symlink lets a write **escape**
protection, which is a residual of a text classifier. Here it lets a write **acquire a grant**,
which is an escalation. The two are not the same risk and the second is the one a permission
grant has to answer for.

`:59-62` makes the load-bearing claim: "Canonicalisation only ever SHRINKS the exempt set …
so shrinking it can never allow a write the guard would otherwise have blocked." The claim is
correct about *canonicalisation*. It is not a claim about the exempt set as a whole, and it
reads as though it were. Lexical membership plus a filesystem-resolving writer is where the
set grows.

## Candidate directions, not decided here

1. **Resolve the target before granting.** In the exemption predicate only (not in the
   protected-path check, which must stay pure), `realpathSync` the deepest existing ancestor of
   the candidate path and require the result to still be inside the project's rule directory.
   Closes both the plant and the traverse. Costs the module its purity — the environment would
   have to arrive as an injected resolver, the way `MutationOptions.normalize` already does, so
   the unit tests stay in-process.
2. **Refuse to exempt a symlink creation.** Drop `ln` out of the exempt-eligible set, so
   `ln -s … rules/x` denies even with the flag. Cheap and targeted, but it only closes the
   plant an agent performs — a symlink already present in `rules/` (committed, or created
   before the flag was set) still traverses.
3. **Accept and state it.** Document that the flag trusts the rule directory's contents and
   must not be set in a session where `rules/` may contain a symlink. Honest, but it makes the
   flag's stated boundary conditional on something no one checks, and the docstring's flat
   "not `agents/**`, not `hooks/config.json`, …" list would have to be rewritten.

Directions 1 and 3 are behaviour/contract changes and want a decision record. My reading is
that 1 is the only one that makes the docstring's enumeration true as written; 2 narrows the
window without closing it.

## Reproduction

`/private/tmp/…/scratchpad/probe3.ts` and `probe4.ts` from the review session — both are
twenty lines against `guard-harness.ts` and are reproduced verbatim in the Evidence blocks
above. No fixture beyond `makeProject({ escalation: { haltActive: true } })` is needed.

## Origin

Found in `260801-1244-guard-rules-write` while probing the Directive's "and nothing
else" boundary for a third escape spelling beyond the two the Step 2 coder found. It is not a
spelling — it is the layer below the spelling.

---
Resolved: 49bb4da — the grant now asks the filesystem instead of the path text. isProjectRulePath resolves through realpathSync.native and requires the result strictly inside a resolved rule directory; a hard link never gets a grant (realpath cannot see one, refused via nlink on regular files); ln is not exemptible at all. A dangling symlink is expanded by hand, bounded at 40 hops, after a first fix granted on the ENOENT realpath throws for a missing target.
