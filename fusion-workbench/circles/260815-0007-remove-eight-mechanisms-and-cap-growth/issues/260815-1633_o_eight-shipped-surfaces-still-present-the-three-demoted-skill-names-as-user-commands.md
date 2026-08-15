Eight shipped surfaces still present the three demoted skill names as user commands

---

P-12's central finding is that the collapse is presentational: `archive`, `log-activity` and `curate`
keep their directories and stay typeable, so the collapse is "what fusion presents and documents".
The step updated four documents. Eight further shipped surfaces still present those three names as
the user's route, one of them in direct contradiction to what P-12 wrote.

---

## Context

Updated by P-12: `CLAUDE.md:21`, `CLAUDE.md:51`, `README-agents.md:229-246`, `README.md:95`,
`skills/help/SKILL.md:76-79`, and the three skill descriptions.

Not updated, and still presenting a demoted name as the surface:

| Where | What it says |
|---|---|
| `agents/orchestrator.md:1289` | "the ordinary surface for it is `/fusion:curate`" |
| `agents/curator.md:3` (description) | "or via /fusion:curate" |
| `agents/curator.md:57` | "`/fusion:archive` owns that" |
| `agents/curator.md:344` | table row — "Mechanical workbench shrinking by marker and date \| `/fusion:archive`" |
| `agents/playmaker.md:61` | "`archive/` (`/fusion:archive` target)" |
| `skills/cadence/SKILL.md:255` | "Run `/fusion:log-activity` first if you want the activity log fresh" |
| `rules/fusion-workbench-conventions.md:47,79` | "`/fusion:archive` target"; "What preserves that record is `/fusion:archive`" |
| `docs/philosophy.md:15` | "`/fusion:log-activity` scans commits and the workbench into a per-day activity log" |
| `README.md:150` | "run `/fusion:log-activity` first when you want the underlying record fresh" |

**None of these is false** — that is exactly P-12's point, and it is why no lint catches them: every
token resolves to a directory, so `derivable-enumerations-lint` and `reference-resolution-lint` are
both satisfied. The defect is that the presentation P-12 chose reached four documents and not the
rest of the corpus, so a user meets "three commands" in `CLAUDE.md` and `/fusion:log-activity` as a
plain instruction in `README.md` 55 lines further down.

**`agents/orchestrator.md:1289` is the one that is more than presentational**, because it contradicts
a document P-12 did edit. It says the ordinary surface for the curator is `/fusion:curate`;
`README-agents.md:246` now says the surface is `/fusion:cleanup --only claude-md` and `curate` is
"Cleanup Step 5". Both are shipped, both are read by the orchestrator, and they disagree about what
to tell a user.

`agents/orchestrator.md` was in the file lists for steps 10 and 11 and not for step 12, which is how
it was missed.

## Suggested direction

Decide once how a demoted name is written in prose — probably "the `CLAUDE.md` step
(`/fusion:cleanup --only claude-md`)" — and apply it. `agents/orchestrator.md:1289` is worth doing
first and separately; the rest are a sweep and could reasonably ride with the curator's pass, since
`rules/fusion-workbench-conventions.md` is one of that agent's three surfaces.

---

**Reconciliation 260815-1913 (reconciler, HEAD `9306f0a`) — seven of the nine rows stand, two are
discharged, and two line numbers have drifted.**

Every row was re-grepped rather than re-read from the table.

| Row | At HEAD |
|---|---|
| `agents/orchestrator.md:1289` | **stands**, now at `:1292` |
| `agents/curator.md:3` (description) | **stands** |
| `agents/curator.md:57` | **stands** |
| `agents/curator.md:344` | **stands** |
| `agents/playmaker.md:61` | **stands** |
| `skills/cadence/SKILL.md:255` | **stands**, and `:126` is a tenth instance the table did not list |
| `rules/fusion-workbench-conventions.md:47,79` | **discharged** by `e8052e7`, the curator's approved pass at gate G1 — `grep -n '/fusion:archive' rules/*.md` returns nothing, and `:81` now reads "the archive step of `/fusion:cleanup`" |
| `docs/philosophy.md:15` | **stands** |
| `README.md:150` | **stands**, now at `:152` |

The two discharged rows are the ones the record itself predicted would be reached: it noted that
`rules/fusion-workbench-conventions.md` is one of the curator's three surfaces and that the sweep
"could reasonably ride with the curator's pass". It did, for that file and no other.

**`agents/orchestrator.md:1292` is untouched and is still the row that is more than presentational.**
It says the ordinary surface for the curator is `/fusion:curate`; `README-agents.md:246` says the
surface is `/fusion:cleanup --only claude-md` and that `curate` is Cleanup Step 5. Both ship, both
are read by the orchestrator, and they disagree about what to tell a user. The record's own
sequencing — do that one first and separately — is unperformed.
