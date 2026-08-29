Twenty-eight records filed since the attribution rule landed carry no person half and no stated reason

---
`rules/fusion-workbench-conventions.md` `### Who filed it` obliges every filing agent to write the
person half of `**Filed by:**`, or, where the identity helper cannot be reached, to file without it
and say so. Of the 70 records filed after that rule landed, 25 carry the person, 14 carry the stated
absence, and 31 carry neither. **The title's number is superseded and the filename is kept anyway**,
because the spec and this session's `## Coherence` section cite this record by name; `## What was
measured` gives the current figures and why three passes disagreed about them.
---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` `### C3` (the acceptance criterion this leaves unmet); `rules/fusion-workbench-conventions.md` `### Who filed it` (the obligation); `bin/fusion-identity` (the helper); `260824-0530-record-attribution-and-circle-claim` (the Circle that landed the rule)

## What was measured

**The number in this record's title is superseded. The set is 31.** The filename is deliberately not
changed: `### C3` in the spec and this session's `## Coherence` section both cite this record by name,
and renaming it would break those citations to fix a word.

The set is defined by a predicate, and the count is whatever the predicate returns. A record is in it
when all four hold: its filename stamp is later than `260824-1214`, the commit time of `2b055a0`,
where `### Who filed it` landed; it carries a `**Filed by:**` line; that line carries no person half
in `<name@host>` form; and that line states no reason for the absence.

At HEAD (`53d656f`), 70 records under `circles/` and `shared/` carry a `**Filed by:**` line inside
that window:

| Outcome | Count |
|---|---|
| Person half present, in git's `Name <email>` form | 25 |
| Person half absent with the reason stated on the line | 14 |
| Person half absent, nothing stated on the line | 31 |
| **Total** | **70** |

The 14 are compliant. Each carries the parenthetical the rule's third branch prescribes (*"person
half absent: the installed plugin at `$FUSION_PLUGIN_ROOT` carries no `bin/fusion-identity`, so
attribution was dropped rather than composed"*), which is the exit-127 case the rule names, and it
was true for that session: the helper reached `~/.fusion` only on 260825 at 08:29, and every record
carrying that note was filed on 260824.

The 31 are not. Six agents are represented: `ontorev` (10), `analyst` (8, all the `260824-2013_o_*`
decisions in `260824-1853-close-every-open-defect`), `coderev` (7), `reconciler` (3),
`coder` (2) and `ontocoder` (1). No `planner` record exists anywhere in the window; the entry naming
one in the superseded breakdown was an artefact of that pass, not a record on disk. By kind the 31
are 21 issues, 8 decisions, 1 review and 1 session history, and all 31 are stamped `260824`. Every
in-window record stamped `260825` carries its person half.

**Six of the 31 state the reason in the record body, but not on the attribution line itself** — five
issues carrying an `Attribution:` line and one session history carrying a paragraph. They are in the
set because the predicate is scoped to the line. Whether that scope is the right one is the same
reach question this record leaves open below, and it is why two honest passes over one set can differ.

All 31 were annotated on 260825 with a retrospective line naming the filing agent and the absent
helper, citing
`260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.
The backfill adds a separate line and leaves every `**Filed by:**` line untouched, so the table above
still reads the same after it.

### Three passes produced three different counts of one set

This is a fact about the measurement, not about the records, and the next reader should not have to
rediscover it. The first pass, which wrote this record, reported 28 while its own per-agent breakdown
summed to 29 and named an agent with no record on disk. A second pass reported 31. A third,
measured twice and printing every distinct line form rather than bucketing, reported 29. The set had
not moved between them.

Two of the three differences are now accounted for. **31 against 29** is exactly two files: the
review `260824-1625-coderev-c3-two-fix-commits.md`
and the history `260824-1637-reconciliation.md`.
Both carry a `**Filed by:**` line and both satisfy the predicate; a pass that reads only
marker-bearing issue and decision filenames does not see them. **31 against 28** is three records the
first pass credited with a stated reason; its own totals are otherwise sound, since 17 + 28 and
14 + 31 are both 45, and its 18 and 63 were correct when written (seven more person-carrying records
have been filed since). *Inference, not verified:* the likeliest cause is that the first pass
accepted a reason stated anywhere in the record, which is the same line-versus-body boundary the six
records above sit on.

The lesson is the one the reach question already implies: **a count over these records is not
reproducible until the boundary is written down** — which kinds of file owe the field, and where the
reason may be stated. Until then, cite the predicate and the file list, not the number.


## Why this is the criterion and not an untidiness

`### C3`'s third acceptance criterion is *"Every agent that files a record writes the field"*. It is
the one criterion of the seven that is a claim about behaviour rather than about text, and it is the
only one of the seven that is not met. Its second half is separately stale — it prescribes `$USER`,
and `260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md`
replaced that with the git identity — but a corrected second half does not repair the first.

## What a fix would have to decide, and it is not obvious

The obligation is text in an always-on rule. Text is what the 31 records show is not sufficient, and
the two candidate directions differ in kind:

1. **Reach.** `### Who filed it` sits under `## Issue and Decision Filing — MANDATORY`, which by its
   own heading addresses defects and decisions. Two of the 31 are neither: one review and one session
   history. Whether a review file or a session history owes the field at all is not stated anywhere,
   and the spec's condition 1 speaks of *record templates*, three of them. Those same two files are
   the whole of the 31-against-29 disagreement above, so the unwritten boundary is not academic: it
   has already produced two different counts of one set.
2. **A gate.** Nothing measures the field. The three blocking gates in `README-hooks.md` all read
   citations, plans and compiled output; none reads `**Filed by:**`. A gate over the field would be a
   fourth, on a surface with its own growth bound, and it would have to encode the two legitimate
   absences (exit 4, exit 127) as passes.

**Severity:** Medium. Nothing malfunctions; what is lost is the attribution the whole of C3 exists to
produce, in 31 of the 70 records written since it landed.

**Found by:** reconciler, session-end pass over `a99e680..cfab17e`, HEAD `cfab17e`.

---

Resolved: 260827-1845 (plan step 8 of `260827-1756_*_repair-the-twenty-open-defect-records.md`, realising `260827-1756_*_which-record-kinds-owe-the-person-half-of-filed-by.md` `## Answer`, option 2). The reach is written down: `rules/fusion-workbench-conventions.md` `### Who filed it` names the kinds that owe the field as every kind whose template carries the line, and those templates now all carry it: defects and decisions already did, `rules/review-contract.md` mandates `**Filed by:**` as its third header field, and `## History Logging` requires it on the session history entry. A count over the obligation is therefore taken over those four kinds, which settles the 31-against-29 disagreement in favour of 31 (the review and the history both owe the field). No gate is added, for the two reasons the decision's constraints state: `hooks/lib/__tests__/` had 1 line free at `0fb5085`, and the miss branch the 31 records fell through (a `bin/fusion-identity` absent from the installed copy) is closed by the v10.8.0 identity export in `hooks/session-start.ts`, which hands every agent `FUSION_PERSON` at SessionStart, so a gate would police a case that no longer arises in the ordinary way. The 31 backfilled records stay as they are; the boundary is forward-looking. Not repaired here: `agents/coderev.md`, `agents/ontorev.md` and `CLAUDE.md` still say "the two mandated header fields" of the review contract; that count is now three and those files are outside this step's scope.
