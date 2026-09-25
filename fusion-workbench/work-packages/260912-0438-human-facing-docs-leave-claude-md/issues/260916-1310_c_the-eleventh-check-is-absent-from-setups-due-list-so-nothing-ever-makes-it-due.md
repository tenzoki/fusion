The eleventh check is absent from Setup's due list, so nothing ever makes it due

---
`skills/check/SKILL.md` gained a `claude-md` selector in `c9d4013d`, and its own body states the
cadence that makes these checks periodic: *"`/fusion:setup` asks for a selector again only when the
version differs or that date is more than 30 days old"* (`skills/check/SKILL.md:8`).

The list that computes which selectors are due was not updated. `skills/setup/SKILL.md:86`:

```js
const SEL = ["monitor","concurrency","assets","config","permissions","gitattributes","identity","gitignore","upstream","leftovers"];
```

Ten entries. `claude-md` is not among them, and `due = SEL.filter(...)` two lines below is the whole
of what `checks_due=` names. `skills/setup/SKILL.md` Step 1 performs *"the section of each named
selector"*, so a selector `SEL` does not carry is never due, never reported at Setup, never run on
the periodic path and never stamped by Setup.

What still works: `/fusion:check` with no argument runs every selector in that body's table, and
`--only claude-md` runs it by hand. Both require the user to type the command. The check ships as a
periodic installation check and is reachable only manually.

Two corroborating statements that are false at HEAD as a consequence:

- `skills/check/SKILL.md:8` — "These eleven checks ran at the top of every session until the ramp-up
  was cut", and the 30-day sentence after it. Neither holds for the eleventh.
- `README-agents.md:220` — "Each ran check is stamped into `.fusion-setup`, and `/fusion:setup` asks
  for it again only when the plugin version differs or the stamp is over 30 days old." `/fusion:check`
  does stamp `claude-md`; Setup never reads that entry.

Nothing gates this. No test in `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` pins `SEL`
against the selector table in `skills/check/SKILL.md`, so the two enumerations drifted in one commit
with a green suite.

**Acceptance test:** `/fusion:setup` in a workbench whose `.fusion-setup` carries no `claude-md`
entry prints `claude-md` in `checks_due=` and performs it; and the two enumerations — `SEL` in
`skills/setup/SKILL.md` and the selector table in `skills/check/SKILL.md` — are held equal by a gate,
or a record says why they are not.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
Cross-references: `260916-1126_*_implementation-human-facing-docs-leave-claude-md.md` (step 4, which added the selector).

---
Resolved: `claude-md` added to `SEL` in `skills/setup/SKILL.md:86`, so the eleventh selector is now
reported in `checks_due=`, performed by Step 1 and stamped on the periodic path. Verified against a
marker carrying entries for `monitor` and `leftovers` only: the block prints
`checks_due=concurrency,assets,config,permissions,gitattributes,identity,gitignore,upstream,claude-md`.
Neither of the two corroborating statements the record names was edited — `skills/check/SKILL.md:8`
and the `/fusion:check` row in `README-agents.md` are true again because the code moved to meet them,
which is the only reading under which the 30-day cadence applies to all eleven. The paid-for cut is
`Ten of them,` at `skills/setup/SKILL.md:12`, a bare cardinality with no enumeration beside it
(`rules/critical-stance.md` §5), which makes the change -1 byte on a `skills/` surface that had 1.
The second half of the acceptance test — the two enumerations held equal by a gate — is NOT met, and
the record it admits instead is
`260916-1323_*_the-two-selector-enumerations-are-not-held-by-a-gate-and-the-hook-test-surface-cannot-pay-for-one.md`:
the derivation costs about +350 bytes against 1 of margin, and a lint costs lines against a
`hook-tests` surface at 0.
