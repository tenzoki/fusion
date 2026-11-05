`fusion-write evidence` on Prior stamps host `claude-code` and the base revision's tree
---
The reviewer's entry run records its verdict with `fusion-write evidence` through `host.exec.v1`. The helper hard-codes `host: "claude-code"` and `execution_policy: "claude-guided"`, and binds `subject.git_tree` to `HEAD^{tree}`, which on Prior is the run's base revision, not the reviewed workspace. The evidence record then misstates both who ran the review and what it reviewed. Severity: Medium. The fix touches `hooks/`, which the plan's stop conditions hold unchanged until candidate C; if it is not fixed, request 76 must list it as a deliberate difference.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** code-implementer
**Cross-references:** 261025-1117-reviewer-closing-review-of-prior-handover-b-agent-profiles.md; 261023-1854-plan-prior-full-surface-handover-h1-to-h9.md (`## Where this work stops`)

## Defect

- `catalog/profiles/reviewer/parts/13-prior.md`: an entry run writes evidence with `"$FUSION_PLUGIN_ROOT/bin/fusion-write" evidence --record … --verdict … --actor reviewer` in one `host.exec.v1` call.
- `hooks/lib/record-write.ts`, the evidence payload: `host: "claude-code"`, `execution_policy: "claude-guided"`; the header comment says "Host `claude-code` and policy `claude-guided` are all this host can claim".
- Same function: `spawnSync("git", ["rev-parse", "HEAD^{tree}"], …)` feeds `subject: { git_tree: gitTree, git_range: null }`.
- `codec/schemas/evidence.schema.json` `host` enum already admits `"prior"`.
- On Prior the run never commits (`reviewer/parts/03-prior.md`: the host captures and integrates once the run ends), so `HEAD` is the base revision and the reviewed work is not in its tree.

Commit `5544cfca` names the host half as open; the tree half is not named anywhere.

## Fix direction

Either `fusion-write evidence` takes the host and policy from an explicit flag or a variable Prior's exec sets, and the subject from the workspace tree (`git write-tree` over a temporary index, or a `--tree` argument), or the plan is amended to leave `hooks/` alone and request 76 lists "evidence on Prior names `claude-code` and the base tree" as a deliberate difference. The plan's `## Where this work stops` allows no `hooks/` difference between `v13.3.3` and C, so the first route needs the user's ruling on the plan.

## Acceptance

- An evidence record written from a Prior entry run carries `host: "prior"`, `execution_policy: "prior-enforced"`, and a subject tree that contains the reviewed change; or request 76's H-row table names the difference with fusion's reason.
- `hooks` `npm test` exits 0 if `hooks/` changes.

Also seen: 261105-1042 by data-implementer — triaged in 261105-1023-plan-fusion-13-4-2-corrected-candidate.md, stays open as D-F5: Prior accepts H3's difference and says fusion fixes it in a later release (`Prior: docs/design/fusion-entry-v2-request76-77-prior-response.md` at `52a2703`, `### H rows`); `hooks/lib/record-write.ts` moves `hooks/dist`, so the Claude distribution, for something Prior does not ask for now.
