# How are legacy values with no v1 counterpart mapped at import?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-1338-json-control-data-and-markdown-artefacts.md, 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md, 261001-1804_*_which-markdown-artefacts-become-records-when-a-legacy-workbench-migrates.md, 261003-1746_*_how-does-an-imported-record-carry-a-filer-its-legacy-workbench-never-recorded.md, 261004-1641_*_how-mark-partly-overridden-decision-261001-1804.md

---

## Question

Section 8.2 (Prior `590465d`): unknown states, several active plans, invalid claims and unresolvable active dependencies are not guessed and block activation. Three value classes that every real workbench measured on 2026-10-01 carries have no v1 counterpart and are converted under every option of the record-cut decision, because packages and live records always convert:

1. **Circle-era package heads.** A container whose head is `_c_circle.md`, `_b_circle.md`, `_s_circle.md` or `_d_circle.md` and carries no `**Status:**` (fusion `15e4d52e`: 20 `_c_`, 3 `_b_`, 1 `_s_`; krk `f87d8c6`: 9 `_c_`, 13 `_b_`, 2 `_d_`). The package status has five values; outcome classes include `bounded`, and only `completed` or `legacy-completed` go with `done` (§4.2). Also: 4 containers here hold only empty directories (untracked, no file at all).
2. **Answered decisions whose `Answered:` line cites no resolvable target.** `answered` requires a non-null `answer_ref`; many lines here cite Prior documents in prose ("Prior `docs/design/…` `## 26.`"), which is neither a legacy citation nor a workbench artefact.
3. **Document roles in `**Active spec/plan:**`.** The role is carried by a free qualifying clause ("(the spec)", "(plan, part 1 …)"), not by a field.

## Options

1. **Map by a fixed table, finding on everything else.** Circle `_c_` → `done` / `legacy-completed`; `_b_` → `dropped` / `bounded` with the reason "closed bounded (legacy Circle marker)"; `_s_` → `dropped` / `dropped`, reason "superseded (legacy Circle marker)"; `_d_` → finding (deferred and paused are not the same). Empty container trees are no packages and are reported, not migrated. `answer_ref` = an `artefact_ref` to the record's own original Markdown in the receipt's originals (the `Answered:` line is the answer, as the conventions allow). Role = `spec` or `plan` where the clause or the stem says so unambiguously, else a finding the user confirms in the frozen plan. Every mapped value is kept verbatim in `provenance.legacy_fields`.
   - Pros: decided from the files; each choice visible in the plan and the receipt; findings stay few (measured on copies before the freeze).
   - Cons: `bounded` under `dropped` reads oddly for work that partly landed, which §4.2 nonetheless prescribes.
2. **Every such value is a finding the user resolves by hand per record.**
   - Pros: nothing mapped by rule.
   - Cons: dozens of identical rulings per workbench, and a consuming project cannot migrate without fusion's maintainer.

## Constraints

- No invented person, no invented UUID for an external target, no guessed state (§4.2, §4.3, §8.2).
- The originals stay in the backup; `legacy_fields` keeps the raw values.

## Recommendation

Option 1, put to Prior as requests 47 and 49 of the FJ04 plan; the `_d_` Circle and any value the copies show beyond these stay findings.

---
Answered: plan `261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md` — option 1 — the recommended mapping table, put to the Prior side as requests 47 and 49 because a fixed mapping may touch the no-guessing rule of spec section 8.2; the user approved it with the FJ04 plan on 2026-10-01, the requests to be sent after the measurement part; ruled by user, Kai Stalmann <ks@qantr.com>

---
Implemented: b9d43fb1 — option 1 realised as ruled (FJ04 step 2); the _d_, unclear-role and catch-all clauses later replaced at e7cb55c0 per the FJ04 plan's 2026-10-03 amendment (departures 57, 58)
