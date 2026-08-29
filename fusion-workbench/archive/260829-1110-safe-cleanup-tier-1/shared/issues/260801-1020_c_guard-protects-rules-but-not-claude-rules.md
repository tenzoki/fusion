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

Filed by: analyst, from `260801-1020-normative-surface-drift-gap-analysis.md` (Question 3).

---
Resolved (260809-1942, coder — marker left at `_p_`, the dispatch withheld the rename; the
orchestrator closes it after its own validation): the first of the two candidate
resolutions. `.claude/rules/**` now sits next to `rules/**` on the shipped
`guard.protectedPaths` in `hooks/config.json`, and in `hooks/config.example.json` with it.

**The second resolution was searched for and found empty.** Nothing in the plugin sources,
the shipped documents or the workbench records argues that the two rule roots should be
treated differently. What exists says the opposite, twice: the analysis this record was
filed from calls it "a defect surfaced while checking this"
(`260801-1020-normative-surface-drift-gap-analysis.md`, Question 3), and the
answered decision `260801-1020_*_may-any-fusion-writer-touch-rules.md`
records it under Constraints as a defect that "should be fixed independently", noting that
fixing it narrows the appeal of trimming `protectedPaths`. `hooks/lib/rules-write-exemption.ts`
carried `.claude/rules/**` in `RULE_DIR_PATTERNS` from the day the flag shipped, naming this
record as the thing it was waiting for. No candidate reason turned up on the other side —
fusion writes nothing into `.claude/rules/` itself (`/fusion:unlock` writes
`.claude/settings.local.json`, which is not under it), and the enumeration walk descends
`.claude/` without special-casing (`WALK_SKIP` is `.git`, `node_modules`, `.guard-state`).

Verified, not inferred: `.claude/rules/local.md` is denied on the write-tool path and
exempted with `FUSION_ALLOW_RULES_WRITE` set, through the real hooks in a spawned consuming
project (`hooks/lib/__tests__/guard-rules-write-integration.test.ts`, "protects the second
rule root, and exempts it on the same terms" — the case that previously asserted the allow,
written to flip when this record closed). A project declaring `.claude/rules/**` itself
outranks the flag there, as one declaring `rules/**` already did
(`hooks/lib/__tests__/rules-write-exemption.test.ts`). The shipped-list assertion in
`hooks/lib/__tests__/config.test.ts` names the new entry and additionally derives the
invariant this record is an instance of: every pattern the exemption grants must be on the
protected list, or the grant is dead code over an unprotected path. Both stale comments in
`rules-write-exemption.ts` (`RULE_DIR_PATTERNS`, `isProjectRulePath`) now describe the state
that exists. `npm test` from `hooks/`: 1153 passed, 35 files.

**Consumers.** The `fusion-guard.json` template declares nothing, so a project seeded by
`/fusion:setup` inherits the new entry with no action. Only a project that hand-declared its
own `protectedPaths` keeps exactly what it wrote — the merge is per leaf — and has to add
the entry itself; `README-hooks.md` now says so under "Per-project configuration".

One statement was made false and is filed rather than absorbed, per the queue's scope note:
`rules/protected-path-discipline.md:11` enumerates the shipped list as eight entries
(`260809-1942_*_protected-path-discipline-enumerates-the-shipped-list-and-now-omits-one-entry.md`).
