# Session: Steps 1 and 4 — the floor the loader actually read, and the exemption's precedence

---
**Agent:** coder
**Date:** 2026-08-04
**Circle:** `circles/260801-1244-guard-rules-write`
**Status:** Complete — not committed; the orchestrator commits after validation
**Plan:** `circles/260801-1244-guard-rules-write/planning/260804-1633_o_plan-c5b-remediation-and-ship.md`, Steps 1 and 4
**Closes:** `260804-1604` (Step 1); decision `260803-1314`, realised (Step 4)
**Suite:** `npx vitest run` — **1532 passed, 26 files** (from 1448 across 25)

---

## The three headline answers

**Nothing newly allows.** Measured against a generated cross-product of 182,688
classifications across twelve project scenarios (working directory at the root and one
below it × a project that inherits, declares one subtree, or declares `rules/**` × the flag
set and unset), on both write surfaces: 0 newly allowed under Step 1 alone, 0 under Step 4
alone, 0 under both. 10,290 newly denied, every one attributable by isolating a single step
— 6,189 to Step 1, 4,056 to Step 4, 45 to both, 0 to neither.

**A project that declares nothing gets the exemption exactly as before.** Asserted three
ways: the whole 145-case exemption unit suite passes the empty declared list, so every case
written before this decision is now that assertion; three integration cases run it through a
real guard subprocess (a project with an inheriting `fusion-guard.json`, a project with none
at all, and a project that declared some other key); and the mutation that gets it wrong in
the safe-looking direction breaks 26 cases.

**One sentence in each shipped document became false, and it is the same sentence.** Both
`rules/protected-path-discipline.md:750` and `README-hooks.md:215` list "walking out and
back by name" as a live residual — `cd .. && cd project && rm rules/x.md`. Step 1 closes it.
Measured through the real guard: that command now **denies** on the rule file and on
`agents/coder.md`, and `rm ../<project>/rules/x.md` and `Edit ../<project>/rules/x.md` deny
too, while `cd .. && cd project && rm notes.txt` still allows. Step 7 owns both files. This
is the second entry in this Circle whose residual closed under it, so it is the branch
`260804-1346` anticipated: **delete for the stated reason, do not narrow.** Details below.

---

## What was built

### Step 1 — the floor protects the file the loader actually read

Four things, and only the first was in the plan.

**1. The floor is two spellings of one file** (`hooks/lib/config.ts`). The bare
`fusion-guard.json` plus the absolute path the layer was read from. Both are appended only
when the declared list does not already carry them, so the floor stays idempotent in both
spellings.

The bare name stays, and not only for the cwd-is-the-root case. `globToRegex` reads `*`, `?`
and `[` as glob syntax with no escape, so a project root whose absolute path contains one of
those three gets an absolute pattern meaning something other than the literal path — wider
for `*` and `?`, unusable for an unbalanced `[`. The bare name is the spelling that still
works there. The pair is a graceful degradation, not a redundancy, and the comment says so.

**2. `normalizeToRelative` now resolves a relative path** — extracted to
`hooks/lib/project-relative.ts` as `projectRelative(filePath, cwd)`. **This was not in the
plan and the plan is wrong without it.** See `## What the plan got wrong`.

**3. `GuardConfig` gained `floorPaths`** — the entries the floor appended, a load report
beside `diagnostics` and `protectedPathsSource`. The floor stopped being one bare pattern,
so a caller that wants the entries the PROJECT declared has to be able to take the loader's
own back out. That caller is Step 4.

**4. `projectDeclaredProtectedPaths(config)`** in `config.ts` — `protectedPathsSource ===
"project"` minus `floorPaths`. Step 2 added the provenance field for exactly this consumer;
this is the function that reads it.

### Step 4 — the exemption's precedence, gate 1b

`rules-write-exemption.ts` gained one gate, `projectProtectedMatch`, and one refusal,
`project-protected`. `rulesWriteRefusal`, `isProjectRulePath` and `rulesWriteRefusalNote`
take the project's declared entries as a **required** fourth argument — required for the
same reason `spelledAs` is: an omitted list widens the grant, which is the unsafe direction.

**Order: gate 1 (membership) → gate 1b → gate 0 (`..`) → gate 2 (filesystem).** Gate 1b
above gate 0 for the reason gate 1 is already above it: gate 0's note is the one note in the
module that tells the reader to change the path, and "name the rule file without a `..`" is
true and useless when a project entry will refuse it either way.

**Matched the way the PROTECTION side matches, not the way the grant does** — case folded,
and a directory operand retried with a trailing separator. Both are the opposite of gate 1's
conventions and both are right here, because a wider match on this gate REFUSES more. Each
buys a real spelling: without the fold a project declaring `rules/Immutable/**` loses its own
entry to `RULES/…` on a case-insensitive volume; without the retry `rm -rf rules/immutable`
deletes the subtree the project declared immutable, because the protection side matched it by
retrying the separator and this side would have handed the grant to the bare directory name.

**The refusal quotes the project's entry.** `projectProtectedNote(pattern)` is a function
rather than a table row precisely so it can name the line that refused. That is the decision
record's own obligation: a curator meeting the deny needs to see that a human decision is
refusing them and which entry made it, or the deny reads as the flag being broken.

**`guard.ts` reads `projectDeclaredProtectedPaths(config)` and nothing else.** Pinned by a
new wiring assertion, because `config.guard.protectedPaths` has the same type and would
compile.

---

## What the plan got wrong, discovered while building

**Step 1's stated change closes two of the four rows it lists.** The plan says the floor
"appends the absolute path of the project configuration file … and lets the existing
absolute-path handling in `normalizeToRelative` do the rest". There is no such handling for a
relative path: `normalizeToRelative` returned a relative input UNCHANGED, so
`../fusion-guard.json` was matched as the literal text `../fusion-guard.json` against a list
of patterns none of which can begin with `..`. Two of the issue's four measured rows —
`Edit ../fusion-guard.json` and `rm ../fusion-guard.json`, and with them
`cd .. && rm fusion-guard.json` — are untouched by the absolute pattern alone. The
normaliser has to resolve first. Verified by mutation: restoring the old normaliser breaks 15
cases including five subdirectory guard verdicts.

**Step 1's file list is short by three.** It names `hooks/lib/config.ts` and two test files.
The change also needs `hooks/guard.ts` (the normaliser), a new module
`hooks/lib/project-relative.ts`, and a comment correction in
`hooks/lib/bash-mutation-guard.ts` — `ancestorOfProtected`'s docstring said "no protected
pattern in the list is absolute", which the floor's second spelling falsifies. The comment
now states that `/` stays excluded as a choice rather than a vacuity, and why.

**The extraction was not gold-plating.** `normalizeToRelative` lived in `guard.ts`, which
runs `main()` on import, so the one function deciding which coordinate space every path is
read in could only be exercised through a subprocess. Two of the three defects this step
found in its own work were found by unit-testing it directly. It also made the cross-product
comparison honest: the "before" side is eight transcribed lines rather than a second copy of
a 3,300-line classifier.

**`resolve()` drops a trailing separator, and a deny depended on it.** The first version of
`projectRelative` turned `Edit agents/` from a **deny** into an **allow** — `agents/**`
compiles to `^agents/.*$`, whose `.*` matches the empty string, so `agents/` matches and the
bare `agents` does not. Four suite cases caught it, including the flag's headline use
(`mv rules/x.md rules/retired/`, whose destination is a directory). `withTrailingSeparatorOf`
puts it back. This is the one place in this session where the change genuinely moved a
protection in the forbidden direction, and it was caught by the suite rather than by
reasoning — worth recording as such.

**Step 4's "explicitly declared" has a sharp edge the plan does not state.** A project that
copies fusion's own `rules/**` into its `fusion-guard.json` — to add one entry, say — loses
the flag for the whole rule directory, `rules/retired/` included. There is no exception for a
declared entry that happens to equal one of fusion's; the flag reaches a path only while the
list protecting that path is fusion's. It follows from the decision rather than contradicting
it, it is the safe direction, and it is pinned by a `STATED COST:` integration case. **Step 7
owes it a sentence**, or a project meets a deny it reads as the flag being broken.

**Step 4's `Files` line names `hooks/lib/rules-write-exemption.ts`, `hooks/guard.ts` and two
test files; it also needs `hooks/lib/config.ts`** for `projectDeclaredProtectedPaths` and its
seven unit cases. Putting the derivation in the loader rather than in `guard.ts` keeps
"which entries did this project declare" a single fact with a single definition.

---

## Verification

### Suite

`npx vitest run` — **1532 passed, 26 files.** Baseline before this session: 1448 across 25,
re-run and confirmed at the start. `npx tsc --noEmit` clean. `npm test` was **not** run: it
rebuilds `hooks/dist/`, which Step 8 owns.

**85 cases added, 1 deleted, net +84** — counted per file rather than estimated:
`project-relative.test.ts` 28 (new file), `config.test.ts` 60 → 72,
`rules-write-exemption.test.ts` 125 → 145, `guard-rules-write-integration.test.ts` +24 − 1,
`guard-bash-wiring.test.ts` 42 → 43. The deleted case is the `MEASURES:` one that pinned the
opposite of decision `260803-1314` and disclaimed endorsement while citing the record. It
failed the day the decision landed, exactly as it was written to.

### The four rows of `260804-1604`, through a real guard subprocess with cwd one level below the project root

| Row | Before | After |
|---|---|---|
| `Edit ../fusion-guard.json` | allow | **deny** |
| `Edit <abs>/fusion-guard.json` | allow | **deny** |
| `rm ../fusion-guard.json` | allow | **deny** |
| `cd .. && rm fusion-guard.json` | allow | **deny** |
| CONTROL `Edit secret/a` (proves the root file was loaded) | deny | deny |

Plus `rm <abs>/fusion-guard.json` on the shell surface, and the control that the narrowing
took effect (`Edit rules/x.md` allows under a project list that omits it).

### The `/fusion:setup` Step 0f probe, run twice

The plan's own falsification test for Step 1, because that block was reshaped around the
floor. Both commands go through the real guard AND through a real `bash` in the throwaway
project. First run: probe allows and reports `absent`, copy allows and creates the file.
Second run: probe allows and reports `present`, and the copy the skill tells the agent not to
run **denies** — which is the behaviour that prose is written around. Decision `260802-1912`
is not reversed by accident, and the same is asserted from a subdirectory.

### Cross-product — nothing newly allows

182,688 classifications. Twelve scenarios: {cwd at the root, cwd one below} × {inherits,
declares `rules/immutable/**`, declares `rules/**` + `agents/**`} × {flag set, unset}. 16
verbs × 44 operands × 5 `cd` prefixes × 4 second operands, plus redirection, `;`, `&&`, `|`
and subshell shapes; and every operand again on the write-tool surface.

| | newly allowed | newly denied |
|---|---|---|
| Step 1 alone | **0** | — |
| Step 4 alone | **0** | — |
| Both | **0** | 10,290 |

Attribution is mechanical rather than a heuristic: four configurations are classified for
every row (before / Step 1 only / Step 4 only / after), and each new denial is attributed by
asking which single-step variant already produces it. 6,189 Step 1 alone, 4,056 Step 4 alone,
45 both, **0 attributable to neither**. A first attempt used a hand-written cause heuristic
and left 2,119 rows unexplained; the heuristic was wrong, not the guard, and it was replaced
rather than argued with.

One thing to know about this measurement: the first run of it compared against a **stale**
baseline copy — a directory left in the scratchpad by an earlier session, which predated the
case-folding work. It was caught by diffing the copy against the working tree (`paths.ts`
differed, and I had not touched `paths.ts`). The rerun models the before-side from the
current tree instead: one classifier, two configurations, differing in exactly the three
inputs these steps move. That is exact rather than approximate for Step 4 — gate 1b's loop
over an empty list never runs, so the exemption with `declared: []` IS the exemption as it
stood before.

### Anti-vacuity — five mutations, applied and reverted against checksummed copies

Every one fails at a guard VERDICT rather than at a loader return value, and all four
checksums matched the pristine copies afterwards.

| Mutation | Breaks | What it proves |
|---|---|---|
| M1 — the floor drops its absolute spelling | 16, incl. all 6 subdirectory verdict rows | the second spelling is load-bearing |
| M2 — `projectRelative` stops resolving a relative operand | 15, incl. 5 subdirectory verdict rows | the plan's shape alone does not close the issue |
| M3 — the trailing separator is not put back | 11, incl. `Edit agents/` and the flag's headline `mv` | the separator carries a deny |
| M4 — the subtraction reads the EFFECTIVE list | **26**, incl. all three HALF 2 rows and every pre-existing exemption case | the trap: the flag dies everywhere, silently |
| M5 — gate 1b removed | 12 | the gate is what the Step 4 denies rest on |

M4 is the one worth reading twice. Substituting `config.guard.protectedPaths` for
`projectDeclaredProtectedPaths(config)` compiles, has the same type, reads as correct, and
ends `FUSION_ALLOW_RULES_WRITE` in every project on earth — because after `260804-1630` an
omitted list inherits the plugin's, and the plugin's contains `rules/**`.

### Byte-identity for a project with no `fusion-guard.json`

Still holds against the transcription of the pre-C5b loader. `floorPaths` is excluded from
the comparison in `effective()`, alongside `diagnostics` and `protectedPathsSource` — and the
exclusion list is spelled out rather than derived, so a fourth field fails that case until
someone decides it is a report rather than a setting. Both byte-identity cases failed on the
first attempt for exactly that reason, which is the assertion doing its job.

---

## The two shipped documents

**Do not edit** — Step 7 owns them, and four obligations were discharged there in `98c9363`.
Nothing below contradicts those four. What Step 7 needs to know:

1. **One entry is now false in both files.** `rules/protected-path-discipline.md:750` ("The
   classifier cannot walk out and back by name. `cd .. && cd fusion && rm rules/x.md` is
   allowed: the guard is given a path normaliser, not the project directory's own name") and
   the same entry inside `README-hooks.md:215`'s residual list. Both are closed by Step 1 and
   measured closed on both surfaces. The reason the entry gave is precisely what changed: the
   normaliser now resolves. This is obligation 11's branch — deleted for a stated reason, not
   silently.
2. **Two sentences are no longer unconditional.** `rules/protected-path-discipline.md:49` and
   `README-hooks.md:145` both say "with the flag set, `Edit rules/x.md` is allowed and
   `Edit RULES/x.md` is denied". True for every project that declares no `protectedPaths` —
   which is every project today — and false for one that declares `rules/**`. The sentences
   are about the case fold and stay right about that; they now need the qualifier.
3. **The floor is two spellings, and one of them is absolute.** Obligation 4 has to describe
   it that way. It is the only pattern in the effective list that names a location rather
   than a shape, and the reason is that it is the only one whose subject has a location the
   loader already knows.
4. **Two new denials worth a sentence.** `rm -rf ..` from a subdirectory of a project that
   HAS a `fusion-guard.json` now denies, on the configuration file it would take with it; and
   a `writesThrough` verb whose pathspec resolves back to the working directory
   (`cd .. && git checkout HEAD~1 -- sub` from `sub/`) denies. Both are ancestor-pass
   consequences of the absolute floor entry and of the resolving normaliser.
5. **The sharp edge of Step 4**, above: a project that declares `rules/**` for itself loses
   the flag for the whole rule directory. Obligation 13 is where it belongs.
6. **Nothing else moved.** 29 example rows from the two documents were re-measured through a
   real guard, one fresh project per row (three blocks in one project raise the halt, after
   which every row reads as a deny for the wrong reason — the first attempt did exactly
   that). Every one still holds: `rm -rf node_modules` / `dist` / `hooks/dist`, `cp x .`,
   `rm -rf .`, `cd build && rm -rf out`, `cd /tmp && rm -rf x`,
   `(cd rules && ls) && rm x.md`, `curl -o rules/x.md`, `rm -rf *`, `rm -rf {rules,agents}`,
   `pushd hooks && npm test; popd` all still allow; `rm -rf rules` / `hooks`,
   `mv hooks /tmp`, `cp /tmp/x hooks/`, `cd fusion-workbench && rm -rf .guard-state`,
   `cd rules && rm -rf .`, `rm AGENTS/coder.md`, `rm -rf RULES`,
   `ls -la # writes > rules/x.md`, `git clean -fdx`, `Edit agents/`, `Edit rules/`,
   `Edit AGENTS/coder.md`, `Edit HOOKS/config.json`, `Edit Rules/x.md` all still deny.

---

## What a consuming project could do to itself

**Step 1.** A project whose agents run from a subdirectory gets a floor that defends the file
governing them, which is what the seeded template already promises. The widening the step
warned about is real and measured: an absolute pattern is folded by `matchesAnyFolded` like
every other, so on a case-insensitive volume the floor also matches a differently-cased
spelling of the same path — a wider deny, the safe direction. The one that was not
anticipated runs the other way and is now closed: a relative operand that walked out of the
working directory and back in reached the whole protected list, and it took the suite rather
than an argument to notice that the fix for it nearly cost `Edit agents/`.

**Step 4.** A project can make a subtree of its own `rules/` immutable against the flag, and
the deny it meets names the entry that made it. What it can also do, without meaning to, is
declare `rules/**` in its own file and lose the flag entirely — a narrowing, so the safe
direction, but a surprise unless Step 7 says so. What it cannot do in either case is widen
anything: gate 1b only ever refuses, and a project that declares nothing is byte-identically
where it was.

---

## Files changed

- `hooks/lib/project-relative.ts` — **new**
- `hooks/lib/config.ts` — the floor's second spelling, `floorPaths`,
  `projectDeclaredProtectedPaths`
- `hooks/lib/rules-write-exemption.ts` — gate 1b, `projectProtectedMatch`,
  `projectProtectedNote`, the fourth argument
- `hooks/guard.ts` — `normalizeToRelative` delegates; `declared` threaded to both surfaces
- `hooks/lib/bash-mutation-guard.ts` — one docstring paragraph, no executable change
- `hooks/lib/__tests__/project-relative.test.ts` — **new**
- `hooks/lib/__tests__/config.test.ts`
- `hooks/lib/__tests__/rules-write-exemption.test.ts`
- `hooks/lib/__tests__/guard-rules-write-integration.test.ts`
- `hooks/lib/__tests__/guard-bash-wiring.test.ts`

The two edits are separable: Step 1 is the first six bullets minus gate 1b, Step 4 is
`rules-write-exemption.ts` plus the `declared` threading plus
`projectDeclaredProtectedPaths`. Step 4 depends on Step 1's `floorPaths`; Step 1 does not
depend on Step 4 and reverts on its own.

**Not committed.** No `git add`, no `git commit`. `hooks/dist/` untouched — Step 8 owns it.
