# Does Prior's a1fb17a contract govern each of the contradictions C8 to C16 in the FJ04 plan, and which option settles C9

---
**Domain:** data
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Partners:** orchestrator and consultant
**Rounds:** 7
**Ceiling:** 8
**Outcome:** converged
**Cross-references:** 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md, 260928-1338-json-control-data-and-markdown-artefacts.md

---

## Question

The implementation-planner amended the FJ04 plan for the Prior side's answer at Prior `a1fb17a` (section `## Amendment for Prior a1fb17a`) and named nine contradictions, C8 to C16, between Prior's contract and what the plan, `REQUESTS.md`, the committed codec and the local branch `wip/fj04-step6` (`82cdd208`) already carry. It proposes that Prior's contract governs each, and for C9 recommends option 1 (the codec's `survey` returns `eligible_sha256` and the host adopts it) over option 2 (the host recomputes). The plan-review approval was open when the user started this discussion, before ruling.

## What held up

### C1 — C8: restricting migration exclusions to Prior's fixed allowlist costs fusion's own workbench nothing, because its root holds nothing outside that allowlist.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `ls -la fusion-workbench` at this checkout: eight operational entries, all on Prior's list in their allowed kind, none a link; the other root entries are the three stores, `orchestrator-live.md` (written by nothing, `rules/workbench-tracking.md`) and `stilwerk/` (copy-if-missing, `skills/setup/SKILL.md:112`), both merely inventoried and frozen under the committed `plan` (`codec/src/migration.ts:754-755`). Scope: this checkout only.

### C2 — C9: option 1 (codec `survey` returns `eligible_sha256`, the host adopts it) is preferable to option 2 (host recomputes), because option 2 is a second implementation of the canonical inventory form; it does not break "the host reads, the codec writes".

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `survey` already runs the one `inventory()` (`codec/src/migration.ts:168-188`, `:243-249`); option 1 binds the composed proposal only if the host survey runs after the last repair (plan line 553) and `composeProposal` takes survey's entries as its inventory (`hooks/lib/legacy-import.ts:337-343`, plan line 549); `survey` writes nothing.

### C6 — C13: the WIP order (evidence before replay detection) can wrongly refuse a legitimate replay; Prior's explicit validated `progress` list with replay first is the correct order.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** WIP `cli/ops.ts` `maintenance` calls `rollbackComplete` before replay detection; WIP `migration.ts:1647-1650` `storedAnswers` fails on any unreadable stored answer, so one corrupt unrelated answer refuses `end`'s replay. Softened: WIP `migration.ts:1700-1702` also checks migration id and numeric chunk, so "heuristic" overstates it.

### C9 — C16: Prior's "known incoming citations from other documents" is undefined in Prior's response; the plan's reading is an inference and should go back to Prior as a question.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** Prior `docs/design/fusion-fj04-amended-contract-prior-response.md`, section "Two remaining contract-text corrections"; the plan labels its reading an inference (plan line 233).

### C10 — The WIP `rollback.json` is unsound against an edit between the first rollback and later fresh chunks; Prior's hash binding closes exactly this.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** WIP `migration.ts:~1621-1637` `readBinding` checks keys, `migration_id` and types only; `:1073` `ownDirectory` skips its hash; an added exempt entry or changed fence is trusted at `:1789-1791`, `:1832`.

### C11 — The held-intent mechanism (`heldOf`, `isHeld`, `Blocked.held`) arrived in `e5a476bc`, after the qualified bundle; the plan's "the qualified bundle stays `e1bafd2f`" is accurate only as "the last qualified" bundle, and HEAD's bundle is unqualified.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `isHeld` absent at `e1bafd2f`; HEAD `codec/dist/fusion-record.js` hashes to `c30b018b…`, not `6b26faf2…`; plan line 187.

### C12 — `hooks/lib/citation-scan.ts` has no step-anchor grammar, so the plan's operational reading of C16 ("citations `citation-scan.ts` resolves to the duplicated step") cannot find step-level incoming citations as written.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the file's grammar header covers record basenames, stamp-names, package directories; its only "step" hit (line 822) is unrelated; plan line 233.

### C14 — The plan's step 13 handoff to Prior does not name the held-intent mechanism (`heldOf`, `isHeld`, `Blocked.held`) or the W7 `isHeld` fix as kernel-level changes Prior must re-qualify; it should.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** plan lines 599-611 name neither; line 605's "each pinned path that differs from Prior's pin at `e1bafd2f`" does not cover it, because Prior's `tests/testdata/fusion-codec/UPSTREAM.json` does not list `codec/src/kernel.ts` and `tests/testdata/fusion-fj01/UPSTREAM.json` pins the bundle, its digest, `bin/fusion-record`, `REQUESTS.md` and fixtures (325 entries) but no `codec/src` path (corrected in round 4; the conclusion is unchanged); `git diff e1bafd2f HEAD -- codec/src/kernel.ts` is +73/−7, reaching the general recovery loop (`kernel.ts:310-311`) and the read path (`heldView`, `:498`); Prior's a1fb17a answers "are contract decisions, not qualification of a migration runtime" (response lines 11-12).

### C17 — The ab9cb59 row at plan line 164 named a step that was already done when the row was written, so it was never correct; a one-line pointer to line 556 suffices if it is corrected at all.

- **Advanced by:** consultant
- **Entered:** round 3
- **Last moved:** round 3
- **Evidence:** `git log -S'A duplicate-number repair edits the ambiguous citations'` on the plan's directory finds only `4ef69265` (2026-10-02 08:29); step 8's `680c509f` (2026-10-01 22:10) is its ancestor (`git merge-base --is-ancestor` exits 0).

### C18 — None of the rulings (Prior's contract on C8 to C16, C9 option 1) makes fusion depend on Prior at runtime; the codec runs as a plain Node bundle via `bin/fusion-record`.

- **Advanced by:** first partner
- **Entered:** round 5
- **Last moved:** round 5
- **Evidence:** C9 option 1 copies `eligible_sha256` from fusion's own `survey` (plan:553); the bundle needs no `node_modules` (`bin/fusion-record:60-61`, `install.sh:91-92`) and is exec'd at `bin/fusion-record:83`; no qualification check on the path (`6b26faf2` occurs 0 times in the bundle). Two corrections: at HEAD `apply`, `verify`, `rollback` answer `not-implemented` until step 6 lands (`bin/fusion-record:26-27`, plan:367); and `install.sh:54-57` treats a missing `node` as a warning only, so migration makes Node a hard requirement the install does not.

### C20 — Prior's re-qualification gates nothing at runtime in a Claude Code installation; it is a release fact. Sessions running this branch's bundle run unqualified kernel code; no released install runs any codec yet.

- **Advanced by:** first partner (narrowed by the consultant)
- **Entered:** round 5
- **Last moved:** round 5
- **Evidence:** no runtime gate (C18); plan:659 states qualification as a precondition of the real migration; HEAD bundle `c30b018b…` ≠ `6b26faf2…` (C11); `main` is at 11.11.2 and `git ls-tree main codec/dist/` is empty. Prior's message of 2026-10-02 (pasted by the user, matching its response lines 12, 17, 223-224): "Dokumentprüfung grün; die Laufzeitqualifikation folgt mit dem neuen Bundle."

### C22 — The plan makes Prior's re-pin and conformance run a precondition of any real migration, including for a user on arrangement 1 alone: a release-time dependency on Prior, so arrangement 1 cannot ship FJ04 to its own users until Prior acts.

- **Advanced by:** consultant
- **Entered:** round 5
- **Last moved:** round 5
- **Evidence:** plan:659.

### C23 — The plan's divergence detection covers only the run window on the local disk; a checkout on a v12 install that edits Markdown and merges after activation is outside every hash check, and the plan keeps `plugin.json` at 12.0.0 where Prior's §8.1 recommends a major version change and a quiescence step before activation.

- **Advanced by:** consultant
- **Entered:** round 5
- **Last moved:** round 5
- **Evidence:** plan:12, :681 (detection scope); step 10 "other checkouts pull" (plan:566); plan:660 (version stays 12.0.0); Prior `concept/fusion-json-workbench-spec.md:652-662`.

### C26 — The codec already computes a post-activation signal for the commonest v12 write (a package `**Status:**` edit: `reconcile.narratives` reporting `status-copy-in-narrative`), but no host reader at HEAD surfaces it; a Claude-side reader reporting `narratives` findings is a cheap partial mitigation for C23, natural owner FJ03d or step 9's `status`.

- **Advanced by:** consultant
- **Entered:** round 6
- **Last moved:** round 6
- **Evidence:** `codec/src/cli/ops.ts:2116-2156`; `rules/fusion-workbench-conventions.md:193`, `:200`; no consumer of `narratives` under `hooks/`, `bin/`, `skills/`, `agents/`. Whether to build it is the user's call.

### C27 — The plan's Risks row at line 681 reads as if hash checks mitigate a v12 checkout writing after activation; it should state as a limit that this is prevented only by the §8.1 procedure (every writing installation updated first), and keeping `plugin.json` at 12.0.0 (plan:660) removes the version signal §8.1 relies on.

- **Advanced by:** consultant
- **Entered:** round 6
- **Last moved:** round 6
- **Evidence:** plan:681, plan:660; Prior `concept/fusion-json-workbench-spec.md:669-674`.

## What fell

### C3 — C10: because `StoredAnswer` carries no time or order, a set comparison against a basis frozen at `plan` is required, not merely preferable.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** facts hold (`codec/src/journal.ts:79-84`, `:66`; WIP `migration.ts:1690`; committed `migration.ts:648-663` infers no chronology), but they require only some newly recorded basis — a set frozen inside `verify`'s intent or a sequence field would also decide it. The plan-frozen set is required by Prior's R3, not by the journal.
- **Conceded:** first partner, round 1 — the alternatives named above are sufficient; the change stands on Prior's R3 alone.

### C4 — C11: a hash of the pre-manifest tree does not bind what was activated.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the receipt carries `manifest_revision` (WIP `migration.ts:1541`; `REQUESTS.md:1693`), checked against the live manifest at first rollback (`receiptHolds`, WIP `:1741-1743`) before the eligible tree is hashed (`:1824`); digest plus revision bind the activated tree. The change stands on Prior's answer to 52 only.
- **Conceded:** first partner, round 1 — `receiptHolds` at WIP `:1741-1743`.

### C5 — C12: the WIP `rollback.json` handling is unsound against a file edited between replays.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** a replay never reads the file; the kernel answers from the stored answer before the plan function runs (`codec/src/kernel.ts:321-324`). The real gap is between fresh later chunks (C10). `REQUESTS.md:1896` "every replay checks that file" is wrong for Prior's reason: chunk 0 deletes the file.
- **Conceded:** first partner, round 1 — `kernel.ts:321-324`; the claim is superseded by C10.

### C7 — C14: the `isHeld` defect sits in already-committed, Prior-qualified kernel code, so fixing it requires Prior to re-qualify the kernel beyond the migration operation.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the defect holds (`kernel.ts:229-232`; `recover()` at `:308-314` lands the intent before `operation-id-reused` at `:318-321`), but `isHeld` first appears in `e5a476bc`, absent at the qualified `e1bafd2f`; no re-qualification beyond the step-13 handoff is triggered.
- **Conceded:** first partner, round 1 — the history of `isHeld` (C11).

### C8 — C15: moving `revisions` into the envelope collides with step 6's criterion 5 if a recorded session carries a `plan` answer.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the move concerns `apply`'s answer (W8, plan line 436); committed `plan` answers carry no `revisions` (`migration.ts:701`); no recorded session request under `codec/fixtures/` carries a `migration` operation — `migration` occurs only as a value in `inspect` deltas (e.g. `protocol-session-archive/01-inspect.migration-delta.json:26`). Criterion 5 (plan line 480) is untouched.
- **Conceded:** first partner, round 1 — the fixture grep.

### C13 — The amended plan grounds at least one of C10, C11, C12 on a reason that fell in round 1, so its text must be corrected before approval.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** C10's ruling (plan line 227, W3 at line 422) rests on Prior R3 and Prior's own "Neither UUID order nor file mtime proves which answers landed after verify" (response lines 94-97), and line 235 calls Prior's mechanism "a different question that can be decided", not one the journal makes required; C11 (line 228, red run 11 at line 474) only contrasts what the hash covers and never claims the pre-manifest hash fails to bind; C12 (line 229) quotes `REQUESTS.md:1896` and W5 (line 429) states replays never read the file, agreeing with `kernel.ts:321-324`.
- **Conceded:** first partner, round 2 — plan lines 227-229, 235, 429.

### C15 — The C16 duplicate-step repair belongs to the done step 8, so ruling "Prior governs" reopens done work, and given C12 it cannot be implemented without a step-anchor grammar or Prior's definition, so it needs a request 53 to Prior first.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** the amendment gives the rework to step 9, not step 8 (plan line 233; step 9's file list gains `hooks/lib/legacy-repair.ts`, line 552; consented edit, line 556), as the 2026-10-01 ruling already did for the closure-record actor (line 545). The step-anchor branch is fusion's own to build: `legacy-repair.ts:182` has an in-file `\b[Ss]teps?\s+<id>\b` matcher, and each rewrite is put to the owner one by one (line 556), so a broad candidate search only adds questions. A request 53 is a sound choice, not a precondition (restating C9); `REQUESTS.md` ends at `### 52` (line 1892). One leftover: the ab9cb59 table at plan line 164 still points the citation edit at step 8 (committed `680c509f`, before `4ef69265`); line 187 makes the a1fb17a section govern, so step 9 owns it.
- **Conceded:** first partner, round 2 — plan lines 233, 552, 556 and `legacy-repair.ts:182`.

### C16 — The ab9cb59 table at plan line 164 must be corrected to point the C7 citation edit at step 9 before the plan is approved, or a step-8 dispatch would miss the work.

- **Advanced by:** first partner
- **Entered:** round 3
- **Last moved:** round 3
- **Evidence:** step 8 is `[DONE]` (plan line 507, `680c509f`), so no step-8 dispatch remains; step 8's own text says in-file citations are "listed, not edited" (lines 518, 529); step 9 carries the whole edit (lines 552, 556); precedence is explicit (lines 187, 218, 545). Correcting line 164 is optional tidying.
- **Conceded:** first partner, round 3 — plan lines 507, 529, 556.

### C19 — The migration is driven end to end from Claude Code by a fusion skill or helper, according to the plan's steps 9 to 13 and what exists at HEAD.

- **Advanced by:** first partner
- **Entered:** round 5
- **Last moved:** round 5
- **Evidence:** holds for the plan (step 9 drives every phase from `bin/fusion-migrate`, "the host writes no fusion JSON", plan:550; step 10 from `/fusion:migrate`, plan:566; no Prior tool in steps 9-11), but not for HEAD: `bin/fusion-migrate` does not exist and `skills/migrate/SKILL.md` has no JSON phase.
- **Conceded:** first partner, round 5 — the HEAD half; the plan half stands.

### C21 — Nothing in fusion's Claude Code surface is wired to check quiescence before `apply`; the plan handles it only by detection.

- **Advanced by:** first partner
- **Entered:** round 5
- **Last moved:** round 5
- **Evidence:** step 9's `run` preconditions include "a live `.session-marker` or monitor reported" (plan:550). Residual that holds: the marker is orchestrator-only and advisory (`bin/fusion-session-mark:2-17`), not written when the cached check is skipped (`skills/check/SKILL.md:44`), "reported" is not "refuse", and the commit lock is not involved — so a second non-orchestrator session is caught only by hash detection.
- **Conceded:** first partner, round 5 — plan:550.

### C24 — The kernel's held-intent paths (`heldOf`, `isHeld`, `heldView`) are reached on a workbench without JSON control with an effect different from `e1bafd2f`, so C14's unqualified code touches a Claude Code session that never migrates.

- **Advanced by:** consultant (as an open question, round 5)
- **Entered:** round 5
- **Last moved:** round 6
- **Evidence:** the session's codec calls are `inspect` (`skills/wp/SKILL.md:15`, `skills/discuss/SKILL.md:19`, `skills/archive/SKILL.md:27`, `skills/check/SKILL.md:76`), `list` (`skills/archive/SKILL.md:262`) and `list`/`show`/`validate`/`reconcile` via `hooks/lib/record-client.ts`; nothing sends `migration`, and setup returns `how: "legacy"` before `initialize` (`hooks/lib/record-write.ts:506-509`). `inspect` never touches `isHeld` (`codec/src/cli/ops.ts:261-262`, `:446-498`). The read path runs `heldView` (`kernel.ts:593`), but `pendingIds` returns `[]` with no journal (`journal.ts:206-210`), so the `isHeld`/`heldOf` loop (`kernel.ts:506-508`) visits nothing and returns `NO_VIEW` (`:510`), identical to `body(NO_VIEW)` at `e1bafd2f` (`kernel.ts:527` there). No journal can arise: `mutate` refuses `legacy` (`kernel.ts:289-290`; `ops.ts:392`, `:545`), and a lone committed `initialize` still yields `NO_VIEW` (`kernel.ts:233`). C14 stands, scoped to migrating or JSON-controlled workbenches.

### C25 — Something after activation (`reconcile`, the readers) detects a Markdown edit merged from a checkout still on a v12 install (fell as "no general detector", not "no signal of any kind": see C26).

- **Advanced by:** consultant (as an open question, round 5)
- **Entered:** round 5
- **Last moved:** round 6
- **Evidence:** no general detector: the narrative hash is computed from the live file and never stored (`codec/src/store.ts:322`, `:360`, `:378`); no codec check finds an unpaired Markdown record; the FJ03a `gate()` checks workbench state via `inspect` (`record-client.ts:253-302`) and a git merge passes no hook; plan steps 9-11 add nothing after activation (plan:547-575). Partial, accidental signals exist — `narrative-missing` for a marker rename (`ops.ts:631`), `status-copy-in-narrative` and `conflict-markers` (`ops.ts:2116`, `:2131-2156`) — but no host code reads the `narratives` section, and `/fusion:reconcile` dispatches the Markdown-reading state-auditor (`skills/reconcile/SKILL.md:9`, `agents/state-auditor.md:62`). The absence is by design: Prior spec §8.1 (`concept/fusion-json-workbench-spec.md:669-674`) prevents by procedure (every writing installation updated first; a new manifest cannot lock old programs out), §8.4 (`:793-796`), FJ03d (`:812`).

## What could not be decided

## Recommendation

This recommendation is qualified and binds nothing; the user rules, and a decision record may rest on this discussion.

Prior's a1fb17a contract can govern each of C8 to C16, and C9 is best settled by option 1 (the codec's `survey` returns `eligible_sha256` and the host adopts it): every ruling stands on Prior's contract or on facts that held (C1, C2, C6, C9 to C12), and none makes fusion depend on Prior at runtime (C18, C24). Before approval the plan should add: the held-intent mechanism and the `isHeld` fix named in step 13 as kernel-level changes for Prior's re-qualification (C14); the post-activation gap stated as a limit in the Risks row at line 681, prevented only by Prior §8.1's procedure (C23, C27); Node stated as a hard requirement of the migration (C18). The plan's version line (12.0.0, plan:660) removes the signal §8.1 relies on; a major version change is the option that restores it (C23). Optional: a host reader for the codec's `narratives` findings (C26), and a request 53 defining "known incoming citations" (C9, C12). Line 164's stale step reference is optional tidying (C16, C17).

User's ruling at close (2026-10-02, chat): option 1 — close; the planner adds a to c and the version change to 13.0.0; then the plan is put for approval with Prior governing C8 to C16 and C9 option 1.
