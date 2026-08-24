Two installed copies report the same version and differ in which bin/ helpers they carry

---

**Severity:** Medium
**Domain:** code
**Filed by:** analyst, running the measurement commissioned by `circles/260821-1042-reply-bounded-whole-question-answered/analyses/260822-0010-measurement-briefing-does-the-rule-change-shorten-a-reply.md`
**Affects:** `.claude-plugin/plugin.json`, `bin/fusion-prose-metric`, the release process in `CLAUDE.md` `## Release process`
**Cross-references:** `circles/260821-1042-reply-bounded-whole-question-answered/analyses/260822-0035-three-before-figures-and-the-after-measurement-defined.md` section 3, which hit this and worked around it; `circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0144_*_the-authoritative-prose-metric-has-no-test-and-the-hook-test-surface-has-43-of-2500-lines-left.md`, a different gap in the same program

---

## What is wrong

`bin/fusion-prose-metric` is not present in the installed plugin copy an agent's
`$FUSION_PLUGIN_ROOT` resolves to, while both the installed copy and the work tree report
version `10.4.0`. **The version string therefore cannot distinguish an installation that
carries the program from one that does not.**

Four facts, each checked:

1. `ls "$FUSION_PLUGIN_ROOT/bin/"` lists twelve helpers and `fusion-prose-metric` is not
   among them. The work tree's `bin/` lists thirteen and it is.
2. `grep '"version"' .claude-plugin/plugin.json` returns `10.4.0`, and the same grep against
   the installed copy's manifest returns `10.4.0`.
3. `git merge-base --is-ancestor fac97f4 v10.4.0` exits non-zero. The commit that added the
   program is not in the tag. `git log --oneline v10.4.0..HEAD | wc -l` returns 48, two of
   which touch `bin/`.
4. The installer is not the cause. `install.sh:82` copies `bin` wholesale, so a fresh
   install from the default `heads/main` ref picks the program up. A user pinned to
   `FUSION_REF=tags/v10.4.0`, or installing from the marketplace at 10.4.0, does not.

## Why it matters beyond one helper

Two consequences, and the second is the one that outlives this program.

**A record that names a helper cannot say which installations can run it.** The
measurement protocol at
`circles/260820-2051-style-rules-arrive-and-get-measured/analyses/260820-2354-prose-register-measurement-protocol.md`
makes `bin/fusion-prose-metric` binding: "It is the authoritative count. No hand count and
no `grep` line substitutes for it, in either window." A session running from an installed
copy at 10.4.0 cannot obey that sentence and has nothing to check against, because the
version it reports is the version the record was written under.

**The condition is general, not specific to this program.** Any helper added between
releases is in the same state, and `CLAUDE.md` `## Layout` states the rule the tree is
currently breaking: "Manifest. **Bump version on every change.**" Forty-eight commits stand
against one unchanged version string.

Note what this is *not*. No shipped surface promises the program:
`grep -rln 'fusion-prose-metric' rules/ agents/ skills/ docs/ README*.md` returns nothing,
and the only mentions outside `bin/` are `CLAUDE.md`, which the installer never copies, and
a comment in `hooks/lib/__tests__/reference-resolution-lint.test.ts`. So no user-facing
promise is broken. What is broken is fusion's own ability to say what a given installation
can do.

## What to do

Three routes, and they are not exclusive.

1. **Bump `.claude-plugin/plugin.json` on the commit that adds a `bin/` helper**, as
   `CLAUDE.md` already requires, so the version moves when the executable surface moves.
   Cheapest, and it relies on a rule that has been stated and not followed for 48 commits.
2. **Make the version bump a release-time step over the whole range**, which is what the
   tree actually does, and stop claiming per-commit bumps in `CLAUDE.md`. This trades the
   rule for the practice rather than the practice for the rule, and leaves the gap open
   between releases.
3. **Have a helper that is cited as authoritative announce its own absence.** A record that
   names a `bin/` program could carry the version it first shipped in, so a reader on an
   older copy learns why the command is not there. This is documentation, not a mechanism,
   and it does not fix routes 1 or 2.

**Verified at HEAD `084c626`** by the four commands in the list above.

---
Also seen: 260822-0026 by orchestrator — reached the same root nine minutes earlier from the
briefing's own aside, and filed as
`shared/issues/260822-0026_*_forty-eight-commits-stand-behind-the-manifest-version-so-two-bin-helpers-are-unreleased-and-one-is-absent-from-every-install.md`.
That record is now closed in favour of this one, which checks each fact separately and clears
the installer. Nothing from it is lost; its remedy was the same, to cut a release under
`CLAUDE.md` `## Release process` and check that step's four version surfaces together with the
fifth thing it names as the one that slips, the two `description` fields that describe one
product out of two repositories.

---
**Carried in from the folded record, 260822: the version gap has a second half, and it is the
heavier one.** `bin/fusion-rules` changed by 22 lines in the same unreleased range, and unlike the
prose metric it is called at every agent's Setup in every project that uses fusion. The installed
copy is therefore missing that file's stderr fallback notice, which announces when a voice profile
resolves to the `-en` variant because the requested language's file is absent. Verified by `diff`
between the installed copy and the work tree.

This paragraph exists because folding two records into one dropped it. The closed record
`shared/issues/260822-0026_*_forty-eight-commits-stand-behind-the-manifest-version-so-two-bin-helpers-are-unreleased-and-one-is-absent-from-every-install.md`
carried it, this record did not, and the closure note asserted that nothing was lost. Found by
`circles/260821-1042-reply-bounded-whole-question-answered/reviews/260822-0116-coderev-the-measurement-report-reproduces-and-its-after-run-does-not.md`.

**Consequence for the remedy: it does not change.** One release closes both halves. What changes is
the case for cutting one, because a helper nothing calls is a weaker argument than a helper every
Setup runs.

---
Resolved: fixed — v10.6.0 shipped both helpers the record measured as unreleased, and the class is the bump rule stated in `CLAUDE.md` `## Release process`; `git ls-tree v10.6.0 bin/ --name-only | grep -c fusion-prose-metric` at HEAD 260824 prints `1`.
