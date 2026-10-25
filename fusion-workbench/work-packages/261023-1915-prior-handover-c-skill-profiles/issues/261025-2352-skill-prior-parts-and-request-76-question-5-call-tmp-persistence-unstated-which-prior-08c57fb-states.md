Skill `prior` parts and request-76 question 5 call `/tmp` persistence within a run unstated, and Prior `08c57fb` states it
---
Prior's tool-container header at the pin says one container serves every command of a function run and its child runs, and that `/tmp` persists between their calls. The span map's P5 and question 5, archive, cleanup and commit treat that as unknown, and archive's two parts contradict each other. Severity: Medium, because the wrong fact would go into request 76. Fusion fixes this.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** code-implementer
**Cross-references:** 261025-2352-reviewer-closing-review-of-prior-handover-c-skill-profiles.md; 261025-2218-skill-span-map-for-entry-profiles.md (Finding 6, P5; question 5)

## Defect

Prior at `08c57fb`:

- `internal/supervisor/tool_containers.go`, header: "One tool container per function run … every later command and hook of the run, and of its child runs, runs in it through docker exec … State between calls is the rule, not an accident: files outside the mounted workspace (/tmp, which is also HOME) and background processes a command leaves persist for the later calls of the same function run … Nothing persists across function runs."
- `internal/platform/container.go`: `--tmpfs /tmp:rw,noexec,nosuid,nodev,size=64m`.

fusion at `ec6c968e`:

- `catalog/profiles/skill-archive/parts/01-prior.md`: "Whether the container keeps them from one `host.exec.v1` call to the next is not stated (request 76, question 5)", then a fallback for a lost survey.
- `skill-archive/parts/41-prior.md`, comment: "kept between calls: request 76, question 5". This contradicts `01-prior.md`.
- `skill-cleanup/parts/09-prior.md`: "no `/tmp` path is known to survive between calls".
- `skill-commit/parts/07-prior.md`: "no scratch path outside the workspace is known to survive between calls".
- Span map Finding 6 P5 and question 5 read only `exec.go`, which points to `tool_containers.go` without stating the rule.

## Fix direction

State the pin's rule once: `/tmp` persists within one entry run and its child runs, is 64 MiB and `noexec`, and is gone at the run's end. Remove archive's lost-survey fallback or keep it as a guard for a container lost mid-run. Reword cleanup and commit (both stay unsupported). In request 76, replace question 5 with what is still open: whether that rule holds for entry runs as it does at the pin.

## Acceptance

- No `prior` part says that `/tmp` persistence within a run is unknown, and archive's parts agree with each other.
- Request 76 asks no question the pin already answers about `/tmp`.
- `cd catalog && npm test` exits 0.
