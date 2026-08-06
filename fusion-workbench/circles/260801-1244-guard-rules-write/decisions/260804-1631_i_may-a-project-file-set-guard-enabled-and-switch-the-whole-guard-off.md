# May a project file set `guard.enabled`, and switch the whole guard off?

---
**Domain:** code
**Status:** open
**Filed by:** planner, planning the C5b remediation
**Cross-references:**
`circles/260801-1244-guard-rules-write/issues/260804-1602_*_guard-enabled-false-from-the-project-layer-turns-off-the-branch-policy-and-an-active-halt.md` (the measurement that raises this),
`circles/260801-1244-guard-rules-write/analyses/260804-1600-c5b-independent-assessment.md` `### What a consuming project can now do to itself`,
`hooks/guard.ts:652-657` (the short-circuit), `:660-680` (the Bash dispatch and the self-detect gate it sits above),
`README-hooks.md:141` (the shipped sentence that already states the consequence, for a file only fusion can write),
`rules/git-branch-discipline.md`, `CLAUDE.md:1` (the plugin-repo unconditionality of the branch policy),
`circles/260801-1244-guard-rules-write/decisions/260802-1912_i_does-the-self-protection-floor-apply-before-the-config-file-exists.md` (the floor this bypasses)

---

## Question

`guard.enabled` used to live only in the plugin's `hooks/config.json`, which is itself on
`protectedPaths`. C5b made every top-level key settable from a project-root file, and
`enabled` came along without anyone naming it. `{"guard":{"enabled":false}}` reaches
`hooks/guard.ts:652`, which sits above the Bash dispatch, above the self-detect gate and above
the halt check, and returns an allow with **no event of any kind** — not a `guard_advisory`,
not a `guard_error`, and no `.guard-state/` directory at all.

Measured: it turns off the protected-path check on all four write tools and on `Bash`, the git
branch-switch and worktree policy, an already active halt, and the self-protection floor on
the configuration file itself, so the state is not recoverable through any guarded surface.

One precision that matters for the answer and that the filing issue does not draw.
`README-hooks.md:141` already says, correctly and in the shipped document, that
`guard.enabled: false` stands the whole guard down, branch-switch check included. That
sentence has been true since long before this Circle. What C5b changed is not the behaviour of
the key but **who can write it**: a key that only fusion's own protected file could set is now
settable by any project, and by any agent in a project whose `fusion-guard.json` does not yet
exist.

## Options

1. **The project layer may not set `guard.enabled`.** `enabled` is read from the plugin layer
   and `DEFAULTS` only. A project file that declares it is ignored for that key and gets one
   diagnostic naming the key.
   - Pros: preserves by construction the property fusion documents in three places — that the
     branch policy runs unconditionally, including where the write guard stands down. One
     condition in the merge, no new ordering to get wrong. The shipped
     `README-hooks.md:141` sentence stays true as written.
   - Cons: the project layer stops being "the same shape as `hooks/config.json`", which was
     Q2's whole argument for one schema and one parser. The exception has to be documented in
     the template, in `README-hooks.md`, and in the rule file, or a project owner writes
     `enabled: false` and cannot tell why nothing happened — the diagnostic is the only
     thing standing between this option and a silently inert key.
2. **Keep it settable and move the short-circuit below the branch policy.** `enabled: false`
   stands the *write* guard down, and `guardBashCommand`'s branch step runs first, matching
   the ordering the plugin-repo stand-down already uses.
   - Pros: keeps one schema and a genuine capability — a project that wants fusion's write
     protection off can have it. Mirrors an ordering the code already implements once.
   - Cons: more surface. It falsifies `README-hooks.md:141` as currently written, so that
     sentence moves too. It leaves an already active halt bypassable, which is a separate
     question this option does not answer. And "the guard is off" would then mean two
     different things depending on which file said it.
3. **Keep it settable exactly as today, and document it.**
   - Pros: no code.
   - Cons: an agent that writes the off-switch before it earns a halt is immune to halts from
     then on, and the write costs it one allowed tool call in any project whose
     `fusion-guard.json` does not yet exist. The template currently tells every project the
     opposite: *"an agent cannot unprotect the configuration that governs it."*

## Constraints

- Whatever is chosen, the total stand-down must stop being silent. The loader's unparseable
  path was deliberately made loud on the grounds that silence is the failure mode the spec
  rejects; the larger state emits nothing.
- The answer decides three sentences that are seeded verbatim into every project through
  `templates/fusion-guard.json`, so it lands before the template is corrected, not after.
- Option 2 must not leave the halt bypassable, or it trades one silent hole for a quieter one.

## Recommendation

None. Stating the default is the useful part: not answering ships option 3 without option 3's
documentation, and with a template that asserts the opposite of the measured behaviour.

---
Answered:
Implemented:
Deferred:
Superseded by:

## Answer

**Option 1: the project layer may not set `guard.enabled`.**

Chosen by the user at the plan gate, 2026-08-04. `enabled` is read from the plugin layer and
`DEFAULTS` only; a project file that declares it is ignored for that key and gets one
diagnostic naming it.

This preserves by construction the property fusion documents in three places — that the git
branch policy runs unconditionally, including where the write guard stands down — and it keeps
`README-hooks.md:141` true as written.

The cost this record names is real and binds the implementation: the project layer stops being
"the same shape as `hooks/config.json`", which was Q2's argument for one schema and one parser.
**The diagnostic is the only thing standing between this option and a silently inert key**, so
it is not optional, and the exception is documented in the template, in `README-hooks.md` and
in the rule file in the same change. This record's constraint that the total stand-down must
stop being silent is satisfied by the key never taking effect at all.

---
Answered: this record, `## Answer` — user chose option 1 at the plan gate; a project may not switch off a guard it is governed by, and the ignored key is reported rather than dropped in silence.

---
Implemented: f82ac02 — `guard.enabled` is resolved from the plugin layer and DEFAULTS only; a project layer declaring it earns exactly one diagnostic naming the key, surfaced as a `guard_advisory` on both surfaces (C5b remediation plan Step 2, integration cases in `hooks/lib/__tests__/guard-rules-write-integration.test.ts`). The exception is documented in the template (`_guardEnabled`, commit `21a72b7`) and in `README-hooks.md` + `rules/protected-path-discipline.md` (commit `373f5ed`). Walked `_a_` → `_i_` by the reconciler at the final Circle reconciliation 260805-2323.
