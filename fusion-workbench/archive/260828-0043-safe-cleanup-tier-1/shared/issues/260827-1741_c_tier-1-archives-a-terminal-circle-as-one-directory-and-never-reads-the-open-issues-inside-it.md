Tier-1 archives a terminal Circle as one directory and never reads the open issues inside it

---
`skills/archive/SKILL.md` Tier 1 selects a Circle by the marker on its record alone (`_c_`,
`_b_`, `_s_`) and moves the directory whole. The safety filter that protects open work (filter 2,
`_o_`/`_p_` defects and plans) is applied to the shared stores, not to the stores inside the
Circle being moved. A closed Circle carrying open issues is therefore archived with them, and
every consumer that scans `shared/issues` and `circles/*/issues` and never `archive/` loses those
issues without a word. The cleanup pipeline runs Tier 1 autonomously (`skills/cleanup/SKILL.md`
Step 4), so nobody is asked.

---
**Filed by:** consultant, Kai Stalmann <ks@qantr.com>

**Severity:** High. A gate that counts open records can be emptied by a housekeeping step that
asks nothing.

**Cross-references:** `skills/archive/SKILL.md` `## Safety filters` (filter 2), `## Tier definitions`
(Tier 1, first row); `skills/cleanup/SKILL.md` `## Step 4 — Archive with safe defaults`.

## Evidence

Reported by the user from a consuming project, 2026-08-27. That project has a gate
(`validate-defect-class-anchor`) that scans `shared/issues` and `circles/*/issues` and never
`archive/`, and a class of issues (`user-visible`) that its `CLAUDE.md` requires to reach zero.
Eight terminal Circles were candidates for archiving. Counted by the user's own survey:

- 4 Circles with 0 open issues
- 3 Circles with 11 open issues between them, none user-visible
- 1 Circle (`one-flow-mandate-to-process-control`) with 111 open issues, 32 of them user-visible

Tier 1 as written selects all eight. Archiving the last one removes a third of the project's
zero-mandated class from the only gate that counts it. The cleanup pipeline could not resolve
this by itself; the user had to survey the Circles by hand and choose.

The `_c_`/`_i_`/`_s_` shared records in the same run (43) carry no open work by definition and
are unaffected; the defect is confined to the Circle row of Tier 1.

## What the skill knows and does not use

Every marker the decision needs is in the filename, under the Circle directory it is about to
move: `circles/<dir>/issues/*_o_*.md`, `*_p_*.md`, `circles/<dir>/planning/*_o_*.md`,
`*_p_*.md`, `circles/<dir>/decisions/*_o_*.md`, `*_a_*.md`. The same glob the filter already
applies to the shared stores answers the question for a Circle. Nothing has to be read.

## Proposed line

A terminal Circle is archivable when it carries no open record: no `_o_`/`_p_` issue or plan and
no `_o_`/`_a_` decision under its own directory. A Circle that fails this is excluded from every
tier mode, named in the survey with its open count, and left where it is until the records close
or move. Natural-language mode may still override at the `refine` step, as it does for the other
filters.

That line needs no policy decision: it is filter 2 applied to the directory being moved instead
of only to the shared stores.

## Acceptance

1. A tier-1 survey over a workbench holding a `_c_` Circle with one `_o_` issue inside it lists
   that Circle as excluded with the count, and the move leaves the directory in place.
2. The same survey over a `_c_` Circle with only `_c_`/`_i_`/`_s_` records inside selects it as
   before.
3. `skills/cleanup/SKILL.md` Step 4 reports the excluded Circles and their counts in its
   summary, so an unattended run says what it left behind.

Resolved: 260827-2022-coder-session.md, coder, Kai Stalmann <ks@qantr.com>. Plan step 20, the proposed line as written: filter 2 gains the terminal-Circle-with-open-records bullet (`skills/archive/SKILL.md:116`), Step 3 counts them with `open_in` (`skills/archive/SKILL.md:186`; store names derived from the shared stores' basenames, `-maxdepth 1` so a stash inside the Circle is not counted), the Tier 1 row requires the count to be 0, Step 5 names each excluded Circle with its count, natural-language mode flags `[ACTIVE]` for `refine`; `skills/cleanup/SKILL.md:177` makes Step 4's summary name the excluded Circles and counts. Acceptance 1 and 2 checked against a scratch workbench (a `_c_` Circle with one `_o_` issue and one `_a_` decision counts 2 and is excluded; one with only `_c_`/`_i_` records counts 0); in this repository 6 of 19 terminal Circles carry open records (1 to 10 each) and are now excluded. Acceptance 3 is a prose mandate on the cleanup body; no unattended run was performed.
