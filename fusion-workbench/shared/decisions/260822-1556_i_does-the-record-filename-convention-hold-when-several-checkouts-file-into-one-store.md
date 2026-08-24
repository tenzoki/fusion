# Does the record-filename convention hold when several checkouts file into one store?

---
**Domain:** code
**Filed by:** reconciler, session-end pass over `370bfc5..9f65463`
**Cross-references:** `shared/decisions/260807-0158_*_how-is-a-unique-record-filename-obtained.md` (the settled answer this record asks about); `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` (the arrangement that narrows its evidence base); `shared/issues/260819-1511_*_a-bare-stamp-citation-is-ambiguous-when-two-records-share-it-and-one-turn-log-resolves-to-the-wrong-record.md` (the failure mode, already observed once under one writer)

---

## Question

`260807-0158` settled that no filename-minting helper is authorised and that
`YYMMDD-HHMM_S_<topic>.md` stands. It settled it on a measurement — the premise that the stamp
collides "was measured false" — and that measurement was taken over a corpus one person wrote from
one checkout. The spec approved on 2026-08-22 puts several people on several checkouts filing into
one record store and merging through git, which is precisely the input the measurement did not
cover. Two records minted in the same minute in two checkouts do not collide as *files* until the
merge, and then they collide as *citation targets*: the corpus already carries 84 stamps held by two
or more files under one writer, and `260819-1511` records one turn log that resolved to the wrong
record because of it.

It must be asked before C3 rather than after, because C3 changes every record template and is the
last cheap moment to change what a record is named. `260807-0158` is `_a_` and is active Grounding,
so the question is whether its answer survives the Directive or is narrowed by it.

## Options

1. **The answer stands; nothing changes.** The stamp plus the topic slug plus the wildcarded marker
   is already the citation form, and two records sharing a stamp are distinguished by their slug.
   - Pros: no mechanism, no corpus-wide rename, and the citation form that resolves the ambiguity is
     already ratified and already enforced by the workbench citation gate.
   - Cons: the ratified form is followed in practice and, as `260807-0158`'s own reconciliation note
     says, "written down nowhere it can be read as normative"; a convention that survives on habit is
     the one that breaks first when the number of authors goes from one to several.
2. **Write the citation form down as normative, and leave the filename alone.** Put the
   stamp-plus-slug-plus-wildcard rule into `rules/fusion-workbench-conventions.md` as a rule rather
   than as practice, and say explicitly that a bare stamp is not a citation.
   - Pros: closes the failure `260819-1511` measured without touching a single filename or minting
     anything; costs bytes on a rule surface that has 3 509 of head-room.
   - Cons: the always-on rule core is charged to every dispatch of every agent, and the room there
     was deliberately not spent by C0.
3. **Give the filename a per-author component.** The person field C3 introduces also enters the
   filename, so two checkouts cannot mint the same name.
   - Pros: collisions become impossible by construction rather than by care.
   - Cons: the user foreclosed it at the round-3 gate — the identifier goes in the record body and
     never in a filename, because a dead filename component is a reference that designates nothing.
     Taking this option reverses a stated user condition and would rename nothing while splitting the
     corpus into two naming eras.

## Constraints

- Whatever is chosen must not put an identifier in a filename: the user's round-3 condition is
  explicit and covers every option here.
- It must not require a corpus-wide rename. Roughly a thousand records carry the current pattern and
  every citation of each is a resolvable target the workbench citation gate checks on every run.
- It must be answerable without knowing how many people will actually use the arrangement, since
  that number is not known and the answer binds before it is.

## Recommendation

`inference:` Option 2, and the reasoning is that the failure this record is about has already
happened once under the easiest possible conditions. The measurement in `260807-0158` is not wrong
and its answer is not overturned by anything here; what the Directive changes is the rate, and the
cheapest response to a higher rate of a known failure is to make the mitigation normative rather
than habitual. Option 1 is defensible and is what the project is doing today. Option 3 is foreclosed
and is listed to record that it was considered and why it cannot be taken.

This is the user's call and belongs at C3's planning gate, beside the two decisions the spec already
lists as pending there.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:

---
Answered: `circles/260824-0530-record-attribution-and-circle-claim/planning/260824-0613_*_c3-attribution-on-records-and-a-claim-on-the-circle.md` step 2 — option 2, taken at C3's planning gate: the citation form is written down as normative rule text and no filename changes.

## Answer (user, 260824)

**Option 2. The stamp-plus-slug-plus-wildcard citation form becomes a rule in
`rules/fusion-workbench-conventions.md` `## Filename Patterns`, and a bare stamp is stated there not
to be a citation. No filename pattern changes, no name is minted, and nothing in the corpus is
renamed.** The rule text itself lands at step 6 of the plan cited above; this record carries the
answer only.

### The repair attaches to how a record is cited, not to how it is named

Several checkouts filing into one store raise the rate at which two records share a stamp. They do
not create the sharing: it exists today, under one writer, and is measured below. What breaks when a
stamp is shared is a citation that names a record by the stamp alone, because a stamp that names two
files names neither. So the defect is in the citation grammar and the repair belongs there. That is
one sentence of rule text rather than a mechanism, and it is why the answer costs no rename.

### The failure is observed, not projected

`shared/issues/260819-1511_*_a-bare-stamp-citation-is-ambiguous-when-two-records-share-it-and-one-turn-log-resolves-to-the-wrong-record.md`
records one Turn log that cited a shared stamp and resolved to the closed record of the pair while
the open one was the live obligation. A citation that resolves to the wrong record of the right
shape reads as correct, which is why this class is worse than a dangling pointer and why habit is
not an adequate defence for it.

### Re-measured, 260824

The `84` this record's own Question states is `260807-0158`'s figure, taken on 2026-08-07 over a
corpus of 579 files. **Re-measured today it is 111, not 84.** The corpus has grown to 876 record
files since, and the count of multiply-occupied stamps grew with it.

| Check | 260807-1925 | 260824 (this pass) |
|---|---|---|
| Record files of the `YYMMDD-HHMM_S_<topic>.md` shape under `circles/` plus `shared/` | 579 | 876 |
| Distinct stamps among them | not measured | 545 |
| Stamps carried by two or more files | 84 | **111** |
| Files sitting on such a stamp | not measured | 442 |
| Files sharing a full basename, state marker normalised | 0 | 0 |

Measured with, from the workbench root:

```
find circles shared -type f -name '*.md' \
  | grep -vE '/(archive|stashes|\.migration-v2-backup)/' \
  | xargs -n1 basename | grep -E '^[0-9]{6}-[0-9]{4}_' \
  | sed -E 's/^([0-9]{6}-[0-9]{4}).*/\1/' | sort | uniq -c | awk '$1>1' | wc -l
```

The last row is the one that keeps `260807-0158` intact: no two records share a full basename, so
the naming convention is not failing and that decision's measurement is not overturned by anything
here. Half the corpus, 442 of 876 files, is nonetheless unreachable by a bare stamp. The direction is
what the answer turns on, and the direction is up before a single second checkout exists.

### Option 3 was foreclosed by a stated user condition, not judged against the others

The identifier goes in the record body and never in a filename. That condition was attached by the
user at the round-3 gate and is stated in
`shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md:173` `### C3`, with its
reason: a dead field in a body is a historical note, while a dead component of a filename is a
reference that designates nothing. Option 3 puts the person into the filename, so it was ruled out
by that condition before any comparison of its merits ran. It is recorded here, as it is in the
option list above, so that a later reader meets it as a considered-and-excluded option rather than
as an oversight to reopen. Its stated advantage stands unrefuted: collisions would become impossible
by construction rather than by care. That is not what defeated it.

### Option 1 is what the project does today, and is defensible on its own terms

Nothing is broken by leaving the rule unwritten. The stamp-plus-slug form is followed throughout the
corpus, and every full-filename citation in it resolves. Option 1 fails only on the argument its own
Cons row makes: the convention survives on habit, and habit is what breaks first when the number of
authors goes from one to several. Option 2 takes nothing away from option 1; it is option 1 with the
practice written where it can be read as normative.

### Why writing it down is a repair and not a dodge

A gate for this form already exists. `hooks/lib/__tests__/helpers/citation-scan.ts` parses
`<stamp>_*_<slug>.md` and its store-, Circle- and `shared/`-prefixed variants, resolves each token
against the workbench, and reports both what it matched and how many things it matched. A bare stamp
produces no token in that grammar at all, so the gate is silent over exactly the citations that can
mislead: green because it cannot look, which is a different fact from green because they are right.
Writing the form down moves a citation from outside that grammar to inside it. `verified:` by
reading the parser's header and grammar at HEAD. Whether the gate should additionally **fail** on an
ambiguous resolution is not decided here, and this answer changes no test.

### The cost the answer accepts

Bytes on the always-on rule core, charged to every dispatch of every agent, which is head-room C0
deliberately did not spend. The answer accepts that charge for one sentence of rule text, against a
failure that has already occurred once.

### What this unblocks

`shared/decisions/260807-0158_*_how-is-a-unique-record-filename-obtained.md` set a condition for
itself and restated it in three successive reconciliations: it moves to `_i_` when the
cite-by-full-filename rule lands in `rules/fusion-workbench-conventions.md` `## Filename Patterns`.
Taking option 2 is what meets that condition. That record's marker moves at step 12 of the plan, on
the commit that lands the rule text, and not in this step.

### Marker

`_a_` and not `_i_`. The answer is on disk; no rule text has been written, no gate has changed, and
`## Filename Patterns` at HEAD still carries no citation rule. Step 6 of the plan writes the
sentence, and this record moves to `_i_` then.

---
Implemented: 2b055a0 — the citation form is normative rule text in `rules/fusion-workbench-conventions.md` `## Filename Patterns`, and no filename pattern changed.

## As realised, 260824

The hash was checked against its own diff with `git show`, not read off its subject line. One paragraph was added to `## Filename Patterns`, directly under the `<sender>` rule:

> **Cite a record by its full filename with the state marker wildcarded**, `YYMMDD-HHMM_*_<topic>.md`, so the citation survives every marker move. **A bare stamp is not a citation**: 111 of the 545 stamps in fusion's own corpus are carried by more than one file, measured 260824 over 876 records. No two records share a full basename once the marker is normalised, so the naming convention holds and only the citation form was ever at fault. **No pattern above changes.**

It carries the re-measured figures from this record's own table, 111 of 545 across 876 files, and the row that leaves `shared/decisions/260807-0158_*_how-is-a-unique-record-filename-obtained.md` intact, zero files sharing a full basename once the marker is normalised.

**The three conditions this answer set for itself were checked against the tree and all hold.** `git diff e209011..HEAD -- rules/fusion-workbench-conventions.md`, over the Circle's whole commit range, is additions with one exception, and that exception is the `**Filed by:**` template line gaining its person half. The artifact-kind table is untouched. No identifier entered a filename, no corpus-wide rename ran, and nothing mints a name.

**What the answer said it would not change, it did not.** No test was altered by `2b055a0` beyond the two regenerated goldens and one re-approved citation baseline, and the question of whether the citation gate should additionally fail on an ambiguous resolution is still undecided and still unfiled.

**`### What this unblocks` is discharged in the same pass as this line.** `shared/decisions/260807-0158_*_how-is-a-unique-record-filename-obtained.md` moves to `_i_` on the same commit, which is the condition it set for itself and restated in three reconciliations.
