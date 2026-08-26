# A fourth SessionStart command lands, and four prose sites still say there are three

---
Step 11's first branch adds `hooks/session-id.ts` and a fourth SessionStart command to
`hooks/hooks.json`. Every shipped description of that hook surface counts three, and none of
them is a file the step was scoped to touch.

---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

**Severity:** Low

**Cross-references:**
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/planning/260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`,
step 11, first branch.

## The four sites

1. `CLAUDE.md`, the `hooks/` row of the Layout table: "SessionStart runs three independent
   commands: the `FUSION_PLUGIN_ROOT` export, the static Fusion loaded banner, and
   `session-start.ts`". There are four, and the fourth is the one that puts the Claude Code
   session identifier in front of the model on plain stdout.
2. `README-hooks.md` `## Architecture`, the SessionStart branch of the tree, which names
   `session-start.ts` alone.
3. `README-hooks.md` `### 1. Verify hooks are wired`, the `hooks.json` snippet a user compares
   their own file against. A user who copies it back loses the new command silently.
4. `README-hooks.md` `## Files`, whose table carries a row per top-level hook entry point and
   has none for `session-id.ts`. No lint holds this table to the tree — the enumeration lint
   covers `lib/*.ts` rows only (`hooks/lib/__tests__/derivable-enumerations-lint.test.ts`
   section 5) — so nothing here goes red.

A fifth, smaller: `hooks/lib/__tests__/hooks-wiring.test.ts:93` opens a comment with "The three
SessionStart commands are independent by design".

## Why it was not fixed in place

The step's dispatch enumerated the files it may touch and none of these is among them. The
`agents/` growth budget was not the constraint: 431 of 1 063 bytes were still unspent.

## Fix direction

One pass over the five sites. The count is the only claim that moved; the reasoning each site
carries about why the commands are independent holds unchanged and gains a case, since the new
command is separate for a sharper reason than the other two — it needs the opposite output
channel, and one process writes one stdout.
