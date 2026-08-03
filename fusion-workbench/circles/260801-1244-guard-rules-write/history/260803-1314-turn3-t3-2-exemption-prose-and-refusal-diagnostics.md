# Turn 3, task T3-2 — four findings against one module: the prose, and the refusal nobody could read

**Status:** Complete
**Agent:** coder
**Circle:** `circles/260801-1244-guard-rules-write`
**Closes:**
`issues/260802-2213_c_rules-write-detail-says-a-protected-rule-paths-for-a-multi-path-list.md` (Low),
`issues/260802-2231_c_stated-exempt-boundary-is-narrower-than-the-implemented-one-for-whole-subtree-deletes.md` (Low),
`issues/260802-2333_c_the-exemption-docstring-says-canonicalise-is-shared-with-the-protection-check-…` (Medium),
`issues/260802-2332_c_the-nlink-heuristic-locks-out-legitimately-hard-linked-rule-files-…` (Medium),
`issues/260803-1252_c_a-gate-0-deny-reads-as-an-ordinary-protected-path-deny-…` (Medium, T3-1's sibling)
**Files:** `decisions/260803-1314_o_may-a-project-protect-a-path-inside-its-own-rule-directory-against-the-rules-write-flag.md`
**Scope touched:** `hooks/lib/rules-write-exemption.ts`, `hooks/guard.ts`,
`hooks/lib/bash-mutation-guard.ts`,
`hooks/lib/__tests__/{rules-write-exemption,guard-rules-write-integration,guard-bash-wiring}.test.ts`
**Tests:** 1047 passed (baseline 1009, +38)
**`hooks/dist/`:** tracked files restored to HEAD with `git checkout -- hooks/dist` after the
final run. The four UNTRACKED `dist/lib/{fs-locator,rules-write-exemption}.{js,d.ts}` were
already present and untracked on arrival (Turn 2's new modules, as T3-1 also recorded); Plan
Step 10 owns them and they were left alone.

## The shape the four findings turned out to have

Three of the four are prose and one is behaviour, but they are not four independent edits.
Findings 4 (`260802-2332`) and its T3-1 sibling (`260803-1252`) are the same defect arriving
from two gates: with the flag set, the agent is refused and told nothing that distinguishes
the refusal from the flag being unset. One mechanism closes both, and building two would have
been the "pile of point-solutions" the critical-stance rule names. Finding 3
(`260802-2333`) is prose about a split that the same mechanism has to respect, so it was
written after the code rather than before it.

## Finding 1 — the plural article (`260802-2213`)

One line in `rulesWriteDetail`. The article now travels with the label:

```ts
const label = paths.length === 1 ? "a protected rule path" : "protected rule paths";
return `Override ${RULES_WRITE_ENV} allowed a normally-denied write to ${label}: ${list}`;
```

The two existing assertions checked that the paths were joined and never looked at the
sentence around them, which is exactly how the defect survived Step 4's own measurement. They
now compare the whole string, and a third asserts `"a protected rule paths"` never appears.

## Finding 2 — the stated exempt boundary (`260802-2231`), re-measured first

The issue predicted its own rows would still hold after gate 0. **They do, with one row
changed**, and the change is a spelling rather than a reach. Real guard subprocess, one
throwaway project per row, shipped `hooks/config.json`, `FUSION_ALLOW_RULES_WRITE=1`:

```
  Bash surface                     flag off    flag on
  rm -rf rules                     DENY        DENY
  rm -rf rules/                    DENY        DENY
  rm -rf rules/*                   DENY        allow
  rm -rf rules/**                  DENY        allow
  rm -rf rules/retired             DENY        allow
  rm -rf rules/retired/            DENY        allow
  rm -rf rules/retired/*           DENY        allow
  mv rules/retired /tmp/gone       DENY        allow
  cd rules && rm -rf retired       DENY        allow
  cd rules && rm -rf .             DENY        DENY
  rm -rf rules/a/../retired        DENY        DENY    <- gate 0, new since the issue
  rm rules/x.md                    DENY        allow   (control)
  mv rules/x.md rules/retired/     DENY        allow   (headline use)

  write-tool surface (Edit)        flag off    flag on
  rules/x.md                       DENY        allow
  rules/retired/x.md               DENY        allow
  rules/retired                    DENY        allow
  rules/                           DENY        DENY
  rules                            allow       allow   (never protected — see below)
  rules/retired/../x.md            DENY        DENY    <- gate 0
```

Three things the measurement says that the issue did not:

1. **The bare directory denies in the classifier's FIRST pass, not the ancestor pass.**
   `isProtected` retries a directory operand with a trailing separator, and `rules/` matches
   `^rules/.*$` because `.*` matches the empty string. The issue, the module docstring and one
   existing test comment all said "ancestor". The docstring now says what happens; the
   pre-existing test comment at `guard-rules-write-integration.test.ts` already had it right
   and is where I checked myself.
2. **`Edit rules` (no separator) is not protected at all**, with or without the flag — the
   same `^rules/.*$` asymmetry seen from the write-tool side, where there is no directory
   retry. Unchanged by this task and not a defect of it, but it belongs next to row 4 of the
   table or the table reads as inconsistent.
3. **The `.claude/rules` rows say nothing about the exemption.** `.claude/rules/**` is not on
   the protected list at HEAD, so those paths allow with the flag either way. Probed and
   dropped from the table to avoid recording a row that measures the wrong thing.

The fix is the docstring, per the issue's own recommendation: `isProjectRulePath` now carries
a `## What the flag reaches, measured` section stating the subtree reach, naming
`rm -rf rules/retired` as the outcome a curator would least expect, and saying that only the
bare directory node is out of reach. The reach is additionally pinned by unit cases
(`rules/*`, `rules/**`, `rules/retired`, `rules/retired/*` exempt; the bare spellings not), so
the prose is falsifiable rather than merely present.

The issue's two adjacent questions are Step 6's and were not answered here. Filed as
`decisions/260803-1314_o_may-a-project-protect-a-path-inside-its-own-rule-directory-against-the-rules-write-flag.md`
rather than decided in a docstring, because closing the issue would otherwise take the
question with it.

## Finding 3 — `canonicalise` is not shared (`260802-2333`)

All three recommendations taken, in gate 1's paragraph:

- a subsection headed "Gate 1 runs `canonicalise`; the protection check runs
  `collapseSegments`" names them as two functions, states that the difference is the
  trailing-separator strip and one line wide, gives the one-line reason (widening is
  protection on one side and a bigger grant on the other), and points at the two definitions
  in `paths.ts` instead of paraphrasing them. It records that the unification was proposed
  once, by the Turn 1 review, and would have removed three denials;
- the two-*surfaces* argument at `:12-16` is kept and now carries the distinguishing clause:
  one predicate for two callers asking the same question is a single source of truth; one
  function for two checks widening in opposite directions is a lost denial;
- the closing note's second reason is now in the file a maintainer is in. The Bash surface
  hands over operands nobody collapsed, and the classifier's own `path.normalize` keeps a
  trailing separator, so `rm -rf rules/` arrives spelled that way. **Verified rather than
  copied from the issue:** the measured `rm -rf rules/` row above denies with the flag set,
  which is only true if the predicate strips the separator for itself.

## Finding 4 — the refusal nobody could read (`260802-2332` + `260803-1252`)

Direction 1, extended to gate 0, one mechanism for both.

**The decision is now one function.** `resolvesInsideRuleDir` returns a refusal instead of a
boolean (the extra return value the issue costed), and `rulesWriteRefusal` is the whole
decision: null when the grant holds, otherwise `not-a-rule-path`, `spelled-with-dotdot`,
`hard-link`, `unresolvable` or `resolves-outside`. `isProjectRulePath` is that function read
as a boolean — asserted case by case, so a "message-only" second implementation of the
boundary cannot appear later. `rulesWriteRefusalNote` turns a refusal into the sentence a
caller appends.

**Two surfaces, one wording.** `guard.ts` appends the note to CHECK 2's deny reason directly.
The Bash classifier takes it through a new `MutationOptions.exemptRefusal`, a sibling of
`exempt` with the same `(path, spelled)` shape, gated in the same conditional. That was the
choice worth thinking about: the alternative was to carry the offending operand's spelling out
on `MutationVerdict` and let `guard.ts` compose the message. The seam won because the note
then lands BEFORE the "do not rephrase / STOP and ask the user" instruction rather than after
it, where it would have read as contradicting it. The classifier still knows nothing about
rule files: it takes a string back and puts it in the reason, exactly as it takes a boolean
back and skips the operand.

What the two headline measurements now read (real subprocess, flag set):

```
  Edit rules/x.md, two rule files hard-linked to each other
    Protected path: rules/x.md cannot be modified directly. This path is under compliance
    guard protection. FUSION_ALLOW_RULES_WRITE is set and this path is inside a rule
    directory, but the exemption still refused it: the file already has a second name on
    this filesystem (a hard link), so the exemption cannot prove that writing this name
    writes only a rule file. Rewriting the command will not help — ask the user.

  Edit rules/retired/../x.md
    … but the exemption still refused it: the spelling contains a `..` segment, which the
    exemption never covers. A `..` deletes the component before it, and that component can
    be a symlink that sends the write somewhere else entirely. Name the rule file without
    a `..`.

  Edit rules/x.md, hard-linked, flag UNSET
    Protected path: rules/x.md cannot be modified directly. This path is under compliance
    guard protection.                                (byte-identical to before this task)
```

`resolves-outside` and `unresolvable` are measured too, through a planted `rules/up -> ../`
and a symlink cycle respectively.

**The design decision inside the diagnostic.** `rulesWriteRefusal` asks gate 1's membership
test BEFORE gate 0's spelling test, although the numbering has it the other way. Both are pure
text and both refuse, so the boolean cannot change; what changes is which refusal is reported.
Without the reorder, `Edit x/../agents/coder.md` with the flag set would answer "the flag does
not cover `..` spellings", which is true, useless, and reads as an invitation to try again
without the `..` — the precise thing `260803-1252`'s closing constraint forbids. Gate 0 still
runs strictly above the FILESYSTEM gate, which is the ordering that is load-bearing, and a
case pins that separately.

Two properties are asserted rather than left to wording:

- a path that is not a rule path gets NO note, so `agents/coder.md` reads exactly as it always
  did, with the flag set or unset;
- only the gate-0 note names an action; the other three say rewriting will not help and send
  the reader to the user.

## Considered and deliberately not done

**A note for the bare rule directory.** `rm -rf rules` with the flag set gets no explanation
(measured above: the exemption classifies `rules` as `not-a-rule-path`, so no note). An agent
curating rules could plausibly meet that deny and be as confused as by the two this task
closed. I did not add it, for one reason: the honest note would have to say what the flag does
cover, and what it covers is `rules/*` — telling the agent that is teaching the workaround
around a deny, which is the failure `rules/protected-path-discipline.md` exists to prevent.
The boundary is documented in the docstring instead, and T3-7 owns the user-facing half.
Recorded here so it is a decision rather than an oversight.

**Direction 2 of `260802-2332`** (narrow the hard-link test to a link crossing the boundary),
for the reason the issue gives: there is no portable way to enumerate an inode's other names
short of walking the tree.

**Direction 3** (document the hard-link cost in `README-hooks.md`) is T3-7's. Not touched.

## Test coverage

+38 cases, 1009 → 1047, across three files.

`rules-write-exemption.test.ts` (+36 of the file's own): the refusal matrix (one row per kind,
plus the exempt control), the report-order property, the gate-0-above-the-filesystem property,
the isProjectRulePath-agrees-with-rulesWriteRefusal equivalence over six subjects, the note
contents, the "only gate 0 names an action" constraint, the single-line invariant, the
whole-sentence advisory assertions, and the subtree-reach rows for finding 2.

`guard-rules-write-integration.test.ts`: nine subprocess cases — the hard link on both
surfaces, the flag-unset byte-identical control, the accepted cost stated as a decision (two
hard-linked RULE files, both refused, both surfaces), the gate-0 note on Edit and through the
tracked `cd`, `resolves-outside`, the two not-a-rule-path controls, the escalation record
carrying the cause, and the unaliased neighbours still being granted so the note is not a new
refusal in disguise.

`guard-bash-wiring.test.ts`: four source-level pins — the note is asked with the same two
spellings, only while a deny is being rendered, gated on the same flag as the exemption, and
never inside a condition on either surface.

**Anti-vacuity, measured twice.** With `rulesWriteRefusalNote` stubbed to return null, 9 of
the new cases fail. With gate 0 restored to its original position above gate 1's membership
test, the 2 cases pinning the report order fail. Both probes were reverted and the suite is
green at 1047.

## Residuals, measured not assumed

1. **A deny still names the COLLAPSED spelling.** Through a planted `rules/up`,
   `Edit rules/up/../agents/coder.md` reports `rules/agents/coder.md`, which does not exist.
   Left open deliberately: that string is what the protection side matched, and changing it
   would make the deny reason and the protected-list match disagree. What changed is that the
   reader is no longer left with only that string. Recorded in `260803-1252`'s resolution note
   as the half that stays open, on the same ground as
   `260803-1251_o_fs-locator-collapses-dotdot-lexically-…`.
2. **The bare-directory deny has no note**, by the decision above.
3. **The note costs a second run of the gates on the deny path** — one `lstat` and up to three
   `realpath` calls, on a call that was going to stop anyway. Not measured in time; the
   alternative (carrying the refusal out of the first evaluation) would have put a diagnostic
   field on the seam that every allow pays for.
4. Everything Turn 2 and T3-1 left open is untouched and unchanged by this task: case folding
   on the protection side, `realFsLocator.absolute()`'s lexical collapse, the unresolved second
   name for the project root, a symlink into a protected directory, and
   `spellingWalksUp` being `/`-separated only.

## Setup note

`fusion-rules coder` run from the workbench directory emits no voice profile, because the
helper resolves `./fusion-workbench/stilwerk/…` relative to the cwd. Re-run from the project
root it emits `chat-voice-en.yaml`, which is what this session's chat output follows. The
long-form writing profile is not emitted for `coder` by design.

Not committed — the orchestrator commits after validation.
