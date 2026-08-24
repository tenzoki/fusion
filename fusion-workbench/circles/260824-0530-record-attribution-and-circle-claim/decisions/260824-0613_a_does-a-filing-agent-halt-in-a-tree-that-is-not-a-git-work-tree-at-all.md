# Does a filing agent halt in a tree that is not a git work tree at all, or only in a git tree with no configured identity?

---
**Domain:** code
**Filed by:** planner
**Cross-references:**
`circles/260824-0530-record-attribution-and-circle-claim/planning/260824-0613_*_c3-attribution-on-records-and-a-claim-on-the-circle.md` (the plan this question was surfaced by, step 4 and step 6);
`shared/decisions/260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md` (the identity answer this question sits under);
`circles/260824-0530-record-attribution-and-circle-claim/_t_circle.md` `## Grounding snapshot` (the user's instruction, "with no git configuration the run halts rather than guessing");
`skills/setup/SKILL.md` Step 0h and `bin/fusion-count-sources` (the two shipped precedents for a tree that is not a git work tree)

---

## Question

The user's instruction is that a run with no git configuration halts with a reason and never
substitutes a value. His reasoning names one case: "a tree without `user.email` cannot commit and
does not take part in the multi-checkout arrangement at all." That reasoning covers a git work tree
whose identity is unset. It does not obviously cover a directory that is not a git work tree at all,
and the two are different situations with different populations behind them.

fusion supports a non-git project today, deliberately and in shipped code. `/fusion:setup` Step 0h
branches on `git rev-parse --is-inside-work-tree` and reports "not a git work tree, nothing written"
rather than failing. `bin/fusion-count-sources` returns `unavailable` outside a work tree rather than
`0`, on the reasoning that a wrong number is worse than a stated absence. Neither treats the absence
of git as a fault.

Attribution changes that, because it makes an identity a precondition of writing a record. If the
halt covers both cases, then a single user running fusion in a directory that was never a git
repository can no longer file a defect or a decision, which is most of what fusion does. That is a
behaviour change well outside C3's stated scope, and it would arrive as a side effect of a field on
a template rather than as a decision anybody took.

It must be answered before step 4 of the plan, because it is the exit contract of
`bin/fusion-identity` and every caller's halt condition reads it.

## Options

1. **Halt in both cases.** `bin/fusion-identity` exits non-zero whenever it cannot produce a name
   and an email, whatever the reason, and every filing agent halts.
   - Pros: one condition, one message, no branch. It is the literal reading of the user's
     instruction, and it never writes an unattributed record.
   - Cons: it withdraws a supported case without being asked to. A non-git project gets a tool that
     halts on its first defect, and the reason it reports names git, which such a user has no
     intention of adopting.
2. **Halt only inside a git work tree.** Outside one, the record carries the agent alone, exactly as
   every record carries it today, and the person field is absent rather than empty.
   - Pros: the multi-checkout arrangement is a git arrangement, so the obligation attaches where the
     transport does. No currently working case stops working. An absent field on a record filed
     outside git is honest: there is no person to name, and nothing was guessed.
   - Cons: two branches instead of one, and a second reading of what "no git configuration" means.
     A reader of the corpus then meets records with the field and records without it, and the
     absence carries information only if the rule that produces it is written down.
3. **Halt in both cases, and give `/fusion:setup` a check that says so at the start.** As option 1,
   with the failure moved forward to the one moment it is cheap to fix.
   - Pros: the user learns at Setup rather than at the first filing, and the message can tell them
     the two commands that resolve it.
   - Cons: it still withdraws the case; it only makes the withdrawal punctual. And it spends bytes
     on `skills/setup/SKILL.md`, the file with the least head-room of any shipped surface
     (202 bytes across the whole `skills/` budget, measured 260824).

## Constraints

- No value is ever substituted for a missing identity. That part of the user's instruction is not
  in question here and binds every option.
- Whatever is chosen is one condition evaluated in one place, `bin/fusion-identity`. A halt
  condition restated per agent is the thicket `rules/critical-stance.md` §2 rules out.
- Records written before this Circle are not rewritten, so the corpus already contains records with
  no person field. Whichever option is taken, absence of the field cannot by itself mean anything
  about the tree it was written in.

## Recommendation

`inference:` Option 2. The obligation and the transport should have the same boundary, and git is
the boundary the whole capability is drawn on. Option 1 reads the user's sentence literally, but the
sentence was given about a case he named, a tree that intends to commit and cannot, and applying it
to a case he did not name costs a supported use of the tool. The cost of option 2 is one extra
branch and one written-down rule, which is small next to withdrawing single-user non-git operation.

This is the user's call. It is not a planning judgement, because what is at stake is which users
fusion serves rather than how a mechanism is built.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:

---

## Answer (user, 260824)

**Option 2: halt only inside a git work tree.** The user was walked through the question a second
time and chose it, following the recommendation rather than the literal reading of his own earlier
sentence.

`bin/fusion-identity` therefore evaluates two states and not one. Inside a git work tree whose
`user.name` or `user.email` is unset, it halts and reports which value is missing. Outside a work
tree it reports that there is no identity to read, the record carries the agent alone exactly as
every record does today, and the person field is **absent rather than empty**.

**What the answer rests on.** The obligation and the transport get the same boundary, and git is the
boundary the whole capability is drawn on. The user's earlier instruction was given about a case he
named, a tree that intends to commit and cannot, and extending it to a case he did not name would
have withdrawn single-user non-git operation as a side effect of a field on a template. fusion
supports that case deliberately today, in `skills/setup/SKILL.md` Step 0h and in
`bin/fusion-count-sources`, neither of which treats the absence of git as a fault.

**The accepted cost, stated rather than glossed.** Two branches instead of one, and a second reading
of what "no git configuration" means. The absence of the field carries information only because the
rule that produces it is written down, which is step 6's work. And the third constraint above still
holds: records written before this Circle are not rewritten, so an absent field can never by itself
say anything about the tree a record was written in.

**Unchanged by this answer:** no value is ever substituted for a missing identity, and the condition
is evaluated in one place.

---
Answered: circles/260824-0530-record-attribution-and-circle-claim/decisions/260824-0613_*_does-a-filing-agent-halt-in-a-tree-that-is-not-a-git-work-tree-at-all.md `## Answer (user, 260824)` — option 2, halt only inside a git work tree; outside one the person field is absent rather than empty.
