# Turn 3, task T3-6 — an advisory burst could empty the warnings panel of everything worth reading

**Status:** Complete
**Agent:** coder
**Circle:** `circles/260801-1244-guard-rules-write`
**Closes:**
`issues/260802-2232_c_advisory-rows-share-the-30-row-warnings-panel-and-can-bury-blocks.md` (Low)
**Files:** `issues/260803-1352_o_two-guard-advisory-details-skip-the-200-char-clamp-and-render-a-row-nine-times-normal-height.md` (Low, `hooks/`, out of scope here)
**Scope touched:** `bin/monitor`,
`hooks/lib/__tests__/monitor-warnings-panel.test.ts` (new)
**Tests:** 1080 passed, 23 files (baseline 1076 / 22 files, +4 tests, +1 file)
**Not touched, by instruction:** everything under `hooks/` except the new test file.
T3-2 and T3-4 landed there earlier this Turn and T3-7 follows; the one residual this task
found in `hooks/guard.ts` was filed as an issue rather than fixed.
**`hooks/dist/`:** `npm test` runs `tsc` first, which rewrote eight tracked files. Restored
with `git checkout -- hooks/dist` after the run; `git status --short hooks/dist` then shows
only the four untracked `dist/lib/{fs-locator,rules-write-exemption}.{js,d.ts}` that were
already present on arrival. No version bump.
**Not committed.** The orchestrator commits after validation.

## The defect

Step 5 of this Circle's plan (`bf75941`) added `guard_advisory` to `WARNING_EVENT_TYPES` in
`bin/monitor` and gave it its own render level. The level distinction was right and the
rendering was clean. The panel it joined was not resized: `_read_warnings` returned
`warnings[-MAX_WARNINGS_RETURNED:]`, the last 30 matching events regardless of class.

One exempted write emits one `guard_advisory`. A curation session with
`FUSION_ALLOW_RULES_WRITE` set — the session the flag exists for — emits one per write.
Thirty rewritten rule files are thirty advisories, and every `guard_block`, `guard_halt`,
`churn_critical` and `cross_file_critical` older than them is off the panel.

`hooks/guard.ts` already refuses to cause exactly this, in the comment explaining why the
guard emits no `guard_allow`: one append per Bash call "buries the
`guard_block`/`guard_halt`/`guard_advisory` entries the monitor exists to surface". The
advisory was on the protected side of that sentence and had arrived on the flooding side
through a different door.

## The fix — direction 1, two independent budgets

`ADVISORY_EVENT_TYPES = {"guard_advisory"}` is carved out of `WARNING_EVENT_TYPES`.
`WARNING_EVENT_TYPES` keeps its meaning unchanged — it decides what reaches the panel at
all — and the new set decides which budget a row is charged to. `_read_warnings` bins each
event, slices each bin against its own cap, and merges the two back into one list.

```
MAX_WARNINGS_RETURNED   = 30   (unchanged)
MAX_ADVISORIES_RETURNED = 8    (new)
```

### The split, and why it is not a split

The obvious reading of "reserve capacity by class" is to divide the existing 30 — 8
advisories and 22 warnings, say. That would leave a smaller version of the same bug. A
curation session would still evict 8 warnings; the panel would still degrade in proportion
to how much the user used a flag they were entitled to use.

So the budgets are independent rather than shared. The warning class keeps its full 30
whatever the advisories do; the advisories get 8 **on top**. The panel's worst case grows
from 30 rows to 38. That makes the acceptance criterion literally true instead of
approximately true: a burst cannot evict a block, it can only make the panel taller.

### Why 8 for advisories

The question the task posed — 15/15 versus 5/25 — is really "what does an advisory row have
to tell the user". It has to say: your override is live, and here is what it bought. One row
establishes the first half. A handful gives the shape of the burst — which files, roughly
how many.

Eight shows a small curation session in full and enough of a large one to recognise the
pattern, while staying a clear minority of the panel, so that even at full advisory load the
thing still reads as a warnings panel rather than a write log. The exhaustive record already
exists and is append-only: `events.jsonl` is where an audit of every exempted write belongs.
The 30-row window is the scarce resource, and the fix protects it rather than enlarging it.

### The merge

`merged.sort(key=lambda e: e.get("ts") or "")` — sorted on the raw timestamp string, not on
a parsed date. The guard writes `ts` as `Date.toISOString()`: fixed-width, UTC, Z-suffixed.
Lexical order is therefore chronological order, and there is no parse step and so no parse
failure. An event missing `ts` sorts oldest rather than raising, and Python's sort is stable,
so events sharing a timestamp keep file order.

This matters to the renderer, which walks the array **backwards** to get latest-first. A
non-monotonic array would render out of chronological order, which is asserted against.

### The no-advisory early return

```python
if not advisories:
    return warnings[-MAX_WARNINGS_RETURNED:]
```

The merge below it would be a no-op in this case, so the early return is not needed for
correctness today. It is there because "unchanged when the flag was never used" is a
property worth holding structurally rather than deriving: the merge would change the result
if the file's timestamps were ever out of order, and a monitor that reorders rows for
sessions that never touched the flag is a worse outcome than a redundant branch.

Verified as byte-identical, not reasoned about — see below.

### Not taken: direction 2

Collapsing consecutive advisories into one counted row is cheaper and does match how a
curation session looks. Two reasons against it. It makes the panel's row count a function of
how the burst happens to be interleaved with other events rather than of what class each
event is — two runs of 15 separated by one block render differently from one run of 30. And
the per-file detail it collapses is the entire content of an advisory: "12 writes exempted"
does not answer the question the row exists to answer. Direction 1 fit the rendering with no
change to `renderWarnings()` at all, so the substitution the task invited was not needed.

## How the eviction was demonstrated

Not by reading the code. A throwaway workbench was seeded with a
`.guard-state/events.jsonl` containing, in this order: one `churn_critical`, one
`cross_file_critical`, one `guard_block`, one `guard_halt`, then a 30-advisory curation
burst, then `guard_allow` and `tracker_record` noise. The four rescued events are emitted
FIRST precisely so that a single shared budget ranks them oldest and drops them.

`bin/monitor` at HEAD (`git show HEAD:bin/monitor`) and `bin/monitor` in the working tree
were each started against that workbench and asked for `GET /api/dashboard` — the same seam
the browser polls, whose `warnings` array is exactly what `renderWarnings()` receives.

```
BEFORE (HEAD)          total 30 rows: guard_advisory 29, guard_halt 1
                       blocks/halts/criticals surviving: 1 of 5
AFTER (working tree)   total 13 rows: churn_critical 1, cross_file_critical 1,
                       guard_block 1, guard_halt 2, guard_advisory 8
                       blocks/halts/criticals surviving: 5 of 5
```

The single `guard_halt` that survived at HEAD is the one emitted after the burst. Everything
older was gone.

Two further probes against the real binary:

- **No advisories** (40 `churn_warning`, zero advisories): the `warnings` array from HEAD
  and from the working tree compared as JSON — identical, 30 rows each.
- **Both classes overflowing** (50 warnings + 50 advisories): 38 rows, 30 warnings and 8
  advisories. Both caps hold, neither borrows from the other.

## Test coverage

`bin/monitor` had **no** executable coverage before this. The only prior mentions of it
under `hooks/lib/__tests__/` are prose in guard-side tests describing what the monitor would
render. Nothing to keep green, so nothing was invented to keep green — but the suite already
drives `bin/` bash scripts through `child_process` (`fusion-paths.test.ts`,
`fusion-plane.test.ts`), so there was no framework to invent either.

`hooks/lib/__tests__/monitor-warnings-panel.test.ts`, 4 cases, ~0.9s:

1. an advisory burst cannot evict a block, halt or critical — the demonstration above,
   encoded, plus assertions that the advisories shown are the newest and that the merged
   array is chronologically monotonic
2. the warning class keeps its full 30 while advisories overflow — this is the assertion
   that fails if the two budgets are ever merged back into one
3. with no advisories the panel is byte-identical to the pre-split slice — asserted on the
   whole array, not on its length, so a reordering of the untouched path is caught too
4. bookkeeping events (`guard_allow`, `tracker_record`) stay out of the panel

The file is under `hooks/` only because that is where tests live in this repo; it imports
nothing from `hooks/` and touches no guard source. It drives `bin/monitor` over HTTP on an
ephemeral port taken by binding `:0` and releasing it. That race window is documented in the
file's header, because it matters more than usual here: monitor SIGTERMs whatever is already
listening on its port before binding, so the alternative — a fixed port — would kill a
developer's own running monitor, which is the likelier way to shoot someone.

The `afterEach` kills the negative pid (the process group). `bin/monitor` is a bash wrapper
that runs python as a child; killing the bash pid alone orphans a listening server and the
next test's port scan meets a stranger.

## The longer detail strings from T3-4 and T3-2

T3-4 flagged as a residual that its three new `guard_halt` prefixes are longer than the
constants they replaced and that the effect on the monitor was unmeasured. It is measured
now, and the answer is that they do not break the panel.

Measured by extracting `bin/monitor`'s own `<style>` block and the exact markup
`renderWarnings()` emits into a static page, seeding it with worst-case strings built from
the real code paths, and rasterising it at three viewport widths.

Worst cases, computed from the actual constructions in `guard.ts` with
`EVENT_DETAIL_MAX = 200`:

| string | length |
|---|---|
| `Halt active — mutating Bash command blocked: <segment>` | 245 chars |
| `Halt raised by this block — Protected path: <segment>` | 244 chars |
| `Protected path: <segment>` | 216 chars |
| `Halt active — write tool call blocked` (constant) | 37 chars |

At 900px and at 640px the rows render correctly: level badge, wrapped detail, timestamp and
dismiss button all present and in place, no horizontal overflow. The 245-char halt is 4
lines at 900px and 8 lines at 640px. A 200-character unbreakable token also wraps —
`word-break: break-word` on `.warning-detail` breaks it — so there is no way for a detail to
push the page sideways.

One false alarm worth recording so it is not re-found: a first render at a 1200px body
width appeared to clip the timestamp and push the dismiss button off-screen. That was the
harness, not the CSS — Quick Look rasterises at its own viewport width and scales, so a body
forced wider than that viewport is cropped rather than laid out. Re-rendering at widths
inside the viewport showed the flex row shrinking correctly.

**No change was made to `bin/monitor`'s CSS.** The strings are longer; the panel absorbs it.

## Residual, measured

Two `guard_advisory` details in `hooks/guard.ts` skip the `forEvent()` 200-char clamp that
every comparable detail passes through: `guard.ts:532` joins **every** exempted path into
one string, and `guard.ts:560` interpolates the raw git command. Both are unbounded in
length. The third site, `guard.ts:795`, passes a single path and is fine.

Measured, not assumed: `sed -i 's/x/y/' rules/*.md` under the flag — one command, glob
expanded by the shell before the guard sees it, 30 rule files — produces a 902-character
detail, which renders as a **15-line row roughly 370px tall** against a normal row's ~40px.
It breaks nothing: no clipping, no overflow, the row just grows. But one such row occupies
nine ordinary rows of screen, which can push blocks below the fold — the same harm as the
eviction this task closed, arriving through the height axis instead of the count axis.

Filed as
`issues/260803-1352_o_two-guard-advisory-details-skip-the-200-char-clamp-and-render-a-row-nine-times-normal-height.md`
rather than fixed, because the fix is two `forEvent()` calls in `hooks/guard.ts` and this
task's scope is `bin/monitor`. The issue argues against the alternative of clamping in the
monitor's CSS: that would be a second, weaker bound compensating for an unbounded producer,
and it would hide the tail of the path list from the person who needs it.
