# Does the container store keep the directory name `circles/`?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260910-2133_*_does-a-unit-of-work-keep-its-own-container-for-the-artifacts-it-produces.md; 260910-2145_*_how-does-the-resolver-learn-which-work-item-is-in-scope.md

---

## Question

The container comes back; the Circle does not. The portfolio layer and the six-state vocabulary stay removed, so nothing in the restored design is a Circle — it is a work item with a directory. The directory those containers sit in is still called `circles/`, and 26 of them are on disk under that name in this workbench alone.

Keeping the name means the one surface every dispatch reads describes a work item's container by a word for a concept that was deliberately removed. Changing it means moving 1414 files, renaming a citation kind the grammar carries (`circle-dir`), and touching a corpus predicate, a monitor, four `bin/` helpers and the migration body — in a Circle whose entire subject was cutting surface.

## Options

1. **Keep `circles/`.** The container store keeps the directory name it has. The conventions describe it as a work item's container and the word in the path is historical.
   - Pros: zero file moves, zero citation breakage, and the whole `circle-dir` half of the citation grammar keeps working untouched. Every `circles/<dir>` citation in a live record stays exactly as classified today.
   - Cons: the name outlives its concept on the always-on surface. A reader meeting `circles/` asks whether the portfolio layer is back, and the answer has to be given somewhere.
2. **Rename to `work/`.** One `git mv`, the grammar's literal changes, the migration body renames it in a consuming project.
   - Pros: the path says what the thing is. No explanation is owed on the always-on surface.
   - Cons: 1414 tracked files move in this repository; the `circles/<dir>` citation form stops matching the pattern that classifies it, so every such token in a live record changes class with no rewrite available; four `bin/` helpers and `bin/monitor` carry the literal in prose and in code; and it is a one-way move in a work item that already carries one.
3. **Rename, and keep `circles/` resolving as a legacy alias.** Both names read, one written.
   - Pros: no citation breaks.
   - Cons: two names for one store, permanently, in the one place this project insists on a single resolution point. It is the cost of option 2 plus a second definition site.

## Constraints

- Whatever is chosen holds for consuming projects too, and `skills/migrate/SKILL.md` performs it there.
- The choice is one-way in the same sense D1 is: a mass rename is not reversible by a forward commit once records cite the new path.
- It does not interact with the scope mechanism: the resolver reads a claim field and takes the item's own directory, whatever the store above it is called.

## Recommendation

Option 1, and the naming debt named rather than paid.

The rename buys a word and costs a one-way mass move plus grammar work, inside a work item whose measured subject is cutting cost. Nothing about the restoration requires it, and the container ruling asked for the container back rather than for a rename. The one real objection — that the always-on surface would carry a word for a removed concept — is answered in one clause of the layout tree, at a cost of a few dozen bytes on a floor where this plan is already measuring every addition.

Deferring it is not the same as ignoring it. This is filed so that whoever meets `circles/` next finds the question already asked, and so that a later cleanup with a quiet tree can take option 2 as one commit instead of rediscovering it under pressure.

---
Answered: 260910-0900-orchestrator-session.md `## Ruling on the container store's name` — option 1, the store keeps the directory name `circles/` and the naming debt is named rather than paid. The rename's cost is one-way and measured (1414 files, a citation class that stops matching with no rewrite available, four helpers and the monitor carrying the literal) and nothing in the container ruling required it; the one objection is answered by the clause step S1 wrote into the layout tree. Ruled by user, Kai Stalmann <ks@qantr.com>.
