No shipped text gives the shape of the `--outcome` payload, so Finish and Drop are refused as the orchestrator prompt spells them
---
The orchestrator finishes or drops a work package with `transition --to done --outcome` or `--to dropped --outcome`. The value is a JSON object with three required fields. No prompt, rule, skill, doc or helper header on `fj03d` states them. A call built from the prompt's own wording is refused with about 7 KB of schema output, in which the two missing fields are two clauses among several hundred. Two smaller gaps of the same kind stand beside it.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

Severity: Medium. Scope: `agents/orchestrator.md` (`## Work packages`, the Finish and Drop rows; `## Closing a work package` step 4), `rules/fusion-workbench-conventions.md` (`## Work packages`, the field table), `agents/code-implementer.md` and `agents/data-implementer.md` (the decision bullet), all on `fj03d` at `cd1b5522`.

**Evidence.**

- `grep -rn -- "--outcome" agents rules skills docs README*.md` at `cd1b5522` names three lines: `agents/orchestrator.md` "`transition --to done --outcome` class `completed`", the Drop row beside it, and the conventions field table "with `--outcome` into `done` or `dropped`". None shows a value.
- `codec/schemas/package.schema.json`, `properties.outcome`: an object with `required: ["class", "evidence", "reason"]`, `class` one of `completed`, `bounded`, `cancelled`, `failed`, `dropped`, `legacy-completed`; `done` admits `completed` (and the import's `legacy-completed`), `dropped` admits the other four, and those four require a non-empty `reason`.
- The header of `bin/fusion-write` lists `--outcome` among the payload flags as "a JSON value" and names no field.
- Run on a scratch JSON workbench built from `git archive cd1b5522`, on a claimed package: `transition --to done --reason fin --outcome '{"class":"completed"}'` exits 6 with `schema-invalid/request` followed by roughly 7 000 characters of `additionalProperties` and `required` clauses from every branch of the protocol schema. `/payload/outcome required: must have required property 'evidence'` and `'reason'` are in it. `--outcome '{"class":"completed","reason":"landed","evidence":[]}'` lands.
- The other payloads have a shape in text the sender loads: `--steps`, `--criteria` and `--disposition` in `rules/fusion-workbench-conventions.md` `## Inline State Tracking`, `--answer-ref`, `--superseded-by` and `--deferral` in `rules/decision-record-examples.md`.

**Two smaller gaps of the same kind.**

- `agents/code-implementer.md` and `agents/data-implementer.md` tell the implementer to run `transition --to implemented --implementation-ref`. The value's form (a commit hash as a JSON string, `'"a3f7c2e"'`) is shown only in `rules/decision-record-examples.md`, which `bin/fusion-rules` emits to the orchestrator, the requirements-designer, the implementation-planner and the state-auditor, not to the two implementers. A bare hash is refused as "takes a JSON value", which at least says what is wrong.
- `agents/orchestrator.md` `## Work packages` gives `set-mode --source` as "the shape `/fusion:wp` sends". The orchestrator does not load that skill body.

**Fix direction.** One example of the outcome object in `rules/fusion-workbench-conventions.md` `## Work packages`, beside the field table, with the classes per terminal state; the orchestrator's rows cite it. The commit-hash form of `--implementation-ref` in one clause of `### Decision files`, which every agent loads. The codec's refusal text is the bundle's and stays as it is.

**Acceptance.**

1. A text the orchestrator loads at Setup shows a complete `--outcome` value for `done` and names the classes `dropped` admits; `grep -rn '"evidence"' rules/fusion-workbench-conventions.md agents/orchestrator.md` names at least one line.
2. A text both implementers load shows the form of `--implementation-ref` for a commit.
3. A test sends the documented `--outcome` example through `bin/fusion-write` on a JSON workbench and it lands.
4. `reference-resolution-lint` and the dispatch-path bound are green; no baseline moves.

Executor: `code-implementer`.

---
Resolved: fj03d `26f311c9` — `rules/fusion-workbench-conventions.md` `## Work packages` gives the `--outcome` object and the `--source` value, `### Decision files` the `--implementation-ref` form; the orchestrator prompt and the `bin/fusion-write` header point there. Each shape was run against the real command on a scratch workbench, and a test reads the example out of the rule file and finishes a package with it. Verified 2026-10-05 by the orchestrator in the fj03d worktree at `88170d7e`: hooks 1 131 of 1 136, the reds being the four legacy own-tree cases and the known monitor case; codec 1 682 passed and 13 skipped by the executor, no file under `codec/` changed, bundle `c76bbce9…`.
