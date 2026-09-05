# Orchestrator Session — 260904-1050

**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Directive:** Revise the identity decision. Attribution per git user is not sufficient: fusion needs an identity per local instance, so that several checkouts of one consumer project — on one machine or across several machines belonging to one person, possibly with different git identities — can run orchestrators in parallel. The proposed structure is an alias (petname/ahikunator style) carrying a worker-id (machine id, user name on the machine, local folder), the git name and email, and the real person. `person` aggregates work per human for cadence; the petname differentiates workbenches for the same person. The structure is tracked per project in git. Analyse the problem, test the idea, and put concrete proposals to the user.
**Mode:** custom (analysis first, no implementation this Turn)
**Status:** In progress

## Snapshot at session start

- Workbench: `/Users/k1/Projects/productive/fusion/fusion-workbench`
- Detected domain: `code` — 133 source files, 10 data files, counted by `git ls-files`
- Turn budget: 12, resolved from `fusion.json`; the configuration loader reported nothing on stderr
- git HEAD at start: `cda72f71`
- Open defects in scope: 4 (`shared/issues`, markers `_o_`/`_p_`)
- Open decisions in scope: 5 (`shared/decisions`, marker `_o_`)
- Open specs/plans in scope: 1 — `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`
- Circles: 20 records, all terminal (16 `_c_`, 3 `_b_`, 1 `_s_`). No active and no anticipated Circle, so no portfolio hint was printed.
- Interrupted session: none. `agentstate.yaml` was absent at Setup.
- Setup marker written for plugin version 10.22.0. Stylometric profiles identical to the shipped copies. Permission file already at `bypassPermissions`. Union merge driver for the event log already in force. No helper present in the work tree and missing from the install.

## Prior art the Directive revises

- `260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md` — the answered decision this Directive reopens.
- `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` — the spec whose answers 1, 3 and 8 fix attribution to the person.
- `260824-0613_*_does-a-filing-agent-halt-in-a-tree-that-is-not-a-git-work-tree-at-all.md` — the non-git branch of the current identity helper.
- `bin/fusion-identity`, `fusion-workbench/.checkout-id`, `rules/fusion-workbench-conventions.md` `### Who filed it`, `rules/circle-records.md` `### The claim field`, `rules/workbench-tracking.md` class L.

## Turns

(none yet)

## Turn 1 — the analysis, and what the user answered

The analyst's report is `260904-1058-identity-per-instance-and-the-checkout-registry.md`,
committed as `23ffbe73` together with four decision records and three defects.

**The user chose the report's Option 1, "Checkout registry as an attribute table, hex stays
the key", in these words: "ok, we go for: Option 1. Checkout registry as an attribute table,
hex stays the key (recommended)".** That answer settles two of the four filed decisions and
neither of the other two.

- The registry exists, in shape (a): one tracked file per checkout, `<8hex>.md`, in a new
  store beside the memo store, class R1, written by the checkout it describes and by no
  other. Fields: the eight hex as key, alias, person, git identity, and an optional worker
  note.
- The alias is an **attribute** of the minted identifier, not the identifier. The hex stays
  the value written into `**Claim:**` and into `checkout:` on every event line, so nothing
  already on disk changes and no migration is owed.

Still open, and not covered by that choice: whether a registry entry carries hostname,
account name and folder path at all, and whether `bin/fusion-identity`'s exit-1 halt
survives a registry that can name the person.

## Turn 1 — the worker-field gate

At the plan's step-1 gate the user was shown the decision record's four options as
written, together with the three values option 2 or 3 would publish out of this
checkout (hostname `k1i9`, account `k1`, path `/Users/k1/Projects/productive/fusion`).
**He answered "1": never written.** No `**Worker:**` field and no `--worker` flag come
into existence, and nothing in this project publishes hostname, account name or folder
path. The alias carries the whole "which checkout is this" job.

Two deviations from the plan step, both deliberate and neither silent. The record was
renamed where it lives, in `shared/decisions/`, rather than in "this Circle's copy" as
the step's wording has it: the record was filed before the Circle existed, and the
Origin Rule keeps one record in one location with citations carrying the reach. And the
transition was performed by the orchestrator rather than by the dispatched `analyst` the
step routes to, because recording a user's gate answer and moving the marker is the
orchestrator's own act under Phase 1 step 3.

## Turn 2 — the consumer block

Plan steps 4 to 8. Presence canonicalisation joins a person's git identities at the
classification and at the people set and nowhere else; `/fusion:setup` registers once per
checkout and writes an entry whatever the answer; `/fusion:next` names the holder;
the monitor header and a SessionStart export carry the alias. The `skills/` growth
surface was the binding constraint throughout and was paid by cutting duplication rather
than substance, ending the Turn with 11 bytes free.

**This section was written after the fact.** The reconciliation pass found the session
history running Turn 1, Turn 1, Turn 3, Turn 3, with the Turn the consumer block ran in
missing entirely. The Circle record's Turn log carried it; this file did not.

## Turn 3 — the exit-1 halt gate

The plan's step-9 gate put the decision record's three options to the user as written.
**He answered "1": the halt stays, with its reason restated to the first clause alone.**
Nothing about the behaviour moves. `bin/fusion-identity` halts in exactly the cases it
halts in today, no filing agent gains a halt anywhere, and what changes is the sentence
that says why: a tree which cannot commit produces records no other checkout will ever
see, which stands on its own, rather than the clause about a record naming nobody, which
a registry carrying the person makes false.

## Turn 3 — the tail, and one rule the orchestrator broke itself

Steps 10 to 14 landed. `npm test` reaches exit 0 for the first time this session:
48 files, 825 tests, including the sweep gate that was already red at `cda72f71`
and whose cause turned out to be the corpus rather than the sweep.

**The orchestrator broke its own staging rule at the marker commit.** Step 3b step 4
requires every path passed to `git add` to be written out by hand, and forbids a
directory argument for a measured reason: a directory argument once staged three
renamed records' deletions without their successors. The marker commit used
`git add -A -- <three directories>` because five renames are ten paths and the
friction was real. It captured exactly the six intended files, which is luck rather
than design, and the audit that established that ran after the commit rather than
before it. The friction itself is not new and is already recorded in
`260824-2013_*_how-is-a-marker-rename-performed-and-staged-and-by-whom.md`.

## Where `4ff9d2e0` came from, corrected against the reconciliation's own account

The reconciliation pass found three `Implemented:` lines citing `4ff9d2e0`, a hash that
resolves to no object, and repaired all three. Its explanation is that the hash was the
pre-amend form of `e9c14bdf`. **That explanation is wrong, and the true one is worse.**

No commit in this session was amended. `git reflog | grep -i amend` returns three entries,
all of them dated 2026-08-09, 08-10 and 08-11, none inside this session's range; every
commit here ran `git commit` under the lock with no `--amend` anywhere. That check was
itself run twice, because the first form counted amends across the whole reflog and would
have supported the opposite claim if read carelessly. What happened is
that the orchestrator read the commit's output through `tail -3`, which printed the
`create mode` lines and the lock release and no hash at all, and then stated a hash to the
user and wrote it into three durable records. The value was not misread from an earlier
form of the commit. It was produced without being read.

This is the failure `rules/critical-stance.md` §3 names exactly: an unchecked claim dressed
as a checked one, which that section calls the most damaging of the three. It reached three
records that exist to be the durable trace, and it was caught by a later pass rather than
by the party that made it. The repair is the reconciliation's; the cause is the
orchestrator's, and it is recorded here rather than left standing as an amend that never
happened.

## The sweep gate was green at session start, and this record's title is wrong

The orchestrator told the user twice, firmly, that `citation-sweep.test.ts` was already
red before this session began, and filed a defect saying so. **It was not.** The
measurement ran the sweep **from the installed plugin** against a detached worktree at
`cda72f71`. The gate does not run that binary; it executes this repository's own compiled
output. Re-measured with the work tree's own sweep inside the same worktree, `cda72f71`
reports `files=0 rewrites=0`.

The installed copy is version 10.22.0 while this checkout and `origin/main` stand at
10.20.0, so its sweep carries a later grammar and reports seventeen rewrites the gate
would never have seen. Being one release *ahead* is the reverse of the documented
condition, which is why neither the orchestrator nor the coder that first raised it
thought to check which binary was answering.

**Two claims fall with it.** The gate was not inherited red: it went red during this
session, from citations this session's own history records introduced. And the earlier
correction in which the orchestrator told the user "the coder was right and I was wrong"
was itself wrong in the other direction — both were reasoning from the same bad
measurement.

**Nothing about the repair changes.** The sixteen tokens were genuinely wrong against
`rules/fusion-workbench-conventions.md` `## Filename Patterns`, and the suite is green at
HEAD. What changes is the account of where they came from, and that account was the
orchestrator's, twice, stated as measured.

**The method fault, named so it is not repeated:** a helper invoked through
`$FUSION_PLUGIN_ROOT` answers for the installed release, and a gate that compiles the
repository answers for the repository. Measuring one to make a claim about the other is
not a close-enough approximation; it is a different question. This is the second unchecked
claim this session dressed as a checked one, the first being the commit hash above.

## Coherence

<!-- RECONCILER-OWNED -->

**Verdict:** review-needed

**Edges:**
- Artifact↔Grounding: 14 plan claims verified against disk / 2 drift items, 1 corrected here / 0 open coderev+ontorev issues, because no review file exists for this range at all (Grounding at fault). Corrected: three `Implemented:` lines written at step 14 cited `4ff9d2e0` in their bodies, which `git cat-file -t` resolves to nothing — the pre-amend hash of `e9c14bdf`, whose `--stat` lists the four consumer sites; repaired in `260904-1058_*_does-a-registry-entry-carry-hostname-account-name-and-folder-path.md`, `260904-1058_*_does-fusion-gain-a-tracked-checkout-registry-and-in-which-shape.md` and `260904-1058_*_is-the-checkout-alias-the-identifier-or-an-attribute-of-the-minted-one.md`. Standing: the plan's step 7 still states two branches for the monitor header where three were built, so step 13 verified against a specification the tree contradicts; filed and correctly open as `260904-2140_*_step-7-states-two-branches-for-the-monitor-header-that-contradict-each-other.md`, and outside a reconciliation pass to repair. The Artifact is right in both; the record is wrong.
- Artifact↔Directive: the 18 commits of `cda72f71..HEAD` move **toward** the stated Directive, with none orthogonal and none away. `23ffbe73` measured the identity model and found the defect narrower than the request; `0dcbf992` built the registry the Directive names; `092a15dc` is the Directive's "one person's several git identities count as one person"; `e9c14bdf` is its four display consumers; `9ffb9911` the mint and the halt; `9b488aac` and `dc2116f4` the release surface and the measurement against a control. The Directive's own third clause, the `worker-id` of machine, account and folder, was put to the user at the step-1 gate and answered "never written" — the Directive asked for proposals and got a ruling, which is the Directive served rather than departed from. What no commit can carry is the end-to-end proof: `bin/fusion-checkout-name` is absent from `$FUSION_PLUGIN_ROOT` for this session's whole duration, so steps 5, 6 and 8 rest on unit tests and work-tree invocation. Plan step 15 holds that, unmarked and by design.
- Grounding↔Directive: 38 live decisions consistent (5 shared `_o_`, 30 shared `_a_`, 3 Circle `_o_`, enumerated by `ls`), 0 conflicting. The three the Circle filed each raise a question the Directive does not pre-empt and none names work this Circle completed. `260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md` is the parent answer and this Circle extends it exactly; `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md` mandates the `[ -x ]` guard, which every new call site follows.

**Rebalance recommendation:** revise Grounding

**Two things the recommendation is not, and the closure gate needs both.** It is not a verdict on the work: the tree is green at `326440dc` (48 files, 825 tests, exit 0), `bin/fusion-citation-check` reads `verdict=clean`, `bin/fusion-staging-drift` reads `verdict=clean`, no growth-bound baseline moved, and three of the four version surfaces agree with the fourth knowingly outstanding. The flag is on two sentences of record, one now repaired. And it is not a reading of the uncovered review range: `commits=16 uncovered=16`, confirmed here from the other side by the absence of any review file for this range, is advisory under `260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md` and flags no edge. It sets the confidence this verdict carries — every claim about 18 commits rests on the executors' self-reports, the suite, and this pass — and it is the user's to weigh at the closure gate, alongside the standing precondition that step 15 belongs to a session after `fusion --update`.
