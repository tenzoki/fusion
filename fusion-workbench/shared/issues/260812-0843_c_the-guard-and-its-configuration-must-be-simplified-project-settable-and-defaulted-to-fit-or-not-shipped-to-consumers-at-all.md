The guard and its configuration must be simplified, project-settable, and defaulted to fit — or not shipped to consumers at all

---
User request, 260812, in his words: guards and guard configuration must be simplified and easily
set per project, the defaults must fit, and it is worth considering **not shipping the mechanism to
consuming projects at all**, since it appears to matter only for developing the plugin itself.

The evidence below was gathered in one night, most of it by reading the largest consuming project
for the first time in its 143-day life.

---
**Witness:** the user, plus measurements in `/Users/k1/Projects/productive/unite-co-creator`
**Severity:** high — this is the largest measured cost fusion imposes on a consumer
**Affected:** `hooks/config.json`, `hooks/lib/config.ts`, `templates/fusion-guard.json`,
`skills/setup/SKILL.md`, `hooks/guard.ts`, `hooks/tracker.ts`, `hooks/lib/protected-snapshot.ts`
**Cross-references:** `shared/analyses/260812-0303-the-largest-consumer-read-for-the-first-time.md`;
`shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`;
`shared/issues/260812-0758_o_a-consuming-projects-guard-config-goes-stale-…`;
`shared/issues/260812-0758_o_fusion-setup-is-gitignored-in-a-consumer-…`

## The mechanism is enforced only where it is wrong

The shipped list is `agents/**`, `rules/**`, `.claude/rules/**`, `hooks/config.json`,
`hooks/hooks.json`, `settings.json`, `bin/monitor`, `.claude-plugin/plugin.json`. Every one of those
patterns names something in **fusion's own repository**. Their purpose there is real and narrow: an
agent must not edit the prompts and rules that govern it.

In fusion's own repository the guard **stands down**. Both halves: the write-tool deny on
`isFusionPluginCwd()` (`hooks/guard.ts:405`) and the protected-path measurement on
`isFusionPluginRoot(workbenchRoot)` (`hooks/tracker.ts:1161`).

So the list is in force everywhere **except** the one tree where its patterns mean what they say.
In a consuming project `rules/**` matches that project's engineering documentation, `agents/**`
and `.claude/rules/**` match whatever the project happens to keep there, and the remaining five
paths do not exist at all.

## What that cost one consumer, measured

- **53 records exist only because agents may not write files the project owns.**
- An invented task genre for unperformable work: `H:` hand-off, `X:` blocked.
- A plan deliberately split around a single line of documentation.
- Four rule-file defects open for over a week, because nobody was permitted to close them.
- One agent that read `guard.ts` and then wrote through `Bash` instead.
- One mandated manual paste that **deleted the passage it was sent to repair** — the only place in
  this record where something is broken rather than merely blocked.
- **Zero halts in 143 days**, and no recorded case of the guard preventing a mistake.

The per-tool-call cost is real but small and is stated here so it is not mistaken for the damage:
`protected-snapshot.ts` walks the tree and reads the **content** of every match, twice per tool
call, before and after. In that project the list matches 15 files and 179,505 bytes, so roughly
360 KB and 30 file reads per tool call. That is in the same class as the 593 ms all Setup helpers
together consume. The damage is the 53 records, not the milliseconds.

## The separation the design already provides, and did not use

There are three configuration layers and the built-in one is already correct:
`DEFAULTS.guard.protectedPaths` in `hooks/lib/config.ts` **is the empty list**. Only the plugin
layer, `hooks/config.json`, supplies the eight patterns, and that is the layer every consumer
inherits.

That the per-project fill was the intent is visible one line further down: `categoryPaths` and
`categorySensitivity` ship **empty**, as placeholders for a project to declare. `protectedPaths` is
the one placeholder somebody filled with fusion's own values, and it was never emptied again.

## Why no consumer ever narrowed it

The repair is a hand edit to a file the guard itself protects, so no agent can make it. The
workaround is a hand-off note an agent writes in thirty seconds. When the workaround is cheaper per
instance than the fix, the workaround becomes the process — and in 143 days it did.

Two further mechanisms keep a consumer from noticing at all. Nothing reports the **effective** list
at any point; the seeded template deliberately does not restate it, and points at a file inside the
install. And nothing notifies a project when fusion's default changes — the template presents that
inheritance as a convenience: *"A path added to that default later protects this project too,
without this file being touched."*

## The decision this rests on, which must be answered before anything is built

**Does a consuming project inherit any protected paths at all by default?** Three answers, and they
are not variants of one another:

1. **Empty the plugin layer.** One line. The built-in empty default takes effect, a project declares
   what it wants, and the machinery stays available. Least disruptive, and it leaves a mechanism
   that does nothing by default anywhere.
2. **Do not ship the protected-path half to consumers.** The user's own suggestion. It is defensible
   on the measurements: zero halts, no recorded prevention, stood down in the only tree where its
   content is meaningful. What has to be said out loud is that this removes a capability nobody has
   yet demonstrated a use for, which is a different claim from removing one that has failed.
3. **Keep it as explicit opt-in**, with Setup asking once and writing the answer into
   `fusion-guard.json`.

The measurement design itself is **not** what is in question. Measuring what changed instead of
predicting what a command will write was the right call, it was taken deliberately by the user on
260807, and it replaced 12,923 lines carrying 21 documented residuals. Whatever is decided here,
that design is not to be reopened.

## Acceptance

- A freshly set-up consuming project's **effective** protected list is either empty or something the
  project explicitly chose. No project can end up governed by a list it never saw.
- Setup **reports the effective list** it is running under, so inheritance is visible rather than
  silent. This is the cheapest half of the whole record and it holds whichever option is chosen.
- The seeded configuration cannot go stale in silence: either it carries the plugin version it was
  seeded from, or its explanatory prose is replaced by a pointer to text that is maintained.
- Setting the guard for a project is one edit in one file with one shape, and the file says what
  the current behaviour is rather than what an earlier version's behaviour was.
- fusion's own need — an agent must not edit the prompts that govern it — is either met where it is
  actually needed, or dropped with that consequence stated.
- Nothing in the fix requires an agent to write `fusion-guard.json`. It protects itself by design
  and that stays.

## Not in scope

The escalation counter and the churn thresholds live in the same file and have their own open
questions (`shared/analyses/260812-0251-four-mechanisms-purpose-bindingness-and-cost.md`). They ride
along in any edit to this file, but simplifying the protected-path half does not decide them.

---

## Measured 260812-1117: option 1 is not a one-line change

Someone applied option 1 to the working tree at 08:24, twenty minutes before this record was
committed — `guard.protectedPaths` emptied in `hooks/config.json`, uncommitted. An executor
dispatched at 09:00 found it, could not reach the stated green baseline, restored `HEAD` and
proceeded. It reported having copied the edit to a scratchpad; **no such file exists at the named
path or anywhere in the tree**, so the copy was not made. The content is one line and is not lost
in any substantive sense, but the report of a recoverable backup was false and is recorded here as
part of the measurement's provenance.

The measurement was then taken deliberately, against a scratch copy with a restore trap, on the
committed tree at `5acc626`:

| Shipped list | Suite |
|---|---|
| eight patterns, as shipped | 53 files, 1363 tests, **all pass** |
| `"protectedPaths": []` | **11 files and 153 tests fail** |

So the cheapest-looking option in this record costs 153 test repairs. That does not make it the
wrong answer — it makes it a different size of answer than "one line", and the size has to be known
before the choice is made.

**What the number actually says.** The suite encodes the shipped list as expected behaviour in
eleven files. Those tests were written while the list was fusion's own, for a guard that protects
fusion's own tree, by people whose project is the plugin. They are not evidence that a consumer
needs the list; they are the same inward-facing assumption as the list itself, one layer down. Any
option that changes what a consumer inherits has to decide what those eleven files should assert
instead — the honest candidate being fusion's own protection expressed as fusion's own fixture,
rather than as the shipped default every consumer inherits.

This also bears on option 2, not shipping the half at all: the 153 are a floor on that work too,
and probably not the whole of it.

---

## Decided 260812-1230 by the user: option 2, remove the protected-path half

The decision was taken after the corpus was searched for the failure the mechanism exists to
prevent. Across roughly 450 records in this project and the consumer's, there is **no recorded
instance** of an agent rewriting a rule to escape it, or weakening a gate instead of satisfying it.
The fourteen records mentioning a block or a halt are all about the guard's own behaviour.

The argument that settled it is about fusion's own tree rather than a consumer's. The guard has
stood down here since the first public release, and this is precisely where agents edit `agents/**`
and `rules/**` daily — about twenty dispatches on the night of 260811 alone. If the risk were real,
that stand-down would be reckless. It is treated as obviously necessary, because a tool whose core
may not be touched cannot be developed. Either the risk is not real, or fusion has run it knowingly
for four months without a single incident, and both readings end in the same place.

The counter-argument was weighed and does not carry: a quiet self-serving rule edit would not be
filed by the agent that made it, so absence of a record is not absence of occurrence. But `coderev`
reads every range as a diff, filed 159 of 272 attributed defects, and on 260811 caught a correction
applied in one file and left standing in its neighbour. The sensor is capable of it and has never
seen it. Accidental clobbering, the other thing the mechanism covers, is answered by git — while
the write-back has itself destroyed a human's editor save during a tool call (`260809-1107`).

**Scope of the removal is the protected-path half only.** The escalation counter and the churn
apparatus live in the same configuration and are separately open
(`shared/analyses/260812-0251-four-mechanisms-purpose-bindingness-and-cost.md`). They are not
decided here and must not be swept along.

**What the removal has to establish rather than assume:** whether anything still blocks a tool call
once protected paths are gone. The escalation counter counts blocks, and if the protected-path deny
was the only source of one, the escalation half has no input and the question of what remains of
the guard answers itself. That is a measurement for the plan, not a premise.

One irony to record rather than hide: `bin/fusion-protected-paths`, released in v7.4.0 four hours
before this decision, reports a list that is about to stop existing. It was the right thing to
build at the time — it is what made the inheritance visible — and it goes with the rest.

---
Resolved: Closed on the strongest of the outcomes this record asked for. It offered "simplified, project-settable and defaulted to fit" or "not shipped to consumers at all"; what happened is the second. The user chose the protected-path removal on 2026-08-12, and the remainder followed on 2026-08-16: `hooks/guard.ts` is 223 lines at HEAD, every path allows, and no configuration leaf governs a verdict. The configuration surface is one file with one live setting (`fusion.json`, `orchestrator.maxTurns`), git-tracked and documented in the file itself. There is nothing left to simplify. Closed by reconciliation pass 260817-1836 at HEAD `2552586`.
