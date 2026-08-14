# Orchestrator Session — 260814-2225 — release v8.2.0

**Directive:** Release a new version of the fusion plugin.
**Mode:** custom (the release procedure in `CLAUDE.md` `## Release process`)
**Status:** Complete

## What was released, and why the number was not bumped

`.claude-plugin/plugin.json` already read `8.2.0`. It was bumped in `6ba9d77`, the first commit of the
curator Circle, and the 25 commits that followed are that Circle's work. The number had never been
tagged and never reached the marketplace, so 8.2.0 existed only in the tree while the published
release stood at 8.1.0.

The user was asked which number to release and chose to tag 8.2.0 rather than invent a successor,
on the reading that the version stood for this work from the start and the work is now finished.
The one wart was named at the gate and accepted: the user's own `~/.fusion` already called itself
8.2.0, having been updated from `heads/main` mid-development at Turn 3 to make the curator
dispatchable, so two different trees briefly carried that name on one machine. A `fusion --update`
resolves it.

## Step 0 — validation, before anything was changed

| Check | Result |
|---|---|
| `claude plugin validate .` | passed with one warning, that `CLAUDE.md` at the plugin root is not loaded as project context. Expected: `install.sh` never copies it. |
| Smoke dispatch of the default agent | `claude --plugin-dir . --agent fusion:orchestrator -p …` returned `SMOKE-OK` |
| Compiled hooks | 9 files in `hooks/dist/`, clean in git, all newer than every non-test source |
| Guard changed since the bump? | no. `git diff --name-only 6ba9d77~1..HEAD -- hooks/guard.ts hooks/tracker.ts hooks/lib/` outside tests is empty, so the cross-project guard verification step did not apply |

## The four version surfaces

`CLAUDE.md` names four that must stay coherent. Two are examples of the *current* release and drift
silently; the release process gained `README.md` as the fourth only after it had drifted for months.

| Surface | Action |
|---|---|
| `.claude-plugin/plugin.json` | already `8.2.0`, untouched |
| `install.sh:27` pin example | `tags/v8.1.0` → `tags/v8.2.0` |
| `README.md:26` pin example | same substitution |
| marketplace entry | `8.1.0` → `8.2.0`, plus a false agent count |

A sweep over every tracked file outside the workbench found no fifth surface. Four other occurrences
of `v8.1.0` survive deliberately: `CLAUDE.md:33` and `:56` date when a signature and a store changed,
and `install.sh:25-26` uses the placeholder form `v<version>`. The dispatch that ordered the sweep
named three occurrences; there were four, which is the reason the sweep was ordered rather than
trusted to a grep.

## The marketplace description was wrong about the product, not just the version

It advertised "16 project-agnostic specialized agents". fusion ships 17. The count was established
independently rather than taken from the dispatch: `ls -1 agents/*.md` gives 17, and
`git ls-tree --name-only v8.1.0 agents/` gives 16, which shows the old number was correct for its own
release rather than a long-standing error, with `6ba9d77` adding the seventeenth. The rest of that
sentence was checked against `README-agents.md` `## Dispatch parameters` and holds: three agents are
domain-parameterised, `planner` is not one of them, and `shaper` merely copies the line. One clause
was added naming the curator, next to decision-record tracking, because that is the surface it
reconciles.

## Verification of the published artifact

The release was verified against what GitHub actually serves, not against the local tree:

- `tags/v8.2.0` tarball returns HTTP 200
- its `plugin.json` reads `8.2.0`
- 17 agent prompts, including `agents/curator.md`
- `skills/curate/SKILL.md` present
- 9 compiled hooks, so the tarball is runnable with no `npm` and no `node_modules`
- `install.sh` present at 7313 bytes with mode `-rwxr-xr-x`, and its own pin example points at its own
  tag

## One incident, unresolved

`install.sh` vanished from the working tree mid-task, after the edit and after a passing test run,
and was restored. A git operation and the test suite were both ruled out by measurement. Three older
Claude sessions were alive against this project at the time, which is the concurrency condition
`CLAUDE.md` already carries as an advisory, but nothing ties the deletion to them.

The restored file was verified before it was committed rather than accepted on report: the diff
against HEAD was exactly the one intended line, `git ls-files -s` showed mode `100755`, and
`bash -n` parsed clean. The committed blob and the published tarball both carry the executable bit,
which is the property the tarball install depends on.

Filed as `shared/issues/260814-2258_o_a-tracked-install-sh-vanished-from-the-working-tree-mid-task-with-no-cause-established.md`,
against the executing agent's own judgement that the record was too thin to be worth filing. The
reasoning for overriding that is in the record: alone it is worthless, as a prior for a second
occurrence it is cheap, and the two measurements already ruled out are the work a later
investigation would otherwise repeat.

## Test suite

The release gate is a green suite, and this suite is known to fail non-deterministically on repeated
full runs including on clean HEAD (`shared/issues/260814-2118_o_*`). The honest count for this
release: the executing agent needed three runs, of which one was unusable because its exit code was
captured with a bash idiom in a zsh shell, and one genuinely failed on six dangling references to the
then-missing `install.sh`. The orchestrator then ran the suite itself after the restoration, once, to
a clean `exit 0` with 49 files and 1030 tests.

## Commits

| Repo | Hash | Message |
|---|---|---|
| fusion | `cb30037` | chore(release): the two pin examples name the release that is about to exist |
| fusion | tag `v8.2.0` | annotated, on `cb30037` |
| marketplace | `259d58d` | chore: fusion 8.2.0 |

16 commits were pushed to `origin/main` in total, `ae21c87..cb30037`, the other 15 being the curator
Circle's work and its closure.

## What the user has to do

The marketplace cache clone at `~/.claude/plugins/marketplaces/tenzoki-plugins` does not exist on this
machine, so `/plugin install fusion@tenzoki-plugins` cannot see this release locally. That is the
documented case, not a fault of the release. The install-script path is unaffected because it reads
the GitHub tarball directly, so `fusion --update` picks up 8.2.0, and a session restart is needed
afterwards because the hooks and the agent roster are pinned from the installed copy at session start.
