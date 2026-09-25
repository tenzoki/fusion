# Which gates does `**Mode:** autonomous` answer, beyond the plan review, the claim and the finish?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260922-0937_*_may-the-eight-voice-profile-yaml-files-be-repunctuated-under-the-em-dash-ceiling.md, 260922-0922_*_the-51-open-issues-at-451bb312-worked-autonomously-as-one-package.md, 260917-2253-depends-on-edges-proposed-and-confirmed.md

---

## Question

The first autonomous package of 260922 stopped on a gate the field does not answer: plan step 16 repunctuates four voice-profile YAML files, a data task by the routing rule, and *Task involves `ontocoder`* is a file-and-skip row under `**Mode:** autonomous` (`agents/orchestrator.md` `## Human Gate Rules`). The row exists for a consuming project's ontology and manifests and does not weigh the change; a punctuation edit in a profile file was filed as a decision and skipped. Read against the whole gate catalogue, three further stops wait for any autonomous item: the curator's ledger gate and the edge confirmation (user gates outside the table), the spec review, and the pause or release of the item this checkout already holds when the user instructs it to claim another (the orchestrator paused `260917-2253` on that instruction with no rule covering it).

## Options

1. **The data task is answered; the curator's gate stays the user's.** *Task involves `ontocoder`* becomes an answered row (proceed) while *Structural ontology changes*, *Destructive operations* and *Ambiguous task instruction* stay file-and-skip; the curator's ledger gate stays with the user; pausing the held item is confirmed by the instruction to claim another.
2. **As 1, and the curator's gate is answered too.** Under the field a curator survey's ledger is applied whole (`**Approved:** all`), edges included.
3. **A per-item gate list.** The field names which rows it answers (`**Autonomous gates:** ontocoder, curator`), the default set staying as today.

## Constraints

Nothing here reaches the rows that ask as written for safety: files outside the project tree, the reconciliation verdict, a plan step the planner flagged. A `gate_response` an answered row writes carries the `answered by **Mode:** autonomous on <container>` text so a grep can exclude it from the return-to-user rate.

## Recommendation

Option 1: the data row was the measured stop, and a curator ledger changes normative text, which is the one class a human should read before it lands.

---
Answered: 260922-0906-fix-package-over-every-open-issue.md, the session of 260922-1028 — option 2: the field answers the data task (a structural change, a deletion and an ambiguous instruction stay file-and-skip), answers the curator's ledger gate with the whole ledger applied, and the pause of the item this checkout holds is confirmed by the instruction to claim another; ruled by user, Kai Stalmann <ks@qantr.com>, 260922-1028.

---
Implemented: the commit that renames this record to `_i_`, the first child of 6420c14e (`git log -1 --format=%h -- <this file>`) — `agents/orchestrator.md`: *Task involves `ontocoder`* moved from the file-and-skip set to the answered set of `## Human Gate Rules`, the three remaining file-and-skip rows counted as three in the `task_skipped` and `gate_hit` event rows; the curator paragraph applies a survey ledger whole under the field (`**Approved:** all`, `gate_hit` plus an answered `gate_response`, an empty ledger still dispatching nothing); `## Work items` confirms the pause of the held item by the instruction to claim another, the pause note naming what it waits for.
