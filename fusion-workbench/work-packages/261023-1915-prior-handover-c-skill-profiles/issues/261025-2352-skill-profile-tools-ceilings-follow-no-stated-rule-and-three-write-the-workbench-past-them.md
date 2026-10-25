Skill profiles' `tools_ceiling` values follow no stated rule, and three write the workbench past them
---
migrate and news set `writes_workbench.prior` true with a read-only file ceiling. archive moves records without `rename` or `delete`. All three write through `host.exec.v1`, the pattern the open decision on read-only roles questions. The values fit one implicit rule (a ceiling holds only the file classes the text uses through file tools), but nothing states that rule. Severity: Low. Fusion fixes this.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** code-implementer
**Cross-references:** 261025-2352-reviewer-closing-review-of-prior-handover-c-skill-profiles.md; 261025-1117-how-does-a-read-only-role-write-the-workbench-on-a-prior-entry-run.md

## Defect

`catalog/profiles/skill-*/profile.json` at `ec6c968e`:

| Profile | `tools_ceiling` | `writes_workbench.prior` | Writes through `host.exec.v1` |
|---|---|---|---|
| skill-migrate | read, list, search, git-inspect | true | `git mv` of stores, `bin/fusion-migrate`, `bin/fusion-citation-sweep --write` |
| skill-news | read, list, search, git-inspect | true | `bin/fusion-forum seen` (`.cadence-anchors`) |
| skill-archive | read, list, search, create, write | true | `mv` of record units, `bin/fusion-archive move` |

By contrast, skill-curate (read-only, `writes_workbench.prior` false, `may_delegate` true) is correct: `skills/curate/SKILL.md` lines 14 and 118, "This workflow writes nothing". The same holds for wp-order and help (false, read-only), and commit and cleanup (false; unsupported).

The open decision `261025-1117-how-does-a-read-only-role-write-the-workbench-on-a-prior-entry-run.md` recommends a per-workflow file grant. Under that option these ceilings are what Prior would enforce, and the archive and migrate moves would fall outside them.

## Fix direction

Write the rule into `catalog/README.md`, beside the profile keys, and cite the open decision for exec writes. When the decision is answered, set migrate, news and archive to match.

## Acceptance

- `catalog/README.md` states how a profile's `tools_ceiling` and `writes_workbench` are chosen.
- Each skill profile's values follow that rule, or the README names the exception.
