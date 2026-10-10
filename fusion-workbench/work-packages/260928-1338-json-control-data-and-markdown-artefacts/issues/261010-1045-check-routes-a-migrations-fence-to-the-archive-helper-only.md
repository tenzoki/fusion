Check routes a migration's fence to the archive helper only
---
**Severity:** Low. The recovery text for a fenced store with no inventory names the wrong helper when the fence is a migration's.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Defect.** `skills/check/SKILL.md`, the fence check ("whether an archive move left the store fenced"), says for `fence=` with no inventory path: "the recovery is that helper's header", that is `bin/fusion-archive`. An interrupted `bin/fusion-migrate run` leaves the fence its first apply chunk began (`hooks/migrate.ts`), and no `.inventory.json` names it, so the check prints `fence=…` and sends the user to `bin/fusion-archive`, whose `resume` and `abandon` both need an inventory. `hooks/write.ts` already names both routes ("A migration's: `bin/fusion-migrate status` shows it, `resume` or `rollback` ends it"); the check skill is the one text that does not.

**Evidence.** Read at 468d8e87.

**Acceptance test.** The no-inventory branch of the check names `bin/fusion-migrate status`, `resume` and `rollback` beside the archive helper.
