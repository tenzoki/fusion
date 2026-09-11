One bullet in README-agents lists circle-records.md as a live emission and as removed
---
`README-agents.md:176` opens by naming `circle-records.md` as the conditional rule emitted to the Circle-transitioning agents and closes, in the same bullet, by saying it went on 2026-09-10 with the Circle container. The file does not exist and `bin/fusion-rules` has no such emission.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `1e367195`, `115be68d` (the removals this bullet was edited across)

**The bullet, at HEAD `1d6103c4`**, first half:

> **Conditional:** `design-diagrams.md` … ; `circle-records.md` for the Circle-transitioning agents
> (`orchestrator`, `shaper`); `decision-record-examples.md` …

second half, same bullet:

> **Two conditional files went on 2026-09-10 with the Circle container**: `circle-records.md`, which
> carried the Circle state vocabulary and record templates to the orchestrator and the shaper, …

`ls rules/` returns no `circle-records.md`, and the conditional emissions in `bin/fusion-rules` are
`user-facing-output.md` (`:579`), `decision-record-examples.md` (`:593`), the two voice profiles
(`:603`, `:612`), `design-diagrams.md` (`:620`), `commit-lock.md` (`:646`), `project-language.md`
(`:658`) and `review-contract.md` (`:668`). There are eight and none is this one.

**Why it matters beyond the sentence.** This bullet is the enumeration a reader consults to learn
what a dispatch actually loads, and the first half reads as current. A reader who stops at the
semicolon — which is where an enumeration is normally read — takes a deleted file for a live one.
The second half is the correction and it is 500 characters downstream of the error.

**Acceptance.** The entry is out of the enumeration; the removal sentence, which is correct as it
stands, is what is left. `grep -c 'circle-records' README-agents.md` returns 1.
