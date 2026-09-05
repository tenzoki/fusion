The mint announcement is unreachable on every path that actually mints

---
`bin/fusion-identity` now announces a mint on stderr. Both callers that run before anything else in a session discard stderr, and one of them is the caller that mints. In an ordinary Claude Code session the announcement reaches nobody.

---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** High. The Circle record names this repair as one of its deliverables ("The defect where `git clean -xdf` deletes `.checkout-id` and the next read mints a replacement in silence is repaired here"). The repair works when the helper is run by hand and never fires where the silence was.

**Cross-references:**
`260904-1058_*_git-clean-deletes-the-checkout-identifier-and-the-next-read-mints-a-new-one-in-silence.md` (the defect this was meant to close).

## Evidence

- `bin/fusion-identity:185-193` — `announce_mint()` writes both lines with `>&2`. It fires only when `did_mint` is set, which happens only in the process that wins the noclobber write (`bin/fusion-identity:214`).
- `hooks/hooks.json:24` — the SessionStart identity export runs `id_out="$("${CLAUDE_PLUGIN_ROOT}/bin/fusion-identity" 2>/dev/null)"`. This is the first `fusion-identity` call of every session and it is the one that mints, because it runs before `/fusion:setup`.
- `bin/fusion-checkout-name:251` — `out="$("$here/fusion-identity" 2>/dev/null || true)"`. The second discarding caller.
- `skills/setup/SKILL.md:344` — Step 0h's direct call is the only unredirected one, and by the time it runs `.checkout-id` exists, so `did_mint` is empty and nothing is said.

Measured in a throwaway workbench (`/tmp/fcn-test`, `.checkout-id` deleted before each run):

```
$ bin/fusion-identity
fusion-identity: minted 828c23a4, because …/.checkout-id did not exist.
fusion-identity: this workbench already carries other checkout identifiers (2 …, 3 …)
PERSON=…
CHECKOUT=828c23a4

$ out="$(bin/fusion-identity 2>/dev/null)"        # the hook's form
PERSON=…
CHECKOUT=e92b46cb                                  # minted, announced to nobody
```

## Why the test did not catch it

`hooks/lib/__tests__/fusion-identity.test.ts:195-205` asserts the announcement on a direct `spawnSync` of the script. It pins the helper's behaviour, not the reachability of the message. Nothing in the suite runs the SessionStart command as `hooks.json` spells it and asks whether a mint is audible.

## Acceptance test

A session started in a workbench whose `.checkout-id` was swept surfaces the mint to the user. Either the SessionStart clause stops discarding stderr for this case, or the announcement moves to a channel a hook can deliver (a `systemMessage`, as `hooks/session-start.ts` already uses for the subdirectory warning), or `/fusion:setup` Step 0h re-derives and reports the same fact from state it can still read. Whichever is chosen, a test drives the delivering path and not the helper alone.
