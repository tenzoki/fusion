# coder — the four personal logs are keyed by the checkout, not by the OS login

**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Status:** Complete
**Circle:** none active (no `.active-circle` pointer in this checkout, so `bin/fusion-paths` resolved `$OUT_HISTORY` to `shared/history`)

## What was dispatched

`260904-1058_*_four-tracked-workbench-filenames-are-keyed-by-the-os-account-name-the-identity-decision-rejected.md`. Four tracked filenames — the memo file, the task list, the cadence digest and the activity log — were built from `$USER`, which the project's own identity answer rejected as an identity source. The acceptance test offered two exits: key the names by something that answer accepts, or state why R1's one-writer property does not bind the memo store.

## The key, and why the person lost

**The minted checkout identifier**, the eight hex characters `bin/fusion-identity` prints as `CHECKOUT=`. Three of the four files sit in a class R1 store whose defining property is one writer per file, and only that value holds it by construction: a checkout writes the file named after its own identifier and no other. It is also the key the sibling store `shared/checkouts/` was placed on one Circle ago, so the change introduces no second convention.

The person was the other candidate and it was not a close call. It repairs one direction of the defect and keeps the other: one human on two machines is still two writers on one tracked file, which is the git conflict in a personal log nobody expects to merge, and it is the direction that lands on tracked bytes. It is also not total — outside a git work tree there is no person to key on at all, while the identifier is minted with no git in reach. What it would have bought is available by lookup, `bin/fusion-checkout-name resolve <8hex>`, which is the attribute-not-key answer `260904-1058_*_is-the-checkout-alias-the-identifier-or-an-attribute-of-the-minted-one.md` already gave the alias. The cost is stated rather than smoothed: one person's memos from two machines are two files, and joining them is a read through the registry rather than a property of the name.

**No decision record was filed.** The dispatch allowed one if the fork were genuine. It is not: the person key fails a class property the project has written down and fails totality outside git, and the aggregation it would buy is recoverable by lookup. A record would have put a settled question to the user.

## Where the text lives

The operative contract — the name shape, the guarded resolution call, the unresolved case and the adoption of a legacy login-keyed file — is authored once, in `rules/fusion-workbench-conventions.md` `## Filename Patterns`. The reasoning above lives in `bin/fusion-identity`'s header under `## What the identifier keys, and why the person does not`, because no agent applies it and the always-on rule set is charged to every dispatch.

## What happens to a file already on disk

The skill that writes one renames `<prefix>-$USER.md` onto the new key on its next run, when this checkout's `$USER` is the suffix and nothing stands at the new name, and reports the rename; in every other case it leaves the file and names it. Nothing is merged and nothing is deleted. A legacy file that really did have two writers carries both people's lines and the rename does not separate them — no line in these files records who wrote it, so nothing can. This repository's own `activity-log-k1.md` is the first case the rule will meet; it is untouched here and the next activity-log run adopts it. Until then `/fusion:cadence` reports that source absent even with the file in front of it, because it is read-only on the activity log and cannot be the party that adopts it; that consequence is written into the rule rather than left to be discovered.

## The budget, which was the binding constraint

`skills/` opened with 6 free bytes and three of the four consumers are on that surface. The additions were paid for by cutting duplication in the same files: the `$SCAN_HISTORY` iterate paragraph in cadence restated invariant 2 in the same sentence that cited it and stated the no-Circle half a third time in the degradation list; memo stated its per-file cardinality twice within twenty lines and spelled the backlog path a second time; log-activity opened by naming the log the user's. The surface closed at 240 410 bytes against a budget of 240 439 — **29 free**. No baseline was edited.

## Verification

`cd hooks && npm test` — exit 1, 3 failed of 832. All three are pinned inventories and no failure is a defect, and the dispatch instructed that they be left and named:

- `reference-resolution-lint` count pin: `{paths 1591, anchors 219}` at HEAD, `{1603, 224}` now. Shares measured by restoring this session's eight files to HEAD and re-running: the concurrent session's `agents/` edits carry `+2 paths, +2 anchors`, this change carries `+10, +3`.
- `rules-emission-golden`: `fusion-workbench-conventions.md` 54 973 → 57 146, all of it this change.
- `surface-growth-bound` golden: the `skills` block is this change (total 240 433 → 240 410), the `agents` block is not — `orchestrator.md` and `reconciler.md` moved in the working tree from a session that ran in this checkout at 16:38 and left both goldens stale before this work began.

One full run in between showed five failures rather than three: `review-coverage.test.ts` and `staging-drift.test.ts` each got the other's tracker message. Both pass run together in isolation and both were green again on the next full run, so it is parallel interference between two suites that drive one tracker, not a defect this change introduced. It is recorded rather than dropped because a reader of one red run should not have to re-derive that.

The head-room bounds themselves passed. `hooks/lib/__tests__/workbench-citation-lint.test.ts` passed, so every citation written here resolves. Who re-approves a pinned inventory is `260904-2035_*_does-an-executor-re-approve-the-pinned-inventory-its-own-diff-moved.md`, still open.
