CLAUDE.md's layout table enumerates rule files one by one and gained no row for the one v10.6 adds

---

**Severity:** Low. `CLAUDE.md` is dev-only and is not shipped, so nothing reaches a consuming project. What it costs is a maintainer reading the table and concluding the rule corpus is smaller than it is.
**Domain:** code
**Filed by:** orchestrator, cutting the v10.6 release; noticed by the coder writing its text
**Affects:** `CLAUDE.md` `## Layout`, its rule-file rows
**Cross-references:** `260822-1503_*_claude-mds-docs-row-says-fusion-help-points-at-every-upgrade-note-and-the-cap-made-that-false.md` (the other open claim in the same table, filed the same way and for the same reason)

---

## What is missing

`rules/review-contract.md` came into existence in commit `181dd8a`, carrying 8 894 bytes of reviewer
contract lifted out of `agents/coderev.md` and `agents/ontorev.md`, and `bin/fusion-rules` emits it to
those two agents. `CLAUDE.md` `## Layout` has no row for it.

**The table enumerates rule files individually rather than pointing at the directory.** It carries a
row each for `fusion-workbench-conventions.md`, `workbench-path-resolution.md`, `circle-records.md`,
`rule-file-provenance.md`, `workbench-tracking.md` and `decision-record-examples.md`, each saying what
the file authors and which agents it reaches. A seventh file now exists and the enumeration does not
know about it, which is the failure mode that table's own `templates/` and `docs/` rows were stripped
of inventories to avoid.

## Why it is filed rather than fixed

`CLAUDE.md` is the curator's surface. The convention is that its reconciliation happens at a user gate
through `/fusion:cleanup --only claude-md`, not as a side edit during other work, and this session has
held to that once already with `260822-1503_*_claude-mds-docs-row-says-fusion-help-points-at-every-upgrade-note-and-the-cap-made-that-false.md`. Two open records against one table is a better input to
that pass than two hand-patches that arrived without one.

The release is not blocked by it: the file is dev-only, so the gap ships nowhere.

## What the row would have to say

The two facts that distinguish this file from its neighbours, both verifiable in `bin/fusion-rules`:
it is a **conditional** emission, not part of the always-on set, and its audience is exactly `coderev`
and `ontorev` behind an `IS_REVIEWER_AGENT` flag. That flag form matters — `derivable-enumerations-lint`
needs it rather than a literal, because the audience is two agents.

---
Resolved: fixed — a `rules/review-contract.md` row stating the conditional emission to exactly `coderev` and `ontorev` behind `IS_REVIEWER_AGENT`; `CLAUDE.md:51`
