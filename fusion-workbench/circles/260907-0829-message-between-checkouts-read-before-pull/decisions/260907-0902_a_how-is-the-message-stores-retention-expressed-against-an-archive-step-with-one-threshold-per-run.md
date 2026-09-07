# How is the message store's retention expressed, against an archive step with one threshold per run?

---
**Domain:** code
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`260907-0840-spec-review-message-between-checkouts.md` `### 5. The retention answer is inoperative as designed`, the analysis this record was filed from;
`skills/archive/SKILL.md` `## Tier definitions`, `### Tier 1 — Terminal Circles + terminal markers in the shared store`, `### Tier 2 — Tier 1 + aged shared reviews`;
`skills/cleanup/SKILL.md` `## Step 4 — Archive with safe defaults`;
the Circle record `260907-0829-message-between-checkouts-read-before-pull`, whose Directive names thirty days and a tier of its own

---

## Question

The Directive says an entry older than thirty days leaves the live store "through the existing
archive step, under a tier of its own", and the consultation before it called that an addition
to an existing pass rather than a new mechanism. Measured, it is neither.

Three facts stand in the way. The archive step holds **one** age threshold per run, parsed once
and applied to every aged bucket in that run, so no per-store number is expressible.
`/fusion:cleanup` runs **tier-1 only**, autonomously, while every age-selected bucket sits in
tier-2 or tier-3, which only a human starts by hand. And tier-1's buckets are selected by a
state marker that says the thing is finished, where a message carries no marker at all.

The question must be answered now because it decides whether the store is pruned by the
ordinary run or not at all, and the record that chose age over read marks did so on the promise
that something would prune it.

## Options

1. **The message bucket joins tier-1 and takes the run's own threshold.** No per-store number;
   entries age out at whatever the run was given, fourteen days by default.
   - Pros: the ordinary cleanup run prunes the store, which is the only thing that makes the
     retention promise real. One edit, a row in the tier-1 table. No change to how the
     threshold is parsed or applied.
   - Cons: tier-1 gains its first age-selected bucket, so its "safe by construction" reading
     stops meaning "everything here carries a marker saying it is finished" and starts meaning
     "everything here is finished or old". The thirty days the Directive names becomes fourteen.
2. **The archive step gains a per-bucket threshold, and the message bucket joins tier-1 at
   thirty days.**
   - Pros: the Directive's number survives, and a later store wanting its own lifetime has a
     mechanism to ask for one.
   - Cons: a second number where there is one today, in a step whose whole argument is a
     positive enumeration that cannot go silently out of date. It is a mechanism change, priced
     as a table row.
3. **The message bucket joins tier-2 or tier-3 at thirty days.**
   - Pros: fits the existing shape exactly, since those are where age-selected buckets already
     live, and needs no change to any threshold.
   - Cons: `/fusion:cleanup` never runs those tiers, so nothing prunes the store unless a human
     invokes the archive step by hand. The store grows without bound in ordinary use, which is
     the outcome the retention rule exists to prevent.

## Constraints

- Whatever is chosen must be reached by the autonomous `/fusion:cleanup` run, or the retention
  promise is not kept.
- A message carries no state marker, so age is the only signal available to select it.
- The archive step never deletes and never touches git; it moves files and the housekeeping
  commit carries the move. No option changes that.

## Recommendation

Option 1. It keeps one number in the mechanism and buys the pruning that matters. The cost is
the honest one to state: tier-1's definition widens, and it should be widened in the tier's own
text rather than left to be inferred from a new row.

---
**Ruled by the user on 2026-09-07, in chat: fourteen days is acceptable, which is option 1.**
The marker stays `_o_` because only an orchestrator session may move it to `_a_`
(`260905-1042_*_may-a-dispatched-agent-perform-the-open-to-answered-transition-at-all-and-under-which-bound.md`),
and the analyst filing this record is not one. The relay is owed to the next such session.

**What the ruling carries with it.** The Directive's "thirty days" and "a tier of its own" both
fall and the Circle record is owed the correction. `skills/archive/SKILL.md` `### Tier 1` gains
a row and a sentence widening the tier's stated basis from terminal markers to terminal markers
and age, since the row alone would leave the heading claiming something the table no longer
does. An entry can now be archived before a checkout dormant longer than the threshold ever
reads it; that was already the accepted cost of choosing age over read marks, and the shorter
threshold sharpens it.

---
Answered: `260907-0902_*_how-is-the-message-stores-retention-expressed-against-an-archive-step-with-one-threshold-per-run.md` — option 1, the bucket joins tier-1 at the run own threshold of fourteen days, and the tier stated basis widens in its own text from terminal markers to terminal markers and age; ruled by user, Kai Stalmann <ks@qantr.com>
