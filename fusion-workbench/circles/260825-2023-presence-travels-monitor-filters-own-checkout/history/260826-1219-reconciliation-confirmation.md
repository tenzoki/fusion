# Reconciliation — confirmation pass, C4, after `e66f7d5`

**Date:** 2026-08-26
**Agent:** reconciler (seventh pass over this Circle's count theme)
**Domain:** code
**Circle:** `circles/260825-2023-presence-travels-monitor-filters-own-checkout`
**Range confirmed:** `7774d56..e66f7d5` — the fix commit alone
**Tree state:** clean apart from `fusion-workbench/orchestrator-events.jsonl`, in flight all session
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>, checkout 5e8248d7

Tightly scoped. The full reconciliation stands at
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/history/260826-1132-reconciliation.md`
and was not re-run. This pass confirms the three named causes, the one residual, and looks once more
for a wrong count by a method the sixth pass did not use.

## The three causes, each re-measured

**1. `rules/workbench-tracking.md:59` — four readers, asymmetry intact. Confirmed.**

The line now reads "**Four readers apply that scoping, and three of the four drop what the fourth
keeps**", names `bin/fusion-events turns`, `bin/monitor` and the Phase-4 sequence diagram as droppers
and `bin/fusion-events presence` as the keeper. Three drop, one keeps: the asymmetry the paragraph
exists to draw survived the edit, and `git diff 7774d56..e66f7d5 -- rules/workbench-tracking.md` is a
one-line change, so nothing else in the paragraph moved.

The four were re-derived rather than accepted. `grep -rln orchestrator-events` over `rules agents
skills hooks/lib bin CLAUDE.md README*.md docs templates` returns 22 files, of which three are under
`hooks/lib/__tests__` — the executor's nineteen exactly. Each of the nineteen was scored by its
`checkout` mentions, and the four that apply the scoping are verified at source:
`hooks/lib/events-query.ts:146` `isOurs`, called by `countTurns` at `:400` (drops) and by
`otherParties` at `:250` where the sense is inverted (keeps); `bin/monitor:1291-1302` `_read_events`
(drops); `agents/orchestrator.md:915` with its rule at `:1376`, "Drop every line whose `checkout`
differs" (drops).

The exclusions hold too, and they are the part a count alone cannot carry. `skills/setup/SKILL.md`
and `skills/next/SKILL.md` call the helper and scope nothing themselves. `agents/orchestrator.md:558`
is the closest call and is correctly excluded: it *states* the scoping — "the `turn_start` events
**this checkout wrote**" — and then delegates, "`bin/fusion-events turns` is that definition's one
implementation. Read the figure from the helper". A definition that delegates is not a fifth applier.
`agents/curator.md:111` reads the log as corroborating evidence with no scoping and is the record's
undischarged second observation, correctly left open.

**2. The whole-file-grep count — both quantities, all five sites. Confirmed.**

*Two literal blocks at the anchor.* `git grep -n 'grep -c.*turn_start' 8119fc2 -- agents/ skills/
bin/ hooks/ rules/ CLAUDE.md 'README*' docs/ templates/` returns exactly two:
`agents/orchestrator.md:99` and `skills/setup/SKILL.md:377`.

*Five sites.* At `8119fc2` the two literal blocks plus three prose derivations, each read and each
deriving the figure for itself: `agents/orchestrator.md:547` ("the count of `turn_start` events …
since this session's `session_start`"), `agents/orchestrator.md:1111` (the `progress.turn` row), and
`agents/reconciler.md:21`. At HEAD the same five read the helper: `agents/orchestrator.md:101`,
`:558`, `:1122`, `skills/setup/SKILL.md:388`, `agents/reconciler.md:21`.

*All five shipped sites carry both numbers.* `grep -rn "five sites"` returns `CLAUDE.md:43`,
`bin/fusion-events:202`, `hooks/lib/events-query.ts:374`, `hooks/dist/lib/events-query.js:240`,
`hooks/dist/lib/events-query.d.ts:206`. Each continues "two literal whole-file `grep -c turn_start`
blocks … and three prose derivations". The two compiled copies are byte-identical to the source
docstring, read side by side. `grep -rn "four copies"` over `CLAUDE.md bin rules agents skills docs
hooks README*.md` returns nothing shipped; the only two hits are in `hooks/.build-staging/`, which
`.gitignore:16` excludes — local build scratch, not a site.

**3. Acceptance criterion 6 — seven, with its boundary. Confirmed.**

The `## Reconciliation Log` heading is line 296. Extracting every distinct defect-record path token
above it gives exactly **seven**; over the whole file, eleven. The clause states the boundary in its
own text: "The seven defect records this plan refers by path **above the `## Reconciliation Log`**".

*Whether the boundary makes it durable, asked plainly.* It is durable against the mechanism that
falsified the count last time and against nothing else. Post-closure appends land below the heading
by construction, so the count above it cannot move that way — `287f7ff` could not repeat itself. What
it does not close is the mechanism that produced `287f7ff` in the first place: criterion 5 sits above
the line and names a record path, so any future edit to criterion 5 increments criterion 6. Nothing
forbids that edit, nothing measures the number, and the two clauses are now coupled without saying
so. So the boundary makes the count **checkable** — a reader can now run the extraction and get a
yes or no, which was not true of a bare "seven" — and it does not make it **maintained**. On a plan
about to be closed, checkable is the right amount, and it postpones nothing that a live plan would
have to carry.

## The residual, confirmed

`circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1110_c_the-merge-driver-unsorts-a-second-event-log-reader-whose-repair-direction-is-positional.md`
now carries `Resolved: 97407df` appended beside the earlier `Resolved: referred (C4)`, the shape its
sibling `260823-1302_*_…` already had. The note's substantive claim was checked against source, not
accepted: `hooks/lib/events-query.ts:392-434` scopes by checkout, sorts by `ts`, anchors on the
**first** `session_start` naming this history file, and counts from that stamp — a timestamp inside
one checkout's block, not a position in the merged file. That is the record's second direction, and
the record's caution against the last-`session_start` derivation was followed.

## The fresh look — one wrong count, found from the referent

The sixth pass swept count words toward their referents and reported nothing further, naming its own
boundary. This pass went the other way: enumerate what **this Circle changed the cardinality of**,
then find the sentences that state each cardinality — and separately sweep the surfaces the sixth
pass excluded (`hooks/lib/__tests__`, `hooks/hooks.json`, `templates/`, `install.sh`, `.gitignore`).

Cardinalities this Circle moved, each traced to the sentences that count it:

| Referent | Moved | Sentence at HEAD |
|---|---|---|
| Readers applying checkout scoping | 3 → 4 | `rules/workbench-tracking.md:59` — correct |
| Turn-count derivation sites | 5 → 1 | five shipped sites, both quantities — correct |
| Emit templates carrying `<ID>` | 3 → 4 | no live prose states a number; four verified by `grep -rn '<ID>'` |
| SessionStart commands | 3 → 4 | `CLAUDE.md:29` says four; `hooks/hooks.json` holds four |
| `bin/` executables | 15 → 16 | no count stated; all 16 have a `CLAUDE.md` row; `.gitignore` has 16 `!bin/` exceptions |
| `hooks/lib` modules and entry points | +3 | `README-hooks.md:184`, `:189`, `:199` all present |
| Identity fields on an event line | 2 → 3 | **`agents/orchestrator.md:1279` — wrong** |
| Thin bash wrappers over `hooks/dist/` | 3 → 4 | `CLAUDE.md:46` — ambiguous, recorded not flagged |

**The finding.** `agents/orchestrator.md:1279` is the authoring home for the event-line contract. Its
heading now reads "**`person`, `checkout` and `session_id` stand on every line**" and two sentences
later "none of the three is composed anywhere else" — and the rule sentence between them still reads
"**A half that did not resolve makes its field absent rather than empty**". A half is one of two; the
set is three. `git log -L 1279,1279:agents/orchestrator.md` shows `8655ec2` wrote the paragraph with
two fields, where "a half" was exactly right; `72a9561` (this Circle, Turn 2) made it three and left
the word; `6deeb33` — the commit whose subject is *"the count of emit templates, of Turn-count sites
and of SessionStart commands is right in every place that states it"* — rewrote the same line and did
not see it. The three fields fail independently (`bin/fusion-identity` for the first two,
"**No line, no key**" at `:140` for the third), and two shipped files cite this paragraph as the
authority for the rule rather than restating it (`hooks/lib/events.ts:90`,
`rules/workbench-tracking.md:55`), so the generalisation is load-bearing. Filed as
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-1219_o_the-event-line-contracts-own-rule-sentence-says-a-half-of-a-set-this-circle-grew-to-three.md`.

**Why the sixth pass could not have found it, which is worth more than the instance.** The line was
inside its declared scope and its instrument was blind to it on two counts. `half` is not in the
`two`…`ten` word list, and the heading states its cardinality by **naming its three members** rather
than by any number at all. A count-word sweep cannot see a cardinality carried by a bare enumeration
or by *half*, *pair*, *both*, *either*, *neither*, *the other* — and the boundary the sixth pass
stated for itself (a count made wrong tomorrow by a commit touching neither) is not this boundary.
This one was made wrong by a commit that edited the very line, and a second commit rewrote it again
while correcting counts.

**Confirmed correct in the same sweep, from the referent side:** the log's own lines carry `person`
and `checkout` on all 56 written from this checkout this session and `session_id` on none, which is
correct rather than a defect — the hooks run from the installed copy pinned at session start, so
`hooks/session-id.ts` was not running, and "no line, no key" fired for the whole session. Acceptance
criterion 1 asks for person and checkout only and is met. The excluded surfaces yielded nothing:
`hooks/lib/__tests__` count words all resolve, `hooks/hooks.json` holds the four commands `CLAUDE.md`
claims, `templates/` and `install.sh` state no count of this mechanism, and `.gitignore`'s 16 `!bin/`
exceptions match the 16 files.

**Recorded, not flagged.** `CLAUDE.md:46` says "There were three of these thin wrappers until
2026-08-15 … `bin/fusion-review-coverage` is the other survivor." Four scripts carry the identical
"The work is `hooks/dist/…`, resolved relative to this script" boilerplate at HEAD, and all four
originals were created 2026-08-11, so four existed on the date the sentence counts three. It is not
clearly wrong — "these thin wrappers" may scope to the drift-and-coverage report family, which is
three with one other survivor — and it predates this Circle. What this Circle did was add a member
under the broad reading and walk past the sentence three rows below its own new row. Carried in the
filed record as a companion observation.

## Tracking updates made

- One new defect filed, above. No marker moved, no plan status changed, no review annotated.
- `## Coherence` in
  `circles/260825-2023-presence-travels-monitor-filters-own-checkout/history/260825-2123-orchestrator-session.md`
  gained a **Confirmation pass** subsection, appended below the existing section, which was not
  rewritten.
- The Circle record and `.active-circle` were not touched. Nothing staged, nothing committed.
