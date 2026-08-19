The "no released version" premise behind leaving the migration gap open is contradicted by `install.sh`'s default ref

---

`260819-0041_o_the-decision-record-status-removal-got-none-of-the-three-migration-surfaces-…` was
deliberately left open. The recorded reason, in
`shared/history/260818-2301-orchestrator-session.md` and again in `06ab15b`'s commit message, is:

> v10.2.0 is tagged on an ancestor, so the removal is in no released version, and both available
> moves state something false — a v10.2 note tells an installed base it carries a change it does
> not, and a v10.3 note names a version number nobody has chosen.

The first half is checkable and true. The second half is false for the install path this repository
calls the recommended one.

---

**What checks out.** `git rev-list -n1 v10.2.0` is `e14b6ca` (2026-08-18 18:03), an ancestor of this
range; `git merge-base --is-ancestor v10.2.0 b54ace5` succeeds, so the `**Status:**` removal is
after the tag; `.claude-plugin/plugin.json` still reads `10.2.0`, twelve commits on. No **tagged**
release carries the removal.

**What does not.** `install.sh:34` reads `REF="${FUSION_REF:-heads/main}"`, and `README.md:14` gives
the install command with no `FUSION_REF`. `CLAUDE.md` `### HTTPS installer (install.sh) — the
recommended end-user path` describes it as exactly that, and `fusion --update` re-fetches the same
default ref. A user who installs or updates today gets `main`, which carries `b54ace5`, while their
`plugin.json` still reads `10.2.0`.

So the population the argument protects — readers *on v10.2.0* who do not carry the change — and the
population the argument overlooks — readers whose `plugin.json` also reads `10.2.0` and who *do*
carry it — are the same version string. `docs/upgrading-to-v10-2.md` is precisely the document the
second group would consult, and its silence is as false to them as a note would be to the first.

**What this does and does not change.** It does not make "leave it open" wrong. The record's own
**Fix direction** already says which of the two moves is right *"depends on the version this ships
in, which is not decided yet — so this is a release-time task"*, and that reasoning survives intact.
What it changes is the justification: the gap is not "nobody has it yet", it is "the version string
does not distinguish who has it", which is a stronger argument for the release-time check and a
different one from the one recorded.

**A second thing the same check surfaces.** `CLAUDE.md`'s manifest row says **Bump version on every
change**, and twelve commits since `e14b6ca` carry no bump. That is what makes the two populations
share a version string. It is not this record's fix, but it is its cause.

Verified at HEAD `83488e9` by `git rev-list -n1 v10.2.0`, `git merge-base --is-ancestor`,
`grep -n FUSION_REF install.sh`, `sed -n 14p README.md`, and
`grep -m1 version .claude-plugin/plugin.json`.

**Fix direction.** Amend the reasoning where it is recorded — the session history's Turn-2 section
and, if it is amended anywhere, `260819-0041`'s own body — to rest on the version string rather than
on the tag. The release-time obligation the open record carries is unchanged.

Found in the coderev pass over `5ec26b2..83488e9`, session `260818-2301`, Turn 2. No Circle active,
so it is filed in the shared store under the Origin Rule.
