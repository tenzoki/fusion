# The migration's new drop rule justifies itself with a claim that is false on a second run

---

One sentence replaced four drop conditions in `/fusion:migrate`. The rule it states subsumes all
four. The reason it gives for the rule does not hold for a container an earlier run of the same
skill already converted, and that state is one the skill's own partial-run path produces.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Related:**
`260908-2018-prerequisites-confirmed-once-order-computed.md` (the item that changed the rule);
`260908-2018_*_does-the-new-field-name-only-the-ordering-edge-or-the-four-relation-types-beside-it.md` (the ruling behind the change)

**Measurement anchor.** Read in this work tree at commit `c2a12973` on 2026-09-13.

## The defect

`skills/migrate/SKILL.md:157` now reads:

> Every entry naming a container **this pass also converted** goes to `**Cross-references:**`,
> comma-separated, which orders nothing; every other entry names no such record and is dropped,
> because a citation that resolves to nothing degrades without announcing it (`HYG-NO-SILENT-FAIL`).

The keep half is a whitelist and subsumes all four conditions the replaced text enumerated: a
`(none)` literal, prose, an entry naming no such directory, and an entry naming a container whose
record stayed terminal are each not a container this pass converted, so each is dropped. Nothing
falls through the rule.

The justification clause does fall through. "Every other entry names no such record" is false for
an entry naming a container that **an earlier run of this skill already converted**. That
container now holds `<dirname>.md`, so the entry resolves; the rule drops it anyway, and the
stated reason for dropping it is a fact about the tree that is not true.

The state is reachable from the skill's own text. `skills/migrate/SKILL.md:170` instructs: "If any
live record cannot convert ... stop and return to the user with what stands, naming which
containers converted and which did not." A second invocation then meets a store where some
containers are item-form and some are still Circles, and Step 4b opens "only the ones the survey
counted into `LIVE`" (`skills/migrate/SKILL.md:132`), which excludes the already-converted ones.
A workbench where a user filed items through `/fusion:memo` beside surviving Circles reaches the
same state without any partial run.

The cost is one resolvable citation dropped per such entry, reported to the user as a drop that
named no record. Low, and the wrong reason is what makes it hard to notice later: a reader
checking the rule against a tree will find the sentence contradicted and not know whether the
rule or the sentence is the error.

## Acceptance test

1. `skills/migrate/SKILL.md:157` states a rule and a reason that agree. Either the keep set
   widens to "a container holding a record under its own name, whether this pass converted it or
   an earlier one did", or the reason is restated as what it actually is: a conversion writes only
   what this pass can verify, and an entry outside that set is dropped and reported whether or not
   it resolves.
2. Whichever is chosen, the surrounding sentence keeps `**Depends-on:**` unwritten by a
   conversion, which is the part of the change that carries the ruling.
3. The reported-drop obligation ("Say in the report which you dropped and why") survives, and its
   "why" is answerable for each dropped entry under the new wording.

## Scope

`skills/migrate/SKILL.md` alone. The `skills/` surface carries a growth bound; the fix should be
at or below the current byte count, which a restatement can be.
