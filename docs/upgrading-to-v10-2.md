# Upgrading to fusion v10.2

v10.2 changes what a Circle record holds, and it changes the template rather than the records
you already have. The `**Status:**` head field is gone from the template, and the
`## Directive` section stops carrying prose once the Circle has a spec. Both sections sit in
every record on your disk; neither is rewritten, and nothing reads the field that left.

Nothing in your workbench stops working when you upgrade, and no file is rewritten for you.
The one thing you may meet is a shaper run that halts on purpose, and `## What you have to do`
below says what to do about it.

Upgrading is the ordinary update — `fusion --update`, or the uninstall/install/reload sequence
on the marketplace path. The release is tagged `v10.2.0`, and `FUSION_REF=tags/v10.2.0` pins
exactly this version.

## The problem this release fixes

A Circle's Directive could not be corrected once the Circle was active. Reported by a user in
those words: there is no way to fix a mistake in a Circle's Directive after the fact.

The reason was a gap between three parties. The orchestrator was forbidden the `## Directive`
section by name. The shaper's only permission to write it was scoped to an *anticipated*
Circle, ahead of activation, and its dispatch parameter took an `_a_circle.md` path. And the
Rebalance gate's Revise-Directive option wrote the revised intent into a **new spec**, never
into the record — so after a revision the record stated one thing and the spec it pointed at
stated another. A typo, a wrong statement and a reversed intent all hit the same wall.

## What changed

**One invariant carries it:**

> A Circle record's `## Directive` holds prose if and only if its `**Active spec/plan:**`
> field reads the literal `(none yet)`. Once that field cites a file, the section holds a
> pointer to it.

Duplication is then impossible rather than maintained. That distinction is the whole design:
the alternative was to give the two copies a keeper, and the `**Status:**` field is the worked
proof that a kept copy decays — it duplicated the state marker in the filename and drifted out
of step with it in this repository's own workbench.

Three consequences:

| Change | What it means for you |
|---|---|
| `**Status:**` leaves the record template | Your existing records still carry the field. Nothing reads it and nothing will; the filename marker was always the truth where the two disagreed. |
| `## Directive` becomes a pointer once a spec exists | Applies to records written from here on. Your existing records keep their prose. |
| The shaper's third mode accepts an active Circle | This is the fix. A Directive that is wrong can now be corrected while the Circle runs. |

**The shaper's third mode gains a `**Scope:**` parameter**, `directive-only` or `spec`. It
defaults to `spec`, which is what every dispatch written before the line existed meant, so no
existing invocation changes behaviour. `directive-only` is the new one: it refines the record's
Directive prose and writes no spec.

The mode keeps the name `portfolio-activation` even though it now covers more than activation.
Renaming it would break every citation of the value, and a mode-detection value that no longer
matches its citations fails silently — it falls back to the heuristic and hands you a spec where
you asked for a record correction. The name under-describes the mode; that was accepted
deliberately.

## What you have to do

**Nothing, for the upgrade itself.** No workbench file is rewritten, no marker moves, and no
agent, skill or slash command left in this release.

**One case needs a decision, and only if you meet it.** If you have an *active* Circle whose
record still carries prose in `## Directive` **and** whose `**Active spec/plan:**` cites a file,
that record is in the state the invariant forbids. A shaper dispatched with
`**Scope:** directive-only` against it will **halt** and tell you the Directive lives in the
cited spec. That halt is correct: it is refusing to create a second copy.

Three ways forward, and fusion does not weigh them equally:

1. **Leave it, which is why no migration ships, and is the recommended course.** The record is
   readable, the spec is authoritative, and nothing breaks. The contradiction the old
   arrangement allowed is still there in that one record, but no new one can arise, and the
   record converts itself the next time something sanctioned writes to it — see 2.
2. **Re-shape it, and the conversion rides along.** A shaper run in the default `**Scope:** spec`
   does not halt on that record: it writes a new spec, points `**Active spec/plan:**` at it, and
   replaces the Directive prose with the pointer in the same command. This is what
   `rules/circle-records.md` means by an existing record converting on the next sanctioned
   write. Nothing here is migration work — it is ordinary re-shaping you would have done anyway.
3. **Convert it by hand**, if you would rather have the invariant hold across every record now.
   Replace the `## Directive` body with the pointer literal defined in
   `rules/circle-records.md` `### The Directive is a pointer once a spec exists`. One line.
   Weigh it against the reason fusion ships no migration: that record is the evidence of the
   contradiction the invariant was written to end, and converting it by hand deletes the
   evidence. It is the same trade the `**Status:**` field poses, where the shipped guidance is
   likewise to leave a record you are not transitioning exactly as it stands.

Terminal Circles — closed, bounded, superseded, deferred — are history and stay as they are.
Do not convert them.

## What did not change

Every other section of the Circle record, the state markers and their transitions, the
directory layout, and the portfolio. Activating a Circle through `/fusion:next` is unchanged in
what you do and in what you get, with one write fewer inside it: the step that renames the record
used to set `**Status:** active` in the same breath, and there is no longer a field to set. The
orchestrator's new permission to write `## Directive` is deliberately narrow: it may write one
fixed pointer sentence, only in the same command that puts a real path into
`**Active spec/plan:**`. It can remove the record's statement of intent and can never author
one. The prose stays the shaper's.

## Also in this release

Three things that need nothing done, though the last one changes what an agent writes next:

- **The hook sentences that name a record are now gated.** v10.1.0 already removed four
  fusion-internal identifiers from the two model-facing hook sentences, after a consuming
  project's orchestrator read one as a local record and relayed it to its user as evidence
  before catching itself. Nothing stopped the next edit putting one back, and that is what this
  release adds: a test asserting containment, that every record stamp and every git object name
  in an emitted sentence entered through that call's own input. Your project's own commit
  hashes are untouched by it — the gate asks where an identifier came from, not what it looks
  like.
- **Gate options must name what they decide, not its category.** Reported from the same
  project: a gate asked a user to choose between "a constraint that no longer exists" and "a
  capability that was never built", which names the kind of thing at stake and never the thing.
- **A project that ships nothing onward writes its own rule files and README in its own
  declared language.** The exempt-surface rule used to list paths — rule files, agent prompts,
  skill bodies, README and docs — as English in every project, on the ground that they ship to
  consuming projects. That is true of fusion's own repository and of nobody else's. The rule
  now states the criterion instead: code and operator strings are English everywhere, and
  beyond those only text a project ships to readers whose language it cannot know. If your
  project declares a non-English artifact language and ships nothing onward, its own `rules/`
  and `README.md` follow that declaration from here on. No file on disk changes; what changes
  is what the next agent writes into one.

## Where to read more

- `rules/circle-records.md` `### The Directive is a pointer once a spec exists` — the invariant
  itself, with the pointer literal and the reason no migration ships.
- `agents/shaper.md` — mode 3, the `**Scope:**` parameter and each of its four halts.
- `README-agents.md` `## Dispatch parameters` — the roster of run-time parameters, `**Scope:**`
  included.
- `docs/upgrading-to-v10.md` — the v10.0 migration note, if you are coming from v9 or earlier
  and skipped it.
- `/fusion:help` — install, update and configure, answered from your live installation.
