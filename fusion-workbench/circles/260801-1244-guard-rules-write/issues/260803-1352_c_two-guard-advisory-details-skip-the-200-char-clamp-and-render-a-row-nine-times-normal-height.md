# Two guard_advisory details skip the 200-char clamp and render a row nine times normal height

---

**Severity:** Low
**Domain:** code
**Filed by:** coder, closing T3-6 in `circles/260801-1244-guard-rules-write`
**Affects:** `hooks/guard.ts:532`, `hooks/guard.ts:560`
**Cross-references:** `hooks/guard.ts:214` (`EVENT_DETAIL_MAX = 200`),
`hooks/guard.ts:225-230` (`forEvent`),
`hooks/lib/rules-write-exemption.ts:503` (`rulesWriteDetail`),
`bin/monitor` (`.warning-detail`, the panel that renders these)

---

## What was found

`guard.ts` has a clamp for exactly this: `forEvent()` folds a detail to one line and
truncates it at `EVENT_DETAIL_MAX = 200`. Every `guard_block` and `guard_halt` detail that
carries a command or a segment goes through it. Two `guard_advisory` details do not:

- **`guard.ts:532`** (Bash surface, rules-write exemption) —
  `rulesWriteDetail(mutation.exempted)` joins **every** exempted path with `", "`. Length
  is a function of how many paths one command wrote.
- **`guard.ts:560`** (Bash surface, git override note) —
  `` `Override ${envVar} allowed normally-denied git op: ${verdict.overrideSegment ?? command}` ``
  interpolates the raw command. Length is whatever the agent typed.

The third site, `guard.ts:795` (write-tool surface), calls `rulesWriteDetail([filePath])`
with exactly one path and is bounded by a path length. It is fine.

## Measurement

Not an estimate — rendered through `bin/monitor`'s own `<style>` block at a 900px viewport
and rasterised:

| detail | length | rendered row |
|---|---|---|
| `churn_critical` (typical) | 35 chars | 1 line, ~40px |
| `guard_halt`, Bash, clamped | 245 chars | 4 lines, ~105px |
| `guard_advisory`, 12 paths | 389 chars | 6 lines, ~150px |
| `guard_advisory`, 30 paths | 902 chars | **15 lines, ~370px** |

The 30-path case is not contrived: `sed -i 's/x/y/' rules/*.md` under
`FUSION_ALLOW_RULES_WRITE` is one command, the shell expands the glob before the guard sees
it, and fusion ships enough rule files to reach it. The git-override case has no upper
bound at all — a long compound command produces a proportionally long row.

## What it does and does not break

It does **not** break the layout. The flex row shrinks correctly at every width tested
(1200 / 900 / 640px): the level badge, the timestamp and the dismiss button all stay in
place, and `word-break: break-word` on `.warning-detail` breaks even a 200-character
unbreakable token, so there is no horizontal overflow. The row simply grows tall.

What it costs is the same scarce resource T3-6 was about. One 902-char advisory occupies
nine ordinary rows' worth of screen. It cannot evict anything now that the classes have
separate budgets, but it can push the blocks below the fold on a laptop viewport, which is
the same harm arriving through the height axis instead of the count axis.

## Why the fix belongs here and not in the monitor

The clamp already exists in `guard.ts` and every comparable detail uses it. Clamping in the
monitor's CSS instead — `-webkit-line-clamp` and a `title` attribute, say — would be a
second, weaker bound compensating for an unbounded producer, and it would hide the tail of
the path list from the one person who needs it. Two `forEvent()` calls put the bound where
the other bounds are.

One thing to decide rather than assume when fixing: `forEvent()` truncates at a character
count, so a 30-path list becomes 200 characters ending mid-path. For a list, dropping whole
entries and appending `(+N more)` reads better than a mid-token ellipsis. That is a
`rulesWriteDetail` change, not a `forEvent` change.

## Origin

Found in `circles/260801-1244-guard-rules-write` while closing T3-6 (the warnings-panel
capacity fix). T3-6's scope was `bin/monitor`; this is `hooks/`, so it was reported rather
than reached across into.

---

**Reconciliation 260803-1516 (reconciler, domain `code`) — stays `_o_`. Defect confirmed; three line citations corrected.**

**The defect is real and present at HEAD `fa81589`.** Both sites bypass the clamp exactly as described, and the clamp itself is where the issue says: `EVENT_DETAIL_MAX = 200` at `hooks/guard.ts:214`, `forEvent()` at `:225-229`.

**Three of this issue's citations are off and would send the fixer to the wrong lines.** `hooks/guard.ts` has not changed since `d77eda8`, which precedes the commit that filed this issue (`aff7486`), so the numbers were wrong when written rather than overtaken by later work. Corrected, read out of the file:

| This issue says | Actually at | What is there |
|---|---|---|
| `guard.ts:532` | **`guard.ts:519`** | `const detail = rulesWriteDetail(mutation.exempted);` — the Bash rules-write advisory |
| `guard.ts:560` | **`guard.ts:548`** | `` `Override ${envVar} allowed normally-denied git op: ${verdict.overrideSegment ?? command}` `` — the git override note |
| `guard.ts:795` | **`guard.ts:786`** | `const detail = rulesWriteDetail([filePath]);` — the write-tool site, the one that is fine |

`hooks/lib/rules-write-exemption.ts:503` (`rulesWriteDetail`) is correct as cited. `reviews/260803-1431-coderev-turn3-guard-boundary.md` independently reports the first two as `:519` and `:548`, which agrees with this correction.

**The measurement is not affected.** The rendered-height table was produced through `bin/monitor`'s own stylesheet and does not depend on these line numbers.

---

**Reconciliation 260804-1021 (reconciler, domain `code`) — stays `_o_`. Verified live at HEAD; the two cited line numbers have drifted.**

Both unclamped sites are still unclamped at HEAD `cc012fc`, verified in code rather than inferred:

- `hooks/guard.ts:529` — `const detail = rulesWriteDetail(mutation.exempted);` joins every exempted path, no `forEvent`. Cited in this issue as `:532`.
- `hooks/guard.ts:558` — `` `Override ${envVar} allowed normally-denied git op: ${verdict.overrideSegment ?? command}` ``, no `forEvent`. Cited as `:560`.

The clamp itself is unchanged at `hooks/guard.ts:216` (`EVENT_DETAIL_MAX = 200`) and `:227-231` (`forEvent`), and the three block sites that do use it are at `:344`, `:478` and `:503`. The third advisory site, `guard.ts:803` (`rulesWriteDetail([filePath])`, write-tool surface, exactly one path), is still the bounded one this issue correctly excluded.

Nothing in this session touched `bin/monitor` or the advisory emit sites, so the drift is line numbers only. Untouched for two sessions running; not blocking anything.

---

**Step 3 disposition (coder, 2026-08-05) — neither A nor B. STAYS `_o_`, and STAYS IN THIS CIRCLE.**

No delivered sentence is false and the classifier needs no new capability. It is a two-line
code defect in `hooks/guard.ts`, and step 3 changes no code.

**It does not move to the shared store, and the plan's reason for moving it does not
hold.** Step 3 of `planning/260804-2356_o_…ausstieg…` names this issue as an example of a
finding that "does not belong to this Circle's Directive". Both unclamped sites are C5a's:
`rulesWriteDetail(mutation.exempted)` is the rules-write exemption's own advisory, and the
Directive says in so many words that each exempted write "emits a `guard_advisory` event …
so the user reads the exempted writes in `.guard-state/events.jsonl` and on the monitor
dashboard". The finding is that this reading surface degrades under the exemption's own
worst case, `sed -i 's/x/y/' rules/*.md`. Under the Origin Rule it belongs here. Reported
to the orchestrator as a correction to the plan.

**Executor and shape, unchanged from the record.** `coder`, two `forEvent()` calls at
`hooks/guard.ts` (`:529` and `:558` as of the last reconciliation), plus the one decision
the record flags: for a path list, dropping whole entries and appending `(+N more)` reads
better than a mid-token ellipsis, and that is a `rulesWriteDetail` change rather than a
`forEvent` change.

---

**Reconciliation 260806-1152 (reconciler, workbench-wide pass) — stays `_o_`, and is now unowned.** The Circle that priced this deferral ("after the ship, or a later one") closed coherent on 260805-2359; no successor Circle's Grounding claims it. Verified at HEAD `cde5319`: the two advisory emissions at `hooks/guard.ts:565` (`rulesWriteDetail` path list) and `:593` (override note interpolating the command) still bypass the `forEvent()` clamp (`EVENT_DETAIL_MAX = 200`, `hooks/guard.ts:235,246`). Candidate for the same follow-up batch as `circles/260805-2005-textschicht-gegen-code-nachziehen/issues/260806-0022_*_setup-klammer-probe-und-migrate-reformat-decken-verschiedene-baeume.md` (the portfolio's other unowned residual).

---

**Reconciliation 260807-1515 (reconciler, Domain `code`) — bleibt `_o_`. Der Gegenstand hat den Umbau überlebt, nur die Zeilennummern sind gewandert.**

Am Baum nachgeprüft gegen HEAD `e684eae`. Beide ungeklammerten Emissionen stehen unverändert da, an neuen Stellen:

- `hooks/guard.ts:466` — `emitEvent("guard_advisory", input.tool_name, undefined, diagnostic)`, die Konfigurations-Diagnose (vorher `:532`).
- `hooks/guard.ts:697` — `emitEvent("guard_advisory", input.tool_name, filePath, detail)` mit `detail = rulesWriteDetail([filePath])`, die Regel-Ausnahme (vorher `:560`).

`EVENT_DETAIL_MAX = 200` steht bei `hooks/guard.ts:235`, `forEvent` bei `:246`, und `forEvent` wird im ganzen Modul genau einmal aufgerufen: bei `:358`, für die Branch-Verweigerung. Die beiden hier beschriebenen Pfade gehen weiter daran vorbei.

**Ein Zusatz, den der Umbau gebracht hat:** `hooks/tracker.ts:289` emittiert seit `327d0b6` ein drittes `guard_advisory`, aus der Messung heraus. Es geht ebenfalls nicht durch `forEvent` — der Klammer-Helfer liegt in `guard.ts` und wird von `tracker.ts` nicht importiert. Wer diesen Befund aufnimmt, sollte den dritten Schreiber mitnehmen und die Klammer dorthin ziehen, wo beide Hooks sie erreichen (etwa nach `hooks/lib/events.ts`), statt sie ein zweites Mal zu schreiben.

---
Resolved: The bound is back, at the one site that still needs it.

**Every coordinate in this record and in its four reconciliations is stale, and the last
reconciliation (260807-1515) was the last one that could still find the sites.** Verified at
HEAD `3b30f5e`: `forEvent` and `EVENT_DETAIL_MAX` no longer exist anywhere under `hooks/`
outside `dist/`, and both named `hooks/guard.ts` emissions went with the Bash classifier in
v6.0.0. The third writer that reconciliation added — `hooks/tracker.ts`, the measurement's own
advisory — is the one the defect moved to, and it is the only unbounded producer left: it
calls `rulesWriteDetail(exempted)` on a list of arbitrary length. The surviving `guard.ts`
call (`:585`, `rulesWriteDetail([filePath])`) is the single-path case this record itself
excluded as fine, and it still is.

What was NOT stale is the finding, and both of the things this record decided about the fix
still held. The bound is in the producer, not in `bin/monitor`'s CSS. And a list drops whole
entries with `(+N more)` rather than ending mid-path, which made it a `rulesWriteDetail`
change.

**Where the bound went, and why not `lib/events.ts`.** The 260807-1515 reconciliation proposed
pulling a shared clamp into `lib/events.ts` so both hooks could reach it. It went into
`rulesWriteDetail` (`hooks/lib/rules-write-exemption.ts`) instead, which both hooks already
import — same property, one module rather than a new one, and it is the only place that knows
the string is a *list* and can drop whole entries. A character clamp in `emitEvent` could only
have cut mid-path, which is the outcome this record argued against.

`DETAIL_MAX = 200`, the number the retired `forEvent()` used. Measured after the change: the
30-path case (`sed -i 's/x/y/' rules/*.md` under the flag) went from 902 characters to 185,
five paths and `(+25 more)`. One stated exception, deliberate: a single path that alone
overruns the budget is still written whole, because a path is bounded by the filesystem while
a list is bounded by nothing, and it was the list that produced this finding.

Verified against a throwaway project root, through both hooks around a real 30-file write
(`guard-rules-write-integration.test.ts`, "bounds the advisory detail when one command exempts
thirty rule files"), plus four unit cases in `rules-write-exemption.test.ts`. The write is
still exempted, not reverted — a truncated detail must not read as a truncated grant.
