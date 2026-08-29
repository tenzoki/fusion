# Collapse the eight administrative commands into three entry points

**Domain:** code
**Filed by:** user (directed in conversation 260814-2312_*_collapse-the-eight-admin-commands-into-three-entry-points.md, written by consultant on that instruction)
**Related:** `260814-1733_*_radical-simplification.md` — this is a sub-step of that
simplification and should be shaped as part of it, not on its own axis

The eight commands the user names as the administrative surface — `setup`, `unlock`, `cleanup`,
`archive`, `revise-claude-md`, `curate`, `log-activity`, `cadence` — are not eight peers. They are
two entry points and six components, and three of those components are already steps of `cleanup`
while also carrying their own slash name. That double life is the reported difficulty: the user
cannot tell when to use which, because three of the names denote something that also happens without
being named.

The measured structure. `skills/cleanup/SKILL.md:152-168` reads and executes `archive` (tier-1),
`revise-claude-md` (full three-pass) and `log-activity` inline as its Steps 4, 5 and 6, so a user who
types `/fusion:cleanup` never types those three. `unlock` writes the permission settings a project
needs once, and an open issue already says Setup must seed that file
(`260810-0326_*_setup-must-seed-claude-settings-because-the-plugin-settings-json-is-not-a-permission-source.md`);
`skills/setup/SKILL.md` mentions `unlock` nowhere, so the two halves of one job do not know about
each other. `cadence` is read-only on every input and writes only its own digest
(`skills/cadence/SKILL.md:254-255`), which makes it a reading command rather than an administrative
one and mis-grouped with the other seven from the start.

The proposed shape, one mechanism rather than six deletions: keep **`setup`**, **`cleanup`** and
**`cadence`** as the visible names. The three pipeline steps lose their own slash name and become
step arguments of the pipeline they already belong to (`/fusion:cleanup archive`). `unlock` becomes a
Setup step, which is what the open issue asks for anyway. The user then remembers one rule instead of
eight names: setup at the start, cleanup at the end, cadence to see what happened.

The open question is `curate`. It edits `CLAUDE.md`, and so does `revise-claude-md`, but
`agents/curator.md:54` and `:335` explicitly disclaim the session-learnings pass and hand it back to
that skill. So the two are not duplicates — they are the same file under two different standards of
proof, one autonomous and one evidence-tiered behind a user gate. Whether that makes `curate` a deep
mode of the same pipeline (`/fusion:cleanup --deep`) or a fourth standing name is undecided here and
is the part that needs shaping.

Not verified: that reducing the visible names to three actually makes the system easier to operate.
What is verified is only that three of the eight are already steps of a fourth.

Promoted: 260815-0007-remove-eight-mechanisms-and-cap-growth — the administrative surface collapses to three names as the sub-step of that simplification it declared itself to be; curate replaces revise-claude-md as the one gated path to CLAUDE.md.
