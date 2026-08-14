The Turn-3 review states five findings and a three-two split while carrying six and a four-two split

---
`circles/260801-1244-curator/reviews/260814-1419-coderev-curator-turn-3.md` `## Summary` opens with
"Five findings, none in behaviour". Its `## Totals` section then says "Three are filed under
`circles/260801-1244-curator/issues/` and two under `shared/issues/`". Both counts are wrong against
the same document's own table, its own numbered findings, its own closing section, its commit
message and the files on disk: there are six findings, split four and two.

---
**Verified 2026-08-14 at HEAD `18173e1`.**

| Source inside or beside the review | Count it gives |
|---|---|
| `## Summary`, first line | five |
| `## Totals`, table (0 Critical, 0 High, 4 Medium, 2 Low) | **six** |
| `## Totals`, prose ("Three … and two …") | five |
| `## Findings by theme`, numbered items 1 to 6 | **six** |
| `## Cross-cutting observation` ("All six findings sit in text no parser reads") | **six** |
| commit message of `18173e1` ("Six findings, none in behaviour") | **six** |
| `ls circles/260801-1244-curator/issues/260814-1419_o_*` | **four** |
| `ls shared/issues/260814-1419_o_*` | **two** |

So two sentences disagree with six other statements of the same fact, and the four-two split is the
one the disk carries.

**Why it is worth a record rather than a silent correction.** This is a review whose own
`## Cross-cutting observation` is that "the surfaces which carry counts and enumerations need a gate,
not a careful reader", and whose finding 6 is a history file stating eighteen agent blocks where
there are seventeen. The same class landed in the document that named it, twice, in the two places a
reader looks first. It is the third instance in this Circle of a hand-written count going stale or
wrong inside the artifact that argues against hand-written counts, after
`circles/260801-1244-curator/decisions/260814-0845_*_are-the-sixteen-agent-claims-corrected-or-derived-away.md`
and finding 6 itself.

**Severity:** Low. No finding is missing — all six are numbered, described and filed. Only the two
summary counts are wrong, so nothing was lost, and a reader who reaches `## Findings by theme` gets
the full set.

**Owner:** `coder`, as a two-line correction, or the reviewer on a later pass.

**The fix, in the shape this Circle has twice chosen for the same class.** Restate both sentences
without a count: "Findings, none in behaviour" and "Filed under the Circle's issue store and under
`shared/issues/`, split by the Origin Rule". That is what decision `260814-0845` chose for the
sixteen-agent claims and what the T6 repair in `2a8a2f7` chose for the arming prose. Correcting five
to six leaves the same sentence able to go wrong the next time a finding is added or withdrawn.

**Filed by:** reconciler, session `shared/history/260813-2345-orchestrator-session.md`, Circle
`260801-1244-curator`. Filed in the Circle's own store per the Origin Rule: the review it describes
was produced by executing this Circle's Directive.
