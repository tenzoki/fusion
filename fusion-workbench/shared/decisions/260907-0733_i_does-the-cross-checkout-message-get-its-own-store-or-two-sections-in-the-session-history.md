# Does the cross-checkout message get its own store, or two sections in the session history file?

---
**Domain:** code
**Filed by:** consultant, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260907-0729-git-versioned-broadcast-slot-between-checkouts.md`

---

## Question

A session that pushes should leave a message for the person and the agent on another
checkout: a compact part in the chat language addressed to the person, and a pointer part in
the artifact language addressed to their agent. Four design corrections are settled (no hook
anchoring, the write step sits in `/fusion:cleanup` immediately before its housekeeping
commit, the second part follows the artifact language, the second part is a pointer block and
not a narrative). One question is open and blocks shaping: does the message land in a store
of its own, or as two sections of the session history file the orchestrator already writes?

The answer must come first, because it decides the filename shape, the retention rule, the
`bin/fusion-paths` key set, and what the reading skill globs. Nothing downstream can be
planned around both answers.

## Options

1. **A store of its own under `shared/`, one file per session per checkout**: named
   `YYMMDD-HHMM-<checkout>-<slug>.md`, written at a gate in `/fusion:cleanup` before the
   housekeeping commit. The store's own directory name is not part of this question.
   - Pros: the message has one audience and one lifetime, so it can carry a hard size cap
     that a history file cannot. The reading skill globs one path. A reader asking what is
     new never walks a Circle directory. Single-writer files need no merge driver, unlike
     the append-to-one-file shape that would inherit `orchestrator-events.jsonl`'s lost
     ordering.
   - Cons: a sixth shared-only store, so the Origin Rule gains another named exception in
     `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`. New
     `OUT_BROADCAST` and `SCAN_BROADCAST` cases in `bin/fusion-paths`. A retention rule and
     an archive tier that do not exist yet. One file per session, forever, with nothing
     pruning it until that rule is written.
2. **Two sections in the orchestrator's session history file**: one addressed to the person,
   one to the receiving agent, appended at the same point in `/fusion:cleanup`.
   - Pros: no new store, no resolver key, no Origin Rule exception, no retention rule; the
     archive step already covers history files. The message travels with the record it points
     at, so the pointer half cannot outlive its target.
   - Cons: two audiences in one file. A history file is read during archaeology, and it has
     no size discipline, so the message inherits its length and gets buried in it. The
     reading skill must glob `circles/*/history/` and `shared/history/` and then extract two
     headings, which makes it a parser of a file format rather than a reader of a store.

## Constraints

- Whatever is chosen must be class R1 in `rules/workbench-tracking.md` `## The four classes`:
  many files, one writer each, tracked. A single appended file would need `merge=union` and
  would lose ordering between checkouts.
- The human part follows the chat language and the pointer part the artifact language, from
  the existing cascade in `rules/fusion-workbench-conventions.md` `## Project language`. No
  new declaration and no per-store language rule.
- The message is written at a user gate, not on every run. A store that fills whether or not
  anything happened stops being read.
- The entry carries a hard size cap enforced in the skill body, in the order of fifteen lines
  with the human part at six. The project's bookkeeping overhead already dominates its
  development cost, and an unbounded per-session artifact adds to it.
- Two questions are decided by whichever option wins and are not separate forks: what
  archives an entry and after how long (option 2 answers it by inheritance), and whether the
  file is keyed per session or per push (`/fusion:cleanup` pushes twice, so option 1 must
  answer it and option 2 cannot ask it).

## Recommendation

Option 1, on the audience argument. A history file records what happened and is read later by
whoever is reconstructing a decision. A message is addressed to a named reader and is read
once, soon, and then stops mattering. Those two lifetimes want different size discipline, and
the file that carries both will be sized by the archaeology, not by the reader who has two
minutes before deciding whether to pull.

The cost of option 1 is real and should be paid deliberately rather than discovered: the
retention rule is part of the same unit of work, not a follow-up. Reuse
`bin/fusion-cadence-anchor` for the reader's high-water mark, whose header already invites a
future step to add its own key and whose `changed-files <key> [<pathspec>]` is the delta
primitive this needs.

---
Answered: `260907-0829-message-between-checkouts-read-before-pull` `## Grounding snapshot` — option 1, the message gets a store of its own; the user then ruled its placement and name as `shared/forum/`, choosing forum over broadcast because the traffic runs both ways; ruled by user, Kai Stalmann <ks@qantr.com>

---
Implemented: af3f23e2 and 97bc8b0b — the store exists as shared/forum with its own resolver keys, and is named in the layout tree, the filename patterns and the key table.
