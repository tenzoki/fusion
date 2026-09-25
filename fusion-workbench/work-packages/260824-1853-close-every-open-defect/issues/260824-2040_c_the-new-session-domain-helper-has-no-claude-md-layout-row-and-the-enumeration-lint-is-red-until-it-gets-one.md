The new session-domain helper has no `CLAUDE.md` Layout row, and the enumeration lint is red until it gets one

---
**Severity:** Low. One test, one row, and the row is written below; the fault is that plan step 7 lists `bin/fusion-session-domain` as new and step 8 lists `CLAUDE.md` as its own, so nobody's file list carried the row the gate demands.
**Domain:** code
**Filed by:** coder, plan step 7 of `260824-1905_*_plan-close-every-open-defect.md`
**Attribution backfilled 260825 (not written by the filing agent):** `coder` filed this record; the person half of `**Filed by:**` is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried no `bin/fusion-identity` at that time. See `260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.
**Owner:** whoever holds `CLAUDE.md` in this Circle (step 8's coder, or the orchestrator at commit time)
**Affects:** `CLAUDE.md` `## Layout`; `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` (`every bin/ helper has a Layout row`)

---

`derivable-enumerations-lint.test.ts` asserts a two-way match between `ls bin/` and the `| `bin/…` |` rows of `CLAUDE.md`'s Layout table. Step 7 added `bin/fusion-session-domain` (issue `260810-2110_*_the-domain-capture-one-liner-is-now-copied-into-a-fourth-skill-body-and-the-copying-is-the-stated-justification.md`, plan row 19) and was told not to touch `CLAUDE.md`, so the suite reads:

```
bin/fusion-session-domain exists but CLAUDE.md's Layout table has no row for it
```

The row, in the shape of its neighbours, for whoever holds the file:

```
| `bin/fusion-session-domain` | The one place a skill body reads the session's domain. Prints `domain=<code|data>` and `source=<agentstate|default>` in the `KEY=value` shape, reading `session.domain` from `fusion-workbench/agentstate.yaml` and falling back to `code` with the fallback named on its own line and on stderr; exit 3 with nothing on stdout when no workbench is above the working directory, because a defaulted domain there would be an answer about a project that never ran setup. **Its own header is the authoritative documentation.** Replaced the two-line read three skill bodies each carried (`skills/next`, `skills/direct`, `skills/cleanup`), which had diverged on the first copy; every call site guards with `[ -x ]`. Decision `260810-2145`, the reserved half. |
```

Nothing else is owed: the `.gitignore` line is in, `committed-dist.test.ts`'s `git ls-files bin/` case goes green the moment the orchestrator stages the file.

---
Resolved: fixed — the `bin/fusion-session-domain` Layout row is in `CLAUDE.md` between `bin/fusion-count-sources` and `bin/fusion-staging-drift`, and both lints are green; CLAUDE.md:44
