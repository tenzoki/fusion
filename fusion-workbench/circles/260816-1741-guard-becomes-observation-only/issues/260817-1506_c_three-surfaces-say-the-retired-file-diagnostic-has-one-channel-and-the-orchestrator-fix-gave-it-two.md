Three surfaces say the retired-file diagnostic has one channel, and the orchestrator fix gave it two

---

`01932d6` widened the orchestrator's repeat-to-the-user mandate so that **every** diagnostic the
configuration loader returns is spoken aloud in the Setup-complete summary
(`agents/orchestrator.md:132`, `skills/setup/SKILL.md:292`). That is the right fix and it works —
verified below. What no step touched is the four places that state, as a settled design fact, that
the retired-file diagnostic reaches a project through the per-call advisory channel *and nothing
else*.

**Verified, in a scratch project** (`fusion-workbench/.fusion-setup` present, `fusion-guard.json`
carrying `{"orchestrator":{"maxTurns":12}}`, no `fusion.json`): `bin/fusion-turn-budget` printed
`max_turns=5` on stdout and the full retired-file sentence on stderr, exit 0. So a session that
runs Setup now hears it in the terminal, not only in the dashboard.

**The one that is now flatly false.** `docs/upgrading-to-v10.md:11-13`:

> If your `fusion-guard.json` set a Turn budget, that budget stops being applied the moment you
> upgrade, **and no session says so out loud.** The first check below is the whole of the fix and
> takes about a minute.

A session does say so out loud, at Setup, as of `01932d6`. This is the sentence that motivates the
whole page, in the migration note a v9 project opens at upgrade.

**Two more that become incomplete rather than false.**

`docs/upgrading-to-v10.md:74-77`: "That channel was chosen over a one-off Setup message
deliberately: it reaches a project on every call, where a Setup message reaches only a project that
runs Setup again." Both now exist.

`README-hooks.md:315`: "This diagnostic is the whole of the v10 migration, deliberately — it runs
on every guarded call, where a Setup step would run once per session and only for a project that
runs Setup at all." Same shape.

**And the record.** `hooks/lib/config.ts:105-114` states the same in capitals ("THE RETIRED-FILE
DIAGNOSTIC IS THE WHOLE OF THE v10 MIGRATION") and cites decision
`260816-1916_i_does-setup-offer-to-move-a-projects-turn-budget-out-of-the-retired-configuration-file.md`,
whose option 1 was chosen and whose recorded Con reads: *"the advisory reaches it through the
monitor's warnings panel and the event log rather than as a sentence in the terminal."* `01932d6`
removes that Con without amending the record's `Implemented:` note.

**This is not a re-opening of the decision.** Option 2 and option 3 were about `/fusion:setup`
*writing the project's configuration on its behalf*; `01932d6` writes nothing and reads no old
file, so it stays inside option 1. What changed is the reach, and the reach is what four surfaces
describe.

**Severity:** Medium, and it is coupled to an unshipped commit rather than to shipped behaviour.
`01932d6` is not on `origin/main`; the v10.0.0 tag sits at `e331332`, three commits behind. At the
tag every sentence above is true. **The moment `01932d6` ships, the patch carries a fix and a doc
that contradicts it**, so these edits belong in the same patch, not after it.

**Suggested fix.** Four line-scoped edits, no restructuring:
1. `docs/upgrading-to-v10.md:12` — replace "and no session says so out loud" with what is now true:
   the loss is silent in the code, and fusion names it on every guarded call and once in the
   orchestrator's Setup summary.
2. `docs/upgrading-to-v10.md:74-77` — say the per-call channel was chosen as the one that does not
   depend on Setup running, and that the Setup summary repeats it when Setup does run.
3. `README-hooks.md:315` — same correction, same reason.
4. `hooks/lib/config.ts:105-114` and the `Implemented:` note on `260816-1916` — record that the
   Setup surface repeats the loader's stderr, so a later reader does not take the module docstring
   as the complete channel list.

**Cross-references:**
- `docs/upgrading-to-v10.md:11-13`, `:74-77`
- `README-hooks.md:315`
- `hooks/lib/config.ts:105-114`
- `agents/orchestrator.md:132`, `skills/setup/SKILL.md:292` (the fix)
- `circles/260816-1741-guard-becomes-observation-only/decisions/260816-1916_i_does-setup-offer-to-move-a-projects-turn-budget-out-of-the-retired-configuration-file.md`

---
Resolved: three of the four cited sites were corrected; the fourth was left alone as still true.

- `docs/upgrading-to-v10.md:11-13` — "and no session says so out loud" was flatly false and is
  gone. The paragraph now says the budget is not moved for you, that fusion names the leftover
  file on every guarded tool call, and that the orchestrator repeats that line in its
  Setup-complete summary whenever a session runs Setup.
- `docs/upgrading-to-v10.md:74-77` — "chosen over a one-off Setup message" asserted an
  exclusivity that `01932d6` ended. It now says the per-call channel is the one that does not
  depend on Setup, keeps the reach argument that is still true, and adds that the Setup summary
  repeats the same line when Setup runs.
- `README-hooks.md:315` — the subjunctive "where a Setup step *would* run" said no Setup step
  speaks it. Corrected to the indicative, with the clause that the orchestrator repeats every
  diagnostic the loader returns in its Setup-complete summary. The "whole of the v10 migration"
  claim was kept: nothing in fusion moves the budget, which is what that clause asserts, and the
  Setup summary repeats the diagnostic rather than performing the migration.
- `hooks/lib/config.ts:105-114` — the docstring was not false but was readable as the complete
  channel list. Narrowed "`/fusion:setup` was the alternative" to "`/fusion:setup` MOVING THE
  BUDGET was the alternative", which is what `260816-1916` options 2 and 3 actually proposed, and
  added that `bin/fusion-turn-budget` puts the loader's diagnostics on stderr and the
  orchestrator repeats them at Setup, while Setup still writes nothing and reads no old file.
  `hooks/dist/lib/config.js` and `.d.ts` rebuilt so the shipped copies carry the same comment.

Left alone deliberately, with reasons:

- The recorded `Cons` line on decision `260816-1916` option 1 ("the advisory reaches it through
  the monitor's warnings panel and the event log rather than as a sentence in the terminal"). A
  Con is a record of what was weighed at the time, not a live claim, and amending it was outside
  the scope this patch was dispatched with. Its `Implemented:` note cites `fab8a4b`, `92db96a`
  and `18c125b`, all of which it describes correctly; `01932d6` is a later commit under a
  different issue. Worth a follow-up if a reader is expected to take the record's Cons as current.
- `hooks/lib/__tests__/hooks-wiring.test.ts:46` ("the retired-file diagnostic IS the whole of the
  v10 migration for a consuming project"). It argues the Bash matcher must stay because a project
  that never runs Setup has only the per-call channel, which `01932d6` does not touch.

**Verification:** `cd hooks && npm test` — exit 0, 653 passed, 35 files. One intermediate red is
worth recording: the first correction cited `agents/orchestrator.md` by path in `README-hooks.md`,
which took `reference-resolution-lint`'s pinned path count from 1120 to 1121. The citation was
dropped in favour of naming the orchestrator's Setup Step 2 in prose, so no pinned number was
edited. `hooks/lib/*.ts` is scanned `recordsOnly`, so the same pointer inside `config.ts` costs
nothing.
