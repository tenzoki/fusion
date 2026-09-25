# The events-query entry point carries every Turn 1 fix and is exercised by nothing

---
`46de871` gave `hooks/lib/events-query.ts` its first coverage, 166 lines over the pure module. The
425-line entry point beside it, `hooks/events-query.ts` — the program `bin/fusion-events` actually
runs — has none. Every finding the Turn 1 review raised was discharged in that file, the High one by
a string key two prompt call sites are now instructed to branch on.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** High.

**Cross-references:**
`260826-0141-coderev-c4-the-event-log-reader-and-the-writer-on-every-line.md`
(findings H-1, M-1, M-2, M-3, M-4, all discharged in this file);
`260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`,
step 10 (the case list) and step 5 (the four call sites that read `scope=`);
`hooks/lib/__tests__/fusion-events.test.ts:13-16` (the stated exclusion list).

## What is uncovered, and why each one matters

Nothing in `hooks/lib/__tests__/` names `hooks/events-query.ts` or `bin/fusion-events` outside the
pure-module suite and one reference-lint comment. Measured by grep over the test directory at
`72a9561`.

**The `scope=` key.** `hooks/events-query.ts:310` computes it; `:352` and `:368` print it. It is the
whole of the repair for the Turn 1 review's one High finding, and both interrupted-session call
sites — `agents/orchestrator.md:107` and `skills/setup/SKILL.md:394` — now say the `turns=` line is
the figure **only when the helper also prints `scope=checkout`**, and that `scope=all-checkouts` is
reported as `unavailable` with the number withheld. Two prompt sites branch on a string that no
assertion produces, and the two prose definitions that point at the helper
(`agents/orchestrator.md:558` and the `progress.turn` row at `:1122`) inherit whatever those two do
with it. A refactor that dropped the key, or spelled it differently, would put both call sites back
on the whole-file count silently — which is the defect the key was added to abolish.

**`resolveIdentity` and its vocabulary map** (`:107-166`). The single translation point of
`bin/fusion-identity`'s exit codes, added because the vocabulary had been read three different ways
in one change. The distinction it exists to hold — exit 4 means nothing is *owed*, exit 3 means
nothing could be *read* — decides which of two paragraphs `presence` prints at `:272-288`. Neither
branch is asserted.

**`noteUnstamped`** (`:217-224`), the repair for the review's M-2, and the exit mapping 0/1/2/3/4
that `bin/fusion-events`'s header documents in full. The header is the authoritative documentation
and nothing holds the program to it.

**One case the plan named and the test file does not exclude.** Plan step 10 lists the clauses to
cover and among them is "a missing `agentstate.yaml`". That case lives at
`hooks/events-query.ts:324-332` and is asserted nowhere. The test file's header carries a
deliberate-exclusion note (`fusion-events.test.ts:13-16`) and it names two other things: the
wrapper's identity-exit mapping, and a two-checkout end-to-end pass. A reader takes that note as the
complete list of what was left out, so this case is absent without being declared absent.

## What does stand

The pure module's coverage is good: ten classification rows, the window's floor and missing ceiling,
`turns=0` on the ok branch, `malformed` and `unstamped` kept apart, and a tie-break asserted against
file position. None of that is in question. The gap is one file over.

## Fix direction

The pattern already exists in this repository: `fusion-identity.test.ts` (200 lines) and
`fusion-count-sources.test.ts` (442 lines) both spawn a `bin/` helper against a throwaway workbench
and assert stdout and the exit code together. The cheapest useful subset, in rough order of what it
buys:

1. `turns` with `FUSION_EVENTS_CHECKOUT` set and unset — asserting `scope=checkout` versus
   `scope=all-checkouts`, both at exit 0. Two cases, and they pin the key the four prompts read.
2. `presence` at exit 4 with `FUSION_EVENTS_IDENTITY_EXIT=3` and again with `=4` — asserting
   `other_people` absent from stdout in both, and that the two stderr sentences differ.
3. `turns` with no `agentstate.yaml` and with no `history_file` in it — exit 3, empty stdout.

The hook-test surface is the bound. This addition needs a cut in the same Turn under
`260825-2140_*_where-do-c4s-hook-test-lines-come-from-when-the-cut-only-circles-room-is-spent.md`,
option 2, which the user answered for the last addition and whose terms this one falls under too.

## One note on a neighbouring record

`260826-0848_*_the-fourth-sessionstart-command-is-asserted-by-nothing-and-its-own-suite-warns-about-exactly-that.md` asks for a case that pins `hooks/session-id.ts`'s channel by spawning the built module.
That is the only form available: `sessionIdLine` is exported at `hooks/session-id.ts:71` but `:94`
runs `main()` at module load and `main()` awaits `process.stdin`, so an importing test would hang.
The export buys nothing and is not worth removing — `session-start.ts` exports `subdirectoryWarning`
on the same terms and its suite spawns too — but the fix direction in that record should not be read
as having an in-process alternative.

Resolved: 2026-08-27 — five subprocess cases at the foot of `hooks/lib/__tests__/fusion-events.test.ts` drive `hooks/dist/events-query.js` against a throwaway workbench: `turns` at `scope=checkout` (this checkout's turns alone) and at `scope=all-checkouts` (every line, said on stderr); `presence` at identity exit 3 and exit 4, both exit 4 with `other_people` absent and differing stderr; `turns` exit 3 with empty stdout for a missing `agentstate.yaml` and for one without `history_file`; and one run through `bin/fusion-events` pinning the SessionStart-export hand-off. The header's exclusion note now names what is still out: the wrapper running `bin/fusion-identity` itself, and the two-checkout merge. +85 lines.
