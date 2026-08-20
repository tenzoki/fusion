A dependency between two Circles can only be recorded on one side, because nobody may write the other

---
Two anticipated Circles created in one session depend on each other's ordering. The second cites
the first in its `## Dependencies`. The reverse citation cannot be written by anyone: the shaper
may not touch a Circle other than the one it creates, and the orchestrator's Circle-record write
list does not include `## Dependencies`. The relationship is therefore visible from one record and
invisible from the other, which is exactly the failure `## Dependencies` exists to prevent.

---

## How it surfaced

In session `shared/history/260813-0806-orchestrator-session.md`, two anticipated Circles were
created in sequence:

- `circles/260813-0858-playmaker-maintains-backlog-store/`
- `archive/260817-1907-safe-cleanup-scoped/circles/260813-0910-documentation-matches-shipped-plugin/_b_circle.md`

The second depends on the first: three documents describe the playmaker's backlog role, and that
role is about to change, so certain paragraphs wait. The documentation Circle's record names the
dependency correctly, with the playmaker Circle's directory name, because that Circle already
existed when the shaper wrote it.

The playmaker Circle was created first, when the documentation Circle had no name yet. Its shaper
wrote the relationship in prose and reported: "Der Verzeichnisname fehlt noch und wird vom
Orchestrator nachgetragen." The second shaper reported the same expectation: "That edit is the
orchestrator's."

Both are wrong about the orchestrator, and neither could have known.

## Why no party may perform the write

- **The shaper.** `agents/shaper.md:28` — "**No existing Circle may be modified in
  anticipated-circle mode**". Correct as written: an agent that creates Circles should not be able
  to reach into others.
- **The orchestrator.** `agents/orchestrator.md` `## Scope` enumerates the Circle-record content it
  may write, in three places "and nowhere else": the `## Closure note`, the `## Turn log` entry for
  the Turn just ended, and the three head fields. `## Dependencies` is not among them, and the
  enumeration is explicitly closed.
- **The playmaker.** `agents/playmaker.md:10` — it appends activation-proposal, dependency-warning
  and stale-Grounding sections only. It *detects* dependency cycles and warns about them; it does
  not author the dependency edges it reasons over.

So the write has no owner. The orchestrator declined it in this session rather than taking it
silently, which is why this record exists instead of an unrecorded scope violation.

## Why it matters more than one missing line

`rules/circle-records.md` `## Circle record template` describes `## Dependencies` as "List of other
Circle directory names this Circle depends on. Playmaker flags cycles here." The playmaker's
cycle detection reads these edges. An edge recorded on one side only is, to a cycle detector, half
an edge: a mutual dependency between two Circles is precisely the shape it is meant to catch, and
it cannot see one whose second half nobody was allowed to write.

The failure is also silent and gets worse with time. A reader who opens the playmaker Circle sees
no dependency and concludes there is none.

## The shape of the fix, not the fix itself

Deliberately not chosen here — this is a defect record, and the choice between the candidates is a
decision. The candidates visible from the two prompts:

1. Extend the orchestrator's Circle-record write list by one section, `## Dependencies`, argued the
   way its three existing exceptions are argued. Smallest change; widens a list whose closedness is
   load-bearing.
2. Let the shaper write the reverse edge on the Circle it cites, as a single narrow exception
   parallel to its `Promoted:` backlog exception. Keeps the write next to the party that knows the
   relationship; breaches "no existing Circle may be modified".
3. Give the playmaker the edge, since it already reasons over the graph and already appends
   dependency-warning sections. It would author what it currently only reads.
4. Accept one-sided edges and make every consumer read the relation symmetrically — the cycle
   detector, the portfolio renderer, `/fusion:next`. No prompt boundary moves; every reader gets
   harder.

Option 4 deserves a real hearing rather than a mention: it is the only candidate that moves no
write boundary, and a dependency is arguably a fact about a *pair* rather than a property of one
record.

## Acceptance

- Creating a Circle that depends on an existing one leaves the relationship readable from both
  records, or readable from one and correctly interpreted by every consumer.
- The playmaker's cycle detection sees a mutual dependency between two Circles regardless of which
  was created first.
- Whichever party gains the write, its prompt's scope enumeration says so, and no other party is
  left believing it owns the write.

## Immediate state, for whoever picks this up

`circles/260813-0858-playmaker-maintains-backlog-store/_*_circle.md` currently names the
documentation Circle as a relationship in prose without citing its record
(`archive/260817-1907-safe-cleanup-scoped/circles/260813-0910-documentation-matches-shipped-plugin/_b_circle.md`, which was live under
`circles/` when this was written). One line, once a writer exists.

---

## Reconciliation 260813-1545 — still true, still open, and one citation has drifted

Each of the three "no party may write it" claims re-read against the working tree at `2a029eb`,
not carried forward from the record:

- **The shaper.** `agents/shaper.md:28` still reads "**No existing Circle may be modified in
  anticipated-circle mode**". Unchanged.
- **The orchestrator.** `agents/orchestrator.md` contains the string `Dependencies` **zero** times.
  Not merely absent from the write list — absent from the prompt.
- **The playmaker.** `agents/playmaker.md:10` still enumerates its Circle-record writes as the
  appended activation-proposal, dependency-warning and stale-Grounding sections. `b995049` widened
  this agent into the backlog store and did not touch its Circle-record write set.

**One citation has gone stale and is corrected here rather than in the body.** The closing section
says `circles/260813-0858-playmaker-maintains-backlog-store/_a_circle.md`. That record was
activated on 260813 at 09:33 and is now `_t_circle.md`; it will be `_c_circle.md` after closure.
The observation is unaffected — its `## Dependencies` section still names the documentation Circle
in prose without citing its record
(`archive/260817-1907-safe-cleanup-scoped/circles/260813-0910-documentation-matches-shipped-plugin/_b_circle.md`), exactly as
this record says. Cite the record as `*_circle.md` when this is picked up; the marker will have
moved again by then.

**The reverse-edge gap is now measurable rather than only argued.** The documentation Circle's
`_a_circle.md:148-156` states the relationship with both directory names. The playmaker Circle's
`_t_circle.md` `## Dependencies` still does not. A reader opening the playmaker Circle first sees
a dependency described in prose with no resolvable target, which is the failure the record
predicted, now observed on the pair it was filed about.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `agents/shaper.md:28` still forbids touching an existing Circle in anticipated mode, `agents/orchestrator.md` contains the word Dependencies zero times, and the playmaker-s write set is still the three appended sections. The concrete instance is now permanently broken: `circles/260813-0858-playmaker-maintains-backlog-store/_c_circle.md:95-96` still says the sibling directory name is to be added by the orchestrator once it exists, and the Circle closed without it. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
**Citation correction 260820-0530** (coder, plan step 8c). The closing section's citation of the
playmaker Circle's record was starred, which is what the 260813-1545 note above asked for. That note
therefore now reports a spelling the body no longer carries: it says the closing section *says*
`…/_a_circle.md`, and it does not. The note is left standing rather than rewritten, because the
citation it quotes is its own subject and starring it would delete the finding. What has changed is
only which section carries the marker: the body is a pointer and is starred, the note is a quotation
of what the pointer used to spell and stays literal. The record has since closed, so the note's
"it will be `_c_circle.md` after closure" has come true.
