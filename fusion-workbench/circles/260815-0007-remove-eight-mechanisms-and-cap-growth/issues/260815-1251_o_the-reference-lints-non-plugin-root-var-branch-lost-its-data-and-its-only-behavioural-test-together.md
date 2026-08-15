# The reference lint's non-plugin root-var branch lost its data and its only behavioural test together

---

`5d29b6d` removed `STASH_DIR` from `ROOT_VARS` in
`hooks/lib/__tests__/reference-resolution-lint.test.ts` and, in the same commit, deleted the one
case that exercised the branch `STASH_DIR` was the data for. The branch is live code with no data
and no test; the guard test that was supposed to falsify it now iterates an empty list and passes
vacuously. The vacuity is recorded honestly in a source comment and nowhere a reader of this store
would find it.

---

**Severity:** Low — the branch is inert until a shadowing variable reappears, and the comment says so; what is lost is the demonstration.
**Domain:** code
**Filed by:** `coderev`, reviewing `7c12d6a..5d29b6d` (`reviews/260815-1251-coderev-turn-2-build-churn-and-stash.md`)
**Owner:** `coder`
**Affects:** `hooks/lib/__tests__/reference-resolution-lint.test.ts:265-274`, `:301`, `:535-560`

**Verified 2026-08-15 at HEAD `5d29b6d`.** `ROOT_VARS` holds three entries, all `true`; the guard test's `declared` list is empty.

## The state at HEAD

`ROOT_VARS` (`:265-274`) is typed `Record<string, true | string>`. `true` means the variable names
the plugin tree and the remainder is existence-checked; a string means it names something else and
the token is skipped, with the string as the reason. All three surviving entries are `true`:

```ts
const ROOT_VARS: Record<string, true | string> = {
  FUSION_PLUGIN_ROOT: true,
  CLAUDE_PLUGIN_ROOT: true,
  FUSION_SRC: true,
  // No non-plugin entry stands here today. The last one, STASH_DIR, went with
  // the stash skills on 2026-08-15; the load-bearing test below is therefore
  // vacuous until a shadowing variable reappears, and it goes live again with
  // the first one that does.
};
```

Two consequences:

**The skip branch has no coverage.** `scanPluginPaths:301` is
`if (typeof names === "string") continue;`. No `ROOT_VARS` entry reaches it and no test drives it.
The case that did — *"skips a variable declared as naming something other than the plugin tree"*,
which passed a fixture line containing `$STASH_DIR/README.md` — was deleted rather than rewritten.

**The guard test is vacuous.** `:535` *"every non-plugin ROOT_VARS entry is load-bearing"* builds
`declared` by filtering `ROOT_VARS` for string values, gets `[]`, derives `dead = []`, and asserts
`[]`. It cannot fail. Its comment calls itself "the falsifier for the skip half".

## Why the deletion rather than a rewrite is the part worth a record

The case could have kept its subject. It calls `scanPluginPaths` on a synthetic fixture line, so
what it needed was a synthetic `ROOT_VARS` entry, not a real one — the test's own construction
already separates the fixture from the surface. Deleting it removed the only executable statement
of what a reason-string entry does, at the moment the type's only inhabitant left. When the next
shadowing variable is added, whoever adds it has the comment and no green-to-red demonstration.

This is not the same defect as a stale exemption. The three `true` entries are all live and all
exercised, and the type's second arm is a design the file argues for at length (`:232-263`, the
`$FUSION_SRC` episode where eight citations silently left the existence check). What is gone is the
proof that the arm behaves.

## What it would take

Either restore the deleted case with a locally-declared entry rather than a real one — parameterise
`scanPluginPaths` over a `ROOT_VARS` argument, or add a test-only entry the surface never uses — or
record deliberately that the second arm is unexercised until it has an inhabitant, in the defect
store rather than only in the comment. The comment is honest; it is just not somewhere anybody
looks for open work.

`inference:` the first option is small — the function already takes its lines as an argument, so the
only coupling to fix is the module-level constant. I did not write it.

## Related

- `hooks/lib/__tests__/reference-resolution-lint.test.ts:265-274`, `:301`, `:535-560`
- `history/260815-1032-coder-stash-pop-removal-and-commit-lock-rehome.md` — the run that removed
  both halves, and which names the removal of the case
