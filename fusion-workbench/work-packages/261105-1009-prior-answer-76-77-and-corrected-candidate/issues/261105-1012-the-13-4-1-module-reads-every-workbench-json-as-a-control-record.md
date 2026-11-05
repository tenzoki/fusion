The 13.4.1 module reads every workbench .json as a control record, so an ordinary entry run ends refused after its integration stood
---
`controlRecords` in `adapters/prior/fusionmodule/internal/entry/entry.go` (line 528) selects any path under `fusion-workbench/` ending in `.json`. Fusion's own hooks write `.guard-state/staging-drift.json`, `citation-form.json` and `dispatch-map.json` on ordinary runs. Prior's host reads only the codec's record names and refuses the rest with `permission-denied`, so the envelope ends refused after the integration already landed.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Severity:** High. It rules out tagging `v13.4.1` at C′ and is why Prior's combined answer to requests 76 and 77 is "corrected". Prior's id for it is D-F1.

**Evidence**

- Prior's response, `docs/design/fusion-entry-v2-request76-77-prior-response.md` at Prior `52a2703`, `### In the delivery (fusion)`, D-F1, and its case `probe-issue-c-guard-state` in `docs/qualification/fusion-request77-2026-11-01/summary.json`: `refused`/`host-permission-denied` on `record:.guard-state/staging-drift.json`.
- Prior's selection: `package.json`, `*.record.json`, `*.evidence.json`, under no dot segment, outside `archive/` (`internal/fusionhost/entry_workspace.go:280-300`, Prior). Prior's own issue: `261101-2130-fusion-13-4-1-module-reads-every-workbench-json-as-a-control-record.md` (Prior's workbench, open).
- Read here: `entry.go:528` tests only the workbench prefix, the `.json` suffix, path validity, forbidden characters and a seen-set.
- Stated limit (Prior's G4): hooks did not run in Prior's step 28, so the claim that every ordinary entry run would end the same way is Prior's inference, not a measurement. The probe wrote the file by hand.

**Correction asked by Prior:** the module selects by the codec's names, the same predicate as Prior's. Widening Prior's side would not help: the codec refuses a file that is not a record, and the envelope would still end refused with `record-conflict`.

**Route.** The fix changes the module binary, so it takes a new patch version, a rebuild, a new digest and a new request (`REQUESTS.md`, request 77, `### What fusion does with the answer`).

**Executor:** code-implementer (`entry.go`, `entry_test.go`).

**Acceptance.** A `.guard-state/*.json` path and any other non-record `.json` under the workbench is not read; a `package.json`, `*.record.json` and `*.evidence.json` outside dot segments and `archive/` are; a test covers each, and the module's selection and Prior's predicate are stated as the same rule.
