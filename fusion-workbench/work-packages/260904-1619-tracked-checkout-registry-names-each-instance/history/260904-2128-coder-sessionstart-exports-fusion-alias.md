# coder — step 8, SessionStart exports `FUSION_ALIAS`

**Status:** Complete
**Date:** 2026-09-04
**Filed by:** coder (Kai Stalmann <ks@qantr.com>, checkout 5e8248d7)
**Plan:** `260904-1651_*_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md`, step 8

## What was done

The fifth SessionStart command in `hooks/hooks.json` gained one clause and no
command was added. The process that already ran `bin/fusion-identity` and holds
`$c` now resolves the alias off that same hex, so the identity criterion is
still evaluated once per session.

## The two files

**`hooks/hooks.json`, the fifth SessionStart command.** One clause appended
inside the existing `{ ... } || true` group, after the `FUSION_CHECKOUT` export
and before the closing brace:

```
[ -n "$c" ] && [ -x "${CLAUDE_PLUGIN_ROOT}/bin/fusion-checkout-name" ] && { a="$("${CLAUDE_PLUGIN_ROOT}/bin/fusion-checkout-name" resolve "$c" 2>/dev/null | sed -n 's/^alias=//p' | head -1)"; [ -n "$a" ] && printf 'export FUSION_ALIAS=%q\n' "$a" >> "$CLAUDE_ENV_FILE"; };
```

Three properties the step mandates, each held. The clause runs only where `$c`
is non-empty and the helper is executable, which is the `[ -x ]` third branch
every call site carries. `resolve`'s exit 3 for an unregistered checkout leaves
`$a` empty, and the `[ -n "$a" ]` guard means **no** `FUSION_ALIAS` line is
written rather than an empty one — absent, the rule the two identity fields
already follow. Every existing failure path is byte-identical, the trailing
`|| true` included; the group's exit status is still swallowed there, so a
non-resolving alias cannot fail the hook. Verified with `bash -n` on the
extracted command and by running it.

**`hooks/lib/__tests__/hooks-wiring.test.ts`, +44 lines.** One `describe` with
two tests.

- *Wiring.* The command containing `fusion-identity` occurs exactly once in
  `SessionStart` — this is what pins "no fourth command" — and it contains the
  literal `[ -x "${CLAUDE_PLUGIN_ROOT}/bin/fusion-checkout-name" ]`, the token
  `FUSION_ALIAS`, and still ends `|| true`.
- *Behaviour.* The command string is lifted out of `hooks.json` and run under
  `bash` against a scratch `CLAUDE_PLUGIN_ROOT` holding two stub helpers and an
  empty `CLAUDE_ENV_FILE`. With a hex the stub resolves, the env file carries
  `FUSION_PERSON`, `FUSION_CHECKOUT` and `FUSION_ALIAS=west-harbor`; with a hex
  it exits 3 on, the file carries the first two and the string `FUSION_ALIAS`
  does not appear at all. That second case is the step's "no entry exports no
  alias" criterion, asserted as absence rather than as an empty value.

The behavioural test discriminates: the same runner over `git show
HEAD:hooks/hooks.json`'s fifth command, with a stub that *does* resolve, writes
no `FUSION_ALIAS` line.

## Budget, measured

Hook-test surface, in lines: +44 against a stated 448 free at the Circle's
Current State, of which step 4 had spent 71. The bound assertion `holds
hook-tests inside its own head-room of 2500 lines` passes and no baseline was
edited.

## What was left stale, and named

`surface-growth-bound.test.ts`'s `matches the checked-in golden` assertion. The
golden records `hooks-wiring.test.ts 143`; the file is now 187. The same
assertion is independently stale on `skills/setup/SKILL.md` from step 5, and it
fails on that surface first. Regenerating the golden is a separate dispatch,
per this task's instruction and the file's own header, and it does not move the
baseline.

## Verification

`cd hooks && npm test` — exit 1. Three suites red, none caused by this diff:

- `surface-growth-bound.test.ts` — the golden above. Stale for two surfaces,
  one of them mine; the head-room bounds all pass.
- `reference-resolution-lint.test.ts` — `paths` 1567 -> 1569, step 5's two new
  citations. That gate's corpus is `rules/`, `agents/`, `docs/`, `templates/`,
  `skills/*/SKILL.md`, the root READMEs, `CLAUDE.md`, `bin/*` shebang scripts,
  `install.sh`, and `.ts` files directly in `hooks/` and `hooks/lib/`. Neither
  `hooks/hooks.json` nor anything under `hooks/lib/__tests__/` is in it, so
  this diff cannot have moved the count.
- `citation-sweep.test.ts` — red before this task, on workbench records from
  earlier steps. The dispatch names it as expected and not mine.

820 of 823 tests pass. `hooks-wiring.test.ts` is green, 9 of 9.
