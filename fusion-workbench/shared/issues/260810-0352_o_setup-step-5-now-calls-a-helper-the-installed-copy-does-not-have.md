Setup Step 5 now calls a helper the installed copy does not have, and the next session is the one that finds out

---

`agents/orchestrator.md` Setup Step 5 calls `"$FUSION_PLUGIN_ROOT/bin/fusion-count-sources"` as of commit `2910cf6`. `$FUSION_PLUGIN_ROOT` is exported by the SessionStart hook and points at the **installed** copy — `~/.fusion` for an `install.sh` install — which is pinned for the whole session. The helper is one commit old and exists only in this work tree. An orchestrator session starting right now gets exit 127 at Setup Step 5.

---

**How it was found.** Reported by the executor of task T3 while verifying the branch-order fix, not by a failing test. Nothing in the suite exercises `$FUSION_PLUGIN_ROOT`, because the tests run against the work tree.

**Why this is not simply the documented residual.** `CLAUDE.md` already carries the rule "between releases, before rule or guard work in this repo: run `fusion --update` and restart the session", and explains it as the work-tree preference covering only `bin/fusion-rules` and `bin/fusion-paths` while the hooks always run from the installed copy. That residual was about **stale** text: an agent read v5.8.0 rules while editing v5.9.1 sources, and the cost was reading the wrong version of something that existed in both places.

This is a different shape. The helper does not exist in the installed copy at all, so the failure is not a stale read but a missing file, and it lands on the orchestrator's own Setup rather than on a rule an agent consults. `bin/fusion-plugin-cwd`'s work-tree preference does not reach it either: that preference is implemented inside `fusion-rules` and `fusion-paths`, and Setup Step 5 names the helper by `$FUSION_PLUGIN_ROOT` directly.

**Three things worth deciding, not one.**

1. **The immediate case.** Does Setup Step 5 tolerate a missing helper, or halt? Tolerating it means the domain falls back to `code` with a stated reason, which is exactly the `counted_by == "none"` shape commit `31d8bb3` put at the top of the cascade — the branch already exists and would cover this if the call site reported the absence rather than the shell's 127. Halting means an install one commit behind stops every session.

2. **The general case.** Any future `bin/` helper a prompt calls inherits this. The two existing helpers a prompt calls, `fusion-rules` and `fusion-paths`, both predate every install in use, so the class has never bitten before. It will bite once per new helper from here on.

3. **Whether the work-tree preference should extend to helper resolution.** `bin/fusion-plugin-cwd` already answers "is cwd the plugin's own source repo", and `fusion-rules` and `fusion-paths` already act on that answer. A prompt that resolves a helper through the same question would fix the class rather than this instance. Against it: `CLAUDE.md` is explicit that the hooks deliberately do **not** get this treatment, and widening it invites the assumption that everything reads from the work tree here, which is false and load-bearing.

**Not a defect in T2 or T3.** Both were dispatched against the work tree and verified against it. The gap is between the work tree and the installed copy, which no task in this session owned.

**Workaround that works today:** `fusion --update` and restart the session.
