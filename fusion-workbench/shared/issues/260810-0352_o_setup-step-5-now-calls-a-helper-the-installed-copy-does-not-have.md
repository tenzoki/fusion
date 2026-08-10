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

---
Decision filed: `shared/decisions/260810-0921_o_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md` — the three questions this record names are on the record with options. The decision recommends taking the immediate case now (report the absence in the cascade's own `counted_by=none` vocabulary rather than emitting a shell 127) and leaving the class questions open.

---
Reconciliation 260810-1205 (reconciler, domain `code`) — **stays `_o_`; the instance no longer reproduces, the class does.**

Measured at `ed87d87`:

- `git ls-tree v7.0.0 bin/` does **not** contain `fusion-count-sources`; `git ls-tree v7.1.0 bin/` does. The release this session shipped is what puts the helper into an installed copy for anyone who installs or updates from here on.
- `2910cf6` is **not** an ancestor of `v7.0.0` — confirming this record's premise rather than the guess that 7.0.0 had already shipped it.
- The local installed copy `~/.fusion` still reports `"version": "7.0.0"` and yet already holds `bin/fusion-count-sources`, mtime `Aug 10 08:43` — one minute before this session's Setup at `08:44`. So the workaround this record names was taken by hand before the session began, which is why Setup Step 5 did not fail here.

**Why it does not close.** The record's three named questions are all about the mechanism, not the instance, and all three are on the record as `shared/decisions/260810-0921_o_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`. Question 1 — does Setup Step 5 tolerate a missing helper or halt? — is unchanged in code: `agents/orchestrator.md` still names the helper through `$FUSION_PLUGIN_ROOT` with no absence branch, so the next helper added between releases reproduces this exactly. The release removed today's instance and left the shape that produced it.

Closing this would also orphan the decision, which cites this record as *the instance*.
