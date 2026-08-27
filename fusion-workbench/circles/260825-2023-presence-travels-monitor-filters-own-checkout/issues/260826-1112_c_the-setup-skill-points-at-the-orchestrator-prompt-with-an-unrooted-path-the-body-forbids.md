# The setup skill points at the orchestrator prompt with an unrooted path its own preamble forbids

---
`6deeb33` made `skills/setup/SKILL.md` Step 5's `session_start` template carry `<ID>` and nothing
literal, and pointed the reader at where `<ID>` is defined. The pointer it wrote is a bare
`agents/orchestrator.md`. The same file's preamble states that a path into a shipped file carries the
`$FUSION_SRC` root, because a bare `agents/…` resolves to nothing at a consuming project's root — and
the three other pointers into that same prompt all carry it. The definition the template now depends
on entirely is therefore unreachable in the projects the skill runs in.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. Nothing is wrong in this repository, where the bare path happens to resolve.
In a consuming project the reader of Step 0i is sent to a file that is not there, and since `:483`
no longer carries the two fields literally, there is no second route to what `<ID>` expands to.

**Cross-references:**
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0906_*_a-fourth-session-start-emit-template-was-created-in-this-range-and-left-out-of-the-id-conversion.md`
(the record `6deeb33` closed; its resolution note calls the new citation "unrooted" as a measurement
property and does not read it as a convention breach).

## What is there

`skills/setup/SKILL.md:352`, the last sentence of Step 0i:

> Hold the pair as `<ID>`, the fragment defined at `agents/orchestrator.md` Setup step 2.

`skills/setup/SKILL.md:12`, the body's own rule:

> **A path into a file the plugin ships carries the `$FUSION_SRC` root.** Where a step below sends
> you to an agent prompt or another skill's body, open it at that root — nothing the plugin ships
> exists at a consuming project's root, so a bare `agents/…` or `skills/…` path resolves to nothing
> there.

The three sites that already obey it, all pointing into the same prompt: `:418`, `:424` and `:455`,
each written `$FUSION_SRC/agents/orchestrator.md`.

A second, older instance stands at `:480`: "authored in `agents/orchestrator.md` `### 2. Structured
Event Log`", added at this Circle's step 4 and untouched by `6deeb33`. Bare `rules/…` citations
elsewhere in the body are **not** instances — those files reach the agent through `bin/fusion-rules`
rather than being opened at a path.

## Why no gate sees it

`hooks/lib/__tests__/reference-resolution-lint.test.ts` resolves a bare `agents/orchestrator.md`
against `pluginRoot`, where the file exists, so the token counts as resolved and the pin moves by
one. The gate asks whether a path names a real shipped file; it has no notion of which root a
consumer would open it at. That is the same blind spot for both instances.

## Fix direction

Root both citations: `$FUSION_SRC/agents/orchestrator.md` at `:352` and at `:480`. The `$FUSION_SRC`
resolution already runs at the top of the body, so nothing else is needed. The reference pin should
not move: `scanPluginPaths` and `scanHeadingAnchors` both strip a `ROOT_VARS` prefix, so a rooted
token registers exactly as its bare form does. Measure it rather than assume it.

---
Resolved: 260827-2020 by coder. Both citations in `skills/setup/SKILL.md` (Step 0i and Step 5) now read `$FUSION_SRC/agents/orchestrator.md`. Measured by single-file revert: the reference pin moves by +4 paths and +2 anchors across the whole edit set landing in this commit (Steps 0j, 2 and 3 added citations); the two rootings themselves register as their bare forms did.
