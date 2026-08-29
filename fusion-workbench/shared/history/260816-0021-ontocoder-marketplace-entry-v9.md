# Marketplace entry corrected to v9.0.0

**Status:** Complete
**Agent:** ontocoder
**Domain:** data
**Source record:** `260815-1913_*_the-marketplace-entry-advertises-five-removed-mechanisms-and-was-recorded-only-in-a-history-entry.md`
**Repository written:** `/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins` (a different repository from this one)
**Commit:** `2f1b4e8` — "chore: fusion 9.0.0", pushed to `origin main` (`259d58d..2f1b4e8`)

---

## What was wrong

The `tenzoki-plugins` marketplace entry for fusion was last updated at v8.2.0 and had never
been corrected as the v9 removals landed, because no step of the removal plan could write
into another repository. Its `version` read `8.2.0` against `9.0.0` in the plugin's own
`.claude-plugin/plugin.json`, and its `description` advertised five mechanisms the plugin no
longer ships: seventeen agents, the `strategic` and `knowledge` domain values, the
investigator agent with its project-supplied capture-layout rule, churn detection, and the
push-only Plane work-queue mirror. The `keywords` array still carried `churn-detection`.

This is the text a user reads before deciding to install, which is why the record rated it
Medium rather than cosmetic.

## What was done

One file changed: `.claude-plugin/marketplace.json`, the fusion entry only.

1. `git pull --rebase origin main` first, per the release process — the clone was already
   up to date at `259d58d`.
2. `version` set to `9.0.0`.
3. `description` rewritten from ground truth rather than by subtraction. The plugin's own
   `CLAUDE.md` and `README.md` were read for each claim: `ls agents/` returns fifteen files,
   the domain parameter takes `code` or `data` and reaches three agents, and the curator
   (added v8.2.0) is still among the fifteen. The monitor's session-scoped ETA was checked
   separately in `bin/monitor` rather than carried over on trust, because the same class of
   stale claim is what this record is about: `computeETA()` is live and derives from the
   event log, not from the session counters that left `agentstate.yaml` on 2026-08-15.
4. `churn-detection` removed from `keywords` and `decision-records` put in its place. The
   remaining four entries — `fusion`, `orchestration`, `agents`, `compliance-guard` — were
   each checked against the tree and all four still hold.

The new description reads:

> Multi-domain AI agent orchestration framework. 15 project-agnostic specialized agents
> (three of them parameterised by domain: code or data) with a compliance guard,
> decision-record tracking, a curator that reconciles decision records, rule files and
> CLAUDE.md against the project's recorded history, and a real-time browser-based monitor
> with session-scoped ETA estimation. /fusion:help inside Claude Code for self-explainer.

It carries no em-dash, unlike the description it replaces, which spelled one as the JSON
escape `\u2014`. The two neighbouring entries in the file are pure ASCII and now so is this
one; the wording uses a colon and parentheses where the old text used the dash.

## Formatting

The diff is three hunks inside the fusion entry and touches nothing else. The file's stray
blank line between the fusion entry's `keywords` array and its closing brace was left in
place — it is a pre-existing oddity, and removing it would have put an unrelated line in
the diff.

## Verification

- `python3 -c "import json; json.load(...)"` over the edited file — exit 0, and the three
  edited fields were printed back and read against the acceptance criteria.
- `git -C <marketplace> pull --rebase origin main` — exit 0, already up to date.
- `git -C <marketplace> commit` — exit 0, `2f1b4e8`.
- `git -C <marketplace> push origin main` — exit 0, `259d58d..2f1b4e8`.

Both git writes ran under `bin/fusion-commit-lock with ontocoder --`. The lock is
workbench-anchored and therefore locks *this* project's workbench rather than the
marketplace clone, which holds no workbench of its own; it was acquired anyway because the
dispatch required a commit, and it costs nothing.

## What this does not close

The release tag half of the source record was already discharged: `v9.0.0` exists. Nothing
here touched the fusion repository's own four version surfaces — `plugin.json`,
`install.sh`, `README.md` and the tag — which were correct at `9.0.0` before this ran.

The local marketplace **cache clone** at `~/.claude/plugins/marketplaces/tenzoki-plugins`
was not pulled. That is the copy `/plugin install` reads, and until someone pulls it the
new version does not propagate locally even after an uninstall and reinstall. It is step 6
of the release process and belongs to whoever wants the local install refreshed, not to
this fix.

## Files changed in this repository

- `260815-1913_*_the-marketplace-entry-advertises-five-removed-mechanisms-and-was-recorded-only-in-a-history-entry.md`
  — resolution note appended, marker renamed open to closed. Deliberately left uncommitted
  and unstaged; the orchestrator commits it.
- this history entry.
