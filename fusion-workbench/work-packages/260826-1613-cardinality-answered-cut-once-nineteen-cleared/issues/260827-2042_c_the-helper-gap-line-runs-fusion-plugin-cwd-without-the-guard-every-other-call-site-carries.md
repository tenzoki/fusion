The helper-gap line runs fusion-plugin-cwd without the guard every other call site carries

---
`skills/setup/SKILL.md:412` calls `"$FUSION_PLUGIN_ROOT/bin/fusion-plugin-cwd"` bare, in the line whose own prose (`:410`) cites the `[ -x ]` miss branch and decision `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md`. Decision `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md` makes the guard the convention at every `bin/` call site. Harmless today (exit 127 short-circuits the `&&` and stderr is dropped), and the one site in the file that breaks the rule it is there to measure.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`; commit `abb0238`

## Fix direction

`[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-plugin-cwd" ] && "$FUSION_PLUGIN_ROOT/bin/fusion-plugin-cwd" 2>/dev/null && for h in bin/*; …`.

## Acceptance

`grep -c 'fusion-plugin-cwd' skills/setup/SKILL.md` shows the call preceded by its guard.

---
Resolved: 260827-2103 by coder. The Step 2 helper-gap line is now `[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-plugin-cwd" ] && "$FUSION_PLUGIN_ROOT/bin/fusion-plugin-cwd" 2>/dev/null && for h in bin/*; …`, the guard every other call site carries (decision `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`). +1 path token on the reference gate, 0 anchors, measured by single-file revert.
