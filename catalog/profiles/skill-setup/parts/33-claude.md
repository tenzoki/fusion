"$FUSION_PLUGIN_ROOT/bin/fusion-rules" orchestrator
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" orchestrator
```

Read every path `fusion-rules` emits: `fusion-workbench-conventions.md` always, plus any project-local rules from `./rules/`.

`fusion-paths` resolves where this session writes and searches, and prints `KEY=value` lines (`OUT_ISSUE`, `SCAN_ISSUES`, …).

**Pass `orchestrator`, not `setup`.** Every other skill passes its own name, because `fusion-paths` reads a consumer's key set out of its prompt and each skill is its own consumer (`rules/fusion-workbench-conventions.md` `## Path Resolution`). This skill is the exception: it *is* the orchestrator's Setup, and the values resolved here are held by the **orchestrator** for the whole session, including the steps of its own prompt rather than of this file.

Hold these values for the rest of the session and use them wherever a step names a `$OUT_*` or `$SCAN_*` value — they are the only correct answer to "where does this go". Never guess a path when the resolver fails; stop and report.
