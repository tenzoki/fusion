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

---
Resolved: route 2, the announcement on a channel a hook can deliver, and route 1 was eliminated by measurement rather than by preference. Measured against Claude Code 2.1.261 with a scratch `SessionStart` hook and the shipped binary's own renderer: a hook command that exits 0 has its stderr recorded in the transcript's `hook_success` attachment and rendered nowhere (`case"hook_success": return null`), and the SessionStart-to-context mapping takes only a `hook_success` whose `content` is non-empty, which for a stderr-only command is the empty string. Neither the user nor the model receives it, so dropping the `2>/dev/null` would have delivered nothing; only a non-zero exit surfaces stderr, as a hook warning, and a routine announcement is not worth failing a hook for. A `systemMessage` becomes a `hook_system_message` attachment rendered as `<hook> says: <content>`, which is the channel the static banner and `hooks/session-start.ts` already use. Route 3 reports later than the event and only when someone runs setup, and `skills/` had 11 bytes of head-room against its growth bound, so it could not be written without a cut it does not justify. The shape: `hooks/hooks.json`'s identity clause merges stderr into its existing capture (`2>&1`, safe because both extractions are anchored on `^PERSON=` / `^CHECKOUT=` and the helper writes no such line to stderr) and pipes the capture to a new `hooks/identity-notice.ts`, which keeps the helper's own `fusion-identity: ` lines from the first `minted ` one onward and emits them as a `systemMessage`, or `{}` when this run did not mint. The compiled module rather than shell because the message carries a filesystem path and needs JSON escaping. `bin/fusion-identity` is untouched: exit codes, stdout, the exit-1 halt, mint-once and never-overwrite all stand. `hooks/lib/__tests__/identity-mint-notice.test.ts` drives the delivering path, reading the SessionStart command out of `hooks/hooks.json` and running it through `sh -c` against a throwaway workbench, so the helper's wording and the wiring are pinned together; at HEAD that same command emits zero bytes on a mint, which is why a fourth test of the helper would have missed this again.
