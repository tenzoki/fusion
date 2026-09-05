# coder — the identity helper's reason survives its caller, and Step 0i tiles both exit tables

**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Status:** Complete
**Circle:** 260904-1619-tracked-checkout-registry-names-each-instance (no `.active-circle` pointer in this checkout, so `bin/fusion-paths` resolved `$OUT_HISTORY` to `shared/history`)

## What was dispatched

Three defects in the Circle's issue store, closed separately:

- `260905-0933_*_fusion-checkout-name-discards-the-identity-helpers-stderr-and-names-a-wrong-cause-on-its-exit-1.md`
- `260905-0933_*_setup-step-0i-puts-a-bare-hex-placeholder-inside-a-runnable-bash-fence-where-it-is-shell-redirection.md`
- `260905-0933_*_setup-step-0i-branches-on-two-of-the-helpers-five-exit-codes-and-the-reachable-fourth-has-no-branch.md`

## What was done

`bin/fusion-checkout-name` `resolve_self()` stopped discarding `bin/fusion-identity`'s stderr and stopped dropping its exit code. It now matches `bin/fusion-events`, which already did it that way and wrote down why, rather than carrying a second shape. The message that replaced the substituted cause names the helper, the code it returned and that no `CHECKOUT=` came back, and points at the helper's own lines above it. Exit codes, stdout and the halt structure are unchanged: no hex is still exit 4 from `register` and from a bare `suggest`.

Two header sections were added to that script, which is its own authoritative documentation: `## Why the identity helper's own reason is what this program reports` and `## Two exit vocabularies, and which number belongs to which`. The second is where the reasoning for the branch list lives, so the skill can cite instead of hold.

`skills/setup/SKILL.md` Step 0i quotes the `<hex>` placeholder, so the block runs verbatim and reaches the helper's usage error rather than a bash syntax error, and its lead-in names Step 0h's `CHECKOUT=` as what stands in for it. The branch list now covers `bin/fusion-checkout-name` exits 0, 2, 3, 4 and 5 and `bin/fusion-identity` exit 1, with each line labelled by the helper whose number it carries.

`hooks/lib/__tests__/fusion-checkout-name.test.ts` gained the exit-4 case, reached the way an ordinary configuration reaches it: a git work tree with `user.name` and `user.email` unset.

## The growth bounds

`skills/` had 11 free bytes and `hook-tests` 11 free lines at the start — the two tightest surfaces in the tree, and both were spent by this work. Neither baseline was edited. The skill was paid for inside itself: its restatement of the mint and of the asking form was cut, each already carried by the header of the helper it describes, and one clause the sentence before it already carried. `skills/` ends at 6 free bytes, `hook-tests` at 2 free lines. `hooks/lib/__tests__/fixtures/surface-growth.golden` was regenerated through `UPDATE_SURFACE_GOLDEN=1`; its diff is the two files touched and the two totals, nothing else.

## Left standing, named rather than fixed

`reference-resolution-lint.test.ts` fails on its pinned counts: `paths` 1584 -> 1591, `anchors` 218 -> 219, `stampBare` unchanged at 13. Every one of those references resolves — the violation half of that gate is green — so what moved is the pin, not the text. The dispatch said to leave a stale pin and name it, so the baseline was not re-approved. `cd hooks && npm test` therefore exits 1, with 831 of 832 tests passing across 49 files.
