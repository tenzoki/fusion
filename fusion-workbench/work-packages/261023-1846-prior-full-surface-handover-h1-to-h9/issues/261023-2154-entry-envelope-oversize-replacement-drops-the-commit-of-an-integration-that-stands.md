The entry envelope's oversize replacement drops the commit of an integration that stands
---
When the final envelope exceeds the frame bound, `encode` replaces it with a fresh refusal built from an empty workflow. Commits are dropped even when the integration already moved the accepted reference.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Severity:** Low. **Scope:** `adapters/prior/fusionmodule/internal/entry/entry.go` `encode`.

**Evidence**

- `entry.go` `encode`: `body, err = json.Marshal((&workflow{}).envelope(refused("frame.oversize", err.Error())))`. The empty `workflow` has no `commits`, so `commits` is `[]`.
- `entry.go` `run`, after integrate: "The integration stands from here on: a later refusal keeps the commit." `TestHostRefusalsRefuseTheInvocation` holds this for a workbench refusal (`commits` 1).
- The envelope combines the settled answer's questions (up to 16 options of 512 bytes per question, no limit on the number of questions) with the snapshot's `changed_paths`. Each came through its own frame, so their sum can exceed one frame.
- `adapters/prior/README.md` says the explorer's oversize replacement "keeps the evidence". The entry replacement keeps nothing.
- The replacement branch is not covered by any test (coverage at `d02e5cb8`).

**Fix direction.** Build the replacement from the live workflow's commits with questions emptied (questions are what can grow without bound). Fall back to the empty workflow only if that still does not fit.

**Acceptance.** A test in `internal/entry` makes a settled answer whose questions push the envelope past `api.DefaultMaxFrame` on a run that integrates. The envelope is `refused` with `frame.oversize` and still carries the one commit. `PRIOR_REPO=/Users/kai/Projects/productive/F09-Prior /Users/kai/Projects/productive/F04-FUSION/fusion/adapters/prior/stage.sh test` exits 0.
