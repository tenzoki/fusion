`/fusion:migrate` Step 6 calls the citation sweep by a path a consuming project does not have
---
**Domain:** code
**Status:** closed
**Severity:** High
**Executor:** coder
**Filed by:** reviewer (closing pass `49ab50e4..e41e333f`, checkout `5e8248d7`, Kai Stalmann <ks@qantr.com>)
**Cross-references:** `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md` (the binding convention, `_i_`); `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md` (the open half, not this); commit `8032ee97` (the call site); `260922-1628_*_the-grammar-reads-the-bracket-marker-and-the-tree-is-swept-once.md` step 7

---

## What is wrong

`skills/migrate/SKILL.md:201`, the `## Step 6 — Sweep the citations` added by `8032ee97`:

> Run `bin/fusion-citation-sweep --dry-run`, report its summary, and ask in Step 3's shape whether to respell those markers to the wildcard. On a yes run `bin/fusion-citation-sweep --write --yes` and report its summary

Both invocations name a **relative** path. `/fusion:migrate` runs at a consuming project's root, where `./bin/fusion-citation-sweep` does not exist — the helper ships in the installed plugin copy at `$FUSION_PLUGIN_ROOT/bin/`. In fusion's own repository the plugin root *is* the project root, so the path resolves and no gate saw it.

Two settled conventions are missed:

1. **Every prompt-called helper is called through `$FUSION_PLUGIN_ROOT`.** The same file already does it eleven lines of prose earlier, `skills/migrate/SKILL.md:31`:
   `ROOT="$("$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root")" || { … }`
   and so does every other skill that calls a helper (`skills/commit`, `skills/post`, `skills/reconcile`, `skills/setup`, `skills/archive`, `skills/cleanup`, `skills/news`). Step 6 is the only bare-relative **invocation** in `skills/`; every other bare `bin/…` string in a skill body is a prose reference to a helper's header, not a call.
2. **Every call site guards with `[ -x ]`**, per `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md` (`_i_`), restated at `README-hooks.md:333`. `bin/fusion-citation-sweep` carries the standing one-release-behind cost like every helper, so an install that has not run `fusion --update` has no copy. Step 6 has no guard, so such a user meets a shell error at the end of their migration rather than the sentence `/fusion:news` models at `skills/news/SKILL.md:39`.

## Why it matters

Step 6 is the whole user-facing deliverable of the bracket-citation package for a consumer: a project that runs `fusion --update` and then `/fusion:migrate` is exactly the population whose filenames were just renamed and whose citations still spell the old marker. As written the step cannot run for any of them.

It is not destructive — Steps 1 to 5 have completed by the time Step 6 is reached, and a failed Step 6 leaves the workbench exactly as the migration left it. What is lost is the sweep, discovered defect by defect afterwards, which is the outcome `8032ee97`'s own message says the step exists to prevent.

## Fix direction

Rewrite the two invocations in `skills/migrate/SKILL.md:201` in the shape the rest of the plugin uses, and add the `[ -x ]` branch with a named skip. The existing sentence at `skills/news/SKILL.md:39` is the model for what the user is told when the helper is absent.

`skills/` head-room is the constraint (it was 120 bytes before `8032ee97`, which funded itself and left the file at 39 688). The guard costs bytes, so fund it in the same file as step 7 did, or take the cut the step's own paragraph offers — the second sentence of Step 6 restates the deferred question `260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md` already holds and could cite it instead of re-deriving it.

## Acceptance

- `skills/migrate/SKILL.md` contains no bare-relative `bin/fusion-` **invocation**; both Step 6 calls read through `$FUSION_PLUGIN_ROOT` and stand behind an `[ -x ]` test whose false branch names the helper and tells the user to run `fusion --update`.
- `grep -nE '(^|[^/A-Za-z_"$])bin/fusion-' skills/migrate/SKILL.md` returns only prose references, no call.
- `cd hooks && npx vitest run surface-growth-bound marker-format-lint path-literal-lint reference-resolution-lint` exits 0, with no baseline and no head-room moved.
- `cd hooks && npm test` exits 0 and `node hooks/dist/citation-check.js` reads `verdict=clean`.

---
Resolved: by the commit that carries this line. `skills/migrate/SKILL.md` `## Step 6 — Sweep the citations` binds `SWEEP="$FUSION_PLUGIN_ROOT/bin/fusion-citation-sweep"` once and runs the dry run and the write through it, so the call resolves in a consuming project and not only in fusion's own work tree; a false `[ -x "$SWEEP" ]` says the sweep was skipped because the installed copy does not carry the helper yet, and points at `fusion --update` plus a restart, the shape `skills/news/SKILL.md` `## Step 1: the helper has to be there` models under `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`. The step's behaviour is otherwise unmoved: dry run, report, ask in Step 3's shape, write on a yes. Funded inside the `skills/` bound by the cut the record itself offered — the second paragraph no longer re-derives the frozen-store case and cites the deferred question that holds it. `skills/migrate/SKILL.md` 39 688 -> 39 790 bytes, 102 of the 133 of head-room; `hooks/lib/__tests__/fixtures/surface-growth.golden` re-approved at the measurement, no baseline and no head-room constant moved.
