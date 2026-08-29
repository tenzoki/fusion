# A1 — independent assessment of C5b

**Agent:** analyst
**Circle:** `260801-1244-guard-rules-write` — task A1, dispatched by the orchestrator
**Date:** 260804, 15:35–16:10
**Status:** Complete
**Outcome:** C5b meets five of its six spec criteria; the sixth is outstanding with Step 9. Three High, two Medium and three Low defects filed, none of them previously known. Recommendation: do not run plan Step 10 yet.

---

## What was assessed

Commits `46d8333` (the loader), `557340d` (template plus root copy) and `7f3d789` (setup
seeding), against `260801-1122_*_spec-normative-consolidation.md` `### C5`
and `260802-1856_*_plan-guard-rules-write.md` Steps 6, 7 and 8.

Report: `260804-1600-c5b-independent-assessment.md`.

## Method

The three session histories were read as claims and then checked. Everything below ran
through the shipped integration harness (`hooks/lib/__tests__/helpers/guard-harness.ts`),
which spawns the real guard as a fresh subprocess against a throwaway project root that is
not a plugin root — the only instrument that answers a criterion about a consuming project,
since the write guard stands down in this repository.

- `npx vitest run` in `hooks/`: **1344 passed, 25 files, exit 0.** Matches what Steps 6 and 7
  report. `npm test` was deliberately not run: it builds first and would rewrite the
  `hooks/dist/` that plan Step 10 owns.
- Sixty-two guard invocations across four probe scripts, covering the merge, the floor, the
  diagnostics path, the plugin-repo stand-down, a subdirectory working directory, and nine
  wrong-typed configuration values.
- The `/fusion:setup` Step 0f block run three times against a scratch directory under
  `/private/tmp`, plus the same block run through the guard verbatim in both the
  file-absent and file-present states.

The earlier `coderev` reviews in this Circle were deliberately not read before the findings
were formed, per the dispatch. Afterwards I checked the Circle's open and closed issues and
none of the eight findings appears there.

## What held up

Every checkable claim in the three histories. Specifically verified rather than accepted:
the suite counts; that the template's six underscore keys are inert and produce
`diagnostics: []`; that the root copy is byte-identical (sha256
`e5b66ef7dcd9db4af5fed0e7717d8ebd260a17e4a53197f621583e43777dc21c`); that `install.sh:80`
ships `templates` and not the root copy; that both files are trackable and tracked; that the
Step 8 shape change was necessary (the one-command form is denied by the guard once the file
exists, measured); and that the seeding block is idempotent across runs.

## What did not

Three High findings, all measured, none adversarial:

1. A partial `guard` object empties `protectedPaths`, because `DEFAULTS.guard.protectedPaths`
   is the empty list. `{"guard":{"enabled":true}}` removes all nine protected patterns and
   emits `guard_allow`.
2. `guard.enabled: false` from the project layer short-circuits above the Bash dispatch, so
   it disables the git branch policy and an active halt, and emits no event at all.
3. The project layer is cast, not validated. Four wrong-typed `protectedPaths` values were
   tried; three crash the guard into its fail-open branch on every call, one degrades
   silently to a list of single characters.

Plus a Medium on the floor being matched cwd-relative while the file is read root-relative, a
Medium on two false sentences in the seeded template, and three Lows.

The prior instance of finding 3 is `260802-2334_*_`, closed in this Circle, for
`escalation.json`. The lesson was not carried to the new file.

## Repository state

**Nothing in the repository was modified.** Every project root used for measurement was a
`mkdtemp` directory the harness creates and removes; the probe scripts and the seeding
scratch directory live under the session scratchpad. `git status` shows only the workbench's
own session files plus the four untracked `hooks/dist/` artifacts that were already present
when this session started (`fs-locator.{js,d.ts}`, `rules-write-exemption.{js,d.ts}` —
leftovers from an earlier build, inert because the committed `dist/guard.js` does not import
them, and Step 10's rebuild will replace them).

## Filed

Eight issues, `260804-1601_*_` through `260804-1608_*_plan-step-7-is-unmarked-and-the-plan-header-contradicts-its-own-step-markers.md`. No decision record filed:
each of the three High findings names its options inside its own issue, and filing three
decisions for one theme would fragment a conversation the user should have once.
