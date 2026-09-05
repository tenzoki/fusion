Thirty-four of sixty-two records filed on 260827 carry no person half after the reach was settled

---
The obligation to write `**Filed by:** <agent>, Name <email>` now reaches four record kinds by decision. Measured the day it landed, the history and shared-decision kinds do not write it.

---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. C3's third acceptance criterion in `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` is the one thing keeping that spec at Partially Complete, and the record that counted the first miss closed on the reach question rather than on the count.

**Cross-references:**
`260827-1756_*_which-record-kinds-owe-the-person-half-of-filed-by.md` (option 2, `_i_`);
`260825-1250_*_twenty-eight-records-filed-since-the-attribution-rule-landed-carry-no-person-half-and-no-stated-reason.md` (closed 260827-1845 on the reach);
`rules/fusion-workbench-conventions.md` `### Who filed it` and `## History Logging`.

## Measurement

At HEAD `36cd574`, over every record stamped `260827-*` in the closed Circle's `issues/`, `decisions/`, `history/` and `reviews/` plus `shared/issues/` and `shared/decisions/`: 62 files. 28 carry a line matching `^\*\*Filed by:\*\* <agent>, .*<.*@` and 34 do not:

- 21 session-history entries in the Circle's `history/` (every coder, planner, analyst, ontocoder, playmaker, orchestrator and reconciler entry of that day, `260827-1521-orchestrator-session.md` through `260827-2110-coder-turn-2-bookkeeping.md`);
- 11 `shared/decisions/260827-*` records (`0745`, `0830`, `0910`, `1056`, `1120`, `1210`, `1305`, `1310`, `1311`, `1330`, `1439`);
- 2 `shared/issues/260827-*` records (`0410_o_*`, `0716_c_*`).

The Circle's own `issues/` and `decisions/` stores are fully compliant (all `260827-1756_*` decisions and all `260827-2042_c_*` findings carry the line).

## What is and is not claimed

The rule text landed at `260827-1845` (plan step 8 of the closed Circle); records written earlier that day precede it and are not faults against it. The 21 history entries and the 11 decisions written *after* 18:45 are: the 2102 to 2110 coder entries and the 2034 reconciliation are the clean cases. The count is stated whole because the criterion asks about behaviour, and a reader deciding whether the spec closes needs the whole figure, not the post-rule slice. Not claimed: that any one prompt is at fault; the miss spans seven agents, which is the reach question again, now on the writing side.

## Fix direction

Either the agents' history-entry shape and the decision template write the line where the rule says they do, and the next reconciliation re-measures; or the user closes the multi-user spec bounded with this criterion named. The reconciler moves neither.

---
Reconciled 260905-2015 (reconciler, HEAD `5b84b13a`): still open, and materially smaller. Re-measured
rather than carried forward, because the record's own fix direction asks the next reconciliation to
re-measure.

Over every record in `issues/`, `decisions/`, `history/` and `reviews/` stamped `2609*`, in the live
Circles and in the shared stores, `archive/` excluded — **89 files**:

- 84 carry a person half.
- 75 carry it in the form the rule mandates, `**Filed by:** <agent>, Name <email>`.
- 9 carry it in a second spelling that arrived since: `**Filed by:** coder (Name <email>, checkout <hex>)`.
- 5 carry no person at all, every one of them a session-history entry.

So the class the original count named — history entries missing the field — has gone from 21 of 21 to
5 of the September set, and the decision, issue and review kinds are fully compliant. The criterion
this record blocks, C3's third in `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, is still
unmet: "every agent that files a record writes the field" is false for five.

**A second finding this pass turned up and did not fold into the count.** The nine parenthesised
records are not a miss — they carry the person and the checkout — but they are a second form of a
field the rule states once, and a reader or a gate counting the mandated form reads them as absent.
That is a shape question rather than an omission, and whoever answers this record should decide it in
the same pass rather than meet it a third time.
