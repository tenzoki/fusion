# migrate: the Undo paragraph's environment bound covers only "this and each refusal", and leaves out a codec that refuses

---
`docs/upgrading-to-v13.md` `**Undo.**` bounds itself with "This and each refusal below hold once the helper runs and its codec answers; where either fails, its exit code says so instead." Two gaps. (1) The bound names a codec that answers, and a refusal is an answer. `inspect` can be refused (exit 8), and then `status` says nothing about where the workbench stands, and `set-aside` renames nothing. The header's bound in `bin/fusion-migrate` says "answers and admits", which covers this. (2) The bound covers "this" and "each refusal". The paragraph's other promises are outside it: the skill "says so and offers", set-aside "renames the session directory", and the skill "then surveys again". Each of those fails when the helper exits 1 to 4, 7 or 8, and "where nothing below stands in its way" names only what the paragraph lists below.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261017-1708-plan-migrate-landed-cell-docs-entry-path-conditions.md`

**Evidence (read at `c239cdd6`).**
- `hooks/migrate.ts` `send`: a codec answer whose kind is `refused` throws `Stop(EXIT.refused)`, exit 8. `status` and `setAside` both call `inspect` before anything else.
- The plan's trace, paragraph "Throughout": "`inspect` itself is refused over journal data it cannot read".
- `skills/migrate/SKILL.md`: the status block shows `EXIT=` and stops on a non-zero exit, so with a refused `inspect` it neither reports `record=stale` nor offers the set-aside.
- `bin/fusion-migrate` header, the sentence after "git is required too, and is asked.": "where the codec answers and admits each request it is sent (else exit 7 or 8)".

**Fix direction.** Make the Undo bound cover the whole paragraph, and say "answers and admits" as the header does. In substance: "Everything below holds once the helper runs and its codec answers and admits each request; where either fails, its exit code says so instead." Keep it unbackticked. No code change.

**Acceptance.** No promise in the `**Undo.**` paragraph is falsified by an exit 1 to 4, 7 or 8 of the helper, and the bound's codec condition matches the header's.
---
Resolved: 2026-10-17, plan `261017-1823-plan-migrate-docs-defer-conditions-to-status-and-messages.md` step 1. The bound sentence is gone from the Undo paragraph. Every promise the paragraph still makes holds under any exit of the helper: the two opening sentences on the undo window, unchanged; `status` says where a workbench stands or why it cannot; `record=stale` means the record and the tree disagree; set-aside deletes nothing and renames only where it succeeds, and nothing while a fence the undo left stands; a stopping helper says why and may suggest a next step; `rollback --end-fence` removes no file itself but the fence file, and that only where no chunk of the undo landed; a hand deletion only where the message names it. The first half of the acceptance is met; the second half, that the bound matches the header's, is moot because neither text carries a bound any more (the header now has a reading rule instead).
