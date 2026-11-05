The hook payload README gives an order that never reaches the staging drift the conformance test requires
---
`adapters/prior/testdata/hook-payloads/README.md` `## Order` says: within each directory, run the payloads in filename order. `hooks_test.go` says it follows that README. It does not: it runs the Bash pair after the sixth tracker payload and a commit, because the order the README gives never reaches `staging_drift`. A reader who replays the payloads from the README gets no `staging_drift` row, so the drift branch goes untested. Severity: Low.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** code-implementer
**Cross-references:** 261026-1006-reviewer-closing-review-of-prior-handover-e-bundle-payload.md

## Defect

At `4e53b552`:

- `adapters/prior/testdata/hook-payloads/README.md:34`: "Run them in filename order inside each directory … `guard/` and `tracker/` interleaved as pairs (PreToolUse `nn` before PostToolUse `nn`)". The exceptions below it name only the `subagent-stop/` ones.
- `adapters/prior/fusionmodule/conformance/hooks_test.go:28` and `:224` say the session runs "in the order the payload README gives". `:266-276` then runs `guard/03-bash.json` and `tracker/03-bash.json` after `tracker/06-write-workbench-citation.json` and a commit. The reason is in the code comment: staging drift needs an uncommitted workbench record when HEAD moves. The same README's `## What the fixture repository has to provide` states that condition, and the README's own order never meets it.
- `adapters/prior/README.md` `### Conformance against a built bundle` describes the test's real order. Two documents now describe two orders.

## Acceptance

- The payload README's `## Order` gives the order `hookSession` runs: the Bash pair after `tracker/06` and one commit, with the reason. Or `hookSession` follows the README and still reaches `staging_drift`.
- `hooks_test.go`'s comments and the payload README describe one order.
- `FUSION_BUNDLE_DIR=<bundle> PRIOR_REPO=… adapters/prior/stage.sh test` exits 0.

---
Resolved: `## Order` now gives the order `hookSession` runs, the Bash pair after `tracker/06` and one commit, with the reason, and the comments in `hooks_test.go` and the adapter README name that one order.
