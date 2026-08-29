# To whom is the new workbench-tracking rule emitted, when its consumers are a human and a skill?

---
**Domain:** code
**Status:** open
**Filed by:** orchestrator (raised by the user's answer to `260816-0711`)
**Cross-references:** `260816-0711_*_where-does-the-tracked-workbench-split-live-now-that-the-home-it-was-meant-to-move-to-is-gone.md` (the answer that raised this); `rules/fusion-workbench-conventions.md` `### Which of them a tracked workbench tracks` (the text being moved); `bin/fusion-rules`; `rules/workbench-path-resolution.md` and `rules/rule-file-provenance.md` (the two files emitted to no agent by design)

---

## Question

The user answered `260816-0711` with option 2: move the tracked-workbench subsection into its own
`rules/workbench-tracking.md` and leave a pointer in the conventions file. That record names one
condition on option 2 which the answer does not settle, and which blocks the move rather than
following it: **the derived audience has to be derivable.**

`bin/fusion-rules` serves agents only and exits 2 on any other name. The two parties that actually
apply this rule are a human writing a project's `.gitignore`, who reads a file rather than
receiving an emission, and the archive step of `/fusion:cleanup`, which is a skill and therefore
outside the helper's namespace. No executor agent applies it at all.

So the move as approved has no obvious emission target, and the record's own constraint says a
third file emitted to nobody needs a positive reason rather than an inherited pattern.

## Options

1. **Emitted to no agent, reached by citation.** The same shape as `rules/workbench-path-resolution.md`
   and `rules/rule-file-provenance.md`: the file exists, the conventions pointer names it, and
   `/fusion:cleanup` cites it directly the way every skill reaches rule text.
   - Pros: takes the bytes off all fifteen dispatches, which is the whole point of the move. The
     precedent exists twice and both cases are deliberate.
   - Cons: a third such file, and the record warns against inheriting that pattern without a
     positive reason. Nothing then guarantees the archive step actually reads it.
2. **Emitted to the agents that touch archived or tracked state.** Pick a derived audience the way
   `rules/circle-records.md` derives one, from a mechanical property of the prompts.
   - Pros: keeps the emission mechanism as the audience definition, which is this project's stated
     preference over a hand-picked list.
   - Cons: there may be no such property to derive from. No agent applies the rule, so a derivation
     would be constructed to justify an emission rather than discovered.
3. **Do not move it; revisit `260816-0711`.** If the emission question has no good answer, option 2
   of that record was the wrong choice and option 3 (cut the reasoning, keep the rule) deserves
   another look.
   - Pros: honest if the move turns out to be unimplementable as approved.
   - Cons: reopens a decision the user just made, and the byte case that motivated it is unchanged.

## Constraints

- The split must stay reachable by a human writing a `.gitignore`. That reader is not served by any
  emission mechanism, so no option may depend on emission alone to make the text findable.
- `hooks/lib/__tests__/rules-emission-golden.test.ts` bounds the always-on set. Every option here
  removes bytes from it or leaves it unchanged; none adds.
- Whatever is chosen must not leave the conventions file pointing at a file nobody can be shown to read.

## Recommendation

Option 1, at low confidence. It is the only option that delivers what the approved move was for,
and the "positive reason" the record asks for is available: unlike the other two no-agent files,
this one has a named non-agent consumer in `/fusion:cleanup`'s archive step, which can cite it
explicitly in its own body. That turns "emitted to nobody" into "read by a skill that says so",
which is a different claim.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`). Still open, and
searched rather than assumed. `rules/` holds twelve files at HEAD and `workbench-tracking.md` is
not among them, so the move this record blocks has not been made. No answer exists in
`shared/analyses/` (sixteen reports, none on rule emission or on this split), in `shared/planning/`
(nine files, all `_c_` after this pass), or in another decision record — the only two files naming
`workbench-tracking` are this record and the one that raised it,
`260816-0711_*_where-does-the-tracked-workbench-split-live-now-that-the-home-it-was-meant-to-move-to-is-gone.md`.
That record is itself answered-but-unrealised for exactly this reason, which the pass records as a
blocking pair rather than as two independent items: neither can move until this question is
answered. Marker stays `_o_`.

---
**Reconciliation 260818-0814** (reconciler, domain `code`, HEAD `f3a3565`). Still open. Searched and
not assumed: `rules/` holds twelve files at HEAD and no `workbench-tracking.md` among them; no file
in `shared/analyses/` (seventeen reports, the new one being on identifier containment) addresses
rule emission or this split; `shared/planning/` holds three files, all `_c_`; no other decision
record answers it. The blocking pair with
`260816-0711_*_where-does-the-tracked-workbench-split-live-now-that-the-home-it-was-meant-to-move-to-is-gone.md`
stands unchanged. Marker stays `_o_`. Log: `260818-0814-reconciliation.md`.

---
Answered: 260818-2301-orchestrator-session.md — user chose option 1 (2026-08-18): `rules/workbench-tracking.md` is emitted to no agent. The conventions file points at it, and the archive step of `/fusion:cleanup` cites it in its own body, which is the positive reason the record asked for: unlike the two existing no-agent rule files, this one has a named non-agent consumer that says so. The move approved in `260816-0711` is thereby unblocked.

---
Implemented: `rules/workbench-tracking.md` — the file exists, carries a `**Provenance:**` line citing both this record and `260816-0711`, and has **no** `emit_if_exists` line in `bin/fusion-rules`, so it is emitted to no agent as option 1 specifies. Its two consumers are named in its own lede and in the pointer left behind at `rules/fusion-workbench-conventions.md` `### Which of them a tracked workbench tracks`; `skills/archive/SKILL.md` cites it explicitly, which is the positive reason this record asked for and the thing that distinguishes it from the two existing no-agent rule files. The always-on floor, as `CLAUDE.md` defines it -- the five unindented `emit_if_exists` files plus the project chat profile -- falls 101 393 -> 97 977 bytes per dispatch.

**Correction 260819-0050** (orchestrator). The sentence above first read "The always-on rule set falls 98 874 -> 95 458 bytes per dispatch." Both figures were the `[analyst]` block of `hooks/lib/__tests__/fixtures/rules-emission.golden`, which is neither the always-on set nor any agent floor: it includes the conditional `design-diagrams.md` and excludes the unconditional chat profile, a fixed 2 519-byte offset. The delta was right and the label was wrong. Filed by the review as `260819-0040_*_the-implemented-note-labels-the-analyst-dispatch-total-as-the-always-on-rule-set.md` and corrected here; the commit message of `b200902` carries the original wording and is left as it stands, being history.

---
**Reconciliation 260819-0840-reconciliation.md** (reconciler, domain `code`, HEAD `83488e9`). The `Implemented:` note above verifies in full, clause by clause, and the corrected byte figures reproduce exactly. `rules/workbench-tracking.md` exists (5 382 bytes) and its `**Provenance:**` line at `:3` cites both this record and `260816-0711`. `bin/fusion-rules` carries no `emit_if_exists` line for it — `grep -n 'workbench-tracking' bin/fusion-rules` is empty, and the five unindented lines at `:384-388` are unchanged — so it is emitted to no agent as option 1 specifies. The pointer stands at `rules/fusion-workbench-conventions.md:15` (header-table row) and `:75`; `skills/archive/SKILL.md` cites it at `:11`, `:40` and `:136`, and since `06ab15b` Step 1 actually `cat`s it, which is the mechanism the positive reason claimed. The always-on floor, measured as `CLAUDE.md` defines it over the five unindented `emit_if_exists` files plus `fusion-workbench/stilwerk/chat-voice-de.yaml`, is 101 393 bytes at `52b1d95` and 97 977 at `b200902` — the corrected figures, to the byte. Marker stays `_i_`. Log: `260819-0840-reconciliation.md`.
