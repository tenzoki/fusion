The help cap's standing line makes three derivable claims about `docs/`, and none of the three resolves

---

`skills/help/SKILL.md:107`, the line `6781814` wrote to replace three per-release paragraphs, tells a
reader how to find the note for their own version:

> Every release since v9 has its own note under `$FUSION_SRC/docs/`, named `upgrading-to-<version>.md`;
> a project further behind reads them in version order, starting at its own.

Three derivable claims, checked against `git tag -l` and `ls docs/`. None holds.

---

**1. "Every release since v9 has its own note."** Nine tags since and including `v9.0.0`: `v9.0.0`,
`v10.0.0`, `v10.0.1`, `v10.0.2`, `v10.1.0`, `v10.2.0`, `v10.3.0`, `v10.4.0`, `v10.5.0`. Six notes:
`upgrading-to-v9.md`, `-v10.md`, `-v10-2.md`, `-v10-3.md`, `-v10-4.md`, `-v10-5.md`. Three tagged
releases have none. That is fine as a policy — a patch release need not have a note — but the sentence
states it as a rule a reader can navigate by, and a reader at `v10.1.0` who follows it looks for a file
that was never written.

**2. "named `upgrading-to-<version>.md`."** The files use a dash where a version uses a dot:
`upgrading-to-v10-2.md`, not `upgrading-to-v10.2.md`. A reader substituting their own version into the
stated template constructs a filename that does not exist. The removed paragraphs never had this
problem, because each spelled its target path out.

**3. "starting at its own."** A project at `v10.0.x` or `v10.1.0` has no note at its own version, so
the instruction has no referent for exactly the readers most likely to need it. The removed text
handled this case by name: *"**Coming from a v10.0 or v10.1 install:** … Point the user at
`$FUSION_SRC/docs/upgrading-to-v10-2.md`"*. That mapping had no home to move to and none was named.

**Scope, stated plainly.** This is a navigation defect in one sentence, not a lost document — all six
notes are present and `ls docs/` finds them. `README.md:28-38` still carries all six per-release
paragraphs, so the same user coming through the README is unaffected; the divergence between the two
surfaces is already filed as `260822-1503`.

---

**Found by:** coderev, reviewing `c2ad89c..6781814`, review file
`shared/reviews/260822-1506-coderev-the-guard-rationale-repair-and-the-capped-help-topic.md`.
**Owner:** `coder`.
**Severity:** Low.
**Affects:** `skills/help/SKILL.md:107`.
**Filed in the shared store:** no Circle is active.
**Cross-references:**
`shared/issues/260822-1503_o_claude-mds-docs-row-says-fusion-help-points-at-every-upgrade-note-and-the-cap-made-that-false.md`
(the same cap's other consequence, filed by the commit itself); `CLAUDE.md`'s `docs/` row, which makes
the same "one per release since v9" claim and is the curator's surface.

**The fix.** Replace the derivation with an instruction that needs none: tell the reader to run
`ls $FUSION_SRC/docs/upgrading-to-*` and read from the earliest note above their own version onward.
That is shorter than the sentence it replaces, cannot go stale when a release ships without a note, and
does not ask the reader to reconstruct a filename. It also removes the "starting at its own" hole,
because "above their own" is defined for every version.

---
Resolved: All three claims fail, re-checked here before the repair. `git tag -l` gives nine tags
from `v9.0.0` onward and `ls docs/` gives six notes, so `v10.0.1`, `v10.0.2` and `v10.1.0` have
none; the shipped filenames spell the version with a dash (`upgrading-to-v10-2.md`); and a
project at `v10.0.x` or `v10.1.0` has no note "at its own" version to start from.

`skills/help/SKILL.md:107` no longer asks the reader to derive anything. It tells them to run
`ls $FUSION_SRC/docs/` and read every `upgrading-to` note above their own version in version
order, and says outright that not every release has one and that no filename is derivable from a
version string. Nothing in the replacement goes stale when a release ships without a note.

Repaired in the same edit as
`shared/issues/260822-1506_*_the-help-caps-standing-line-names-one-silent-action-and-the-v9-note-holds-a-second.md`,
which is a second defect in the same sentence. The reference-resolution pin did not move: the
`$FUSION_SRC/docs/` token the old line carried is still there, and the first draft of this
repair, which wrote `ls $FUSION_SRC/docs/upgrading-to-*`, was rejected by the citation gate as a
dangling `docs/upgrading-to` because the trailing glob is stripped before the placeholder
exemption is applied.
