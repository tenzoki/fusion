# R-7 — the fourth SessionStart command reaches the four documents that count them

**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Date:** 2026-08-26 10:20
**Circle:** 260825-2023-presence-travels-monitor-filters-own-checkout
**Dispatch:** Turn 3, task R-7 — defect `260826-0846_*_a-fourth-sessionstart-command-lands-and-four-prose-sites-still-say-there-are-three.md`.

## Whether the record's list was complete

It was, and the count in its own title is off by one against its own body: the title says four
sites, the body enumerates four plus "a fifth, smaller". Five is right and five were corrected.

The search for a sixth was `grep -rn 'session-id\|session_id'` and `grep -rn 'SessionStart'` over
`*.md`, `*.ts` and `*.json`, excluding `hooks/dist/` and the workbench. It returned no further site
that states a count or enumerates the commands. Three near-misses were read and left alone.
`CLAUDE.md:76` states the channel convention (`systemMessage` for the user, plain stdout for the
model) and is a rule rather than a count; commit `72a9561` gave it its first live consumer and did
not make it false. `agents/orchestrator.md:140` already tells the orchestrator to read the line, so
it was written against the new hook. `hooks/session-start.ts:100` already names `session-id.ts` as
its sibling.

## The five sites, and what each was made to say

Each is a different kind of statement, so none of them got the same sentence.

1. `CLAUDE.md`, the `hooks/` Layout row. Now "four independent commands", with
   `hooks/session-id.ts` in the enumeration. The fourth's purpose and the channel argument are a
   sentence at the END of the row rather than inline after `session-start.ts`: the row's next
   sentence opens "One cwd-anchored resolution is left for that warning to be about", and inserting
   the fourth command between them would have put four clauses between "that warning" and the
   warning it points at.
2. `README-hooks.md` `## Architecture`, the tree. A fourth branch under SessionStart;
   `session-start.ts` demoted from `\-- ` to `+-- ` and its two sub-lines re-indented one level.
   The new branch says what the hook prints and on which channel, and contrasts it with the banner
   above it, because the tree is where a reader sees the two channels side by side.
3. `README-hooks.md` `### 1. Verify hooks are wired`, the snippet. One command line added, a comma
   on the line above. This is the site with a failure mode of its own: the snippet is what a user
   compares their own file against, so a stale one silently instructs them to delete the hook.
   Checked against `hooks/hooks.json` character by character after the edit.
4. `README-hooks.md` `## Files`, the entry-point table. A `session-id.ts` row between
   `session-start.ts` and `guard.ts`. The table's other rows carry the durable explanation, so this
   one carries the measured-channel citation, the reason it is a fourth command rather than a line
   inside its sibling, and the absent-rather-than-empty rule.
5. `hooks/lib/__tests__/hooks-wiring.test.ts:93`. "The four SessionStart commands are independent by
   design", and "the two later arrivals" in place of "the third". The comment explains what the
   assertion below pins — that the export and the banner survived — and that claim is unchanged; only
   the arithmetic in it moved.

## Budgets

The hook-test file is 103 lines before and after: 3 comment lines rewritten as 3. The bounded
hook-test surface moves 0 lines and the golden's `hooks-wiring.test.ts 103` entry needs no change.
`CLAUDE.md` and `README-hooks.md` are on no bounded surface.

The reference-resolution pin moves +2 paths, anchors unmoved, and it was NOT re-approved here: two
siblings were writing to the tree in the same wave and only one party may move the pin. The share
was measured by reverting my two files against the rest of the dirty tree and then one against the
other: with both reverted the gate reads 1428 (the siblings' +4 over the committed 1424), with both
mine 1430, and each alone 1429. The two are `hooks/session-id.ts` entering the `CLAUDE.md` row, and
`${CLAUDE_PLUGIN_ROOT}/hooks/dist/session-id.js` in the wiring snippet — a `$VAR`-rooted plugin path
resolves like a bare one, which is why a JSON code fence contributes to this pin at all.

## Not fixed, and named rather than left

No test asserts that a SessionStart entry invokes `dist/session-id.js`. The file that would carry it
already carries exactly that assertion for `dist/session-start.js`, and its comment says why: a hook
can be entirely correct and entirely unreachable with a green suite either way. The dispatch scoped
me to the comment in that file and not its assertions, so this is reported rather than added.
