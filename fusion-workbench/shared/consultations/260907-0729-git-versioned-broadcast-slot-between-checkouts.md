# Consultation: a git-versioned message slot between checkouts, and a skill that reads it

**Date:** 2026-09-07 07:29
**Revised:** 2026-09-07 07:33, after the user accepted the four corrections below. They are
written here as the settled design rather than as proposals; the paths that were rejected
keep their reasoning, because the reason is what stops the idea coming back.
**Revised:** 2026-09-07 07:56. The user ruled on the store: a store of its own, at
`fusion-workbench/shared/forum/`, named for an exchange that runs in both directions rather
than for a broadcast. Section 6 carries the ruling and its reasoning. The decision record
still stands at `_o_` and its marker moves in an orchestrator session, which is the only
party that relays a user ruling into a record
(`260905-1042_*_may-a-dispatched-agent-perform-the-open-to-answered-transition-at-all-and-under-which-bound.md`).
**Status:** Complete
**Requested by:** user, in chat

## Question

The user proposes replacing the current copy-and-paste handoff between two people working
one project with a git-versioned slot in the workbench, for example
`fusion-workbench/broadcast/`. A session would write a two-part message there: a compact,
context-free part in the project's chat language for the person on the other side, and a
detailed English part for that person's agent. A second skill, `hark`, would read only that
folder to decide whether a fetch is owed. Three questions were asked: is the idea sound, is
it buildable, and what would improve it.

## Context

Four findings establish where the project actually stands. Each was read rather than
recalled.

**No push-time message mechanism exists.** A grep for `Slack`, `handoff`, `copy-paste` and
their German equivalents across `agents/`, `skills/`, `rules/`, `docs/`, the READMEs and
`CLAUDE.md` returns nothing that produces such a message. `/fusion:cleanup` pushes twice
(`skills/cleanup/SKILL.md` `## Step 2 — Commit the real work in meaningful splits, then push`
and `## Step 7 — Commit the housekeeping artifacts, then push`) and reports to the terminal
at `## Step 8 — Report`, which is chat only and does not persist. The documented state of
the art is `CLAUDE.md`, the Bus-protocol convention: concurrent sessions exchange work
through the user, by copy-paste. So the premise is right, and the mechanism being replaced
is the absence of one.

**What already travels between two checkouts.** Class R1 records (`circles/`, `shared/`)
carry every history file, decision, defect, plan and review, one writer per file. The
Circle record carries a `**Claim:**` field naming the person and checkout that activated it.
`orchestrator-events.jsonl` is class R2 with `merge=union` and holds one line per dispatch
with `person`, `checkout`, `session_id` and `history_file`. The four classes are authored in
`rules/workbench-tracking.md` `## The four classes`.

**What already reads that traffic.** `bin/fusion-events presence` reports, at
`/fusion:setup` `## Step 0c`, which other people and which further checkouts of your own
started a session inside a window, and on which Circle. Its reach is explicitly
`scope=pulled`. `/fusion:setup` `## Step 0k` reports how far behind its upstream the
checkout stands and refuses to fetch, for reasons written into that step: it would be the
one network call in an otherwise local sequence, it writes remote-tracking refs before the
user has agreed to anything, and against a remote wanting credentials it blocks a
non-interactive shell at a prompt (issue
`260905-1850_*_setup-does-not-notice-that-the-checkout-is-behind-its-remote.md`).

**A per-checkout high-water-mark mechanism already exists.** `bin/fusion-cadence-anchor`
keeps arbitrary `KEY=value` marks in `fusion-workbench/.cadence-anchors`, preserves unknown
keys, and offers `changed-files <key> [<pathspec>]` and `changed-since <key> [<pathspec>]`.
Its own header states that a future step adds its own key. The pathspec argument is exactly
the read-the-delta primitive a `hark` skill needs, and it is already built.

## The gap this fills

Presence answers *that* somebody worked and on which Circle. Nothing answers *what they
concluded* short of reading their records after a pull. Between those two lies the message
the proposal wants, and no shipped surface occupies it. The design is worth building.

## The settled design

Six statements. The first four are the accepted corrections, the fifth is the part of the
original proposal that needed no change, and the sixth is the placement the user ruled on.

### 1. The write step lives in `/fusion:cleanup`, immediately before Step 7

Push already lives in that pipeline, in two named steps. The message belongs immediately
before `## Step 7 — Commit the housekeeping artifacts, then push`, so the entry rides the
housekeeping commit and the push that already exist, with no new git operation anywhere. The
pipeline already carries a single user gate and a `--only <step>` selector, so a standalone
invocation for a session that pushes outside cleanup costs nothing extra in design.

**The message is written on a gate, not on every run.** A store that receives one entry per
session regardless of whether anything happened trains both people to stop reading it. The
draft goes to the user with the question of whether to send it, which is the shape the
pipeline's existing gate already has.

### 2. The second part follows the artifact language

The project's artifact language governs every persisted record
(`rules/fusion-workbench-conventions.md` `## Project language`). Fixing one store to English
would create a third language rule beside the two declarations, and in a project that
declares German for both surfaces it would produce a store whose two halves differ in
language for no reason the reader can see. The agent on the receiving side reads that
project's decisions, plans and histories in the artifact language already; the message is not
a harder case.

The rule is therefore the one already written: the human part follows the chat language, the
pointer part the artifact language. In this repository those resolve to German and English
respectively, which is what the proposal asked for, obtained from the existing cascade
instead of a new declaration. In a project where both are German, both halves are German, and
nothing needs a per-store exception. The same reasoning settled which parts of the language
rule every dispatch carries
(`260827-1056_*_which-parts-of-the-language-and-backlog-rules-does-every-dispatch-still-carry.md`).

### 3. The second part is a pointer block, not a narrative

A detailed second narration of the session is what the session history file already is.
Building a second one is the reuse defect `rules/critical-stance.md` `## 2. No premature
solutions: the Research Gate` names, and it carries the usual cost of a duplicate: the two
disagree the first time somebody edits one.

The pointer block carries the commit range, the history file's basename, the records filed by
their citations, and one or two sentences on what the receiving side should not redo. It is
short, it cannot drift from what it points at, and it does the orienting job the proposal
wanted from a narrative.

### 4. `hark` fetches, and its value is reading without merging

The original proposal has `hark` read the folder to decide whether a fetch is needed, which
inverts the dependency. Nothing reads a remote file without fetching first, and git transfers
per ref rather than per path, so a scoped store buys reading economy and not transfer
economy.

What the store does buy is worth more than the saving it does not: after a fetch,
`git show <upstream>:fusion-workbench/shared/forum/<file>` reads the other side's message
**without merging the working tree**. You learn what arrived and then decide whether to pull,
which is the decision the proposal set out to support. That is the reason the store exists,
and it belongs in the skill body's own first paragraph.

`hark` is also the right home for the fetch that `/fusion:setup` `## Step 0k` deliberately
refused. That refusal was about a mandatory first step hanging on a credential prompt. A
skill the user invokes by name is interactive, expected to take a moment, and free to block
on credentials. The two decisions are consistent rather than in tension, and the reasoning
should cite Step 0k so a later reader does not read `hark` as overturning it.

### 5. The human part needs no new rule, only a size cap

The context-free requirement is already written. `rules/user-facing-output.md`
`## Vocabulary` forbids fusion-internal terms in anything a person reads, and the stranger
test in `## Self-review before sending: the readability gate` is precisely the check for
"would a reader who has never seen this session understand this sentence". Cite those rather
than restating them, and add the one thing they do not carry: a hard line cap, enforced in
the skill body.

### 6. The store is `fusion-workbench/shared/forum/`

The user ruled for a store of its own and considered placing it at the workbench root, on the
reasoning that a forum is shared by its nature and plays a different role from the other
stores under `shared/`. Both halves of that reasoning are right, and neither leads to the
root.

**`shared/` does not mean "shared between people".** It means "belonging to no unit of work",
which is the second answer of the Origin Rule
(`rules/fusion-workbench-conventions.md` `## Origin Rule (Herkunftsregel)`). Everything a
project tracks is shared between its checkouts, `circles/` included, so sharing is not what
the directory name selects on. The different role is likewise already accommodated: five
stores under `shared/` are not artifact kinds at all, and `checkouts/` is the near precedent,
described in `## fusion-workbench Layout` as naming an instance of the project rather than
anything done in one. A forum names the exchange between those instances. It is the same
class of store, and it needs no new level of the tree to say so.

Three costs make the root the wrong place, each read rather than assumed.

- **The root has a stated criterion the forum does not meet.** `## fusion-workbench Layout`
  reserves it for what the hooks, the dashboard and the `bin/` helpers read at fixed
  root-relative paths, and marks those surfaces as not negotiable. No record store sits
  there, and no hook or helper reads a forum entry.
- **A third top-level store makes the Origin Rule incomplete.** The rule has exactly two
  answers, the Circle whose Directive caused the artifact and otherwise `shared/`, and its
  first corollary makes `shared/` total by construction. A third destination reopens the case
  split that `rules/critical-stance.md` `## 4. A case split is disjoint and complete, or the
  question is cut wrong` requires to stay disjoint and complete.
- **Nothing would archive it.** `skills/archive/SKILL.md` states that its per-file passes only
  ever touch the shared store, and that everything its tiers enumerate is either a whole
  terminal Circle or lives in `shared/`. A root store falls outside both. It would also need
  a new row in the class table of `rules/workbench-tracking.md`, whose R1 row names
  `circles/`, `shared/`, `archive/` and `stilwerk/` explicitly and whose partition is
  asserted to leave every entry in exactly one class.

**The name is `forum`, not `broadcast`**, because the traffic runs in both directions and each
checkout is a writer as well as a reader. One expectation the word sets is not met and should
be stated in the skill body rather than discovered: there are no threads and no replies. Each
session writes its own file, and a response is the next session's own entry.

## What was rejected, and why the reason has to survive

### A hook at push time, on two independent grounds

The first ground is that the trigger is undecidable. A `PreToolUse` or `PostToolUse` hook
sees the text of a `Bash` command (`hooks/hooks.json`, both matchers name `Bash`). Deciding
from that text whether the command pushes is the same question fusion's branch-switch guard
answered from command text until it was deleted on 2026-08-09, after five patches, a sixth
open entrance and 24 consecutive false blocks against the agents' own verification commands.
`rules/critical-stance.md` `## 4. A case split is disjoint and complete, or the question is
cut wrong` is written from that case, and the binding record is
`260807-0825_*_should-the-guard-predict-shell-writes-or-enforce-them.md`. A push reaches the
shell through an alias, a `&&` chain, a script, a Makefile target or `gh`, and a classifier
sees none of that.

The second ground is independent of the first and would sink the design even with a perfect
trigger: a hook has no model. It can observe and it can write an event, and it cannot author
a paragraph a person will read. The most a hook could contribute is an advisory saying that
a push happened and no message was written, and that advisory rests on the undecidable
classification the first ground rejects.

A git `pre-push` hook fails harder. `.git/hooks` does not travel with a clone, installing it
means writing `core.hooksPath` in every checkout, and it still cannot author prose.

## What the ruling leaves open

The store question is filed as
`260907-0733_*_does-the-cross-checkout-message-get-its-own-store-or-two-sections-in-the-session-history.md`
and the user answered it on 2026-09-07 in favour of the separate store, on the audience
argument the record recommends: a history file is read during archaeology and has no size
discipline, a message is read once and soon. The record still carries `_o_` because moving it
to `_a_` is the orchestrator's act alone
(`260905-1042_*_may-a-dispatched-agent-perform-the-open-to-answered-transition-at-all-and-under-which-bound.md`).
Until that happens, this consultation is where the ruling is written down.

The two questions the record named as downstream of that answer are now the open ones, and
both belong in the shaping rather than in a further record:

- **What archives a forum entry, and after how long.** The store is not covered by any tier
  today, and the archive step's per-file passes reach `shared/`, so the tier is an addition
  to an existing pass rather than a new mechanism.
- **Per session or per push.** `/fusion:cleanup` pushes twice, and the write step sits before
  the second of those. Whether a run that pushed work and then housekeeping leaves one entry
  or two decides the filename shape.

## Costs to price in before building

**Retention.** The store grows one file per session forever and nothing archives it today.
The archive step needs a tier rule for it, and `hark` must read the delta rather than the
store, keyed on a `bin/fusion-cadence-anchor` key with the store as its pathspec. Reuse that
helper; a second mark file would be the duplicate its header already warns against.

**Resolver keys.** The store means `OUT_FORUM` and `SCAN_FORUM` cases in `bin/fusion-paths`,
unconditionally shared like `OUT_CONSULT`, and a line in the two shared-only paragraphs that
already enumerate such stores: the resolver's own header comment and
`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`. The key set is derived
by grepping the consumer's prompt, so the skill body naming the key and the resolver case
land in the same commit.

**Shipped-text growth.** `skills/*/SKILL.md` has 20 000 bytes of head-room against its
baseline and `agents/*.md` has 18 000 (`hooks/lib/__tests__/surface-growth-bound.test.ts`).
A `hark` body plus a cleanup step spends from the first of those. Measure before writing, or
`npm test` goes red on size rather than on content.

**Bookkeeping cost.** The project's own audit of 2026-08-27 found overhead already dominating
development. A per-session authored artifact adds to that. Cap the entry hard, in the order
of fifteen lines with the human part at six, and enforce the cap in the skill body rather
than hoping for it.

**One release behind.** Any `bin/` helper this work adds is absent from the installed copy
until `fusion --update`, so every call site takes its `[ -x ]` miss branch for the rest of
the session that adds it (`260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`).
A `hark` skill is likewise not dispatchable in the session that writes it. Plan the proof run
for the following session.

## Recommendations

1. **Relay the ruling into the filed decision** at the next orchestrator session, so the
   record stops reading as an open question the shaping already answered.
2. **Shape this as one Circle**, not two. The write side and the read side share a file
   format and a retention rule, and splitting them produces a store nobody reads or a reader
   with nothing to read. The retention rule belongs to the same unit of work, not to a
   follow-up.
3. **Build to the five statements above**, and carry their reasoning into the shipped text
   where a later reader will meet it: the hook rejection into the skill body's own notes, the
   Step 0k relationship into `hark`'s, the language rule as a citation rather than a restatement.
4. **Do not name the store in anything the user reads.** The rule against internal vocabulary
   in chat applies to the new store as much as to the existing ones
   (`rules/user-facing-output.md` `## Vocabulary`).

## Sources

- `CLAUDE.md`, the Bus-protocol convention and the `bin/fusion-cadence-anchor` layout row
- `skills/cleanup/SKILL.md` `## Step 2`, `## Step 7`, `## Step 8 — Report`
- `skills/setup/SKILL.md` `## Step 0c`, `## Step 0k — Whether this checkout is behind its upstream (advisory)`
- `skills/archive/SKILL.md`, the statement that the per-file passes only ever touch the shared store
- `hooks/hooks.json`, the `PreToolUse` and `PostToolUse` matchers
- `bin/fusion-cadence-anchor` header, `## The keys the pipeline uses today` and `## Subcommands`
- `bin/fusion-paths`, the `OUT_*` case table
- `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`, `## Origin Rule (Herkunftsregel)`, `## Project language`, `## Filename Patterns`
- `rules/critical-stance.md` `## 2. No premature solutions: the Research Gate`, `## 4. A case split is disjoint and complete, or the question is cut wrong`
- `rules/user-facing-output.md` `## Vocabulary`, `## Self-review before sending: the readability gate`
- `rules/workbench-tracking.md` `## The four classes`
- `hooks/lib/__tests__/surface-growth-bound.test.ts`, the head-room table in its header
- `260807-0825_*_should-the-guard-predict-shell-writes-or-enforce-them.md`
- `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`
- `260905-1850_*_setup-does-not-notice-that-the-checkout-is-behind-its-remote.md`
- `260827-1056_*_which-parts-of-the-language-and-backlog-rules-does-every-dispatch-still-carry.md`
- `260905-1042_*_may-a-dispatched-agent-perform-the-open-to-answered-transition-at-all-and-under-which-bound.md`
- `260907-0733_*_does-the-cross-checkout-message-get-its-own-store-or-two-sections-in-the-session-history.md`
