README's Setup paragraph still says Setup seeds the retired `fusion-guard.json`

---

`README.md:67` describes what `/fusion:setup` creates and includes:

> seeds `fusion-guard.json` at the **project root** (the per-project guard configuration —
> git-tracked, so commit it)

Both halves are false at HEAD. Setup seeds `fusion.json`, from `templates/fusion.json`, and does
nothing at all about a leftover `fusion-guard.json` (`skills/setup/SKILL.md:185`, `:190`;
`ls templates/` returns `fusion.json` alone). And there is no per-project *guard* configuration to
seed, because the guard has no settings — the one live leaf is `orchestrator.maxTurns`
(`README.md:104`, which states the current shape correctly).

The two statements sit 37 lines apart in one file and contradict each other. A reader who follows
the Install section top-to-bottom meets the retired filename first, as the thing to commit, and
meets the correct one only in the configuration section further down. `README.md:111` then tells
that same reader the file is retired and to delete it.

**Why no step caught it.** Step 11 corrected the shipped text that presents a blocking, halting
guard as a live property; this line presents neither — it presents a *file* that no longer exists,
which is a different property. Step 12 edited `README.md` `## Install` to add the v10 upgrade
pointer at `:28` and did not reach `:67`. Step 14 opened the file for the pin example at `:26`.
`reference-resolution-lint` cannot see it: `fusion-guard.json` written without a directory is not a
path, which is the same limit issue `260816-2321` records in two other places.

**Severity:** Medium, and higher than the comment-level staleness filed under `260816-2321`.
`README.md` is the first surface a new user reads, this line is inside the instruction block that
tells them what to commit, and following it means committing a file fusion does not read while the
file that carries their Turn budget goes unmentioned at the point of setup.

**Fix:** one clause. Name `fusion.json`, and say it is the project's own settings file rather than
a guard configuration. `README.md:104` already carries the wording to reuse.

**Scope:** `README.md` only. `skills/setup/SKILL.md` and `templates/` are already correct.

**Cross-references:**
- `README.md:67`, `:104`, `:111`
- `skills/setup/SKILL.md:171`, `:178`, `:185`, `:190`
- `circles/260816-1741-guard-becomes-observation-only/issues/260816-2321_c_step-11s-line-scoped-changes-text-misses-two-stale-lines-in-files-it-already-opens.md`
  (the same lint limit, in two other places)
