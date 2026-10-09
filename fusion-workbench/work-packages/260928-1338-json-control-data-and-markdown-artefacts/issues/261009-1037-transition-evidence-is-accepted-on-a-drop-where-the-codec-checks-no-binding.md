`transition --evidence` is accepted on a drop, where the codec checks no binding
---
`hooks/lib/record-write.ts` (`parseFlags`, `fieldsOf` case `transition`, added at `89471d97`) accepts `--evidence` on any package transition that carries `--outcome`, `--to dropped` included. The codec runs `bindEvidence` on outcome bindings only into `done` (`EVIDENCE_CHECKED_ON = "done"` in `codec/src/cli/ops.ts`), so on a drop the client's `show` of the named record (kind `evidence`) is the only check: a binding whose brief or plan no longer matches is stored, and `reconcile` reports it afterwards. Nothing reads a dropped package's outcome evidence for a condition, so no edge is met by it. Low: no shipped prompt sends `--evidence` on a drop.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence:** `codec/src/cli/ops.ts`, the package branch of the transition plan: `if (pair.kind === "package" && req.to === EVIDENCE_CHECKED_ON)`; `bin/fusion-write` header: "`--evidence` … a package's and only with --outcome". Read, not run.

**Fix direction:** refuse `--evidence` unless `--to done`, as a usage error naming the reason, and say so in the `bin/fusion-write` header.

**Acceptance:** `transition --to dropped --outcome … --evidence …` exits 2 with nothing sent, pinned in the `transition --evidence` describe block of `hooks/lib/__tests__/record-write.test.ts`.

Cross-references: 261009-1037-reviewer-g-a-pre-release-review-of-13-0-0.md
