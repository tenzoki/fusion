The merged cadence body never writes Total commits on a create, yet step 10 reports it

---
The retired activity-log body said the end-of-file commit-count section is appended on create and refreshed on each run. The merged body carries only the second half: the create template stops at `## Daily Log`, and the only sentence that mandates `## Total commits` sits under **On refresh**. A first run in a project with no log therefore writes no such section — while the report step still owes the user the number.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260915-2309_*_merge-log-activity-into-cadence.md

**Evidence.**

- `git show v11.3.0:skills/log-activity/SKILL.md`, step 5, directly under the new-file header block: *"The end-of-file `## Total commits` section is appended on initial create and refreshed on each run — see Step 7."* Step 7 then repeated it on both branches: *"On **create:** write header + … + the end-of-file `## Total commits` section."*
- `skills/cadence/SKILL.md:107-131` is the create template. Its sections in order are `## Source Legend`, `## High-level arc`, `## Active Hours per Week`, `## Daily Log`. `## Total commits` is absent.
- `skills/cadence/SKILL.md:143` is the only place it appears in step 5, and the sentence opens **"On refresh:"**. The "either way" in that sentence spans the two refresh branches (new days, and `$SINCE` replaced in place), not create-versus-refresh.
- `skills/cadence/SKILL.md:249`, step 10, mandates the report line regardless: *"the date range covered, total items found, **the current commit total**, any legacy-name rename…"*

The first run in a consuming project is the create path, so this is the path a new user meets. The result is either a report line computed from a command the body never told the model to run, or a missing line with nothing saying why.

The command itself survived the merge intact (`git log --since=<earliest-date> --oneline | wc -l`, `skills/cadence/SKILL.md:143`); only its placement on the create branch was lost.

**Acceptance.** `skills/cadence/SKILL.md` step 5's create template names `## Total commits` as the last section, as the retired body did, so the create and refresh paths write the same set of sections and step 10's mandated commit total has a source on both. `cd hooks && npm test` stays green and the `skills/` surface does not go over (1 082 bytes of margin at HEAD).

---
Resolved: `skills/cadence/SKILL.md` step 5's create template gains `## Total commits` as its last section, carrying the count command in its comment, so create and refresh write the same set of sections and step 10's mandated commit total has a source on both paths. The refresh sentence was shortened to point at the template rather than repeat the command, which pays for most of the addition.
