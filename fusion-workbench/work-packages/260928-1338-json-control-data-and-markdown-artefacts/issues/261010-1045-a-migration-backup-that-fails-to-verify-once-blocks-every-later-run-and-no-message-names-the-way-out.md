A migration backup that fails to verify once blocks every later run, and no message names the way out
---
**Severity:** Medium. A user must migrate to use 13.0.0; one interrupted or racing backup copy stops `/fusion:migrate` for good.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Defect.** `hooks/lib/legacy-repair.ts` `ensureBackup`:

```ts
if (existsSync(join(session, BACKUP_HASH))) return;
mkdirSync(session, { recursive: true });
cpSync(root, join(session, BACKUP), { recursive: true, verbatimSymlinks: true });
const [a, b] = [treeHash(root), treeHash(join(session, BACKUP))];
if (a !== b) throw new Error(`the backup does not verify: ${a} != ${b}`);
```

`cpSync` copies over whatever `<session>/backup/` already holds. A file left there by an interrupted copy, or by a copy taken while another session wrote, is never removed, so every later `run` or `repair --apply` fails the same check and exits 9. `hooks/migrate.ts` says only that `<session>` "holds the copy that failed"; `skills/migrate/SKILL.md` says to report exit 9 and stop. No text says to remove `<session>/backup`.

**Evidence.** Run 261010 through `hooks/dist/lib/legacy-repair.js` on a scratch workbench whose session `backup/` held one stale file: two consecutive calls both threw "the backup does not verify".

**Acceptance test.** With no `backup.sha256`, a stale `backup/` does not make the next run fail: the copy goes to a fresh temporary directory, is verified, and is renamed into place (or `backup/` is emptied first). A regression test seeds a stale file and shows the second run verifying.
