
**Older than that:** this section carries the last three install-from paragraphs and no more, because it is a per-release list on a surface with a fixed byte ceiling. For an older install, run `ls $FUSION_SRC/docs/` and read every `upgrading-to` note above the user's own version, in version order; not every release has one, and no filename is derivable from a version string. One of them still carries an action that fails silently when it is skipped: v9 retired the `strategic` and `knowledge` domain values, and a record still carrying one runs as `code` without saying so.

**One caveat for the marketplace path:** the local *marketplace clone* at `~/.claude/plugins/marketplaces/<name>/` is the catalogue `/plugin install` reads; the plugin itself comes from `tenzoki/fusion`'s default branch into `~/.claude/plugins/cache/`. If a version bump hasn't reached the clone, run `git -C ~/.claude/plugins/marketplaces/tenzoki-plugins pull origin main` first. (The HTTPS installer has none of this friction — prefer it.)

For the maintainer-side release flow, read `$FUSION_SRC/README-agents.md` `## Releasing`.

### 5. Configure — *customizing fusion for a project*

Two things to configure:

- **Project settings:** `$FUSION_SRC/templates/fusion.json` is the seeded file and documents each key; `$FUSION_SRC/README-hooks.md` is the full account. It sets `citations.extraPaths`, a project's citation-bearing non-Markdown paths, and nothing else — `orchestrator.maxTurns` and `orchestrator.dispatchMinutes` are retired leaves that earn an advisory. Not the guard either: the hooks block nothing and have no settings. A project root still carrying the retired `fusion-guard.json` is told so on every guarded call until deleted; copy nothing across, since everything it could set is retired too.
