# Reconciliation — session `260810-0844-orchestrator-session.md`, range `18b6094..ed87d87`

**Agent:** reconciler
**Domain:** `code`
**Started:** 260810-1205
**Status:** Complete
**Scope:** final reconciliation for orchestrator session `260810-0844-orchestrator-session.md`. No active Circle (`.active-circle` absent), so every store resolved to `shared/`.
**Session history file:** `260810-0844-orchestrator-session.md` (Coherence section appended by this pass)

---

## What was verified

| Store | Files read | Files changed |
|---|---|---|
| `shared/issues/` | 147 (43 `_o_`, 104 `_c_`) | 3 edited, 2 filed |
| `shared/decisions/` | 23 (8 `_o_`, 4 `_a_`, 11 `_i_`) | 3 edited, 1 renamed `_a_` → `_i_` |
| `shared/planning/` | 6 (1 `_o_`, 5 `_c_`) | 0 |
| `shared/reviews/` | 4 dated `260810`, 2 in the session window | 0 (annotation not needed — both already carry their ranges and verdicts) |
| `shared/history/` | 12 recent + the session file | 1 appended (`## Coherence`) |
| `fusion-workbench/tasklist.md` | read only, not rewritten — taskplanner's file | 0 |

Ground truth was git and the filesystem: `git log --diff-filter=R -M`, `git log --diff-filter=A`, `git cat-file -e` per cited hash, `git ls-tree` per release tag, and direct reads of `.guard-state/`.

---

## Discrepancies against the session's own account

Nine. Six are counting or coverage errors in the session's reporting; three are tracking-file states that had drifted.

### 1. Sixteen commits in the range, not seventeen

`git rev-list --count 18b6094..HEAD` → **16**. The session reported 17.

### 2. Twenty records closed, not eighteen — and fifteen filed, not thirteen

Measured: 15 `_o_`→`_c_` renames plus 5 records added directly as `_c_` in `ed87d87` (filed by the `1032` review and closed by `df75004`/`49e5b1d` before anything was committed, so git records an addition rather than a rename). Filed: 15 files in `shared/issues/` with a stamp `>= 260810-0844-orchestrator-session.md`.

Both errors are the same size in opposite directions, so `48 − 20 + 15 = 43` and `48 − 18 + 13 = 43` both reproduce the observed endpoint. The endpoint invariant cannot detect this. Filed as `260810-1205_*_the-session-closure-and-filing-counts-are-hand-maintained-and-both-drifted-by-two-against-the-disk.md`.

### 3. Three decisions filed, not four

`260810-0920_*_what-should-a-churn-key-be-anchored-to-and-what-happens-to-the-535-entries-already-recorded.md`, `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`, `260810-1010_*_should-a-test-learn-a-scripts-extension-set-by-reading-its-text-or-by-asking-bash.md`. The prompt to this pass said four and then listed three; `agentstate.yaml` and `orchestrator-live.md` both say three and are right. Open decisions moved 5 → 8, consistent with three.

### 4. Open defects ended at 43, not "roughly 44"

Exact, not approximate: 43.

### 5. Seven commits reached `HEAD` and a pushed tag with no review pass, not one

The session admitted "Turn 5's own commits". Measured against the two review files' own declared ranges:

- `0939` review covers `18b6094..a7c2b03` — Turn 1.
- `1032` review covers `7f617b1..7ddacbc` — Turn 3.
- Unreviewed: `ac68437`, `72b798e` (Turn 2), `df75004`, `8796ade`, `49e5b1d`, `205ae06` (Turn 4), `ed87d87` (release).

**Turn 2's omission was declared, not overlooked.** The `0939` review's header states that `agents/orchestrator.md`, `skills/next/SKILL.md` and `skills/circle-stash/SKILL.md` "were not opened" — exactly the files `ac68437` and `72b798e` changed. Nothing re-queued them. That `72b798e` warranted a second look is not hypothetical: `260810-0947_*_the-circle-stash-exclusion-test-describes-a-mechanism-and-a-code-shape-that-no-longer-exist.md` was a real defect in that change, found by the T6 *executor* reporting outside its own scope rather than by any reviewer, and fixed in `8796ade`, which was also never reviewed.

Filed as `260810-1205_*_seven-of-sixteen-commits-in-the-session-range-never-reached-a-review-pass-and-nothing-measures-the-gap.md`.

### 6. The review filenames' Turn numbers are not this session's Turn numbers

`260810-0939-coderev-turn-3-*` is this session's **Turn 1**; `260810-1032-coderev-turn-4-*` is its **Turn 3**. The counter continues across sessions (`turn-1` at `0512` and `turn-2` at `0752` belong to session `260810-0241-orchestrator-session.md`). The session's prose account — "Turn 1 and Turn 3" — is correct against the ranges; the filenames are what mislead. Not filed: the ranges are in the filenames too, and they are unambiguous. Noted so a future reader does not "correct" the prose to match the names.

### 7. `260809-2310_*_should-the-branch-policy-fall-the-way-the-write-classifier-fell.md` was answered and implemented, and still read `_a_`

The decision "should the branch policy fall the way the write classifier fell" carried `Implemented: <set when status moves to _i_>` — the untouched template placeholder — while its own body already stated that the code it governs no longer exists. Verified: `7598073` (2026-08-09 23:51) deletes `hooks/lib/git-branch-guard.ts`, `hooks/lib/shell-parse.ts`, `hooks/lib/command-word.ts` and four test/fixture files. **Renamed `_a_` → `_i_`**, `**Status:**` set to `implemented`, `Implemented:` line written with the hash and the verification.

### 8. `260810-0508_*_fifteen-commits-landed-with-no-plugin-version-bump.md` closed with no commit citation

The only one of the twenty closures with no hash on its `Resolved:` line. Reads as an omission rather than as intent: the closing act was the release, and the release **is** a commit — `ed87d87`, which is also what `v7.1.0` points at. The other nineteen all cite one. **Corrected in place:** the line now opens `Resolved: ed87d87 — the range became a release. …`, with the existing text untouched.

### 9. Two decision cross-references pointed at markers that had moved

`260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md` cited `260810-0508_*_…` (now `_c_`) and `260810-1010_*_should-a-test-learn-a-scripts-extension-set-by-reading-its-text-or-by-asking-bash.md` cited `260810-0939_*_…` (now `_c_`, and its own parenthetical already said "closed by `c546ef0`"). Both **wildcarded to `_*_`** on the precedent set in `260807-0158_*_how-is-a-unique-record-filename-obtained.md`. The general problem is already open as `260808-0030_*_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md`.

---

## What the session's account got right

Checked and confirmed, so the record shows what was tested rather than only what failed:

- **Every cited hash exists and is in range.** Twelve distinct hashes across the twenty `Resolved:` lines — `e39b3fe`, `205ae06`, `72b798e`, `ac68437`, `4bf509e`, `a7c2b03`, `38fe341`, `c546ef0`, `98c8b3f`, `8796ade`, `49e5b1d`, `df75004`. Each resolves via `git cat-file -e` and each appears in `git rev-list 18b6094..HEAD`. No dangling citation, no hash from another branch, no typo.
- **All twenty closures carry a `Resolved:` line.** None closed silently.
- **The two `Decision filed:` cross-references resolve.** `260809-2023` → `260810-0920_*_…` exists; `260810-0352_*_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md` → `260810-0921_*_…` exists. Both records correctly remain `_o_` with no code changed, which is what "a decision precedes the fix" requires.
- **The release is real and complete.** Tag `v7.1.0` → `ed87d87`. `plugin.json` at `7.1.0`; `install.sh:27` and `README.md:26` both name `tags/v7.1.0`. The marketplace clone at `/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins` was not readable from this pass, so that fourth surface is **unverified here** — the session's own account of it stands unchallenged rather than confirmed.
- **Working tree is clean** apart from the session history file, which the orchestrator was editing concurrently.

---

## The specific question about `260810-0352_*_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md` — the record stays open, and the reasoning is not the one the session gave

The session's framing was "its workaround is a release; the release happened". The record does not say that. It says: *"Workaround that works today: `fusion --update` and restart the session."* Measured:

- `git ls-tree v7.0.0 bin/` does **not** contain `fusion-count-sources`; `git ls-tree v7.1.0 bin/` does.
- `2910cf6` (the commit that added the call site) is **not** an ancestor of `v7.0.0`, confirming the record's premise.
- `~/.fusion` still reports `"version": "7.0.0"` and already holds `bin/fusion-count-sources` at mtime `Aug 10 08:43` — one minute before this session's Setup at `08:44`. The workaround was taken by hand before the session started, which is why Setup Step 5 never failed here.

So the release did not close the instance; a manual `fusion --update` had already closed it, and the release makes the fix durable for anyone installing from here on. **Agreed: it stays `_o_`, but for the stronger reason.** The record names three questions, all about the mechanism. Question 1 — does Setup Step 5 tolerate a missing helper or halt? — is unchanged in code: `agents/orchestrator.md` still names the helper through `$FUSION_PLUGIN_ROOT` with no absence branch, so the next helper added between releases reproduces this exactly. Closing it would also orphan `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`, which cites it as *the instance*.

Evidence appended to the record.

---

## `tasklist.md` — reported, not rewritten

`fusion-workbench/tasklist.md` was not touched by this session and is not touched by this pass. It is taskplanner's file.

**State:** generated `2026-08-10 02:49` at `8960e1a`, which is **41 commits behind `HEAD`** and two sessions back. It inventories "the 34 open defect records in `fusion-workbench/shared/issues/`". There are now 43.

Measured against disk — 36 record filenames cited, resolved by stamp and topic:

- **12 are now `_c_`.** Only one of those (`260809-2049_*_clear-halt-discards-a-halt-raised-between-its-load-and-its-save-and-tells-the-human-it-cleared.md`) was closed by this session; the other eleven were closed by session `260810-0241-orchestrator-session.md`, between the queue's build time and this session's start. The queue was already stale when this session began.
- **23 are still `_o_`** and remain valid queue entries.
- **1 does not resolve** — `260809-1731_*_how-should-the-domain-heuristic-count-a-projects-source-files.md` is a *decision*, now `260809-1731_*_…` in `shared/decisions/`, cited into the queue under its old marker.

Two of its head statements are also stale: "34 open defect records" (now 43) and "open decisions in `shared/decisions/` (there are four" (now eight).

**The refusal to tick an entry was correct.** An executor declining to edit the queue while other agents were running is the right call — the queue has one writer. The cost is that the file now understates completion by twelve and is blind to fifteen records filed since. It needs a taskplanner rebuild before it is dispatched from again; it is not usable as-is.

---

## Open-decision surface

Eight open decisions. All eight are user-input gates: none has an executor-actionable answer, and dispatching an executor at any of them produces a guess. Three were filed by this session.

### HIGH — blocks work already queued

| Record | Question | Why it blocks |
|---|---|---|
| `260810-0920_*_what-should-a-churn-key-be-anchored-to-and-what-happens-to-the-535-entries-already-recorded.md` | What is a churn key anchored to, and what happens to the entries already recorded? | `260809-2023_o_` is an open defect that states in its own body that a decision precedes the fix. No code moves until this is answered. **The number in its title has moved:** `.guard-state/churn.json` now holds **588** entries under `files`, against the 535 the title names — measured at `ed87d87`. The answer must name a rule, not a count. Evidence appended. |
| `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md` | How does a prompt call a `bin/` helper the installed copy may not have? | `260810-0352_*_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md` is blocked on it, and the class reproduces on every new helper added between releases. The record carries a recommendation for question 1 (report the absence in the cascade's own `counted_by=none` vocabulary rather than emitting a shell 127) that has not been taken. Evidence appended. |
| `260810-1010_*_should-a-test-learn-a-scripts-extension-set-by-reading-its-text-or-by-asking-bash.md` | Does a test learn a script's extension set by reading its text, or by asking bash? | Two rounds of fix have already landed on this surface (`38fe341`, then `c546ef0`), each closing the previous round's shape. `rules/critical-stance.md` §4 is cited in the record: this is the "the question is cut wrong" signal, and a third patch without the decision is the predictable next round. |

### MEDIUM — shapes implementation, nothing currently blocked

| Record | Question |
|---|---|
| `260810-0710_o_` | Should a rule be allowed to land without the check that enforces it? Carries counter-evidence in both directions — one instance where a missing lint cost a defect, three lints of doubtful value from the same Turn. The review-coverage defect filed by this pass lands beside it as a fourth instance. |
| `260810-0718_*_should-rebuild-map-merge-with-the-existing-map-or-replace-it.md` | Should `push --rebuild-map` merge with the existing map, or replace it? The surface moved this session — `98c8b3f` made `map --rebuild` a command of its own and `df75004` fixed its failure handling — so the question is now asked of a different implementation than the one it was filed against. Worth re-reading before answering. |
| `260809-1224_*_is-the-decision-governed-escalation-check-3-a-live-feature.md` | Is the decision-governed escalation (CHECK 3) a live feature, or a retired one still carrying its configuration surface? |

### LOW — cosmetic or interface-level

| Record | Question |
|---|---|
| `260806-1152_o_` | Do `original_circle_dirname` and `active_circle_content` both need to exist in the stash manifest? |
| `260807-2131_*_which-language-governs-a-customer-deliverable.md` | Which language governs a customer deliverable, when chat and artifacts declare different ones? |

### Answered decisions awaiting realisation

Three `_a_` remain after this pass moved `260809-2310_*_should-the-branch-policy-fall-the-way-the-write-classifier-fell.md` to `_i_`. All three were re-checked and all three correctly stay `_a_`:

- `260719-2141_a_` — the answer is the *absence* of a concurrency mechanism; there is no commit that implements a non-feature. A prior reconciliation left this as a deliberate judgement call for the user, and that reasoning still holds.
- `260801-1020_a_` — realisation belongs to `260801-1244-curator`, which is `_a_` and unstarted. `agents/` still holds sixteen prompts, no `curator.md`.
- `260807-0158_a_` — its own line citation went stale, which is filed separately as `260808-0030_o_`.

---

## Misfiled — should be a decision

None. Every `_o_` record checked this pass reads as a defect with a verifiable fix, and the two that named a decision as their precondition (`260809-2023`, `260810-0352_*_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md`) correctly stayed as defects with the decision filed beside them rather than being converted. That is the pattern working as intended.

---

## Files changed by this pass

**Edited:**

- `260810-0508_*_fifteen-commits-landed-with-no-plugin-version-bump.md` — `Resolved:` line now cites `ed87d87`
- `260810-0352_*_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md` — reconciliation evidence, stays `_o_`
- `260809-2255_*_the-branch-policy-verification-left-an-active-halt-…md` — reconciliation evidence; criterion 1 met (`escalation.json` reads `haltActive: false, consecutiveBlocks: 0`), criterion 2 not met and arguably moot with the policy deleted. Stays `_o_` as a closure candidate for the user — the criterion is written as a rule obligation, not a state fact, so it is not the reconciler's call.
- `260810-0920_*_…` — churn entry count re-measured (535 → 588)
- `260810-0921_*_…` — stale cross-reference wildcarded; evidence on which half of the gap the release closed
- `260810-1010_*_…` — stale cross-reference wildcarded

**Renamed:**

- `260809-2310_*_…` → `260809-2310_*_should-the-branch-policy-fall-the-way-the-write-classifier-fell.md`

**Filed:**

- `260810-1205_*_seven-of-sixteen-commits-in-the-session-range-never-reached-a-review-pass-and-nothing-measures-the-gap.md`
- `260810-1205_*_the-session-closure-and-filing-counts-are-hand-maintained-and-both-drifted-by-two-against-the-disk.md`

**Appended:**

- `260810-0844-orchestrator-session.md` — `## Coherence` section only

**Not touched:** `fusion-workbench/tasklist.md` (taskplanner's), all code and data files, the four review files, the one open plan.

---

## Net effect on the stores

Open defects `43 → 45` (two filed by this pass). Open decisions `8 → 8`. Answered decisions `4 → 3`, implemented `11 → 12`.
