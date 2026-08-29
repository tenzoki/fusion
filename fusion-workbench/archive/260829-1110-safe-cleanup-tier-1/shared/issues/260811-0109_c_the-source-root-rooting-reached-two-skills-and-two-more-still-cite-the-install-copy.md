The `$FUSION_SRC` rooting reached two skills, and two more still cite plugin source through the install copy

---

`63deec1` gave `skills/setup/SKILL.md` and `skills/next/SKILL.md` a resolved source root — the work
tree when `bin/fusion-plugin-cwd` says cwd is the plugin's own repository, `$FUSION_PLUGIN_ROOT`
otherwise — and moved all eight of their citations of `agents/orchestrator.md` onto it. That closed
`260810-1918_*_the-rooted-citations-read-the-installed-copy-inside-the-plugins-own-repo-where-the-helpers-do-not.md`.

Two other skill bodies carry citations of the same class and were not moved:

- **`skills/cleanup/SKILL.md`** — six, at `:11`, `:117`, `:125`, `:134`, `:140`, `:146`. Two of them
  are load-bearing for behaviour, not just for reading: `:125` sends the reader to *Setup Step 5 of*
  `$FUSION_PLUGIN_ROOT/agents/orchestrator.md` as the one place the domain cascade is decided, and
  `:134`/`:140`/`:146` tell the skill to read three other skill bodies from the install and execute
  their procedures inline.
- **`skills/help/SKILL.md`** — five, at `:23`, `:25`, `:49`, `:55`, `:88`, pointing at
  `docs/philosophy.md`, `docs/working-model.md`, `rules/fusion-workbench-conventions.md` and
  `README-agents.md`.

`grep -rl 'FUSION_SRC' skills/ agents/` returns exactly `skills/next/SKILL.md` and
`skills/setup/SKILL.md`.

---

**Why this is the same defect and not a cosmetic asymmetry.** Inside this repository
`bin/fusion-rules` and `bin/fusion-paths` read the work tree on purpose, and `$FUSION_PLUGIN_ROOT` is
pinned to the installed copy for the whole session. A skill that cites the install therefore hands a
reader rules and paths from the checkout and a cited procedure from the install — two versions of one
file, differing in silence. That sentence is not new here; it is the argument written into
`skills/setup/SKILL.md:23` and `skills/next/SKILL.md:24` to justify the branch those two files now
carry. The argument does not stop at their own file boundary.

The sharpest case is `/fusion:cleanup`, because the closing record for the earlier defect says the
file was handled: "Every plugin-file citation in the file is now rooted." It is — at
`$FUSION_PLUGIN_ROOT`, which is the root the very next task in the same session decided was the wrong
one for setup and next. The closure is honest about what it did; nothing recorded the residue.

**Failure scenario.** A fusion developer edits `agents/orchestrator.md` Setup Step 5 in the work tree
and then runs `/fusion:cleanup` in the same session without `fusion --update`. Step 3 follows `:125`
into the installed `agents/orchestrator.md`, reads the previous release's cascade, and the reconcile
step is dispatched with a domain decided by a version of the heuristic that is no longer in the tree.
The `queue-check`-style presence check that would make this audible exists only in setup and next.

**In a consuming project the two roots hold the same value**, so nothing changes there — which is
also why this is invisible without looking.

**Fix direction, not prescribed.** Either extend the two-line branch to the other two bodies (which
makes it four statements of one criterion and worsens
`260810-2030_*_the-source-root-resolution-is-stated-in-two-skill-bodies-and-has-no-single-home.md`
and `260810-2145_*_should-a-repeated-skill-body-snippet-become-a-bin-helper…`), or resolve `2030`
first with a `bin/` helper and root all four bodies through it in one change. The second order is the
cheaper one, and this record exists partly to give `2030` its real call-site count: it is four
consumers, not two.

**Cross-references.**
`260810-1918_*_the-rooted-citations-read-the-installed-copy-inside-the-plugins-own-repo-where-the-helpers-do-not.md`;
`260810-1918_*_the-citation-rooting-reached-two-of-three-skills-and-its-own-example-is-unrooted.md`;
`260810-2030_*_the-source-root-resolution-is-stated-in-two-skill-bodies-and-has-no-single-home.md`;
`260810-2145_*_should-a-repeated-skill-body-snippet-become-a-bin-helper-now-that-one-fact-lives-in-four-executable-copies.md`;
`CLAUDE.md` `## Conventions` → *Rules loading* (the work-tree preference and its exact bound).

**Filed by:** reconciler, final reconciliation of session `260810-1646-orchestrator-session.md`, at HEAD `e2a34f0`.

---
Resolved: the record's own preferred order was taken — `260810-2030` was resolved first with a
`bin/` helper, and all four bodies were rooted through it in one change rather than the two-line
branch being copied into two more files.

`skills/cleanup/SKILL.md` — the opening paragraph, the commit reference at `:117`, the domain
cascade at `:125` (the behavioural one, which now reads Setup Step 5 from the copy the session is
actually editing), and the three inline-procedure reads at `:134`, `:140`, `:146` are all on
`$FUSION_SRC`. Its four `bin/` invocations deliberately stay on `$FUSION_PLUGIN_ROOT`: an
executable is run, not read, and part (c) of `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md` is unanswered.
`skills/help/SKILL.md` — the five doc citations plus `README-hooks.md`,
`hooks/config.example.json` and the `bin/fusion-rules` header-as-spec read moved with them;
`bin/fusion-paths` (run) and `templates/investigator-capture-layout.md` (copied) stay on the
install root.

Both files gained the `UNRESOLVED` report the record noted existed only in setup and next, so the
failure scenario it describes — a developer running `/fusion:cleanup` against a stale install and
getting the previous release's cascade — is now either correct or audible.

`grep -rl 'FUSION_SRC' skills/` returns all four bodies.
