The v8.1.0 documentation step reached three files and the feature reached seven surfaces

---
The backlog store, `/fusion:direct`, the playmaker's backlog job and the Circle-first placement
rule were documented in `CLAUDE.md`, `README.md` and `README-agents.md`. The same release left
`docs/working-model.md`, `docs/philosophy.md` and `skills/help/SKILL.md` describing a system with
no backlog store, no `/fusion:direct`, and a shaper that produces a spec rather than a Circle.
`README-agents.md` carries four independent defects of its own, and `CLAUDE.md`'s Layout table
names ten of the fifteen `bin/` helpers.

---

## What is confirmed

Measured in this session, in the repository at `1c2d555` (v8.1.0):

| Surface | Finding | Evidence |
|---|---|---|
| `README-hooks.md` | **not defective.** See the withdrawn claim below. | `README-hooks.md:14,238,268,272` |
| `docs/philosophy.md` | same, 0 for both | as above |
| `docs/working-model.md` | same, 0 for both | as above |
| `skills/help/SKILL.md` | same, 0 for both — the in-session documentation surface does not know v8.1.0 exists | as above |
| `CLAUDE.md` Layout table | 5 of the 15 `bin/` helpers are absent from it: `fusion-commit-lock`, `fusion-count-sources`, `fusion-review-coverage`, `fusion-staging-drift`, `fusion-state-drift` | loop over `ls bin/` against `grep "bin/<name>" CLAUDE.md` |

## Withdrawn claim — `README-hooks.md` does not describe the removed guard

The first version of this record, filed at 08:25 in this session, claimed that `README-hooks.md`
still documents the protected-path mechanism and the git branch-switch policy as live, and made
that the worst finding of the set. **The claim is false and is withdrawn.**

It was produced by running `grep -c` for the mechanism's vocabulary and reporting the count of 13
as evidence of stale prose, without reading the matched lines. Reading them shows every one is
past tense or explicitly labelled as removed history:

- `README-hooks.md:14` — "A third layer sat between those two **until 2026-08-12**"
- `README-hooks.md:238` — "**There used to be a third** — a write-tool call on a protected path"
- `README-hooks.md:268` — "**One key is retired**, and saying so is louder than dropping it"
- `README-hooks.md:272` — the section heading "**The protected-path half, and why it was removed**"

`README-hooks.md` was last touched *after* the removal commits. It is one of the surfaces that was
brought current, not one that lagged. Acting on the original first acceptance criterion would have
rewritten correct prose into something worse.

The withdrawal is recorded rather than edited away because the mistake has a shape worth keeping:
a grep count was treated as a read. That is the same failure a measuring help skill is most
exposed to, which is why the analysis at
`shared/analyses/260813-0831-the-seam-between-a-measured-answer-and-a-cited-one.md` cites this
record as a worked example.

## What is confirmed clean

Stated so the fix does not re-do work that is already right. The four version surfaces that
`CLAUDE.md` `## Release process` requires to agree all say 8.1.0:

- `.claude-plugin/plugin.json` — `"version": "8.1.0"`
- `install.sh:27` — `FUSION_REF=tags/v8.1.0`
- `README.md:26` — `FUSION_REF=tags/v8.1.0`
- the marketplace entry was not checked from here; it lives in a second repository

The agent and skill counts are also right: 16 agents in `agents/*.md` and 16 skill directories
under `skills/`, matching what `CLAUDE.md` states.

## The survey

`shared/analyses/260813-0828-documentation-staleness-survey.md` is the systematic pass and
**supersedes the table above wherever the two differ.** It carries 15 findings across four work
groups, ordered so the five mechanical one-line edits are separable from the four prose rewrites.
Its headline results:

- Three of the six investigated leads came back **clean**: all four version surfaces read 8.1.0,
  the v8.0.0 removal is documented accurately everywhere, and the citation lint passes over every
  surface in scope.
- `README-agents.md` is the worst surface, with four independent defects: the shaper row
  (`README-agents.md:25`) says it writes specs to `planning/` when since v8.1.0 its first write is
  a Circle directory; the planner row omits the new `**Circle:**` parameter; the pipeline diagram
  hardcodes `max 5 Turns` (`README-agents.md:110`) two days after the budget became
  project-settable; and `README-agents.md:268` cites `fusion-workbench/history/`, a directory the
  v4.0.0 layout deleted.
- Nine of the fifteen findings are one omission: `git show --stat 0978e9a` touched three files
  where the feature reached seven surfaces.
- `bin/fusion-count-sources` is documented in **no** markdown file in the repository.
- `CLAUDE.md:51` claims 612 tracked workbench files against a measured 1023.

A second analysis, `shared/analyses/260813-0831-the-seam-between-a-measured-answer-and-a-cited-one.md`,
found one further defect on the same table while checking something else: `README-agents.md:29`
describes `coderev` as reviewing "Go / TS / Python code" where `agents/coderev.md:3` says
"application code, prompts, build/packaging, and tooling". A wrong answer rather than a missing
one, on the table `/fusion:help` calls the full agent reference.

**Coverage gaps the surveyor named.** `docs/plane-setup.md` (466 lines) was checked by grep only,
and twelve of the sixteen agent prompts were never opened, so most of `README-agents.md`'s table
rows are unverified. The Circle inherits that gap.

## Acceptance

- The backlog store, `/fusion:direct`, the playmaker's backlog job and the Circle-first placement
  rule appear in every surface where a reader would look for them: `README.md`,
  `README-agents.md`, `docs/working-model.md`, and `skills/help/SKILL.md`.
- Every defect in the survey's findings table is either fixed or explicitly declined with a reason.
- `README-agents.md`'s four defects are fixed, and its remaining twelve unverified table rows are
  checked against their agent prompts.
- The four version surfaces still agree, and the check is written down somewhere a release runs
  past.
- The `bin/` roster and the tracked-file count move into `derivable-enumerations-lint.test.ts`
  rather than being corrected as prose lines. That gate already derives four such enumerations;
  a corrected line goes stale again at the next helper.

## Note on the fix's shape

The survey splits the work into four groups so that Group A, five one-line edits, is separable from
Group D, four prose rewrites. Ordering the mechanical half first gives a reviewable commit before
anyone argues about wording.

**Do not re-verify what the existing gates already cover.** The citation lint and the agent/skill
inventory lints run mechanically; the Circle's job is the surfaces outside them.

---

## Update 260813-1500 — four of these passages changed class, from lagging to wrong

Commit `b995049` landed the playmaker's backlog maintenance capability
(`circles/260813-0858-playmaker-maintains-backlog-store/`). That Circle's four documentation
passages were deferred by `circles/260813-0910-documentation-matches-shipped-plugin/` explicitly
**until this Circle lands**. It has landed, so they are unblocked — and measured against HEAD they
are no longer merely behind. Two of them now contradict shipped behaviour outright:

| Surface | What it says | What is true at `b995049` |
|---|---|---|
| `README-agents.md:40`, description | the playmaker "names duplicates" in the backlog | it **merges** them into one consolidated entry, under a confirmation held in the run |
| `README-agents.md:40`, **Writes** column | `circles/<stamp>-<slug>/_a_circle.md`, `portfolio.md`, `history/` | the backlog store is missing. `bin/fusion-paths playmaker` emits `OUT_BACKLOG=shared/backlog`. This is a false statement about an agent's write rights, in the table `/fusion:help` offers as the full agent reference |
| `CLAUDE.md:51` | "the playmaker consolidates and ranks them, no agent files one" | the second clause is still true and still load-bearing. The first understates: consolidating and ranking became maintaining — marker renames `_o_ ↔ _p_` autonomously, plus split, merge, close and defer under confirmation |
| `docs/working-model.md` | nothing — no mention of the backlog store or the playmaker's role in it | unchanged from the v8.1.0 omission this record already carried. Silence, not contradiction |
| `skills/help/SKILL.md:62` | names the playmaker for `/fusion:next`, nothing about the backlog | same: silence, not contradiction |

**The user was asked and chose to leave all four to the documentation Circle** rather than folding
them into the Circle that caused them. Recorded here rather than only in the Circle records,
because a handoff that lives only in a `## Dependencies` section is a handoff nobody greps for.

**One cost is immediate and does not wait for a release.** `CLAUDE.md` is read by every session in
this repository, so line 51 misinforms the next session about what the playmaker may do —
unlike `README-agents.md`, whose damage is bounded by the fact that no version bump, tag or
marketplace update has happened. Step 9 of the backlog Circle's plan (the bump to `8.2.0`) was
deferred at the user's release gate precisely so that these four land first and one release
carries both Circles.

**Do not re-measure these five rows from scratch.** They were read against HEAD at `b995049`,
both sides, per the method constraint this record already carries under `## Withdrawn claim`: a
documentation defect is confirmed by reading both sides, never by a match count.
