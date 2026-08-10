The rooted citations read the installed copy inside the plugin's own repo, where the helpers deliberately do not

---

`89b13f1` changed four citations from `agents/orchestrator.md` to
`$FUSION_PLUGIN_ROOT/agents/orchestrator.md` (`skills/setup/SKILL.md:211,229,231,245`;
`skills/next/SKILL.md:106,175`). For a consuming project that is strictly right — nothing the plugin
ships exists at the project root, so the bare path resolved to nothing.

In **this** repository it inverts a preference the project established on purpose. `CLAUDE.md`
`## Conventions` → *Rules loading*: `$FUSION_PLUGIN_ROOT` "pins to the installed copy for the whole
session", and `bin/fusion-rules` / `bin/fusion-paths` were taught to prefer the work tree here
(decision `260806-0015_*_veraltete-regeln-im-eigenen-repo-melden-oder-umgehen.md`, option c) after
"a four-day session read the installed v5.8.0 rules while editing v5.9.1 sources". Before the change,
a bare `agents/orchestrator.md` from a session at this repo's root resolved to the work tree — the
file the developer is editing. After it, the same citation resolves to `~/.fusion/agents/
orchestrator.md`.

Measured now: both copies are v7.2.0, the presence check finds `#### Reading a queue` in the install,
and nothing misbehaves. That is a coincidence of a fresh `fusion --update`, not a property of the
change. The first edit to `### The queue's ground` in the work tree makes `/fusion:setup` in this
repo run the previous release's branches while the developer reads the new ones.

---

**Failure scenario.** A session in this repository edits the four-row verdict table under
`#### Reading a queue`. `/fusion:setup` then runs the check from `~/.fusion/agents/orchestrator.md`,
which still carries the old table, and reports a verdict the source no longer produces. The presence
check at `skills/setup/SKILL.md:251` cannot see this: it greps for the *heading*, which is present
in both copies, so it prints "canonical section found" and the divergence stays silent — the same
class of gap the check was added to close, one level down.

**Fix direction.** Two candidates, neither obviously right, which is why this is filed rather than
patched:

(a) Resolve the citation the way the helpers do — `bin/fusion-plugin-cwd && SEC="./agents/
    orchestrator.md" || SEC="$FUSION_PLUGIN_ROOT/agents/orchestrator.md"`. One extra line per site,
    and it makes the skills' rooting congruent with the two helpers instead of contradicting them.

(b) Accept the install copy everywhere and document the residual, as `CLAUDE.md` already does for
    the hooks ("run `fusion --update` and restart the session" before rule or guard work). Cheaper,
    but it adds a third surface to that manual discipline.

**Cross-references.** `CLAUDE.md` `## Conventions` → *Rules loading*, and the `bin/fusion-plugin-cwd`
row in `## Layout`. Decision `260806-0015_*` behaviour rule (a).

**Filed by:** coderev, review of session `260810-1646` Turn 1, range `5ef92eb..940d522`.
