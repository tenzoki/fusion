# How should a prompt call a `bin/` helper that the installed copy may not have?

---
**Domain:** code
**Status:** open
**Filed by:** orchestrator (session `260810-0844`, Turn 1 — triage of a defect record that names three things to decide, not one)
**Cross-references:** `shared/issues/260810-0352_o_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md` (the instance); `shared/issues/260810-0508_o_fifteen-commits-landed-with-no-plugin-version-bump.md` (the other half of the same gap); commit `2910cf6` (the call site); `CLAUDE.md` `## Conventions` (the work-tree preference and its stated residual)

---

## Question

`agents/orchestrator.md` Setup Step 5 calls `"$FUSION_PLUGIN_ROOT/bin/fusion-count-sources"`.
`$FUSION_PLUGIN_ROOT` is exported by the SessionStart hook, points at the **installed** copy, and
is pinned for the whole session. The helper is one commit old and exists only in the work tree,
so an orchestrator session starting against an install one release behind gets exit 127 at its
own Setup.

This is not the residual `CLAUDE.md` already documents. That one is about **stale** text: an
agent reads v5.8.0 rules while editing v5.9.1 sources, and the cost is reading an older version
of something that exists in both copies. Here the file does not exist in the installed copy at
all, the failure is a missing file rather than a stale read, and it lands on Setup rather than on
a rule an agent consults. The work-tree preference does not reach it: that preference is
implemented *inside* `fusion-rules` and `fusion-paths`, and this call site names the helper
through `$FUSION_PLUGIN_ROOT` directly.

The class matters more than the instance. The two helpers a prompt called before this one,
`fusion-rules` and `fusion-paths`, predate every install in use, which is why the class has never
bitten. It will bite once per new helper from here on.

## Options

**(a) The immediate case — what Setup Step 5 does when the helper is absent.**

1. **Tolerate and report.** The call site catches the absence and reports it as "count
   unavailable", so the domain falls back to `code` with a stated reason.
   - Pros: the branch already exists. Commit `31d8bb3` put `counted_by == "none"` at the top of
     the cascade for exactly the shape "no measurement was taken", and it is documented as
     resolving to `code` because `code` is the cascade's own no-evidence fallback. The call site
     currently reports the shell's 127 instead of that branch's vocabulary, which is the whole
     defect at this level.
   - Cons: a session on an old install silently gets a weaker domain detection. The user is told,
     but "told" is a line in a Setup summary.
2. **Halt.** Setup refuses to continue against an install missing a helper its prompt calls.
   - Pros: unambiguous; the user runs `fusion --update` and gets a correct session.
   - Cons: an install one commit behind stops every session, including sessions whose work has
     nothing to do with the missing helper.

**(b) The general case — whether any prompt-called helper gets a uniform contract.**

1. **A guarded-call convention.** Every prompt call to a `bin/` helper checks existence first and
   has a documented fallback, the way (a1) would for this one.
   - Pros: the class is closed by a rule an author can follow.
   - Cons: it is prompt text, and prompt text is overridable under task pressure — the same
     objection `rules/critical-stance.md` makes about its own checkpoint. Each new helper needs
     its author to remember.
2. **Leave it per-site.** Each helper's call site decides.
   - Cons: the class recurs, once per helper, and each recurrence is found by a user rather than
     by a test.

**(c) Whether the work-tree preference should extend to helper resolution.**

1. **Extend it.** `bin/fusion-plugin-cwd` already answers "is cwd the plugin's own source repo",
   and `fusion-rules` and `fusion-paths` already act on that answer. A prompt resolving helpers
   through the same question would fix the class in this repository rather than one instance.
   - Pros: closes the class where it is generated — the plugin's own repo is where a helper is
     new for the days before it is released.
   - Cons: `CLAUDE.md` is explicit that the hooks deliberately do **not** get this treatment, and
     the reason is load-bearing: widening the preference invites the assumption that everything
     reads from the work tree here, which is false. This option makes a documented boundary
     fuzzier in exchange for closing a window that a release also closes.
2. **Do not extend it.** The boundary stays where it is; the answer to a new helper is to release.
   - Cons: leaves the window open for however long a release takes, which today is fifteen
     commits and counting (`260810-0508`).

## Constraints

- Whatever is decided must not require `$FUSION_PLUGIN_ROOT` to point somewhere else. It is
  exported by the SessionStart hook and pinned for the session; a prompt cannot repoint it and
  should not try.
- Nothing in the test suite exercises `$FUSION_PLUGIN_ROOT` — the tests run against the work
  tree. An answer that relies on a test catching the next instance needs that test to be written
  as part of it, or it is not an answer.
- (a) is answerable now and independently. (b) and (c) change a documented convention and should
  not be settled inside a defect-fixing session.

## Recommendation

Take (a1) now and leave (b) and (c) open. The call site should report the absence in the
vocabulary the cascade already has (`counted_by=none`, domain falls back to `code`, the reason
stated in the Setup summary) rather than emitting a shell error, because that branch was built
for "no measurement was taken" and this is a case of it. That is a one-site fix with no
convention change, and it makes the instance harmless while the class is decided.

`inference:` this also removes the urgency from (c), which is the option that costs a documented
boundary. Stated as inference because it assumes no second helper lands before the next release.

---
Answered:
Implemented:
Deferred:
Superseded by:
