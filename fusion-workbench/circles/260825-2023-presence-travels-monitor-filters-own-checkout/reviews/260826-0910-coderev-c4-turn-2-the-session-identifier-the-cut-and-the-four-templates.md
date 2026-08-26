# Code review — C4 Turn 2: the session identifier, the cut, and the templates that carry identity

**Reviewed-range:** `b11bec6..72a9561`
**Not-opened:** `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/analyses/260826-0715-cut-candidates-for-two-growth-bounded-surfaces.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/history/260826-0141-coder-p4-setup-skill-session-start-fields.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/history/260826-0148-coder-p9-readers-repair-authored-once.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/history/260826-0150-coder-c4-turn-1-review-closures-events-query.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/history/260826-0150-coder-p7-monitor-reads-its-own-checkout.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/history/260826-0155-coder-reference-baseline-reapproved-after-wave.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/history/260826-0208-coder-p5-one-turn-count-four-sites.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/history/260826-0748-coder-r3-three-bare-stamp-citations.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/history/260826-0800-coder-c1-four-cuts-for-two-growth-bounds.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/history/260826-0815-coder-p10-tests-for-events-query-and-the-monitor-window.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/history/260826-0846-p11-session-identifier-both-branches.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260825-2140_*_the-two-session-start-emit-sites-disagree-on-the-detail-field-and-the-vocabulary-names-one.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0131_*_turns-returns-exit-0-and-a-whole-file-count-when-the-checkout-is-unresolved-and-stdout-says-nothing.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0132_*_the-turns-exit-4-has-two-causes-and-the-authoritative-header-names-one.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0133_*_a-turn-start-line-with-no-readable-timestamp-is-dropped-from-the-count-and-reported-nowhere.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0134_*_other-checkouts-counts-two-different-sets-depending-on-the-exit-code-and-its-comment-describes-one.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0135_*_a-tree-that-owes-no-git-identity-is-read-as-one-whose-identity-could-not-be-read.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0136_*_the-absent-rather-than-empty-rule-has-no-expression-in-any-of-the-three-emit-templates.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0137_*_the-party-sort-is-not-total-and-the-comment-beside-it-claims-it-is.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0138_*_the-party-line-is-unescaped-tab-separated-and-a-tab-or-newline-in-a-person-value-breaks-it.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0139_*_three-citations-added-in-this-range-name-a-record-by-its-bare-stamp-a-day-after-the-rule-forbade-it.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0140_*_the-new-setup-step-2-identity-call-moves-a-halt-from-first-filing-to-setup-and-nothing-says-so.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0154_*_the-reference-pin-shaped-a-comment-away-from-naming-a-path-and-the-vagueness-is-the-gates-doing.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0158_*_a-staging-list-built-by-a-shell-pipeline-over-git-status-is-the-directory-sweep-the-rule-forbids.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0805_*_the-resumption-measurement-answers-for-claude-codes-resume-and-the-plan-asked-about-fusions.md`, `fusion-workbench/circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1302_*_the-monitor-attributes-a-merged-event-log-to-one-session-and-reports-another-checkouts-state.md`, `fusion-workbench/shared/issues/260822-1136_*_two-definitions-of-the-turn-count-disagree-and-the-resume-snippet-counts-every-session-in-the-log.md`

Every source file in the range was opened, the four compiled artifacts the Turn 1 pass carried
included. The unopened set is the record layer: eleven history entries written by this Circle's own
executors, fourteen closed or open records, and the cut-candidate analysis. Two closed records were
opened because a finding turns on their enumeration, and the analysis was read only for the citation
`c649556` makes of it, which is why it stands on the list.

**Reviewer:** coderev, Kai Stalmann <ks@qantr.com>
**Reviewed:** 2026-08-26
**Plan:** `circles/260825-2023-presence-travels-monitor-filters-own-checkout/planning/260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`, steps 4 through 11

## The Turn 1 carried list, discharged

The previous pass declared eighteen files it did not open. Four were source and are dealt with here:
`hooks/dist/events-query.d.ts`, `hooks/dist/events-query.js`, `hooks/dist/lib/events-query.d.ts` and
`hooks/dist/lib/events-query.js` were read as text and compared clause by clause against their
sources. They are the compilation and nothing more — no hand edit, no divergence beyond type
erasure, and `flattenField` correctly absent from the `.d.ts` because it is module-private. The
remaining fourteen were records; two of them (`260825-2140_*_the-turn-count-defect-names-three-sites…`
and the decision `260825-2140_*_where-do-c4s-hook-test-lines-come-from…`) are opened here, and
twelve stand on the list above.

## Summary

Ten commits, ten findings, two of them High and neither a release blocker. The Circle's central
property holds: nothing in the range introduces a reader that takes the whole log, `bin/monitor` now
scopes its window by `checkout` before it sorts, and the `<ID>` fragment produces valid JSON in every
branch including the empty one. The suite is green at 44 files and 776 tests, every growth baseline is
byte-identical, and the cut in `c649556` is sound in three of its four claims.

The two High findings are the same shape as each other and as two records this Circle has already
closed: a repair was declared complete over an enumeration that was short. `753932b` converted "all
three" emit templates and there are four, the fourth created by `c2be6f8` two commits earlier in the
same range. And `46de871` gave the pure module its first coverage while the entry point beside it —
where every one of the Turn 1 review's discharges lives, the High one included — got none.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 2 |
| Medium | 2 |
| Low | 3 |
| Confirmed, no finding | 3 |

## Findings by theme

### Theme 1 — a repair declared complete over an enumeration that was short

**H-1. The fourth `session_start` emit template was created in this range and left out of the `<ID>`
conversion.** `c2be6f8` added `\"person\":\"<PERSON>\",\"checkout\":\"<CHECKOUT>\"` unconditionally to
`skills/setup/SKILL.md:483`. `753932b`, two commits later, replaced the two literal fields with `<ID>`
at `agents/orchestrator.md:235`, `:953` and `:1322`, and closed `260826-0136` stating "all three emit
templates". No `<ID>` fragment is defined anywhere in the skill body: Step 0i (`:346-355`) reads the
identity and Step 5 (`:480`) cites the orchestrator's rule in prose, beside a template that cannot
execute it — which is verbatim what the closed record said was wrong with the other three.

`/fusion:setup` is the documented entry point for a session, so on the skill path this is the line
that carries the session's identity. An unresolved half yields `"person":""`, which today's readers
tolerate (`hooks/lib/events-query.ts:104` drops an empty-string field), or the literal `<PERSON>`
placeholder, which they do not — it parses as a person and counts as a party. The unresolved half is
the ordinary state of an install one release behind
(`shared/issues/260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`).

The same Circle already filed the same shape once, against the Turn count:
`260825-2140_*_the-turn-count-defect-names-three-sites-and-a-fourth-carries-the-identical-whole-file-count.md`
records that a count taken over `agents/orchestrator.md` missed the `/fusion:setup` rendering of one
procedure. It has now happened twice, in one Circle, on two different edits. Record:
`issues/260826-0906_*_a-fourth-session-start-emit-template-was-created-in-this-range-and-left-out-of-the-id-conversion.md`.
**Severity: High.**

**M-1. A fifth Turn-count definition site.** `agents/reconciler.md:21` defines the Turn count as
"the number of `turn_start` events in `fusion-workbench/orchestrator-events.jsonl` since this
session's `session_start`" — unscoped by checkout, so under `merge=union` it is the whole-file count,
and naming no implementation. `agents/orchestrator.md:558` now says "Read the figure from the helper;
do not derive it again anywhere", and `bin/fusion-rules` emits that prompt to nobody but the
orchestrator while this one loads on every reconciler dispatch. The closed record enumerated four
sites across two files; `grep -rn turn_start agents/ skills/ rules/` returns the fifth in one command.
Record:
`issues/260826-0906_*_a-fifth-turn-count-definition-site-still-reads-the-whole-file-and-names-no-implementation.md`.
**Severity: Medium.**

### Theme 2 — the tests landed on the half that was already provable

**H-2. The `hooks/events-query.ts` entry point carries every Turn 1 discharge and is exercised by
nothing.** `46de871` covers the pure module well: ten classification rows, the window's floor and its
deliberate missing ceiling, `turns=0` on the ok branch, `malformed` and `unstamped` kept apart, and a
tie-break asserted against file position. The 425-line program `bin/fusion-events` actually runs is
named by no test in the suite.

What that leaves unpinned is exactly the Turn 1 repair set. The `scope=` key
(`hooks/events-query.ts:310`, `:352`, `:368`) is the whole of the fix for the previous pass's one
High finding, and two prompt call sites now branch on it — `agents/orchestrator.md:107` and
`skills/setup/SKILL.md:394` both say the `turns=` line is the figure **only when the helper also
prints `scope=checkout`**. Nothing asserts either spelling. `resolveIdentity` and its vocabulary map
(`:107-166`) is the single translation point added because the identity helper's exits had been read
three ways in one change; neither of its two `presence` branches (`:272-288`) is asserted.
`noteUnstamped` (`:217-224`) and the 0/1/2/3/4 exit mapping the `bin/fusion-events` header documents
in full are likewise untested.

**And one case the plan named is missing without being declared missing.** Plan step 10 lists "a
missing `agentstate.yaml`" among the clauses to cover; it lives at `hooks/events-query.ts:324-332`
and is asserted nowhere. The test file's header carries a deliberate-exclusion note
(`fusion-events.test.ts:13-16`) naming two other things — the wrapper's identity-exit mapping and a
two-checkout manual pass — so a reader takes that note as the complete list. Record:
`issues/260826-0906_*_the-events-query-entry-point-carries-every-turn-1-fix-and-is-exercised-by-nothing.md`.
**Severity: High.**

**M-2. The monitor's whole-file parse is the repair, and a three-line fixture cannot see it.**
`bin/monitor:1270-1274` states the change as an ordered triple: parse **every** line rather than the
last `MAX_EVENTS` ("a foreign block can stand anywhere in the file"), drop the foreign ones, sort,
then take the last `MAX_EVENTS`. The two new cases
(`monitor-warnings-panel.test.ts:1104-1136`) use a three-line fixture against `MAX_EVENTS=100`
(`bin/monitor:47`). Restoring the pre-change `lines[-MAX_EVENTS:]` slice passes both. Deleting the
sort at `:1306` passes both. Taking the window before the sort instead of after passes both. The
filter itself — the one property the cases do assert, in both directions — is well covered. Record:
`issues/260826-0906_*_the-monitors-whole-file-parse-is-the-repair-and-a-three-line-fixture-cannot-see-it.md`.
**Severity: Medium.**

### Theme 3 — documentation that fell behind the same commit that changed it

**L-1. The event-log contract names three fields and two sentences under it still say two.**
`72a9561` widened the bold lead at `agents/orchestrator.md:1279` to "`person`, `checkout` and
`session_id` stand on every line" and left the next clause reading "Both values come from the guarded
`bin/fusion-identity` call at Setup step 2 and are composed nowhere else". `session_id` comes from
neither: `:140` says it arrives on the SessionStart line `hooks/session-id.ts` prints. In the same
section, `:1322` still calls `<ID>` "the pair" when `:139-140` define it as up to three fields.
Record:
`issues/260826-0906_*_the-event-log-contract-names-three-fields-and-two-sentences-under-it-still-say-two.md`.
**Severity: Low.**

**L-2. One of the three harness properties the cut removed does not hold by consequence.** See the
verdict on the cut below. `c649556` says "Both properties now hold by consequence"; the removed case
asserted three, in its own comment, and the **replace** half is asserted by nothing that survives.
Record:
`issues/260826-0906_*_one-of-the-three-harness-properties-the-cut-removed-does-not-hold-by-consequence.md`.
**Severity: Low.**

### Theme 4 — a family property, measured here

**L-3. The event-query program dies with an unhandled `EPIPE` when its reader closes stdout first.**
Measured at `72a9561` against a reader that exits immediately: a node stack trace on stderr and a
non-zero exit, from a program whose header promises that a reason goes to stderr and the exit code
says which figure was missing. `grep -l "stdout.on\|EPIPE" hooks/*.ts hooks/lib/*.ts` returns
nothing, so no program under `hooks/` handles it — a family shape, not a defect this Circle
introduced. **The reachability is narrow and is stated in the record rather than implied:** each
subcommand makes exactly one `process.stdout.write`, so `| head -N` does not reach it. Record:
`issues/260826-0906_*_the-event-query-program-dies-with-an-unhandled-epipe-when-its-reader-closes-stdout-first.md`.
**Severity: Low.**

## The two claims in `c649556`, verified rather than accepted

**Claim 2 — the retired-FILE cut. It holds.** Every assertion in the removed block is carried by
`config.test.ts:404-476`, case for case:

| Removed case | Carried by | Verdict |
|---|---|---|
| "names the file, the key to copy, the destination and the order" | `config.test.ts:416-433`, same title | identical, all six assertions |
| "says it even when the file is not valid JSON, because it is never read" | `:435-447` "reads nothing out of it — the file is probed, not parsed" | same assertions plus `maxTurns` unaffected |
| "is reported ahead of a complaint about the file that IS read" | `:456-467`, same title | identical, all four assertions |
| "says nothing to a project that never had one" | `:469-475`, extended title | superset — also asserts `load(null)` |
| — | `:449-454` "does not let the retired file's budget reach the effective config" | the one the removed file never had, as claimed |

Two corrections to the commit message rather than to the cut. "Under the same titles" is true of two
of the four, not all four. And what is genuinely given up is the *transport* dimension for this
scope: `config.test.ts` calls `load()` in-process and asserts diagnostic strings, while the removed
cases ran a real hook subprocess and asserted a visible `guard_advisory` row. The commit says the two
surviving groups make that claim twice, and they do — `guard.ts:180-184` iterates
`config.diagnostics` without branching on the scope, so the transport is scope-independent and
asserting it twice is enough. **Verdict: no coverage lost.**

**Claim 3 — the harness-capability cut. It holds for two of three properties, and the commit counts
two.** Verified by construction against `guard-harness.ts:353`, `seed(root, { ...SEED_FILES,
...(opts.files ?? {}) })`:

- **Add** fails loudly: drop the option and no config is written, so
  `guard-bash-integration.test.ts:297`, which asserts the event list is exactly
  `["guard_advisory"]`, sees `[]`.
- **Merge** fails loudly by a different route: substitute rather than merge and
  `fusion-workbench/.fusion-setup` is gone, `findWorkbenchRoot()` returns null, `emitEvent` no-ops,
  and the same assertion sees `[]`.
- **Replace** fails silently. Invert the spread and add and merge both still hold. No surviving case
  passes a `files` key that is in `SEED_FILES`: the only two outside the removed block are
  `guard-state-shape.test.ts:143` and `:235`, both on `THROTTLE_FILE`, and every other use is
  `configFiles()` on `fusion.json`. Neither is seeded.

The second property in that block, `expect(PROJECT_CONFIG).not.toBe(RETIRED_CONFIG)`, **does** hold
by consequence as claimed: rename `PROJECT_CONFIG_FILENAME` back and the same exact single-element
list would see two advisories, the parse failure and the retired file. **Verdict: one narrow property
lost, no coverage of the product lost, and the commit message overstates by one.**

Cut 1 (the revert strategy) also holds: the verdict half survives at
`guard-bash-integration.test.ts:267-268` with both spellings and `guardStateWritten(root)` still
false at `:279`, and the removed half ran the command through a shell the hook never sees. Cut 4 is
a prompt cut whose four claims are all authored in `rules/commit-lock.md`, which `bin/fusion-rules`
emits to the orchestrator on every dispatch.

## What was verified and holds

Stated so the next pass does not re-derive it.

- **The Circle's own property: no new whole-log reader, no line written without its writer.** Every
  reader of `orchestrator-events.jsonl` in the tree was enumerated with `grep -rn` over `agents/`,
  `skills/`, `bin/`, `hooks/`, `rules/` and `docs/`. `bin/monitor` now has exactly one read
  (`_read_events` at `:1246`) and `_parse_mode` takes its filtered array rather than the file
  (`:1325`); the Phase-4 sequence diagram gained the filter clause at `agents/orchestrator.md:1374`
  before its existing sort. The two exceptions are correct: `_read_warnings` reads
  `.guard-state/events.jsonl` unscoped, which is class L and never travels, and
  `agents/curator.md:111` reads the log as corroborating-only evidence. The two whole-log reads left
  in prose — `agents/orchestrator.md:931`'s future `grep` measurement and `agents/reconciler.md:21`
  — are M-1 and a note; neither is new in this range.
- **The `<ID>` fragment produces valid JSON in every branch, empty included.** `<ID>` is defined at
  `agents/orchestrator.md:139` with a leading comma and sits immediately after a closing quote in all
  three templates, so the empty case yields `"event":"session_start","history_file":…` at `:235` and
  `{"ts":"…","event":"…"}` at `:1322`. The extension at `:140` appends, so a resolved session with an
  unresolved person is well-formed too.
- **The SessionStart wiring and channel.** `hooks/hooks.json:18-21` adds the fourth command inside the
  same SessionStart entry, after `session-start.js`. The channel choice is correct and the trap is
  as visible as prose can make it: `hooks/session-id.ts:22-39` names `additionalContext` as the
  unmeasured channel and says not to switch to it, `:41-52` says why one process cannot carry both
  channels, and the measurement it cites
  (`analyses/260825-2214-can-a-hook-obtain-the-session-identifier.md`, finding (b)) reads the
  `hook_success` attachments from both ends. `session-start.ts` writing `{}` cannot leak into model
  context, because a recognised JSON object empties `content` — which is the same mechanism the
  measurement records. What is missing is a gate, and `260826-0848` says so precisely.
- **`setEventSession` is set before the first emit on both hooks.** `guard.ts:144` sits after the
  parse and before the diagnostic loop at `:180`; `tracker.ts:444` sits after the parse and before
  both `bestEffort` measurements. A run that never reaches the parse writes rows with the key absent,
  which `lib/events.ts:36-38` states. Both `HookInput` interfaces already declared `session_id`
  (`guard.ts:84`, `tracker.ts:132`).
- **The `flattenField` repair works.** Measured against a fixture carrying a literal TAB inside a
  `person` value: the rendered `party=` line came back five fields wide with the TAB flattened to a
  space. The prior pass's L-2 is closed.
- **`turns` names its widened scope.** Measured with `FUSION_EVENTS_CHECKOUT` empty and
  `FUSION_EVENTS_IDENTITY_EXIT=3`: `turns=1`, `history_file=…`, `scope=all-checkouts`, exit 0, with
  both stderr sentences. The prior pass's H-1 is closed in behaviour — H-2 above is that nothing
  holds it there.
- **The `bin/fusion-events` header caught up with the code.** Exit 4's two causes on `turns`, the
  two denotations of `other_checkouts`, the total party order and the flattening are all now in the
  header. The prior pass's M-1, M-3, L-1 and L-2 are documentation-closed.
- **The gates.** `cd hooks && npm test` is 44 files, 776 tests, exit 0. `TEST_LINE_BASELINE`,
  `AGENT_BASELINE`, `SKILL_BASELINE` and `RULE_BASELINE` are untouched across the whole range —
  `git diff b11bec6..72a9561 -- surface-growth-bound.test.ts rules-emission-golden.test.ts` is empty,
  which is plan stop-condition 8. The reference-lint `BASELINE` moved 1404 to 1424 with a per-file
  measured split on the assertion.
- **The cut arithmetic.** Hook-test lines 20 375 → 20 113 at `c649556` (−262), then +166 at `46de871`
  and +70 at `72a9561`, landing at 20 349 — below the starting figure, so the decision's "equal
  number of lines, same Turn" (`decisions/260825-2140_*_where-do-c4s-hook-test-lines-come-from…`,
  option 2) is satisfied with room to spare.
- **Citation form.** No backticked bare stamp appears on any added non-workbench line in the range.
  `d751534` repaired the three the prior pass found and explicitly declined to sweep the older ones
  beside them, which is the right call and is recorded.

## Cross-cutting observations

**Twice in one Circle, a repair was scoped by an enumeration nobody re-derived.** H-1 and M-1 are the
same defect in two places, and the Circle has a closed record naming the shape
(`260825-2140_*_the-turn-count-defect-names-three-sites-and-a-fourth-carries-the-identical-whole-file-count.md`,
"nothing in either file says the other carries a copy, and nothing measures the pair"). The
mechanical part is cheap: a single `grep -rn` over `agents/ skills/ rules/` for the token being
repaired would have found both the fourth emit template and the fifth Turn-count site. Whether that
earns a gate rather than a habit is a question this review does not answer, and it is the third time
it has come up.

**The coverage that landed and the coverage that was owed are one file apart.** The Circle's own plan
put the test step behind a decision about line budget, the user paid for it with a cut, and what the
lines bought was the module that was already the easiest thing in the range to reason about — pure,
import-free, fully specified by a table. Every fix the previous review's ten findings produced lives
in the file next to it, and the two prompt sites that consume the most important of those fixes read
a string literal nothing emits under test. H-2 is that, and it is the finding I would take first if
only one were taken.

**The documentation-behind-the-code pattern the last pass named has shrunk but not gone.** Four of its
five instances closed cleanly this Turn; `agents/orchestrator.md:1279` and `:1322` are the fifth, and
they were created by the same commit that fixed the paragraph above them. The `bin/` headers, which
that pass singled out as the only copy a reader gets, are now accurate.

**Three things the executors filed against themselves are better than anything I would have written
about them.** `260826-0846` (four prose sites still counting three SessionStart commands, plus
`hooks-wiring.test.ts:93`), `260826-0847` (the `session_id` row assertion parked in the state-load
suite) and `260826-0848` (nothing pins the wiring, nothing pins the channel) are accurate, correctly
severed and correctly reasoned. I add one clause to `260826-0848`'s fix direction and no record:
spawning the built module is the *only* form available, because `sessionIdLine` is exported at
`hooks/session-id.ts:71` while `:94` runs `main()` at module load and `main()` awaits
`process.stdin`, so an importing test would hang. `session-start.ts` exports `subdirectoryWarning` on
the same terms and its suite spawns too, so this is house style rather than a new defect.

## Recommended sequencing

1. **H-2, before the Circle closes.** The `scope=` key is what plan stop-condition 5 rests on, and
   nothing holds the helper to emitting it. Two cases close the load-bearing part.
2. **H-1, before the Circle closes.** One template and one fragment definition, and it makes the
   already-closed `260826-0136` true.
3. **M-1 and M-2, cleanup within the Circle.** M-1 is one sentence. M-2 is one fixture, and it needs
   the same cut-in-the-same-Turn arrangement H-2 does, so take them together.
4. **L-1, any time.** Two clauses in one paragraph.
5. **L-2 and L-3, any time, and L-3 belongs to whoever decides it for the whole `bin/` family rather
   than for this one program.**

None of the ten is a release blocker. H-2 is the one that would make a later regression invisible,
which is the only class here that gets worse with time.
