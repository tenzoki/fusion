`$FUSION_SRC` resolves to the empty string with no report when `FUSION_PLUGIN_ROOT` is unset

---

The source-root branch introduced by `63deec1` in `skills/setup/SKILL.md:14-17` and
`skills/next/SKILL.md:15-18` is:

```bash
if "$FUSION_PLUGIN_ROOT/bin/fusion-plugin-cwd" 2>/dev/null; then FUSION_SRC="$PWD"; else FUSION_SRC="$FUSION_PLUGIN_ROOT"; fi
echo "source root: $FUSION_SRC"
```

With `FUSION_PLUGIN_ROOT` unset the test command is `/bin/fusion-plugin-cwd`, which does not exist,
so the `else` branch assigns the empty string. `echo` then prints `source root: ` and the skill's
next sentence says *"Hold the printed path."* There is no path.

---

**What the empty value then does.** `$FUSION_SRC` has three consumers in `skills/setup/SKILL.md`
and two in `skills/next/SKILL.md`. Only one of the five reports the failure:

| Site | On empty `$FUSION_SRC` |
|---|---|
| `skills/setup/SKILL.md:260` (`SEC=`) | prints `queue-check: UNAVAILABLE`, naming the resolved path — correct |
| `skills/next/SKILL.md:121` (`SEC=`) | same — correct |
| `skills/setup/SKILL.md:238` (churn-rank block) | silent: `/agents/orchestrator.md` is not there, the block is not found, no high-thrash ranking is taken and nothing says so |
| `skills/setup/SKILL.md:239` (domain-cascade block) | silent: the domain heuristic is not read, and Setup reports whatever the agent improvises |
| `skills/next/SKILL.md:185` | prose citation only |

The two silent ones are the two most consequential reads in Setup Step 5.

**Which rule this contradicts.** `rules/fusion-workbench-conventions.md` `## Path Resolution` →
*Where the call belongs*: *"An empty or unset value is never a default, a fallback, or an empty
result — nothing is scanned through it, nothing written through it, and the run halts naming the key
… a consumer that does not check reports it as a finding."* That paragraph is written about
`fusion-paths` keys, and its stated reason — *"a held value is interpolated into a shell block, a
glob or a path join and can go missing long after the resolver exited 0"* — is exactly this case.

**And which convention it departs from, from the same session.** Commit `26ea3c3` established the
`[ -x ]` guard for prompt-called `bin/` helpers, with a stderr line naming the gap, and
`agents/orchestrator.md:142` argues it at length (decision `260810-0921`, option a1: tolerate and
report). The new branch calls `bin/fusion-plugin-cwd` bare and reports nothing — neither when the
helper is missing (an install that predates it, which the prose explicitly anticipates) nor when the
root variable is unset.

**Note that both of these are true at once**: an absent helper and an unset root take the *same*
branch and produce *different* values, one usable and one not, with no way for the reader to tell
which happened.

**Fix direction.** Give the branch the shape the rest of the session settled on:

```bash
if [ -z "${FUSION_PLUGIN_ROOT:-}" ]; then
  echo "fusion: FUSION_PLUGIN_ROOT is unset — no source root. Restart the session so the SessionStart hook exports it." >&2
elif [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-plugin-cwd" ] && "$FUSION_PLUGIN_ROOT/bin/fusion-plugin-cwd"; then
  FUSION_SRC="$PWD"
else
  FUSION_SRC="$FUSION_PLUGIN_ROOT"
fi
```

and state at the citation sites that an empty `$FUSION_SRC` halts rather than resolving to `/`.

Whoever takes this should read
`shared/issues/260810-2030_o_the-source-root-resolution-is-stated-in-two-skill-bodies-and-has-no-single-home.md`
first: if the resolution moves into a `bin/` helper, the guard belongs there once instead of in each
body, and the two changes are one change.

**Cross-references.** `skills/setup/SKILL.md:14-17, 238-239, 259-262`;
`skills/next/SKILL.md:15-18, 120-123`; `agents/orchestrator.md:119-124, 132-142`;
`rules/fusion-workbench-conventions.md` `## Path Resolution`;
`shared/decisions/260810-1544_o_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md`.

**Filed by:** coderev, review of session `260810-1646` Turn 2, range `da8c9db..b3cc034`.
