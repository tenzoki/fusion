# Code review: the checkout registry, the presence join, and the five claims

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `8a7139f6..d6299078`
**Not-opened:** `260829-1133-orchestrator-session.md`, `260829-1840-playmaker-orchestrator-phase4.md`, `260904-1050-orchestrator-session.md`, `260904-1058_*_cadence-names-its-report-after-one-person-and-reports-every-persons-work.md`, `260904-1058_*_does-a-registry-entry-carry-hostname-account-name-and-folder-path.md`, `260904-1058_*_does-fusion-gain-a-tracked-checkout-registry-and-in-which-shape.md`, `260904-1058_*_does-the-identity-helpers-exit-1-halt-survive-a-registry-that-can-name-the-person.md`, `260904-1058_*_four-tracked-workbench-filenames-are-keyed-by-the-os-account-name-the-identity-decision-rejected.md`, `260904-1058_*_git-clean-deletes-the-checkout-identifier-and-the-next-read-mints-a-new-one-in-silence.md`, `260904-1058_*_is-the-checkout-alias-the-identifier-or-an-attribute-of-the-minted-one.md`, `260904-1058-analyst-identity-per-instance-and-the-checkout-registry.md`, `260904-1058-identity-per-instance-and-the-checkout-registry.md`, `260904-1619-shaper-tracked-checkout-registry-names-each-instance.md`, `260904-1619-tracked-checkout-registry-names-each-instance/*_circle.md`, `260904-1636-playmaker-direct-dispatch.md`, `260904-1651_*_may-a-project-declare-that-it-does-not-want-a-checkout-registry.md`, `260904-1651_*_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md`, `260904-1651-planner-checkout-registry.md`, `260904-1659_*_what-happens-to-the-directive-pointer-when-the-cited-plan-cites-the-record-back.md`, `260904-1815-coder-checkout-name-helper.md`, `260904-1839_*_citation-sweep-test-is-red-at-head-and-was-already-red-before-this-session-started.md`, `260904-1839_*_the-playmaker-writes-a-store-prefixed-circle-citation-into-the-portfolio-it-regenerates.md`, `260904-1840-bugfix-two-pinned-inventory-gates.md`, `260904-1855-coder-playmaker-path-citation-rule.md`, `260904-1908-coder-layout-tree-and-four-class-partition.md`, `260904-1915-bugfix-two-pinned-inventory-gates-after-the-checkouts-store-edit.md`, `260904-2029-coder-presence-canonicalisation.md`, `260904-2035_*_does-an-executor-re-approve-the-pinned-inventory-its-own-diff-moved.md`, `260904-2037-bugfix-pinned-inventory-re-approval.md`, `260904-2044_*_two-pin-re-approval-entries-were-dropped-instead-of-rolled-into-the-log-the-header-prescribes.md`, `260904-2110-coder-setup-registers-this-checkout.md`, `260904-2119-coder-setup-registers-this-checkout.md`, `260904-2128-coder-sessionstart-exports-fusion-alias.md`, `260904-2130-coder-monitor-header-carries-the-checkout-name.md`, `260904-2140_*_monitor-warnings-panel-test-fails-intermittently-on-the-dual-stack-bind.md`, `260904-2140_*_step-7-states-two-branches-for-the-monitor-header-that-contradict-each-other.md`, `260904-2143-coder-next-names-the-holder.md`, `260904-2202-reference-resolution-pin-re-approval-log-the-two-dropped-2026-08-29-entries.md`, `260904-2211-bugfixer-two-stale-pins-and-the-dropped-entry-roll.md`, `260904-2215_*_the-reference-resolution-pins-entry-chain-has-an-uncovered-gap-between-1336-and-1517.md`, `260904-2240-coder-the-mint-speaks-and-the-halt-restated.md`, `260905-0450-coder-the-precondition-says-which-half-the-registry-repaired.md`, `260905-0459-bugfix-three-pinned-inventory-gates.md`, `260905-0512-coder-shipped-documentation-and-the-version-bump.md`, `260905-0522-bugfix-reference-resolution-pin-re-approval-for-step-12.md`, `260905-0529-consumer-findings-citation-form-and-decision-authority.md`, `260905-0545-coder-verification-measured-rather-than-asserted.md`, `260905-0552-bugfix-citation-sweep-corpus.md`, `260905-0557-reconciliation.md`, `fusion-workbench/.asset-provenance`, `fusion-workbench/.fusion-setup`, `fusion-workbench/orchestrator-events.jsonl`, `hooks/dist/events-query.d.ts`, `hooks/dist/events-query.js`, `hooks/dist/lib/events-query.d.ts`, `hooks/dist/lib/events-query.js`, `hooks/lib/__tests__/fixtures/rules-emission.golden`

The unopened set is 57 entries: the workbench records this range wrote (its Circle record, its
plan, its step histories, its decisions and the analyses behind them), the four compiled files
under `hooks/dist/`, and one regenerated test fixture. **Every record above is named in the
storeless form**, which is what the citation grammar requires of this field and what
`bin/fusion-citation-check` and `citation-sweep.test.ts` enforce over it; the first draft of this
header carried full store-prefixed paths and reddened the suite, which is a live tension between
`rules/review-contract.md` (every file, exactly) and the storeless-citation rule, recorded here
rather than filed because the storeless form resolves both. The step histories are the executors' own
self-reports, which this pass was dispatched to test rather than to read; every claim below was
checked against the tree or measured by running the code. `hooks/dist/` is verified by
`committed-dist.test.ts`, which passes. `fixtures/rules-emission.golden` is an inventory carrying
no assertion of its own.

Every shipped file in the range was opened. `bin/fusion-checkout-name`, `bin/fusion-events`,
`hooks/lib/events-query.ts`, `hooks/events-query.ts`, `hooks/hooks.json` and
`hooks/lib/__tests__/fusion-checkout-name.test.ts` end to end; `bin/fusion-identity`,
`bin/monitor`, both skill bodies, both rule files, `agents/playmaker.md`, the two changed test
files and every documentation surface at their diffs plus the surrounding sections.

## Summary

The registry lands as designed. Four of the five claims the Circle makes about itself hold under
test, and the fifth holds with one qualification. What the pass found instead is a repair that
cannot reach its user, a store that two code-level enumerations do not know exists, an export with
no reader, and a diagnostic that names a cause it did not establish. None of it is a release
blocker for the registry itself; one of them means a second deliverable of this Circle does not
work in a real session.

## Totals

Critical 0, High 1, Medium 5, Low 2. Eight issues filed, all `_o_`, in this Circle's issue store.

## The five claims, tested

**1. Nothing on disk was rewritten and every consumer falls back.** Holds. `measurePresence` with
an empty `identityMap` is the identity function (`hooks/lib/events-query.ts:277-280`), and
`hooks/lib/__tests__/fusion-events.test.ts` pins the empty-map figures against the mapped ones.
`bin/monitor:1355-1358` returns `None` where the store directory is absent and the header slot
renders empty. `skills/next/SKILL.md:202` renders from the claim alone on a `resolve` miss.
`hooks.json:24` appends no `FUSION_ALIAS` line where `alias=` came back empty. One qualification
worth recording rather than filing: where the store exists and holds no entry for this checkout,
the monitor header now renders the bare hex where it previously rendered nothing
(`bin/monitor:1362`). That is stated in the docstring as intended, so it is a documented change
rather than a fallback failure.

**2. The join column is the git identity, not the hex.** Holds, and the regression is pinned.
`canon` is keyed on `line.person` (`hooks/lib/events-query.ts:277-281`), `readRoster` builds
`identityMap[gitIdentity] = person` (`hooks/events-query.ts:227-228`), and the test at
`hooks/lib/__tests__/fusion-events.test.ts` ("still reads a foreign line carrying the reader's own
raw identity as a further checkout") asserts `kind === "checkout"` for an unregistered checkout of
the reading person, which is exactly what a hex join would get wrong.

**3. `hooks/lib/events-query.ts` opens no file and runs no subprocess.** Holds. The file carries
no `import` statement at all, so there is nothing for it to reach through. The roster arrives as
`identityMap` in `PresenceOptions` and the alias as an `aliasOf` callback in `renderParty`.

**4. Two comparisons left alone.** Holds. `bin/monitor:1441-1444` serves the header from
`_read_checkout_label()` while `_read_events()` goes on filtering with `_read_checkout_id()`, and
the docstring states why. `skills/next/SKILL.md:202` says the comparison stays on the hex and the
person as written, and the `resolve` call is bracketed as rendering only.

**5. The alias never enters a comparison and never reaches an event line.** Holds.
`renderParty` (`hooks/lib/events-query.ts:380-385`) is the only consumer of `aliasOf`;
`hooks/lib/orchestrator-events.ts` writes `person`, `checkout` and `session_id` and nothing else.

## The two places named as weakest, checked

**The exit-code table against the branches.** The table (`bin/fusion-checkout-name:53-67`) is
accurate. Measured against throwaway workbenches, every documented code came back as documented:
`resolve` on a hit 0 and on a miss 3 with an empty stdout; a malformed argument, an unknown
subcommand, `roster` with an argument, and `--help` all 2; `roster`, `register`, bare `suggest`
and `resolve` with no workbench above the working directory 5, while `suggest <8hex>` from the
same directory answered 0 without needing one. `register` created and refreshed as the header
describes, refreshing `**Git identity:**` and `**Refreshed:**` and leaving `**Alias:**` and
`**Person:**` standing, and reported exactly one `collision=` line against a second entry holding
its alias. Exit 4 is reachable and is the one code with no test and no consumer branch: see the
findings below.

**The `[ -x ]` guard at every call site.** Present at all four: `skills/setup/SKILL.md:352`,
`hooks/hooks.json:24`, `bin/fusion-events:264`, and `skills/next/SKILL.md:202` in prose ("under
the same guard"). `bin/monitor` is the deliberate exception, reading one field out of the entry
file directly, and `bin/monitor:1324-1337` gives the reason: it is served out of the workbench copy
with no reliable `$FUSION_PLUGIN_ROOT` at poll time, which is why it already reads `.checkout-id`
the same way.

## Findings by theme

### Stderr is discarded on the paths that carry the diagnostics

Two issues, one cause. `bin/fusion-identity` gained an announcement this Circle built
(`bin/fusion-identity:185-193`) and it goes to stderr. `hooks/hooks.json:24` and
`bin/fusion-checkout-name:251` each run the helper with `2>/dev/null`. The hook is the first
caller in every session, so it is the one that mints, and the announcement's motivating case (a
re-mint after `git clean -xdf` swept the ignored file) is precisely the case it silences. The
helper's test drives the script directly and therefore passes.

The same redirection in `bin/fusion-checkout-name` costs the exit-1 reason. In a git work tree with
no configured identity, `fusion-identity` prints why and exits 1; the caller drops it and prints
"this checkout's identifier did not resolve", which is not what happened, and exits 4. The sibling
`bin/fusion-events:289-300` handles the same helper the opposite way and says why in its header.

- `260905-0933_*_the-mint-announcement-is-unreachable-on-every-path-that-actually-mints.md` (High)
- `260905-0933_*_fusion-checkout-name-discards-the-identity-helpers-stderr-and-names-a-wrong-cause-on-its-exit-1.md` (Medium)

### An exit vocabulary that is only partly consumed

`skills/setup/SKILL.md:350-358` branches on two of the helper's five codes plus the missing-helper
case, mixes `fusion-checkout-name`'s numbers with `fusion-identity`'s in one bullet without saying
which is which, and has no branch for `fusion-identity` exit 1, which the conventions rule makes a
halt. Exit 4 is reachable through the `register` the step prescribes, and it is also the one code
`hooks/lib/__tests__/fusion-checkout-name.test.ts` does not cover.

- `260905-0933_*_setup-step-0i-branches-on-two-of-the-helpers-five-exit-codes-and-the-reachable-fourth-has-no-branch.md` (Medium)

### A new store that only the prose knows about

`shared/checkouts/` reached the layout tree (`rules/fusion-workbench-conventions.md:50`), the
four-class partition (`rules/workbench-tracking.md:26`) and CLAUDE.md. It did not reach
`hooks/lib/staging-drift.ts:204-215` `STORES` or
`hooks/lib/__tests__/path-literal-lint.test.ts:41-55` `TYPE_FOLDERS`, the two code-level
enumerations of the same set. Measured: an uncommitted `shared/checkouts/probe-test.md` classifies
`unclassified` with the statement that nothing is claimed about it, while the tracking rule calls
the same file R1 and says to commit it. The module's own comment records the precedent, `backlog`
joining `STORES` when its store was named.

- `260905-0933_*_the-new-checkouts-store-is-absent-from-the-two-code-level-enumerations-of-the-artifact-stores.md` (Medium)

### A rendering site that renders nothing

`FUSION_ALIAS` is written by `hooks/hooks.json:24`, asserted by
`hooks/lib/__tests__/hooks-wiring.test.ts:182`, and read by no agent prompt, skill body, `bin/`
helper or hook. `docs/upgrading-to-v10-21.md:13` counts it as one of four places that now render
the alias. Three render. It is also resolved at SessionStart, so it is unset in the session where
a checkout first registers.

- `260905-0933_*_fusion-alias-is-exported-and-read-by-nothing-while-the-release-note-names-it-a-rendering-site.md` (Medium)

### The one value that does enter a comparison is unguarded free text

The helper's header argues at length that an alias collision is harmless because the hex stays the
key and no comparison reads the alias (`bin/fusion-checkout-name:147-161`). `**Person:**` is the
exception the argument does not cover: it is free text with no uniqueness check
(`bin/fusion-checkout-name:96-97`), and `measurePresence` counts distinct canonical persons, so two
humans claiming one string merge into one party. The reverse conflict — one git identity claimed by
two persons — does warn (`hooks/events-query.ts:229-234`). This one is silent.

- `260905-0933_*_the-presence-join-key-is-free-text-so-two-humans-claiming-one-person-string-merge-into-one-party.md` (Low)

### A user gate an agent answered

`fusion-workbench/shared/checkouts/5e8248d7.md` was written during the building session as an
acceptance test, with an alias and a person an agent chose, and committed in `e9c14bdf`. Because
`resolve` exiting 3 is the whole test for "never registered", this checkout will never be asked.
The monitor header will render `west-harbor · 5e8248d7` to the user as their own checkout's name.
It does not travel to users: `install.sh:82` copies eight directories and `fusion-workbench` is not
among them. Judgement: a defect rather than a harmless artifact, because the gate is one-shot and
therefore self-concealing, and because the two values are precisely the ones the design reserves
for the human.

- `260905-0933_*_this-repositorys-committed-registry-entry-carries-an-alias-an-agent-chose-and-consumes-the-one-shot-user-gate.md` (Medium)

### Small

`skills/setup/SKILL.md:352` writes `"$C" resolve <hex>` unquoted inside a bash fence, where `<hex>`
is an input redirection followed by an output redirection with no operand. Adjacent blocks in the
same file quote their placeholders.

- `260905-0933_*_setup-step-0i-puts-a-bare-hex-placeholder-inside-a-runnable-bash-fence-where-it-is-shell-redirection.md` (Low)

## Cross-cutting observations

**Three of the eight findings are the same shape: a mechanism was built and its delivery path was
not checked.** The mint announcement writes to a channel its callers close, `FUSION_ALIAS` is
written to a channel nothing reads, and `shared/checkouts/` is declared to two rule files and to no
code that enumerates stores. In all three the unit test passes because it drives the producer, and
in all three the producer is correct. The gap is between the producer and whatever was supposed to
consume it, and nothing in the suite spans that gap.

**The `[ -x ]` guard convention held everywhere, and the stderr convention did not.** Both are
conventions about calling a `bin/` helper, both are stated in prose rather than enforced, and one
was applied at four sites out of four while the other diverged between two sibling helpers within
the same range. The difference is that the guard has a decision record every call site cites and
stderr handling has none.

**No growth baseline was moved.** `hooks/lib/__tests__/helpers/growth-bound.ts`,
`surface-growth-bound.test.ts` and `rules-emission-golden.test.ts` are untouched in the range; only
the two golden inventories were regenerated. `npm test` is green at HEAD: 48 files, 825 tests.

## Not a finding, but pending before the release ships

`README.md:26` and `install.sh:27` both cite `FUSION_REF=tags/v10.21.0`, and `git tag -l 'v10*'`
resolves no such tag; the newest is `v10.20.0`. That is release step 5 of CLAUDE.md's process,
still open, and it is named here so a closing session does not lose it.

## Recommended sequencing

Release blocker for the *claim* the release note makes, not for the registry: the mint
announcement (High) and `FUSION_ALIAS` (Medium), because `docs/upgrading-to-v10-21.md` states both
as working. Next, the two that decide behaviour rather than text: the Step 0i case split and the
staging-drift enumeration. Then the stderr repair in `bin/fusion-checkout-name`, which is a
one-line change once the mint issue has decided where the announcement goes. The committed entry
for this checkout is the user's to settle and costs nothing to leave standing meanwhile. The two
Low findings are cleanup.
