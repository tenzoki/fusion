The write guard protects ./rules/** but not .claude/rules/**, though bin/fusion-rules treats both as binding rule sources

---

`hooks/config.json:8-18` lists `rules/**` among the guard's `protectedPaths`. It does not list `.claude/rules/**`.

Path matching is anchored: `globToRegex` in `hooks/lib/paths.ts:9-22` wraps the pattern as `^...$`, and `hooks/guard.ts:94-106` normalises absolute tool paths to cwd-relative before matching. So the relative path `.claude/rules/CODING-HYGIENE.md` does not match the pattern `rules/**`, and a write to it is allowed.

---

Why that is inconsistent:

`bin/fusion-rules:296-298` emits from three roots in one pass:

```
emit_pattern_in_dir "$PLUGIN_RULES_DIR" "$pat"
emit_pattern_in_dir "$PROJECT_RULES_DIR" "$pat"
emit_pattern_in_dir "$PROJECT_CLAUDE_RULES_DIR" "$pat"
```

An agent reads every emitted path (`rules/agent-setup.md:10-14`), with no precedence between roots (`bin/fusion-rules:292-295`). Both directories therefore carry equally binding normative content, and `rules/context-lean-claude-md.md:64-72` explicitly assigns the *heavier* material to `.claude/rules/`: "project-wide bindings every Claude session should respect (the dev-rule bodies, indices, policies)".

The guard's stated intent (`hooks/lib/self-detect.ts:3-9`) is to stop agents modifying the rules they are bound by. That intent holds for both roots; the enforcement covers one.

**Failure scenario:** a consuming project follows the lean-CLAUDE.md convention and moves its architecture and coding-hygiene rule bodies into `.claude/rules/`, as `rules/context-lean-claude-md.md:64-72` instructs. An agent can then rewrite its own binding constraints without the guard firing, while the same agent is blocked from touching a thin capture-layout file in `./rules/`. The protection is inverted relative to the value of the content.

Two candidate resolutions, both one-line: add `.claude/rules/**` to `protectedPaths`, or state deliberately why the two roots are treated differently and document it in `README-hooks.md`. The first appears correct; the second is only right if there is a reason nobody has written down.

Filed by: analyst, from `shared/analyses/260801-1020-normative-surface-drift-gap-analysis.md` (Question 3).
