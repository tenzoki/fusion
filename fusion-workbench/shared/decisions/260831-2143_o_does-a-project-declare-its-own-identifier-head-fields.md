# Does a project declare its own identifier head fields, the way it declares its citation-bearing paths?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260831-2142_*_which-property-separates-a-head-field-identifier-from-a-head-field-citation.md` (the choice this one is the recurrence of); `260831-0032_*_which-mechanism-enumerates-a-declared-citation-path-and-what-happens-where-git-will-not-answer.md` (the precedent mechanism); `fusion.json` `_citations` (the key the precedent shipped)

---

## Question

If the head-field exemption is decided as an enumeration of labels compiled into fusion, the
enumeration is fusion's and a consuming project cannot extend it: a project's own identifier head
field produces false dangling rows until a fusion release ships the label, and until the project
runs `fusion --update`.

This is the second time in two days that a consuming project has been blocked by fusion's citation
grammar over a judgement only that project can make. The first time, the answer was to let the
project write the judgement down: `citations.extraPaths` in `fusion.json`, landed 2026-08-31,
answers "which of your non-Markdown files carry citations" because outside Markdown fusion cannot
decide it. "Which of your head-field labels hold identifiers rather than pointers" is the same class
of question and has the same shape of answer.

The question is whether that lever is built, and when.

## Options

1. **Ship it with the head-field repair.** `citations.exemptHeadFields`, an array of label strings,
   merged per leaf over a fusion default.
   - Pros: the recurrence stops at its second instance rather than its third.
   - Cons: a configuration key, a loader branch, a scanner parameter and template documentation, all
     added to a repair whose whole point is to unblock somebody today. The repair does not need it:
     the reporting project's field is `Bus session`, which is fusion's own retired label, so fusion's
     shipped list clears their rows with no configuration at all.
2. **Leave it until a project's own label arrives.** Ship the enumeration, and open this key on the
   day a project has a label fusion cannot enumerate for it.
   - Pros: no mechanism built against a case nobody has yet had. The cost stays visible, because a
     false dangle names the label in its own row.
   - Cons: that project is blocked for a release cycle, which is exactly the cost the reporting
     project is paying now.
3. **Refuse the key and take the labels as an ordinary fusion contribution.** A project that needs a
   label files it against fusion and the next release carries it.
   - Pros: one enumeration, one place, no per-project divergence in what a citation is.
   - Cons: the round trip is a release, and it makes fusion's grammar the bottleneck for every
     project's own record vocabulary.

## Constraints

- Whatever is chosen must not make the shipped default unreadable: a project reading its own
  `fusion.json` should be able to see what it added on top of fusion's list, not a replacement of it.
- `citations.extraPaths` set the shape of the precedent, including that an invalid value is dropped
  whole and named in an advisory rather than leaving half a declaration in force.

## Recommendation

**Option 2**, and this record is what makes it a decision rather than an omission. The repair it
would be attached to is unblocking a project today, and building the lever inside it trades that
against a case nobody has met. The record stands so the third instance meets a written answer instead
of being rediscovered.

---
**Reconciliation 260905-2015 (reconciler, HEAD `5b84b13a`) — marker unchanged at `_o_`, no answer on
disk.** `hooks/lib/config.ts` carries one leaf under `citations`, `extraPaths`; no
`exemptHeadFields` key exists in the loader, in `fusion.json` or in the template. No
`Answer located:` line.

The record's own Recommendation names option 2 and calls itself "what makes it a decision rather than
an omission", but a record's own recommendation is not a ruling and the marker stays where it is.

The condition option 2 waits on has moved further away rather than closer: the enumeration this record
is the recurrence of was itself refuted on 260831-2215, in the record above, so there is currently no
list for a project to extend. Whoever answers the parent question decides whether this one still has a
subject.
