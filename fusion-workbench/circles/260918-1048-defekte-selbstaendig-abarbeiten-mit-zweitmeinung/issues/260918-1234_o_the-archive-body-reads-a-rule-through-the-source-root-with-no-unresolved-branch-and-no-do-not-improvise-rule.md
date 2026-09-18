The archive body reads a rule through the source root with no UNRESOLVED branch and no do-not-improvise rule

---

`skills/archive/SKILL.md` reads `rules/workbench-tracking.md` through the source root (`:36` `cat "$FUSION_SRC/rules/workbench-tracking.md"`). Its resolution block at `:30-34` has no `UNRESOLVED` branch: with `FUSION_PLUGIN_ROOT` unset the `[ -x ]` guard at `:30` fails, the else branch at `:34` assigns `FUSION_SRC="$FUSION_PLUGIN_ROOT"`, which is `""`, and `:36` runs `cat /rules/workbench-tracking.md`. Its report sentence at `:39` ("say so and continue — the tier tables below still apply, but the classification behind them is then unread") does not forbid reconstructing that classification from memory and cites no place that does.

---

**Filed by:** coder, Kai Stalmann <ks@qantr.com>

Surfaced while fixing `260908-1855_*_the-source-root-cut-left-two-of-four-bodies-without-the-do-not-improvise-instruction.md`, whose fix moved the do-not-improvise rule into `bin/fusion-source-root`'s exit-2 paragraph so that every body reading shipped text through the helper can cite one place for it. That record counted four bodies (`setup`, `cleanup`, `help`, `next`); `grep -rl fusion-source-root skills/` names a fifth, `archive`, which the record did not cover.

Evidence, `skills/archive/SKILL.md`:

- `:30` `if [ -x "${FUSION_PLUGIN_ROOT:-}/bin/fusion-source-root" ]; then` — the guard tests the install copy. An unset variable makes the path `/bin/fusion-source-root`, so the guard fails and the else branch runs.
- `:33-34` the else branch prints "the source root falls back to that install copy" and assigns `FUSION_SRC="$FUSION_PLUGIN_ROOT"`. The message is written for a helper missing from an install that exists; with no install at all it names an empty path as the fallback and the assignment yields `""`.
- `:36` `cat "$FUSION_SRC/rules/workbench-tracking.md"` — with `FUSION_SRC=""` this is `cat /rules/workbench-tracking.md`, the empty-root resolution `bin/fusion-source-root`'s exit-2 paragraph describes as finding nothing and saying nothing about why. The helper's own exit 2 (unset root, not the plugin's repository) is also not distinguished at `:31`: a non-zero exit there leaves `FUSION_SRC` empty by command substitution, and `:36` runs the same `cat`.
- `:39` "If the resolved root does not hold the file, say so and continue — the tier tables below still apply, but the classification behind them is then unread." The sentence covers a resolved root without the file, not an unresolved root, and it stops at "unread": nothing forbids writing the record-versus-live-state classification from memory in the file's place, and the sentence cites neither `bin/fusion-source-root`'s header nor `rules/fusion-workbench-conventions.md` `## Path Resolution` for the rule.

The inline re-resolution at `:159` has the same shape (`FUSION_SRC="${FUSION_PLUGIN_ROOT:-}"`, then a guarded call) and falls to `""` the same way.

**Acceptance test:** the body either cites `bin/fusion-source-root`'s header (exit-2 paragraph) for the `UNRESOLVED` branch and the do-not-improvise rule, or carries the rule itself; and an unset `FUSION_PLUGIN_ROOT`, or a helper exit 2, does not reach `cat` at `:36` — the block reports the root as `UNRESOLVED` and the run does not read through an empty value.
