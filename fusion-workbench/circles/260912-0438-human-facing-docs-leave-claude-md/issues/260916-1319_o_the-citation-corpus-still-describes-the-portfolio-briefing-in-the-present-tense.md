The citation corpus still describes the portfolio briefing in the present tense

---
`hooks/lib/citation-corpus.ts:141-145`:

> The portfolio briefing, at the workbench root. Class L since 2026-08-23, so it is present in the
> checkout that generated one and in no other; the predicate admits it either way and a walk judges
> it only where it exists.
>
> `export const PORTFOLIO = "portfolio.md";`

`isLiveRecord` (line 221) returns `true` for it, so the citation gate still judges a `portfolio.md`
wherever one is found. Nothing writes one any more: the Circle portfolio and the `playmaker` that
ranked it went at v11 (`CLAUDE.md` `## What this is`, the agent bullet). The comment reads as a
description of a live artifact kind, with no clause saying that.

The sibling statement of the same fact was updated. `hooks/lib/staging-drift.ts:216` carries
`{ path: "portfolio.md", why: "the portfolio briefing — regenerated in full by the ranking pass that
wrote it, **until v11 removed both**" }`. One home of the fact says it is gone and the other does
not.

Nothing catches it: `fusion.json` declares `hooks/lib/*.ts` as citation-bearing, but that gate
resolves record citations and says nothing about a prose tense, and `hooks/lib` is scanned
records-only.

The behaviour is correct either way — admitting the filename costs nothing, and a leftover
`portfolio.md` in a project that ran v10 is still judged, which is the right answer. The finding is
the description.

**Acceptance test:** `hooks/lib/citation-corpus.ts`'s `PORTFOLIO` comment says that nothing writes
one at this version and why the constant stays, in the form its sibling in
`hooks/lib/staging-drift.ts` already uses.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
Cross-references: `260910-2146_*_five-deleted-agents-are-still-named-as-live-in-twelve-shipped-files.md` (the same sweep, one instance below its file set).
