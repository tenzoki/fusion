# May a project protect a path inside its own rule directory against `FUSION_ALLOW_RULES_WRITE`?

---
**Domain:** code
**Status:** open
**Filed by:** coder, closing `260802-2231` (T3-2) in `circles/260801-1244-guard-rules-write`
**Cross-references:** `circles/260801-1244-guard-rules-write/issues/260802-2231_c_stated-exempt-boundary-is-narrower-than-the-implemented-one-for-whole-subtree-deletes.md` `## Adjacent, for Turn 2` (where the question was raised); `hooks/lib/rules-write-exemption.ts` `RULE_DIR_PATTERNS`; `circles/260801-1244-guard-rules-write/decisions/260802-1912_a_does-the-self-protection-floor-apply-before-the-config-file-exists.md` (the floor this would sit next to); plan Step 6 (project-configurable `protectedPaths`)

---

## Question

`RULE_DIR_PATTERNS` in `hooks/lib/rules-write-exemption.ts` is a hardcoded constant, `["rules/**", ".claude/rules/**"]`, while plan Step 6 makes `protectedPaths` project-configurable through `fusion-guard.json`. Once a project can write its own protected list, two consequences follow that nothing currently answers.

**The exemption outranks a project's own protected entry.** A project that deliberately adds `rules/immutable/**` to its `protectedPaths` finds the flag exempts it anyway, because `rules/immutable/x.md` matches `rules/**` and the exemption never consults the project's list. Measured shape, not yet measured against Step 6's code, which does not exist at the time of filing: the exemption is asked only about paths the protected list already matched, and it answers from its own constant.

**A project whose rules do not live in `rules/` gets no exemption, and nothing tells it why.** The flag is documented as "set this to curate rules"; in such a project it is silently inert, which is the same failure mode T3-2 closed on the diagnostic side for hard links and `..` spellings.

The question has to be answered wherever the effective protected list is assembled, which is Step 6, and it is a security property rather than an implementation detail — which is why it is recorded rather than settled in a docstring.

## Options

1. **Keep `RULE_DIR_PATTERNS` fixed; the flag names two well-known directories and nothing else.**
   - Pros: the exempt set is readable without opening the project's configuration, and no project can widen the grant by editing a file the guard reads. The exemption stays a claim about fusion, not about a project.
   - Cons: a project cannot carve out an immutable subtree inside `rules/`, and a project with a differently-named rule directory has a flag that does nothing.
2. **Subtract the project's own protected entries from the exempt set.** An entry a project adds explicitly (`rules/immutable/**`) wins over the exemption; the two default rule patterns keep working as they do now.
   - Pros: answers both consequences with one rule, and matches the intuition that a list a project wrote by hand outranks a flag it set in a shell. Natural neighbour of the self-protection floor decided in `260802-1912`.
   - Cons: the exempt set becomes a function of the project's configuration, so "what does the flag reach" is no longer answerable from the plugin alone. Needs a precedence rule precise enough to test.
3. **Make the rule roots configurable too**, alongside `protectedPaths`.
   - Pros: covers the differently-named-rule-directory project.
   - Cons: a project could widen its own grant, which is the direction a guard may not move without the user knowing. The self-protection floor exists because that direction was already judged dangerous once in this Circle.

## Constraints

- Whatever is chosen must not let a project's own configuration WIDEN the grant without a decision the user makes deliberately; narrowing it is the safe direction.
- The answer must be stated where the user reads it (`README-hooks.md`, `rules/protected-path-discipline.md`), not only in this record. The flag being silently inert is the failure this Turn spent two findings on.
- The exemption is consulted only for paths the protected list already matched, so any precedence rule has to be expressed at that seam rather than by rewriting `RULE_DIR_PATTERNS` at load time.

## Recommendation

None yet, and deliberately: the question belongs to Step 6, which is where the effective list is assembled and where the cost of each option becomes measurable. Recorded now because closing `260802-2231` would otherwise take the question with it.

---
Answered:
Implemented:
Deferred:
Superseded by:

---

**Reconciliation 260803-1516 (reconciler, domain `code`) — stays `_o_`. Genuinely unanswered; the question's precondition still does not exist.**

`RULE_DIR_PATTERNS` is still the hardcoded `["rules/**", ".claude/rules/**"]` in `hooks/lib/rules-write-exemption.ts`, and `protectedPaths` is still not project-configurable: `hooks/lib/config.ts:34` resolves a single plugin-side source at module load. Both consequences this record names are therefore still hypothetical, exactly as it says.

Searched for an answer across `circles/260801-1244-guard-rules-write/analyses/` (empty), `shared/analyses/`, both planning stores, and both decision stores. Nothing addresses it. The record's own `## Recommendation` declines to recommend, deliberately, and defers to plan Step 6.

**Cross-reference confirmed live.** Plan Step 6 of `planning/260802-1856_o_plan-guard-rules-write.md` is the step this record hands the question to, and it is unstarted. Whoever picks up Step 6 inherits this decision as an input, not as a note to read afterwards.

---

**Reconciliation 260804-1021 (reconciler, domain `code`) — stays `_o_`, unchanged. The precondition still does not exist.**

`RULE_DIR_PATTERNS` is still the hardcoded `["rules/**", ".claude/rules/**"]` in `hooks/lib/rules-write-exemption.ts`, and `protectedPaths` is still not project-configurable (`hooks/lib/config.ts:34`). Plan Step 6, which this record defers to, is unstarted at HEAD `cc012fc`. Searched both analysis stores, both planning stores and both decision stores for an answer; there is none, exactly as the previous reconciliation found.

---
**Status change without an answer, plan Step 6 (2026-08-04).** Before Step 6 this question was hypothetical: no project could declare a `protectedPaths` list at all, so nothing could conflict with `RULE_DIR_PATTERNS`. The loader makes it live. Not deciding is therefore no longer neutral — it ships option 1's behaviour, in which the exemption outranks a project's own protected entry. The current behaviour is pinned by a `MEASURES:`-labelled test case that explicitly disclaims endorsement and cites this record, so it fails the day this decision lands. Still open, and now consequential.

## Answer

**Option 2: subtract the project's own explicitly declared protected entries from the exempt set.**

Chosen by the user at the plan gate, 2026-08-04, after the C5b loader made the question live.
An entry a project adds explicitly wins over the exemption; the two default rule patterns keep
working exactly as they do now, so the flag's headline use — `mv rules/x.md rules/retired/` —
is untouched.

The reasoning that carried it: a list a project wrote by hand outranks a flag an agent set in
a shell, and this is the natural neighbour of the self-protection floor decided in
`260802-1912`. Option 3 was rejected for the reason that produced that floor in the first
place: it lets a project *widen* its own grant, which is the direction a guard may not move
without the user knowing.

The cost this record names is accepted: the exempt set becomes a function of the project's
configuration, so "what does the flag reach" stops being answerable from the plugin alone.
That is what the constraint about a precise precedence rule is for.

**Two obligations follow, both binding on the implementation.**

- **"Explicitly declared" must mean declared, not inherited.** After `260804-1630_a`, an
  omitted `protectedPaths` inherits the plugin's list — and subtracting an *inherited* entry
  would silently end the exemption for every project, since the plugin's own list contains
  `rules/**`. The subtraction applies only to entries the project layer actually supplied,
  which is why the plan's Step 2 carries the leaf-provenance obligation and why Step 4
  depends on Step 2 rather than on the decision alone.
- **The precedence rule has to be testable and stated once.** Five enumerations have been
  falsified in this Circle; this is a rule, and it belongs in the template and the shipped
  documents in the words the loader actually implements.

This activates the plan's Step 4, which existed only under options 2 or 3.

---
Answered: this record, `## Answer` — user chose option 2 at the plan gate; a project's declared entry outranks the flag, an inherited one does not.

---

**Realised in code 260804-1940 (coder, plan Step 4) — marker stays `_a_` until the commit
exists.** The convention wants `Implemented:` to cite the hash, and this work is deliberately
uncommitted: the orchestrator commits after validation. The reconciler transitions `_a_` →
`_i_` at Phase 3 against the commit, not against this note. Session:
`history/260804-1940-coder-step1-floor-step4-exemption-precedence.md`.

**Both binding obligations are met, and both are asserted rather than argued.**

*"Explicitly declared" means declared, not inherited.* The subtraction reads
`projectDeclaredProtectedPaths(config)` in `hooks/lib/config.ts`, which returns entries only
when `protectedPathsSource === "project"` and takes the self-protection floor's own entries
back out. A project that omits the key, declares some other key, has no file at all, or wrote
a list that type validation dropped all return the empty list, so all four get the exemption
byte-identically. The trap is pinned by mutation: substituting `config.guard.protectedPaths`
— which compiles, has the same type, and reads as correct — breaks 26 cases, including every
pre-existing exemption case in the suite. That is the flag dying in every project on earth,
made visible.

*The precedence rule is testable and stated once.* It lives in
`hooks/lib/rules-write-exemption.ts` as gate 1b (`projectProtectedMatch`), at the seam where
the exemption is consulted, which is where this record's third constraint requires it. Both
write surfaces ask the same predicate. The refusal has its own kind (`project-protected`) and
its own note, and the note **quotes the entry that caused it** — the record's own obligation
that a curator meeting the deny must not read it as the flag being broken.

The rule, in the words the loader implements: *a path the project's own `fusion-guard.json`
declares protected is not exempt, matched with case folded and a directory operand retried
with a trailing separator.* The two match conventions are the protection side's rather than
the grant side's, deliberately: a wider match on this gate refuses more. Without the fold, a
project declaring `rules/Immutable/**` loses its own entry to `RULES/…` where the filesystem
folds; without the retry, `rm -rf rules/immutable` deletes the subtree the project declared
immutable.

**One consequence this record does not state, and it is the sharp edge.** A project that
copies fusion's own `rules/**` into its file — to add one entry, say — loses the flag for the
whole rule directory, `rules/retired/` included. There is no exception for a declared entry
that happens to equal one of fusion's: the flag reaches a path only while the list protecting
that path is fusion's. It follows from this answer rather than contradicting it, it is the
narrowing direction, and it is pinned by a `STATED COST:` integration case. It needs a
sentence where the user reads it (plan Step 7, obligation 13), or a project meets a deny that
reads as the flag being broken — the failure this record's second constraint is about.

The cost this record accepts is now real: what the flag reaches is no longer answerable from
the plugin alone. Measured over a generated cross-product of 182,688 classifications, this
step alone newly allows **0** and newly denies 4,056, all of them writes to paths a project
declared protected with the flag set.
