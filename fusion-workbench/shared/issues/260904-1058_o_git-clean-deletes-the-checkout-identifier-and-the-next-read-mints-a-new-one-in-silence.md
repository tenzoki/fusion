git clean deletes the checkout identifier and the next read mints a new one in silence

---
`.checkout-id` is ignored, `git clean -xdf` removes ignored files, and `bin/fusion-identity` mints a fresh identifier whenever the file is absent. A live checkout therefore changes identity without a word, and every event line and claim it has written stops being attributable to it.

---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. Silent, and it degrades exactly the readers built to scope by checkout.

**Cross-references:**
`260904-1058-identity-per-instance-and-the-checkout-registry.md` `### 4. git clean silently orphans a checkout's identity`;
`rules/workbench-tracking.md` `## Two consequences` and `## The four classes`;
`bin/fusion-identity` (the minting branch and its stated reason).

## Evidence

- `.gitignore:90` excludes `fusion-workbench/.checkout-id`.
- `rules/workbench-tracking.md` `## Two consequences`: "An ignored path is skipped by `git stash --include-untracked`, but not by `git stash --all` or `git clean -xdf`."
- `bin/fusion-identity`, the checkout half: where the target does not exist, four bytes are read from `/dev/urandom` and written with a noclobber redirect. The helper's header states why it mints on first read rather than only at Setup, and that reason is sound; nothing there distinguishes a first read from a read after a sweep.

## What breaks

Three readers scope the event log by `checkout` and drop what does not match: `bin/fusion-events turns`, `bin/monitor` (`bin/monitor:1350-1357`) and `/fusion:cadence` Step 7b (`skills/cadence/SKILL.md:173`). After the sweep, all three read the checkout's own prior lines as another checkout's and drop them. The Turn count, the dashboard window and the session-flow metrics each shorten with no diagnostic.

A `**Claim:**` written before the sweep names an identifier the tree no longer holds, so `/fusion:next` treats the checkout's own Circle as another party's and offers an override against itself.

## Not claimed

That `git clean -xdf` is a common act, or that any measured instance of this exists. The event log in this repository carries one checkout value across all 280 identified lines.

## Acceptance test

Either the identifier survives a sweep of ignored files, or `bin/fusion-identity` distinguishes a first mint from a re-mint and says which one happened. Deleting `.checkout-id` in a checkout that has already written event lines, then running the helper, produces a stated outcome rather than a silent new value.
