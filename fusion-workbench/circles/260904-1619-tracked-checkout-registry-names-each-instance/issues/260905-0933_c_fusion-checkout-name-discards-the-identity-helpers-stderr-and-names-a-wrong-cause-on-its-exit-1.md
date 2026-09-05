fusion-checkout-name discards the identity helper's stderr and names a wrong cause on its exit 1

---
`bin/fusion-checkout-name` runs `bin/fusion-identity` with `2>/dev/null` and then reports a cause it did not establish. In a git work tree with `user.name` or `user.email` unset, the identity helper exits 1 saying exactly that; the caller drops the sentence and prints "this checkout's identifier did not resolve", which is not what happened.

---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. Behaviour is correct (nothing is written, the run stops); the diagnostic sends the user to the wrong file.

**Cross-references:**
`rules/fusion-workbench-conventions.md` `### Who filed it` (exit 1 and exit 4 must stay distinguishable);
`260904-1058_*_does-the-identity-helpers-exit-1-halt-survive-a-registry-that-can-name-the-person.md`;
`260905-0933_*_the-mint-announcement-is-unreachable-on-every-path-that-actually-mints.md` (the same `2>/dev/null`, different loss).

## Evidence

- `bin/fusion-checkout-name:246-259` — `resolve_self()` runs the helper as `"$here/fusion-identity" 2>/dev/null || true`, ignores the exit code entirely, and decides on whether a `CHECKOUT=` line came back.
- `bin/fusion-identity:158-177` — exit 1 short-circuits before the checkout half, so no `CHECKOUT=` is printed even though `.checkout-id` would have resolved.
- `bin/fusion-checkout-name:256` — the substituted message: `this checkout's identifier did not resolve, so there is nothing to name.`

Measured in `/tmp/wb-noid`, a git work tree with no `user.name` and no `user.email`:

```
$ bin/fusion-identity
fusion-identity: inside a git work tree, but git user.name and user.email are not set.
fusion-identity: no record can name its author here. Set the missing value with `git config --global <key> "..."`.
exit=1

$ bin/fusion-checkout-name register
fusion-checkout-name: this checkout's identifier did not resolve, so there is nothing to name.
exit=4
```

## The sibling that does it the other way

`bin/fusion-events:289-300` runs the same helper, keeps its stderr ("Its stderr passes through: the cause of a missing half is worth more to a human than the code alone"), captures the exit code, and hands it downstream as `FUSION_EVENTS_IDENTITY_EXIT` so `resolveIdentity` in `hooks/events-query.ts:157` can translate it in one place. Two callers of one helper, opposite treatments, and only one of them has a reason written down.

## Acceptance test

`bin/fusion-checkout-name register` in a git work tree with no configured identity lets the identity helper's own two lines through, and either reports that helper's exit 1 as its own cause or exits on a code a caller can tell apart from "the workbench holds no identifier".

---
Resolved: the first of the two alternatives, and matched to the sibling rather than invented. `resolve_self()` in `bin/fusion-checkout-name` no longer runs the helper as `2>/dev/null || true`: its stderr passes straight through and its exit code is captured, exactly as `bin/fusion-events` does it and for the reason that caller already wrote down. The substituted sentence is gone; what prints in its place names the helper, the code it returned, and that it printed no `CHECKOUT=`, and points at the helper's own lines standing above it. Behaviour is untouched — no `CHECKOUT=` is still exit 4 from `register` and from a bare `suggest`, stdout is unchanged, and this program still raises no halt of its own. The reasoning moved into the script's header as `## Why the identity helper's own reason is what this program reports`, since that header is the authoritative documentation. Measured in a git work tree with `user.name` and `user.email` unset: the helper's two lines, then `fusion-checkout-name: bin/fusion-identity exited 1 and printed no CHECKOUT=; the reason it gave stands above this line. There is nothing to name.`, exit 4, nothing on stdout. `hooks/lib/__tests__/fusion-checkout-name.test.ts` gains the case that drives it.
