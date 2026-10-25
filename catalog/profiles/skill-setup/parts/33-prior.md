"$FUSION_PLUGIN_ROOT/bin/fusion-rules" orchestrator
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" orchestrator
```

Read every path `fusion-rules` emits: `fusion-workbench-conventions.md` always, plus any project-local rules from `./rules/`. A path under the project is read through the host's file tools, a path under the install tree through `host.exec.v1`.

`fusion-paths` resolves where this run writes and searches, and prints `KEY=value` lines (`OUT_ISSUE`, `SCAN_ISSUES`, …).

**Pass `orchestrator`, not `setup`.** Every other skill passes its own name, because `fusion-paths` reads a consumer's key set out of its prompt and each skill is its own consumer (`rules/fusion-workbench-conventions.md` `## Path Resolution`). This skill is the exception: it *is* the orchestrator's Setup, and the key set resolved here is the orchestrator's. On Prior no orchestrator session follows this run, so the values are held for this run alone.

Hold these values for the rest of the run and use them wherever a step names an `OUT_*` or `SCAN_*` value, every directory of a `SCAN_*` value searched — they are the only correct answer to "where does this go". Never guess a path when the resolver fails; stop and report.
