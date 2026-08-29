The anchor gate silently skips every `$VAR/`-rooted citation, on an assumption the path gate falsifies
---
`scanHeadingAnchors` in `hooks/lib/__tests__/reference-resolution-lint.test.ts` resolves its file token literally and does not strip a `ROOT_VARS` prefix the way `scanPluginPaths` does. A citation written as `` `$FUSION_SRC/agents/orchestrator.md` `## Circle head fields` `` is therefore never checked: the heading could be misspelled, or absent from the target, and the gate stays green.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

## What happens

`ANCHOR_RE` is `` /`([A-Za-z0-9._\/-]+\.md)`\s*(?:→\s*)?`(#{1,6}) ([^`]+)`/g ``. The `$` is outside the file token's character class, so the regex matches the suffix `FUSION_SRC/agents/orchestrator.md` rather than the whole spelling. That token contains a `/`, so the branch at `reference-resolution-lint.test.ts:446` takes the path route, `existsSync(pluginRoot + "/FUSION_SRC/agents/orchestrator.md")` is false, `target` becomes `null`, and the loop `continue`s.

The comment on that `continue` states the assumption that makes the skip safe: *"dangling path: class (a) already reports it"*. For a `$VAR/`-rooted token the assumption is false. `scanPluginPaths` strips a declared `ROOT_VARS` prefix and resolves `$FUSION_SRC/agents/orchestrator.md` correctly, so class (a) reports nothing, and the anchor is dropped by both. The two scanners disagree about one token shape, and the skip is silent in the direction that loses coverage.

## How many, measured 260824

Four such citations exist in the shipped surface (`agents/`, `skills/`, `rules/`), all four in `skills/next/SKILL.md`. Two of them predate C3 and were already unchecked at `12b56d1`:

- `$FUSION_SRC/agents/orchestrator.md` `## Circle head fields`
- `$FUSION_SRC/rules/circle-records.md` `### The Directive is a pointer once a spec exists`

The other two were added by C3 step 10 and are the reason this was noticed at all: the step added two section citations and `BASELINE.anchors` did not move, staying at 186 where 188 was expected. The gate's own pin is what surfaced the hole, and only because a human read the delta rather than re-approving it.

## Why the count pin does not cover this

`BASELINE.anchors` pins how many anchors the gate *resolved*, so a citation the scanner never sees costs the count nothing. The pin catches a spelling that leaves scope only when the scanner saw it before; a shape it never saw is invisible to the pin in both directions. This is the same class the pin exists for, arriving from the side the pin cannot watch.

## Suggested direction, not a decision

Strip a declared `ROOT_VARS` prefix in `scanHeadingAnchors` the way `scanPluginPaths` already does, so one resolution rule serves both scanners rather than two that disagree. That would move `BASELINE.anchors` by the number of previously invisible citations, which is the expected and documented response to a spelling entering scope. Whether the two scanners should share one resolver outright, rather than each carrying its own copy of the rule, is the larger question and is not answered here.

## Found by

C3 step 10 (`skills/next/SKILL.md`), reported by `coder` in `circles/260824-0530-record-attribution-and-circle-claim/history/260824-1502-coder-c3-step10-next-refuses-and-claims.md` and verified against the source by the orchestrator before filing. Filed in the shared store rather than the Circle's: two of the four instances predate the Circle and the defect is in the citation gate, not in anything this Directive caused.

---
Resolved: fixed — `ANCHOR_RE` captures an optional `$VAR/` root and `scanHeadingAnchors` classifies it against `ROOT_VARS` the way `scanPluginPaths` does; the three `$FUSION_SRC/`-rooted anchors in `skills/next/SKILL.md` entered scope and `BASELINE.anchors` moved 185 -> 188 with a re-approval comment (the fourth the record counted was the duplicate the C3 citation repairs removed), shown failing with the strip reverted; `cd hooks && npx vitest run lib/__tests__/reference-resolution-lint.test.ts`
