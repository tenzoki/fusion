Archive resume reports units a fallback restored as moved and closes the inventory moved
---
**Severity:** Medium. `/fusion:archive` writes every `moved=` line into the archive manifest, so records still live in their store are recorded as archived.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Defect.** In `hooks/lib/record-archive.ts`, a failed move runs `fallBack` → `restoreUnits`, which sets each moved unit to `state = "restored"`. If ending the fence then fails, the run exits 7 and its stderr says `bin/fusion-archive resume …` finishes or restores the move. `resume` finds the fence standing, phase `final`, every file at its source, and calls `carryOut`, which moves only `planned` units but reports all of them:

```ts
for (const u of inv.units.filter((x) => x.state === "planned")) moveUnit(wb, inv, u, o.io);
...
const moved = inv.units.map((u) => `moved=${u.kind}\t${u.source}\t${u.destination}`);
...
close(wb, inv, "moved");
```

(`carryOut`; the same all-units `moved=` mapping in `resume`.) A move that failed at unit 2 of 3 leaves unit 1 `restored` and units 2 and 3 `planned`, so `resume` archives units 2 and 3 and reports unit 1 as moved too (inference from reading).

**Evidence.** Probe run 261010 on a scratch export of 468d8e87 (`hooks/lib/__tests__/record-archive.test.ts`, extra case): a lossy rename, one failed `end`, then `resume`. First run `fenced`, every file back; `resume` answered `done` with `moved=pair\tshared/issues/260916-1000-failed-move-unit.record.json\tarchive/…` and `result=moved`; the file stayed at its source, nothing at the destination, outcome `moved`. `skills/archive/SKILL.md` row 0: "each `moved=` line is archived and goes into the manifest".

**Acceptance test.** A `final` inventory with any `restored` unit either resumes as a restore (fence ended, closed `restored`, exit 8) or resets those units to `planned` first; `moved=` lines are built only from units whose state is `moved`. The probe above and the partial 1-of-3 case are regression tests.
