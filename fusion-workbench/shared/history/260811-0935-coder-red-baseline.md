# Coder — task `X:260811-0901-red-baseline`

**Status:** Complete
**Agent:** coder
**Task:** fix the one stale citation that makes the whole hooks suite red at HEAD `7785330`
**Records worked:** none — no defect record exists for this task; it was found by running the suite
while `tasklist.md` was being built.
**Files changed:** `skills/setup/SKILL.md` (line 45, one token)

---

## What was wrong

`skills/setup/SKILL.md:45` cited a real defect record by the marker it carried at the moment the
sentence was written:

```
fusion-workbench/shared/issues/260717-0115_o_live-workbench-split-across-two-layouts-during-conversion.md
```

That record closed in the previous session, so on disk it is now `…260717-0115_*_….md` and the
citation pointed at a path that no longer exists. `reference-resolution-lint.test.ts:669` — the gate
that asserts no shipped text carries a dangling reference — reported it as its single finding, and a
single finding is enough to make the whole run red.

The failure is self-inflicted in a way worth keeping in view: the record went `_o_` → `_c_` because
the previous queue classified it "close without work". Closing a record breaks every citation that
names its old marker. That is the exact breakage the wildcard citation form exists to prevent, which
is why the lint knows the remedy by name and prints it in the failure message.

## The fix

One token, the fix the lint itself names — the wildcard marker form ratified by decision
`260806-0015_*_zitierform-fuer-workbench-records.md`:

```
-  …/260717-0115_o_live-workbench-split-across-two-layouts-during-conversion.md
+  …/260717-0115_*_live-workbench-split-across-two-layouts-during-conversion.md
```

The marker position is cited rather than the marker, so the citation survives every later transition
of the record it points at.

## The sentence it sits in

The dispatch asked for the surrounding claim to be checked, and it holds. The sentence reads *"That
is not hypothetical: it is filed as …"*, and it is there to support the claim that running `mkdir -p`
against a pre-v4 workbench really did split a live workbench across two layouts. What that sentence
asserts is that the failure happened and is on record. The record still exists and still says so; it
is closed, not withdrawn. So the assertion is unchanged by the edit, and the wildcard form is
additionally the more honest citation here — the old one incidentally asserted the record was still
open, which was already false when the lint caught it.

## The task's wider acceptance clause, deliberately not acted on

`tasklist.md` asks task 1 to also convert any other marker-bearing record citation in `skills/`,
`agents/` and `rules/`. The dispatch scoped this task to `skills/setup/SKILL.md` only, so the check
was run read-only and nothing else was touched:

```
grep -rn '_[opadcibs]_' skills/ agents/ rules/ | grep 'fusion-workbench/'
```

Six hits, none of them a citation of a real record. Four name the `.active-circle` pointer or a
Circle directory in prose (`agents/orchestrator.md:219,575`, `agents/playmaker.md:3`,
`rules/fusion-workbench-conventions.md:86`); two are invented worked examples in
`rules/decision-record-examples.md:13,74` (`260501-1430_*_vector-store-pick.md`,
`261107-0915_*_vector-store-revisit.md`) that describe no record on disk. The lint agrees — it
reports nothing further. That half of the acceptance clause is satisfied as it stands, with no edit
needed.

## Verification

`cd hooks && npm test` — exit 0. 41 files, 1142 tests, 1142 passed, 0 failed. Run twice: the first
run's exit code was swallowed by a `PIPESTATUS` reference that zsh does not honour, so it was re-run
writing to a log and the code read directly. No test other than the one named ever failed, in either
direction — the suite went from 1 failed to 0 with no second finding appearing.
