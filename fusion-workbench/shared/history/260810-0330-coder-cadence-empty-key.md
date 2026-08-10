# Task 10 — an empty resolver key stops `/fusion:cadence` instead of producing a quiet week

**Agent:** coder
**Status:** Complete
**Origin:** Not Circle work. Closes a defect from the shared issue store; no Circle was active.
**Source record:** `fusion-workbench/shared/issues/260731-2246_o_cadence-empty-key-expansion-writes-a-silently-empty-digest.md`
**Queue entry:** `fusion-workbench/tasklist.md` § 10 (`I:260731-2246-empty-key`)

## What was wrong

`WORKBENCH`, `OUT_MEMO` and `SCAN_HISTORY` are resolver keys the running agent is expected to
substitute textually into the skill's shell blocks. Nothing exports them, and the Bash tool gives
every call a fresh shell, so a block run verbatim expands all three to the empty string. Three
sites then failed quietly rather than loudly:

- the history gather loop yielded zero iterations and exit 0,
- the activity-log `[ -f ]` test simply returned false,
- `mkdir -p "$WORKBENCH/$OUT_MEMO"` became `mkdir -p "/"`, which succeeds, sending the digest to
  `/cadence-$USER.md`.

The skill then built three lists from an empty source set and wrote a well-formed digest saying
nothing happened. A quiet week and a broken path resolution were indistinguishable in the output,
which is the silent-failure class the framework rules name, and the digest asserted a quiet week
the skill never checked.

## What changed

One mechanism, applied where the shell boundary requires it. Not an `export`, and not a per-site
patch, per the direction in the record.

1. **Step 3, immediately before the gather block.** A short assertion over the three keys. It
   collects the names of the empty ones and exits 1 naming them, so the message says *which* key
   was empty rather than just that something went wrong. The block is written in the same
   interpolated idiom as the rest of the skill, which is what makes it self-triggering: an agent
   that forgets to substitute runs the assertion unsubstituted too, the keys expand to empty, and
   the assertion fires on exactly the mistake it exists to catch. On success it echoes the three
   resolved values, so a run leaves an auditable record of what it resolved to.

2. **Prose around it.** Step 3 gained the substitution instruction it lacked (step 2 already had
   one, at "Use the printed values literally"), plus the rule that a non-zero exit stops the skill
   and writes no digest at all. The paragraph draws the distinction the record asks for: an empty
   *directory* is legitimate on a fresh workbench and still earns a normal quiet-week digest; an
   empty *key* never is.

3. **Step 8, on the `mkdir`.** The same check on `WORKBENCH` and `OUT_MEMO` guards the write. This
   is the one place the fix is not a single site, and deliberately so: the Bash tool starts a new
   shell per call, so nothing step 3 established survives to step 8. Without it the
   `mkdir -p "/"` path stays open even in a run where step 3 passed. The added prose says why the
   check repeats, so a later editor does not read it as redundant and delete it.

4. **Graceful degradation.** A closing paragraph states that an empty key is not degradation:
   every other case in that list still writes a digest, and this is the only condition under which
   the skill produces no file.

The unit-of-counting text task 9 landed minutes earlier (steps 4, 6, 7, the git legend row and the
report template's `Sources scanned` example) was not touched. The frontmatter was not touched
either, since task 30 owns it.

## Verification

The skill's behaviour is prose executed by an agent, so the blocks were extracted from the file as
written and run directly, rather than retyped.

- **Failure path, the reported mode.** The step-3 block run with all three names unset, under both
  `bash` and `zsh`: `fusion bug: cadence resolver key empty or unset: WORKBENCH OUT_MEMO
  SCAN_HISTORY`, exit 1 in both shells.
- **Failure path, partial.** One key empty with the other two set names only `SCAN_HISTORY`; two
  empty names both. The message identifies the specific key, which is the acceptance criterion.
- **Success path.** The block with the values substituted textually, as the running agent is
  instructed to do (`[ -n "/Users/k1/.../fusion-workbench" ]`, and so on) prints the resolved
  values and exits 0 under both shells.
- **Normal path unchanged.** The gather loop with `SCAN_HISTORY=shared/history` substituted still
  finds 92 history files in this workbench.
- **Quiet week still distinguishable.** With the keys valid but the history directory empty, the
  assertion passes and the gather yields zero files, so the skill proceeds to a normal digest. The
  failure case writes no file at all, so the two are distinguishable in the output.
- **Step-8 guard.** Both keys empty, and each singly empty, print the refusal and exit 1 under
  both shells; with both set the `mkdir` runs and creates the directory.

`cd hooks && npm test` — **31 files, 898 tests, 1 failing.** The failure is
`lib/__tests__/reference-resolution-lint.test.ts`, reporting a dangling record citation
`260719-1600_o_open-issue.md` at `bin/fusion-plane:567`. **It is not from this task.** That token
does not exist in `bin/fusion-plane` at HEAD (`git show HEAD:bin/fusion-plane | grep` finds
nothing) and does not appear in `skills/cadence/SKILL.md` at all; it arrives with an uncommitted
117-line change to `bin/fusion-plane` sitting in the working tree from a concurrent task, where it
is an illustrative filename inside a comment explaining `stable_basename`. The lint reads it as a
citation to a workbench record.

`lib/__tests__/path-literal-lint.test.ts` — **passing.** That is the check a skill-body edit can
actually fail, and it was run on its own to confirm it.

`bin/fusion-paths cadence` still emits the same three keys (`WORKBENCH`, `OUT_MEMO`,
`SCAN_HISTORY`) and exits 0, so the added key mentions did not disturb the derived key set.

## Left for the orchestrator

Two things, both outside the file this dispatch allowed.

- **The convention line is not written.** The record's recommended fix has a second half: one line
  in `rules/fusion-workbench-conventions.md` `## Path Resolution`, under *Where the call belongs*,
  saying that a consumer interpolating a resolver key into a shell block must fail loudly on an
  empty expansion. The queue entry's own acceptance criteria include it, and the seven sibling
  skills that share the house pattern (`archive`, `circle-pop`, `circle-stash`, `direct`, `next`,
  `seed-from-plane`, and `agents/playmaker.md`) inherit the guarantee from that line rather than
  from patches of their own. The dispatch restricted this task to `skills/cadence/SKILL.md`, so
  **task 10 is not fully complete** and its queue entry should stay open until the convention line
  lands.
- **Tracking updates not made:** `fusion-workbench/tasklist.md` § 10 still reads
  `**Status:** [ ] open`, and the issue record is still `260731-2246_o_...` with no `Resolved:`
  note. Given the point above, both are arguably correct as they stand.

## Files changed

- `/Users/k1/Projects/productive/fusion/skills/cadence/SKILL.md`
