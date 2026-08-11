# Should `fusion-plane push --rebuild-map` merge with the existing map, or replace it?

---
**Domain:** code
**Status:** open
**Filed by:** orchestrator
**Cross-references:** `shared/issues/260810-0457_c_rebuild-map-drops-a-colliding-plane-uuid-silently-unlike-the-migration-beside-it.md` (the defect that surfaced this, now closed); `shared/issues/260807-1939_c_plane-natural-key-carries-the-state-marker-and-breaks-on-every-transition.md` (the commit that made rebuild a recovery path again); `shared/history/260810-0715-coder-plane-map-read-write-split.md`

---

## Question

`--rebuild-map` reconstructs `.plane-map.json` by reading the `fusion-key:` line out of the Plane issues themselves. It **replaces** the map rather than merging with it. So any binding that exists only locally, and has no counterpart discoverable in Plane, is discarded by a successful rebuild.

The known case is the seed-origin binding: `fusion-plane seed` records which Plane story a Circle was materialised from, so the Circle's later pushes land on the origin story. That binding lives only in the map. A rebuild drops it, and the next push creates a new Plane issue beside the story the work actually came from.

Commit `f320db2` made rebuild a usable recovery path for the first time (before it, a verbatim rebuild restored precisely the mapping a state transition had invalidated). That is what makes this worth deciding now: a path nobody could use had no cost, and a path people will now reach for does.

The immediate defect — a colliding UUID dropped silently, with no ordering and no report — is fixed (`260810-0457`). The executor deliberately did **not** also change replace to merge, on the ground that broadening a recovery path's contract inside a task about not destroying UUIDs is the wrong place for it. It made the loss loud instead: every discarded binding is named, with the `seed --record-origin` line that restores it.

So the question is whether "loud" is the right final answer, or an interim one.

## Options

1. **Keep replace, keep it loud.** What ships today. A rebuild is a reconstruction from the remote, and saying so plainly is honest; the operator is told exactly what was discarded and given the command that restores each item.
   - Pros: the semantics stay simple — rebuild means "the remote is the truth". No merge policy to get wrong. Already implemented and verified.
   - Cons: the operator has to act on the output, and an operator running a recovery command is typically already in trouble and least able to. A binding that only exists locally is precisely the thing a rebuild cannot rediscover, so the tool is loudest about the case it is worst at.

2. **Merge: rebuild what Plane knows, preserve what only the map knows.** Entries recoverable from Plane are rebuilt; entries with no Plane counterpart are carried across.
   - Pros: fixes the seed-origin loss outright rather than reporting it. Matches what an operator almost certainly means by "rebuild".
   - Cons: needs a rule for the case where both sides know an entry and disagree, which is a second collision policy beside the one just written for the fold. And a stale local entry — a Plane issue somebody deleted — now survives a rebuild that was run precisely to clear such things.

3. **Split the command.** `--rebuild-map` keeps replace semantics; a separate flag, or a `map` subcommand, does the merge.
   - Pros: neither meaning has to be guessed from a flag name; the destructive one stays explicit.
   - Cons: a third command surface on a helper that already has six subcommands, and the operator now has to know which of two recoveries they want at the moment they are least equipped to choose.

## Constraints

- The mirror is push-only and files are authoritative. Whatever is chosen must not make the map a second source of truth about anything files already record.
- `bin/fusion-plane:99-104` documents rebuild's behaviour and was wrong until this session. Whichever option is taken, that comment is part of the change, not a follow-up.
- The seed-origin binding is the only known local-only entry. If it turns out to be the only one there will ever be, option 2 collapses to a special case for one field, which is worth noticing before building a general merge.

## Recommendation

None yet. The honest state is that option 1 is shipped and adequate, and that the case for option 2 rests on how often a rebuild is run against a workbench that has seeded from Plane — which nobody has measured, because the Plane bridge has not been used in anger yet. Answer it after the first real recovery, not before.

---
Deferred: until the first real recovery is run against a workbench that has seeded from Plane.
User, session 260811-0752 (chat).

**Trigger.** Re-open the first time `fusion-plane push --rebuild-map` is run in anger against a
workbench holding entries that Plane cannot reconstruct. That event supplies the one input the
record says is missing: how often a rebuild meets a map carrying knowledge only the map has. Until
then option 1 is what ships and the record itself calls it adequate — a rebuild is a reconstruction
from the remote, it says so plainly, and it tells the operator exactly what was discarded and how
to restore each item.

This is a deferral on evidence, not on effort. The Plane bridge has not been used in anger, so
answering now would be choosing between two designs on a usage pattern nobody has observed.
