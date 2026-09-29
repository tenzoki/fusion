# Does the FJ02 kernel plan hold, and are its three open choices (one write lock, evidence beside its report, a self-ignoring .json-state/) the right ones?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Partners:** orchestrator and consultant
**Rounds:** 2
**Ceiling:** 8; closed by the user after round 2, since the one undecidable claim (C16) needs a ruling only the Prior side can give
**Outcome:** did not converge after 2 rounds
**Cross-references:** 260928-2251_*_plan-fj02-operation-kernel-revisions-and-local-transactions.md, 260928-2251_*_does-the-kernel-take-one-workbench-wide-write-lock-or-keep-a-lock-per-record-under-the-journal.md, 260928-2251_*_where-does-an-evidence-record-live-on-disk-so-that-attach-evidence-can-resolve-it.md, 260928-1735_*_does-transition-keep-walking-the-claim-and-release-edges-once-they-are-operations-of-their-own.md, 260928-1338-json-control-data-and-markdown-artefacts.md

---

## Question

The FJ02 plan (the operation kernel, revisions and local transactions) was put to the user for approval on 2026-09-28 with three open choices: one workbench-wide write lock instead of FJ01's lock per record, evidence records as `<basename>.evidence.json` beside their report in `reviews/`, and a kernel-written `.json-state/.gitignore` containing `*`. Instead of approving, the user opened this discussion on 2026-09-29 without naming a narrower topic, so the question is the plan's load-bearing claims and the three choices together: do they hold against the spec (Prior `concept/fusion-json-workbench-spec.md` at `c512c4c`), Prior's two responses, and the codec at fusion `81ff10b6`?

## What held up

### C1 — One workbench-wide write lock (`.json-state/write.lock`) is sufficient for both hosts' actual concurrency and removes the lock-ordering and re-scan loop per-record locks would need once recovery covers every path a pending intent names.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the lock-granularity decision record, Options 1 and 2; `codec/src/store.ts` lines 445-482; Prior's regression names the per-record path at `internal/fusionhost/codec_process_test.go` lines 310-311. Its cost is C9 and C10.

### C2 — Evidence records as `<basename>.evidence.json` beside their report in a `reviews/` store fit spec decision 3 and the existing pairing rule, and need no new store.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** spec section 1 decision 3 and section 3 (`reviews/`, "bei neuen Prüfungen Ergebnis-JSON"); `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`. Two limits the plan does not state: nothing in step 7 checks that the record's `report.path` names the neighbouring file, and a correction with an unchanged report cannot take the same `<basename>.evidence.json` name, so the naming rule needs a sentence for that case.

### C3 — A kernel-written `.json-state/.gitignore` containing `*` keeps every untracked file under `.json-state/` (the `.gitignore` itself included) out of `git status`, `git add -A` and `git add <dir>` whatever the root `.gitignore` says.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** scratch test: with `!fusion-workbench/**`, `!.json-state/` and `!*.json` in the root `.gitignore`, `git status --porcelain` and `-uall` stay empty, `git add -A` and `git add <dir>` add nothing, `git check-ignore -v` names `.json-state/.gitignore:1:*`. Two limits: a file already tracked stays visible (tested); plan step 2 writes the file only when the directory did not exist (plan line 129), so a `.json-state/` created by the FJ01 bundle (`store.ts` line 450) or by Prior's regression (`codec_process_test.go` line 312) never gets it; see C19.

### C4 — With the intent durable under the lock before the first file changes and removed only after the last file and the stored answer landed, per named file the states pre / post / diverged partition all cases and recovery can roll forward or stop without guessing.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the three hash states are exhaustive; where pre-bytes equal post-bytes (the plan's kept no-op write) `fileState` must test post first; a file restored to its pre-bytes by hand after a partial landing reads as not yet applied and is rolled forward. C11, C12 and C13 are defects in how the plan applies the partition.

### C7 — Changing the deferred reason token from `not-implemented-in-fj01` to `not-implemented` breaks nothing the Prior side has pinned beyond what re-pinning changes anyway.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** no recorded pair carries the token (grep of `codec/fixtures/protocol-session/`); Prior's adapter keys on the class only (`codec_process.go` line 139); its one pin on the reason (`codec_process_test.go` lines 252-261) sends `reconcile`, which turns red at re-pin whatever the token. The fusion side is C14.

### C9 — The single lock turns a writer killed by Prior's cancellation into a stall of at least 60 s for the whole workbench, because the exit hook does not run under SIGKILL and `isStale` demands an age of 60 s even when the holder PID is dead.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `codec_process.go` line 108 (SIGKILL of the process group); `store.ts` lines 493-505 (exit hook), 515 (`isStale` age condition), 452 (65 s default wait). Suggested fix: reap a dead holder (`ESRCH`) with no age condition; apply age only when no PID is recorded. Prior's live-PID regression is unaffected.

### C10 — The reap sequence `isStale` → `unlinkSync` → retry can delete a lock another waiter has just taken, leaving two holders; under the journal that breaks the one-exclusion premise.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `store.ts` lines 469-475; predates FJ02. Suggested fix: rename the stale lock to a unique name and re-check before taking over.

### C11 — A crash inside `writeIntent` before its rename leaves a dot-temp file in `journal/`; step 2's `readIntents` parses every file there and would answer `journal-unreadable` for an operation that never committed, blocking every mutation.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `replaceAtomically`'s temp name `.<id>.json.<pid>.<rand>.tmp` (`store.ts` line 405); plan step 2 ("never skipped", line 129). Dot-temp files in `journal/` are uncommitted and are removed under the lock.

### C12 — An intent can exceed the strict reader's 1 MiB cap and then fail to read back exactly when recovery needs it.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `strict-json.ts` lines 29 and 61; `main.ts` line 92 (1 MiB request); `create` with `content` carries the Markdown twice (request and write) plus record and response; `adopt-plan` carries three records; the plan's Data Structures (line 211) wrongly says the per-record limit covers the sum.

### C13 — The replay lookup reads `ops/` only, so a request reusing the id of a blocked pending intent on other paths renames over `journal/<id>.json` and loses the half-landed first operation.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the plan's first diagram node D and step 3. The replay lookup must also consult `journal/<id>`.

### C14 — Step 3 turns red: `ops.test.ts` asserts `not-implemented-in-fj01` for every deferred operation, and step 3's test changes name only one case.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `codec/src/__tests__/ops.test.ts` lines 106-110; plan step 3 (line 137); also stale text in `codec/README.md` line 60, and the step 1 manifest notes say "answered from FJ02" before the operations answer.

### C15 — The Prior side moved on after the plan was written: `docs/design/fusion-fj01b-prior-response.md` (commit `f18481c`, after the plan's 22:51) restates common authority, ownership and CAS rules for `transition`, `claim` and `release`, and spec 4.3 gained an additive deferral paragraph; the plan's Spec line should cite it and re-survey against Prior `590dca5`.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** Prior `590dca5`, `f18481c`, `docs/design/fusion-fj01b-prior-response.md`; spec section 4.3.

### C17 — The read protocol never returns a mixed state if the after-snapshot lists `journal/` before `ops/`, the writer writes `ops/<id>` before it unlinks `journal/<id>`, and both snapshots ignore dot-temp names.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** exhaustive interleaving check (one writer over two files, one lock-free reader, 132 to 259 runs per configuration, scratchpad `c17.py`): 0 mixed reads accepted under the three conditions, 4 to 18 with `ops/` listed first, 5 to 72 with unlink before `ops/`; the id set only grows because `ops/` is not pruned in FJ02 (plan step 9). The plan already writes `ops/` first (line 63, step 2, step 3) but states neither the listing order nor the dot-temp exclusion (lines 67, 137, 213).

### C18 — `06-validate.response.json` stays byte-identical as long as `validate` neither scans narratives for status copies nor resolves package bindings; the evidence and recovery findings the plan adds to `validate` never fire on the scratch workbench.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** `codec/src/cli/ops.ts` `findingsOf` (lines 216-238) checks parse, schema, state rules, narrative presence and `workbench_id` only; the `done` package's `active_documents` and `evidence` ids are absent from the fixture and the parser-fix narrative carries a status head line; no evidence file and no journal exist when pair 06 runs; the walk skips dot entries (`ops.ts` line 159), so `.json-state/` never changes `checked: 3`.

### C19 — Writing `.json-state/.gitignore` whenever it is missing, not only when the directory is new, closes C3's second limit without moving any recorded pair or Prior's handback.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** no FJ01 pair or handback test enumerates `.json-state/` (`ops.test.ts` lines 234, 266; `store.test.ts` lines 287, 292); Prior's regression checks only the lock bytes and the record digest (`codec_process_test.go` lines 311-312). Limit: `O_EXCL` then a separate write can crash between and leave an empty file `O_EXCL` never repairs; write a temp file and `linkSync` it (atomic, fails on EEXIST), or compare the content with `*\n` and replace atomically. Place the write in `acquireLock`, the one point every writer passes.

### C20 — Refusing a transition into `claimed` whose claim carries `claimed_at: null`, in the transition plan function, closes C8's bypass without moving pair 02 or import.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** the only edges into `claimed` (`open→claimed`, `paused→claimed`) both require a claim (`contract/transitions.json`); pairs 02 and 05 carry `claimed_at: "2026-09-28T17:30:00+02:00"`; the handback is `claimed→paused` with no claim; `src/prior/` never calls `allowed(`. Condition: the check goes in the plan function in `ops.ts` (around lines 306-309), not in `packageRules` in `transitions.ts`, whose test enumerates `open→claimed` with `claimed_at: null` (`transitions.test.ts` lines 27, 121); it stays limited to transitions into `claimed`, since spec line 211 allows a null time on an imported claim; both routes refuse with the same `schema-invalid/claimed-at-required`.

### C21 — Reaping a lock whose recorded holder PID is dead immediately, and applying the age rule only when no PID is recorded, closes C9 and keeps Prior's live-PID regression green.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** `TestCodecDoesNotReapAnOldLockWhoseOwnerIsAlive` (`codec_process_test.go` lines 305-333) writes a live PID with an hour-old mtime and expects the codec to wait; the age rule must stay for the window where `acquireLock` created the file before writing the PID (`store.ts` lines 458-462); Prior reaps its killed child (`codec_process.go` lines 106-112). Limits: it does not close C10 and must land with C10's fix; the lock records no host, so a holder in another PID namespace or on another machine looks dead (inference) — recording the hostname and checking liveness only on the same host closes it.

### C22 — One blocked intent makes every later lock-free read take the workbench write lock until someone corrects it by hand, so reads inherit C9's stall and can time out under Prior's short deadlines.

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** plan line 67 and step 3 key the reader's lock on a non-empty `journal/`; a blocked intent stays there by design (line 64, step 2); a waiting read returns to Prior as `ErrCodecOutcomeUnknown` (`codec_process.go` lines 108-112). Suggested fix (speculation, untested): a live writer's files are only ever at pre or post, so an intent with a diverged file can be classified blocked without the lock and its id treated as a stable snapshot member.

### C23 — A kernel-side ownership check keyed on checkout identity needs a new request field, and Prior's recorded handback cannot carry it.

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** no checkout field in the `transition` or `release` request shapes (`protocol.schema.json` branches 5 and 7); `fixtures/prior-handback/transition.request.json` (`claimed→paused`) carries none, so a mandatory check changes that answer and an optional one is the less-checked route Prior rules out; the only identity the kernel receives is `actor.person`, defined in `common.schema.json` as "Attribution, never authorisation" and nullable. Whatever Prior rules on C16 must cover `transition` out of `claimed` as well as `release`.

## What fell

### C5 — The read protocol (snapshot the id set of `journal/` ∪ `ops/` before and after a lock-free read, retry on a difference) never returns a mixed state as a valid snapshot.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the plan fixes no listing order for the after-snapshot (lines 67, 137); listing `ops/` before `journal/` lets a writer's `ops/W` write and `journal/W` unlink fall between the two listings, so equal snapshots accept a pre/post mixture. Holds once the after-snapshot lists `journal/` before `ops/` and ignores dot-temp names; see C17.
- **Conceded:** first partner, round 1 — the six-step interleaving above.

### C6 — Keeping `validate`'s finding set exactly as in FJ01 and moving every cross-record check to `reconcile` is necessary to keep `06-validate.response.json` byte-identical.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** dependency evaluation finds nothing on the scratch workbench (`depends_on: []` in both packages), and the plan itself adds `report-missing`, `report-changed` and `recovery-blocked` to `validate` (step 7 line 166, line 67). Two checks alone would move the pair: the status-copy scan (`260928-1200-parser-fix.md` carries `**Status:** open`) and resolving the `done` package's dangling plan and evidence ids. See C18.
- **Conceded:** first partner, round 1 — the two counter-examples above.

### C8 — `claim` and `release` as thin plan functions over the shared kernel satisfy Prior's shared-enforcement condition, including the `claim`-only refusals `claimed-at-required` and `already-claimed`.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `already-claimed` holds (a `claimed → claimed` transition is refused `conflict`, `transitions.ts` lines 172-175); `claimed_at: null` is schema-valid on `transition` (`package.schema.json` lines 34-39) and the claim rule checks presence only (`transitions.ts` line 193), so a `transition` to `claimed` with a null time lands where `claim` refuses: the less-checked bypass Prior rules out. See C20.
- **Conceded:** first partner, round 1 — `package.schema.json` lines 34-39 with `transitions.ts` line 193.

## What could not be decided

### C16 — Prior accepts that claim ownership is decided by the host (from `show`, made binding by the expected revision) rather than checked by the kernel, although Prior lists "checkout/person binding, claim ownership" among the checks that must run through the same kernel.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 2
- **Evidence:** re-examined at Prior `590dca5`, still undecidable. `fusion-fj01-prior-response.md` lines 138-140 list claim ownership among checks that must apply to both entry points through the same kernel, and `fusion-fj01b-prior-response.md` lines 90-91 keep that; but the same list starts with authorizer checks, which run on the host (`codec_process.go` lines 35 and 89), and spec line 526 has the host require a current ownership check before new work, so "through the same kernel" may mean the same route rather than the kernel doing the check. Prior's `Authorize` has only a test stub returning nil (`codec_process_test.go` line 115). The missing input: a Prior ruling on whether ownership is met when the host decides it from `show` and the expected revision binds it, for `release` and every `transition` out of `claimed`, or whether the kernel must compare an identity carried in the request (which C23 prices). To be asked as the plan's request 22.

## Open dissent

## Recommendation

This recommendation binds nothing; the plan's approval and the two decision records stay the user's.

The plan's architecture holds: one kernel for every operation, a durable intent as the commit point, the three-way recovery, one workbench-wide lock (C1), evidence beside its report (C2) and a self-ignoring `.json-state/` (C3). Its text does not yet hold, and should be revised before approval, on these points, each with its claim:

- The read protocol names the after-snapshot's listing order (`journal/` before `ops/`) and ignores dot-temp names (C5, C17); `fileState` tests post before pre (C4).
- The journal treats dot-temp files in `journal/` as uncommitted (C11), reads intents under a bound that covers their sum rather than the per-record 1 MiB cap, or stores post-bytes so that the cap cannot be exceeded (C12), and the replay lookup consults `journal/<id>` as well as `ops/` (C13).
- The lock reaps a dead recorded holder at once, keeps the age rule only where no PID is recorded, records the host, and closes the reap race (C9, C10, C21); a blocked intent does not force every read under the lock (C22).
- `.json-state/.gitignore` is written atomically whenever it is missing, from `acquireLock` (C19).
- `validate` keeps its finding set for the reason C18 states, not "exactly" (C6).
- The `claimed_at` check moves into the transition plan function for transitions into `claimed`, with one refusal on both routes (C8, C20).
- Step 3 names every test it turns red (C14: `ops.test.ts` lines 106-110), the README line and the manifest notes; the evidence naming rule says what a correction with an unchanged report is called (C2).
- The plan re-surveys against Prior `590dca5` and cites `fusion-fj01b-prior-response.md` (C15), and adds to `REQUESTS.md` a request asking the Prior side whether claim ownership is met by the host deciding from `show` with the expected revision binding it, or must be compared by the kernel against an identity in the request, for `release` and every `transition` out of `claimed` (C16, priced by C23).
