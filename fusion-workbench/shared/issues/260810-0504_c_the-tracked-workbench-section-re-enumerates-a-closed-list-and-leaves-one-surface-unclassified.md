# The new tracked-workbench section re-enumerates a closed list ten lines below it, and leaves one surface in neither bucket

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241`, Turn 1)
**Affects:** `rules/fusion-workbench-conventions.md` `### Which of them a tracked workbench tracks`
**Cross-references:** commit `65f7c3b`; `shared/issues/260810-0410_o_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md` (already open — cross-referenced, not refiled); `shared/issues/260810-0455_o_npm-test-is-red-…` (the byte cost)

---

## The defect, in three parts

### 1. The partition is incomplete

The new section splits the root-anchored surfaces into two buckets:

> - **Records — track them.** `orchestrator-events.jsonl`, `tasklist.md` and `portfolio.md`.
> - **Live state — do not track it.** `agentstate.yaml`, `orchestrator-live.md`, `.guard-state/`,
>   `.commit-lock/`, `.session-marker` and `.active-circle`. […] `monitor` is a verbatim copy […]

`fusion-workbench/.fusion-setup` appears in the layout tree directly above and is in **neither**
bucket. It is not a record in the section's sense (no past version answers anything) and it is not
live state (it is written once and never overwritten). Checked in this repository: it is tracked and
not ignored, so the tree and the `.gitignore` agree with each other by accident rather than by the
rule.

`rules/critical-stance.md` §4 is the standard the section itself has to meet: a case split is disjoint
and complete, and a gap is a defect of the same kind as a wrong result. The commit message for
`65f7c3b` claims "all ten root-anchored surfaces were put to it"; the tree holds eleven.

### 2. It is a second enumeration of a list the same file already enumerates

Ten lines above, `## fusion-workbench Layout` carries the tree, and the paragraph under it says:

> The list is exhaustive as written, and it is a list rather than a count on purpose […] this document
> is the definition, and an incomplete tree invites exactly the reasoning-by-omission it exists to
> prevent.

The new section restates that closed list in prose. There are now two enumerations of one set in one
file, and a `bin/` helper that adds a root-anchored surface has two places to land instead of one —
which is the failure the paragraph above was written to prevent, arriving from inside the same
document.

The cost is already concrete: `260810-0410` records that the tree omits `.plane-map.json` and
`.plane-outbox.jsonl`. The new section omits them too, so that open issue now has two sites to fix.
(Do not refile `260810-0410` — this record exists because the second site is new.)

### 3. The audience does not match the content

This file is emitted to **all sixteen agents on every dispatch**. The tracked/untracked split is
consumed by three parties: `/fusion:circle-stash`, `/fusion:cleanup`, and whoever writes a
`.gitignore`. It is consumed by `coder`, `ontocoder`, `analyst`, `shaper`, `editor`, `planner`,
`taskplanner`, `conceptrev` and the rest — nine or more agents — never.

The file's own header table documents the remedy and has applied it four times: partition a topic into
its own authoring home and emit it to a derived audience. `rules/workbench-stash-and-lock.md` already
exists, is emitted to `orchestrator` alone, and is cited by both stash skills — it is where this
section belongs.

Judged against the byte cost the same session stated: the two new paragraphs together added 2 151
bytes to a file loaded sixteen times per dispatch, and left `npm test` red because the golden that
measures exactly this was not regenerated (`260810-0455`). The **empty-resolver-key** paragraph from
`e99f0ef` earns its place — every agent holds resolver keys, so every agent needs the rule. This
section does not.

## Fix direction

1. Classify `.fusion-setup`, or say explicitly that the split ranges over the ten session-state
   surfaces and not over the tree.
2. Move the section to `rules/workbench-stash-and-lock.md` and leave a one-line pointer, matching the
   four partitions the header table already records. Cite it from the `.gitignore` comment, which is
   where the decision is actually applied.
3. Whatever is decided, add the two Plane runtime files once, in the tree, per `260810-0410` — not
   twice.

---
Resolved: parts 1 and 2 are closed in `rules/fusion-workbench-conventions.md`
`### Which of them a tracked workbench tracks`. Part 1 — `.fusion-setup` is now classified as a
**record**, with the consequence of the opposite choice stated where the choice is made, so the case
split is disjoint and complete over its stated range. Part 2 — the section no longer re-enumerates
the tree's closed list: its scope is now declared by exclusion (**every root entry outside the
artifact directories**), so a new root-anchored surface lands in the tree once and is classified by
the rule rather than by a second list somebody has to remember to extend.

Fix-direction items 2 and 3 are **not** done, and both are moot rather than deferred. Item 2 named
`rules/workbench-stash-and-lock.md` as the section's proper home; that file no longer exists — the
commit lock moved to `rules/commit-lock.md` and the stash half left with the two stash skills on
2026-08-15, so there is no orchestrator-only home to move it to and re-partitioning for one section
would cost more bytes than it saves. Item 3 named the two Plane runtime files; the Plane mirror was
removed on 2026-08-15, so there is nothing to add. Part 3 of the defect (audience) therefore stands
unaddressed by design: the section is still emitted to every agent. Cost of the change measured at
+366 bytes on the always-on surface, absorbed within head-room —
`hooks/lib/__tests__/rules-emission-golden.test.ts` passes and no baseline moved.
