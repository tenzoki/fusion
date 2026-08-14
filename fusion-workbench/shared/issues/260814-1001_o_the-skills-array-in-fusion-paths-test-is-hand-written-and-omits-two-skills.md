The SKILLS array in fusion-paths.test.ts is hand-written and omits two skills

---
`hooks/lib/__tests__/fusion-paths.test.ts` holds a hand-written `SKILLS` array that drives two
assertions: the key-set agreement check and the no-stderr loop. It omits `cadence` and
`seed-from-plane`, and nothing asserts the array against the `skills/` tree, so those two skills sit
silently outside both checks.

---
**Found while adding `curate` to the same array** (plan step 3 of Circle `260801-1244-curator`, on
2026-08-14). Adding an entry does not change the property: the next skill added will be missing
from the array in exactly the same way, and the test will keep passing.

**Why it is worth filing rather than fixing in passing.** The plan named this file for a one-line
change. Deriving the array from the tree is a different change, and the mechanism to copy already
exists: `skillDirs()` in `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` reads the skill
directories off disk for exactly this reason. That lint's whole premise is that an enumeration
nobody derives goes stale, and here is one of its own neighbours doing so.

**Consequence today.** `bin/fusion-paths cadence` and `bin/fusion-paths seed-from-plane` are not
covered by the assertion that a consumer's emitted key set matches the keys its own prompt names,
nor by the check that the resolver writes nothing to stderr for a known name. Neither is known to be
broken; the point is that nothing would say so.

**Filed in the shared store** rather than in the Circle, per the Origin Rule: the defect was found
next to this Circle's work, not caused by its Directive.

**Filed by:** orchestrator, session `shared/history/260813-2345-orchestrator-session.md`.
