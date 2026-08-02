# What does a rule file cite when no motivating record is recoverable?

---
**Domain:** code
**Status:** implemented
**Filed by:** shaper (in-Circle clarification)
**Cross-references:** `shared/planning/260801-1122_o_spec-normative-consolidation.md` `### C8: Provenance header on rule files` (the capability); `shared/decisions/260801-1020_a_provenance-header-on-rule-files.md` (D3, which anticipated the case in one sentence and left it open); `circles/260801-1244-rule-provenance-header/_t_circle.md` `## Grounding snapshot` (the file-by-file evidence)

---

## Question

C8 permits a header to state honestly that no motivating record is recoverable, on the grounds that inventing one would inject the fiction the capability exists to prevent. The spec treats that form as an edge case for "some of the older ones". Measurement says otherwise: it is the majority of the backfill. What may such a header contain besides the admission itself?

The question is separate from the three the spec already hands forward, because those three fix the header's syntax, its position, and the strictness of the gate. This one fixes what five of the ten rule files will actually say, and no answer to the other three settles it.

## Verified current state

Verified by shaper on 2026-08-02 at HEAD `e8988d9`, by `git log --diff-filter=A` per rule file against the full inventory of records under the workbench.

The oldest record anywhere in the workbench is dated 260621. Five rule files were introduced before it and have no candidate motivating record in any store:

| Rule file | Introduced | Commit |
|---|---|---|
| `decision-record-examples.md` | 2026-05-04 | `b05b423` fusion v2.3.0, initial public release |
| `user-facing-output.md` | 2026-05-12 | `c18a946` feat(rules): add user-facing-output style rule |
| `critical-stance.md` | 2026-06-18 | `dac82b8` feat(rules): add critical-stance rule |
| `git-branch-discipline.md` | 2026-06-24 | `4950ffa` feat(hooks): deterministic git-branch-switch guard |
| `design-diagrams.md` | 2026-06-29 | `bd5f6e6` feat(agents): add conceptrev design-diagram evaluator |

Four have a recoverable Circle: `agent-setup.md`, `context-manifest.md` and `context-lean-claude-md.md` from `circles/260718-1924-v5x-overhaul`, and `protected-path-discipline.md` from `circles/260801-1244-guard-bash-inspection`.

Every one of the nine has a recoverable introducing commit whose subject names intent, as the table shows. Grep hits that name a rule file in a later record were checked and rejected as motivating records: they postdate the file and describe it rather than having caused it. `shared/analyses/260717-1935-branch-switch-guard-live-miss-root-cause.md` is the clearest instance, arriving three weeks after `git-branch-discipline.md`.

## Options

1. **The admission alone.** The header states that no motivating record is recoverable and that the file predates the convention. Nothing else.
   - Pros: unarguably honest, and uniform in shape with the four headers that do carry a path. Cheapest to write and to check.
   - Cons: five of the ten rule files then carry a header a reader cannot follow anywhere. The header's stated payoff, that a rule whose motivating decision is superseded becomes a visible retirement candidate, is unavailable for exactly the five oldest files.

2. **The admission plus the introducing commit.** The header adds the commit that created the file, for example `git:c18a946` for `user-facing-output.md`.
   - Pros: recoverable for all nine, verified above. A reader gets a real starting point instead of a dead end, and the commit subjects in this repository do name intent.
   - Cons: a commit is not a decision record and carries no marker, so the superseded check does not work against it. The header would then hold two kinds of citation with different downstream value, and any later tooling has to distinguish them. D3 considered and rejected git as the primary mechanism (option 3 of that record), so admitting it as a fallback needs to be a deliberate narrowing rather than a quiet reversal.

3. **The admission plus its reason.** The header states that no record is recoverable and adds one sentence naming why, that the file predates the workbench decision store whose oldest record is dated 260621.
   - Pros: tells a reader the absence is a fact about the project's history rather than an unfinished backfill, which is the misreading option 1 invites. No second citation kind is introduced.
   - Cons: the reason is prose and will not stay true as written if the store is ever re-dated or migrated. No path for any check to follow, so it is option 1 with better manners.

## Constraints

- Whatever form is chosen must satisfy the same gate as a path-carrying header, or the gate needs a second accepted shape and the regex question in the spec grows a branch.
- Inventing or reconstructing a decision record for any of the five is out of scope by C8's own terms and is not offered as an option.
- If the gate is specified to resolve cited paths, option 2 makes five headers carry a citation that is not a workbench path, so the resolver needs to recognise a commit reference or skip it explicitly.

## Recommendation

Deferred to the user, who asked for the header's form to be settled before planning. Put alongside the spec's three open questions in the same round.

---
Answered: 2026-08-02, by the user. **Option 2, the admission plus the introducing commit.** A header for a file with no recoverable record reads `**Provenance:** No motivating record recoverable; introduced in `git:<short-hash>`.` The form is specified at `circles/260801-1244-rule-provenance-header/planning/260802-1103_o_spec-rule-provenance-header.md` `#### The header`, form 3, and the per-file commit hashes are in that spec's backfill table.

Two consequences the answer does not cancel, both recorded in the spec's `## Accepted limitations`. A commit carries no state marker, so the superseded-rule check does not work against a commit citation. And D3 rejected git as the *primary* provenance mechanism; this answer admits it as a secondary, admission-scoped citation only, which is a narrower use than D3 rejected rather than a reversal of it.

The backfill set turned out to be six files rather than five. `fusion-workbench-conventions.md` joins the group with no recoverable record, because the separately chosen `Provenance:` keyword means its existing `Binding decision:` line at :326 is a section note rather than a file header.
Implemented: `929dbf5` — six rule files carry the chosen form verbatim. Verified at `b568ad9` by `head -10` plus the spec's regex: `critical-stance.md` `git:dac82b8`, `decision-record-examples.md` `git:b05b423`, `design-diagrams.md` `git:bd5f6e6`, `fusion-workbench-conventions.md` `git:b05b423`, `git-branch-discipline.md` `git:4950ffa`, `user-facing-output.md` `git:c18a946`. Every one sits at line 3, and every one reproduces the answer's wording character for character, including the semicolon, the backticks around `git:<hash>` and the closing full stop. The gate that keeps them there is `hooks/lib/__tests__/provenance-header-lint.test.ts` (`de9d5aa`), green in a 780-test suite re-run at 260802-1411.

Deferred:
Superseded by:

---

**Reconciliation 260802-1413 (reconciler, domain `code`) — promoted `_a_` → `_i_`.**

The promotion is on realisation, not on a plan step being ticked. What the answer chose was a form of words; six files on disk now carry that form, and a test in the suite fails if any rule file loses it. That is code and data reflecting the decision, which is what `_i_` requires.

Two things the promotion does not claim, both restated so a later reader does not read more into the marker than it carries.

The answer's own recorded consequence stands: a commit carries no state marker, so the superseded-rule check does not work against any of these six citations. `_i_` records that the chosen form was written, not that it delivers the payoff the parent capability wanted. That gap is the Circle's honest ceiling and is stated in the Coherence verdict at `history/260802-0848-orchestrator-session.md`.

The count moved once more than the record anticipated and landed where the record predicted. The body says five files, then corrects itself to six in the answer's closing paragraph. Six is right. The tenth rule file, `protected-path-discipline.md`, took form 2 (a Circle) rather than form 3, so the split is four Circle citations and six admissions.
