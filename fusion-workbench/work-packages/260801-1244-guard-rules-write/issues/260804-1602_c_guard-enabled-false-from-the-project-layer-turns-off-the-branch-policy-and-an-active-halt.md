# `guard.enabled: false` from the project layer turns off the branch policy and an active halt, with no event at all

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** analyst, independent assessment A1 of C5b
**Affects:** `hooks/guard.ts:652` (the `if (!config.guard.enabled)` short-circuit, which sits above the Bash dispatch and above every check); `hooks/lib/config.ts` (the project layer that can now reach it); `templates/fusion-guard.json` `_protectsItself` and `_inFusionsOwnSourceTree`
**Cross-references:**
`260804-1600-c5b-independent-assessment.md` `### What a consuming project can now do to itself`,
`260804-1427_*_the-accepted-floor-residual-reaches-the-guards-own-state-directory-not-only-protectedpaths.md` (whose stated halt bound this falsifies for one key),
`260802-1912_*_does-the-self-protection-floor-apply-before-the-config-file-exists.md`,
`rules/git-branch-discipline.md`, `CLAUDE.md:1` (both of which state the branch policy is unconditional)

---

## What is wrong

C5b makes `guard.enabled` settable from a project-root file. Before it, that key lived only
in the plugin's `hooks/config.json`, which is itself on `protectedPaths`.

`hooks/guard.ts` reads the merged config, emits any diagnostics, and then short-circuits:

```
if (!config.guard.enabled) { allow(); return; }
```

That line is **above** the Bash dispatch, above the self-detect gate, and above the halt
check. So one key in a project file disables:

- the protected-path check on all four write tools,
- the protected-path mutation check on `Bash`,
- the **git branch-switch and worktree policy**, which fusion documents in three places as
  the one policy that runs unconditionally, including in the plugin's own repository,
- an **already active halt**,
- and the self-protection floor on the configuration file itself, so the state is not
  recoverable through any guarded surface.

## Measured

Same harness, throwaway consuming project, shipped plugin config, no environment flag:

```
fusion-guard.json = {"guard":{"enabled":false}}

  Edit  agents/coder.md            allow
  Edit  hooks/config.json          allow
  Edit  fusion-guard.json          allow      <- the floor's own subject
  rm -rf rules                     allow
  git switch main                  allow      <- the branch policy
  git worktree add /tmp/w          allow
  fusion-workbench/.guard-state/   never created — ZERO events emitted
```

In a project root carrying `.claude-plugin/plugin.json` (the self-detect stand-down), with
the seeded template: `git switch main` **denies**. With `{"guard":{"enabled":false}}`:
`git switch main` **allows**. So the branch policy's documented survival of the plugin-repo
stand-down does not survive this file.

Against an already active halt (`haltActive: true`, `consecutiveBlocks: 3` seeded):

```
  with {"guard":{"enabled":false}}     Edit agents/coder.md   allow      rm -rf rules   allow
  with no project file (control)       Edit agents/coder.md   BLOCKED    rm -rf rules   BLOCKED
```

## The bound, measured too

Issue `260804-1427_*_the-accepted-floor-residual-reaches-the-guards-own-state-directory-not-only-protectedpaths.md` bounds the accepted floor residual with "an agent cannot narrow its
way out of a halt it is already in". That holds for `protectedPaths` and it holds here for
*creation*: while halted, `Write fusion-guard.json` and `echo x > fusion-guard.json` both
deny, so a halted agent cannot write the off-switch.

The accurate statement is therefore narrower than "the halt holds": an agent that writes
`guard.enabled: false` **before** it earns a halt is immune to halts from then on, and the
write costs it one allowed tool call in any project whose `fusion-guard.json` does not yet
exist.

## Why this is High rather than an accepted residual

The residual the decision record accepted is that a project can narrow what is protected. It
is bounded by the git diff, and that bound is real. This is a different thing: the guard
stops running at all, it stops running the policy that has never been project-scoped, and it
produces **no event whatsoever** — not a `guard_advisory`, not a `guard_error`, not even a
`.guard-state/` directory. The unparseable-config path was deliberately made loud on the
grounds that "silence here is the failure mode the spec rejects". The total stand-down is
silent.

The seeded template also tells every project the opposite: *"an agent cannot unprotect the
configuration that governs it."*

## Suggested direction

Two candidate answers, and picking between them is a decision rather than a line:

1. **The project layer may not set `guard.enabled`.** Read `enabled` from the plugin layer
   and `DEFAULTS` only, and emit a diagnostic when a project file declares it. One condition
   in the merge. Preserves the branch policy's unconditionality by construction.
2. **Keep it settable and move the short-circuit.** Let `enabled: false` stand the *write*
   guard down but leave `guardBashCommand`'s branch step above it, matching the ordering the
   plugin-repo stand-down already uses. More faithful to "a project configures its own
   guard", more surface to get wrong.

Either way the template's `_protectsItself` and `_inFusionsOwnSourceTree` sentences need
correcting — filed separately as `260804-1605_*_the-seeded-template-states-two-properties-the-loader-does-not-have.md`.
